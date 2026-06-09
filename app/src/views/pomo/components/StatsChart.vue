<script setup lang="ts">
import { computed } from "vue";
import { Histogram } from "@element-plus/icons-vue";
import { usePomoStore } from "@/store/modules/pomo";

const store = usePomoStore();
const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const bars = computed(() => {
  const week = store.week;
  const max = Math.max(1, ...week.map((d) => d.count));
  // week 由后端按本地时区构造，最后一项即今天
  const todayKey = week[week.length - 1]?.day;
  return week.map((d) => ({
    day: d.day,
    count: d.count,
    // 归一到 0~100%，有值至少给 8% 可见高度
    heightPct: d.count === 0 ? 0 : Math.max(8, (d.count / max) * 100),
    weekday: WEEK_LABELS[new Date(d.day + "T00:00:00").getDay()],
    isToday: d.day === todayKey,
  }));
});

const total = computed(() => store.week.reduce((s, d) => s + d.count, 0));
</script>

<template>
  <div class="chart">
    <div class="head">
      <span class="t">
        <el-icon :size="18"><Histogram /></el-icon>
        <span>近 7 天</span>
      </span>
      <span class="sum">
        <span>共 {{ total }}</span>
        <span class="tomato-dot" />
      </span>
    </div>
    <div class="bars">
      <div v-for="b in bars" :key="b.day" class="col">
        <span class="cnt" :class="{ zero: b.count === 0 }">{{ b.count }}</span>
        <div class="bar-track">
          <div class="bar" :class="{ today: b.isToday }" :style="{ height: b.heightPct + '%' }" />
        </div>
        <span class="wd" :class="{ today: b.isToday }">{{ b.weekday }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;
.chart {
  width: 100%;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: $space-md;
  .t {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 900;
    font-size: 16px;
    color: $text;
  }
  .sum {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 700;
    font-size: 13px;
    color: $text-secondary;
  }
}

.tomato-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 30%, rgba(255, 255, 255, 0.7) 0 2px, transparent 3px),
    linear-gradient(145deg, #ff8a76, $tomato 58%, #d94b45);
}
.bars {
  display: flex;
  align-items: flex-end;
  gap: $space-sm;
  height: 140px;
}
.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.cnt {
  font-size: 12px;
  font-weight: 700;
  color: $text;
  margin-bottom: 4px;
  &.zero {
    color: $text-disabled;
  }
}
.bar-track {
  flex: 1;
  width: 60%;
  display: flex;
  align-items: flex-end;
}
.bar {
  width: 100%;
  min-height: 0;
  border-radius: 6px 6px 0 0;
  background: $rest-orange;
  transition: height $motion-slow $motion-ease;
  &.today {
    background: $tomato;
  }
}
.wd {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: $text-secondary;
  &.today {
    color: $tomato;
  }
}
</style>
