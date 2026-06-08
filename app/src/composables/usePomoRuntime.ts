import { effectScope, watch } from "vue";
import { usePomoStore } from "@/store/modules/pomo";
import { usePomoAudio } from "@/composables/usePomoAudio";
import { usePomoNotify } from "@/composables/usePomoNotify";

// 模块级单例：整个登录会话内只初始化一次，全局驱动计时与完成副作用
let started = false;

export function usePomoRuntime() {
  const store = usePomoStore();
  if (started) return store;
  started = true;

  // detached scope：不绑定到首个调用组件，组件卸载也不会销毁，保证全局常驻
  const scope = effectScope(true);
  scope.run(() => {
    const audio = usePomoAudio();
    const notify = usePomoNotify();

    // 拉取设置/任务/统计
    store.init();

    // 每 250ms 驱动一次（时间戳算法，后台标签页节流也不走时）
    setInterval(() => store.tick(), 250);

    // 完成一段副作用：响铃 + 系统通知
    watch(
      () => store.completionTick,
      () => {
        if (store.settings.soundOn) audio.ding();
        const focusDone = store.lastCompletedMode === "focus";
        notify.notify(
          "🍅 番茄森林",
          focusDone ? "专注完成，休息一下吧 🦊" : "休息结束，继续加油 💪"
        );
      }
    );

    // 首次开始计时请求通知权限
    let permRequested = false;
    watch(
      () => store.status,
      (s) => {
        if (s === "running" && !permRequested) {
          permRequested = true;
          notify.requestPermission();
        }
      }
    );
  });

  return store;
}
