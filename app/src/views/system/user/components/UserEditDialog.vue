<template>
  <AppDialog
    :visible="visible"
    :title="isEditing ? '修改用户' : '添加用户'"
    width="680px"
    destroy-on-close
    :lock-scroll="false"
    custom-class="system-user-dialog"
    @update:visible="handleVisibleChange"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      class="system-user-dialog__form"
    >
      <div class="system-user-dialog__desc">
        维护后台账号、角色和状态。批量删除与隐藏详情页仍等待远端契约验证。
      </div>

      <el-row :gutter="16">
        <el-col :sm="12">
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input
              v-model="form.email"
              clearable
              maxlength="100"
              placeholder="请输入邮箱"
            />
          </el-form-item>

          <el-form-item
            label="用户账号"
            prop="username"
          >
            <el-input
              v-model="form.username"
              :disabled="isEditing"
              clearable
              maxlength="20"
              placeholder="请输入用户账号"
            />
          </el-form-item>

          <el-form-item
            label="登录密码"
            prop="password"
          >
            <el-input
              v-model="form.password"
              maxlength="20"
              placeholder="请输入登录密码"
              show-password
            />
          </el-form-item>
        </el-col>

        <el-col :sm="12">
          <el-form-item
            label="手机号"
            prop="phone"
          >
            <el-input
              v-model="form.phone"
              clearable
              maxlength="11"
              placeholder="请输入手机号"
            />
          </el-form-item>

          <el-form-item
            label="角色"
            prop="roleIds"
          >
            <el-select
              v-model="form.roleIds"
              clearable
              multiple
              placeholder="请选择角色"
              style="width: 100%"
            >
              <el-option
                v-for="option in roleOptions"
                :key="option.id"
                :label="option.name"
                :value="option.id"
              />
            </el-select>
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
                禁用
              </el-radio>
            </el-radio-group>
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

import type { SystemRoleOption, SystemUserFormValue } from '@/types/system-user'
import { extractErrorMessage } from '@/utils/http'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^1\d{10}$/

const props = defineProps<{
  visible: boolean
  value: SystemUserFormValue
  isEditing: boolean
  submitting: boolean
  roleOptions: SystemRoleOption[]
  checkUsernameAvailable: (username: string) => Promise<boolean>
}>()

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void
  (event: 'submit', value: SystemUserFormValue): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<SystemUserFormValue>({
  username: '',
  email: '',
  phone: '',
  password: '',
  roleIds: [],
  status: 1,
})

function applyValue(value: SystemUserFormValue): void {
  form.id = value.id
  form.username = value.username
  form.email = value.email
  form.phone = value.phone
  form.password = value.password
  form.roleIds = [...value.roleIds]
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

const rules: FormRules<SystemUserFormValue> = {
  username: [
    {
      required: true,
      message: '请输入用户账号',
      trigger: 'blur',
    },
    {
      asyncValidator: async (_rule, value: string, callback) => {
        if (!value || props.isEditing) {
          callback()
          return
        }

        try {
          const available = await props.checkUsernameAvailable(value)

          if (!available) {
            callback(new Error('账号已经存在'))
            return
          }

          callback()
        } catch (error) {
          callback(new Error(extractErrorMessage(error)))
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || EMAIL_PATTERN.test(value)) {
          callback()
          return
        }

        callback(new Error('邮箱格式不正确'))
      },
      trigger: 'blur',
    },
  ],
  phone: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || PHONE_PATTERN.test(value)) {
          callback()
          return
        }

        callback(new Error('手机号格式不正确'))
      },
      trigger: 'blur',
    },
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'change',
    },
  ],
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
    username: form.username,
    email: form.email,
    phone: form.phone,
    password: form.password,
    roleIds: [...form.roleIds],
    status: form.status,
  })
}
</script>

<style scoped>
.system-user-dialog__form {
  padding-top: 4px;
}

.system-user-dialog__desc {
  margin-bottom: 16px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
