<template>
  <div ref="iconSelectRef" :style="{ width: props.width }">
    <el-popover :visible="popoverVisible" :width="props.width" placement="bottom-end">
      <template #reference>
        <div @click="popoverVisible = !popoverVisible">
          <slot>
            <el-input v-model="selectedIcon" readonly placeholder="点击选择图标" class="reference">
              <template #prepend>
                <Icon v-if="selectedIcon" :name="resolveAnimalIcon(selectedIcon)" :size="18" />
              </template>
              <template #suffix>
                <!-- 清空按钮 -->
                <el-icon
                  v-if="selectedIcon"
                  style="margin-right: 8px"
                  @click.stop="clearSelectedIcon"
                >
                  <CircleClose />
                </el-icon>

                <el-icon
                  :style="{
                    transform: popoverVisible ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform .5s',
                  }"
                >
                  <ArrowDown @click.stop="togglePopover" />
                </el-icon>
              </template>
            </el-input>
          </slot>
        </div>
      </template>

      <!-- 动森图标选择弹窗 -->
      <div ref="popoverContentRef">
        <el-scrollbar max-height="320px">
          <ul class="icon-grid">
            <li
              v-for="name in ANIMAL_ICON_NAMES"
              :key="name"
              class="icon-grid-item"
              :class="{ 'is-active': selectedIcon === name }"
              @click="selectIcon(name)"
            >
              <el-tooltip :content="name" placement="bottom" effect="light">
                <Icon :name="name" :size="28" />
              </el-tooltip>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "animal-island-vue";
import { ANIMAL_ICON_NAMES, resolveAnimalIcon } from "@/utils/menuAnimalIcon";

const props = defineProps({
  width: {
    type: String,
    default: "320px",
  },
});

const selectedIcon = defineModel<string>("modelValue", { default: "" });

const iconSelectRef = ref();
const popoverContentRef = ref();
const popoverVisible = ref(false);

function selectIcon(name: string) {
  selectedIcon.value = name;
  popoverVisible.value = false;
}

function togglePopover() {
  popoverVisible.value = !popoverVisible.value;
}

function clearSelectedIcon() {
  selectedIcon.value = "";
}

onClickOutside(iconSelectRef, () => (popoverVisible.value = false), {
  ignore: [popoverContentRef],
});
</script>

<style scoped lang="scss">
.reference :deep(.el-input__wrapper),
.reference :deep(.el-input__inner) {
  cursor: pointer;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 4px;
  margin: 0;
  list-style: none;
}

.icon-grid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 5px;
  cursor: pointer;
  border: 2px solid #e8e2d6;
  border-radius: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-grid-item:hover {
  border-color: #19c8b9;
  transform: translateY(-2px);
}

.icon-grid-item.is-active {
  border-color: #19c8b9;
  background: #e6f9f6;
}
</style>
