<script setup lang="ts">
import { ref, computed } from "vue";
import { usePomoRuntime } from "@/composables/usePomoRuntime";
import type { DeerState } from "@/views/pomo/deer";
import TabBar from "./components/TabBar.vue";
import TaskListPanel from "./components/TaskListPanel.vue";
import TimerPanel from "./components/TimerPanel.vue";
import DeerStage from "./components/DeerStage.vue";

type TabKey = "tasks" | "timer";

const store = usePomoRuntime();

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

// 提醒清单 Tab 显示 list 形象；番茄钟 Tab 跟随计时状态（含完成庆祝，store.characterState 已含 celebrate）
const deerState = computed<DeerState>(() =>
  activeTab.value === "tasks" ? "list" : store.characterState
);

defineOptions({ name: "Pomo" });
</script>

<template>
  <div class="pomo-page">
    <div class="device">
      <header class="stage-area">
        <div class="forest-glow" />
        <DeerStage :state="deerState" />
      </header>

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
  max-width: 420px;
  height: min(760px, 88vh);
  display: flex;
  flex-direction: column;
  background: $bg;
  border-radius: 32px;
  overflow: hidden;
  box-shadow:
    0 18px 44px rgba(61, 52, 40, 0.28),
    0 0 0 6px rgba(255, 255, 255, 0.5);
}

.stage-area {
  position: relative;
  flex-shrink: 0;
  height: 278px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: $space-md;
  overflow: visible;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 255, 226, 0.92), transparent 34%),
    radial-gradient(circle at 22% 52%, rgba(137, 186, 89, 0.24), transparent 30%),
    radial-gradient(circle at 82% 48%, rgba(35, 155, 132, 0.16), transparent 28%),
    linear-gradient(180deg, #d8f6ff 0%, #edf6df 74%, rgba(248, 248, 240, 0) 100%);
}

.forest-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.62;
  background:
    radial-gradient(circle at 18% 14%, rgba(112, 160, 59, 0.26) 0 18px, transparent 19px),
    radial-gradient(circle at 80% 18%, rgba(112, 160, 59, 0.22) 0 22px, transparent 23px),
    radial-gradient(circle at 8% 36%, rgba(112, 160, 59, 0.18) 0 16px, transparent 17px),
    radial-gradient(circle at 92% 36%, rgba(112, 160, 59, 0.2) 0 18px, transparent 19px);
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

@media (max-height: 780px) {
  .stage-area {
    height: 244px;
  }
}
</style>
