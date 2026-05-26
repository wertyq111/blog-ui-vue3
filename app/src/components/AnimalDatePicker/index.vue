<!-- 动森风日期选择：纯自建(dayjs),无 Element Plus。支持 date/daterange/month/year -->
<template>
  <div
    ref="wrapperRef"
    class="adp"
    :class="{ 'adp--disabled': disabled, 'adp--open': open, 'adp--range': isRange }"
  >
    <div class="adp__trigger" @click="toggleOpen">
      <svg
        class="adp__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
      >
        <rect x="3" y="4" width="18" height="18" rx="4" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <template v-if="isRange">
        <span class="adp__text" :class="{ 'adp__text--ph': !displayStart }">
          {{ displayStart || startPlaceholder }}
        </span>
        <span class="adp__sep">至</span>
        <span class="adp__text" :class="{ 'adp__text--ph': !displayEnd }">
          {{ displayEnd || endPlaceholder }}
        </span>
      </template>
      <span v-else class="adp__text" :class="{ 'adp__text--ph': !displaySingle }">
        {{ displaySingle || placeholder }}
      </span>
      <span v-if="clearable && hasValue" class="adp__clear" @click.stop="clear">×</span>
    </div>

    <Teleport to="body">
      <transition name="adp-fade">
        <div v-if="open" ref="panelRef" class="adp__panel" :style="panelStyle">
          <!-- 头部导航 -->
          <div class="adp__header">
            <span class="adp__nav" @click="navYear(-1)">«</span>
            <span v-if="mode === 'day'" class="adp__nav" @click="navMonth(-1)">‹</span>
            <span class="adp__label">{{ headerLabel }}</span>
            <span v-if="mode === 'day'" class="adp__nav" @click="navMonth(1)">›</span>
            <span class="adp__nav" @click="navYear(1)">»</span>
          </div>

          <!-- 日 -->
          <template v-if="mode === 'day'">
            <div class="adp__weekdays">
              <span v-for="w in weekdays" :key="w">{{ w }}</span>
            </div>
            <div class="adp__days">
              <span
                v-for="cell in dayCells"
                :key="cell.key"
                class="adp__cell"
                :class="{
                  'adp__cell--other': !cell.current,
                  'adp__cell--today': cell.today,
                  'adp__cell--selected': cell.selected,
                  'adp__cell--in-range': cell.inRange,
                  'adp__cell--range-end': cell.rangeEnd,
                }"
                @click="pickDay(cell.date)"
              >
                {{ cell.label }}
              </span>
            </div>
          </template>

          <!-- 月 -->
          <div v-else-if="mode === 'month'" class="adp__grid">
            <span
              v-for="(m, i) in months"
              :key="m"
              class="adp__grid-cell"
              :class="{ 'adp__grid-cell--selected': isMonthSelected(i) }"
              @click="pickMonth(i)"
            >
              {{ m }}
            </span>
          </div>

          <!-- 年 -->
          <div v-else class="adp__grid">
            <span
              v-for="y in yearList"
              :key="y"
              class="adp__grid-cell"
              :class="{ 'adp__grid-cell--selected': isYearSelected(y) }"
              @click="pickYear(y)"
            >
              {{ y }}
            </span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { onClickOutside } from "@vueuse/core";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

defineOptions({ name: "AnimalDatePicker", inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[] | null;
    type?: "date" | "daterange" | "month" | "year";
    placeholder?: string;
    startPlaceholder?: string;
    endPlaceholder?: string;
    valueFormat?: string;
    clearable?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    type: "date",
    placeholder: "请选择",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    valueFormat: undefined,
    clearable: true,
    disabled: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | string[] | null];
  change: [value: string | string[] | null];
}>();

const isRange = computed(() => props.type === "daterange");
const mode = computed<"day" | "month" | "year">(() =>
  props.type === "month" ? "month" : props.type === "year" ? "year" : "day"
);
const format = computed(
  () =>
    props.valueFormat ||
    (props.type === "month" ? "YYYY-MM" : props.type === "year" ? "YYYY" : "YYYY-MM-DD")
);

const wrapperRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const open = ref(false);
const panelStyle = ref<Record<string, string>>({});
const viewDate = ref<Dayjs>(dayjs());

function parse(v?: string | null): Dayjs | null {
  if (!v) return null;
  const d = dayjs(v, format.value, true);
  return d.isValid() ? d : null;
}

const single = computed<Dayjs | null>(() =>
  isRange.value ? null : parse(props.modelValue as string)
);
const rangeStart = computed<Dayjs | null>(() =>
  isRange.value ? parse((props.modelValue as string[])?.[0]) : null
);
const rangeEnd = computed<Dayjs | null>(() =>
  isRange.value ? parse((props.modelValue as string[])?.[1]) : null
);

const displaySingle = computed(() => single.value?.format(format.value) ?? "");
const displayStart = computed(() => rangeStart.value?.format(format.value) ?? "");
const displayEnd = computed(() => rangeEnd.value?.format(format.value) ?? "");
const hasValue = computed(() =>
  isRange.value ? !!(rangeStart.value || rangeEnd.value) : !!single.value
);

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const months = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const headerLabel = computed(() => {
  if (mode.value === "day") return viewDate.value.format("YYYY年 M月");
  if (mode.value === "month") return viewDate.value.format("YYYY年");
  const base = Math.floor(viewDate.value.year() / 10) * 10;
  return `${base} - ${base + 9}`;
});

const yearList = computed(() => {
  const base = Math.floor(viewDate.value.year() / 10) * 10;
  return Array.from({ length: 10 }, (_, i) => base + i);
});

// 范围选择中间态
const pendingStart = ref<Dayjs | null>(null);

const dayCells = computed(() => {
  const first = viewDate.value.startOf("month");
  // 周一为一周起点
  const offset = (first.day() + 6) % 7;
  const start = first.subtract(offset, "day");
  const today = dayjs();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const date = start.add(i, "day");
    const current = date.month() === viewDate.value.month();
    let selected = false;
    let inRange = false;
    let rangeEndFlag = false;
    if (isRange.value) {
      const s = pendingStart.value ?? rangeStart.value;
      const e = pendingStart.value ? null : rangeEnd.value;
      if (s && date.isSame(s, "day")) selected = true;
      if (e && date.isSame(e, "day")) {
        selected = true;
        rangeEndFlag = true;
      }
      if (s && e && date.isAfter(s, "day") && date.isBefore(e, "day")) inRange = true;
    } else if (single.value && date.isSame(single.value, "day")) {
      selected = true;
    }
    cells.push({
      key: date.format("YYYY-MM-DD"),
      label: date.date(),
      date,
      current,
      today: date.isSame(today, "day"),
      selected,
      inRange,
      rangeEnd: rangeEndFlag,
    });
  }
  return cells;
});

function emitValue(v: string | string[] | null): void {
  emit("update:modelValue", v);
  emit("change", v);
}

function toggleOpen(): void {
  if (props.disabled) return;
  open.value = !open.value;
  if (open.value) {
    viewDate.value = single.value ?? rangeStart.value ?? dayjs();
    pendingStart.value = null;
    nextTick(updatePosition);
  }
}

function pickDay(date: Dayjs): void {
  if (isRange.value) {
    if (!pendingStart.value) {
      pendingStart.value = date;
    } else {
      let s = pendingStart.value;
      let e = date;
      if (e.isBefore(s, "day")) [s, e] = [e, s];
      emitValue([s.format(format.value), e.format(format.value)]);
      pendingStart.value = null;
      open.value = false;
    }
  } else {
    emitValue(date.format(format.value));
    open.value = false;
  }
}

function pickMonth(i: number): void {
  const d = viewDate.value.month(i);
  emitValue(d.format(format.value));
  open.value = false;
}
function pickYear(y: number): void {
  const d = viewDate.value.year(y);
  emitValue(d.format(format.value));
  open.value = false;
}

function isMonthSelected(i: number): boolean {
  return (
    !!single.value && single.value.year() === viewDate.value.year() && single.value.month() === i
  );
}
function isYearSelected(y: number): boolean {
  return !!single.value && single.value.year() === y;
}

function navMonth(delta: number): void {
  viewDate.value = viewDate.value.add(delta, "month");
}
function navYear(delta: number): void {
  viewDate.value = viewDate.value.add(delta, "year");
}

function clear(): void {
  emitValue(isRange.value ? null : null);
}

function updatePosition(): void {
  const rect = wrapperRef.value?.getBoundingClientRect();
  if (!rect) return;
  panelStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom + 6}px`,
  };
}

function onScrollResize(): void {
  if (open.value) updatePosition();
}
window.addEventListener("resize", onScrollResize);
window.addEventListener("scroll", onScrollResize, true);
onBeforeUnmount(() => {
  window.removeEventListener("resize", onScrollResize);
  window.removeEventListener("scroll", onScrollResize, true);
});

onClickOutside(wrapperRef, (e) => {
  if (panelRef.value?.contains(e.target as Node)) return;
  open.value = false;
  pendingStart.value = null;
});

watch(open, (v) => {
  if (!v) pendingStart.value = null;
});
</script>

<style scoped lang="scss">
.adp {
  position: relative;
  display: inline-flex;
  width: 100%;
  font-family: inherit;
}
.adp__trigger {
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-height: 40px;
  padding: 0 12px;
  cursor: pointer;
  background: #fdfbf7;
  border: 1.5px solid #e8e2d6;
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
  transition: all 0.2s;
}
.adp__trigger:hover {
  border-color: #f0d49a;
}
.adp--open .adp__trigger {
  border-color: #fca130;
}
.adp--disabled .adp__trigger {
  cursor: not-allowed;
  background: #f5f5f0;
  opacity: 0.55;
}
.adp__icon {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  color: #a09080;
}
.adp__text {
  font-size: 13px;
  font-weight: 600;
  color: #794f27;
}
.adp__text--ph {
  color: #9f927d;
  font-weight: 500;
}
.adp__sep {
  color: #9f927d;
}
.adp--range .adp__text {
  flex: 1;
  text-align: center;
}
.adp__clear {
  margin-left: auto;
  font-size: 15px;
  line-height: 1;
  color: #c8bd9f;
}
.adp__clear:hover {
  color: #fc736d;
}

.adp__panel {
  position: fixed;
  z-index: 3000;
  width: 268px;
  padding: 12px;
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(121, 79, 39, 0.14);
}
.adp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.adp__label {
  flex: 1;
  font-size: 14px;
  font-weight: 800;
  color: #794f27;
  text-align: center;
}
.adp__nav {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font-size: 14px;
  font-weight: 700;
  color: #a0855c;
  cursor: pointer;
  border-radius: 8px;
}
.adp__nav:hover {
  color: #fca130;
  background: rgba(252, 161, 48, 0.1);
}
.adp__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.adp__weekdays span {
  font-size: 12px;
  font-weight: 700;
  color: #b6a98c;
  text-align: center;
}
.adp__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.adp__cell {
  display: grid;
  place-items: center;
  height: 32px;
  font-size: 13px;
  font-weight: 600;
  color: #794f27;
  cursor: pointer;
  border-radius: 9px;
  transition: all 0.12s;
}
.adp__cell:hover {
  background: rgba(252, 161, 48, 0.12);
}
.adp__cell--other {
  color: #cfc3a8;
}
.adp__cell--today {
  color: #fca130;
  font-weight: 800;
}
.adp__cell--in-range {
  background: rgba(124, 186, 112, 0.16);
  border-radius: 0;
}
.adp__cell--selected,
.adp__cell--range-end {
  color: #fff;
  background: #7cba70;
}
.adp__cell--selected:hover {
  background: #6aa85f;
}
.adp__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.adp__grid-cell {
  display: grid;
  place-items: center;
  height: 44px;
  font-size: 13px;
  font-weight: 700;
  color: #794f27;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.12s;
}
.adp__grid-cell:hover {
  background: rgba(252, 161, 48, 0.12);
}
.adp__grid-cell--selected {
  color: #fff;
  background: #7cba70;
}
.adp-fade-enter-active,
.adp-fade-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.adp-fade-enter-from,
.adp-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
