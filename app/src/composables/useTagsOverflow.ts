import { computed, ref, type ComputedRef, type Ref } from "vue";
import { useResizeObserver } from "@vueuse/core";

/**
 * 溢出计算入参，纯数值，不依赖 DOM
 */
export interface CollapseInput {
  /** 各标签的像素宽度，顺序与标签列表一致 */
  widths: number[];
  /** 标签之间的间距 */
  gap: number;
  /** 可用于摆放标签的宽度 */
  available: number;
  /** 当前激活标签的索引，没有则传 -1 */
  activeIndex: number;
  /** 固定标签（affix）的索引 */
  affixIndexes: number[];
}

/**
 * 计算哪些标签需要折叠。
 *
 * 规则：
 * 1. affix 与 active 是保底标签，优先占用预算；
 * 2. 剩余预算按从左到右分配给非保底标签，第一个装不下的以及其后全部折叠，
 *    不跳着挑选，避免出现「显示 1、3、6」的视觉噪声；
 * 3. 连保底标签都装不下时降级为只保留 active。
 *
 * 每项成本按「宽度 + 一个间距」计算，末位会多算一个间距，
 * 这是刻意保留的保守量，宁可早折叠一个也不要溢出。
 */
export function computeCollapsed(input: CollapseInput): Set<number> {
  const { widths, gap, available, activeIndex, affixIndexes } = input;
  const cost = (index: number) => widths[index] + gap;

  const collapseAllExcept = (kept: Set<number>) => {
    const collapsed = new Set<number>();
    widths.forEach((_, index) => {
      if (!kept.has(index)) {
        collapsed.add(index);
      }
    });
    return collapsed;
  };

  const mustKeep = Array.from(new Set([...affixIndexes, activeIndex]))
    .filter((index) => index >= 0 && index < widths.length)
    .sort((a, b) => a - b);

  let used = mustKeep.reduce((sum, index) => sum + cost(index), 0);

  // 极端窄屏：连保底标签都放不下，只保留 active
  if (used > available) {
    return collapseAllExcept(new Set(activeIndex >= 0 ? [activeIndex] : []));
  }

  const kept = new Set(mustKeep);
  for (let index = 0; index < widths.length; index++) {
    if (kept.has(index)) {
      continue;
    }
    if (used + cost(index) > available) {
      break;
    }
    kept.add(index);
    used += cost(index);
  }

  return collapseAllExcept(kept);
}

export interface UseTagsOverflowOptions {
  /** 标签行容器 */
  rowRef: Ref<HTMLElement | undefined>;
  /** 行首恒定可见的元素（主页链接），不参与折叠 */
  leadRef: Ref<HTMLElement | undefined>;
  /** 各标签 DOM，顺序与标签列表一致 */
  itemEls: Ref<HTMLElement[]>;
  /** 当前激活标签索引 */
  activeIndex: Ref<number>;
  /** 固定标签索引 */
  affixIndexes: Ref<number[]>;
  /** 溢出按钮宽度 + 与标签的间距 */
  reserveWidth: number;
  /** 标签间距，需与样式里的 gap 保持一致 */
  gap: number;
}

/**
 * 监听标签行宽度，计算溢出折叠结果。
 *
 * 溢出按钮只在有溢出时出现，但它自身占宽，构成循环依赖，
 * 因此固定跑两遍：第一遍不留按钮位，若有溢出则扣掉按钮宽度重算一遍。
 * 两遍必然收敛，不会震荡。
 */
export function useTagsOverflow(options: UseTagsOverflowOptions): {
  collapsedIndexes: Ref<Set<number>>;
  hasOverflow: ComputedRef<boolean>;
  update: () => void;
} {
  const { rowRef, leadRef, itemEls, activeIndex, affixIndexes, reserveWidth, gap } = options;

  const collapsedIndexes = ref<Set<number>>(new Set());
  const hasOverflow = computed(() => collapsedIndexes.value.size > 0);

  const update = () => {
    const row = rowRef.value;
    if (!row) {
      collapsedIndexes.value = new Set();
      return;
    }

    const widths = itemEls.value.map((el) => el?.offsetWidth ?? 0);
    const leadWidth = leadRef.value?.offsetWidth ?? 0;
    const base = row.clientWidth - (leadWidth > 0 ? leadWidth + gap : 0);

    const shared = {
      widths,
      gap,
      activeIndex: activeIndex.value,
      affixIndexes: affixIndexes.value,
    };

    const firstPass = computeCollapsed({ ...shared, available: base });
    if (firstPass.size === 0) {
      collapsedIndexes.value = firstPass;
      return;
    }

    collapsedIndexes.value = computeCollapsed({ ...shared, available: base - reserveWidth });
  };

  useResizeObserver(rowRef, update);

  return { collapsedIndexes, hasOverflow, update };
}
