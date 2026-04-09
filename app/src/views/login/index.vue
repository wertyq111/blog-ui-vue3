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

:global(body.cyber-theme-dark) .login-page {
  background: transparent;
}

:global(body.cyber-theme-dark) .login-visual {
  background:
    radial-gradient(circle at 18% 20%, rgba(24, 168, 255, 0.18), transparent 34%),
    radial-gradient(circle at 82% 18%, rgba(54, 233, 220, 0.1), transparent 28%),
    linear-gradient(160deg, #07111d 0%, #111c2a 42%, #09111e 100%);
}

:global(body.cyber-theme-dark) .login-main {
  background: linear-gradient(180deg, rgba(7, 17, 29, 0.56), rgba(7, 17, 29, 0.24));
}

:global(body.cyber-theme-dark) .language-switch {
  color: rgba(202, 224, 248, 0.78);
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
