<template>
  <div class="input-tag">
    <AnimalTag
      v-for="tag in tags"
      :key="tag"
      :type="config.tagAttrs?.type || 'primary'"
      class="input-tag__item"
    >
      {{ tag }}
      <span class="input-tag__close" @click="handleClose(tag)">×</span>
    </AnimalTag>

    <input
      v-if="inputVisible"
      ref="inputRef"
      v-model.trim="inputValue"
      class="input-tag__input"
      @keyup.enter.stop.prevent="handleInputConfirm"
      @blur.stop.prevent="handleInputConfirm"
    />
    <Button v-else type="dashed" size="small" v-bind="buttonBind" @click="showInput">
      {{ config.buttonAttrs?.btnText || "+ New Tag" }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { Button } from "animal-island-vue";
import AnimalTag from "@/components/AnimalTag/index.vue";

const inputValue = ref("");
const inputVisible = ref(false);
const inputRef = ref<HTMLInputElement>();

const tags = defineModel<string[]>();

const props = withDefaults(
  defineProps<{
    config?: {
      buttonAttrs?: Record<string, any>;
      inputAttrs?: Record<string, any>;
      tagAttrs?: Record<string, any>;
    };
  }>(),
  { config: () => ({ buttonAttrs: {}, inputAttrs: {}, tagAttrs: {} }) }
);

// 透传按钮属性时剔除自定义的 btnText
const buttonBind = computed(() => {
  const { btnText, ...rest } = props.config.buttonAttrs || {};
  void btnText;
  return rest;
});

const handleClose = (tag: string) => {
  if (tags.value) tags.value = tags.value.filter((t) => t !== tag);
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => inputRef.value?.focus());
};

const handleInputConfirm = () => {
  if (inputValue.value) tags.value = [...(tags.value || []), inputValue.value];
  inputVisible.value = false;
  inputValue.value = "";
};
</script>

<style scoped lang="scss">
.input-tag {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.input-tag__item {
  gap: 2px;
}
.input-tag__close {
  margin-left: 2px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
}
.input-tag__close:hover {
  opacity: 1;
}
.input-tag__input {
  min-width: 100px;
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #794f27;
  background: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.input-tag__input:focus {
  border-color: #fca130;
}
</style>
