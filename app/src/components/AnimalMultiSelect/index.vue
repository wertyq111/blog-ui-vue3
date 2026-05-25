<template>
  <div ref="wrapperRef" class="ams" :class="{ 'ams--disabled': disabled, 'ams--open': open }">
    <div class="ams__trigger" @click="toggleOpen">
      <div v-if="selectedOptions.length" class="ams__tags">
        <span v-for="opt in selectedOptions" :key="opt.key" class="ams__tag">
          {{ opt.label }}
          <span class="ams__tag-x" @click.stop="removeTag(opt.key)">×</span>
        </span>
      </div>
      <span v-else class="ams__placeholder">{{ placeholder }}</span>

      <span class="ams__arrow" :class="{ 'ams__arrow--open': open }">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <transition name="ams-fade">
        <div v-if="open" ref="dropdownRef" class="ams__dropdown" :style="dropdownStyle">
          <div
            v-for="opt in options"
            :key="opt.key"
            class="ams__option"
            :class="{ 'ams__option--selected': isSelected(opt.key) }"
            @click="selectOption(opt.key)"
          >
            <span class="ams__option-label">{{ opt.label }}</span>
            <span v-if="isSelected(opt.key)" class="ams__check">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 12l5 5 11-11" />
              </svg>
            </span>
          </div>
          <div v-if="!options.length" class="ams__empty">暂无选项</div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

interface AnimalSelectOption {
  key: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    options?: AnimalSelectOption[];
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: "请选择",
    disabled: false,
  }
);

const emit = defineEmits<{ (e: "change", value: string[]): void }>();

const model = defineModel<string[]>({ default: () => [] });

const wrapperRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const open = ref(false);
const dropdownStyle = ref<Record<string, string>>({});

const selectedOptions = computed(() => props.options.filter((o) => model.value.includes(o.key)));

function isSelected(key: string): boolean {
  return model.value.includes(key);
}

function toggleOpen(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) nextTick(updateDropdownPosition);
}

function selectOption(key: string): void {
  if (props.disabled) return;
  const next = model.value.includes(key)
    ? model.value.filter((k) => k !== key)
    : [...model.value, key];
  model.value = next;
  emit("change", next);
}

function removeTag(key: string): void {
  if (props.disabled) return;
  const next = model.value.filter((k) => k !== key);
  model.value = next;
  emit("change", next);
}

function updateDropdownPosition(): void {
  const rect = wrapperRef.value?.getBoundingClientRect();
  if (!rect) return;

  const maxHeight = Math.max(220, window.innerHeight - rect.bottom - 24);
  dropdownStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom + 6}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.min(420, maxHeight)}px`,
  };
}

function handleWindowMove(): void {
  if (open.value) updateDropdownPosition();
}

window.addEventListener("resize", handleWindowMove);
window.addEventListener("scroll", handleWindowMove, true);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleWindowMove);
  window.removeEventListener("scroll", handleWindowMove, true);
});

onClickOutside(wrapperRef, (event) => {
  if (dropdownRef.value?.contains(event.target as Node)) return;
  open.value = false;
});
</script>

<style scoped lang="scss">
.ams {
  position: relative;
  width: 100%;
  font-family:
    Nunito,
    "Noto Sans SC",
    "Zen Maru Gothic",
    -apple-system,
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    sans-serif;
  user-select: none;
}

/* 触发框 */
.ams__trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 5px 12px;
  cursor: pointer;
  background: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 2px 6px rgba(121, 79, 39, 0.03);
  transition: all 0.2s;
}
.ams__trigger:hover {
  background: #fffdf7;
  border-color: #f0d49a;
}
.ams--open .ams__trigger {
  background: #fffdf7;
  border-color: #f0d49a;
}
.ams--disabled .ams__trigger {
  cursor: not-allowed;
  background: #f5f5f0;
  opacity: 0.5;
}

/* 已选标签 */
.ams__tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}
.ams__tag {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 6px 2px 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
  color: #4a8a36;
  background: #d8ecc6;
  border: 1px solid rgba(111, 186, 44, 0.22);
  border-radius: 999px;
}
.ams__tag-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.7;
  transition: all 0.15s;
}
.ams__tag-x:hover {
  background: rgba(111, 186, 44, 0.16);
  opacity: 1;
}

.ams__placeholder {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #9f927d;
}

.ams__arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: #a09080;
  transition:
    transform 0.2s,
    color 0.2s;
}
.ams__arrow--open {
  color: #fca130;
  transform: rotate(180deg);
}

/* 下拉面板 */
.ams__dropdown {
  position: fixed;
  z-index: 2600;
  padding: 8px 10px;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.08);
}
.ams__option {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 4px 10px;
  margin: 2px 0;
  font-size: 13px;
  font-weight: 700;
  color: #794f27;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 999px;
  transition:
    background 0.15s,
    color 0.15s,
    padding-left 0.2s,
    font-weight 0.15s;
}
.ams__option:not(.ams__option--selected):hover {
  padding-left: 28px;
  color: #f59b26;
  background: rgba(252, 161, 48, 0.08);
}
.ams__option:not(.ams__option--selected):hover::before {
  position: absolute;
  top: 50%;
  left: 6px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  content: "";
  background: url("../../assets/images/select-cursor.svg") center / contain no-repeat;
  animation: ams-cursor-in 0.3s ease-out forwards;
}
.ams__option--selected {
  color: #4a8a36;
  background: rgba(124, 186, 112, 0.12);
}
.ams__check {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: #6fba2c;
}
.ams__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: #9f927d;
  text-align: center;
}

/* 展开动画 */
.ams-fade-enter-active,
.ams-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.ams-fade-enter-from,
.ams-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes ams-cursor-in {
  0% {
    opacity: 0;
    transform: translateY(-50%) translateX(-14px) rotate(-15deg);
  }

  60% {
    opacity: 1;
    transform: translateY(-50%) translateX(4px) rotate(5deg);
  }

  100% {
    opacity: 1;
    transform: translateY(-50%) translateX(0) rotate(0);
  }
}
</style>
