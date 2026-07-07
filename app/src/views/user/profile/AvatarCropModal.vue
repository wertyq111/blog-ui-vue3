<template>
  <AdminAnimalModal
    :visible="visible"
    title="裁剪新头像"
    width="720px"
    confirm-text="保存头像"
    cancel-text="取消"
    :confirm-loading="loading"
    :confirm-disabled="!ready"
    :mask-closable="!loading"
    @update:visible="emit('update:visible', $event)"
    @confirm="handleConfirm"
  >
    <div class="avatar-crop-modal">
      <div class="avatar-crop-modal__editor">
        <div
          ref="stageRef"
          class="avatar-crop-stage"
          :class="{ 'is-dragging': dragging }"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
          @pointerup="handlePointerUp"
          @pointercancel="handlePointerUp"
        >
          <img
            v-if="objectUrl"
            class="avatar-crop-stage__image"
            :src="objectUrl"
            alt="待裁剪头像"
            draggable="false"
            :style="imageStyle"
            @load="handleImageLoad"
          />
          <div class="avatar-crop-stage__mask" aria-hidden="true"></div>
          <div class="avatar-crop-stage__ring" aria-hidden="true"></div>
          <span class="avatar-crop-stage__hint">拖动图片调整位置</span>
        </div>

        <div class="avatar-crop-zoom">
          <el-icon aria-hidden="true"><ZoomOut /></el-icon>
          <input
            v-model.number="zoom"
            type="range"
            min="1"
            max="3"
            step="0.01"
            aria-label="头像缩放"
            @input="clampOffset"
          />
          <el-icon aria-hidden="true"><ZoomIn /></el-icon>
        </div>
      </div>

      <aside class="avatar-crop-preview">
        <span class="avatar-crop-preview__eyebrow">LIVE PREVIEW</span>
        <h4>圆形预览</h4>
        <div class="avatar-crop-preview__circle">
          <img
            v-if="objectUrl"
            :src="objectUrl"
            alt="头像裁剪预览"
            draggable="false"
            :style="previewStyle"
          />
        </div>
        <p>保存后将用于顶部工具栏和个人资料。</p>
        <Button type="default" size="small" :disabled="loading" @click="emit('reselect')">
          重新选择
        </Button>
      </aside>
    </div>
  </AdminAnimalModal>
</template>

<script setup lang="ts">
import { Button } from "animal-island-vue";
import { ZoomIn, ZoomOut } from "@element-plus/icons-vue";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";

const STAGE_SIZE = 320;
const CROP_SIZE = 260;
const PREVIEW_SIZE = 108;

const props = defineProps<{
  visible: boolean;
  file: File | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  reselect: [];
  confirm: [payload: { file: File; cropX: number; cropY: number; cropSize: number }];
}>();

const stageRef = ref<HTMLElement>();
const objectUrl = ref("");
const naturalWidth = ref(0);
const naturalHeight = ref(0);
const zoom = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const dragging = ref(false);
const pointerId = ref<number | null>(null);
const pointerStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

const ready = computed(() => Boolean(props.file && naturalWidth.value && naturalHeight.value));
const minimumScale = computed(() => {
  if (!naturalWidth.value || !naturalHeight.value) return 1;
  return Math.max(CROP_SIZE / naturalWidth.value, CROP_SIZE / naturalHeight.value);
});
const scale = computed(() => minimumScale.value * zoom.value);
const renderedWidth = computed(() => naturalWidth.value * scale.value);
const renderedHeight = computed(() => naturalHeight.value * scale.value);

const imageStyle = computed(() => ({
  width: `${renderedWidth.value}px`,
  height: `${renderedHeight.value}px`,
  transform: `translate(-50%, -50%) translate(${offsetX.value}px, ${offsetY.value}px)`,
}));

const previewRatio = PREVIEW_SIZE / CROP_SIZE;
const previewStyle = computed(() => ({
  width: `${renderedWidth.value * previewRatio}px`,
  height: `${renderedHeight.value * previewRatio}px`,
  transform: `translate(-50%, -50%) translate(${offsetX.value * previewRatio}px, ${offsetY.value * previewRatio}px)`,
}));

watch(
  () => props.file,
  async (file) => {
    revokeObjectUrl();
    resetTransform();
    if (!file) return;
    objectUrl.value = URL.createObjectURL(file);
    await nextTick();
  },
  { immediate: true }
);

function resetTransform(): void {
  naturalWidth.value = 0;
  naturalHeight.value = 0;
  zoom.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
}

function revokeObjectUrl(): void {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = "";
  }
}

function handleImageLoad(event: Event): void {
  const image = event.target as HTMLImageElement;
  naturalWidth.value = image.naturalWidth;
  naturalHeight.value = image.naturalHeight;
  clampOffset();
}

function clampOffset(): void {
  const maxX = Math.max(0, (renderedWidth.value - CROP_SIZE) / 2);
  const maxY = Math.max(0, (renderedHeight.value - CROP_SIZE) / 2);
  offsetX.value = Math.min(maxX, Math.max(-maxX, offsetX.value));
  offsetY.value = Math.min(maxY, Math.max(-maxY, offsetY.value));
}

function handlePointerDown(event: PointerEvent): void {
  if (!ready.value || props.loading) return;
  dragging.value = true;
  pointerId.value = event.pointerId;
  pointerStart.value = {
    x: event.clientX,
    y: event.clientY,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
  };
  stageRef.value?.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragging.value || pointerId.value !== event.pointerId) return;
  offsetX.value = pointerStart.value.offsetX + event.clientX - pointerStart.value.x;
  offsetY.value = pointerStart.value.offsetY + event.clientY - pointerStart.value.y;
  clampOffset();
}

function handlePointerUp(event: PointerEvent): void {
  if (pointerId.value !== event.pointerId) return;
  dragging.value = false;
  pointerId.value = null;
  if (stageRef.value?.hasPointerCapture(event.pointerId)) {
    stageRef.value.releasePointerCapture(event.pointerId);
  }
}

function handleConfirm(): void {
  if (!props.file || !ready.value) return;

  const imageLeft = STAGE_SIZE / 2 + offsetX.value - renderedWidth.value / 2;
  const imageTop = STAGE_SIZE / 2 + offsetY.value - renderedHeight.value / 2;
  const cropLeft = (STAGE_SIZE - CROP_SIZE) / 2;
  const cropTop = (STAGE_SIZE - CROP_SIZE) / 2;
  const cropSize = Math.round(CROP_SIZE / scale.value);
  const maxCropX = naturalWidth.value - cropSize;
  const maxCropY = naturalHeight.value - cropSize;

  emit("confirm", {
    file: props.file,
    cropX: Math.min(maxCropX, Math.max(0, Math.round((cropLeft - imageLeft) / scale.value))),
    cropY: Math.min(maxCropY, Math.max(0, Math.round((cropTop - imageTop) / scale.value))),
    cropSize,
  });
}

onBeforeUnmount(revokeObjectUrl);
</script>

<style scoped lang="scss">
.avatar-crop-modal {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 28px;
  align-items: center;
  padding: 4px 2px 8px;
  color: var(--ai-text);
}

.avatar-crop-modal__editor {
  min-width: 0;
}

.avatar-crop-stage {
  position: relative;
  width: 320px;
  max-width: 100%;
  height: 320px;
  margin: 0 auto;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  user-select: none;
  background: var(--ai-bg-2);
  border: 3px solid var(--ai-border);
  border-radius: 24px;
  box-shadow: 0 5px 0 var(--ai-shadow-color);
}

.avatar-crop-stage.is-dragging {
  cursor: grabbing;
}

.avatar-crop-stage__image,
.avatar-crop-preview__circle img {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  pointer-events: none;
  user-select: none;
}

.avatar-crop-stage__mask {
  position: absolute;
  inset: 30px;
  pointer-events: none;
  border-radius: 50%;
  box-shadow: 0 0 0 100px rgba(23, 50, 45, 0.58);
}

.avatar-crop-stage__ring {
  position: absolute;
  inset: 27px;
  pointer-events: none;
  border: 3px solid rgba(255, 255, 255, 0.96);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(32, 201, 178, 0.5);
}

.avatar-crop-stage__hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  z-index: 1;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ai-text-2);
  white-space: nowrap;
  pointer-events: none;
  background: rgba(255, 253, 245, 0.9);
  border-radius: 50px;
  transform: translateX(-50%);
}

.avatar-crop-zoom {
  display: grid;
  grid-template-columns: 24px 1fr 24px;
  gap: 10px;
  align-items: center;
  width: 320px;
  max-width: 100%;
  margin: 22px auto 0;
  color: var(--ai-primary);
}

.avatar-crop-zoom input {
  width: 100%;
  height: 7px;
  accent-color: var(--ai-primary);
  cursor: pointer;
  outline: none;
  background: var(--ai-border);
  border-radius: 50px;
}

.avatar-crop-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px;
  text-align: center;
  background: color-mix(in srgb, var(--ai-primary-bg) 62%, white);
  border: 2px dashed color-mix(in srgb, var(--ai-primary) 42%, transparent);
  border-radius: 22px;
}

.avatar-crop-preview__eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: var(--ai-primary-active);
  letter-spacing: 0.12em;
}

.avatar-crop-preview h4 {
  margin: 6px 0 16px;
  font-size: 16px;
  color: var(--ai-text);
}

.avatar-crop-preview__circle {
  position: relative;
  width: 108px;
  height: 108px;
  overflow: hidden;
  background: var(--ai-bg-2);
  border: 5px solid white;
  border-radius: 50%;
  box-shadow:
    0 0 0 2px var(--ai-primary),
    0 5px 12px rgba(61, 52, 40, 0.16);
}

.avatar-crop-preview p {
  margin: 16px 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ai-text-2);
}

@media (max-width: 680px) {
  .avatar-crop-modal {
    grid-template-columns: 1fr;
  }

  .avatar-crop-preview {
    display: none;
  }
}
</style>
