<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改框架模板' : '添加框架模板'"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="init-model-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="init-model-edit-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="框架编码"
            prop="code"
          >
            <el-input
              v-model="form.code"
              clearable
              maxlength="20"
              placeholder="请输入框架编码"
            />
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="框架名称"
            prop="name"
          >
            <el-input
              v-model="form.name"
              clearable
              maxlength="20"
              placeholder="请输入框架名称"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="模板提示"
        prop="tip"
      >
        <el-input
          v-model="form.tip"
          clearable
          maxlength="255"
          placeholder="请输入模板提示"
        />
      </el-form-item>

      <el-form-item
        label="模型模板"
        prop="template"
      >
        <el-input
          v-model="form.template"
          type="textarea"
          :rows="8"
          placeholder="请输入模型模板"
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
import type { InitModelFormValue } from '@/types/init-model'

const props = defineProps<{
  visible: boolean
  value: InitModelFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: InitModelFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<InitModelFormValue>({
  code: '',
  name: '',
  tip: '',
  template: '',
})

function applyValue(value: InitModelFormValue): void {
  form.id = value.id
  form.code = value.code
  form.name = value.name
  form.tip = value.tip
  form.template = value.template
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

const rules: FormRules<InitModelFormValue> = {
  code: [{ required: true, message: '请输入框架编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入框架名称', trigger: 'blur' }],
  tip: [{ required: true, message: '请输入模板提示', trigger: 'blur' }],
  template: [{ required: true, message: '请输入模型模板', trigger: 'blur' }],
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
    code: form.code.trim(),
    name: form.name.trim(),
    tip: form.tip.trim(),
    template: form.template.trim(),
  })
}
</script>

<style scoped>
.init-model-edit-dialog__form {
  padding-top: 4px;
}
</style>
