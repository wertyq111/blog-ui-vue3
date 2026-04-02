<template>
  <section class="photo-category-page">
    <header class="photo-category-page__hero">
      <div>
        <div class="photo-category-page__eyebrow">
          Mini Program Console
        </div>
        <h1>相册管理</h1>
        <p>维护小程序相册分类名称，统一照片内容的归类入口。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="photo-category-page__filters"
        @submit.prevent
      >
        <el-form-item label="相册名称">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入相册名称"
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

      <div class="photo-category-page__toolbar">
        <div>
          <h2>相册列表</h2>
          <p>当前仅收口已确认的列表、增改与删除链路，不额外迁入未验证字段。</p>
        </div>

        <el-button
          v-if="permission.can('sys:photo-category:add')"
          type="primary"
          @click="page.openCreate()"
        >
          添加相册
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
          width="90"
        />
        <el-table-column
          prop="name"
          label="相册名称"
          min-width="220"
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
              v-if="permission.can('sys:photo-category:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:photo-category:delete')"
              link
              type="danger"
              @click="page.removeCategory(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="photo-category-page__pagination">
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

    <PhotoCategoryEditDialog
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

import PhotoCategoryEditDialog from './components/PhotoCategoryEditDialog.vue'
import { usePhotoCategoryPage } from './use-photo-category-page'

const page = usePhotoCategoryPage()
const permission = usePermissionAccess()

const { list, dialog, submitDialog } = page
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

onMounted(() => {
  void list.reload()
})
</script>

<style scoped>
.photo-category-page {
  display: grid;
  gap: 20px;
}

.photo-category-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 247, 237, 0.96) 100%);
  border: 1px solid rgba(251, 146, 60, 0.18);
}

.photo-category-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #431407;
}

.photo-category-page__hero p {
  margin: 0;
  max-width: 56ch;
  font-size: 14px;
  line-height: 1.7;
  color: #7c2d12;
}

.photo-category-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ea580c;
}

.photo-category-page__filters {
  margin-bottom: 8px;
}

.photo-category-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.photo-category-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.photo-category-page__toolbar p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.photo-category-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
