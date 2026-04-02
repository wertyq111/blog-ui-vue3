<template>
  <section class="admin-page system-user-page">
    <AdminPageCard>
      <div class="admin-page__search">
        <el-form
          :inline="true"
          :model="listQuery"
          @submit.prevent
        >
          <el-form-item label="用户账号">
            <el-input
              v-model="listQuery.username"
              clearable
              placeholder="请输入用户账号"
              @keyup.enter="list.search()"
            />
          </el-form-item>

          <el-form-item label="手机号">
            <el-input
              v-model="listQuery.phone"
              clearable
              placeholder="请输入手机号"
              @keyup.enter="list.search()"
            />
          </el-form-item>

          <el-form-item label="状态">
            <el-select
              v-model="listQuery.status"
              clearable
              placeholder="请选择状态"
              style="width: 140px"
            >
              <el-option
                label="在用"
                :value="1"
              />
              <el-option
                label="禁用"
                :value="2"
              />
            </el-select>
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
          title="用户列表"
          description="按账号、手机号和状态筛选后台用户，保留当前已验证的编辑、状态和删除链路。"
        >
          <template #actions>
            <el-button
              v-if="permission.can('sys:user:add')"
              type="primary"
              @click="page.openCreate()"
            >
              添加用户
            </el-button>
          </template>
        </AdminPageToolbar>
      </div>

      <el-table
        v-loading="list.loading"
        :data="list.items"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="username"
          label="用户账号"
          min-width="140"
        />
        <el-table-column
          prop="phone"
          label="手机号"
          min-width="140"
        />
        <el-table-column
          label="角色"
          min-width="180"
        >
          <template #default="{ row }">
            <div class="system-user-page__roles">
              <el-tag
                v-for="role in row.roles || []"
                :key="role.id"
                size="small"
                type="primary"
              >
                {{ role.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="120"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row, row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          min-width="180"
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          min-width="180"
        />
        <el-table-column
          label="操作"
          min-width="220"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:user:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:user:delete')"
              link
              type="danger"
              @click="page.removeUser(row)"
            >
              删除
            </el-button>
            <el-button
              v-if="permission.can('sys:user:resetPwd')"
              link
              type="success"
              @click="page.resetPassword(row)"
            >
              重置密码
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

    <UserEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      :role-options="roleOptions"
      :check-username-available="checkUsernameAvailable"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import type { SystemUserRow } from '@/types/system-user'
import { usePermissionAccess } from '@/composables/use-permission-access'
import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'

import UserEditDialog from './components/UserEditDialog.vue'
import { useUserPage } from './use-user-page'

const page = useUserPage()
const permission = usePermissionAccess()

const { list, dialog, roleOptions, checkUsernameAvailable, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

function handleStatusChange(row: SystemUserRow, value: string | number | boolean): Promise<void> {
  return page.changeStatus(row, Number(value))
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
.system-user-page__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
