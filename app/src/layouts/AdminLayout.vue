<template>
  <el-container class="admin-shell">
    <el-aside
      width="240px"
      class="admin-shell__aside"
    >
      <div class="admin-shell__brand">
        Blog Admin Vue3
      </div>
      <el-menu
        :default-active="route.path"
        router
        class="admin-shell__menu"
      >
        <template
          v-for="menu in visibleMenus"
          :key="menu.path"
        >
          <el-sub-menu
            v-if="menu.children.length > 0"
            :index="menu.path"
          >
            <template #title>
              {{ menu.title }}
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else
            :index="menu.path"
          >
            {{ menu.title }}
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-shell__header">
        <div>
          <div class="admin-shell__eyebrow">
            Remote-First Admin Shell
          </div>
          <div class="admin-shell__title">
            {{ pageTitle }}
          </div>
        </div>

        <div class="admin-shell__header-actions">
          <span class="admin-shell__user">
            {{ displayName }}
          </span>
          <el-button
            text
            @click="goDashboard"
          >
            工作台
          </el-button>
          <el-button
            type="primary"
            plain
            @click="logout"
          >
            退出登录
          </el-button>
        </div>
      </el-header>

      <el-main class="admin-shell__main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { BackendMenuNode } from '@/types/menu'
import { useAuthStore } from '@/stores/auth'

interface VisibleMenuNode extends BackendMenuNode {
  children: VisibleMenuNode[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function filterVisibleMenus(nodes: BackendMenuNode[]): VisibleMenuNode[] {
  return nodes
    .filter((node) => node.hide !== true && node.hide !== 1)
    .map((node) => ({
      ...node,
      children: filterVisibleMenus(node.children ?? []),
    }))
}

const visibleMenus = computed(() => filterVisibleMenus(authStore.menus))
const pageTitle = computed(() => String(route.meta.title ?? '管理台'))
const displayName = computed(() => authStore.user?.realname || authStore.user?.username || '管理员')

function goDashboard(): void {
  router.push(authStore.homePath)
}

function logout(): void {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 30%),
    linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
}

.admin-shell__aside {
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.94);
  color: #e2e8f0;
}

.admin-shell__brand {
  padding: 24px 20px 12px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.admin-shell__menu {
  border-right: none;
  background: transparent;
}

.admin-shell__menu :deep(.el-menu-item),
.admin-shell__menu :deep(.el-sub-menu__title) {
  color: #cbd5e1;
}

.admin-shell__menu :deep(.is-active) {
  color: #f8fafc;
  background: rgba(59, 130, 246, 0.28);
}

.admin-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
}

.admin-shell__eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.admin-shell__title {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.admin-shell__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-shell__user {
  font-size: 14px;
  color: #334155;
}

.admin-shell__main {
  padding: 24px;
}
</style>
