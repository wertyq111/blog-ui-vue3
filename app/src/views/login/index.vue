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
      <div class="language-switch">
        <LangSelect size="text-22px" />
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
import CharacterScene from "./components/CharacterScene.vue";

type LayoutMap = "login" | "register" | "resetPwd";

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
  min-height: 100vh;
  overflow: hidden;
  background: transparent;
  font-family: inherit;
}

.login-visual {
  position: relative;
  flex: 1;
  min-width: 520px;
  overflow: hidden;
  background:
    radial-gradient(circle at 24% 18%, rgba(232, 168, 124, 0.28), transparent 52%),
    radial-gradient(circle at 82% 30%, rgba(240, 190, 154, 0.22), transparent 36%),
    linear-gradient(160deg, #e8a87c 0%, #f0be9a 42%, #f4d4b8 100%);
}

.login-main {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.2));
  backdrop-filter: blur(18px);
}

.language-switch {
  position: absolute;
  top: 26px;
  right: 28px;
  z-index: 2;
  color: var(--cyber-text-soft);
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
    box-shadow: 0 4px 14px rgba(90, 66, 48, 0.18);
  }

  .brand-text {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #fff;
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
    color: rgba(255, 255, 255, 0.58);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.login-panel {
  width: 440px;
  max-width: calc(100% - 48px);
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

  .language-switch {
    color: #64748b;
  }
}

@media (max-width: 768px) {
  .login-main {
    align-items: flex-start;
    padding-top: 84px;
  }
}
</style>
