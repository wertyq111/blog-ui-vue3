<template>
  <section class="login-page">
    <div class="login-page__panel">
      <div class="login-page__copy">
        <div class="login-page__eyebrow">
          Vue3 Migration Shell
        </div>
        <h1>个人博客管理台</h1>
        <p>先完成登录、用户态恢复和动态菜单闭环，再推进后续业务波次迁移。</p>
      </div>

      <el-form
        class="login-page__form"
        label-position="top"
        @submit.prevent="submit"
      >
        <el-form-item label="账号">
          <el-input
            v-model="form.username"
            autocomplete="username"
            placeholder="请输入账号"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            autocomplete="current-password"
            placeholder="请输入密码"
            show-password
            type="password"
          />
        </el-form-item>

        <el-form-item label="验证码">
          <div class="login-page__captcha-row">
            <el-input
              v-model="form.captcha"
              placeholder="请输入验证码"
            />
            <button
              class="login-page__captcha-image"
              type="button"
              @click="reloadCaptcha"
            >
              <img
                v-if="captchaImage"
                :src="captchaImage"
                alt="captcha"
              >
              <span v-else>刷新验证码</span>
            </button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="form.remember">
            记住登录状态
          </el-checkbox>
        </el-form-item>

        <el-button
          :loading="submitting"
          class="login-page__submit"
          type="primary"
          @click="submit"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'

import { fetchCaptcha } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { resolveAuthRedirect } from '@/router/guards'
import { extractErrorMessage } from '@/utils/http'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const submitting = ref(false)
const captchaImage = ref('')
const form = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaKey: '',
  remember: true,
})

async function reloadCaptcha(): Promise<void> {
  try {
    const captcha = await fetchCaptcha()

    captchaImage.value = captcha.captchaImageContent
    form.captchaKey = captcha.captchaKey
  } catch (error) {
    ElMessage.error(extractErrorMessage(error))
  }
}

async function submit(): Promise<void> {
  if (!form.username || !form.password || !form.captcha) {
    ElMessage.error('请完整填写登录信息和验证码')
    return
  }

  submitting.value = true

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      captchaKey: form.captchaKey,
      remember: form.remember,
    })

    ElMessage.success('登录成功')
    await router.push(resolveAuthRedirect(route.query, authStore.homePath))
  } catch (error) {
    ElMessage.error(extractErrorMessage(error))
    await reloadCaptcha()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void reloadCaptcha()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 35%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.2), transparent 30%),
    linear-gradient(180deg, #0f172a 0%, #16213d 100%);
}

.login-page__panel {
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 380px);
  gap: 28px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.24);
}

.login-page__copy h1 {
  margin: 8px 0 12px;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.05;
  color: #0f172a;
}

.login-page__copy p {
  margin: 0;
  max-width: 28ch;
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
}

.login-page__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0284c7;
}

.login-page__form {
  padding: 24px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
}

.login-page__captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 138px;
  gap: 12px;
}

.login-page__captcha-image {
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  background: white;
  cursor: pointer;
  overflow: hidden;
}

.login-page__captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-page__submit {
  width: 100%;
}

@media (max-width: 768px) {
  .login-page__panel {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>
