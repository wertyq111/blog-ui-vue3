<template>
  <section class="workplace-page">
    <header class="workplace-page__hero">
      <div>
        <div class="workplace-page__eyebrow">
          Dashboard / Workplace
        </div>
        <h1>{{ greeting }}，{{ displayName }}</h1>
        <p>Vue3 后台壳层已经接上登录、用户态恢复与动态菜单，后续页面会按迁移波次逐步接入。</p>
      </div>

      <div class="workplace-page__badges">
        <span>Task 4</span>
        <span>Remote-First</span>
        <span>Vue 3 + Pinia + Router 4</span>
      </div>
    </header>

    <section class="workplace-page__grid">
      <article class="workplace-card">
        <div class="workplace-card__label">
          当前用户
        </div>
        <div class="workplace-card__value">
          {{ displayName }}
        </div>
        <p>来自 `/users/getUserInfo`，用于布局头部和权限恢复。</p>
      </article>

      <article class="workplace-card">
        <div class="workplace-card__label">
          菜单节点
        </div>
        <div class="workplace-card__value">
          {{ authStore.menus.length }}
        </div>
        <p>来自 `/index/getMenuList`，后续页面按动态菜单路径逐步接入。</p>
      </article>

      <article class="workplace-card">
        <div class="workplace-card__label">
          权限数
        </div>
        <div class="workplace-card__value">
          {{ authStore.permissions.length }}
        </div>
        <p>当前统一读取 `permissions`，不再沿用 Vue2 双轨权限来源。</p>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const hour = new Date().getHours()
const greeting = computed(() => {
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const displayName = computed(() => authStore.user?.realname || authStore.user?.username || '管理员')
</script>

<style scoped>
.workplace-page {
  display: grid;
  gap: 20px;
}

.workplace-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.2), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(239, 246, 255, 0.96) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.workplace-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(26px, 4vw, 36px);
  color: #0f172a;
}

.workplace-page__hero p {
  margin: 0;
  max-width: 56ch;
  color: #475569;
  line-height: 1.7;
}

.workplace-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
}

.workplace-page__badges {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 10px;
}

.workplace-page__badges span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.92);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 600;
}

.workplace-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.workplace-card {
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.workplace-card__label {
  font-size: 13px;
  color: #64748b;
}

.workplace-card__value {
  margin: 12px 0 10px;
  font-size: 34px;
  font-weight: 700;
  color: #0f172a;
}

.workplace-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
</style>
