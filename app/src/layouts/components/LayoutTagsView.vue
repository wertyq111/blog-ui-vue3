<template>
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

    <!-- 标签右键菜单 -->
    <Teleport to="body">
      <ul
        v-show="contextMenu.visible"
        class="contextmenu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <li @click="refreshSelectedTag(selectedTag)">
          <div class="i-svg:refresh" />
          刷新
        </li>
        <li v-if="!selectedTag?.affix" @click="closeSelectedTag(selectedTag)">
          <div class="i-svg:close" />
          关闭
        </li>
        <li @click="closeOtherTags">
          <div class="i-svg:close_other" />
          关闭其它
        </li>
        <li v-if="!isFirstView" @click="closeLeftTags">
          <div class="i-svg:close_left" />
          关闭左侧
        </li>
        <li v-if="!isLastView" @click="closeRightTags">
          <div class="i-svg:close_right" />
          关闭右侧
        </li>
        <li @click="closeAllTags(selectedTag)">
          <div class="i-svg:close_all" />
          关闭所有
        </li>
      </ul>
    </Teleport>

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
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/lang/utils";
import { useAppStore, usePermissionStore, useTagsViewStore } from "@/store";
import { useTagsOverflow } from "@/composables";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

const router = useRouter();
const route = useRoute();

// 状态管理
const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();

const { visitedViews } = storeToRefs(tagsViewStore);

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

/**
 * 溢出面板状态，与右键菜单互斥。
 * 这一组必须声明在 route 的 immediate watch 之前：immediate 回调在 setup 期间
 * 同步执行并调用 closeOverflowMenu，声明靠后会落进暂时性死区。
 */
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

// 当前选中的标签
const selectedTag = ref<TagView | null>(null);

// 右键菜单状态"
const contextMenu = reactive<ContextMenu>({
  visible: false,
  x: 0,
  y: 0,
});

// 路由映射缓存，提升查找性能
const routePathMap = computed(() => {
  const map = new Map<string, TagView>();
  visitedViews.value.forEach((tag) => {
    map.set(tag.path, tag);
  });
  return map;
});

// 判断是否为第一个标签
const isFirstView = computed(() => {
  if (!selectedTag.value) return false;
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.fullPath === visitedViews.value[1]?.fullPath
  );
});

// 判断是否为最后一个标签
const isLastView = computed(() => {
  if (!selectedTag.value) return false;
  return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath;
});

/**
 * 递归提取固定标签
 */
const extractAffixTags = (routes: RouteRecordRaw[], basePath = "/"): TagView[] => {
  const affixTags: TagView[] = [];

  const traverse = (routeList: RouteRecordRaw[], currentBasePath: string) => {
    routeList.forEach((route) => {
      const fullPath = resolve(currentBasePath, route.path);

      // 如果是固定标签，添加到列表
      if (route.meta?.affix) {
        affixTags.push({
          path: fullPath,
          fullPath,
          name: String(route.name || ""),
          title: route.meta.title || "no-name",
          affix: true,
          keepAlive: route.meta.keepAlive || false,
        });
      }

      // 递归处理子路由
      if (route.children?.length) {
        traverse(route.children, fullPath);
      }
    });
  };

  traverse(routes, basePath);
  return affixTags;
};

/**
 * 初始化固定标签
 */
const initAffixTags = () => {
  const affixTags = extractAffixTags(permissionStore.routes);

  affixTags.forEach((tag) => {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  });
};

/**
 * 添加当前路由标签
 */
const addCurrentTag = () => {
  if (!route.meta?.title) return;

  tagsViewStore.addView({
    name: route.name as string,
    title: route.meta.title,
    path: route.path,
    fullPath: route.fullPath,
    affix: route.meta.affix || false,
    keepAlive: route.meta.keepAlive || false,
    query: route.query,
  });
};

/**
 * 更新当前标签
 */
const updateCurrentTag = () => {
  nextTick(() => {
    const currentTag = routePathMap.value.get(route.path);

    if (currentTag && currentTag.fullPath !== route.fullPath) {
      tagsViewStore.updateVisitedView({
        name: route.name as string,
        title: route.meta?.title || "",
        path: route.path,
        fullPath: route.fullPath,
        affix: route.meta?.affix || false,
        keepAlive: route.meta?.keepAlive || false,
        query: route.query,
      });
    }
  });
};

/**
 * 处理中键点击
 */
const handleMiddleClick = (tag: TagView) => {
  if (!tag.affix) {
    closeSelectedTag(tag);
  }
};

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

/**
 * 关闭右键菜单
 */
const closeContextMenu = () => {
  contextMenu.visible = false;
};

/**
 * 刷新标签
 */
const refreshSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delCachedView(tag);
  nextTick(() => {
    router.replace("/redirect" + tag.fullPath);
  });
};

/**
 * 关闭标签
 */
const closeSelectedTag = (tag: TagView | null) => {
  if (!tag) return;

  tagsViewStore.delView(tag).then((result: any) => {
    if (tagsViewStore.isActive(tag)) {
      tagsViewStore.toLastView(result.visitedViews, tag);
    }
  });
};

/**
 * 关闭左侧标签
 */
const closeLeftTags = () => {
  if (!selectedTag.value) return;

  tagsViewStore.delLeftViews(selectedTag.value).then((result: any) => {
    const hasCurrentRoute = result.visitedViews.some((item: TagView) => item.path === route.path);

    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(result.visitedViews);
    }
  });
};

/**
 * 关闭右侧标签
 */
const closeRightTags = () => {
  if (!selectedTag.value) return;

  tagsViewStore.delRightViews(selectedTag.value).then((result: any) => {
    const hasCurrentRoute = result.visitedViews.some((item: TagView) => item.path === route.path);

    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(result.visitedViews);
    }
  });
};

/**
 * 关闭其他标签
 */
const closeOtherTags = () => {
  if (!selectedTag.value) return;

  router.push(selectedTag.value);
  tagsViewStore.delOtherViews(selectedTag.value).then(() => {
    updateCurrentTag();
  });
};

/**
 * 关闭所有标签
 */
const closeAllTags = (tag: TagView | null) => {
  tagsViewStore.delAllViews().then((result: any) => {
    tagsViewStore.toLastView(result.visitedViews, tag || undefined);
  });
};

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

// 初始化
onMounted(() => {
  initAffixTags();
  nextTick(updateOverflow);
});

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

// 启用右键菜单管理
useContextMenuManager();
</script>

<style lang="scss" scoped>
.tags-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  width: auto;
  height: var(--tags-view-height);
  margin: 10px 0 10px 0;
  padding: 8px 14px;
  box-sizing: border-box;
  background:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><circle cx="90" cy="10" r="3" fill="%23d1da49" opacity="0.3"/><circle cx="80" cy="20" r="2" fill="%237cba70" opacity="0.3"/></svg>')
      no-repeat right top,
    rgba(216, 236, 198, 0.6);
  border: 2px solid #e8e2d6;
  border-radius: 18px;
  box-shadow: 0 3px 0 0 rgba(74, 138, 54, 0.08);
  backdrop-filter: none;

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

  .tab-home {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    flex-shrink: 0;
    height: 30px;
    padding: 0 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13px;
    color: #794f27;
    background: transparent;
    border: 0;
    cursor: pointer;
    transition: background 0.18s;

    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }
  }

  .tab {
    border-radius: 999px;
    height: 30px;
    padding: 0 16px;
    border: 0;
    background: transparent;
    color: #794f27;
    font-size: 13px;
    font-weight: 700;
    transition: background 0.18s;
    box-shadow: none;

    &:hover {
      background: rgba(255, 255, 255, 0.7);
    }

    // Active tab: green leaf gradient + seedling emoji
    &.el-tag--primary {
      background: linear-gradient(135deg, #d8ecc6 0%, #b4dc9c 100%);
      color: #4a8a36;
      font-weight: 800;
      box-shadow:
        0 2px 0 0 rgba(74, 138, 54, 0.2),
        inset 0 0 0 1.5px rgba(74, 138, 54, 0.15);

      &::before {
        content: "\1F331"; // 🌱
        font-size: 11px;
        margin-right: 4px;
      }
    }

    :deep(.el-tag__close) {
      color: #794f27;
      opacity: 0.55;
      width: 16px;
      height: 16px;
      border-radius: 50%;

      &:hover {
        background-color: rgba(74, 138, 54, 0.15);
        color: #4a8a36;
        opacity: 1;
      }
    }
  }
}

// 绝对定位而非参与 flex 流：否则按钮显隐会改变 .tags-row 宽度，
// 而宽度又决定按钮显隐，在 ResizeObserver 回调里形成回环
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

.contextmenu,
.overflow-menu {
  position: absolute;
  z-index: 3000;
  padding: 8px 0;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #5a4230;
  list-style-type: none;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.56);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(224, 213, 199, 0.16);

  li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 20px;
    margin: 0;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(253, 246, 238, 0.92);
      color: #c4917c;
    }
  }
}

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
</style>
