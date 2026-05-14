<template>
  <div class="wb-hero">
    <div class="wb-hero__left">
      <div class="wb-hero__eyebrow">DASHBOARD</div>
      <h1 class="wb-hero__title">{{ greeting }}{{ nickname }}</h1>
      <p class="wb-hero__desc">这是你的个人工作台，集中管理开发日志、文档与平台工具。</p>
    </div>
    <div class="wb-hero__actions">
      <el-button type="primary" @click="$router.push('/develop/work-daily')">
        <el-icon><EditPen /></el-icon>写日志
      </el-button>
      <el-button @click="$router.push('/develop/work-doc')">
        <el-icon><Document /></el-icon>新文档
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { EditPen, Document } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();
const nickname = computed(() => userStore.userInfo.nickname || "");
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h >= 6 && h < 9) return "早上好，";
  if (h >= 9 && h < 12) return "上午好，";
  if (h >= 12 && h < 14) return "中午好，";
  if (h >= 14 && h < 18) return "下午好，";
  if (h >= 18 && h < 24) return "晚上好，";
  return "夜深了，";
});
</script>

<style lang="scss" scoped>
.wb-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  margin-bottom: 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #5fa979 0%, #7bc8a4 50%, #a8dfc0 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.22) 0%, transparent 55%);
    pointer-events: none;
  }

  &__left { flex: 1; }

  &__eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: rgba(255, 255, 255, 0.72);
    margin-bottom: 8px;
  }

  &__title {
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin: 0 0 10px;
  }

  &__desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
    margin: 0;
    max-width: 480px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;

    .el-button {
      background: rgba(255, 255, 255, 0.22);
      border-color: rgba(255, 255, 255, 0.36);
      color: #fff;
      font-weight: 600;
      backdrop-filter: blur(6px);
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.36);
        border-color: rgba(255, 255, 255, 0.54);
      }

      &.el-button--primary {
        background: rgba(255, 255, 255, 0.32);
        border-color: rgba(255, 255, 255, 0.54);
      }
    }
  }
}
</style>
