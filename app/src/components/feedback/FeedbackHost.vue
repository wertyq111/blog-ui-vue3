<template>
  <div class="afb">
    <!-- 轻提示：顶部居中 -->
    <Teleport to="body">
      <div class="afb__messages">
        <transition-group name="afb-msg">
          <div
            v-for="item in store.messages"
            :key="item.id"
            class="afb__message"
            :class="`afb__message--${item.type}`"
            @click="removeMessage(item.id)"
          >
            <span class="afb__icon" v-html="iconSvg(item.type)" />
            <span class="afb__message-text">{{ item.content }}</span>
          </div>
        </transition-group>
      </div>
    </Teleport>

    <!-- 通知：右上角 -->
    <Teleport to="body">
      <div class="afb__notifies">
        <transition-group name="afb-notify">
          <div
            v-for="item in store.notifications"
            :key="item.id"
            class="afb__notify"
            :class="`afb__notify--${item.type}`"
          >
            <span class="afb__icon" v-html="iconSvg(item.type)" />
            <div class="afb__notify-body">
              <p class="afb__notify-title">{{ item.title }}</p>
              <p class="afb__notify-text">{{ item.content }}</p>
            </div>
            <button
              type="button"
              class="afb__notify-close"
              aria-label="关闭通知"
              @click="removeNotify(item.id)"
            >
              ×
            </button>
          </div>
        </transition-group>
      </div>
    </Teleport>

    <!-- 确认弹窗 -->
    <AdminAnimalModal
      v-for="item in store.confirms"
      :key="item.id"
      :visible="true"
      :title="item.title"
      :width="420"
      :confirm-text="item.confirmText"
      :cancel-text="item.cancelText"
      @confirm="resolveConfirm(item.id)"
      @close="rejectConfirm(item.id)"
      @update:visible="(v: boolean) => !v && rejectConfirm(item.id)"
    >
      <div class="afb__confirm" :class="`afb__confirm--${item.type}`">
        <span class="afb__icon afb__confirm-icon" v-html="iconSvg(item.type)" />
        <span class="afb__confirm-text">{{ item.message }}</span>
      </div>
    </AdminAnimalModal>
  </div>
</template>

<script setup lang="ts">
import {
  feedbackStore as store,
  removeMessage,
  removeNotify,
  resolveConfirm,
  rejectConfirm,
  type FeedbackType,
} from "@/utils/feedback";
import AdminAnimalModal from "@/components/AdminPage/AdminAnimalModal.vue";

// 图标随 animal-island-ui v1.2.0 Notification：裸线条 glyph，外圈由 .afb__icon 圆形底色承担
const icons: Record<FeedbackType, string> = {
  success: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  error: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M12 4l9.5 16.5h-19z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 10v4M12 16.5v.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="12" cy="7" r="1.6" fill="currentColor"/><path d="M12 11v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
};

function iconSvg(type: FeedbackType): string {
  return icons[type];
}
</script>

<style scoped lang="scss">
.afb__messages {
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 3200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  transform: translateX(-50%);
  pointer-events: none;
}
/* 三段色阶（animal-island-ui v1.2.0 Notification）：浅色背景 + 中色圆形图标底 + 深色边框 */
.afb__message {
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 80vw;
  padding: 8px 16px 8px 8px;
  font-size: 14px;
  font-weight: 700;
  color: #794f27;
  pointer-events: auto;
  cursor: pointer;
  background: var(--afb-bg, rgb(247, 243, 223));
  border: 2px solid var(--afb-border, #c4b89e);
  border-radius: 999px;
  box-shadow: var(--afb-shadow, 0 6px 18px rgba(61, 52, 40, 0.14));
}

.afb__notifies {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 3200;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 384px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}
.afb__notify {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  pointer-events: auto;
  background: var(--afb-bg, rgb(247, 243, 223));
  border: 2px solid var(--afb-border, #c4b89e);
  border-radius: 18px;
  box-shadow: var(--afb-shadow, 0 6px 18px rgba(61, 52, 40, 0.14));
}
.afb__notify-body {
  flex: 1;
  min-width: 0;
}
.afb__notify-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #794f27;
  overflow-wrap: anywhere;
}
.afb__notify-text {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.55;
  color: #8a7b66;
  overflow-wrap: anywhere;
}
.afb__notify-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  color: rgba(114, 93, 66, 0.55);
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}
.afb__notify-close:hover {
  background: rgba(114, 93, 66, 0.12);
  color: rgba(114, 93, 66, 1);
}
.afb__notify-close:focus-visible {
  outline: 2px solid #ffcc00;
  outline-offset: 2px;
}

.afb__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--afb-icon-bg, transparent);
  color: var(--afb-icon-color, inherit);
}
.afb__message .afb__icon {
  width: 26px;
  height: 26px;
}
.afb__notify .afb__icon,
.afb__confirm .afb__icon {
  width: 32px;
  height: 32px;
}

.afb__confirm {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px 2px;
  font-size: 14px;
  font-weight: 600;
  color: #794f27;
}
.afb__message--success,
.afb__notify--success,
.afb__confirm--success {
  --afb-bg: #f5fae9;
  --afb-border: #6fba2c;
  --afb-shadow: 0 6px 18px rgba(111, 186, 44, 0.18);
  --afb-icon-bg: #d8efc1;
  --afb-icon-color: #5a9e1e;
}
.afb__message--info,
.afb__notify--info,
.afb__confirm--info {
  --afb-bg: #ecf9f6;
  --afb-border: #19c8b9;
  --afb-shadow: 0 6px 18px rgba(25, 200, 185, 0.18);
  --afb-icon-bg: #c2ece6;
  --afb-icon-color: #11a89b;
}
.afb__message--warning,
.afb__notify--warning,
.afb__confirm--warning {
  --afb-bg: #fdf6d9;
  --afb-border: #f5c31c;
  --afb-shadow: 0 6px 18px rgba(245, 195, 28, 0.2);
  --afb-icon-bg: #fbeaa1;
  --afb-icon-color: #b88a06;
}
.afb__message--error,
.afb__notify--error,
.afb__confirm--error {
  --afb-bg: #fde8e8;
  --afb-border: #e05a5a;
  --afb-shadow: 0 6px 18px rgba(224, 90, 90, 0.18);
  --afb-icon-bg: #f7c8c8;
  --afb-icon-color: #c94444;
}
.afb__confirm-text {
  line-height: 1.6;
}

.afb-msg-enter-active,
.afb-msg-leave-active,
.afb-notify-enter-active,
.afb-notify-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.afb-msg-enter-from,
.afb-msg-leave-to,
.afb-notify-enter-from,
.afb-notify-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

@media (prefers-reduced-motion: reduce) {
  .afb-msg-enter-active,
  .afb-msg-leave-active,
  .afb-notify-enter-active,
  .afb-notify-leave-active {
    transition-duration: 0.01s;
  }
}
</style>
