<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改文章标签' : '添加文章标签'"
    width="560px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="notebook-label-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="notebook-label-dialog__form"
    >
      <el-form-item
        label="文章分类"
        prop="categoryId"
      >
        <el-select
          v-model="form.categoryId"
          clearable
          filterable
          placeholder="请选择分类"
          style="width: 100%"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="标签名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          maxlength="20"
          clearable
          placeholder="请输入标签名称"
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
import type { NotebookLabelCategoryOption, NotebookLabelFormValue } from '@/types/notebook-label'

const props = defineProps<{
  visible: boolean
  value: NotebookLabelFormValue
  isEditing: boolean
  submitting: boolean
  categoryOptions: NotebookLabelCategoryOption[]
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: NotebookLabelFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<NotebookLabelFormValue>({
  categoryId: '',
  name: '',
  description: '',
})

/** 将父组件传入值同步到弹窗内部表单，供新增重置和编辑回填共用。 */
function applyValue(value: NotebookLabelFormValue): void {
  form.id = value.id
  form.categoryId = value.categoryId
  form.name = value.name
  form.description = value.description
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

const rules: FormRules<NotebookLabelFormValue> = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

/** 把弹窗显隐状态回传父组件，供关闭或外部联动时使用。 */
function handleVisibleChange(nextVisible: boolean): void {
  emit('update:visible', nextVisible)
}

/** 校验并提交弹窗表单，供点击“保存”按钮时调用。 */
async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  emit('submit', {
    id: form.id,
    categoryId: form.categoryId,
    name: form.name.trim(),
    description: form.description.trim(),
  })
}
</script>
