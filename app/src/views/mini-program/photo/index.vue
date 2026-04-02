<template>
  <section class="photo-page">
    <header class="photo-page__hero">
      <div>
        <div class="photo-page__eyebrow">
          Mini Program Console
        </div>
        <h1>照片管理</h1>
        <p>维护照片内容与所属相册，当前按后端 `photo/*` 与 `photo-categories/list` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="photo-page__filters"
        @submit.prevent
      >
        <el-form-item label="相册">
          <el-select
            v-model="listQuery.categoryId"
            clearable
            filterable
            placeholder="请选择相册"
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option.id"
              :label="option.name"
              :value="option.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="listQuery.remark"
            clearable
            placeholder="请输入描述"
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

      <div class="photo-page__toolbar">
        <div>
          <h2>照片列表</h2>
          <p>支持按相册筛选、图片预览和批量删除。</p>
        </div>

        <div class="photo-page__toolbar-actions">
          <el-button
            v-if="permission.can('sys:photo:add')"
            type="primary"
            :loading="categoryLoading"
            @click="page.openCreate()"
          >
            添加照片
          </el-button>
          <el-button
            v-if="permission.can('sys:photo:dall')"
            type="danger"
            plain
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
          fixed="left"
        />
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          label="照片"
          width="140"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.smallPicUrl || row.url"
              :src="row.smallPicUrl || row.url"
              fit="cover"
              class="photo-page__image"
              :preview-src-list="row.url ? [row.url] : []"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="相册"
          min-width="160"
        >
          <template #default="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          label="发布者"
          min-width="120"
        >
          <template #default="{ row }">
            {{ row.member?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="描述"
          min-width="200"
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
          width="140"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:photo:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:photo:delete')"
              link
              type="danger"
              @click="page.removePhoto(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="photo-page__pagination">
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

    <PhotoEditDialog
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

import PhotoEditDialog from './components/PhotoEditDialog.vue'
import { usePhotoPage } from './use-photo-page'

const page = usePhotoPage()
const permission = usePermissionAccess()
const { list, dialog, categoryOptions, categoryLoading, submitDialog } = page

const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting

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
.photo-page {
  display: grid;
  gap: 20px;
}

.photo-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.2), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 249, 255, 0.96) 100%);
  border: 1px solid rgba(56, 189, 248, 0.22);
}

.photo-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #082f49;
}

.photo-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.photo-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0369a1;
}

.photo-page__filters {
  margin-bottom: 20px;
}

.photo-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.photo-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.photo-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.photo-page__toolbar-actions {
  display: inline-flex;
  gap: 8px;
}

.photo-page__image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.photo-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .photo-page__toolbar {
    flex-direction: column;
  }

  .photo-page__toolbar-actions {
    width: 100%;
  }

  .photo-page__pagination {
    justify-content: center;
  }
}
</style>
