<template>
  <AppDialog
    :visible="visible"
    title="生成模板"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="init-model-convert-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="init-model-convert-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item label="框架编码">
            <div class="init-model-convert-dialog__static">
              {{ source?.code ?? '-' }}
            </div>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="框架名称">
            <div class="init-model-convert-dialog__static">
              {{ source?.name ?? '-' }}
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="模板字段"
        prop="column"
      >
        <el-input
          v-model="form.column"
          type="textarea"
          :rows="5"
          :placeholder="source?.tip || '每行输入一个模板字段'"
        />
      </el-form-item>

      <el-form-item label="生成结果">
        <el-input
          :model-value="result"
          type="textarea"
          :rows="8"
          readonly
          placeholder="生成结果会展示在这里"
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
        生成
      </el-button>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { InitModelConvertValue, InitModelRow } from '@/types/init-model'

const props = defineProps<{
  visible: boolean
  source: InitModelRow | null
  value: InitModelConvertValue
  result: string
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: InitModelConvertValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<InitModelConvertValue>({
  column: '',
})

watch(
  () => props.value,
  (value) => {
    form.column = value.column
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const rules: FormRules<InitModelConvertValue> = {
  column: [{ required: true, message: '请输入模板字段', trigger: 'blur' }],
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
    column: form.column,
  })
}
</script>

<style scoped>
.init-model-convert-dialog__form {
  padding-top: 4px;
}

.init-model-convert-dialog__static {
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  line-height: 1.5;
}
</style>
