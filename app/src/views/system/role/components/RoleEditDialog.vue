<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改角色' : '添加角色'"
    width="560px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="system-role-edit-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="92px"
      class="system-role-edit-dialog__form"
    >
      <el-form-item
        label="角色名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          maxlength="25"
          clearable
          placeholder="请输入角色名称"
        />
      </el-form-item>

      <el-form-item
        label="角色标识"
        prop="code"
      >
        <el-input
          v-model="form.code"
          maxlength="25"
          clearable
          placeholder="请输入角色标识"
        />
      </el-form-item>

      <el-form-item
        label="状态"
        prop="status"
      >
        <el-radio-group v-model="form.status">
          <el-radio :label="1">
            在用
          </el-radio>
          <el-radio :label="2">
            停用
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          :min="0"
          controls-position="right"
          class="system-role-edit-dialog__sort"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          clearable
          placeholder="请输入备注"
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
import type { SystemRoleFormValue } from '@/types/system-role'

const props = defineProps<{
  visible: boolean
  value: SystemRoleFormValue
  isEditing: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: SystemRoleFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<SystemRoleFormValue>({
  name: '',
  code: '',
  status: 1,
  sort: 0,
  note: '',
})

function applyValue(value: SystemRoleFormValue): void {
  form.id = value.id
  form.name = value.name
  form.code = value.code
  form.status = value.status
  form.sort = value.sort
  form.note = value.note
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

const rules: FormRules<SystemRoleFormValue> = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
  status: [{ required: true, type: 'number', message: '请选择状态', trigger: 'change' }],
  sort: [{ required: true, type: 'number', message: '请输入排序', trigger: 'change' }],
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
    code: form.code.trim(),
    status: form.status,
    sort: form.sort,
    note: form.note.trim(),
  })
}
</script>

<style scoped>
.system-role-edit-dialog__sort {
  width: 180px;
}
</style>
