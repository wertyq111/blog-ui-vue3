<template>
  <div class="aimg" :style="sizeStyle">
    <img
      v-if="src && !error"
      class="aimg__thumb"
      :src="src"
      :style="{ objectFit: fit }"
      :class="{ 'aimg__thumb--preview': canPreview }"
      loading="lazy"
      @click="openPreview"
      @error="error = true"
    />
    <div v-else class="aimg__error">
      <slot name="error">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </slot>
    </div>

    <Teleport to="body">
      <transition name="aimg-fade">
        <div v-if="viewerVisible" class="aimg-viewer" @click.self="closePreview">
          <span class="aimg-viewer__close" @click="closePreview">×</span>
          <button
            v-if="list.length > 1"
            class="aimg-viewer__nav aimg-viewer__prev"
            @click.stop="prev"
          >
            ‹
          </button>
          <img class="aimg-viewer__img" :src="list[viewerIndex]" />
          <button
            v-if="list.length > 1"
            class="aimg-viewer__nav aimg-viewer__next"
            @click.stop="next"
          >
            ›
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    previewSrcList?: string[];
    fit?: "fill" | "contain" | "cover" | "none" | "scale-down";
    width?: string | number;
    height?: string | number;
  }>(),
  {
    src: "",
    previewSrcList: () => [],
    fit: "cover",
    width: undefined,
    height: undefined,
  }
);

const error = ref(false);
const viewerVisible = ref(false);
const viewerIndex = ref(0);

const list = computed(() =>
  props.previewSrcList.length ? props.previewSrcList : props.src ? [props.src] : []
);
const canPreview = computed(() => list.value.length > 0);

const sizeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width != null)
    style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
  if (props.height != null)
    style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
  return style;
});

function openPreview(): void {
  if (!canPreview.value) return;
  const idx = list.value.indexOf(props.src);
  viewerIndex.value = idx > -1 ? idx : 0;
  viewerVisible.value = true;
}
function closePreview(): void {
  viewerVisible.value = false;
}
function prev(): void {
  viewerIndex.value = (viewerIndex.value - 1 + list.value.length) % list.value.length;
}
function next(): void {
  viewerIndex.value = (viewerIndex.value + 1) % list.value.length;
}
</script>

<style scoped lang="scss">
.aimg {
  position: relative;
  display: inline-flex;
  overflow: hidden;
  border-radius: 10px;
}
.aimg__thumb {
  width: 100%;
  height: 100%;
  display: block;
}
.aimg__thumb--preview {
  cursor: zoom-in;
}
.aimg__error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 40px;
  min-height: 40px;
  color: #c8bd9f;
  background: #f5f1e8;
}
.aimg-viewer {
  position: fixed;
  inset: 0;
  z-index: 3300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(40, 30, 20, 0.78);
}
.aimg-viewer__img {
  max-width: 86vw;
  max-height: 86vh;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}
.aimg-viewer__close {
  position: absolute;
  top: 22px;
  right: 30px;
  font-size: 34px;
  line-height: 1;
  color: #fff;
  cursor: pointer;
}
.aimg-viewer__nav {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  font-size: 32px;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 50%;
  transform: translateY(-50%);
}
.aimg-viewer__prev {
  left: 28px;
}
.aimg-viewer__next {
  right: 28px;
}
.aimg-fade-enter-active,
.aimg-fade-leave-active {
  transition: opacity 0.2s ease;
}
.aimg-fade-enter-from,
.aimg-fade-leave-to {
  opacity: 0;
}
</style>
