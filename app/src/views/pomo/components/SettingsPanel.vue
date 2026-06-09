<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";
import { usePomoStore } from "@/store/modules/pomo";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const store = usePomoStore();

type NumKey = "focusMin" | "shortBreakMin" | "longBreakMin" | "longBreakEvery";
const fields: { key: NumKey; label: string; min: number; max: number }[] = [
  { key: "focusMin", label: "专注时长（分钟）", min: 1, max: 120 },
  { key: "shortBreakMin", label: "短休时长（分钟）", min: 1, max: 60 },
  { key: "longBreakMin", label: "长休时长（分钟）", min: 1, max: 60 },
  { key: "longBreakEvery", label: "每几个番茄后长休", min: 2, max: 8 },
];

function step(key: NumKey, delta: number, min: number, max: number) {
  store.settings[key] = Math.min(max, Math.max(min, store.settings[key] + delta));
}

function close() {
  store.saveSettings();
  emit("close");
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="overlay" @click.self="close">
      <div class="panel">
        <h2 class="title">
          <el-icon :size="22"><Setting /></el-icon>
          <span>设置</span>
        </h2>

        <div v-for="f in fields" :key="f.key" class="field">
          <span class="label">{{ f.label }}</span>
          <div class="stepper">
            <button @click="step(f.key, -1, f.min, f.max)">−</button>
            <span class="val">{{ store.settings[f.key] }}</span>
            <button @click="step(f.key, 1, f.min, f.max)">+</button>
          </div>
        </div>

        <div class="field">
          <span class="label">完成后自动进入下一阶段</span>
          <button
            class="toggle"
            :class="{ on: store.settings.autoStartNext }"
            @click="store.settings.autoStartNext = !store.settings.autoStartNext"
          >
            <span class="knob" />
          </button>
        </div>

        <div class="field">
          <span class="label">提醒音效</span>
          <button
            class="toggle"
            :class="{ on: store.settings.soundOn }"
            @click="store.settings.soundOn = !store.settings.soundOn"
          >
            <span class="knob" />
          </button>
        </div>

        <button class="done" @click="close">完成</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
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
.panel {
  width: 100%;
  max-width: 340px;
  background: $bg;
  border-radius: $radius-lg;
  padding: $space-xl;
  box-shadow: 0 8px 24px 0 rgba(61, 52, 40, 0.18);
  display: flex;
  flex-direction: column;
  gap: $space-md;
}
.title {
  margin: 0 0 $space-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 900;
  color: $text;
}
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-md;
}
.label {
  font-size: 14px;
  font-weight: 600;
  color: $text;
}
.stepper {
  display: flex;
  align-items: center;
  gap: $space-sm;
  button {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: $primary;
    color: #fff;
    font-size: 18px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 3px 0 0 $primary-active;
    transition: all $motion-fast $motion-ease;
    &:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 0 $primary-active;
    }
  }
  .val {
    min-width: 28px;
    text-align: center;
    font-weight: 900;
    font-size: 17px;
    color: $text;
  }
}
.toggle {
  width: 52px;
  height: 30px;
  border-radius: $radius-pill;
  border: none;
  background: $border-light;
  position: relative;
  cursor: pointer;
  transition: background $motion-base $motion-ease;
  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform $motion-base $motion-ease;
  }
  &.on {
    background: $success;
    .knob {
      transform: translateX(22px);
    }
  }
}
.done {
  margin-top: $space-sm;
  border: none;
  border-radius: $radius-pill;
  background: $primary;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 5px 0 0 $primary-active;
  transition: all $motion-fast $motion-ease;
  &:active {
    transform: translateY(4px);
    box-shadow: 0 1px 0 0 $primary-active;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity $motion-base $motion-ease;
  .panel {
    transition: transform $motion-base $motion-ease;
  }
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  .panel {
    transform: scale(0.92);
  }
}
</style>
