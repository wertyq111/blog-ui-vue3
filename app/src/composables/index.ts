// SSE 服务
export { setupSse, cleanupSseServices } from "./sse";
export { useSse, useDictSync, useOnlineCount, SseConnectionState } from "./sse";
export type { DictMessage, DictChangeMessage, DictChangeCallback } from "./sse";

// 表格相关
export { useTableSelection } from "./useTableSelection";

// 最近访问菜单
export { useRecentMenus } from "./useRecentMenus";
export type { RecentMenuItem } from "./useRecentMenus";

// 公开整页路由的文档滚动解锁
export { usePublicPageScroll } from "./usePublicPageScroll";

// 标签栏溢出折叠
export { useTagsOverflow, computeCollapsed } from "./useTagsOverflow";
export type { CollapseInput, UseTagsOverflowOptions } from "./useTagsOverflow";
