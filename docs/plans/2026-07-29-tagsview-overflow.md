# 标签栏溢出折叠实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把后台标签栏的横向滚动改为溢出折叠，标签行撑满容器宽度，放不下的标签收进右侧图标按钮的下拉面板。

**Architecture:** 新增纯逻辑 composable `useTagsOverflow` 负责「哪些标签该折叠」，`LayoutTagsView.vue` 只负责渲染与事件，两者通过标签索引交接。折叠用绝对定位 + `visibility: hidden` 实现，保证 `offsetWidth` 始终可测量。溢出按钮绝对定位、不参与 flex 流，避免「按钮显隐改变行宽」的观察器回环。

**Tech Stack:** Vue 3.5 + TypeScript + Element Plus + `@vueuse/core`（`useResizeObserver`）+ Sass。

**设计文档：** `docs/specs/2026-07-29-tagsview-overflow-design.md`

## Global Constraints

- 分支 `feature/tagsview-overflow`，改动只提交至 `blog-ui-vue3` 仓库。
- 提交信息格式 `<类型>: <中文描述>`，类型取 feat / fix / docs / refactor / chore。
- **项目未安装 vitest**，无单元测试。每个任务的验证 = `pnpm type-check` + `pnpm build-only`（与 CI 门禁一致，CI 不挂 lint）+ 该任务列出的手工验证点。不得为此引入测试框架。
- composable 写在 `app/src/composables/`，使用**显式 `import`**（与 `useRecentMenus.ts` 等既有文件一致），并在 `composables/index.ts` 追加导出。`.vue` 文件沿用自动导入，不加 `ref`/`computed` 等 import。
- 新增颜色只用精确匹配的 `--ai-*` token，且**不带 fallback**：`--ai-text` = `#794f27`、`--ai-text-2` = `#9f927d`、`--ai-border` = `#e8e2d6`。绿色 `#4a8a36`、`rgba(74, 138, 54, *)` **没有**对应 token（`--ai-primary` 是 `#19c8b9`），保留字面值不硬凑。不批量改本文件已有的颜色字面值。
- 不改动 `tagsViewStore`、右键菜单既有功能，以及 `.contextmenu` 使用 `position: absolute` 的既有写法。
- 所有命令在 `blog-ui-vue3/app/` 目录下执行，包管理器只能用 pnpm。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `app/src/composables/useTagsOverflow.ts`（新建） | 溢出计算。导出纯函数 `computeCollapsed` 与 composable `useTagsOverflow`。不认识路由、不认识 `TagView`。 |
| `app/src/composables/index.ts`（修改） | 追加导出。 |
| `app/src/layouts/components/LayoutTagsView.vue`（修改） | 渲染标签行、接入 composable、溢出下拉面板。 |

---

### Task 1: 溢出计算 composable

**Files:**
- Create: `app/src/composables/useTagsOverflow.ts`
- Modify: `app/src/composables/index.ts`（文件末尾追加）

**Interfaces:**
- Consumes: 无
- Produces:
  - `computeCollapsed(input: CollapseInput): Set<number>`
  - `useTagsOverflow(options: UseTagsOverflowOptions): { collapsedIndexes: Ref<Set<number>>; hasOverflow: ComputedRef<boolean>; update: () => void }`
  - `CollapseInput { widths: number[]; gap: number; available: number; activeIndex: number; affixIndexes: number[] }`
  - `UseTagsOverflowOptions { rowRef: Ref<HTMLElement | undefined>; leadRef: Ref<HTMLElement | undefined>; itemEls: Ref<HTMLElement[]>; activeIndex: Ref<number>; affixIndexes: Ref<number[]>; reserveWidth: number; gap: number }`

- [ ] **Step 1: 创建 `app/src/composables/useTagsOverflow.ts`**

```ts
import { computed, ref, type ComputedRef, type Ref } from "vue";
import { useResizeObserver } from "@vueuse/core";

/**
 * 溢出计算入参，纯数值，不依赖 DOM
 */
export interface CollapseInput {
  /** 各标签的像素宽度，顺序与标签列表一致 */
  widths: number[];
  /** 标签之间的间距 */
  gap: number;
  /** 可用于摆放标签的宽度 */
  available: number;
  /** 当前激活标签的索引，没有则传 -1 */
  activeIndex: number;
  /** 固定标签（affix）的索引 */
  affixIndexes: number[];
}

/**
 * 计算哪些标签需要折叠。
 *
 * 规则：
 * 1. affix 与 active 是保底标签，优先占用预算；
 * 2. 剩余预算按从左到右分配给非保底标签，第一个装不下的以及其后全部折叠，
 *    不跳着挑选，避免出现「显示 1、3、6」的视觉噪声；
 * 3. 连保底标签都装不下时降级为只保留 active。
 *
 * 每项成本按「宽度 + 一个间距」计算，末位会多算一个间距，
 * 这是刻意保留的保守量，宁可早折叠一个也不要溢出。
 */
export function computeCollapsed(input: CollapseInput): Set<number> {
  const { widths, gap, available, activeIndex, affixIndexes } = input;
  const cost = (index: number) => widths[index] + gap;

  const collapseAllExcept = (kept: Set<number>) => {
    const collapsed = new Set<number>();
    widths.forEach((_, index) => {
      if (!kept.has(index)) {
        collapsed.add(index);
      }
    });
    return collapsed;
  };

  const mustKeep = Array.from(new Set([...affixIndexes, activeIndex]))
    .filter((index) => index >= 0 && index < widths.length)
    .sort((a, b) => a - b);

  let used = mustKeep.reduce((sum, index) => sum + cost(index), 0);

  // 极端窄屏：连保底标签都放不下，只保留 active
  if (used > available) {
    return collapseAllExcept(new Set(activeIndex >= 0 ? [activeIndex] : []));
  }

  const kept = new Set(mustKeep);
  for (let index = 0; index < widths.length; index++) {
    if (kept.has(index)) {
      continue;
    }
    if (used + cost(index) > available) {
      break;
    }
    kept.add(index);
    used += cost(index);
  }

  return collapseAllExcept(kept);
}

export interface UseTagsOverflowOptions {
  /** 标签行容器 */
  rowRef: Ref<HTMLElement | undefined>;
  /** 行首恒定可见的元素（主页链接），不参与折叠 */
  leadRef: Ref<HTMLElement | undefined>;
  /** 各标签 DOM，顺序与标签列表一致 */
  itemEls: Ref<HTMLElement[]>;
  /** 当前激活标签索引 */
  activeIndex: Ref<number>;
  /** 固定标签索引 */
  affixIndexes: Ref<number[]>;
  /** 溢出按钮宽度 + 与标签的间距 */
  reserveWidth: number;
  /** 标签间距，需与样式里的 gap 保持一致 */
  gap: number;
}

/**
 * 监听标签行宽度，计算溢出折叠结果。
 *
 * 溢出按钮只在有溢出时出现，但它自身占宽，构成循环依赖，
 * 因此固定跑两遍：第一遍不留按钮位，若有溢出则扣掉按钮宽度重算一遍。
 * 两遍必然收敛，不会震荡。
 */
export function useTagsOverflow(options: UseTagsOverflowOptions): {
  collapsedIndexes: Ref<Set<number>>;
  hasOverflow: ComputedRef<boolean>;
  update: () => void;
} {
  const { rowRef, leadRef, itemEls, activeIndex, affixIndexes, reserveWidth, gap } = options;

  const collapsedIndexes = ref<Set<number>>(new Set());
  const hasOverflow = computed(() => collapsedIndexes.value.size > 0);

  const update = () => {
    const row = rowRef.value;
    if (!row) {
      collapsedIndexes.value = new Set();
      return;
    }

    const widths = itemEls.value.map((el) => el?.offsetWidth ?? 0);
    const leadWidth = leadRef.value?.offsetWidth ?? 0;
    const base = row.clientWidth - (leadWidth > 0 ? leadWidth + gap : 0);

    const shared = {
      widths,
      gap,
      activeIndex: activeIndex.value,
      affixIndexes: affixIndexes.value,
    };

    const firstPass = computeCollapsed({ ...shared, available: base });
    if (firstPass.size === 0) {
      collapsedIndexes.value = firstPass;
      return;
    }

    collapsedIndexes.value = computeCollapsed({ ...shared, available: base - reserveWidth });
  };

  useResizeObserver(rowRef, update);

  return { collapsedIndexes, hasOverflow, update };
}
```

- [ ] **Step 2: 在 `app/src/composables/index.ts` 末尾追加导出**

```ts

// 标签栏溢出折叠
export { useTagsOverflow, computeCollapsed } from "./useTagsOverflow";
export type { CollapseInput, UseTagsOverflowOptions } from "./useTagsOverflow";
```

- [ ] **Step 3: 类型检查**

Run:

```bash
pnpm type-check
```

Expected: 无报错退出（exit code 0）。若报 `Cannot find module '@vueuse/core'`，说明依赖未安装，先跑 `pnpm install`。

- [ ] **Step 4: 提交**

```bash
git add src/composables/useTagsOverflow.ts src/composables/index.ts
git commit -m "feat: 新增标签栏溢出折叠计算 composable"
```

---

### Task 2: 标签行改为溢出折叠，修复宽度未撑满

**Files:**
- Modify: `app/src/layouts/components/LayoutTagsView.vue`

**Interfaces:**
- Consumes: Task 1 的 `useTagsOverflow`
- Produces: 组件内的 `collapsedTags`（`ComputedRef<TagView[]>`）与 `hasOverflow`，供 Task 3 的下拉面板使用；`rowRef` / `leadRef` / `itemEls` / `setItemRef` 已就位。

本任务只做标签行与宽度，**chevron 按钮暂时保留原有的「打开右键菜单」行为**，下拉面板在 Task 3 替换。这样 Task 2 结束时页面是可用的，可以独立验证宽度与折叠是否正确。

- [ ] **Step 1: 替换 template 里的标签行（原第 2-64 行）**

把 `<div class="tags-container">` 开头到 `</button>` 为止的这一段：

```vue
  <div class="tags-container">
    <!-- 水平滚动容器 -->
    <el-scrollbar
      ref="scrollbarRef"
      class="scroll-container"
      :view-style="{ height: '100%' }"
      @wheel="handleScroll"
    >
      <div h-full flex-y-center gap-6px>
```

替换为：

```vue
  <div class="tags-container">
    <div ref="rowRef" class="tags-row">
```

并把内层 `</div>` + `</el-scrollbar>` 收尾改成单个 `</div>`；`.tabbar-spacer` 那一行整体删除；`el-tag` 上加 ref 与折叠类。替换后这一段完整长这样：

```vue
  <div class="tags-container">
    <div ref="rowRef" class="tags-row">
      <a ref="leadRef" href="/#/" class="tab tab-home" title="返回博客首页">
        <svg
          viewBox="0 0 24 24"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 11l9-8 9 8" />
          <path d="M5 9v11h14V9" />
        </svg>
        主页
      </a>
      <el-tag
        v-for="(tag, index) in visitedViews"
        :key="tag.fullPath"
        :ref="(el: any) => setItemRef(el, index)"
        cursor-pointer
        class="tab"
        :class="{ 'is-collapsed': collapsedIndexes.has(index) }"
        :closable="!tag.affix"
        :effect="tagsViewStore.isActive(tag) ? 'dark' : 'light'"
        :type="tagsViewStore.isActive(tag) ? 'primary' : 'info'"
        @click.middle="handleMiddleClick(tag)"
        @contextmenu.prevent="(event: MouseEvent) => openContextMenu(tag, event)"
        @close="closeSelectedTag(tag)"
        @click="
          router.push({
            path: tag.fullPath,
            query: tag.query,
          })
        "
      >
        {{ translateRouteTitle(tag.title) }}
      </el-tag>
    </div>
    <button v-if="hasOverflow" class="tabbar-drop" title="更多标签" @click.stop="openTabMenu">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
```

- [ ] **Step 2: 删除滚动逻辑，接入 composable**

在 `<script setup>` 里，删除这两处（原第 133-134 行与第 271-287 行）：

```ts
// 滚动条引用
const scrollbarRef = ref();
```

```ts
/**
 * 处理滚轮事件
 */
const handleScroll = (event: WheelEvent) => {
  closeContextMenu();

  const scrollWrapper = scrollbarRef.value?.wrapRef;
  if (!scrollWrapper) return;

  const hasHorizontalScroll = scrollWrapper.scrollWidth > scrollWrapper.clientWidth;
  if (!hasHorizontalScroll) return;

  const deltaY = event.deltaY || -(event as any).wheelDelta || 0;
  const newScrollLeft = scrollWrapper.scrollLeft + deltaY;

  scrollbarRef.value.setScrollLeft(newScrollLeft);
};
```

把 store 的 import 行改为（新增 `useAppStore`）：

```ts
import { useAppStore, usePermissionStore, useTagsViewStore } from "@/store";
```

在 `import { usePermissionStore... }` 之后新增一行 import：

```ts
import { useTagsOverflow } from "@/composables";
```

在 `const { visitedViews } = storeToRefs(tagsViewStore);` 之后插入：

```ts
const appStore = useAppStore();

/** 与 .tags-row 的 gap 保持一致 */
const TAB_GAP = 6;
/** 溢出按钮宽 28px + 间距 6px */
const DROP_RESERVE = 34;

const rowRef = ref<HTMLElement>();
const leadRef = ref<HTMLElement>();
const itemEls = ref<HTMLElement[]>([]);

/**
 * 收集标签 DOM。el-tag 是组件，需要取 $el 拿到真实元素。
 */
const setItemRef = (el: any, index: number) => {
  const dom = (el?.$el ?? el) as HTMLElement | null;
  if (dom) {
    itemEls.value[index] = dom;
  }
};

const activeIndex = computed(() =>
  visitedViews.value.findIndex((tag) => tagsViewStore.isActive(tag))
);

const affixIndexes = computed(() =>
  visitedViews.value.reduce<number[]>((acc, tag, index) => {
    if (tag.affix) {
      acc.push(index);
    }
    return acc;
  }, [])
);

const {
  collapsedIndexes,
  hasOverflow,
  update: updateOverflow,
} = useTagsOverflow({
  rowRef,
  leadRef,
  itemEls,
  activeIndex,
  affixIndexes,
  reserveWidth: DROP_RESERVE,
  gap: TAB_GAP,
});

/** 被折叠的标签，供下拉面板展示 */
const collapsedTags = computed(() =>
  visitedViews.value.filter((_, index) => collapsedIndexes.value.has(index))
);
```

- [ ] **Step 3: 加重算触发**

在文件末尾 `// 启用右键菜单管理` 之前插入：

```ts
// 标签增减、切换、语言变化后重算折叠
watch(
  visitedViews,
  () => {
    nextTick(() => {
      itemEls.value.length = visitedViews.value.length;
      updateOverflow();
    });
  },
  { deep: true }
);

watch(activeIndex, () => nextTick(updateOverflow));

watch(
  () => appStore.language,
  () => nextTick(updateOverflow)
);
```

并把既有的 `onMounted` 改为：

```ts
// 初始化
onMounted(() => {
  initAffixTags();
  nextTick(updateOverflow);
});
```

- [ ] **Step 4: 改样式**

`.tags-container` 加 `position: relative`（chevron 要相对它定位）：

```scss
.tags-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
```

把 `.scroll-container` 整块：

```scss
  .scroll-container {
    display: flex;
    align-items: center;
    height: 100%;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
```

替换为：

```scss
  // overflow: hidden 是保险丝：测量完成前的一帧不会闪出溢出内容，
  // 也彻底杜绝横向滚动条
  .tags-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }

  // 折叠的标签用绝对定位脱离文档流，而不是 display: none，
  // 这样 offsetWidth 始终可读，不会出现「隐藏后量不到宽 → 下次算错」的抖动
  .tab.is-collapsed {
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    pointer-events: none;
  }
```

删除整个 `.tabbar-spacer` 样式块（原第 515-517 行）——它和 `.scroll-container` 同为 `flex: 1`，平分了容器宽度，这就是标签行没撑到最右的根因：

```scss
.tabbar-spacer {
  flex: 1;
}
```

把 `.tabbar-drop` 改为绝对定位（避免它的显隐改变 `.tags-row` 宽度、进而在 `ResizeObserver` 回调里形成回环），并把颜色换成精确匹配的 token：

```scss
.tabbar-drop {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  border: 0;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--ai-text-2);
  transition: background 0.18s;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: var(--ai-text);
  }
}
```

- [ ] **Step 5: 类型检查与构建**

Run:

```bash
pnpm type-check && pnpm build-only
```

Expected: 两条命令均以 exit code 0 结束，无 TS 报错。

- [ ] **Step 6: 提交**

```bash
git add src/layouts/components/LayoutTagsView.vue
git commit -m "feat: 标签栏改为溢出折叠并修复宽度未撑满"
```

---

### Task 3: 溢出标签下拉面板

**Files:**
- Modify: `app/src/layouts/components/LayoutTagsView.vue`

**Interfaces:**
- Consumes: Task 2 的 `collapsedTags`、`hasOverflow`；既有的 `closeSelectedTag`、`translateRouteTitle`、`tagsViewStore.isActive`
- Produces: 无（终态）

- [ ] **Step 1: 用溢出面板逻辑替换 `openTabMenu`**

删除既有的 `openTabMenu`（原第 400-411 行）：

```ts
/**
 * 打开标签下拉菜单（复用右键菜单逻辑，定位到下拉按钮位置）
 */
const openTabMenu = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  contextMenu.x = rect.left;
  contextMenu.y = rect.bottom + 4;
  contextMenu.visible = true;
  // 选择最后一个标签作为上下文
  selectedTag.value = visitedViews.value[visitedViews.value.length - 1] || null;
};
```

替换为：

```ts
/** 溢出面板状态，与右键菜单互斥 */
const overflowMenu = reactive({
  visible: false,
  right: 0,
  top: 0,
});

/**
 * 打开溢出标签面板。
 * 按钮贴容器右缘，用 right 定位可以避开「面板宽度未知时 left 算不准」。
 */
const openTabMenu = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  overflowMenu.right = window.innerWidth - rect.right;
  overflowMenu.top = rect.bottom + 8;
  overflowMenu.visible = true;
  contextMenu.visible = false;
};

const closeOverflowMenu = () => {
  overflowMenu.visible = false;
};

/** 点击折叠标签：跳转并收起面板 */
const goToCollapsedTag = (tag: TagView) => {
  router.push({ path: tag.fullPath, query: tag.query });
  closeOverflowMenu();
};

// 折叠列表被关空后自动收起面板
watch(
  () => collapsedTags.value.length,
  (length) => {
    if (length === 0) {
      closeOverflowMenu();
    }
  }
);
```

- [ ] **Step 2: 右键菜单打开时关闭溢出面板**

把既有的 `openContextMenu` 改为：

```ts
/**
 * 打开右键菜单
 */
const openContextMenu = (tag: TagView, event: MouseEvent) => {
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.visible = true;
  overflowMenu.visible = false;

  selectedTag.value = tag;
};
```

- [ ] **Step 3: 让外部点击同时关闭两个面板**

把既有的 `useContextMenuManager` 改为：

```ts
// 菜单管理：外部点击关闭右键菜单与溢出面板
const useContextMenuManager = () => {
  const handleOutsideClick = () => {
    closeContextMenu();
    closeOverflowMenu();
  };

  watchEffect(() => {
    if (contextMenu.visible || overflowMenu.visible) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
  });

  // 组件卸载时清理
  onBeforeUnmount(() => {
    document.removeEventListener("click", handleOutsideClick);
  });
};
```

并在既有的路由 `watch` 回调里补一行收起面板：

```ts
// 监听路由变化
watch(
  route,
  () => {
    addCurrentTag();
    updateCurrentTag();
    closeOverflowMenu();
  },
  { immediate: true }
);
```

- [ ] **Step 4: 加面板模板**

在既有右键菜单的 `</Teleport>` 之后、`</div>` 之前插入：

```vue
    <!-- 溢出标签面板 -->
    <Teleport to="body">
      <ul
        v-show="overflowMenu.visible"
        class="overflow-menu"
        :style="{ right: overflowMenu.right + 'px', top: overflowMenu.top + 'px' }"
        @click.stop
      >
        <li
          v-for="tag in collapsedTags"
          :key="tag.fullPath"
          :class="{ 'is-active': tagsViewStore.isActive(tag) }"
          @click="goToCollapsedTag(tag)"
        >
          <span class="overflow-menu__title">{{ translateRouteTitle(tag.title) }}</span>
          <span
            v-if="!tag.affix"
            class="overflow-menu__close"
            title="关闭标签"
            @click.stop="closeSelectedTag(tag)"
          >
            ×
          </span>
        </li>
      </ul>
    </Teleport>
```

- [ ] **Step 5: 加面板样式**

把既有的 `.contextmenu {` 选择器改为两个选择器并列，共享外观（内部声明保持原样不动，避免改到右键菜单现有观感）：

```scss
.contextmenu,
.overflow-menu {
  position: absolute;
  z-index: 3000;
```

在 `.contextmenu` 样式块结束的 `}` 之后追加：

```scss
// 溢出面板用视口坐标定位，故覆盖为 fixed
.overflow-menu {
  position: fixed;
  min-width: 160px;
  max-height: 320px;
  overflow-y: auto;

  li {
    justify-content: space-between;
    padding-right: 12px;

    &.is-active .overflow-menu__title {
      font-weight: 800;
      color: #4a8a36;
    }
  }

  &__title {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__close {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 18px;
    height: 18px;
    font-size: 14px;
    line-height: 1;
    color: var(--ai-text);
    border-radius: 50%;
    opacity: 0.55;

    &:hover {
      color: #4a8a36;
      background-color: rgba(74, 138, 54, 0.15);
      opacity: 1;
    }
  }
}
```

- [ ] **Step 6: 类型检查与构建**

Run:

```bash
pnpm type-check && pnpm build-only
```

Expected: 两条命令均以 exit code 0 结束。

- [ ] **Step 7: 提交**

```bash
git add src/layouts/components/LayoutTagsView.vue
git commit -m "feat: 溢出标签改用下拉面板展示"
```

---

### Task 4: 远端同步与页面验证

**Files:** 无代码改动

- [ ] **Step 1: 清理 `._*` 文件**

Run（在 `blog-ui-vue3/` 目录）：

```bash
find . -name '._*' -not -path './node_modules/*' -delete
```

- [ ] **Step 2: 征得用户同意后同步到远端**

同步前先与用户确认。Run：

```bash
rsync -avz --exclude='._*' --exclude='node_modules' --exclude='.env' --exclude='.git' ./ ubuntu@10.10.9.184:/data/personal/projects/blog-ui-vue3/
```

本次未改动配置、Dockerfile、compose、环境变量与构建链路，**不执行 `docker compose up`**，直接用现有 8083 服务验证。

- [ ] **Step 3: 页面验证**

按项目规则，**打开浏览器做页面验证前先问用户**（用户可能已手动验证过）。验证地址 `http://10.10.9.184:8083/`，逐项确认：

1. 标签行右端贴合容器右侧，右侧无大片空白
2. 页面底部无横向滚动条
3. 标签少时不出现 chevron 按钮
4. 打开 10 个以上标签后 chevron 出现
5. 拖窄浏览器窗口，折叠数量随之增加
6. 折叠面板里点标签能跳转，跳转后该标签变为可见
7. 折叠面板里点 `×` 能关闭标签，列表清空后面板自动收起
8. affix 标签在折叠面板中不显示 `×`
9. 右键任意标签，刷新 / 关闭 / 关闭其它 / 关闭所有 均正常
10. 切换中英文后折叠结果重新计算
11. 侧栏折叠/展开后折叠结果重新计算

- [ ] **Step 4: 交付**

创建中文 PR → 本地合并 `main` → 远端同步 `main`。
