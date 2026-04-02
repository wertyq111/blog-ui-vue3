<template>
  <section class="notebook-label-page">
    <header class="notebook-label-page__hero">
      <div>
        <div class="notebook-label-page__eyebrow">
          Mini Program Console
        </div>
        <h1>文章标签</h1>
        <p>维护文章标签和所属分类关系，当前按后端 `labels/*` 与 `categories/list` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="notebook-label-page__filters"
        @submit.prevent
      >
        <el-form-item label="标签名">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入标签名"
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

      <div class="notebook-label-page__toolbar">
        <div>
          <h2>标签列表</h2>
          <p>支持按标签筛选，并维护标签与分类归属。</p>
        </div>

        <el-button
          v-if="permission.can('sys:notebook-label:add')"
          type="primary"
          :loading="categoryLoading"
          @click="page.openCreate()"
        >
          添加
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
          label="所属分类"
          min-width="180"
        >
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="标签名"
          min-width="160"
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="220"
        />
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:notebook-label:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:notebook-label:delete')"
              link
              type="danger"
              @click="page.removeLabel(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="notebook-label-page__pagination">
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

    <NotebookLabelEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      :category-options="categoryOptions"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'

import NotebookLabelEditDialog from './components/NotebookLabelEditDialog.vue'
import { useNotebookLabelPage } from './use-notebook-label-page'

const page = useNotebookLabelPage()
const permission = usePermissionAccess()
const { list, dialog, categoryOptions, categoryLoading, submitDialog } = page

const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

/** 处理弹窗显隐变化，关闭时清理弹窗状态。 */
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
.notebook-label-page {
  display: grid;
  gap: 20px;
}

.notebook-label-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(236, 72, 153, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(253, 242, 248, 0.96) 100%);
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.notebook-label-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #831843;
}

.notebook-label-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.notebook-label-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #be185d;
}

.notebook-label-page__filters {
  margin-bottom: 20px;
}

.notebook-label-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.notebook-label-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.notebook-label-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.notebook-label-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .notebook-label-page__toolbar {
    flex-direction: column;
  }

  .notebook-label-page__pagination {
    justify-content: center;
  }
}
</style>
