<template>
  <div class="weather-avatar-frame">
    <img class="weather-avatar-frame__avatar" :src="src" :alt="alt" />
    <img class="weather-avatar-frame__ring" :src="weatherAvatarRing" alt="" aria-hidden="true" />
    <Transition name="weather-avatar-badge" mode="out-in">
      <span
        :key="weather"
        class="weather-avatar-frame__badge"
        :class="`weather-avatar-frame__badge--${weatherConfig.motion}`"
        :style="weatherBadgeStyle"
        aria-hidden="true"
      >
        <img
          v-if="weatherConfig.image"
          class="weather-avatar-frame__icon"
          :src="weatherConfig.image"
          alt=""
        />
        <component :is="weatherConfig.icon" v-else class="weather-avatar-frame__icon" />
      </span>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import {
  Cherry,
  Cloudy,
  Drizzling,
  Lightning,
  MoonNight,
  MostlyCloudy,
  PartlyCloudy,
  Pouring,
  Sunny,
  Sunrise,
  WindPower,
} from "@element-plus/icons-vue";
import weatherAvatarRing from "@/assets/dashboard/weather-avatar-ring.png";
import snowflake from "@/assets/dashboard/snowflake.svg";

interface WeatherFrameConfig {
  icon?: Component;
  image?: string;
  background: string;
  color: string;
  motion: string;
}

const props = defineProps<{
  src: string;
  alt: string;
  weather: string;
}>();

const WEATHER_FRAME_CONFIG: Record<string, WeatherFrameConfig> = {
  sunny: { icon: Sunny, background: "#f7cd67", color: "#fffaf0", motion: "pulse" },
  partlyCloudy: {
    icon: PartlyCloudy,
    background: "#7799df",
    color: "#fffaf0",
    motion: "float",
  },
  cloudy: { icon: Cloudy, background: "#91a2bc", color: "#fffaf0", motion: "drift" },
  rain: { icon: Drizzling, background: "#5a9eb8", color: "#fffaf0", motion: "rain" },
  heavyRain: { icon: Pouring, background: "#497da7", color: "#fffaf0", motion: "heavy-rain" },
  thunder: { icon: Lightning, background: "#6870ae", color: "#ffe675", motion: "flash" },
  snow: { image: snowflake, background: "#9bc9dc", color: "#fffaf0", motion: "spin" },
  haze: { icon: MostlyCloudy, background: "#aaa79d", color: "#fffaf0", motion: "haze" },
  wind: { icon: WindPower, background: "#65b9ad", color: "#fffaf0", motion: "wind" },
  rainbow: { icon: Sunrise, background: "#e69aa5", color: "#fffaf0", motion: "shine" },
  sakura: { icon: Cherry, background: "#eda2b7", color: "#fffaf0", motion: "sway" },
  night: { icon: MoonNight, background: "#59699c", color: "#fff1a8", motion: "pulse" },
};

const weatherConfig = computed(
  () => WEATHER_FRAME_CONFIG[props.weather] ?? WEATHER_FRAME_CONFIG.partlyCloudy
);

const weatherBadgeStyle = computed(() => ({
  backgroundColor: weatherConfig.value.background,
  color: weatherConfig.value.color,
}));
</script>

<style lang="scss" scoped>
.weather-avatar-frame {
  // 头像盒与环的尺寸暴露成变量，供窄屏场景按比例缩小（环的偏移校正也跟着按比例算）
  --waf-size: 200px;
  --waf-ring: 290px;

  position: relative;
  flex-shrink: 0;
  width: var(--waf-size);
  height: var(--waf-size);
  isolation: isolate;
}

.weather-avatar-frame__avatar {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.weather-avatar-frame__ring {
  position: absolute;

  // 素材为 512 画布、环体内孔约 336：显示 290px 时内孔约 190px，
  // 内沿压住 200px 头像边缘 ~5px；环心在画布中偏 (254.5, 248)，用 +1/+4px 校正
  top: calc(50% + var(--waf-ring) * 4 / 290);
  left: calc(50% + var(--waf-ring) * 1 / 290);
  z-index: 2;
  width: var(--waf-ring);
  height: var(--waf-ring);
  pointer-events: none;
  user-select: none;
  transform: translate(-50%, -50%);
}

.weather-avatar-frame__badge {
  position: absolute;
  top: -13px;
  right: -18px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  pointer-events: none;
  border: 5px solid var(--ai-bg-card);
  border-radius: 50%;
  box-shadow:
    0 3px 0 var(--ai-shadow-color),
    0 5px 12px rgba(61, 52, 40, 0.16);
  transform-origin: 50% 60%;
}

.weather-avatar-frame__icon {
  width: 30px;
  height: 30px;
}

.weather-avatar-frame__badge--pulse {
  animation: weather-badge-pulse 3.2s ease-in-out infinite;
}

.weather-avatar-frame__badge--float {
  animation: weather-badge-float 2.8s ease-in-out infinite;
}

.weather-avatar-frame__badge--drift {
  animation: weather-badge-drift 3.6s ease-in-out infinite;
}

.weather-avatar-frame__badge--rain {
  animation: weather-badge-rain 2.2s ease-in-out infinite;
}

.weather-avatar-frame__badge--heavy-rain {
  animation: weather-badge-rain 1.35s ease-in-out infinite;
}

.weather-avatar-frame__badge--flash {
  animation: weather-badge-flash 3.4s ease-in-out infinite;
}

.weather-avatar-frame__badge--spin {
  animation: weather-badge-spin 8s linear infinite;
}

.weather-avatar-frame__badge--haze {
  animation: weather-badge-haze 4s ease-in-out infinite;
}

.weather-avatar-frame__badge--wind {
  animation: weather-badge-wind 2.4s ease-in-out infinite;
}

.weather-avatar-frame__badge--shine {
  animation: weather-badge-shine 3.2s ease-in-out infinite;
}

.weather-avatar-frame__badge--sway {
  animation: weather-badge-sway 3s ease-in-out infinite;
}

.weather-avatar-badge-enter-active,
.weather-avatar-badge-leave-active {
  transition:
    opacity 0.25s ease,
    scale 0.25s ease;
}

.weather-avatar-badge-enter-from,
.weather-avatar-badge-leave-to {
  opacity: 0;
  scale: 0.84;
}

@keyframes weather-badge-pulse {
  50% {
    transform: scale(1.05);
  }
}

@keyframes weather-badge-float {
  50% {
    transform: translateY(-3px) rotate(2deg);
  }
}

@keyframes weather-badge-drift {
  50% {
    transform: translateX(3px);
  }
}

@keyframes weather-badge-rain {
  55% {
    transform: translateY(3px);
  }
}

@keyframes weather-badge-flash {
  46%,
  54% {
    filter: brightness(1.4);
    transform: scale(1.05);
  }
}

@keyframes weather-badge-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes weather-badge-haze {
  50% {
    opacity: 0.76;
  }
}

@keyframes weather-badge-wind {
  35% {
    transform: translateX(3px) rotate(3deg);
  }
  70% {
    transform: translateX(-2px) rotate(-2deg);
  }
}

@keyframes weather-badge-shine {
  50% {
    filter: saturate(1.22) brightness(1.1);
    transform: translateY(-2px);
  }
}

@keyframes weather-badge-sway {
  35% {
    transform: rotate(-6deg);
  }
  70% {
    transform: rotate(5deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-avatar-frame__badge {
    animation: none;
  }

  .weather-avatar-badge-enter-active,
  .weather-avatar-badge-leave-active {
    transition: none;
  }
}
</style>
