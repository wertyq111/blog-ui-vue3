<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改文章分类' : '添加文章分类'"
    width="560px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="notebook-category-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="notebook-category-dialog__form"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          maxlength="20"
          clearable
          placeholder="请输入分类名称"
        />
      </el-form-item>

      <el-form-item
        label="描述"
        prop="description"
      >
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          clearable
          placeholder="请输入描述"
        />
      </el-form-item>

      <el-form-item
        label="优先级"
        prop="priority"
      >
        <el-input-number
          v-model="form.priority"
          :min="0"
          controls-position="right"
          class="notebook-category-dialog__priority"
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
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { NotebookCategoryFormValue } from '@/types/notebook-category'

const props = defineProps<{
  visible: boolean
  value: NotebookCategoryFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: NotebookCategoryFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<NotebookCategoryFormValue>({
  name: '',
  description: '',
  priority: 0,
})

/** 将父组件传入值同步到弹窗内部模型，供新增重置和编辑回填共用。 */
function applyValue(value: NotebookCategoryFormValue): void {
  form.id = value.id
  form.name = value.name
  form.description = value.description
  form.priority = value.priority
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

const rules: FormRules<NotebookCategoryFormValue> = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  priority: [{ required: true, type: 'number', message: '请输入优先级', trigger: 'change' }],
}

/** 把弹窗显隐状态回传父组件，供取消关闭和外部联动使用。 */
function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

/** 校验并提交弹窗数据，供点击“保存”按钮时触发。 */
async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    name: form.name.trim(),
    description: form.description.trim(),
    priority: form.priority,
  })
}
</script>

<style scoped>
.notebook-category-dialog__priority {
  width: 180px;
}
</style>
