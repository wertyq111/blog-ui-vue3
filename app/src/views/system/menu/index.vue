<template>
  <section class="system-menu-page">
    <header class="system-menu-page__hero">
      <div>
        <div class="system-menu-page__eyebrow">
          System Management
        </div>
        <h1>菜单管理</h1>
        <p>维护菜单层级、路由入口与权限节点，当前按后端 `menu/*` 实际契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="system-menu-page__filters"
        @submit.prevent
      >
        <el-form-item label="菜单名称">
          <el-input
            v-model="listQuery.title"
            clearable
            placeholder="请输入菜单名称"
            @keyup.enter="list.search()"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="list.search()"
          >
            查询
          </el-button>
          <el-button @click="list.reset()">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="system-menu-page__toolbar">
        <div>
          <h2>菜单列表</h2>
          <p>支持树形层级查看，包含菜单节点与权限节点。</p>
        </div>

        <div class="system-menu-page__toolbar-actions">
          <el-button
            v-if="permission.can('sys:menu:add')"
            type="primary"
            @click="page.openCreate()"
          >
            添加菜单
          </el-button>
          <el-button
            v-if="permission.can('sys:menu:expand')"
            @click="expandAll"
          >
            展开全部
          </el-button>
          <el-button
            v-if="permission.can('sys:menu:collapse')"
            @click="collapseAll"
          >
            折叠全部
          </el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="list.loading.value"
        :data="listItems"
        border
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          label="菜单名称"
          min-width="220"
        >
          <template #default="{ row }">
            <span class="system-menu-page__title">
              <i
                v-if="row.icon"
                :class="row.icon"
              />
              {{ row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="类型"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="resolveTypeTagType(row)"
            >
              {{ resolveTypeTagLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          label="路由地址"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="component"
          label="组件路径"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="permission"
          label="权限标识"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === 1 ? 'success' : 'danger'"
            >
              {{ row.status === 1 ? '在用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="排序"
          width="90"
        />
        <el-table-column
          label="操作"
          min-width="220"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.canAny(['sys:menu:addz', 'sys:menu:addChild'])"
              link
              type="primary"
              @click="page.openCreate(row.id)"
            >
              添加子级
            </el-button>
            <el-button
              v-if="permission.can('sys:menu:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:menu:delete')"
              link
              type="danger"
              @click="page.removeMenu(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      :menu-options="menuOptions"
      :permission-options="permissionOptions"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TableInstance } from 'element-plus'

import type { SystemMenuRow } from '@/types/system-menu'
import { usePermissionAccess } from '@/composables/use-permission-access'

import MenuEditDialog from './components/MenuEditDialog.vue'
import { useMenuPage } from './use-menu-page'

const page = useMenuPage()
const permission = usePermissionAccess()
const tableRef = ref<TableInstance>()

const { list, dialog, menuOptions, permissionOptions, submitDialog } = page
const listQuery = list.query
const listItems = list.items
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

function isExternalLink(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')
}

function resolveTypeTagLabel(row: SystemMenuRow): string {
  if (isExternalLink(row.path)) {
    return '外链'
  }

  if (isExternalLink(row.component)) {
    return '内链'
  }

  return row.type === 1 ? '按钮' : '菜单'
}

function resolveTypeTagType(row: SystemMenuRow): 'warning' | 'success' | 'primary' | 'info' {
  if (isExternalLink(row.path)) {
    return 'warning'
  }

  if (isExternalLink(row.component)) {
    return 'success'
  }

  return row.type === 1 ? 'info' : 'primary'
}

function collectRows(nodes: SystemMenuRow[]): SystemMenuRow[] {
  const rows: SystemMenuRow[] = []

  for (const node of nodes) {
    rows.push(node)

    if (node.children?.length) {
      rows.push(...collectRows(node.children))
    }
  }

  return rows
}

function expandAll(): void {
  const table = tableRef.value

  if (!table) {
    return
  }

  for (const row of collectRows(listItems.value)) {
    table.toggleRowExpansion(row, true)
  }
}

function collapseAll(): void {
  const table = tableRef.value

  if (!table) {
    return
  }

  for (const row of collectRows(listItems.value)) {
    table.toggleRowExpansion(row, false)
  }
}

function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

onMounted(() => {
  list.reload()
})
</script>

<style scoped>
.system-menu-page {
  display: grid;
  gap: 20px;
}

.system-menu-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(239, 246, 255, 0.96) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.system-menu-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #0f172a;
}

.system-menu-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.system-menu-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
}

.system-menu-page__filters {
  margin-bottom: 20px;
}

.system-menu-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.system-menu-page__toolbar h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #0f172a;
}

.system-menu-page__toolbar p {
  margin: 0;
  color: #64748b;
}

.system-menu-page__toolbar-actions {
  display: flex;
  gap: 8px;
}

.system-menu-page__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 992px) {
  .system-menu-page__toolbar {
    flex-direction: column;
  }
}
</style>
