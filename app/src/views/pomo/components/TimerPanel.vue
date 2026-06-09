<script setup lang="ts">
import { computed, ref } from "vue";
import {
  VideoPlay,
  VideoPause,
  DArrowRight,
  Setting,
  Histogram,
} from "@element-plus/icons-vue";
import { usePomoStore } from "@/store/modules/pomo";
import TimerDial from "./TimerDial.vue";
import FoxButton from "./FoxButton.vue";
import WhiteNoisePlayer from "./WhiteNoisePlayer.vue";
import SettingsPanel from "./SettingsPanel.vue";
import StatsChart from "./StatsChart.vue";

const store = usePomoStore();

const total = computed(() => store.durationSec(store.mode));
const currentTask = computed(() => store.currentTask);
const currentLabel = computed(() => {
  if (currentTask.value) {
    return store.status === "running"
      ? `正在专注 · ${currentTask.value.title}`
      : `已选择 · ${currentTask.value.title}`;
  }
  return "未选择任务 · 去清单挑一个吧";
});

const showSettings = ref(false);
const showStats = ref(false);
</script>

<template>
  <div class="timer-view">
    <div class="focus-pill" :class="{ empty: !currentTask }">
      <span class="tomato-mark" />
      <span>{{ currentLabel }}</span>
    </div>

    <TimerDial :remaining="store.remaining" :total="total" :mode="store.mode" />

    <div class="controls">
      <FoxButton
        v-if="store.status === 'idle'"
        type="primary"
        class="main-action"
        @click="store.start()"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>开始</span>
      </FoxButton>
      <FoxButton
        v-else-if="store.status === 'running'"
        type="primary"
        tone="tomato"
        class="main-action"
        @click="store.pause()"
      >
        <el-icon><VideoPause /></el-icon>
        <span>暂停</span>
      </FoxButton>
      <FoxButton v-else type="primary" class="main-action" @click="store.resume()">
        <el-icon><VideoPlay /></el-icon>
        <span>继续</span>
      </FoxButton>
      <FoxButton
        v-if="store.status !== 'idle'"
        type="default"
        class="side-action"
        @click="store.skip()"
      >
        <el-icon><DArrowRight /></el-icon>
        <span>跳过</span>
      </FoxButton>
    </div>

    <WhiteNoisePlayer />

    <div class="tools">
      <button class="tool" title="设置" aria-label="设置" @click="showSettings = true">
        <el-icon :size="20"><Setting /></el-icon>
      </button>
      <button class="tool" title="统计" aria-label="统计" @click="showStats = true">
        <el-icon :size="20"><Histogram /></el-icon>
      </button>
    </div>

    <SettingsPanel :open="showSettings" @close="showSettings = false" />

    <Transition name="modal">
      <div v-if="showStats" class="overlay" @click.self="showStats = false">
        <div class="stats-panel">
          <StatsChart />
          <button class="done" @click="showStats = false">关闭</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.timer-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 6px $space-lg $space-md;
}

.focus-pill {
  width: min(100%, 332px);
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 18px;
  border: 2px solid rgba($shadow-soft, 0.76);
  border-radius: $radius-pill;
  background: rgba(255, 247, 220, 0.72);
  color: $text;
  font-size: 17px;
  font-weight: 900;
  box-shadow: 0 3px 0 0 rgba($shadow-soft, 0.74);
}

.focus-pill.empty {
  color: $text-secondary;
  font-size: 14px;
  font-weight: 700;
}

.tomato-mark {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.72) 0 3px, transparent 4px),
    linear-gradient(145deg, #ff8a76 0%, $tomato 54%, #d94b45 100%);
  box-shadow: inset -2px -3px 0 rgba(133, 46, 35, 0.14);
}

.controls {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-lg;
}

.main-action,
.side-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tools {
  display: flex;
  gap: $space-lg;
}

.tool {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba($border-light, 0.88);
  border-radius: 50%;
  background: $bg-input;
  color: $text-secondary;
  cursor: pointer;
  box-shadow: 0 3px 0 0 $shadow-soft;
  transition: all $motion-fast $motion-ease;

  &:hover {
    color: $text;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 0 0 0 $shadow-soft;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-lg;
  background: rgba(60, 50, 35, 0.32);
}

.stats-panel {
  width: 100%;
  max-width: 360px;
  padding: $space-xl;
  border-radius: $radius-lg;
  background: $bg;
  box-shadow: 0 8px 24px 0 rgba(61, 52, 40, 0.18);

  .done {
    width: 100%;
    margin-top: $space-lg;
    padding: 10px;
    border: none;
    border-radius: $radius-pill;
    background: $primary;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 5px 0 0 $primary-active;

    &:active {
      transform: translateY(4px);
      box-shadow: 0 1px 0 0 $primary-active;
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity $motion-base $motion-ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-height: 780px) {
  .timer-view {
    gap: 10px;
    padding-top: 4px;
  }

  .focus-pill {
    min-height: 42px;
    font-size: 15px;
  }

  .tools {
    gap: $space-md;
  }

  .tool {
    width: 40px;
    height: 40px;
  }
}
</style>
