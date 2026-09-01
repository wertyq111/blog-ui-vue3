<template>
  <div class="auth-panel-form">
    <div class="mobile-brand">
      <img class="brand-logo" src="/favicon.ico" alt="网站图标" />
      <span>博客小岛</span>
    </div>

    <h1 class="panel-title">欢迎回来 🌿</h1>
    <p class="panel-subtitle">
      也来这座 <span class="em">小岛</span> 逛逛 —— 填好通行证就能上岸
    </p>

    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      class="login-form"
      :validate-on-rule-change="false"
    >
      <!-- 用户名 -->
      <div class="field-title">账号</div>
      <el-form-item prop="username">
        <el-input
          v-model.trim="loginFormData.username"
          :placeholder="t('login.username')"
          @focus="handleFocus('username')"
          @blur="handleBlur('username')"
          @input="handleInput('username')"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <div class="field-title">密码</div>
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            ref="passwordInputRef"
            v-model.trim="loginFormData.password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @focus="handleFocus('password')"
            @blur="handleBlur('password')"
            @input="handleInput('password')"
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
            @click="syncPasswordVisibility"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- 验证码 -->
      <div class="field-title">验证码</div>
      <el-form-item prop="captcha">
        <div flex items-center gap-10px>
          <el-input
            v-model.trim="loginFormData.captcha"
            :placeholder="t('login.captchaCode')"
            clearable
            class="flex-1"
            @focus="handleFocus('captcha')"
            @blur="handleBlur('captcha')"
            @input="handleInput('captcha')"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <div class="i-svg:captcha" />
            </template>
          </el-input>
          <div cursor-pointer h-50px w-170px flex-center @click="getCaptcha">
            <div v-if="codeLoading" class="ac-captcha-loading">
              <svg class="ac-captcha-loading-leaf" viewBox="0 0 40 40">
                <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" fill="#8ac68a" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
                <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
              </svg>
            </div>
            <img
              v-else-if="captchaBase64"
              border-rd-25px
              w-full
              h-full
              block
              object-cover
              :src="captchaBase64"
              alt="captchaCode"
              title="点击刷新验证码"
              @error="getCaptcha"
            />
            <el-text v-else type="info" size="small">点击获取验证码</el-text>
          </div>
        </div>
      </el-form-item>

      <div class="remember-row">
        <el-checkbox v-model="loginFormData.remember">30天内记住我</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="main-login-btn"
          @click="handleLoginSubmit"
        >
          {{ loading ? "登岛中..." : "上岛" }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="signup-tip">
      还不是岛民？<span>请联系岛主开通</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import AuthAPI from "@/api/auth";
import type { LoginRequest } from "@/types/api";
import router from "@/router";
import { useUserStore } from "@/store";
import { AuthStorage } from "@/utils/auth";

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

const emit = defineEmits(["update:modelValue", "field-focus", "field-blur", "password-visibility"]);

onMounted(() => getCaptcha());

const loginFormRef = ref<FormInstance>();
const passwordInputRef = ref<any>();
const loading = ref(false);
const isCapsLock = ref(false);
const captchaBase64 = ref();
const rememberMe = AuthStorage.getRememberMe();
const loginFormData = reactive<LoginRequest>({
  username: "zxf",
  password: "123456",
  captcha_key: "",
  captcha: "",
  remember: rememberMe,
});

const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captcha: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

// 获取验证码
const codeLoading = ref(false);
function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((data) => {
      loginFormData.captcha_key = data.captcha_key;
      captchaBase64.value = data.captcha_image_content;
    })
    .finally(() => (codeLoading.value = false));
}

/**
 * 登录提交
 */
async function handleLoginSubmit() {
  const valid = await loginFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    await userStore.login(loginFormData).then(
      async () => {
        const redirectPath = (route.query.redirect as string) || "/dashboard";
        await router.push(decodeURIComponent(redirectPath));
      },
      (error) => {
        getCaptcha();
        throw error;
      }
    );
  } finally {
    loading.value = false;
  }
}

function checkCapsLock(event: KeyboardEvent) {
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}

// Interaction events for CharacterScene
function handleFocus(field: string) {
  emit("field-focus", field);
  if (field === "password") {
    syncPasswordVisibility();
  }
}

function handleBlur(field: string) {
  emit("field-blur", field);
}

function handleInput(field: string) {
  if (field === "password") {
    syncPasswordVisibility();
  }
}

function syncPasswordVisibility() {
  nextTick(() => {
    const isVisible = passwordInputRef.value?.$el?.querySelector("input")?.type === "text";
    emit("password-visibility", isVisible);
  });
}

defineExpose({ loginFormData });
</script>

<style lang="scss" scoped>
.auth-panel-form {
  display: flex;
  flex-direction: column;
}

.mobile-brand {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--cyber-text);

  .brand-logo {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 8px 18px color-mix(in srgb, var(--cyber-primary) 22%, transparent);
  }
}

.panel-title {
  margin: 0;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  color: var(--cyber-text);
  text-align: center;
  letter-spacing: -0.01em;
}

.panel-subtitle {
  margin: 12px 0 26px;
  font-size: 14px;
  color: var(--cyber-text-soft);
  text-align: center;
  font-weight: 600;

  .em {
    background: #e6f9f6;
    color: var(--cyber-primary-strong);
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 800;
  }
}

.field-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--cyber-text);
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    background: color-mix(in srgb, var(--cyber-panel-strong) 94%, transparent);
    border-radius: 25px;
    border: 1px solid color-mix(in srgb, var(--cyber-border) 82%, transparent) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 12px 22px color-mix(in srgb, var(--cyber-primary) 8%, transparent) !important;

    &.is-focus {
      border-color: color-mix(in srgb, var(--cyber-primary) 46%, transparent) !important;
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--cyber-primary) 14%, transparent),
        0 18px 30px color-mix(in srgb, var(--cyber-primary) 16%, transparent) !important;
    }
  }

  :deep(.el-input__inner) {
    height: 52px;
    font-size: 16px;
    color: var(--cyber-text);
  }

  :deep(.el-input__prefix-inner) {
    font-size: 18px;
    color: var(--cyber-text-muted);
  }
}

.remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 18px;

  :deep(.el-checkbox__label) {
    font-size: 16px;
    color: var(--cyber-text);
  }

  :deep(.el-link) {
    color: var(--cyber-primary-strong);
  }
}

.main-login-btn {
  width: 100%;
  height: 54px;
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
  border-radius: 50px;
  color: #fff !important;
  background: linear-gradient(180deg, #3dd4c6 0%, var(--cyber-primary) 100%) !important;
  border: 2px solid var(--cyber-primary) !important;
  box-shadow:
    0 6px 0 0 var(--cyber-primary-strong),
    0 0 0 4px rgba(25, 200, 185, 0.18) !important;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s;

  &:hover,
  &:focus {
    color: #fff !important;
    transform: translateY(-2px);
    box-shadow:
      0 8px 0 0 var(--cyber-primary-strong),
      0 0 0 4px rgba(25, 200, 185, 0.18) !important;
  }

  &:active {
    transform: translateY(3px);
    box-shadow:
      0 1px 0 0 var(--cyber-primary-strong),
      0 0 0 4px rgba(25, 200, 185, 0.18) !important;
  }
}

.signup-tip {
  margin-top: 22px;
  font-size: 16px;
  color: var(--cyber-text-muted);
  text-align: center;

  span {
    font-weight: 600;
    color: var(--cyber-text);
  }
}

/* Responsive */
@media screen and (max-width: 1024px) {
  .mobile-brand {
    display: flex;
  }

  .panel-title,
  .panel-subtitle {
    text-align: left;
  }
}

@media screen and (max-width: 768px) {
  .panel-title {
    font-size: 28px;
  }
}

/* 验证码动森风专属 Loading */
.ac-captcha-loading {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fffef6;
  border: 2.5px dashed var(--ai-border);
  border-radius: 25px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.25s;

  &:hover {
    border-color: var(--ai-primary);
  }
}

.ac-captcha-loading-leaf {
  width: 24px;
  height: 24px;
  animation: ac-captcha-leaf-spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes ac-captcha-leaf-spin {
  0% { transform: rotate(0deg) scale(0.95); }
  50% { transform: rotate(180deg) scale(1.15); }
  100% { transform: rotate(360deg) scale(0.95); }
}
</style>
