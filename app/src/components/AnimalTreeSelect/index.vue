<template>
  <div ref="wrapperRef" class="ats" :class="{ 'ats--disabled': disabled, 'ats--open': open }">
    <div class="ats__trigger" @click="toggleOpen">
      <span v-if="selectedLabel" class="ats__value">{{ selectedLabel }}</span>
      <span v-else class="ats__placeholder">{{ placeholder }}</span>
      <span class="ats__arrow" :class="{ 'ats__arrow--open': open }">
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
          <div
            v-for="node in flatNodes"
            :key="String(node.value)"
            class="ats__option"
            :class="{ 'ats__option--selected': node.value === model }"
            :style="{ paddingLeft: 14 + node.depth * 18 + 'px' }"
          >
            <button
              v-if="node.hasChildren"
              class="ats__caret"
              :class="{ open: isExpanded(node.value) }"
              type="button"
              @click.stop="toggleExpand(node.value)"
            >
              <svg
                viewBox="0 0 24 24"
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span v-else class="ats__caret-spacer" />
            <span class="ats__option-label" @click="selectNode(node.value)">{{ node.label }}</span>
          </div>
          <div v-if="!flatNodes.length" class="ats__empty">暂无选项</div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { onClickOutside } from "@vueuse/core";

type TreeValue = string | number;
interface TreeOption {
  value: TreeValue;
  label: string;
  children?: TreeOption[];
}
interface FlatNode {
  value: TreeValue;
  label: string;
  depth: number;
  hasChildren: boolean;
}

const props = withDefaults(
  defineProps<{
    options?: TreeOption[];
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    options: () => [],
    placeholder: "请选择",
    disabled: false,
  }
);

const model = defineModel<TreeValue>();

const wrapperRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const open = ref(false);
const expandedMap = ref<Record<string, boolean>>({});
const dropdownStyle = ref<Record<string, string>>({});

function isExpanded(value: TreeValue): boolean {
  return !!expandedMap.value[String(value)];
}
function toggleExpand(value: TreeValue): void {
  expandedMap.value = { ...expandedMap.value, [String(value)]: !isExpanded(value) };
}

function expandAll(nodes: TreeOption[]): void {
  for (const node of nodes) {
    if (node.children?.length) {
      expandedMap.value[String(node.value)] = true;
      expandAll(node.children);
    }
  }
}

const flatNodes = computed<FlatNode[]>(() => {
  const out: FlatNode[] = [];
  const walk = (nodes: TreeOption[], depth: number) => {
    for (const node of nodes) {
      const hasChildren = !!node.children?.length;
      out.push({ value: node.value, label: node.label, depth, hasChildren });
      if (hasChildren && isExpanded(node.value)) {
        walk(node.children!, depth + 1);
      }
    }
  };
  walk(props.options, 0);
  return out;
});

const selectedLabel = computed(() => {
  let found = "";
  const walk = (nodes: TreeOption[]) => {
    for (const node of nodes) {
      if (node.value === model.value) {
        found = node.label;
        return;
      }
      if (node.children?.length) walk(node.children);
    }
  };
  if (model.value != null) walk(props.options);
  return found;
});

function toggleOpen(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    expandAll(props.options);
    nextTick(updateDropdownPosition);
  }
}

function selectNode(value: TreeValue): void {
  if (props.disabled) return;
  model.value = value;
  open.value = false;
}

watch(
  () => props.options,
  (opts) => {
    if (open.value) expandAll(opts);
  }
);

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

.ats__trigger {
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
.ats__trigger:hover {
  background: #fffdf7;
  border-color: #f0d49a;
}
.ats--open .ats__trigger {
  background: #fffdf7;
  border-color: #f0d49a;
}
.ats--disabled .ats__trigger {
  cursor: not-allowed;
  background: #f5f5f0;
  opacity: 0.5;
}

.ats__value {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #725d42;
}
.ats__placeholder {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text-3);
}
.ats__arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  color: #a09080;
  transition:
    transform 0.2s,
    color 0.2s;
}
.ats__arrow--open {
  color: #fca130;
  transform: rotate(180deg);
}

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
}
.ats__option {
  position: relative;
  display: flex;
  gap: 4px;
  align-items: center;
  min-height: 34px;
  padding-top: 4px !important;
  padding-right: 10px !important;
  padding-bottom: 4px !important;
  margin: 2px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ai-text);
}
.ats__option--selected {
  color: var(--ai-primary-active);
}
.ats__caret {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  color: #a09080;
  cursor: pointer;
  background: transparent;
  border: 0;
  transition: transform 0.18s;
}
.ats__caret.open {
  color: #fca130;
  transform: rotate(90deg);
}
.ats__caret-spacer {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
}
.ats__option-label {
  flex: 1;
  min-height: 28px;
  padding: 5px 12px;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 999px;
  transition:
    background 0.15s,
    color 0.15s,
    padding-left 0.2s;
}
.ats__option:not(.ats__option--selected):hover .ats__option-label {
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
.ats__option--selected .ats__option-label {
  color: var(--ai-leaf-d);
  background: rgba(124, 186, 112, 0.12);
}
.ats__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: var(--ai-text-2);
  text-align: center;
}

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
