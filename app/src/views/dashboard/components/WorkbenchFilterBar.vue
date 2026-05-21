<template>
  <div class="controlbar">
    <div class="cb-group">
      <span class="cb-label">视图</span>
      <div class="seg">
        <button
          v-for="v in views"
          :key="v.k"
          :class="['seg-btn', { 'seg-btn-active': v.k === modelView }]"
          @click="$emit('update:modelView', v.k)"
        >{{ v.l }}</button>
      </div>
    </div>
    <div class="cb-spacer" />
    <span v-if="lastUpdated" class="cb-meta">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>
      </svg>
      最后更新 {{ lastUpdated }}
    </span>
    <div class="cb-group">
      <span class="cb-label">范围</span>
      <div class="seg">
        <button
          v-for="r in ranges"
          :key="r.k"
          :class="['seg-btn', { 'seg-btn-active': r.k === modelRange }]"
          @click="$emit('update:modelRange', r.k)"
        >{{ r.l }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelView: string;
  modelRange: string;
  lastUpdated?: string;
}>();

defineEmits<{
  "update:modelView": [value: string];
  "update:modelRange": [value: string];
}>();

const views = [
  { k: "overview", l: "总览" },
  { k: "platform", l: "平台" },
  { k: "hour", l: "时段" },
  { k: "tag", l: "标签" },
];

const ranges = [
  { k: "all", l: "全部" },
  { k: "30d", l: "30天" },
  { k: "7d", l: "7天" },
  { k: "today", l: "今日" },
];
</script>

<style lang="scss" scoped>
.controlbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cb-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cb-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ai-text-2, #9f927d);
  letter-spacing: 1px;
}

.cb-spacer {
  flex: 1;
}

.cb-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ai-text-2, #9f927d);
}

.seg {
  display: inline-flex;
  padding: 4px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid var(--ai-border, #e8e2d6);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.seg-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  background: transparent;
  color: var(--ai-text-2, #9f927d);
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;

  &:hover {
    color: var(--ai-text, #794f27);
  }

  &.seg-btn-active {
    background: var(--ai-primary-bg, #e6f9f6);
    color: var(--ai-primary-active, #11a89b);
    box-shadow: 0 2px 0 0 var(--ai-shadow-color, #bdaea0);
  }
}

@media (max-width: 768px) {
  .controlbar {
    flex-wrap: wrap;
    border-radius: 18px;
    padding: 10px 14px;
  }
  .cb-spacer { display: none; }
}
</style>
