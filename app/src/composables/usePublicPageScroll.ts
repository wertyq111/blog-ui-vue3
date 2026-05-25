import { onMounted, onUnmounted } from "vue";

const CLASS_NAME = "public-page-scroll";

/**
 * 公开整页路由（首页/登录/404）依赖文档级滚动，
 * 而 index.html 的全局 reset 给 html/body/#app 设了 overflow:hidden（为开屏 loading 服务）。
 * 在这些页面挂载期间给 <html> 加标记类，配合全局样式恢复文档滚动；卸载时移除，避免影响后台布局。
 */
export function usePublicPageScroll() {
  onMounted(() => {
    document.documentElement.classList.add(CLASS_NAME);
  });
  onUnmounted(() => {
    document.documentElement.classList.remove(CLASS_NAME);
  });
}
