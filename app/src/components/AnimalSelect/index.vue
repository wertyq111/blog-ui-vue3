<!--
  动森风单选下拉（teleport 到 body，弹层不被 modal 的 overflow/clip-path 裁切）。

  作为 animal-island-vue 行内 `Select` 的 drop-in 替代：
    - API 对齐：modelValue:string + options:{key,label}[] + placeholder + disabled
    - 额外能力（默认关闭，按需开启）：clearable 可清空、filterable 可搜索过滤
  视觉与 AnimalMultiSelect 保持一致（同族动森皮肤）。
-->
<template>
  <div ref="wrapperRef" class="asel" :class="{ 'asel--disabled': disabled, 'asel--open': open }">
    <div class="asel__trigger" @click="toggleOpen">
      <span v-if="selectedLabel" class="asel__value">{{ selectedLabel }}</span>
      <span v-else class="asel__placeholder">{{ placeholder }}</span>

      <span
        v-if="clearable && selectedLabel && !disabled"
        class="asel__clear"
        title="清空"
        @click.stop="clearValue"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </span>
      <span class="asel__arrow" :class="{ 'asel__arrow--open': open }">
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
      <transition name="asel-fade">
        <div v-if="open" ref="dropdownRef" class="asel__dropdown" :style="dropdownStyle">
          <div v-if="filterable" class="asel__search">
            <input
              ref="searchRef"
              v-model="searchText"
              class="asel__search-input"
              type="text"
              placeholder="搜索…"
              @click.stop
            />
          </div>
          <div class="asel__list">
            <div
              v-for="opt in filteredOptions"
              :key="opt.key"
              class="asel__option"
              :class="{ 'asel__option--selected': opt.key === model }"
              @click="selectOption(opt.key)"
            >
              <span class="asel__option-label">{{ opt.label }}</span>
              <span v-if="opt.key === model" class="asel__check">
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
            <div v-if="!filteredOptions.length" class="asel__empty">
              {{ options.length ? "无匹配项" : "暂无选项" }}
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
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
    clearable?: boolean;
    filterable?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: "请选择",
    disabled: false,
    clearable: false,
    filterable: false,
  }
);

const emit = defineEmits<{ (e: "change", value: string): void }>();

const model = defineModel<string>({ default: "" });

const wrapperRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const searchRef = ref<HTMLInputElement>();
const open = ref(false);
const searchText = ref("");
const dropdownStyle = ref<Record<string, string>>({});

const selectedLabel = computed(() => props.options.find((o) => o.key === model.value)?.label ?? "");

const filteredOptions = computed(() => {
  if (!props.filterable || !searchText.value.trim()) return props.options;
  const kw = searchText.value.trim().toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(kw));
});

function toggleOpen(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    searchText.value = "";
    nextTick(() => {
      updateDropdownPosition();
      if (props.filterable) searchRef.value?.focus();
    });
  }
}

function selectOption(key: string): void {
  if (props.disabled) return;
  model.value = key;
  emit("change", key);
  open.value = false;
}

function clearValue(): void {
  if (props.disabled) return;
  model.value = "";
  emit("change", "");
}

function updateDropdownPosition(): void {
  const rect = wrapperRef.value?.getBoundingClientRect();
  if (!rect) return;

  const margin = 12; // 距视口边缘留白
  const gap = 6; // 弹层与触发框间距
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;

  // 弹层期望高度（取实际内容高度，封顶 420）
  const desired = Math.min(420, dropdownRef.value?.scrollHeight || 300);
  // 下方放不下且上方空间更大 → 向上展开
  const openUp = spaceBelow < desired && spaceAbove > spaceBelow;
  const maxHeight = Math.min(420, Math.max(160, openUp ? spaceAbove : spaceBelow));

  const style: Record<string, string> = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${maxHeight}px`,
  };
  if (openUp) {
    // 以视口底为锚，向上展开
    style.bottom = `${window.innerHeight - rect.top + gap}px`;
  } else {
    style.top = `${rect.bottom + gap}px`;
  }
  dropdownStyle.value = style;
}

function handleWindowMove(): void {
  if (open.value) updateDropdownPosition();
}

watch(filteredOptions, () => {
  if (open.value) nextTick(updateDropdownPosition);
});

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
.asel {
  position: relative;
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
/* 默认占满容器，但用 :where() 保持零特异度，
   让消费方的宽度类（如 .filter-select{width:240px}）能正常覆盖。
   否则 scoped 的 .asel[data-v] 特异度(0,2,0) 会压过普通类(0,1,0)，
   导致下拉塌缩成内容宽、右侧 √ 被挤掉。 */
:where(.asel) {
  width: 100%;
}

/* 触发框 */
.asel__trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 5px 12px;
  cursor: pointer;
  background: #fdfbf7;
  border: 1.5px solid var(--ai-border);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 2px 6px rgba(121, 79, 39, 0.03);
  transition: all 0.2s;
}
.asel__trigger:hover {
  background: #fffdf7;
  border-color: #f0d49a;
}
.asel--open .asel__trigger {
  background: #fffdf7;
  border-color: #f0d49a;
}
.asel--disabled .asel__trigger {
  cursor: not-allowed;
  background: #f5f5f0;
  opacity: 0.5;
}

.asel__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  color: #725d42;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.asel__placeholder {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text-3);
}

.asel__clear {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #a09080;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.7;
  transition: all 0.15s;
}
.asel__clear:hover {
  color: var(--ai-red);
  background: rgba(252, 115, 109, 0.12);
  opacity: 1;
}

.asel__arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: #a09080;
  transition:
    transform 0.2s,
    color 0.2s;
}
.asel__arrow--open {
  color: #fca130;
  transform: rotate(180deg);
}

/* 下拉面板 */
.asel__dropdown {
  position: fixed;
  z-index: 2600;
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  overflow: hidden;
  background: #fdfbf7;
  border: 2px solid var(--ai-border);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.08);
}

.asel__search {
  flex-shrink: 0;
  padding: 2px 2px 8px;
}
.asel__search-input {
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text);
  background: #fff;
  border: 1.5px solid var(--ai-border);
  border-radius: 999px;
  outline: none;
  transition: border-color 0.15s;
}
.asel__search-input:focus {
  border-color: var(--ai-primary);
}
.asel__search-input::placeholder {
  color: var(--ai-text-3);
  font-weight: 500;
}

.asel__list {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.asel__option {
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
  color: var(--ai-text);
  white-space: nowrap;
  cursor: pointer;
  border-radius: 999px;
  transition:
    background 0.15s,
    color 0.15s,
    padding-left 0.2s,
    font-weight 0.15s;
}
.asel__option:not(.asel__option--selected):hover {
  padding-left: 28px;
  color: #f59b26;
  background: rgba(252, 161, 48, 0.08);
}
.asel__option:not(.asel__option--selected):hover::before {
  position: absolute;
  top: 50%;
  left: 6px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  content: "";
  background: url("../../assets/images/select-cursor.svg") center / contain no-repeat;
  animation: asel-cursor-in 0.3s ease-out forwards;
}
.asel__option--selected {
  color: var(--ai-leaf-d);
  background: rgba(124, 186, 112, 0.12);
}
.asel__check {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: var(--ai-success);
}
.asel__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: var(--ai-text-2);
  text-align: center;
}

/* 展开动画 */
.asel-fade-enter-active,
.asel-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.asel-fade-enter-from,
.asel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes asel-cursor-in {
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
