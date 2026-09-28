<!-- 首页岛民证（已登录） -->
<template>
  <div class="ac-passport">
    <!-- 岛民证头部缝线装饰 -->
    <div class="ac-passport__header">
      <div class="ac-passport__title-group">
        <h3>PASSPORT</h3>
        <span>Nook Inc. 岛民护照登记卡</span>
      </div>
      <!-- Dodo 联运 Approved 防伪印章 -->
      <div class="ac-passport__stamp-dodo">
        <span>DODO APPR.</span>
        <span class="sub">10.10.9.184</span>
      </div>
    </div>
    
    <div class="ac-passport__card">
      <!-- 左侧大头照照相机区域 -->
      <div class="ac-passport__photo-area">
        <div class="ac-passport__photo">
          <img :src="avatarSrc" :alt="nickname" />
        </div>
        <div class="ac-passport__photo-stamp">PASSPORT PHOTO</div>
        <!-- 印在照片上的小海鸥 Approved 浅色水印 -->
        <div class="ac-passport__photo-watermark">🍃</div>
      </div>
      
      <!-- 右侧玩家手绘属性明细面联 -->
      <div class="ac-passport__details">
        <div class="ac-passport__row">
          <div class="ac-passport__item">
            <span class="label">PASSENGER NAME / 岛民姓名</span>
            <span class="value">🌿 {{ nickname }}</span>
          </div>
          <div class="ac-passport__item">
            <span class="label">NATIVE FRUIT / 特产水果</span>
            <span class="value fruit-color">{{ userFruit }}</span>
          </div>
        </div>
        
        <!-- 胶囊称号 (Title) -->
        <div class="ac-passport__row">
          <div class="ac-passport__item ac-passport__item--title">
            <span class="label">TITLE / 岛民称号</span>
            <div class="value-title-wrap">
              <span class="title-pill">{{ userTitle1 }}</span>
              <span class="title-pill">{{ userTitle2 }}</span>
            </div>
          </div>
        </div>

        <div class="ac-passport__row">
          <div class="ac-passport__item">
            <span class="label">ISLAND NAME / 注册岛名</span>
            <span class="value">{{ brandName }}</span>
          </div>
          <div class="ac-passport__item">
            <span class="label">FIRST DEPARTURE / 移居日期</span>
            <span class="value">2023-01-20</span>
          </div>
        </div>

        <div class="ac-passport__row">
          <div class="ac-passport__item">
            <span class="label">ISLAND COMMENT / 岛民寄语</span>
            <span class="value comment">“ 不催稿、不焦虑。写点东西、做点项目，让小岛今天比昨天再绿一点。 🌱 ”</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "IslandPassport" });

const props = defineProps<{ brandName: string; nickname: string; avatarSrc: string }>();

/* ---- 动态哈希特产水果与胶囊称号生成 ---- */
const fruits = ["🍒 樱桃", "🍑 蜜桃", "🍊 橘子", "🍎 苹果", "🍐 梨子", "🥥 椰子"];
const titlesFirst = ["刚起步的", "全能的", "悠闲的", "闪闪发光的", "充满灵感的", "传说中的", "爱发呆的", "新来的"];
const titlesSecond = ["岛民", "写作者", "梦想家", "开发者", "收藏家", "园艺家", "旅行者", "创作者"];

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const userFruit = computed(() => {
  const hash = getHash(props.nickname);
  return fruits[hash % fruits.length];
});

const userTitle1 = computed(() => {
  const hash = getHash(props.nickname);
  return titlesFirst[hash % titlesFirst.length];
});

const userTitle2 = computed(() => {
  const hash = getHash(props.nickname + "-suffix");
  return titlesSecond[hash % titlesSecond.length];
});
</script>

<style scoped lang="scss">
.home-page--night .ac-passport {
  background: #1c274c;
  border-color: var(--ai-outline);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.home-page--night .ac-passport__header {
  background: linear-gradient(180deg, #24355a 0%, #1c274c 100%);
  border-bottom-color: rgba(255, 255, 255, 0.1);

  .ac-passport__stamp-dodo {
    border-color: rgba(61, 212, 198, 0.7);
    color: #3dd4c6;
  }
}

.home-page--night .ac-passport__card {
  background: #1e2836;
  border-color: var(--ai-outline);
}

.home-page--night .ac-passport__details .label {
  color: rgba(255, 255, 255, 0.35);
}

.home-page--night .ac-passport__details .value {
  color: #fffdec;
}

.ac-passport {
  width: 100%;
  max-width: 720px;
  background: #fffef2;
  border: 3.5px solid var(--ai-outline);
  border-radius: 36px;
  box-shadow: 0 16px 40px rgba(121, 79, 39, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ac-passport__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  background: linear-gradient(180deg, #fffae8 0%, #fff6d1 100%);
  border-bottom: 3px dashed rgba(121, 79, 39, 0.2);

  .ac-passport__title-group {
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      color: var(--ai-text);
      letter-spacing: 2px;
      line-height: 1;
    }
    span {
      font-size: 10px;
      font-weight: 800;
      color: var(--ai-text-2);
      letter-spacing: 0.5px;
    }
  }
}

// 渡渡航空防伪盖章印记
.ac-passport__stamp-dodo {
  border: 3px double rgba(25, 200, 185, 0.4);
  border-radius: 10px;
  color: rgba(25, 200, 185, 0.5);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 4px 10px;
  transform: rotate(-8deg);
  line-height: 1;
  text-align: center;
  display: flex;
  flex-direction: column;

  .sub {
    font-size: 7px;
    font-weight: 800;
    margin-top: 1px;
  }
}

.ac-passport__card {
  display: flex;
  padding: 28px;
  gap: 28px;
  background: var(--ai-btn-face);
}

// 大头照片框
.ac-passport__photo-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.ac-passport__photo {
  width: 170px;
  height: 170px;
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ac-passport__photo-stamp {
  margin-top: 8px;
  font-size: 9px;
  font-weight: 900;
  color: var(--ai-text-2);
  letter-spacing: 1px;
}

.ac-passport__photo-watermark {
  position: absolute;
  right: 10px;
  bottom: 30px;
  font-size: 32px;
  color: rgba(124, 186, 112, 0.22);
  pointer-events: none;
  z-index: 1;
  transform: rotate(15deg);
}

// 信息字段
.ac-passport__details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ac-passport__row {
  display: flex;
  gap: 20px;
}

.ac-passport__item {
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 9px;
    font-weight: 800;
    color: var(--ai-text-3);
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }

  .value {
    font-size: 15px;
    font-weight: 900;
    color: var(--ai-text);

    &.fruit-color {
      color: var(--ai-red); // 特产色
    }

    &.comment {
      font-style: italic;
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--ai-text);
    }
  }
}

// 胶囊称号
.value-title-wrap {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.title-pill {
  background: var(--ai-warning);
  border: 2px solid var(--ai-outline);
  color: var(--home-chip-ink);
  font-size: 11px;
  font-weight: 900;
  padding: 3px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 0 0 var(--ai-outline);
}

@media (max-width: 900px) {
  .ac-passport {
    border-radius: 24px;
  }

  .ac-passport__card {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .ac-passport__photo {
    width: 150px;
    height: 150px;
  }

  .ac-passport__header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .ac-passport__stamp-dodo {
    align-self: flex-end;
  }
}
</style>
