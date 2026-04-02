<template>
  <section class="work-daily-page">
    <AdminPageCard>
      <div
        v-loading="list.loading || auxiliaryLoading"
        class="work-daily-page__content"
      >
        <section class="work-daily-page__section">
          <div class="admin-page__search">
            <el-form
              :inline="true"
              :model="listQuery"
              class="work-daily-page__filters"
              label-width="77px"
              @submit.prevent
            >
              <el-row :gutter="15">
                <el-col
                  :lg="8"
                  :md="12"
                >
                  <el-form-item label="平台">
                    <el-select
                      v-model="listQuery.platformId"
                      clearable
                      filterable
                      placeholder="请选择平台"
                    >
                      <el-option
                        v-for="option in platforms"
                        :key="option.id"
                        :label="option.name"
                        :value="option.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col
                  :lg="10"
                  :md="12"
                >
                  <el-form-item label="日期范围">
                    <el-date-picker
                      v-model="dateRange"
                      type="daterange"
                      value-format="YYYY-MM-DD"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                    />
                  </el-form-item>
                </el-col>

                <el-col
                  :lg="6"
                  :md="12"
                >
                  <el-form-item label="内容搜索">
                    <el-input
                      v-model="listQuery.content"
                      clearable
                      placeholder="请输入关键字"
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </el-col>

                <el-col
                  :lg="6"
                  :md="12"
                >
                  <div class="work-daily-page__filters-actions">
                    <el-button
                      type="primary"
                      @click="handleSearch"
                    >
                      查询
                    </el-button>
                    <el-button @click="handleReset">
                      重置
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </section>

        <section class="work-daily-page__section work-daily-page__section--accent">
          <AdminPageToolbar
            title="报表与导入"
            description="保持与后端真实契约一致，导出 Markdown 报表，并支持导入历史日志。"
          >
            <template #actions>
              <el-button
                type="success"
                :loading="report.loading.value"
                @click="handleExport"
              >
                导出
              </el-button>
              <el-upload
                :show-file-list="false"
                :http-request="handleImportRequest"
                accept=".md,.markdown,text/markdown"
              >
                <el-button
                  type="primary"
                  :loading="importState.importing.value"
                >
                  导入 Markdown
                </el-button>
              </el-upload>
            </template>
          </AdminPageToolbar>

          <el-form
            :inline="true"
            class="work-daily-page__report-form"
            label-width="77px"
            @submit.prevent
          >
            <el-row :gutter="15">
              <el-col
                :lg="8"
                :md="12"
              >
                <el-form-item label="报表类型">
                  <el-select
                    v-model="report.type.value"
                    placeholder="请选择报表类型"
                  >
                    <el-option
                      label="月报"
                      value="month"
                    />
                    <el-option
                      label="周报"
                      value="week"
                    />
                    <el-option
                      label="年报"
                      value="year"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col
                :lg="8"
                :md="12"
              >
                <el-form-item label="总结模型">
                  <el-select
                    v-model="report.model.value"
                    clearable
                    filterable
                    placeholder="默认使用环境配置模型"
                  >
                    <el-option
                      v-for="item in report.options.value"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col
                v-if="report.type.value === 'month'"
                :lg="8"
                :md="12"
              >
                <el-form-item label="月份">
                  <el-date-picker
                    v-model="report.month.value"
                    type="month"
                    value-format="YYYY-MM"
                    placeholder="选择月份"
                  />
                </el-form-item>
              </el-col>

              <el-col
                v-if="report.type.value === 'week'"
                :lg="8"
                :md="12"
              >
                <el-form-item label="日期范围">
                  <el-date-picker
                    v-model="report.weekRange.value"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                  />
                </el-form-item>
              </el-col>

              <el-col
                v-if="report.type.value === 'year'"
                :lg="8"
                :md="12"
              >
                <el-form-item label="年份">
                  <el-date-picker
                    v-model="report.year.value"
                    type="year"
                    value-format="YYYY"
                    placeholder="选择年份"
                  />
                </el-form-item>
              </el-col>

              <el-col
                :lg="8"
                :md="12"
              >
                <el-form-item label="导入年份">
                  <el-date-picker
                    v-model="importState.year.value"
                    type="year"
                    value-format="YYYY"
                    placeholder="选择年份"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </section>

        <AdminPageToolbar
          class="admin-page__toolbar"
          title="工作日常列表"
          description="当前以多平台内容为一条日报记录，预览区直接展示原始 Markdown 文本。"
        >
          <template #actions>
            <el-button
              v-if="permission.can('dev:workDaily:view')"
              type="primary"
              @click="page.openCreate()"
            >
              添加日常
            </el-button>
          </template>
        </AdminPageToolbar>

        <el-table
          :data="list.items.value"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="70"
            align="center"
          />
          <el-table-column
            prop="logDate"
            label="日期"
            width="120"
            align="center"
          />
          <el-table-column
            label="内容"
            min-width="420"
          >
            <template #default="{ row }">
              <div class="work-daily-page__content-list">
                <div
                  v-for="(item, index) in row.content.platforms"
                  :key="`${row.id}-${index}`"
                  class="work-daily-page__content-item"
                >
                  <div class="work-daily-page__content-item-head">
                    {{ resolvePlatformName(item) }}
                  </div>
                  <pre class="work-daily-page__content-preview">{{ truncateContent(item.content) }}</pre>
                </div>
              </div>
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
            min-width="180"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                v-if="permission.can('dev:workDaily:view')"
                link
                type="primary"
                @click="page.openEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="permission.can('dev:workDaily:view')"
                link
                type="danger"
                @click="page.removeLog(row)"
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
      </div>
    </AdminPageCard>

    <WorkDailyEditDialog
      :visible="dialogVisible"
      :value="dialogValue"
      :platforms="platforms"
      :is-editing="dialogIsEditing"
      :submitting="dialogSubmitting"
      @update:visible="handleDialogVisibleChange"
      @submit="handleDialogSubmit"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { UploadRequestOptions } from 'element-plus'

import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'
import { usePermissionAccess } from '@/composables/use-permission-access'
import type { WorkDailyFormValue, WorkDailyPlatformEntry } from '@/types/work-daily'

import WorkDailyEditDialog from './components/WorkDailyEditDialog.vue'
import { useWorkDailyPage } from './use-work-daily-page'

const page = useWorkDailyPage()
const permission = usePermissionAccess()

const { list, dialog, platforms, auxiliaryLoading, importState, report, submitDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting
const dateRange = ref<string[]>([])

watch(
  dateRange,
  (value) => {
    if (!Array.isArray(value) || value.length < 2) {
      listQuery.value.dateRange = []
      return
    }

    listQuery.value.dateRange = [value[0], value[1]]
  },
  {
    deep: true,
  },
)

function resolvePlatformName(item: WorkDailyPlatformEntry): string {
  if (item.platformName) {
    return item.platformName
  }

  const matched = platforms.value.find((option) => String(option.id) === String(item.platformId))

  return matched?.name ?? '未指定平台'
}

function truncateContent(content: string): string {
  const trimmed = content.trim()

  if (trimmed.length <= 160) {
    return trimmed
  }

  return `${trimmed.slice(0, 160)}...`
}

function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

async function handleDialogSubmit(value: WorkDailyFormValue): Promise<void> {
  dialog.value.value = value
  await submitDialog()
}

async function handleSearch(): Promise<void> {
  listQuery.value.dateRange = dateRange.value.length >= 2
    ? [dateRange.value[0], dateRange.value[1]]
    : []
  await list.search()
}

async function handleReset(): Promise<void> {
  dateRange.value = []
  await list.reset()
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

async function handleExport(): Promise<void> {
  const result = await page.exportCurrentReport()
  downloadBlob(result.blob, result.filename)
}

async function handleImportRequest(options: UploadRequestOptions): Promise<void> {
  await page.importMarkdown(options.file as File)
  options.onSuccess?.({})
}

onMounted(() => {
  void Promise.all([
    page.initialize(),
    list.reload(),
  ])
})
</script>

<style scoped>
.work-daily-page {
  display: grid;
  gap: 16px;
}

.work-daily-page__content {
  display: grid;
  gap: 16px;
}

.work-daily-page__section {
  display: grid;
  gap: 12px;
}

.work-daily-page__section--accent {
  padding: 16px;
  border-radius: 8px;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 24%),
    linear-gradient(180deg, rgba(240, 253, 250, 0.98) 0%, rgba(236, 253, 245, 0.96) 100%);
}

.work-daily-page__filters-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 2px;
}

.work-daily-page__content-list {
  display: grid;
  gap: 12px;
}

.work-daily-page__content-item {
  padding: 12px;
  border-radius: 14px;
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.work-daily-page__content-item-head {
  margin-bottom: 8px;
  font-weight: 600;
  color: #0f172a;
}

.work-daily-page__content-preview {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #334155;
}

@media (max-width: 768px) {
  .work-daily-page__filters-actions {
    padding-top: 0;
  }
}
</style>
