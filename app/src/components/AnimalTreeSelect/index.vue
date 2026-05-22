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
.ats__trigger:hover {
  border-color: #d4c4a8;
  background: #fffdf7;
}
.ats--open .ats__trigger {
  border-color: #19c8b9;
  background: #fffdf7;
}
.ats--disabled .ats__trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f0;
}

.ats__value {
  flex: 1;
  font-size: 14px;
  color: #725d42;
  font-weight: 600;
}
.ats__placeholder {
  flex: 1;
  font-size: 14px;
  color: #a09080;
  font-weight: 400;
}
.ats__arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #a09080;
  transition:
    transform 0.2s,
    color 0.2s;
}
.ats__arrow--open {
  transform: rotate(180deg);
  color: #19c8b9;
}

.ats__dropdown {
  position: fixed;
  z-index: 2600;
  padding: 10px 0;
  overflow-x: visible;
  overflow-y: auto;
  background: #ffeea0;
  border-radius: 22px;
  box-shadow: 0 10px 26px rgba(110, 80, 40, 0.18);
}
.ats__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #725d42;
}
.ats__option:hover {
  font-weight: 700;
  background: rgba(255, 255, 255, 0.4);
}
.ats__option:hover::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 35px;
  background: url("../../assets/images/select-cursor.svg") center / contain no-repeat;
  animation: ats-cursor-in 0.5s ease-out forwards;
  pointer-events: none;
  z-index: 1;
}
.ats__option--selected {
  font-weight: 700;
  color: #11a89b;
}
.ats__caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #a09080;
  cursor: pointer;
  padding: 0;
  transition: transform 0.18s;
}
.ats__caret.open {
  transform: rotate(90deg);
}
.ats__caret-spacer {
  display: inline-block;
  width: 16px;
  flex-shrink: 0;
}
.ats__option-label {
  flex: 1;
  cursor: pointer;
  white-space: nowrap;
}
.ats__empty {
  padding: 10px 18px;
  font-size: 13px;
  color: #a09080;
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
