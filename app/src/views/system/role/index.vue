<template>
  <section class="admin-page system-role-page">
    <AdminPageCard>
      <div class="admin-page__search">
        <el-form
          :inline="true"
          :model="listQuery"
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
      </div>

      <div class="admin-page__toolbar">
        <AdminPageToolbar
          title="角色列表"
          description="按角色名称筛选，支持添加、编辑、权限分配、状态切换和删除。"
        >
          <template #actions>
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
          </template>
        </AdminPageToolbar>
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

      <div class="admin-page__pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="listMeta.currentPage"
          :page-size="listMeta.perPage"
          :total="listMeta.total"
          @current-change="list.changePage"
        />
      </div>
    </AdminPageCard>

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
import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'

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
