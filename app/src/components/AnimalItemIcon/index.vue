<template>
  <img
    v-if="url"
    class="animal-item-ico"
    :class="{ 'animal-item-ico--bounce': bounce }"
    :src="url"
    :style="style"
    :alt="alt"
    loading="lazy"
    draggable="false"
  />
  <span v-else-if="!hideEmpty" class="animal-item-ico animal-item-ico--empty" :style="style" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getCachedItemUrl, parseItemId, resolveItemUrl } from "@/utils/animalItemIcon";

defineOptions({
  name: "AnimalItemIcon",
});

const props = withDefaults(
  defineProps<{
    /**
     * 物品图标。接受编号（number）或存储值字符串（`item-42` / 裸数字 `42`）。
     * 解析不出有效编号（含旧体系遗留值）时回退为空占位或不渲染（见 hideEmpty）。
     */
    item: number | string | null | undefined;
    size?: number | string;
    /** hover 弹跳动效 */
    bounce?: boolean;
    /** 无有效图标时不渲染任何占位（导航等场景用，避免空灰框）*/
    hideEmpty?: boolean;
    alt?: string;
  }>(),
  {
    size: 24,
    bounce: false,
    hideEmpty: false,
    alt: "",
  }
);

const resolvedId = computed<number | null>(() => parseItemId(props.item));

// 同步读缓存：二次渲染立即拿到 URL，零延迟无闪烁
const url = ref<string | undefined>(
  resolvedId.value == null ? undefined : getCachedItemUrl(resolvedId.value)
);

watch(
  resolvedId,
  async (id) => {
    if (id == null) {
      url.value = undefined;
      return;
    }
    const cached = getCachedItemUrl(id);
    url.value = cached;
    if (cached) return;
    const got = await resolveItemUrl(id);
    // 防竞态：异步返回时 resolvedId 可能已变，仅在仍指向当前编号时落值
    if (resolvedId.value === id) {
      url.value = got;
    }
  },
  { immediate: true }
);

const style = computed(() => {
  const sz = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: sz,
    height: sz,
    minWidth: sz,
  };
});
</script>

<style scoped lang="scss">
.animal-item-ico {
  display: inline-block;
  object-fit: contain;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animal-item-ico--bounce:hover {
  transform: scale(1.15) translateY(-0.8px);
}

.animal-item-ico--empty {
  border-radius: 6px;
  background: rgba(114, 93, 66, 0.08);
}
</style>
