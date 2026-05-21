<template>
  <div class="login-page">
    <!-- ===== LEFT: Island scene ===== -->
    <section class="login-visual">
      <a class="visual-brand" href="/">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c4 0 8-2 11-7 2-3 3-7 3-11-4 0-8 1-11 4-3 3-5 7-5 12 0 1 0 2 2 2z"/>
          </svg>
        </div>
        <span class="brand-text">博客小岛</span>
      </a>

      <div class="welcome-chip">
        <span class="welcome-chip-dot"></span>
        WELCOME · 欢迎登岛
      </div>

      <!-- Sun -->
      <div class="sun"></div>

      <!-- Clouds -->
      <svg class="cloud cloud-1" viewBox="0 0 140 60" fill="#fff">
        <ellipse cx="40" cy="40" rx="38" ry="18"/><ellipse cx="80" cy="30" rx="32" ry="20"/><ellipse cx="115" cy="42" rx="20" ry="14"/>
      </svg>
      <svg class="cloud cloud-2" viewBox="0 0 100 50" fill="#fff">
        <ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/>
      </svg>
      <svg class="cloud cloud-3" viewBox="0 0 80 40" fill="#fff">
        <ellipse cx="22" cy="22" rx="20" ry="11"/><ellipse cx="50" cy="18" rx="20" ry="12"/><ellipse cx="68" cy="26" rx="10" ry="8"/>
      </svg>

      <!-- Butterfly -->
      <svg class="butterfly" viewBox="0 0 40 30">
        <ellipse cx="14" cy="14" rx="9" ry="11" fill="#f8a6b2"/>
        <ellipse cx="14" cy="20" rx="7" ry="8" fill="#fc736d"/>
        <ellipse cx="26" cy="14" rx="9" ry="11" fill="#f8a6b2"/>
        <ellipse cx="26" cy="20" rx="7" ry="8" fill="#fc736d"/>
        <rect x="19" y="10" width="2" height="16" rx="1" fill="#5a3a18"/>
        <circle cx="20" cy="9" r="2" fill="#5a3a18"/>
      </svg>

      <!-- Tree -->
      <svg class="tree" viewBox="0 0 220 280">
        <rect x="92" y="160" width="36" height="120" rx="8" fill="#8a6a3a" stroke="#5a3a18" stroke-width="3"/>
        <path d="M92 220 Q 100 230 92 240 M128 220 Q 120 230 128 240" stroke="#5a3a18" stroke-width="2" fill="none"/>
        <ellipse cx="60" cy="150" rx="60" ry="56" fill="#7cba70" stroke="#4a8a36" stroke-width="3"/>
        <ellipse cx="160" cy="150" rx="60" ry="56" fill="#7cba70" stroke="#4a8a36" stroke-width="3"/>
        <ellipse cx="110" cy="100" rx="78" ry="64" fill="#8ac68a" stroke="#4a8a36" stroke-width="3"/>
        <circle cx="80" cy="120" r="8" fill="#fc736d" stroke="#a02a2a" stroke-width="2"/>
        <circle cx="140" cy="80" r="8" fill="#fc736d" stroke="#a02a2a" stroke-width="2"/>
        <circle cx="160" cy="140" r="8" fill="#fc736d" stroke="#a02a2a" stroke-width="2"/>
        <circle cx="55" cy="155" r="8" fill="#fc736d" stroke="#a02a2a" stroke-width="2"/>
        <path d="M80 112 q 2 -4 6 -4" stroke="#3a2a10" stroke-width="2" fill="none"/>
        <path d="M140 72 q 2 -4 6 -4" stroke="#3a2a10" stroke-width="2" fill="none"/>
      </svg>

      <!-- Bushes -->
      <svg class="bush bush-1" viewBox="0 0 200 90">
        <ellipse cx="40" cy="60" rx="40" ry="30" fill="#7cba70" stroke="#4a8a36" stroke-width="2.5"/>
        <ellipse cx="100" cy="50" rx="50" ry="36" fill="#8ac68a" stroke="#4a8a36" stroke-width="2.5"/>
        <ellipse cx="160" cy="62" rx="36" ry="28" fill="#7cba70" stroke="#4a8a36" stroke-width="2.5"/>
        <circle cx="80" cy="40" r="5" fill="#fff"/><circle cx="120" cy="46" r="5" fill="#f8a6b2"/>
      </svg>
      <svg class="bush bush-2" viewBox="0 0 160 70">
        <ellipse cx="40" cy="45" rx="36" ry="24" fill="#a3d68e" stroke="#5c9c5c" stroke-width="2.5"/>
        <ellipse cx="110" cy="40" rx="42" ry="30" fill="#8ac68a" stroke="#5c9c5c" stroke-width="2.5"/>
      </svg>

      <!-- Grass tufts -->
      <svg class="tuft tuft-1" viewBox="0 0 50 30">
        <path d="M10 30 Q 12 8 16 6 Q 18 18 20 30 M22 30 Q 26 4 30 4 Q 30 16 32 30 M34 30 Q 38 12 42 12 Q 40 22 42 30" stroke="#4a8a36" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      <svg class="tuft tuft-2" viewBox="0 0 40 24">
        <path d="M5 24 Q 8 4 12 4 M18 24 Q 22 0 26 2 M28 24 Q 32 8 36 10" stroke="#4a8a36" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      <svg class="tuft tuft-3" viewBox="0 0 36 22">
        <path d="M4 22 Q 8 4 12 4 M16 22 Q 20 2 24 4 M26 22 Q 30 8 32 10" stroke="#4a8a36" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>

      <!-- Flowers -->
      <svg class="flower flower-1" viewBox="0 0 30 50">
        <line x1="15" y1="50" x2="15" y2="22" stroke="#4a8a36" stroke-width="2"/>
        <circle cx="15" cy="12" r="5" fill="#f8a6b2"/><circle cx="8" cy="16" r="5" fill="#f8a6b2"/>
        <circle cx="22" cy="16" r="5" fill="#f8a6b2"/><circle cx="11" cy="22" r="5" fill="#f8a6b2"/>
        <circle cx="19" cy="22" r="5" fill="#f8a6b2"/><circle cx="15" cy="17" r="3" fill="#f7cd67"/>
      </svg>
      <svg class="flower flower-2" viewBox="0 0 36 60">
        <line x1="18" y1="60" x2="18" y2="28" stroke="#4a8a36" stroke-width="2"/>
        <circle cx="18" cy="14" r="6" fill="#fff"/><circle cx="9" cy="18" r="6" fill="#fff"/>
        <circle cx="27" cy="18" r="6" fill="#fff"/><circle cx="12" cy="26" r="6" fill="#fff"/>
        <circle cx="24" cy="26" r="6" fill="#fff"/><circle cx="18" cy="20" r="4" fill="#f7cd67"/>
      </svg>
      <svg class="flower flower-3" viewBox="0 0 26 40">
        <line x1="13" y1="40" x2="13" y2="18" stroke="#4a8a36" stroke-width="2"/>
        <circle cx="13" cy="10" r="4" fill="#b77dee"/><circle cx="7" cy="14" r="4" fill="#b77dee"/>
        <circle cx="19" cy="14" r="4" fill="#b77dee"/><circle cx="13" cy="14" r="2.5" fill="#fff2ba"/>
      </svg>

      <!-- Signpost -->
      <div class="signpost">
        <div class="plank">岛主回家路 →</div>
        <div class="post"></div>
      </div>

      <!-- Ground -->
      <div class="ground"></div>

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

    <!-- ===== RIGHT: Form ===== -->
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

/* ===== LEFT: Island scene ===== */
.login-visual {
  position: relative;
  flex: 1;
  min-width: 520px;
  overflow: hidden;
  background:
    radial-gradient(1100px 700px at 50% 0%, #d6f0db 0%, transparent 60%),
    radial-gradient(900px 600px at 90% 30%, #ffe5b7 0%, transparent 55%),
    linear-gradient(180deg, #cce8d5 0%, #b5d4a5 70%, #8fc384 100%);
}

.visual-brand {
  position: absolute;
  top: 36px;
  left: 40px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--cyber-primary) 0%, #82d5bb 100%);
  border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 0 0 var(--cyber-primary-strong);
  color: #fff;

  svg {
    width: 26px;
    height: 26px;
  }
}

.brand-text {
  font-size: 22px;
  font-weight: 800;
  color: var(--cyber-text);
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

.welcome-chip {
  position: absolute;
  top: 100px;
  left: 40px;
  z-index: 4;
  background: #fff;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  color: var(--cyber-primary-strong);
  letter-spacing: 3px;
  box-shadow: 0 3px 0 0 #bdaea0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.welcome-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyber-primary);
  box-shadow: 0 0 0 4px rgba(25, 200, 185, 0.2);
}

/* Sun */
.sun {
  position: absolute;
  top: 12%;
  right: 12%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #fff4c0 0%, #ffd97a 60%, transparent 70%);
  border-radius: 50%;
  filter: blur(2px);
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    inset: 26px;
    background: linear-gradient(135deg, #fff5c0, #ffd17a);
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(255, 217, 122, 0.6);
  }
}

/* Clouds */
.cloud {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.04));
}

.cloud-1 {
  top: 8%;
  left: 8%;
  width: 140px;
  animation: drift 26s linear infinite;
}

.cloud-2 {
  top: 18%;
  left: 38%;
  width: 100px;
  animation: drift 32s linear infinite reverse;
}

.cloud-3 {
  top: 26%;
  left: 60%;
  width: 80px;
  animation: drift 20s linear infinite;
}

@keyframes drift {
  0% { transform: translateX(0); }
  50% { transform: translateX(40px); }
  100% { transform: translateX(0); }
}

/* Butterfly */
.butterfly {
  position: absolute;
  top: 28%;
  left: 22%;
  width: 36px;
  height: 26px;
  z-index: 4;
  animation: flutter 14s ease-in-out infinite;
}

@keyframes flutter {
  0% { transform: translate(0, 0) rotate(-10deg); }
  20% { transform: translate(50px, -30px) rotate(8deg); }
  40% { transform: translate(120px, -10px) rotate(-12deg); }
  60% { transform: translate(180px, -40px) rotate(8deg); }
  80% { transform: translate(120px, -20px) rotate(-10deg); }
  100% { transform: translate(0, 0) rotate(-10deg); }
}

/* Tree */
.tree {
  position: absolute;
  left: -40px;
  bottom: 80px;
  width: 220px;
  height: 280px;
  z-index: 2;
}

/* Bushes */
.bush {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.bush-1 {
  right: 60px;
  bottom: 100px;
  width: 200px;
}

.bush-2 {
  left: 200px;
  bottom: 50px;
  width: 160px;
  opacity: 0.85;
}

/* Ground */
.ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 130px;
  background: linear-gradient(180deg, transparent 0%, rgba(110, 170, 90, 0.05) 30%, #6dab66 60%, #5a9858 100%);
  z-index: 2;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -28px;
    height: 40px;
    background:
      radial-gradient(40px 28px at 30px 28px, #7cba70 50%, transparent 51%) repeat-x,
      radial-gradient(60px 36px at 60px 30px, #6dab66 50%, transparent 51%) repeat-x;
    background-size: 70px 28px, 110px 30px;
    background-position: 0 0, 30px 4px;
  }
}

/* Grass tufts */
.tuft {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.tuft-1 {
  left: 6%;
  bottom: 30px;
  width: 50px;
}

.tuft-2 {
  left: 88%;
  bottom: 25px;
  width: 40px;
}

.tuft-3 {
  left: 30%;
  bottom: 18px;
  width: 36px;
}

/* Flowers */
.flower {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.flower-1 {
  left: 12%;
  bottom: 50px;
  width: 26px;
}

.flower-2 {
  left: 76%;
  bottom: 60px;
  width: 32px;
}

.flower-3 {
  left: 56%;
  bottom: 32px;
  width: 22px;
}

/* Signpost */
.signpost {
  position: absolute;
  right: 60px;
  bottom: 100px;
  z-index: 4;
  width: 100px;
  transform: rotate(-3deg);
}

.signpost .post {
  position: absolute;
  left: 46px;
  top: 60px;
  width: 8px;
  height: 60px;
  background: #8a6a3a;
  border-radius: 4px;
  box-shadow: inset -2px 0 0 rgba(0, 0, 0, 0.15);
}

.signpost .plank {
  background: #c89a5a;
  border: 3px solid #8a6a3a;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #5a3a18;
  text-align: center;
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.1), 0 3px 0 #8a6a3a;
  position: relative;
  z-index: 2;
}

/* Legal links */
.visual-legal {
  position: absolute;
  bottom: 24px;
  left: 40px;
  z-index: 6;
  display: flex;
  gap: 22px;

  a {
    font-size: 13px;
    color: rgba(60, 50, 30, 0.6);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;

    &:hover {
      color: var(--cyber-text);
    }
  }
}

/* ===== RIGHT: Form panel ===== */
.login-main {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(800px 500px at 100% 0%, #fff7e0 0%, transparent 50%),
    linear-gradient(180deg, #fdfdf5 0%, #f4ecd6 100%);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(121, 79, 39, 0.06) 1px, transparent 1px);
    background-size: 18px 18px;
    pointer-events: none;
  }
}

.language-switch {
  position: absolute;
  top: 28px;
  right: 36px;
  z-index: 2;
  color: var(--cyber-text-soft);
}

.login-panel {
  position: relative;
  z-index: 1;
  width: 440px;
  max-width: calc(100% - 48px);
  background: #fdfdf5;
  border: 3px solid #e8e2d6;
  border-radius: 40px 50px 36px 44px / 44px 36px 50px 40px;
  padding: 36px 38px 32px;
  box-shadow:
    0 0 0 6px rgba(255, 255, 255, 0.5),
    0 18px 40px rgba(110, 80, 40, 0.18);

  &::before {
    content: "";
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%) rotate(-2deg);
    width: 120px;
    height: 28px;
    background: #f7cd67;
    border: 2px solid #c89a3a;
    border-radius: 6px;
    box-shadow: 0 3px 0 0 #c89a3a, inset 0 0 0 2px rgba(255, 255, 255, 0.5);
    z-index: 2;
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

  .login-panel {
    border-radius: 32px;

    &::before {
      left: 32px;
      transform: rotate(-4deg);
    }
  }
}

@media (max-width: 768px) {
  .login-main {
    align-items: flex-start;
    padding-top: 84px;
  }

  .login-panel {
    padding: 28px 24px 24px;
  }
}
</style>
