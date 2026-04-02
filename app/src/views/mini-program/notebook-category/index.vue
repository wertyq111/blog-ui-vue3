<template>
  <section class="notebook-category-page">
    <header class="notebook-category-page__hero">
      <div>
        <div class="notebook-category-page__eyebrow">
          Mini Program Console
        </div>
        <h1>文章分类</h1>
        <p>维护小程序文章分类与展示优先级，当前按后端 `categories/*` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="notebook-category-page__filters"
        @submit.prevent
      >
        <el-form-item label="分类名">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入分类名"
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

      <div class="notebook-category-page__toolbar">
        <div>
          <h2>分类列表</h2>
          <p>支持新增、修改和删除，详情字段按当前后端模型最小闭环迁移。</p>
        </div>

        <el-button
          v-if="permission.can('sys:notebook-category:add')"
          type="primary"
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
          prop="name"
          label="分类名"
          min-width="180"
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="220"
        />
        <el-table-column
          prop="priority"
          label="优先级"
          width="120"
        />
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:notebook-category:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:notebook-category:delete')"
              link
              type="danger"
              @click="page.removeCategory(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="notebook-category-page__pagination">
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

    <NotebookCategoryEditDialog
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

import NotebookCategoryEditDialog from './components/NotebookCategoryEditDialog.vue'
import { useNotebookCategoryPage } from './use-notebook-category-page'

const page = useNotebookCategoryPage()
const permission = usePermissionAccess()
const { list, dialog, submitDialog } = page

const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

/** 响应弹窗显隐变化并在关闭时清理弹窗状态。 */
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
.notebook-category-page {
  display: grid;
  gap: 20px;
}

.notebook-category-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 244, 0.96) 100%);
  border: 1px solid rgba(74, 222, 128, 0.22);
}

.notebook-category-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #14532d;
}

.notebook-category-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.notebook-category-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #15803d;
}

.notebook-category-page__filters {
  margin-bottom: 20px;
}

.notebook-category-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.notebook-category-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.notebook-category-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.notebook-category-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .notebook-category-page__toolbar {
    flex-direction: column;
  }

  .notebook-category-page__pagination {
    justify-content: center;
  }
}
</style>
