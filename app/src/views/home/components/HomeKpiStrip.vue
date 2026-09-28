<!-- 首页岛民广播 KPI 条 -->
<template>
  <div class="hero-stats">
    <div class="stat">
      <div class="stat-ico stat-ico-mint">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4-12 3 9 3-6 2 5h4"/></svg>
      </div>
      <div>
        <div class="stat-num">{{ stats.words }}<small>字</small></div>
        <div class="stat-lbl">本年累计文字</div>
      </div>
    </div>
    <div class="stat">
      <div class="stat-ico stat-ico-yellow">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h14M4 12h14M4 18h10"/></svg>
      </div>
      <div>
        <div class="stat-num">{{ stats.logs }}<small>条日志</small></div>
        <div class="stat-lbl">累计随笔日志</div>
      </div>
    </div>
    <div class="stat">
      <div class="stat-ico stat-ico-pink">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 2 2 2 2-4z"/></svg>
      </div>
      <div>
        <div class="stat-num">{{ stats.streak }}<small>天</small></div>
        <div class="stat-lbl">最长连续记录</div>
      </div>
    </div>
    <div class="stat">
      <div class="stat-ico stat-ico-blue">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
      </div>
      <div>
        <div class="stat-num">{{ stats.peak }}<small>时段</small></div>
        <div class="stat-lbl">高产量活跃时段</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HomeKpiStrip" });

defineProps<{ stats: { words: string; logs: string; streak: string; peak: string } }>();
</script>

<style scoped lang="scss">
.home-page--night .stat {
  background: #1c274c;
  border-color: #2c3859;
}

.home-page--night .stat-num {
  color: #fffdec;
}

// ============================================
// 6. 岛民广播属性统计面板
// ============================================
.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 28px auto 0;
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

.stat {
  background: var(--ai-btn-face);
  border: 2.5px solid var(--ai-outline);
  border-radius: 24px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 0 var(--ai-btn-shadow);
    border-color: var(--ai-primary);
  }
}

.stat-ico {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.stat-ico-mint { background: #e6f9f6; color: var(--ai-primary-active); }
.stat-ico-yellow { background: #fff2ba; color: #9f7c00; }
.stat-ico-pink { background: #ffe0e6; color: #c05f76; }
.stat-ico-blue { background: #dfe9ff; color: #6a86d8; }

.stat-num {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  color: var(--ai-text);

  small { font-size: 11px; font-weight: 800; color: var(--ai-text-2); margin-left: 2px; }
}

.stat-lbl { font-size: 11px; color: var(--ai-text-2); font-weight: 800; margin-top: 5px; }

@media (max-width: 1200px) {
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
