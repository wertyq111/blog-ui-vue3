<!--
  动森风可勾选权限树（自研，扁平化渲染，不依赖 el-tree）。

  能力：
   - 父子联动 + 半选态（checkStrictly 关闭=联动，开启=各节点独立，对齐 el-tree check-strictly）
   - 关键字过滤（只显示命中节点及其祖先链，命中文字高亮）
   - 展开/收缩全部、全选/反选/清空（通过 defineExpose 给父级工具栏调用）
   - v-model 为「完全勾选」节点值数组；半选父节点不在 model 内，提交时由 getCheckedKeys(true) 补齐

  父级用法：
    <AnimalPermTree ref="treeRef" v-model="checked" :options="tree"
      :check-strictly="!linked" :filter-text="kw" />
    treeRef.value.getCheckedKeys(true)  // 提交：完全勾选 + 半选父节点
-->
<template>
  <div class="apt" :class="{ 'apt--empty': !visibleNodes.length }">
    <div
      v-for="node in visibleNodes"
      :key="String(node.value)"
      class="apt__row"
      :style="{ paddingLeft: 8 + node.depth * 20 + 'px' }"
    >
      <!-- 展开/收缩三角 -->
      <button
        v-if="node.hasChildren"
        type="button"
        class="apt__caret"
        :class="{ 'apt__caret--open': node.expanded }"
        @click="toggleExpand(node.value)"
      >
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
          stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <span v-else class="apt__caret-placeholder" />

      <!-- 动森勾选框 -->
      <label class="apt__check" @click.prevent="toggleCheck(node.value)">
        <span
          class="apt__box"
          :class="{
            'apt__box--checked': node.checked,
            'apt__box--indeterminate': node.indeterminate,
          }"
        >
          <svg v-if="node.checked" class="apt__tick" viewBox="0 0 24 24" width="13" height="13"
            fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12l5 5 11-11" />
          </svg>
          <span v-else-if="node.indeterminate" class="apt__dash" />
        </span>
        <span class="apt__label" v-html="node.labelHtml" />
      </label>
    </div>

    <div v-if="!visibleNodes.length" class="apt__empty">
      {{ flatAll.length ? "无匹配项" : "暂无权限数据" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

type TreeValue = string | number;
interface PermNode {
  value: TreeValue;
  label: string;
  children?: PermNode[];
}

const props = withDefaults(
  defineProps<{
    options?: PermNode[];
    checkStrictly?: boolean; // true = 各节点独立（关闭父子联动）
    filterText?: string;
  }>(),
  {
    options: () => [],
    checkStrictly: false,
    filterText: "",
  }
);

// v-model：完全勾选的节点值数组
const model = defineModel<TreeValue[]>({ default: () => [] });

const expandedMap = ref<Record<string, boolean>>({});

// ---- 预计算：扁平节点 + 父子映射 ----
interface FlatItem {
  value: TreeValue;
  label: string;
  depth: number;
  hasChildren: boolean;
  parent: TreeValue | null;
  descendants: TreeValue[]; // 所有后代
}

const flatAll = computed<FlatItem[]>(() => {
  const out: FlatItem[] = [];
  const walk = (nodes: PermNode[], depth: number, parent: TreeValue | null) => {
    for (const n of nodes) {
      const kids = n.children ?? [];
      const descendants: TreeValue[] = [];
      const collect = (cs: PermNode[]) => {
        for (const c of cs) {
          descendants.push(c.value);
          if (c.children?.length) collect(c.children);
        }
      };
      collect(kids);
      out.push({
        value: n.value,
        label: n.label,
        depth,
        hasChildren: kids.length > 0,
        parent,
        descendants,
      });
      if (kids.length) walk(kids, depth + 1, n.value);
    }
  };
  walk(props.options, 0, null);
  return out;
});

const itemMap = computed(() => {
  const m = new Map<TreeValue, FlatItem>();
  flatAll.value.forEach((it) => m.set(it.value, it));
  return m;
});
const childrenMap = computed(() => {
  const m = new Map<TreeValue, TreeValue[]>();
  flatAll.value.forEach((it) => {
    if (it.parent != null) {
      const arr = m.get(it.parent) ?? [];
      arr.push(it.value);
      m.set(it.parent, arr);
    }
  });
  return m;
});

const checkedSet = computed(() => new Set(model.value));

function isChecked(value: TreeValue): boolean {
  return checkedSet.value.has(value);
}
function isIndeterminate(value: TreeValue): boolean {
  if (props.checkStrictly) return false;
  if (checkedSet.value.has(value)) return false;
  const it = itemMap.value.get(value);
  if (!it || !it.hasChildren) return false;
  return it.descendants.some((d) => checkedSet.value.has(d));
}

// ---- 过滤 ----
const visibleValueSet = computed<Set<TreeValue> | null>(() => {
  const kw = props.filterText.trim().toLowerCase();
  if (!kw) return null;
  const matched = new Set<TreeValue>();
  flatAll.value.forEach((it) => {
    if (it.label.toLowerCase().includes(kw)) {
      matched.add(it.value);
      // 祖先链也显示
      let p = it.parent;
      while (p != null) {
        matched.add(p);
        p = itemMap.value.get(p)?.parent ?? null;
      }
    }
  });
  return matched;
});

function highlight(label: string): string {
  const kw = props.filterText.trim();
  const escaped = label.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string
  );
  if (!kw) return escaped;
  const idx = escaped.toLowerCase().indexOf(kw.toLowerCase());
  if (idx === -1) return escaped;
  return (
    escaped.slice(0, idx) +
    `<mark class="apt__mark">${escaped.slice(idx, idx + kw.length)}</mark>` +
    escaped.slice(idx + kw.length)
  );
}

interface VisibleNode {
  value: TreeValue;
  labelHtml: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  checked: boolean;
  indeterminate: boolean;
}

const visibleNodes = computed<VisibleNode[]>(() => {
  const out: VisibleNode[] = [];
  const filtering = visibleValueSet.value != null;
  const walk = (nodes: PermNode[], depth: number) => {
    for (const n of nodes) {
      if (filtering && !visibleValueSet.value!.has(n.value)) continue;
      const hasChildren = !!n.children?.length;
      // 过滤时强制展开；否则看 expandedMap（默认展开）
      const expanded = filtering ? true : isExpanded(n.value);
      out.push({
        value: n.value,
        labelHtml: highlight(n.label),
        depth,
        hasChildren,
        expanded,
        checked: isChecked(n.value),
        indeterminate: isIndeterminate(n.value),
      });
      if (hasChildren && expanded) walk(n.children!, depth + 1);
    }
  };
  walk(props.options, 0);
  return out;
});

function isExpanded(value: TreeValue): boolean {
  // 默认展开（undefined 视为 true）
  return expandedMap.value[String(value)] !== false;
}
function toggleExpand(value: TreeValue): void {
  expandedMap.value = { ...expandedMap.value, [String(value)]: !isExpanded(value) };
}

// ---- 勾选逻辑 ----
function toggleCheck(value: TreeValue): void {
  const set = new Set(checkedSet.value);
  const willCheck = !set.has(value);

  if (props.checkStrictly) {
    willCheck ? set.add(value) : set.delete(value);
  } else {
    // 联动：本节点 + 所有后代同步
    const it = itemMap.value.get(value);
    const affected = [value, ...(it?.descendants ?? [])];
    affected.forEach((v) => (willCheck ? set.add(v) : set.delete(v)));
    // 自底向上重算祖先：全部子节点勾选 → 父勾选，否则取消
    let p = it?.parent ?? null;
    while (p != null) {
      const kids = childrenMap.value.get(p) ?? [];
      const allChecked = kids.length > 0 && kids.every((c) => set.has(c));
      allChecked ? set.add(p) : set.delete(p);
      p = itemMap.value.get(p)?.parent ?? null;
    }
  }
  model.value = [...set];
}

// 联动模式下，把父节点状态从叶子重算一遍（用于 invert/外部设置后归一）
function normalizeParents(set: Set<TreeValue>): void {
  // 深度从大到小处理，保证子先于父
  [...flatAll.value]
    .sort((a, b) => b.depth - a.depth)
    .forEach((it) => {
      if (!it.hasChildren) return;
      const kids = childrenMap.value.get(it.value) ?? [];
      const allChecked = kids.length > 0 && kids.every((c) => set.has(c));
      allChecked ? set.add(it.value) : set.delete(it.value);
    });
}

// ---- 暴露给父级工具栏 ----
function expandAll(): void {
  const m: Record<string, boolean> = {};
  flatAll.value.forEach((it) => (m[String(it.value)] = true));
  expandedMap.value = m;
}
function collapseAll(): void {
  const m: Record<string, boolean> = {};
  flatAll.value.forEach((it) => (m[String(it.value)] = false));
  expandedMap.value = m;
}
function selectAll(): void {
  model.value = flatAll.value.map((it) => it.value);
}
function clearAll(): void {
  model.value = [];
}
function invertAll(): void {
  const set = new Set<TreeValue>();
  if (props.checkStrictly) {
    flatAll.value.forEach((it) => {
      if (!checkedSet.value.has(it.value)) set.add(it.value);
    });
  } else {
    // 仅翻转叶子，再重算父节点
    flatAll.value.forEach((it) => {
      if (!it.hasChildren && !checkedSet.value.has(it.value)) set.add(it.value);
      else if (!it.hasChildren && checkedSet.value.has(it.value)) {
        /* 取消勾选：不加入 */
      }
    });
    normalizeParents(set);
  }
  model.value = [...set];
}
// 提交用：完全勾选 + （联动时）半选父节点
function getCheckedKeys(includeHalf = true): TreeValue[] {
  const result = new Set(checkedSet.value);
  if (includeHalf && !props.checkStrictly) {
    flatAll.value.forEach((it) => {
      if (isIndeterminate(it.value)) result.add(it.value);
    });
  }
  return [...result];
}

defineExpose({ expandAll, collapseAll, selectAll, invertAll, clearAll, getCheckedKeys });

// 切换父子联动时，把已选状态归一（联动开启→重算父节点半选/全选）
watch(
  () => props.checkStrictly,
  (strict) => {
    if (!strict) {
      const set = new Set(checkedSet.value);
      normalizeParents(set);
      model.value = [...set];
    }
  }
);
</script>

<style scoped lang="scss">
.apt {
  font-family:
    Nunito, "Noto Sans SC", "Zen Maru Gothic", -apple-system, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  color: var(--ai-text);
}

.apt__row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
}

.apt__caret {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  color: #a09080;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  transition: transform 0.2s, color 0.15s, background 0.15s;

  &:hover {
    color: var(--ai-success);
    background: rgba(111, 186, 44, 0.1);
  }
  &--open {
    transform: rotate(90deg);
  }
}
.apt__caret-placeholder {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.apt__check {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 3px 8px;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.15s;

  &:hover {
    background: rgba(252, 161, 48, 0.08);
  }
}

.apt__box {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #fff;
  background: #fdfbf7;
  border: 2px solid #d4c9b4;
  border-radius: 6px;
  transition: all 0.15s;

  &--checked {
    background: var(--ai-leaf);
    border-color: #5a9c4e;
    box-shadow: 0 1px 3px rgba(124, 186, 112, 0.4);
  }
  &--indeterminate {
    background: #fdfbf7;
    border-color: var(--ai-leaf);
  }
}
.apt__dash {
  width: 9px;
  height: 3px;
  background: var(--ai-leaf);
  border-radius: 2px;
}

.apt__label {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.apt__mark) {
  padding: 0 1px;
  color: #f59b26;
  background: rgba(252, 161, 48, 0.18);
  border-radius: 3px;
}

.apt__empty {
  padding: 24px;
  font-size: 13px;
  color: var(--ai-text-2);
  text-align: center;
}
</style>
