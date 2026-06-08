<script setup lang="ts">
import { watch } from "vue";
import { usePomoStore } from "@/store/modules/pomo";
import { usePomoAudio } from "@/composables/usePomoAudio";

const store = usePomoStore();
const { tracks, playWhiteNoise, stopWhiteNoise, setVolume } = usePomoAudio();

function toggle(id: string) {
  if (store.settings.whiteNoise === id) {
    store.settings.whiteNoise = null;
    stopWhiteNoise();
  } else {
    store.settings.whiteNoise = id;
    playWhiteNoise(id, store.settings.whiteNoiseVolume);
  }
  store.saveSettings();
}

watch(
  () => store.settings.whiteNoiseVolume,
  (v) => setVolume(v)
);
</script>

<template>
  <div class="noise">
    <div class="tracks">
      <button
        v-for="t in tracks"
        :key="t.id"
        class="track"
        :class="{ on: store.settings.whiteNoise === t.id }"
        @click="toggle(t.id)"
      >
        {{ t.label }}
      </button>
    </div>
    <div v-show="store.settings.whiteNoise" class="volume">
      <span>🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="store.settings.whiteNoiseVolume"
        @input="store.settings.whiteNoiseVolume = +($event.target as HTMLInputElement).value"
        @change="store.saveSettings()"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.noise {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
}
.tracks {
  display: flex;
  gap: $space-sm;
}
.track {
  border: 2px solid $border-light;
  background: $bg-input;
  color: $text-secondary;
  border-radius: $radius-pill;
  padding: 6px 14px;
  font-family: $font;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all $motion-base $motion-ease;
  &.on {
    background: $primary;
    color: #fff;
    border-color: $primary;
    box-shadow: 0 3px 0 0 $primary-active;
  }
}
.volume {
  display: flex;
  align-items: center;
  gap: 6px;
  input {
    accent-color: $primary;
  }
}
</style>
