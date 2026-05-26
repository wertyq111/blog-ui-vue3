<template>
  <AnimalPopover
    v-model:visible="isOpen"
    trigger="click"
    placement="bottom"
    class="animal-table-dropdown"
  >
    <template #reference>
      <!-- Tag 触发器：状态、优先级 -->
      <span v-if="mode === 'tag'" class="animal-table-trigger-tag" :class="{ 'is-active': isOpen }">
        <AnimalTag :type="tagType">
          {{ label }}
          <svg
            class="trigger-arrow"
            viewBox="0 0 24 24"
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </AnimalTag>
      </span>

      <!-- Input 触发器：平台 -->
      <span
        v-else
        class="animal-table-trigger-input"
        :class="{ 'is-empty': modelValue == null || modelValue === '', 'is-active': isOpen }"
      >
        <span class="animal-table-trigger-inner">
          <span class="value-text">{{ label || placeholder }}</span>
          <span
            v-if="clearable && modelValue != null && modelValue !== ''"
            class="clear-icon"
            @click.stop="handleClear"
          >
            ×
          </span>
          <svg
            v-else
            class="arrow-icon"
            viewBox="0 0 24 24"
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </span>
    </template>

    <div class="animal-dropdown-menu">
      <div
        v-for="item in options"
        :key="String(item.value)"
        class="animal-dropdown-item"
        :class="{ 'is-active': modelValue === item.value }"
        @click="handleCommand(item.value)"
      >
        <AnimalTag v-if="mode === 'tag'" :type="item.type || 'info'" size="small">
          {{ item.label }}
        </AnimalTag>
        <span v-else>{{ item.label }}</span>
      </div>
    </div>
  </AnimalPopover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AnimalPopover from "@/components/AnimalPopover/index.vue";
import AnimalTag, { type AnimalTagType } from "@/components/AnimalTag/index.vue";

defineOptions({ name: "AnimalTableSelect", inheritAttrs: false });

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
  { mode: "tag", placeholder: "请选择", clearable: false }
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
  change: [value: any];
}>();

const isOpen = ref(false);

const currentOption = computed(() => props.options.find((o) => o.value === props.modelValue));
const label = computed(() => (currentOption.value ? currentOption.value.label : ""));
const tagType = computed(() => currentOption.value?.type || "info");

function handleCommand(command: any): void {
  emit("update:modelValue", command);
  emit("change", command);
  isOpen.value = false;
}

function handleClear(): void {
  emit("update:modelValue", null);
  emit("change", null);
}
</script>

<style lang="scss" scoped>
.animal-table-dropdown {
  display: inline-block;
  vertical-align: middle;
}

.animal-table-trigger-tag {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  .trigger-arrow {
    margin-left: 4px;
    opacity: 0.8;
    transition: transform 0.25s;
  }
  &.is-active,
  &:hover {
    opacity: 0.9;
    .trigger-arrow {
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
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text, #794f27);
  cursor: pointer;
  user-select: none;
  background-color: rgba(25, 200, 185, 0.04);
  border: 1.5px solid var(--ai-border, #e8e2d6);
  border-radius: 8px;
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
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .arrow-icon {
    margin-left: 6px;
    color: var(--ai-text-2, #9f927d);
  }
  .clear-icon {
    margin-left: 6px;
    font-size: 14px;
    line-height: 1;
    color: var(--ai-text-3, #c4b89e);
    &:hover {
      color: var(--ai-red, #fc736d);
    }
  }
}

.animal-dropdown-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}
.animal-dropdown-item {
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #794f27;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.15s;

  &:hover {
    background: rgba(252, 161, 48, 0.1);
  }
  &.is-active {
    background: rgba(124, 186, 112, 0.14);
  }
}
</style>
