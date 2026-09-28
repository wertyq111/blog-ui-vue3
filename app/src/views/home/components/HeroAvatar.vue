<!-- 首页岛主头像区（头像、名牌、气球、化石徽章、叶子装饰） -->
<template>
  <div class="hero-avatar-wrap">
    <!-- 动森经典红色漂浮气球礼包 (字数统计) -->
    <div class="deco-balloon-present">
      <div class="balloon-svg">
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 气球主体 -->
          <path d="M30 10 C12 10, 8 28, 8 40 C8 52, 18 60, 30 60 C42 60, 52 52, 52 40 C52 28, 48 10, 30 10 Z" fill="#fc736d" stroke="#794f27" stroke-width="2.5" />
          <!-- 气球小嘴 -->
          <path d="M26 60 L34 60 L30 64 Z" fill="#fc736d" stroke="#794f27" stroke-width="2" />
          <!-- 悬挂线 -->
          <line x1="30" y1="64" x2="30" y2="76" stroke="#794f27" stroke-width="1.5" stroke-dasharray="2 2" />
        </svg>
      </div>
      <div class="present-box">
        <span class="present-box-ribbon"></span>
        <div class="present-box-content">
          <span class="lbl">累计字数</span>
          <span class="num">{{ statWords }}</span>
        </div>
      </div>
    </div>

    <!-- 动森五角星蓝色化石 (连续天数统计) -->
    <div class="deco-fossil-streak">
      <div class="fossil-icon">
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 蓝色化石底盘 -->
          <circle cx="30" cy="30" r="26" fill="#889df0" stroke="#794f27" stroke-width="3" />
          <circle cx="30" cy="30" r="21" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.6" />
          <!-- 蜗牛螺旋线 -->
          <path d="M30 16 C38 16, 44 22, 44 30 C44 38, 38 44, 30 44 C22 44, 18 38, 20 30 C21 24, 26 22, 30 22 C34 22, 36 25, 34 28 C33 29, 31 29, 30 28" stroke="#794f27" stroke-width="3" stroke-linecap="round" fill="none" />
          <!-- 小五角星 -->
          <path d="M30 24 L31 27 L34 27 L32 29 L33 32 L30 30 L27 32 L28 29 L26 27 L29 27 Z" fill="#fff" stroke="#794f27" stroke-width="1" />
        </svg>
      </div>
      <div class="fossil-content">
        <span class="lbl">连续天数</span>
        <span class="num">{{ statStreak }}<small>天</small></span>
      </div>
    </div>

    <!-- 挂角动森树叶装饰 🍃 -->
    <svg class="deco deco-leaf-1" viewBox="0 0 40 40" fill="#8ac68a">
      <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
    </svg>
    <svg class="deco deco-leaf-2" viewBox="0 0 40 40" fill="#d1da49">
      <path d="M35 5c0 10-5 20-13 28-5 5-12 7-22 7 0-10 2-17 7-22 8-8 18-13 28-13z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M35 5c-8 8-16 14-26 20" stroke="#794f27" stroke-width="1.5" fill="none"/>
    </svg>

    <!-- 岛主圆形框头像 -->
    <div class="hero-avatar">
      <img :src="avatarSrc" :alt="nickname" />
    </div>
    <div class="hero-name">🌿 {{ nickname }} · 岛民岛主</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HeroAvatar" });

defineProps<{ avatarSrc: string; nickname: string; statWords: string; statStreak: string }>();
</script>

<style scoped lang="scss">
.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: min(340px, 75vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #fff7e0 100%);
  border: 5px solid var(--ai-outline); // 动森深褐黑相框粗边
  box-shadow:
    0 0 0 4px #eef9d6,
    0 16px 36px rgba(90, 58, 24, 0.14);
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: grid;
  place-items: center;

  img { width: 92%; height: 92%; object-fit: cover; border-radius: 50%; }
}

.hero-name {
  margin-top: 18px;
  padding: 6px 24px;
  background: var(--ai-btn-face);
  border: 2px.5 solid var(--ai-outline);
  border-radius: 24px 30px 28px 26px / 26px 24px 30px 28px;
  font-weight: 900;
  font-size: 16px;
  color: var(--ai-text);
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
}

// 浮动的红色气球礼物
.deco-balloon-present {
  position: absolute;
  top: -30px;
  left: -80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  animation: ac-balloon-bob 4s ease-in-out infinite;

  .balloon-svg {
    width: 46px;
    height: 60px;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,0.06));
  }

  .present-box {
    margin-top: -12px;
    background: var(--ai-btn-face);
    border: 2px.5 solid var(--ai-outline);
    border-radius: 12px;
    padding: 6px 12px;
    box-shadow: 0 3px 0 0 var(--ai-outline);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .present-box-ribbon {
      position: absolute;
      top: -3px;
      width: 14px;
      height: 14px;
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M2 5 C2 2, 5 3, 5 5 C5 3, 8 2, 8 5 Z' fill='%23fc736d' stroke='%23794f27' stroke-width='1.2'/></svg>") no-repeat center;
      background-size: contain;
    }

    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: var(--ai-text-2);
      margin-bottom: 2px;
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: var(--ai-red);
    }
  }
}

// 蓝色五角星化石挂饰
.deco-fossil-streak {
  position: absolute;
  bottom: 20px;
  right: -70px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px.5 solid var(--ai-outline);
  border-radius: 20px 24px 22px 26px / 24px 22px 26px 20px;
  padding: 6px 16px;
  box-shadow: 0 4px 0 0 var(--ai-outline);
  z-index: 3;
  transform: rotate(6deg);
  animation: ac-fossil-sway 5s ease-in-out infinite alternate;

  .fossil-icon {
    width: 32px;
    height: 32px;
  }

  .fossil-content {
    display: flex;
    flex-direction: column;

    // 化石挂件整块（底色、.num）都是硬编码、不随昼夜翻转，
    // 标签也必须用常量墨，换成 --ai-text-2 会在白底上掉到 2.07。
    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: var(--home-chip-ink);
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: #6a86d8;
    }
  }
}

@keyframes ac-balloon-bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-14px) rotate(2deg); }
}

@keyframes ac-fossil-sway {
  0% { transform: rotate(3deg) translateY(0); }
  100% { transform: rotate(9deg) translateY(-4px); }
}

.deco { position: absolute; }
.deco-leaf-1 { top: -14px; right: -14px; width: 52px; transform: rotate(18deg); z-index: 3; }
.deco-leaf-2 { bottom: -14px; left: -14px; width: 44px; transform: rotate(-18deg); z-index: 3; }
</style>
