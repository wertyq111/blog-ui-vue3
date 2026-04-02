<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改平台' : '添加平台'"
    width="560px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="work-platform-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      class="work-platform-edit-dialog__form"
    >
      <el-form-item
        label="平台名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          clearable
          maxlength="50"
          placeholder="请输入平台名称"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="状态"
            prop="status"
          >
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="form.sort"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import type { WorkPlatformFormValue } from '@/types/work-platform'

const props = defineProps<{
  visible: boolean
  value: WorkPlatformFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: WorkPlatformFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<WorkPlatformFormValue>({
  name: '',
  status: 1,
  sort: 0,
})

function applyValue(value: WorkPlatformFormValue): void {
  form.id = value.id
  form.name = value.name
  form.status = value.status
  form.sort = value.sort
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

const rules: FormRules<WorkPlatformFormValue> = {
  name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
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
    name: form.name.trim(),
    status: form.status,
    sort: form.sort,
  })
}
</script>

<style scoped>
.work-platform-edit-dialog__form {
  padding-top: 4px;
}
</style>
