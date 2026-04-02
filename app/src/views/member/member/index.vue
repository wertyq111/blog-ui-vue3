<template>
  <section class="member-page">
    <AdminPageCard>
      <el-form
        :inline="true"
        :model="listQuery"
        class="admin-page__search member-page__filters"
        @submit.prevent
      >
        <el-form-item label="账号">
          <el-input
            v-model="listQuery.username"
            clearable
            placeholder="请输入账号"
            @keyup.enter="list.search()"
          />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input
            v-model="listQuery.nickname"
            clearable
            placeholder="请输入昵称"
            @keyup.enter="list.search()"
          />
        </el-form-item>

        <el-form-item label="性别">
          <el-select
            v-model="listQuery.gender"
            clearable
            placeholder="请选择性别"
            style="width: 140px"
          >
            <el-option
              label="男"
              value="1"
            />
            <el-option
              label="女"
              value="2"
            />
            <el-option
              label="保密"
              value="3"
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

      <AdminPageToolbar
        title="会员列表"
        description="支持按账号、昵称和性别快速筛选。"
      />

      <el-table
        v-loading="list.loading"
        :data="list.items"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="90"
        />
        <el-table-column
          label="会员账号"
          min-width="130"
        >
          <template #default="{ row }">
            {{ row.user?.username || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="realname"
          label="会员姓名"
          min-width="120"
        />
        <el-table-column
          prop="nickname"
          label="会员昵称"
          min-width="120"
        />
        <el-table-column
          label="头像"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-avatar
              :size="28"
              :src="row.avatar || undefined"
            >
              {{ avatarFallback(row.nickname, row.realname) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column
          label="性别"
          width="90"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="genderTagType(row.gender)"
            >
              {{ genderLabel(row.gender) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="设备类型"
          min-width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              type="info"
            >
              {{ deviceLabel(row.device) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="注册来源"
          min-width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              type="success"
            >
              {{ sourceLabel(row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-switch
              :model-value="Number(row.status ?? 1)"
              :active-value="1"
              :inactive-value="2"
              :disabled="!permission.can('sys:member:status')"
              @change="handleStatusChange(row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="注册时间"
          min-width="180"
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          min-width="180"
        />
        <el-table-column
          label="操作"
          min-width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:member:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:member:delete')"
              link
              type="danger"
              @click="page.removeMember(row)"
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

    <MemberEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :submitting="dialogSubmitting"
      :member-level-options="memberLevelOptions"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import type { MemberRow } from '@/types/member'
import { usePermissionAccess } from '@/composables/use-permission-access'
import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'

import MemberEditDialog from './components/MemberEditDialog.vue'
import { useMemberPage } from './use-member-page'

const page = useMemberPage()
const permission = usePermissionAccess()

const { list, dialog, memberLevelOptions, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogSubmitting = dialog.submitting

function avatarFallback(nickname: string | undefined, realname: string | undefined): string {
  const source = nickname || realname || ''
  return source ? source.slice(0, 1).toUpperCase() : '-'
}

function genderLabel(value: number | string | undefined | null): string {
  const gender = Number(value ?? 3)
  return { 1: '男', 2: '女', 3: '保密' }[gender] ?? '保密'
}

function genderTagType(value: number | string | undefined | null): 'success' | 'primary' | 'warning' {
  const gender = Number(value ?? 3)
  switch (gender) {
    case 1:
      return 'success'
    case 2:
      return 'primary'
    default:
      return 'warning'
  }
}

function deviceLabel(value: number | string | undefined | null): string {
  const device = Number(value ?? 5)
  return { 1: '苹果', 2: '安卓', 3: 'WAP站', 4: 'PC站', 5: '后台' }[device] ?? '后台'
}

function sourceLabel(value: number | string | undefined | null): string {
  const source = Number(value ?? 2)
  return { 1: 'APP注册', 2: '小程序注册', 3: '网站注册', 4: 'WAP站注册', 5: '马甲会员' }[source] ?? '小程序注册'
}

function handleStatusChange(row: MemberRow, value: string | number | boolean): Promise<void> {
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
