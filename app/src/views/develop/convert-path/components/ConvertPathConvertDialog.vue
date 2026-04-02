<template>
  <AppDialog
    :visible="visible"
    title="转换路径"
    width="760px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="convert-path-convert-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      class="convert-path-convert-dialog__form"
    >
      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item label="项目编码">
            <div class="convert-path-convert-dialog__static">
              {{ source?.code ?? '-' }}
            </div>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="项目名称">
            <div class="convert-path-convert-dialog__static">
              {{ source?.name ?? '-' }}
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="待转换路径"
        prop="path"
      >
        <el-input
          v-model="form.path"
          type="textarea"
          :rows="5"
          placeholder="每行输入一个待转换路径"
        />
      </el-form-item>

      <el-form-item label="转换结果">
        <el-input
          :model-value="result"
          type="textarea"
          :rows="6"
          readonly
          placeholder="转换结果会展示在这里"
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
        转换
      </el-button>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import AppDialog from '@/components/AppDialog.vue'
import type { ServerPathConvertValue, ServerPathRow } from '@/types/server-path'

const props = defineProps<{
  visible: boolean
  source: ServerPathRow | null
  value: ServerPathConvertValue
  result: string
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: ServerPathConvertValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<ServerPathConvertValue>({
  path: '',
})

watch(
  () => props.value,
  (value) => {
    form.path = value.path
    formRef.value?.clearValidate()
  },
  {
    deep: true,
    immediate: true,
  },
)

const rules: FormRules<ServerPathConvertValue> = {
  path: [{ required: true, message: '请输入待转换路径', trigger: 'blur' }],
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
    path: form.path,
  })
}
</script>

<style scoped>
.convert-path-convert-dialog__form {
  padding-top: 4px;
}

.convert-path-convert-dialog__static {
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  line-height: 1.5;
}
</style>
