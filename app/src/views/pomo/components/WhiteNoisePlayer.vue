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
        <span>{{ t.label }}</span>
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
  width: min(100%, 332px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
}
.tracks {
  width: 100%;
  display: flex;
  gap: $space-sm;
  padding: 10px;
  border: 1px solid rgba($border-light, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.46);
  box-shadow: 0 2px 12px rgba(103, 83, 52, 0.06);
}
.track {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px solid $border-light;
  background: $bg-input;
  color: $text-secondary;
  border-radius: $radius-pill;
  padding: 8px 10px;
  font-family: $font;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition: all $motion-base $motion-ease;
  &.on {
    background: rgba(255, 255, 255, 0.72);
    color: $primary-active;
    border-color: $primary;
    box-shadow: 0 3px 0 0 rgba($primary-active, 0.74);
  }
}
.volume {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-secondary;
  input {
    accent-color: $primary;
  }
}

@media (max-height: 780px) {
  .tracks {
    padding: 8px;
  }

  .track {
    padding: 6px 8px;
    font-size: 13px;
  }
}
</style>
