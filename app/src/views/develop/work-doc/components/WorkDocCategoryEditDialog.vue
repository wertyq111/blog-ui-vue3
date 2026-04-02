<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改分类' : '添加分类'"
    width="620px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="work-doc-category-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="work-doc-category-edit-dialog__form"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          clearable
          maxlength="50"
          placeholder="请输入分类名称"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :md="12">
          <el-form-item label="上级分类">
            <el-select
              v-model="form.parentId"
              filterable
              placeholder="不选则为一级目录"
              style="width: 100%"
            >
              <el-option
                :value="0"
                label="一级目录"
              />
              <el-option
                v-for="item in parentOptions"
                :key="item.id"
                :label="item.name"
                :value="Number(item.id)"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :md="12">
          <el-form-item label="图标">
            <el-input
              v-model="form.icon"
              clearable
              placeholder="例如 el-icon-folder"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :md="12">
          <el-form-item label="排序">
            <el-input-number
              v-model="form.sort"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :md="12">
          <el-form-item label="状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="停用"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          :rows="4"
          type="textarea"
          placeholder="请输入分类描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleVisibleChange(false)">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        保存
      </el-button>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { WorkDocCategoryFormValue, WorkDocCategoryRow } from '@/types/work-doc'

const props = defineProps<{
  visible: boolean
  value: WorkDocCategoryFormValue
  categories: WorkDocCategoryRow[]
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WorkDocCategoryFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<WorkDocCategoryFormValue>({
  parentId: 0,
  name: '',
  icon: '',
  description: '',
  sort: 0,
  status: 1,
})

function applyValue(value: WorkDocCategoryFormValue): void {
  form.id = value.id
  form.parentId = value.parentId
  form.name = value.name
  form.icon = value.icon
  form.description = value.description
  form.sort = value.sort
  form.status = value.status
}

watch(
  () => props.value,
  (value) => {
    applyValue(value)
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const parentOptions = computed(() =>
  props.categories.filter((item) => String(item.id) !== String(form.id)),
)

const rules: FormRules<WorkDocCategoryFormValue> = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    parentId: form.parentId,
    name: form.name.trim(),
    icon: form.icon.trim(),
    description: form.description.trim(),
    sort: form.sort,
    status: form.status,
  })
}
</script>

<style scoped>
.work-doc-category-edit-dialog__form {
  padding-top: 4px;
}
</style>
