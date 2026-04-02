<template>
  <section class="system-user-page">
    <header class="system-user-page__hero">
      <div>
        <div class="system-user-page__eyebrow">
          System Management
        </div>
        <h1>用户管理</h1>
        <p>维护后台账号、角色分配与启用状态。未确认的批量删除和隐藏详情页链路仍暂缓迁入。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="system-user-page__filters"
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

      <div class="system-user-page__toolbar">
        <div>
          <h2>用户列表</h2>
          <p>当前按后端已确认接口迁移，性别筛选与批量删除暂不固化为正式契约。</p>
        </div>

        <el-button
          v-if="permission.can('sys:user:add')"
          type="primary"
          @click="page.openCreate()"
        >
          添加用户
        </el-button>
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

      <div class="system-user-page__pagination">
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
.system-user-page {
  display: grid;
  gap: 20px;
}

.system-user-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(239, 246, 255, 0.96) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.system-user-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #0f172a;
}

.system-user-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.system-user-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
}

.system-user-page__filters {
  margin-bottom: 20px;
}

.system-user-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.system-user-page__toolbar h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #0f172a;
}

.system-user-page__toolbar p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.system-user-page__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.system-user-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
