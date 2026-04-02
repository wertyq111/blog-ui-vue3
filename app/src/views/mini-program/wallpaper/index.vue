<template>
  <section class="wallpaper-page">
    <header class="wallpaper-page__hero">
      <div>
        <div class="wallpaper-page__eyebrow">
          Mini Program Console
        </div>
        <h1>壁纸管理</h1>
        <p>维护壁纸资源、分类关系和发布信息，当前按后端 `wallpaper/*` 契约迁移。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="wallpaper-page__filters"
        @submit.prevent
      >
        <el-form-item label="分类">
          <el-select
            v-model="listQuery.classId"
            clearable
            filterable
            placeholder="请选择分类"
          >
            <el-option
              v-for="option in classifyOptions"
              :key="option.id"
              :label="option.name"
              :value="option.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发布者">
          <el-input
            v-model="listQuery.nickname"
            clearable
            placeholder="请输入发布者"
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

      <div class="wallpaper-page__toolbar">
        <div>
          <h2>壁纸列表</h2>
          <p>支持图片预览、标签展示和增删改闭环。</p>
        </div>

        <el-button
          v-if="permission.can('sys:wallpaper:add')"
          type="primary"
          :loading="classifyLoading"
          @click="page.openCreate()"
        >
          添加壁纸
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
          label="壁纸"
          width="140"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.smallPicUrl || row.url"
              :src="row.smallPicUrl || row.url"
              fit="cover"
              class="wallpaper-page__image"
              :preview-src-list="row.url ? [row.url] : []"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="分类"
          min-width="140"
        >
          <template #default="{ row }">
            {{ row.classify?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="nickname"
          label="发布者"
          min-width="120"
        />
        <el-table-column
          label="标签"
          min-width="180"
        >
          <template #default="{ row }">
            <div class="wallpaper-page__tags">
              <el-tag
                v-for="tag in normalizeRowTags(row.tags)"
                :key="tag"
                size="small"
                type="primary"
              >
                {{ tag }}
              </el-tag>
              <span v-if="normalizeRowTags(row.tags).length === 0">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="score"
          label="评分"
          width="100"
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="180"
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
              v-if="permission.can('sys:wallpaper:edit')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('sys:wallpaper:delete')"
              link
              type="danger"
              @click="page.removeWallpaper(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="wallpaper-page__pagination">
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

    <WallpaperEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      :classify-options="classifyOptions"
      @update:visible="handleDialogVisibleChange"
      @submit="submitDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'
import type { WallpaperRow } from '@/types/wallpaper'

import WallpaperEditDialog from './components/WallpaperEditDialog.vue'
import { useWallpaperPage } from './use-wallpaper-page'

const page = useWallpaperPage()
const permission = usePermissionAccess()
const { list, dialog, classifyOptions, classifyLoading, submitDialog } = page

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

function normalizeRowTags(tags: WallpaperRow['tags']): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag))
  }

  if (typeof tags === 'string') {
    const nextValue = tags.trim()

    if (!nextValue) {
      return []
    }

    try {
      const parsed = JSON.parse(nextValue)

      return Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : [nextValue]
    } catch {
      return [nextValue]
    }
  }

  return []
}

onMounted(async () => {
  await Promise.all([
    page.reloadClassifyOptions(),
    list.reload(),
  ])
})
</script>

<style scoped>
.wallpaper-page {
  display: grid;
  gap: 20px;
}

.wallpaper-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.2), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 250, 0.96) 100%);
  border: 1px solid rgba(45, 212, 191, 0.22);
}

.wallpaper-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #134e4a;
}

.wallpaper-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.wallpaper-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0f766e;
}

.wallpaper-page__filters {
  margin-bottom: 20px;
}

.wallpaper-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.wallpaper-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
}

.wallpaper-page__toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.wallpaper-page__image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.wallpaper-page__tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.wallpaper-page__pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .wallpaper-page__toolbar {
    flex-direction: column;
  }

  .wallpaper-page__pagination {
    justify-content: center;
  }
}
</style>
