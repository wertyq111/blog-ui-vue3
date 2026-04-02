<template>
  <section class="notebook-page">
    <header class="notebook-page__hero">
      <div>
        <div class="notebook-page__eyebrow">
          Mini Program Console
        </div>
        <h1>文章管理</h1>
        <p>维护文章内容、分类和标签，当前按后端 `articles/*` 与 `categories/list` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="notebook-page__filters"
        @submit.prevent
      >
        <el-form-item label="标题">
          <el-input
            v-model="listQuery.title"
            clearable
            placeholder="请输入标题"
            @keyup.enter="list.search()"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="listQuery.categoryId"
            clearable
            filterable
            placeholder="请选择分类"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="listQuery.labelId"
            clearable
            filterable
            placeholder="请选择标签"
          >
            <el-option
              v-for="label in filterLabelOptions"
              :key="label.id"
              :label="label.name"
              :value="label.id"
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

      <div class="notebook-page__toolbar">
        <div>
          <h2>文章列表</h2>
          <p>支持按标题、分类与标签筛选，收口增改删闭环。</p>
        </div>

        <el-button
          v-if="permission.can('sys:notebook:add')"
          type="primary"
          :loading="categoryLoading"
          @click="page.openCreate()"
        >
          添加文章
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
          prop="title"
          label="标题"
          min-width="220"
        />
        <el-table-column
          label="分类"
          min-width="140"
        >
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="标签"
          min-width="140"
        >
          <template #default="{ row }">
            {{ row.label?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="viewCount"
          label="浏览量"
          width="90"
        />
        <el-table-column
          prop="likeCount"
          label="点赞数"
          width="90"
        />
        <el-table-column
          label="发布者"
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.member?.nickname || '-' }}
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
          width="140"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:notebook:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:notebook:delete')"
              link
              type="danger"
              @click="page.removeArticle(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="notebook-page__pagination">
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

    <NotebookEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      :category-options="categoryOptions"
      :label-options="dialogLabelOptions"
      @update:visible="handleDialogVisibleChange"
      @category-change="page.handleCategoryChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'

import NotebookEditDialog from './components/NotebookEditDialog.vue'
import { useNotebookPage } from './use-notebook-page'

const page = useNotebookPage()
const permission = usePermissionAccess()
const { list, dialog, categoryOptions, categoryLoading, currentLabelOptions, submitDialog } = page

const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

const filterLabelOptions = computed(() => {
  const categoryId = listQuery.value.categoryId

  if (categoryId === '') {
    return categoryOptions.value.flatMap((category) => category.labels ?? [])
  }

  const matched = categoryOptions.value.find((category) => `${category.id}` === `${categoryId}`)

  return matched?.labels ?? []
})

const dialogLabelOptions = currentLabelOptions

function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

onMounted(async () => {
  await Promise.all([
    page.reloadCategoryOptions(),
    list.reload(),
  ])
})
</script>

<style scoped>
.notebook-page {
  display: grid;
  gap: 20px;
}

.notebook-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(244, 114, 182, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(253, 242, 248, 0.96) 100%);
  border: 1px solid rgba(244, 114, 182, 0.2);
}

.notebook-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #831843;
}

.notebook-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.notebook-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #be185d;
}

.notebook-page__filters {
  margin-bottom: 20px;
}

.notebook-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.notebook-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.notebook-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.notebook-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .notebook-page__toolbar {
    flex-direction: column;
  }

  .notebook-page__pagination {
    justify-content: center;
  }
}
</style>
