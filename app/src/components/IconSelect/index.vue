<template>
  <div
    ref="wrapperRef"
    class="ais"
    :class="{ 'ais--disabled': disabled, 'ais--open': open }"
    :style="{ width }"
  >
    <div ref="triggerRef" class="ais__trigger" @click="toggleOpen">
      <span v-if="selectedIcon" class="ais__value">
        <AnimalMenuIcon
          v-if="isMenuVariant && isSemantic(selectedIcon)"
          :name="selectedIcon"
          :size="20"
        />
        <Icon v-else :name="resolveAnimalIcon(selectedIcon)" :size="18" />
        <span class="ais__value-name">{{ selectedIcon }}</span>
      </span>
      <span v-else class="ais__placeholder">点击选择图标</span>

      <span
        v-if="selectedIcon && !disabled"
        class="ais__clear"
        @click.stop="clearSelectedIcon"
      >
        ×
      </span>
      <span class="ais__arrow" :class="{ 'ais__arrow--open': open }">
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
      <transition name="ais-fade">
        <div
          v-if="open"
          ref="dropdownRef"
          class="ais__dropdown"
          :style="dropdownStyle"
        >
          <ul class="ais__grid">
            <li
              v-for="name in iconNames"
              :key="name"
              class="ais__item"
              :class="{ 'is-active': selectedIcon === name }"
              @click="selectIcon(name)"
            >
              <el-tooltip :content="name" placement="bottom" effect="light">
                <AnimalMenuIcon v-if="isMenuVariant" :name="name" :size="30" />
                <Icon v-else :name="name" :size="28" />
              </el-tooltip>
            </li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onClickOutside, useElementBounding } from "@vueuse/core";
import Icon from "@/components/AnimalIcon/index.vue";
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
import { ANIMAL_ICON_NAMES, resolveAnimalIcon } from "@/utils/menuAnimalIcon";
import { MENU_ICON_NAMES, MENU_SEMANTIC_NAMES } from "@/utils/menuSemanticIcon";

const props = withDefaults(
  defineProps<{
    width?: string;
    disabled?: boolean;
    /** props: 动森道具图标集（默认）；menu: 动森语义菜单图标集（多动效） */
    variant?: "props" | "menu";
  }>(),
  {
    width: "100%",
    disabled: false,
    variant: "props",
  }
);

const isMenuVariant = computed(() => props.variant === "menu");
const iconNames = computed(() =>
  isMenuVariant.value ? MENU_ICON_NAMES : ANIMAL_ICON_NAMES
);
function isSemantic(name: string): boolean {
  return MENU_SEMANTIC_NAMES.has(name);
}

const selectedIcon = defineModel<string>("modelValue", { default: "" });

const wrapperRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const open = ref(false);

const { top, left, width: triggerWidth, height: triggerHeight } = useElementBounding(triggerRef);

const dropdownStyle = computed(() => ({
  position: "fixed" as const,
  left: `${left.value}px`,
  width: `${triggerWidth.value}px`,
  top: `${top.value + triggerHeight.value + 6}px`,
  zIndex: 9999,
}));

function toggleOpen(): void {
  open.value = !open.value;
}

function selectIcon(name: string): void {
  selectedIcon.value = name;
  open.value = false;
}

function clearSelectedIcon(): void {
  selectedIcon.value = "";
}

onClickOutside(wrapperRef, (event) => {
  // 同时排除点击 dropdown 本身（因为它被 teleport 到了 body）
  if (dropdownRef.value?.contains(event.target as Node)) return;
  open.value = false;
});
</script>

<style scoped lang="scss">
.ais {
  position: relative;
  font-family: Nunito, "Noto Sans SC", "Zen Maru Gothic", -apple-system, "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  user-select: none;
}

.ais__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 5px 12px;
  background: #fff;
  border: 2px solid #e8dcc8;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.ais__trigger:hover {
  border-color: #d4c4a8;
  background: #fffdf7;
}
.ais--open .ais__trigger {
  border-color: #19c8b9;
  background: #fffdf7;
}
.ais--disabled .ais__trigger {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f0;
  pointer-events: none;
}

.ais__value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  color: #725d42;
  font-weight: 600;
}
.ais__value-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ais__placeholder {
  flex: 1;
  font-size: 14px;
  color: #a09080;
  font-weight: 400;
}
.ais__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #a09080;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.ais__clear:hover {
  color: #725d42;
  background: rgba(114, 93, 66, 0.1);
}
.ais__arrow {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #a09080;
  transition: transform 0.2s, color 0.2s;
}
.ais__arrow--open {
  transform: rotate(180deg);
  color: #19c8b9;
}
</style>

<style lang="scss">
/* 全局样式：因为 Teleport 到 body，scoped 无法命中 */
.ais__dropdown {
  padding: 12px;
  background: #ffeea0;
  border-radius: 22px;
  box-shadow: 0 10px 26px rgba(110, 80, 40, 0.18);
}
.ais__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 240px;
  overflow-y: auto;

  /* 动森风格浅黄极细滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 238, 160, 0.4);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e6c84a;
    border-radius: 10px;
    &:hover {
      background: #d4b030;
    }
  }
}
.ais__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  color: #725d42;
  background: rgba(255, 255, 255, 0.55);
  border: 2px solid transparent;
  border-radius: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.ais__item:hover {
  border-color: #19c8b9;
  transform: translateY(-2px);
}
.ais__item.is-active {
  border-color: #19c8b9;
  background: #e6f9f6;
}

.ais-fade-enter-active,
.ais-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.ais-fade-enter-from,
.ais-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
