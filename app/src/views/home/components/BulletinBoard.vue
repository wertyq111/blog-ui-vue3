<!-- 首页大头针告示板（未登录） -->
<template>
  <div class="bulletin-board">
    <!-- 告示板大头针 -->
    <div class="board-pin pin-left">📌</div>
    <div class="board-pin pin-right">📌</div>
    
    <div class="board-header">
      <span class="board-title">📢 博客小岛 · 今日快讯</span>
      <!-- 顶部两只可爱的小鸟剪影 -->
      <div class="board-birds">
        <span class="board-bird">🐦</span>
        <span class="board-bird">🐤</span>
      </div>
    </div>
    
    <div class="board-body">
      <!-- 便签 1：技术基石 -->
      <div class="board-sticky sticky-tech">
        <div class="sticky-head">📋 岛屿基础设施公告</div>
        <div class="sticky-content">
          本岛已完成技术现代化升级！前端搭载轻盈高效的 <strong>Vue 3.5 + Vite 8</strong> 拟物引擎，样式由 <strong>UnoCSS + Sass</strong> 随心调配；后端基于稳固的 <strong>Laravel 10 API</strong> 强力驱动，测试链则由 <strong>Pest PHP</strong> 严密守卫。🌱
        </div>
        <div class="sticky-foot">Nook 岛建委员会 · 宣</div>
      </div>
      
      <!-- 便签 2：乘客招募 -->
      <div class="board-sticky sticky-recruit">
        <div class="sticky-head">✉️ 登岛民移居招募通知</div>
        <div class="sticky-content">
          欢迎各位开发者、创作者移居博客小岛！在这里我们不催稿、不焦虑。完成登岛移居手续后，即可当场获得您的专属官方<strong>「岛民证 (Island Passport)」</strong>，并解锁专属的<strong>「随身背包口袋」</strong>！✨
        </div>
        <div class="sticky-foot">Dodo Airlines 客服部</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "BulletinBoard" });
</script>

<style scoped lang="scss">
// ============================================
// 12. 大头针告示板 (Bulletin Board) 样式
// ============================================
.bulletin-board {
  width: 100%;
  max-width: 720px;
  background: #e5cc9c; // 温暖的软木塞底色
  border: 12px solid #946f48; // 木纹厚边框
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    inset 0 0 20px rgba(78, 54, 30, 0.25),
    0 16px 40px rgba(121, 79, 39, 0.12);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.board-pin {
  position: absolute;
  top: -12px;
  font-size: 20px;
  z-index: 3;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,0.15));

  &.pin-left { left: 40px; transform: rotate(-10deg); }
  &.pin-right { right: 40px; transform: rotate(10deg); }
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3.5px dashed rgba(121, 79, 39, 0.15);
  padding-bottom: 12px;

  .board-title {
    font-size: 18px;
    font-weight: 900;
    color: var(--ai-text);
    letter-spacing: 1px;
  }
}

.board-birds {
  display: flex;
  gap: 12px;
  margin-top: -14px;
}

.board-bird {
  font-size: 20px;
  animation: ac-bird-sing 0.8s ease infinite alternate;

  &:last-child {
    animation-delay: 0.4s;
    transform: scaleX(-1);
  }
}

@keyframes ac-bird-sing {
  0% { transform: translateY(0) rotate(-4deg); }
  100% { transform: translateY(-4px) rotate(4deg); }
}

.board-body {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 20px;
}

// 告示板便签纸
.board-sticky {
  background: #fffdf0;
  border: 2.5px solid var(--ai-outline);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 4px 6px 0 rgba(78, 54, 30, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;

  .sticky-head {
    font-size: 13px;
    font-weight: 900;
    color: var(--ai-text);
    border-bottom: 1.5px dashed rgba(121, 79, 39, 0.15);
    padding-bottom: 6px;
  }

  .sticky-content {
    font-size: 12px;
    font-weight: 800;
    color: var(--ai-text);
    line-height: 1.6;
    flex: 1;

    strong {
      color: var(--ai-primary-active);
      font-weight: 900;
    }
  }

  .sticky-foot {
    font-size: 10px;
    font-weight: 800;
    color: var(--ai-shadow-color);
    text-align: right;
  }
}

.sticky-tech {
  background: #fdfcee; // 浅黄
  transform: rotate(-2.5deg);
}

.sticky-recruit {
  background: #edfbee; // 浅绿
  transform: rotate(2deg);

  .sticky-content strong {
    color: #6a86d8;
  }
}

// 针对移动端的适配
@media (max-width: 768px) {
  .board-body {
    grid-template-columns: 1fr;
  }
  .sticky-tech, .sticky-recruit {
    transform: none;
  }
}
</style>
