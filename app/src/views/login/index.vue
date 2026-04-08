<template>
  <div class="login-page">
    <section class="login-visual">
      <div class="visual-brand">
        <img class="brand-logo" src="/favicon.ico" alt="网站图标" />
        <span class="brand-text">个人博客</span>
      </div>

      <CharacterScene
        :active-field="activeField"
        :is-password-visible="isPasswordVisible"
        :form="loginFormRef?.loginFormData || {}"
      />

      <div class="visual-legal">
        <a href="https://beian.miit.gov.cn/" target="_blank">隐私政策</a>
        <a href="https://beian.miit.gov.cn/" target="_blank">服务条款</a>
      </div>
    </section>

    <section class="login-main">
      <div class="auth-view__toolbar">
        <el-tooltip :content="t('login.themeToggle')" placement="bottom">
          <div class="toolbar-item">
            <ThemeSwitch />
          </div>
        </el-tooltip>
        <el-tooltip :content="t('login.languageToggle')" placement="bottom">
          <div class="toolbar-item">
            <LangSelect size="text-20px" />
          </div>
        </el-tooltip>
      </div>

      <div class="login-panel">
        <transition name="fade-slide" mode="out-in">
          <component
            :is="formComponents[component]"
            ref="loginFormRef"
            v-model="component"
            class="auth-panel__form"
            @field-focus="activeField = $event"
            @field-blur="activeField = ''"
            @password-visibility="isPasswordVisible = $event"
          />
        </transition>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import CharacterScene from "./components/CharacterScene.vue";

type LayoutMap = "login" | "register" | "resetPwd";

const { t } = useI18n();
const component = ref<LayoutMap>("login");

const activeField = ref("");
const isPasswordVisible = ref(false);
const loginFormRef = ref<any>(null);

const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
  register: defineAsyncComponent(() => import("./components/Register.vue")),
  resetPwd: defineAsyncComponent(() => import("./components/ResetPwd.vue")),
};
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background-color: #f8f9fb;
}

.login-visual {
  position: relative;
  flex: 1;
  min-width: 520px;
  overflow: hidden;
  background:
    radial-gradient(circle at 24% 18%, rgba(182, 193, 208, 0.38), transparent 52%),
    radial-gradient(circle at 82% 30%, rgba(74, 85, 105, 0.3), transparent 36%),
    linear-gradient(160deg, #6f798b 0%, #5e6879 42%, #596476 100%);
}

.login-main {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fb;
}

.auth-view__toolbar {
  position: absolute;
  top: 26px;
  right: 28px;
  z-index: 10;
  display: inline-flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(22, 93, 255, 0.15);
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(22, 93, 255, 0.12);

  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--el-fill-color);
    }
  }
}

.visual-brand {
  position: absolute;
  top: 48px;
  left: 48px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;

  .brand-logo {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  }

  .brand-text {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #f2f6ff;
  }
}

.visual-legal {
  position: absolute;
  bottom: 42px;
  left: 48px;
  display: flex;
  gap: 28px;

  a {
    font-size: 14px;
    color: rgba(225, 233, 244, 0.52);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: rgba(225, 233, 244, 0.9);
    }
  }
}

.login-panel {
  width: 440px;
  max-width: calc(100% - 48px);
}

// Dark Mode Support
.dark {
  .login-page,
  .login-main {
    background-color: #111827;
  }

  .auth-view__toolbar {
    background-color: rgba(31, 41, 55, 0.85);
    border-color: rgba(55, 65, 81, 0.5);
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

/* Responsive */
@media (max-width: 1024px) {
  .login-visual {
    display: none;
  }

  .login-main {
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .login-main {
    align-items: flex-start;
    padding-top: 84px;
  }
}
</style>
