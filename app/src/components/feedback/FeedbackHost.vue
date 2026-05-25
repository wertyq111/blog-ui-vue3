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
            <span class="afb__notify-close" @click="removeNotify(item.id)">×</span>
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
      <div class="afb__confirm">
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

const icons: Record<FeedbackType, string> = {
  success: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>`,
  error: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>`,
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
.afb__message {
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 80vw;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 700;
  color: #794f27;
  pointer-events: auto;
  cursor: pointer;
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(121, 79, 39, 0.12);
}
.afb__message--success {
  color: #4a8a36;
  border-color: rgba(111, 186, 44, 0.4);
}
.afb__message--error {
  color: #d65a52;
  border-color: rgba(252, 115, 109, 0.4);
}
.afb__message--warning {
  color: #d98a2b;
  border-color: rgba(245, 173, 66, 0.45);
}
.afb__message--info {
  color: #4f7bb8;
  border-color: rgba(120, 160, 220, 0.4);
}

.afb__notifies {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 3200;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 340px;
  max-width: calc(100vw - 32px);
  pointer-events: none;
}
.afb__notify {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px 16px;
  pointer-events: auto;
  background: #fdfbf7;
  border: 2px solid #e8e2d6;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(121, 79, 39, 0.14);
}
.afb__notify--success .afb__icon { color: #6fba2c; }
.afb__notify--error .afb__icon { color: #fc736d; }
.afb__notify--warning .afb__icon { color: #f5ad42; }
.afb__notify--info .afb__icon { color: #78a0dc; }
.afb__notify-body { flex: 1; min-width: 0; }
.afb__notify-title {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 800;
  color: #794f27;
}
.afb__notify-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #9f927d;
  word-break: break-word;
}
.afb__notify-close {
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
  color: #c8bd9f;
  cursor: pointer;
}
.afb__notify-close:hover { color: #794f27; }

.afb__icon { display: inline-flex; flex-shrink: 0; }

.afb__confirm {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px 2px;
  font-size: 14px;
  font-weight: 600;
  color: #794f27;
}
.afb__confirm-icon { color: #f5ad42; }
.afb__confirm-text { line-height: 1.6; }

.afb-msg-enter-active,
.afb-msg-leave-active,
.afb-notify-enter-active,
.afb-notify-leave-active {
  transition: all 0.25s ease;
}
.afb-msg-enter-from,
.afb-msg-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
.afb-notify-enter-from,
.afb-notify-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
