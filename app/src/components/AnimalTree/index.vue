<!-- 动森风可拖拽树：嵌套分类、展开收起、选中、拖拽重排/改层级 -->
<template>
  <div class="ai-tree">
    <div
      v-for="row in rows"
      :key="row.key"
      class="ai-tree__row"
      :class="{
        'is-selected': row.key === selectedId,
        'is-drop-before': dropTarget.key === row.key && dropTarget.pos === 'before',
        'is-drop-inside': dropTarget.key === row.key && dropTarget.pos === 'inside',
        'is-drop-after': dropTarget.key === row.key && dropTarget.pos === 'after',
      }"
      :style="{ paddingLeft: 8 + row.depth * 18 + 'px' }"
      :draggable="draggable"
      @click="$emit('select', row.node)"
      @dragstart="onDragStart(row, $event)"
      @dragover.prevent="onDragOver(row, $event)"
      @dragleave="onDragLeave(row)"
      @drop="onDrop(row)"
      @dragend="resetDrag"
    >
      <span
        class="ai-tree__caret"
        :class="{
          'is-open': row.hasChildren && expanded.has(row.key),
          'is-leaf': !row.hasChildren,
        }"
        @click.stop="toggle(row)"
      >
        <svg
          viewBox="0 0 12 12"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 2.5l4 3.5-4 3.5" />
        </svg>
      </span>
      <span class="ai-tree__icon">
        <AnimalItemIcon
          v-if="iconKey && parseItemId(row.node[iconKey]) !== null"
          :item="row.node[iconKey]"
          :size="17"
        />
        <template v-else>{{ row.hasChildren ? "📁" : "📄" }}</template>
      </span>
      <span class="ai-tree__label">{{ row.node[labelKey] }}</span>
      <span v-if="row.hasChildren" class="ai-tree__count">{{ row.node[childrenKey].length }}</span>
      <span class="ai-tree__actions" @click.stop>
        <slot name="actions" :node="row.node" />
      </span>
    </div>

    <div
      v-if="draggable"
      class="ai-tree__root-drop"
      :class="{ 'is-active': rootDragOver }"
      @dragover.prevent="rootDragOver = true"
      @dragleave="rootDragOver = false"
      @drop="onDropRoot"
    >
      拖到此处设为根分类
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import AnimalItemIcon from "@/components/AnimalItemIcon/index.vue";
import { parseItemId } from "@/utils/animalItemIcon";

type Key = number | string;

const props = withDefaults(
  defineProps<{
    nodes: any[];
    selectedId?: Key | null;
    nodeKey?: string;
    labelKey?: string;
    childrenKey?: string;
    /** 节点上物品图标字段名；设置后该字段解析到有效物品图标则优先显示，否则回退 📁/📄 */
    iconKey?: string;
    draggable?: boolean;
  }>(),
  {
    selectedId: null,
    nodeKey: "id",
    labelKey: "name",
    childrenKey: "children",
    iconKey: "",
    draggable: true,
  }
);

const emit = defineEmits<{
  select: [node: any];
  reorder: [list: Array<{ id: Key; parentId: Key | null; sort: number }>];
}>();

const treeData = ref<any[]>([]);
const expanded = reactive(new Set<Key>());
const dragKey = ref<Key | null>(null);
const dropTarget = reactive<{ key: Key | null; pos: "before" | "inside" | "after" | null }>({
  key: null,
  pos: null,
});
const rootDragOver = ref(false);

function keyOf(n: any): Key {
  return n[props.nodeKey];
}
function childrenOf(n: any): any[] {
  return n[props.childrenKey] || [];
}

watch(
  () => props.nodes,
  (val) => {
    treeData.value = JSON.parse(JSON.stringify(val || []));
    // 默认展开所有有子节点的
    const collect = (list: any[]) => {
      list.forEach((n) => {
        if (childrenOf(n).length) {
          expanded.add(keyOf(n));
          collect(childrenOf(n));
        }
      });
    };
    collect(treeData.value);
  },
  { immediate: true, deep: true }
);

interface Row {
  key: Key;
  node: any;
  depth: number;
  hasChildren: boolean;
}

const rows = ref<Row[]>([]);

function rebuildRows(): void {
  const out: Row[] = [];
  const walk = (list: any[], depth: number) => {
    list.forEach((n) => {
      const k = keyOf(n);
      const kids = childrenOf(n);
      out.push({ key: k, node: n, depth, hasChildren: kids.length > 0 });
      if (kids.length && expanded.has(k)) walk(kids, depth + 1);
    });
  };
  walk(treeData.value, 0);
  rows.value = out;
}

watch([treeData, expanded], rebuildRows, { deep: true, immediate: true });

function toggle(row: Row): void {
  if (!row.hasChildren) return;
  if (expanded.has(row.key)) expanded.delete(row.key);
  else expanded.add(row.key);
}

/* ---------- 拖拽 ---------- */
function onDragStart(row: Row, e: DragEvent): void {
  dragKey.value = row.key;
  e.dataTransfer?.setData("text/plain", String(row.key));
}

function onDragOver(row: Row, e: DragEvent): void {
  if (dragKey.value == null || row.key === dragKey.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const offset = e.clientY - rect.top;
  const ratio = offset / rect.height;
  dropTarget.key = row.key;
  dropTarget.pos = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
}

function onDragLeave(row: Row): void {
  if (dropTarget.key === row.key) {
    dropTarget.key = null;
    dropTarget.pos = null;
  }
}

function resetDrag(): void {
  dragKey.value = null;
  dropTarget.key = null;
  dropTarget.pos = null;
  rootDragOver.value = false;
}

function removeNode(list: any[], key: Key): any | null {
  for (let i = 0; i < list.length; i++) {
    if (keyOf(list[i]) === key) return list.splice(i, 1)[0];
    const kids = list[i][props.childrenKey];
    if (kids) {
      const r = removeNode(kids, key);
      if (r) return r;
    }
  }
  return null;
}

function findNode(list: any[], key: Key): any | null {
  for (const n of list) {
    if (keyOf(n) === key) return n;
    const kids = n[props.childrenKey];
    if (kids) {
      const r = findNode(kids, key);
      if (r) return r;
    }
  }
  return null;
}

function findParentList(list: any[], key: Key): { arr: any[]; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    if (keyOf(list[i]) === key) return { arr: list, index: i };
    const kids = list[i][props.childrenKey];
    if (kids) {
      const r = findParentList(kids, key);
      if (r) return r;
    }
  }
  return null;
}

function isDescendant(node: any, key: Key): boolean {
  if (keyOf(node) === key) return true;
  return childrenOf(node).some((c) => isDescendant(c, key));
}

function emitReorder(): void {
  const flat: Array<{ id: Key; parentId: Key | null; sort: number }> = [];
  const walk = (list: any[], parentId: Key | null) => {
    list.forEach((n, index) => {
      flat.push({ id: keyOf(n), parentId, sort: index });
      const kids = n[props.childrenKey];
      if (kids?.length) walk(kids, keyOf(n));
    });
  };
  walk(treeData.value, null);
  emit("reorder", flat);
}

function onDrop(row: Row): void {
  const dKey = dragKey.value;
  const pos = dropTarget.pos;
  const targetKey = row.key;
  resetDrag();
  if (dKey == null || pos == null || dKey === targetKey) return;

  const dragNode = findNode(treeData.value, dKey);
  if (!dragNode || isDescendant(dragNode, targetKey)) return; // 不能拖进自身子树

  removeNode(treeData.value, dKey);

  if (pos === "inside") {
    const target = findNode(treeData.value, targetKey);
    if (!target) return;
    if (!target[props.childrenKey]) target[props.childrenKey] = [];
    target[props.childrenKey].push(dragNode);
    expanded.add(targetKey);
  } else {
    const loc = findParentList(treeData.value, targetKey);
    if (!loc) return;
    loc.arr.splice(loc.index + (pos === "after" ? 1 : 0), 0, dragNode);
  }
  emitReorder();
}

function onDropRoot(): void {
  const dKey = dragKey.value;
  resetDrag();
  if (dKey == null) return;
  const dragNode = removeNode(treeData.value, dKey);
  if (!dragNode) return;
  treeData.value.push(dragNode);
  emitReorder();
}
</script>

<style lang="scss" scoped>
.ai-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-tree__row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px 7px 8px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text, var(--ai-text));
  border: 1.5px solid transparent;
  transition: background 0.15s;

  &:hover {
    background: rgba(25, 200, 185, 0.08);
  }

  &.is-selected {
    background: rgba(25, 200, 185, 0.14);
    border-color: rgba(25, 200, 185, 0.4);
  }

  &.is-drop-inside {
    background: rgba(111, 186, 44, 0.16);
    border-color: var(--ai-success, var(--ai-success));
  }
  &.is-drop-before {
    box-shadow: inset 0 2px 0 0 var(--ai-primary, var(--ai-primary));
  }
  &.is-drop-after {
    box-shadow: inset 0 -2px 0 0 var(--ai-primary, var(--ai-primary));
  }
}

.ai-tree__caret {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--ai-text-3, var(--ai-text-3));
  transition: transform 0.15s;

  &.is-open {
    transform: rotate(90deg);
  }
  &.is-leaf {
    visibility: hidden;
  }
}

.ai-tree__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 13px;
}

.ai-tree__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-tree__count {
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2, var(--ai-text-2));
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  padding: 1px 7px;
}

.ai-tree__actions {
  display: none;
  align-items: center;
  gap: 6px;
}

.ai-tree__row:hover .ai-tree__actions {
  display: inline-flex;
}

.ai-tree__root-drop {
  margin-top: 8px;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--ai-text-2, var(--ai-text-2));
  border: 2px dashed var(--ai-border, var(--ai-border));
  border-radius: 12px;

  &.is-active {
    border-color: var(--ai-primary, var(--ai-primary));
    background: rgba(25, 200, 185, 0.08);
    color: var(--ai-primary-active, var(--ai-primary-active));
  }
}
</style>
