<template>
  <section class="work-platform-page">
    <header class="work-platform-page__hero">
      <div>
        <div class="work-platform-page__eyebrow">
          Develop Workspace
        </div>
        <h1>工作平台</h1>
        <p>维护平台名称、启用状态和排序顺序，为工作日志和文档模块提供统一的平台基础数据。</p>
      </div>
    </header>

    <el-card shadow="never">
      <el-form
        :inline="true"
        :model="listQuery"
        class="work-platform-page__filters"
        @submit.prevent
      >
        <el-form-item label="平台名称">
          <el-input
            v-model="listQuery.name"
            clearable
            placeholder="请输入平台名称"
            @keyup.enter="list.search()"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="listQuery.status"
            clearable
            placeholder="全部"
          >
            <el-option
              label="启用"
              :value="1"
            />
            <el-option
              label="禁用"
              :value="0"
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

      <div class="work-platform-page__toolbar">
        <div>
          <h2>平台排序列表</h2>
          <p>当前采用稳定的上移、下移与保存排序方案，不引入额外拖拽依赖，但完整覆盖后端 `reorder` 契约。</p>
        </div>

        <div class="work-platform-page__toolbar-actions">
          <el-button
            v-if="permission.can('dev:workPlatform:view') && page.hasOrderChanges.value"
            type="success"
            @click="page.saveOrder()"
          >
            保存排序
          </el-button>
          <el-button
            v-if="permission.can('dev:workPlatform:view')"
            type="primary"
            @click="page.openCreate()"
          >
            添加平台
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="list.loading"
        :data="orderedItems"
        border
        style="width: 100%"
      >
        <el-table-column
          label="序号"
          width="70"
          align="center"
        >
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="平台名称"
          min-width="180"
        />
        <el-table-column
          prop="sort"
          label="排序"
          width="90"
          align="center"
        />
        <el-table-column
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="Number(row.status) === 0 ? 'danger' : 'success'"
              size="small"
            >
              {{ Number(row.status) === 0 ? '禁用' : '启用' }}
            </el-tag>
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
          label="排序操作"
          width="150"
          align="center"
        >
          <template #default="{ $index }">
            <el-button
              link
              type="primary"
              :disabled="$index === 0"
              @click="page.moveUp($index)"
            >
              上移
            </el-button>
            <el-button
              link
              type="primary"
              :disabled="$index === orderedItems.length - 1"
              @click="page.moveDown($index)"
            >
              下移
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="180"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-if="permission.can('dev:workPlatform:view')"
              link
              type="primary"
              @click="page.openEdit(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="permission.can('dev:workPlatform:view')"
              link
              type="danger"
              @click="page.removePlatform(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="work-platform-page__pagination">
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

    <WorkPlatformEditDialog
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
import { computed, onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'

import WorkPlatformEditDialog from './components/WorkPlatformEditDialog.vue'
import { useWorkPlatformPage } from './use-work-platform-page'

const page = useWorkPlatformPage()
const permission = usePermissionAccess()

const { list, dialog, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const orderedItems = computed(() => page.orderedItems.value)
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
.work-platform-page {
  display: grid;
  gap: 20px;
}

.work-platform-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 247, 237, 0.96) 100%);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

.work-platform-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #7c2d12;
}

.work-platform-page__hero p {
  margin: 0;
  max-width: 60ch;
  font-size: 14px;
  line-height: 1.7;
  color: #9a3412;
}

.work-platform-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ea580c;
}

.work-platform-page__filters {
  margin-bottom: 8px;
}

.work-platform-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.work-platform-page__toolbar h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.work-platform-page__toolbar p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.work-platform-page__toolbar-actions {
  display: flex;
  gap: 12px;
}

.work-platform-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
