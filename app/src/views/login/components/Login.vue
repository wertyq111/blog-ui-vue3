<template>
  <div class="auth-panel-form">
    <div class="mobile-brand">
      <img class="brand-logo" src="/favicon.ico" alt="网站图标" />
      <span>个人博客</span>
    </div>

    <h1 class="panel-title">欢迎回来！</h1>
    <p class="panel-subtitle">请填写账号信息继续访问后台</p>

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
            <el-icon v-if="codeLoading" class="is-loading" size="20"><Loading /></el-icon>
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
          {{ loading ? "登录中..." : "登录" }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="signup-tip">
      没有账号？
      <span>请联系管理员开通</span>
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
  username: "admin",
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
        const redirectPath = (route.query.redirect as string) || "/";
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
  color: #111827;

  .brand-logo {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  }
}

.panel-title {
  margin: 0;
  font-size: 56px;
  font-weight: 700;
  line-height: 1.16;
  color: #0f172a;
  text-align: center;
}

.panel-subtitle {
  margin: 14px 0 36px;
  font-size: 16px;
  color: #64748b;
  text-align: center;
}

.field-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    background: #fff;
    border-radius: 25px;
    box-shadow: 0 0 0 1px #d7dce5 inset;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  :deep(.el-input__inner) {
    height: 50px;
    font-size: 16px;
  }

  :deep(.el-input__prefix-inner) {
    font-size: 18px;
  }
}

.remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 18px;

  :deep(.el-checkbox__label) {
    font-size: 16px;
    color: #111827;
  }
}

.main-login-btn {
  width: 100%;
  height: 52px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  border-radius: 26px;
}

.signup-tip {
  margin-top: 22px;
  font-size: 16px;
  color: #64748b;
  text-align: center;

  span {
    font-weight: 600;
    color: #111827;
  }
}

// Dark Mode Styles
.dark {
  .mobile-brand {
    color: #f3f4f6;
  }

  .panel-title {
    color: #f3f4f6;
  }

  .panel-subtitle {
    color: #9ca3af;
  }

  .field-title {
    color: #e5e7eb;
  }

  .login-form :deep(.el-input__wrapper) {
    background: #1f2937;
    box-shadow: 0 0 0 1px #374151 inset;
  }

  .remember-row :deep(.el-checkbox__label) {
    color: #e5e7eb;
  }

  .signup-tip {
    color: #9ca3af;

    span {
      color: #f3f4f6;
    }
  }
}

/* Responsive */
@media screen and (max-width: 1280px) {
  .panel-title {
    font-size: 46px;
  }

  .panel-subtitle {
    font-size: 15px;
  }

  .field-title,
  .remember-row :deep(.el-checkbox__label),
  .main-login-btn,
  .signup-tip {
    font-size: 15px;
  }
}

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
    font-size: 40px;
  }

  .main-login-btn {
    height: 46px;
  }
}
</style>
