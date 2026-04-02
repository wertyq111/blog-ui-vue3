<template>
  <section class="wallpaper-classify-page">
    <header class="wallpaper-classify-page__hero">
      <div>
        <div class="wallpaper-classify-page__eyebrow">
          Mini Program Console
        </div>
        <h1>壁纸分类</h1>
        <p>维护壁纸分类、封面和推荐位配置，当前按后端 `wallpaper-classify/*` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="wallpaper-classify-page__filters"
        @submit.prevent
      >
        <el-form-item label="分类名称">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入分类名称"
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

      <div class="wallpaper-classify-page__toolbar">
        <div>
          <h2>分类列表</h2>
          <p>支持分类封面与推荐状态维护，先收口增改删闭环。</p>
        </div>

        <el-button
          v-if="permission.can('sys:wallpaper-classify:add')"
          type="primary"
          @click="page.openCreate()"
        >
          添加分类
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
          label="分类名称"
          min-width="200"
        />
        <el-table-column
          label="封面"
          width="140"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.picUrl"
              :src="row.picUrl"
              fit="cover"
              class="wallpaper-classify-page__image"
              :preview-src-list="[row.picUrl]"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="select"
          label="推荐"
          width="90"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.select ? 'success' : 'info'"
              size="small"
            >
              {{ row.select ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="sort"
          label="排序号"
          width="100"
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
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('sys:wallpaper-classify:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:wallpaper-classify:delete')"
              link
              type="danger"
              @click="page.removeClassify(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="wallpaper-classify-page__pagination">
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

    <WallpaperClassifyEditDialog
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

import WallpaperClassifyEditDialog from './components/WallpaperClassifyEditDialog.vue'
import { useWallpaperClassifyPage } from './use-wallpaper-classify-page'

const page = useWallpaperClassifyPage()
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
  list.reload()
})
</script>

<style scoped>
.wallpaper-classify-page {
  display: grid;
  gap: 20px;
}

.wallpaper-classify-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.2), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(236, 253, 245, 0.96) 100%);
  border: 1px solid rgba(16, 185, 129, 0.24);
}

.wallpaper-classify-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #064e3b;
}

.wallpaper-classify-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.wallpaper-classify-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #047857;
}

.wallpaper-classify-page__filters {
  margin-bottom: 20px;
}

.wallpaper-classify-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.wallpaper-classify-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.wallpaper-classify-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.wallpaper-classify-page__image {
  width: 96px;
  height: 64px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.wallpaper-classify-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .wallpaper-classify-page__toolbar {
    flex-direction: column;
  }

  .wallpaper-classify-page__pagination {
    justify-content: center;
  }
}
</style>
