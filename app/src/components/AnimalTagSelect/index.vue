<template>
  <div ref="wrapperRef" class="ats" :class="{ 'ats--disabled': disabled, 'ats--open': open }">
    <div class="ats__trigger" @click="focusInput">
      <div class="ats__tags">
        <span v-for="tag in selectedTags" :key="tag.key" class="ats__tag">
          {{ tag.label }}
          <span class="ats__tag-x" @click.stop="removeTag(tag.key)">×</span>
        </span>
        <input
          ref="inputRef"
          v-model.trim="searchText"
          class="ats__input"
          :placeholder="model.length ? '' : placeholder"
          :disabled="disabled"
          @focus="openDropdown"
          @keydown.enter.stop.prevent="handleInputEnter"
          @keydown.delete="handleInputDelete"
        />
      </div>

      <span class="ats__arrow" :class="{ 'ats__arrow--open': open }" @click.stop="toggleOpen">
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
      <transition name="ats-fade">
        <div v-if="open" ref="dropdownRef" class="ats__dropdown" :style="dropdownStyle">
          <!-- 过滤选项列表 -->
          <div
            v-for="opt in filteredOptions"
            :key="opt.id"
            class="ats__option"
            :class="{ 'ats__option--selected': isSelected(opt.id) }"
            @click="selectOption(opt.id)"
          >
            <span class="ats__option-label">{{ opt.name }}</span>
            <span v-if="isSelected(opt.id)" class="ats__check">
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

          <!-- 自定义标签新建栏 -->
          <div
            v-if="searchText && !exactMatchExists"
            class="ats__option ats__option--create"
            @click="createNewTag"
          >
            <span class="ats__option-label">+ 创建新标签 "{{ searchText }}"</span>
          </div>

          <div
            v-if="!filteredOptions.length && (!searchText || exactMatchExists)"
            class="ats__empty"
          >
            暂无匹配标签
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

interface TagItem {
  id: number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    options?: TagItem[];
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: "选择或输入新标签",
    disabled: false,
  }
);

const emit = defineEmits<{ (e: "change", value: Array<number | string>): void }>();

// 兼容 string(新标签) 和 number(已有标签 id)
const model = defineModel<Array<number | string>>({ default: () => [] });

const wrapperRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();
const open = ref(false);
const searchText = ref("");
const dropdownStyle = ref<Record<string, string>>({});

// 解析已选择的项展示，对数字 id 映射为 options 里的 name，对纯文本 string 直接显示
const selectedTags = computed(() => {
  return model.value.map((val) => {
    if (typeof val === "number") {
      const found = props.options.find((o) => o.id === val);
      return { key: val, label: found ? found.name : String(val) };
    }
    return { key: val, label: String(val) };
  });
});

// 根据输入的文本进行实时模糊查询过滤
const filteredOptions = computed(() => {
  const query = searchText.value.toLowerCase();
  if (!query) return props.options;
  return props.options.filter((o) => o.name.toLowerCase().includes(query));
});

// 检查是否存在与输入文字完全相同的现有选项
const exactMatchExists = computed(() => {
  const query = searchText.value.trim().toLowerCase();
  if (!query) return true;
  return props.options.some((o) => o.name.toLowerCase() === query);
});

function isSelected(id: number): boolean {
  return model.value.includes(id);
}

function openDropdown(): void {
  if (props.disabled) return;
  open.value = true;
  nextTick(updateDropdownPosition);
}

function toggleOpen(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    nextTick(updateDropdownPosition);
    inputRef.value?.focus();
  }
}

function focusInput(): void {
  if (props.disabled) return;
  inputRef.value?.focus();
  openDropdown();
}

function selectOption(id: number): void {
  if (props.disabled) return;
  const next = model.value.includes(id)
    ? model.value.filter((val) => val !== id)
    : [...model.value, id];
  model.value = next;
  emit("change", next);
  searchText.value = ""; // 选中后清空
  inputRef.value?.focus();
}

function createNewTag(): void {
  const tagText = searchText.value.trim();
  if (!tagText || props.disabled) return;

  // 查重：避免添加重复的新标签名或已存在的标签 id
  const nameExists = props.options.find((o) => o.name.toLowerCase() === tagText.toLowerCase());
  if (nameExists) {
    // 若存在相同名的现有标签，直接选中它即可
    if (!model.value.includes(nameExists.id)) {
      model.value = [...model.value, nameExists.id];
      emit("change", model.value);
    }
  } else if (!model.value.includes(tagText)) {
    model.value = [...model.value, tagText];
    emit("change", model.value);
  }

  searchText.value = "";
  inputRef.value?.focus();
}

function removeTag(key: number | string): void {
  if (props.disabled) return;
  const next = model.value.filter((val) => val !== key);
  model.value = next;
  emit("change", next);
}

// 键盘处理：回车
function handleInputEnter(): void {
  if (searchText.value) {
    createNewTag();
  }
}

// 键盘处理：回退删除最后一个标签
function handleInputDelete(): void {
  if (!searchText.value && model.value.length) {
    const next = [...model.value];
    next.pop();
    model.value = next;
    emit("change", next);
  }
}

function updateDropdownPosition(): void {
  const rect = wrapperRef.value?.getBoundingClientRect();
  if (!rect) return;

  const maxHeight = Math.max(200, window.innerHeight - rect.bottom - 24);
  dropdownStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom + 6}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.min(360, maxHeight)}px`,
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
.ats {
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

/* 触发输入框 */
.ats__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 5px 12px;
  background: #fdfbf7;
  border: 1.5px solid var(--ai-border);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 2px 6px rgba(121, 79, 39, 0.03);
  cursor: text;
  transition: all 0.2s;
}
.ats__trigger:hover {
  border-color: #f0d49a;
  background: #fffdf7;
}
.ats--open .ats__trigger {
  border-color: #f0d49a;
  background: #fffdf7;
}
.ats--disabled .ats__trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f0;
}

/* 已选标签列表 */
.ats__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
  align-items: center;
}
.ats__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 10px;
  background: var(--ai-leaf-l);
  color: var(--ai-leaf-d);
  border: 1px solid rgba(111, 186, 44, 0.22);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
  cursor: default;
}
.ats__tag-x {
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
.ats__tag-x:hover {
  opacity: 1;
  background: rgba(111, 186, 44, 0.16);
}

/* 极简无边框输入框 */
.ats__input {
  flex: 1;
  min-width: 120px;
  height: 28px;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  color: #725d42;
  font-weight: 500;
  padding: 0;

  &::placeholder {
    color: var(--ai-text-3);
    font-weight: 400;
    font-size: 14px;
  }
}

.ats__arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #a09080;
  cursor: pointer;
  transition:
    transform 0.2s,
    color 0.2s;
}
.ats__arrow--open {
  transform: rotate(180deg);
  color: #fca130;
}

/* 下拉菜单面板（对齐 AnimalMultiSelect 动森风） */
.ats__dropdown {
  position: fixed;
  z-index: 2600;
  padding: 8px 10px;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fdfbf7;
  border: 2px solid var(--ai-border);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.08);
  box-sizing: border-box;
}

.ats__option {
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
.ats__option:not(.ats__option--selected):hover {
  padding-left: 28px;
  color: #f59b26;
  background: rgba(252, 161, 48, 0.08);
}
.ats__option:not(.ats__option--selected):hover::before {
  position: absolute;
  top: 50%;
  left: 6px;
  width: 18px;
  height: 18px;
  pointer-events: none;
  content: "";
  background: url("../../assets/images/select-cursor.svg") center / contain no-repeat;
  animation: ats-cursor-in 0.3s ease-out forwards;
}

.ats__option--selected {
  color: var(--ai-leaf-d);
  background: rgba(124, 186, 112, 0.12);
}

.ats__option--create {
  margin-top: 6px;
  color: var(--ai-leaf-d);
}

.ats__check {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: var(--ai-success);
}

.ats__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: var(--ai-text-2);
  text-align: center;
}

/* 渐入渐出动画 */
.ats-fade-enter-active,
.ats-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.ats-fade-enter-from,
.ats-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes ats-cursor-in {
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
