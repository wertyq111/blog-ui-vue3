<template>
  <el-dropdown
    trigger="click"
    size="small"
    class="animal-table-dropdown"
    popper-class="animal-dropdown-popper"
    @command="handleCommand"
    @visible-change="handleVisibleChange"
  >
    <!-- Tag 触发器：状态、优先级 -->
    <span v-if="mode === 'tag'" class="animal-table-trigger-tag" :class="{ 'is-active': isOpen }">
      <AnimalTag :type="tagType">
        {{ label }}
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </AnimalTag>
    </span>

    <!-- Input 触发器：平台 -->
    <span
      v-else
      class="animal-table-trigger-input"
      :class="{
        'is-empty': modelValue == null || modelValue === '',
        'is-active': isOpen,
      }"
    >
      <span class="animal-table-trigger-inner">
        <span class="value-text">{{ label || placeholder }}</span>
        <el-icon
          v-if="clearable && modelValue != null && modelValue !== ''"
          class="clear-icon"
          @click.stop="handleClear"
        >
          <CircleClose />
        </el-icon>
        <el-icon v-else class="arrow-icon"><ArrowDown /></el-icon>
      </span>
    </span>

    <template #dropdown>
      <el-dropdown-menu class="animal-dropdown-menu">
        <el-dropdown-item
          v-for="item in options"
          :key="String(item.value)"
          :command="item.value"
          :disabled="modelValue === item.value"
          :class="{ 'is-active': modelValue === item.value }"
        >
          <span class="option-item-content">
            <AnimalTag v-if="mode === 'tag'" :type="item.type || 'info'" size="small">
              {{ item.label }}
            </AnimalTag>
            <span v-else>{{ item.label }}</span>
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDown, CircleClose } from "@element-plus/icons-vue";
import AnimalTag, { type AnimalTagType } from "@/components/AnimalTag/index.vue";

defineOptions({
  name: "AnimalTableSelect",
  inheritAttrs: false,
});

interface OptionItem {
  value: string | number | null | undefined;
  label: string;
  type?: AnimalTagType;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;
    options: OptionItem[];
    mode?: "tag" | "input";
    placeholder?: string;
    clearable?: boolean;
  }>(),
  {
    mode: "tag",
    placeholder: "请选择",
    clearable: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [value: any];
}>();

const isOpen = ref(false);

const currentOption = computed(() => {
  return props.options.find((o) => o.value === props.modelValue);
});

const label = computed(() => {
  return currentOption.value ? currentOption.value.label : "";
});

const tagType = computed(() => {
  return currentOption.value?.type || "info";
});

function handleCommand(command: any): void {
  emit("update:modelValue", command);
  emit("change", command);
}

function handleClear(): void {
  emit("update:modelValue", null);
  emit("change", null);
}

function handleVisibleChange(visible: boolean): void {
  isOpen.value = visible;
}
</script>

<style lang="scss" scoped>
.animal-table-dropdown {
  display: inline-block;
  vertical-align: middle;
}

.animal-table-trigger-tag {
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;

  .el-icon--right {
    margin-left: 4px;
    font-size: 11px;
    opacity: 0.8;
    transition: transform 0.25s;
  }

  &.is-active,
  &:hover {
    opacity: 0.9;
    .el-icon--right {
      transform: translateY(1px);
    }
  }
}

.animal-table-trigger-input {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 130px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background-color: rgba(25, 200, 185, 0.04);
  border: 1.5px solid var(--ai-border, #e8e2d6);
  cursor: pointer;
  user-select: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  &.is-active,
  &:hover {
    border-color: var(--ai-primary, #19c8b9);
    background-color: rgba(25, 200, 185, 0.08);
    box-shadow: 0 0 0 2px rgba(25, 200, 185, 0.08);
  }

  &.is-empty {
    color: var(--ai-text-3, #c4b89e);
    background-color: rgba(0, 0, 0, 0.01);
  }

  .animal-table-trigger-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .value-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .arrow-icon {
    font-size: 11px;
    margin-left: 6px;
    color: var(--ai-text-2, #9f927d);
    transition: transform 0.25s;
  }

  .clear-icon {
    font-size: 12px;
    margin-left: 6px;
    color: var(--ai-text-3, #c4b89e);
    transition: color 0.2s;

    &:hover {
      color: var(--ai-red, #fc736d);
    }
  }
}

:deep(.el-dropdown-menu__item) {
  font-weight: 700 !important;
}
</style>
