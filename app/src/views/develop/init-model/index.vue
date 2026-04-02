<template>
  <AdminPageCard>
    <el-form
      :inline="true"
      :model="listQuery"
      class="admin-page__search"
      @submit.prevent
    >
      <el-form-item label="框架编码">
        <el-input
          v-model="listQuery.code"
          clearable
          placeholder="请输入框架编码"
          @keyup.enter="list.search()"
        />
      </el-form-item>

      <el-form-item label="框架名称">
        <el-input
          v-model="listQuery.name"
          clearable
          placeholder="请输入框架名称"
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

    <div class="admin-page__toolbar">
      <AdminPageToolbar
        title="初始化模型列表"
        description="框架模板、字段提示和生成入口统一收拢到一个工具页里。"
      >
        <template #actions>
          <el-button
            v-if="permission.can('sys:init-model:add')"
            type="primary"
            @click="page.openCreate()"
          >
            添加模板
          </el-button>
        </template>
      </AdminPageToolbar>
    </div>

    <el-table
      v-loading="list.loading"
      :data="list.items"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="code"
        label="框架编码"
        min-width="140"
      />
      <el-table-column
        prop="name"
        label="框架名称"
        min-width="160"
      />
      <el-table-column
        prop="tip"
        label="模板提示"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column
        label="模型模板"
        min-width="280"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <div class="init-model-page__template-preview">
            {{ row.template }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="220"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-if="permission.can('sys:init-model:convert')"
            link
            type="primary"
            @click="page.openConvert(row)"
          >
            生成
          </el-button>
          <el-button
            v-if="permission.can('sys:init-model:edit')"
            link
            type="primary"
            @click="page.openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-if="permission.can('sys:init-model:delete')"
            link
            type="danger"
            @click="page.removeModel(row)"
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
  </AdminPageCard>

  <InitModelEditDialog
    :visible="dialogVisible"
    :value="dialogValue"
    :is-editing="dialogIsEditing"
    :submitting="dialogSubmitting"
    @update:visible="handleDialogVisibleChange"
    @submit="submitDialog"
  />

  <InitModelConvertDialog
    :visible="convertDialogVisible"
    :source="convertDialogSource"
    :value="convertDialogValue"
    :result="convertDialogResult"
    :submitting="convertDialogSubmitting"
    @update:visible="handleConvertDialogVisibleChange"
    @submit="submitConvertDialog"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { usePermissionAccess } from '@/composables/use-permission-access'
import AdminPageCard from '@/components/admin-page/AdminPageCard.vue'
import AdminPageToolbar from '@/components/admin-page/AdminPageToolbar.vue'

import InitModelConvertDialog from './components/InitModelConvertDialog.vue'
import InitModelEditDialog from './components/InitModelEditDialog.vue'
import { useInitModelPage } from './use-init-model-page'

const page = useInitModelPage()
const permission = usePermissionAccess()

const { list, dialog, convertDialog, submitDialog, submitConvertDialog } = page
const listQuery = list.query
const listMeta = list.meta
const dialogVisible = dialog.visible
const dialogValue = dialog.value
const dialogIsEditing = dialog.isEditing
const dialogSubmitting = dialog.submitting
const convertDialogVisible = convertDialog.visible
const convertDialogSource = convertDialog.source
const convertDialogValue = convertDialog.value
const convertDialogResult = convertDialog.result
const convertDialogSubmitting = convertDialog.submitting

function handleDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    dialog.close()
  }
}

function handleConvertDialogVisibleChange(visible: boolean): void {
  if (!visible) {
    page.closeConvert()
  }
}

onMounted(() => {
  void list.reload()
})
</script>

<style scoped>
.init-model-page__template-preview {
  white-space: pre-wrap;
  word-break: break-word;
  color: #334155;
}
</style>
