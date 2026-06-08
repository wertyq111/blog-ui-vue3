<script setup lang="ts">
import { computed, ref } from "vue";
import { usePomoStore } from "@/store/modules/pomo";
import TimerDial from "./TimerDial.vue";
import FoxButton from "./FoxButton.vue";
import WhiteNoisePlayer from "./WhiteNoisePlayer.vue";
import SettingsPanel from "./SettingsPanel.vue";
import StatsChart from "./StatsChart.vue";

const store = usePomoStore();

const total = computed(() => store.durationSec(store.mode));
const currentTask = computed(() => store.currentTask);

const showSettings = ref(false);
const showStats = ref(false);
</script>

<template>
  <div class="timer-view">
    <div class="current">
      <span v-if="currentTask" class="name">🍅 {{ currentTask.title }}</span>
      <span v-else class="none">未选择任务 · 去清单挑一个吧</span>
    </div>

    <TimerDial :remaining="store.remaining" :total="total" :mode="store.mode" />

    <div class="controls">
      <FoxButton v-if="store.status === 'idle'" type="primary" @click="store.start()">
        ▶ 开始
      </FoxButton>
      <FoxButton v-else-if="store.status === 'running'" type="primary" @click="store.pause()">
        ⏸ 暂停
      </FoxButton>
      <FoxButton v-else type="primary" @click="store.resume()">▶ 继续</FoxButton>
      <FoxButton v-if="store.status !== 'idle'" type="default" @click="store.skip()">
        ⏭ 跳过
      </FoxButton>
    </div>

    <WhiteNoisePlayer />

    <div class="tools">
      <button class="tool" title="设置" @click="showSettings = true">⚙️</button>
      <button class="tool" title="统计" @click="showStats = true">📊</button>
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
  gap: $space-md;
  padding: $space-md $space-md $space-lg;
}

.current {
  min-height: 24px;
  .name {
    font-weight: 700;
    font-size: 15px;
    color: $text;
  }
  .none {
    font-size: 13px;
    color: $text-secondary;
  }
}

.controls {
  display: flex;
  gap: $space-md;
}

.tools {
  display: flex;
  gap: $space-md;
}
.tool {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid $border-light;
  background: $bg-input;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 3px 0 0 $shadow-soft;
  transition: all $motion-fast $motion-ease;
  &:active {
    transform: translateY(3px);
    box-shadow: 0 0 0 0 $shadow-soft;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(60, 50, 35, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: $space-lg;
}
.stats-panel {
  width: 100%;
  max-width: 360px;
  background: $bg;
  border-radius: $radius-lg;
  padding: $space-xl;
  box-shadow: 0 8px 24px 0 rgba(61, 52, 40, 0.18);
  .done {
    margin-top: $space-lg;
    width: 100%;
    border: none;
    border-radius: $radius-pill;
    background: $primary;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 10px;
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
</style>
