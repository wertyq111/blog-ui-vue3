<template>
  <Modal
    :open="visible"
    :width="width"
    :mask-closable="maskClosable"
    :show-footer="showFooter"
    :typewriter="typewriter"
    :class="$attrs.class"
    @update:open="handleOpenChange"
    @close="handleClose"
    @ok="handleConfirm"
  >
    <template #title>
      <slot name="title">{{ title }}</slot>
    </template>

    <div class="admin-animal-modal__content" :class="contentClass">
      <slot />
    </div>

    <template v-if="showFooter" #footer>
      <div class="admin-animal-modal__footer">
        <slot name="footer">
          <Button type="default" @click="handleCancel">{{ cancelText }}</Button>
          <Button
            type="primary"
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </Button>
        </slot>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { Button, Modal } from "animal-island-vue";

withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    width?: string | number;
    maskClosable?: boolean;
    showFooter?: boolean;
    typewriter?: boolean;
    contentClass?: string;
    confirmText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    confirmDisabled?: boolean;
  }>(),
  {
    title: "",
    width: 680,
    maskClosable: true,
    showFooter: true,
    typewriter: false,
    contentClass: "",
    confirmText: "确定",
    cancelText: "取消",
    confirmLoading: false,
    confirmDisabled: false,
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  close: [];
  confirm: [];
}>();

function handleOpenChange(value: boolean): void {
  emit("update:visible", value);
}

function handleClose(): void {
  emit("close");
}

function handleCancel(): void {
  emit("update:visible", false);
  emit("close");
}

function handleConfirm(): void {
  emit("confirm");
}
</script>

<style lang="scss" scoped>
.admin-animal-modal__content {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 8px;

  /* 动森风格浅黄极细滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f7f5ee;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e6dfcb;
    border-radius: 10px;
    &:hover {
      background: #c8bd9f;
    }
  }
}
</style>

