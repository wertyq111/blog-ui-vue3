<template>
  <section class="system-user-info-page">
    <header class="system-user-info-page__hero">
      <div>
        <div class="system-user-info-page__eyebrow">
          System Management
        </div>
        <h1>个人资料</h1>
        <p>维护当前登录用户的基础资料。当前按后端已确认契约，仅迁移可稳定落地字段。</p>
      </div>
    </header>

    <el-card shadow="never">
      <div class="system-user-info-page__meta">
        <el-tag
          type="info"
          effect="plain"
        >
          用户 ID: {{ profileId ?? '-' }}
        </el-tag>
        <el-tag
          type="primary"
          effect="plain"
        >
          账号: {{ username || '-' }}
        </el-tag>
      </div>

      <el-form
        ref="formRef"
        v-loading="loading"
        :model="form"
        :rules="rules"
        label-width="92px"
        class="system-user-info-page__form"
      >
        <el-row :gutter="16">
          <el-col :md="12">
            <el-form-item
              label="用户姓名"
              prop="realname"
            >
              <el-input
                v-model="form.realname"
                maxlength="20"
                clearable
                placeholder="请输入用户姓名"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="用户昵称"
              prop="nickname"
            >
              <el-input
                v-model="form.nickname"
                maxlength="20"
                clearable
                placeholder="请输入用户昵称"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="性别"
              prop="gender"
            >
              <el-select
                v-model="form.gender"
                clearable
                placeholder="请选择性别"
                style="width: 100%"
              >
                <el-option
                  label="男"
                  :value="1"
                />
                <el-option
                  label="女"
                  :value="2"
                />
                <el-option
                  label="保密"
                  :value="3"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="手机号"
              prop="mobile"
            >
              <el-input
                v-model="form.mobile"
                maxlength="11"
                clearable
                placeholder="请输入手机号"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="邮箱"
              prop="email"
            >
              <el-input
                v-model="form.email"
                maxlength="100"
                clearable
                placeholder="请输入邮箱"
              />
            </el-form-item>
          </el-col>

          <el-col :md="12">
            <el-form-item
              label="头像地址"
              prop="avatar"
            >
              <el-input
                v-model="form.avatar"
                maxlength="255"
                clearable
                placeholder="请输入头像地址或对象存储 key"
              />
            </el-form-item>
          </el-col>

          <el-col :md="24">
            <el-form-item
              label="详细地址"
              prop="address"
            >
              <el-input
                v-model="form.address"
                maxlength="150"
                clearable
                placeholder="请输入详细地址"
              />
            </el-form-item>
          </el-col>

          <el-col :md="24">
            <el-form-item
              label="个人简介"
              prop="intro"
            >
              <el-input
                v-model="form.intro"
                type="textarea"
                :rows="4"
                maxlength="200"
                show-word-limit
                placeholder="请输入个人简介"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item class="system-user-info-page__actions">
          <el-button
            type="primary"
            :loading="saving"
            @click="handleSubmit"
          >
            保存更改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

import type { SystemUserProfileFormValue } from '@/types/system-user'

import { useUserInfoPage } from './use-user-info-page'

const page = useUserInfoPage()
const { profileId, username, loading, saving, form, loadProfile, submitProfile } = page

const formRef = ref<FormInstance>()

const rules: FormRules<SystemUserProfileFormValue> = {
  realname: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
}

/** 校验并提交个人资料表单，供页面点击“保存更改”按钮时调用。 */
async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)

  if (!valid) {
    return
  }

  await submitProfile()
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.system-user-info-page {
  display: grid;
  gap: 20px;
}

.system-user-info-page__hero {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(129, 140, 248, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 242, 255, 0.96) 100%);
  border: 1px solid rgba(129, 140, 248, 0.2);
}

.system-user-info-page__hero h1 {
  margin: 8px 0 12px;
  font-size: clamp(24px, 4vw, 34px);
  color: #1e1b4b;
}

.system-user-info-page__hero p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.system-user-info-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4f46e5;
}

.system-user-info-page__meta {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.system-user-info-page__actions {
  margin-bottom: 0;
}
</style>
