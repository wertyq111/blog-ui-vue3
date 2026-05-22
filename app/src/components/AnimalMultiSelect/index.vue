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
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 5px 12px;
  background: #fff;
  border: 2px solid #e8dcc8;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.ams__trigger:hover {
  border-color: #d4c4a8;
  background: #fffdf7;
}
.ams--open .ams__trigger {
  border-color: #19c8b9;
  background: #fffdf7;
}
.ams--disabled .ams__trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f0;
}

/* 已选标签 */
.ams__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.ams__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 10px;
  background: #e6f9f6;
  color: #11a89b;
  border: 1.5px solid #b8ece6;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
}
.ams__tag-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.15s;
}
.ams__tag-x:hover {
  opacity: 1;
  background: rgba(17, 168, 155, 0.15);
}

.ams__placeholder {
  flex: 1;
  font-size: 14px;
  color: #a09080;
  font-weight: 400;
}

.ams__arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #a09080;
  transition:
    transform 0.2s,
    color 0.2s;
}
.ams__arrow--open {
  transform: rotate(180deg);
  color: #19c8b9;
}

/* 下拉面板 */
.ams__dropdown {
  position: fixed;
  z-index: 2600;
  padding: 10px 0;
  overflow-x: visible;
  overflow-y: auto;
  background: #ffeea0;
  border-radius: 22px;
  box-shadow: 0 10px 26px rgba(110, 80, 40, 0.18);
}
.ams__option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #725d42;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    font-weight 0.15s;
}
.ams__option:hover {
  font-weight: 700;
  background: rgba(255, 255, 255, 0.4);
}
.ams__option:hover::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 35px;
  background: url("../../assets/images/select-cursor.svg") center / contain no-repeat;
  animation: ams-cursor-in 0.5s ease-out forwards;
  pointer-events: none;
  z-index: 1;
}
.ams__option--selected {
  font-weight: 700;
  color: #11a89b;
}
.ams__check {
  display: flex;
  align-items: center;
  color: #19c8b9;
  flex-shrink: 0;
}
.ams__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: #a09080;
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
    transform: translateY(-50%) translateX(-20px) rotate(-15deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-50%) translateX(5px) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) translateX(0) rotate(0);
  }
}
</style>
