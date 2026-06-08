<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { usePomoStore } from "@/store/modules/pomo";
import { usePomoAudio } from "@/composables/usePomoAudio";
import { usePomoNotify } from "@/composables/usePomoNotify";
import TabBar from "./components/TabBar.vue";
import TaskListPanel from "./components/TaskListPanel.vue";
import TimerPanel from "./components/TimerPanel.vue";

type TabKey = "tasks" | "timer";

const store = usePomoStore();
const audio = usePomoAudio();
const notify = usePomoNotify();

const activeTab = ref<TabKey>("timer");
const transitionName = ref<"slide-left" | "slide-right">("slide-left");

function changeTab(tab: TabKey) {
  if (tab === activeTab.value) return;
  transitionName.value = tab === "timer" ? "slide-left" : "slide-right";
  activeTab.value = tab;
}

function onStartTask(id: number) {
  store.linkTask(id);
  changeTab("timer");
  if (store.status === "idle") store.start();
}

// 完成一段副作用：响铃 + 通知
watch(
  () => store.completionTick,
  () => {
    if (store.settings.soundOn) audio.ding();
    const focusDone = store.lastCompletedMode === "focus";
    notify.notify("🍅 番茄森林", focusDone ? "专注完成，休息一下吧 🦊" : "休息结束，继续加油 💪");
  }
);

// 首次开始计时请求通知权限
const permRequested = ref(false);
watch(
  () => store.status,
  (s) => {
    if (s === "running" && !permRequested.value) {
      permRequested.value = true;
      notify.requestPermission();
    }
  }
);

let tickId: ReturnType<typeof setInterval> | undefined;
onMounted(async () => {
  await store.init();
  tickId = setInterval(() => store.tick(), 250);
});
onUnmounted(() => {
  if (tickId) clearInterval(tickId);
});

defineOptions({ name: "Pomo" });
</script>

<template>
  <div class="pomo-page">
    <div class="device">
      <main class="view-area">
        <Transition :name="transitionName">
          <TaskListPanel v-if="activeTab === 'tasks'" key="tasks" @start="onStartTask" />
          <TimerPanel v-else key="timer" />
        </Transition>
      </main>
      <TabBar :active="activeTab" @change="changeTab" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "./styles/vars" as *;

.pomo-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-lg;
}

.device {
  position: relative;
  width: 100%;
  max-width: 460px;
  height: min(760px, 86vh);
  display: flex;
  flex-direction: column;
  background: $bg;
  border-radius: 32px;
  overflow: hidden;
  box-shadow:
    0 18px 44px rgba(61, 52, 40, 0.28),
    0 0 0 6px rgba(255, 255, 255, 0.5);
}

.view-area {
  position: relative;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  position: absolute;
  inset: 0;
  transition:
    transform $motion-base $motion-ease,
    opacity $motion-base $motion-ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
