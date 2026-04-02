<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :lock-scroll="lockScroll"
    :class="customClass"
    :before-close="beforeClose"
    :close-on-click-modal="closeOnClickModal"
    :modal="modal"
    :append-to-body="appendToBody"
    :modal-append-to-body="modalAppendToBody"
    v-bind="$attrs"
    @update:model-value="handleUpdateVisible"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>
    <slot />
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AppDialog',
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    visible?: boolean
    title?: string
    width?: string | number
    destroyOnClose?: boolean
    lockScroll?: boolean
    customClass?: string
    beforeClose?: ((done: () => void) => void) | null
    closeOnClickModal?: boolean
    modal?: boolean
    appendToBody?: boolean
    modalAppendToBody?: boolean
  }>(),
  {
    visible: false,
    title: '',
    width: '50%',
    destroyOnClose: false,
    lockScroll: true,
    customClass: '',
    beforeClose: null,
    closeOnClickModal: true,
    modal: true,
    appendToBody: true,
    modalAppendToBody: true,
  },
)

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
}>()

function handleUpdateVisible(value: boolean): void {
  emit('update:visible', value)
}
</script>
