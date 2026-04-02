<template>
  <section class="member-level-page">
    <header class="member-level-page__hero">
      <div>
        <div class="member-level-page__eyebrow">
          Member Operations
        </div>
        <h1>会员等级</h1>
        <p>维护会员等级名称与排序规则，先收口已验证的查询、增改、单删和批删链路。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="member-level-page__filters"
        @submit.prevent
      >
        <el-form-item label="等级名称">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入等级名称"
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

      <div class="member-level-page__toolbar">
        <div>
          <h2>等级列表</h2>
          <p>当前按远端已确认契约迁移，仅固化会员等级核心信息和删除链路。</p>
        </div>

        <div class="member-level-page__toolbar-actions">
          <el-button
            v-if="permission.can('sys:memberlevel:add')"
            type="primary"
            @click="page.openCreate()"
          >
            添加等级
          </el-button>
          <el-button
            v-if="permission.can('sys:memberlevel:dall')"
            type="danger"
            plain
            @click="page.removeSelectedMemberLevels()"
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
          width="52"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="90"
        />
        <el-table-column
          prop="name"
          label="等级名称"
          min-width="220"
        />
        <el-table-column
          prop="sort"
          label="排序号"
          width="120"
        />
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
          min-width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:memberlevel:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:memberlevel:delete')"
              link
              type="danger"
              @click="page.removeMemberLevel(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="member-level-page__pagination">
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

    <MemberLevelEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'

import MemberLevelEditDialog from './components/MemberLevelEditDialog.vue'
import { useMemberLevelPage } from './use-member-level-page'

const page = useMemberLevelPage()
const permission = usePermissionAccess()

const { list, dialog, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

/** 响应弹窗显隐变化，供关闭弹窗时同步重置页面上的弹窗状态。 */
function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

onMounted(() => {
  void list.reload()
})
</script>

<style scoped>
.member-level-page {
  display: grid;
  gap: 20px;
}

.member-level-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.2), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(236, 253, 245, 0.96) 100%);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.member-level-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #064e3b;
}

.member-level-page__hero p {
  margin: 0;
  max-width: 56ch;
  font-size: 14px;
  line-height: 1.7;
  color: #065f46;
}

.member-level-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #059669;
}

.member-level-page__filters {
  margin-bottom: 8px;
}

.member-level-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.member-level-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.member-level-page__toolbar p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.member-level-page__toolbar-actions {
  display: flex;
  gap: 12px;
}

.member-level-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
