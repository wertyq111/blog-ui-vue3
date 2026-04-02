<template>
  <section class="system-role-page">
    <header class="system-role-page__hero">
      <div>
        <div class="system-role-page__eyebrow">
          System Management
        </div>
        <h1>角色管理</h1>
        <p>维护角色标识、状态和权限绑定，保持与当前后端 `role/*` 契约一致。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="system-role-page__filters"
        @submit.prevent
      >
        <el-form-item label="角色名称">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入角色名称"
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

      <div class="system-role-page__toolbar">
        <div>
          <h2>角色列表</h2>
          <p>支持添加、修改、状态切换、单删/批删和权限分配。</p>
        </div>

        <div class="system-role-page__toolbar-actions">
          <el-button
            v-if="permission.can('sys:role:add')"
            type="primary"
            @click="page.openCreate()"
          >
            添加角色
          </el-button>
          <el-button
            v-if="permission.can('sys:role:dall')"
            type="danger"
            @click="page.removeBatch()"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="list.loading"
        :data="list.items"
        border
        style="width: 100%"
        @selection-change="list.setSelection"
      >
        <el-table-column
          type="selection"
          width="48"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="角色名称"
          min-width="140"
        />
        <el-table-column
          prop="code"
          label="角色标识"
          min-width="140"
        />
        <el-table-column
          label="状态"
          width="120"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="2"
              :disabled="!permission.can('sys:role:status')"
              @change="handleStatusChange(row, row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="排序"
          width="100"
        />
        <el-table-column
          prop="note"
          label="备注"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column
          label="操作"
          min-width="260"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:role:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:role:permission')"
              link
              type="success"
              @click="page.openPermission(row)"
            >
              分配权限
            </el-button>
            <el-button
              v-if="permission.can('sys:role:delete')"
              link
              type="danger"
              @click="page.removeRole(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="system-role-page__pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="listMeta.currentPage"
          :page-size="listMeta.perPage"
          :total="listMeta.total"
          @current-change="list.changePage"
        />
      </div>
    </el-card>

    <RoleEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />

    <RolePermissionDialog
      :visible="permissionVisible"
      :loading="permissionLoading"
      :submitting="permissionSubmitting"
      :tree="permissionTree"
      @update:visible="handlePermissionVisibleChange"
      @submit="page.savePermissions"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import type { SystemRoleRow } from '@/types/system-role'
import { usePermissionAccess } from '@/composables/use-permission-access'

import RoleEditDialog from './components/RoleEditDialog.vue'
import RolePermissionDialog from './components/RolePermissionDialog.vue'
import { useRolePage } from './use-role-page'

const page = useRolePage()
const permission = usePermissionAccess()

const { list, dialog, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting
const permissionVisible = page.permissionVisible
const permissionLoading = page.permissionLoading
const permissionSubmitting = page.permissionSubmitting
const permissionTree = page.permissionTree

function handleStatusChange(row: SystemRoleRow, value: string | number | boolean): Promise<void> {
  return page.changeStatus(row, Number(value))
}

function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

function handlePermissionVisibleChange(visible: boolean): void {
  if (!visible) {
    page.closePermission()
  }
}

onMounted(() => {
  list.reload()
})
</script>

<style scoped>
.system-role-page {
  display: grid;
  gap: 20px;
}

.system-role-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(239, 246, 255, 0.96) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.system-role-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #0f172a;
}

.system-role-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.system-role-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
}

.system-role-page__filters {
  margin-bottom: 20px;
}

.system-role-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.system-role-page__toolbar h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #0f172a;
}

.system-role-page__toolbar p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.system-role-page__toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.system-role-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
