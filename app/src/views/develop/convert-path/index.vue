<template>
  <AdminPageCard>
    <el-form
      :inline="true"
      :model="listQuery"
      class="admin-page__search"
      @submit.prevent
    >
      <el-form-item label="项目名称">
        <el-input
          v-model="listQuery.name"
          clearable
          placeholder="请输入项目名称"
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
        title="转换项目列表"
        description="项目网址、服务器地址和转换动作统一集中到一个工具工作区。"
      >
        <template #actions>
          <el-button
            v-if="permission.can('sys:convert-path:add')"
            type="primary"
            @click="page.openCreate()"
          >
            添加项目
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
        label="项目编码"
        min-width="140"
      />
      <el-table-column
        prop="name"
        label="项目名称"
        min-width="180"
      />
      <el-table-column
        label="项目网址"
        min-width="220"
      >
        <template #default="{ row }">
          <el-link
            v-if="row.url"
            :href="row.url"
            target="_blank"
            type="primary"
          >
            {{ row.url }}
          </el-link>
          <span
            v-else
            class="convert-path-page__muted"
          >
            未配置
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="target"
        label="服务器地址"
        min-width="220"
      />
      <el-table-column
        label="来源地址"
        min-width="260"
      >
        <template #default="{ row }">
          <div class="convert-path-page__sources">
            <el-tag
              v-for="source in row.sources"
              :key="source"
              size="small"
              class="convert-path-page__source-tag"
              effect="plain"
            >
              {{ source }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="sort"
        label="排序"
        width="90"
      />
      <el-table-column
        label="操作"
        min-width="220"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-if="permission.can('sys:convert-path:convert')"
            link
            type="primary"
            @click="page.openConvert(row)"
          >
            转换
          </el-button>
          <el-button
            v-if="permission.can('sys:convert-path:edit')"
            link
            type="primary"
            @click="page.openEdit(row)"
          >
            修改
          </el-button>
          <el-button
            v-if="permission.can('sys:convert-path:delete')"
            link
            type="danger"
            @click="page.removePath(row)"
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

  <ConvertPathEditDialog
    :visible="dialogVisible"
    :value="dialogValue"
    :is-editing="dialogIsEditing"
    :submitting="dialogSubmitting"
    @update:visible="handleDialogVisibleChange"
    @submit="submitDialog"
  />

  <ConvertPathConvertDialog
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

import ConvertPathConvertDialog from './components/ConvertPathConvertDialog.vue'
import ConvertPathEditDialog from './components/ConvertPathEditDialog.vue'
import { useConvertPathPage } from './use-convert-path-page'

const page = useConvertPathPage()
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
.convert-path-page__sources {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.convert-path-page__source-tag {
  max-width: 100%;
}

.convert-path-page__muted {
  color: #909399;
}
</style>
