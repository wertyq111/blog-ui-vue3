<template>
  <section class="work-doc-page">
    <AdminPageCard>
      <AdminSplitWorkspace>
        <template #sidebar>
          <el-card
            shadow="never"
            class="admin-split-panel work-doc-page__sidebar"
          >
            <AdminPageToolbar
              title="分类目录"
              description="支持拖拽排序，拖到节点上可成为子分类。"
            >
              <template #actions>
                <el-button
                  type="primary"
                  size="small"
                  @click="page.openCreateCategory()"
                >
                  添加分类
                </el-button>
              </template>
            </AdminPageToolbar>

            <div class="admin-split-panel__actions work-doc-page__sidebar-actions">
              <el-button
                :disabled="!page.currentCategory.value"
                size="small"
                @click="handleEditCategory"
              >
                修改
              </el-button>
              <el-button
                :disabled="!page.currentCategory.value"
                size="small"
                type="danger"
                @click="page.removeCurrentCategory()"
              >
                删除
              </el-button>
            </div>

            <el-tree
              ref="treeRef"
              :data="page.categoryTree.value"
              node-key="id"
              highlight-current
              default-expand-all
              draggable
              :expand-on-click-node="false"
              :allow-drop="allowCategoryDrop"
              @node-click="handleCategoryClick"
              @node-drop="handleCategoryDrop"
            >
              <template #default="{ data }">
                <div class="work-doc-page__tree-node">
                  <span>{{ data.name }}</span>
                  <el-tag
                    size="small"
                    effect="plain"
                  >
                    {{ data.children?.length ?? 0 }}
                  </el-tag>
                </div>
              </template>
            </el-tree>
          </el-card>
        </template>

        <el-card
          v-loading="page.auxiliaryLoading.value"
          shadow="never"
          class="admin-split-panel work-doc-page__content"
        >
          <AdminPageToolbar
            title="文档列表"
            :description="page.currentCategory.value?.name ?? '全部分类文档'"
          >
            <template #actions>
              <el-button
                type="primary"
                @click="page.openCreateDoc()"
              >
                添加文档
              </el-button>
            </template>
          </AdminPageToolbar>

          <el-form
            :inline="true"
            :model="listQuery"
            class="admin-page__search work-doc-page__filters"
            label-width="90px"
            @submit.prevent
          >
            <el-form-item label="标题/内容">
              <el-input
                v-model="listQuery.keyword"
                clearable
                placeholder="输入关键词"
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
                  label="停用"
                  :value="0"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="模板">
              <el-select
                v-model="listQuery.templateType"
                clearable
                placeholder="全部"
              >
                <el-option
                  v-for="item in templates"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
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

          <el-table
            :data="list.items.value"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="title"
              label="标题"
              min-width="220"
            >
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="page.openPreview(row)"
                >
                  {{ row.title }}
                </el-button>
              </template>
            </el-table-column>

            <el-table-column
              label="标签"
              min-width="180"
            >
              <template #default="{ row }">
                <div class="work-doc-page__tags">
                  <el-tag
                    v-for="tag in row.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              prop="templateType"
              label="模板"
              width="120"
            >
              <template #default="{ row }">
                {{ resolveTemplateLabel(row.templateType) }}
              </template>
            </el-table-column>

            <el-table-column
              prop="source"
              label="项目来源"
              min-width="140"
            />

            <el-table-column
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 1 ? 'success' : 'info'"
                  size="small"
                >
                  {{ row.status === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column
              prop="priority"
              label="优先级"
              width="90"
              align="center"
            />

            <el-table-column
              prop="updateTime"
              label="更新时间"
              min-width="180"
            />

            <el-table-column
              label="操作"
              width="160"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="page.openEditDoc(row)"
                >
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="page.removeDoc(row)"
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
        </el-card>
      </AdminSplitWorkspace>
    </AdminPageCard>

    <WorkDocEditDialog
      :visible="docDialogVisible"
      :value="docDialogValue"
      :categories="page.categories.value"
      :templates="templates"
      :platforms="page.platforms.value"
      :is-editing="docDialogIsEditing"
      :submitting="docDialogSubmitting"
      @update:visible="handleDocDialogVisibleChange"
      @submit="handleDocDialogSubmit"
    />

    <WorkDocCategoryEditDialog
      :visible="categoryDialogVisible"
      :value="categoryDialogValue"
      :categories="page.categories.value"
      :is-editing="categoryDialogIsEditing"
      :submitting="categoryDialogSubmitting"
      @update:visible="handleCategoryDialogVisibleChange"
      @submit="handleCategoryDialogSubmit"
    />

    <AppDialog
      :visible="previewVisible"
      title="文档预览"
      width="880px"
      destroy-on-close
      :lock-scroll="false"
      @update:visible="handlePreviewVisibleChange"
    >
      <div class="work-doc-page__preview">
        <h3>{{ page.previewDoc.value?.title }}</h3>
        <pre>{{ page.previewDoc.value?.content }}</pre>
      </div>
    </AppDialog>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AllowDropType, NodeDropType } from 'element-plus/es/components/tree/src/tree.type'

import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'
import AdminSplitWorkspace from '@/components/admin-page/AdminSplitWorkspace.vue'
import AppDialog from '@/components/AppDialog.vue'
import type { WorkDocCategoryFormValue, WorkDocCategoryReorderItem, WorkDocCategoryRow, WorkDocFormValue } from '@/types/work-doc'

import WorkDocCategoryEditDialog from './components/WorkDocCategoryEditDialog.vue'
import WorkDocEditDialog from './components/WorkDocEditDialog.vue'
import { useWorkDocPage } from './use-work-doc-page'

const page = useWorkDocPage()
const treeRef = ref()

const { list, docDialog, categoryDialog } = page
const listQuery = list.query
const listMeta = list.meta
const templates = page.templates.value
const docDialogVisible = docDialog.visible
const docDialogValue = docDialog.value
const docDialogIsEditing = docDialog.isEditing
const docDialogSubmitting = docDialog.submitting
const categoryDialogVisible = categoryDialog.visible
const categoryDialogValue = categoryDialog.value
const categoryDialogIsEditing = categoryDialog.isEditing
const categoryDialogSubmitting = categoryDialog.submitting
const previewVisible = computed(() => page.previewDoc.value !== null)

type WorkDocTreeNode = {
  data: WorkDocCategoryRow
}

function resolveTemplateLabel(value: string): string {
  return templates.find((item) => item.value === value)?.label ?? (value || '自定义')
}

function handleCategoryClick(data: WorkDocCategoryRow): void {
  void page.selectCategory(data)
}

function allowCategoryDrop(draggingNode: WorkDocTreeNode, dropNode: WorkDocTreeNode, type: AllowDropType): boolean {
  if (draggingNode.data.id === dropNode.data.id) {
    return false
  }

  return type === 'prev' || type === 'inner' || type === 'next'
}

function flattenTreeOrder(nodes: WorkDocCategoryRow[], parentId = 0): WorkDocCategoryReorderItem[] {
  return nodes.flatMap((node, index) => {
    const currentItem: WorkDocCategoryReorderItem = {
      id: node.id,
      parentId,
      sort: (index + 1) * 10,
    }

    const childItems = node.children ? flattenTreeOrder(node.children, Number(node.id)) : []

    return [currentItem, ...childItems]
  })
}

function handleCategoryDrop(
  draggingNode: WorkDocTreeNode,
  dropNode: WorkDocTreeNode,
  dropType: NodeDropType,
): void {
  void draggingNode
  void dropNode
  void dropType

  const treeData =
    (treeRef.value?.store?.root?.childNodes as WorkDocTreeNode[] | undefined)?.map((node) => node.data)
    ?? page.categoryTree.value
  void page.saveCategoryOrder(flattenTreeOrder(treeData))
}

function handleDocDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    docDialog.close()
  }
}

async function handleDocDialogSubmit(value: WorkDocFormValue): Promise<void> {
  docDialog.value.value = value
  await page.submitDocDialog()
}

function handleCategoryDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    categoryDialog.close()
  }
}

async function handleCategoryDialogSubmit(value: WorkDocCategoryFormValue): Promise<void> {
  categoryDialog.value.value = value
  await page.submitCategoryDialog()
}

function handleEditCategory(): void {
  if (!page.currentCategory.value) {
    return
  }

  void page.openEditCategory(page.currentCategory.value)
}

function handlePreviewVisibleChange(visible: boolean): void {
  if (!visible) {
    page.previewDoc.value = null
  }
}

void page.initialize()
</script>

<style scoped>
.work-doc-page {
  display: grid;
  gap: 16px;
}

.work-doc-page__sidebar-actions {
  margin-bottom: 16px;
}

.work-doc-page__tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.work-doc-page__filters {
  margin-bottom: 16px;
}

.work-doc-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.work-doc-page__preview pre {
  margin: 0;
  padding: 16px;
  border-radius: 16px;
  background: #0f172a;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  line-height: 1.7;
}

</style>
