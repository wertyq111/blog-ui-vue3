<template>
  <div class="ani-empty">
    <div class="ani-empty__wrap" :style="{ width: `${imageSize}px`, height: `${imageSize}px` }">
      <!-- 动森经典红缎带飘空气球礼物盒 SVG -->
      <svg
        class="ani-empty__svg"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 盒子投影 -->
        <ellipse cx="50" cy="90" rx="25" ry="5" fill="rgba(121, 79, 39, 0.15)" />
        <!-- 礼物盒本体 -->
        <rect
          x="22"
          y="45"
          width="56"
          height="40"
          rx="8"
          fill="#f8e7ce"
          stroke="#794f27"
          stroke-width="4"
        />
        <!-- 礼物盒盖子 -->
        <rect
          x="16"
          y="32"
          width="68"
          height="15"
          rx="5"
          fill="#e8cca7"
          stroke="#794f27"
          stroke-width="4"
        />
        <!-- 红色缎带 -->
        <rect
          x="45"
          y="32"
          width="10"
          height="53"
          fill="#fc736d"
          stroke="#794f27"
          stroke-width="4"
        />
        <!-- 盖子上的红色缎带横条 -->
        <rect x="16" y="36" width="68" height="6" fill="#fc736d" />
        <!-- 蝴蝶结左翼 -->
        <path
          d="M50 32 C32 15, 30 35, 50 32 Z"
          fill="#fc736d"
          stroke="#794f27"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <!-- 蝴蝶结右翼 -->
        <path
          d="M50 32 C68 15, 70 35, 50 32 Z"
          fill="#fc736d"
          stroke="#794f27"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <!-- 蝴蝶结中心圆扣 -->
        <circle cx="50" cy="32" r="7" fill="#fc736d" stroke="#794f27" stroke-width="4" />
      </svg>
    </div>
    <p class="ani-empty__text">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    description?: string;
    imageSize?: number;
  }>(),
  {
    description: "暂无数据",
    imageSize: 96,
  }
);
</script>

<style scoped lang="scss">
.ani-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: rgba(248, 244, 236, 0.45);
  border: 2px dashed #e8dcc8;
  border-radius: 20px;
  text-align: center;
  transition: all 0.25s ease;

  &:hover {
    border-color: #d4c4a8;
    background: rgba(248, 244, 236, 0.65);
  }
}

.ani-empty__wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.ani-empty__svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(121, 79, 39, 0.08));
}

.ani-empty__text {
  margin: 0;
  color: var(--ai-text);
  font-family:
    "M PLUS Rounded 1c",
    -apple-system,
    sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.6;
}
</style>
