<template>
  <div class="ac404">
    <!-- 经典动森三角形草地平铺底纹层 -->
    <div class="ac404__grass-bg"></div>

    <!-- 装饰用飘落的落叶和花瓣 -->
    <div class="ac404__leaves-container">
      <span class="ac404__leaf ac404__leaf--1">🍃</span>
      <span class="ac404__leaf ac404__leaf--2">🌸</span>
      <span class="ac404__leaf ac404__leaf--3">🍃</span>
      <span class="ac404__leaf ac404__leaf--4">🍁</span>
      <span class="ac404__leaf ac404__leaf--5">🌸</span>
    </div>

    <!-- 天空背景（白云缓慢漂浮 + 渡渡航空飞机拉横幅） -->
    <div class="ac404__sky">
      <div class="ac404__cloud ac404__cloud--1"></div>
      <div class="ac404__cloud ac404__cloud--2"></div>
      <div class="ac404__cloud ac404__cloud--3"></div>
      
      <!-- 渡渡航空水上飞机拉横幅 -->
      <div class="ac404__airplane-wrapper">
        <div class="ac404__airplane">
          <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 螺旋桨 -->
            <line x1="94" y1="12" x2="94" y2="48" stroke="#333" stroke-width="3" stroke-linecap="round" class="propeller" />
            <!-- 机身 -->
            <path d="M15 25 C15 12, 35 10, 75 18 C85 20, 92 24, 92 30 C92 36, 85 40, 75 40 L30 40 C20 40, 15 36, 15 25 Z" fill="#f7cd67" stroke="#dcb574" stroke-width="2" />
            <!-- 蓝色机翼/装饰 -->
            <path d="M35 22 L72 22 C78 22, 78 28, 72 28 L38 28 Z" fill="#2c80c5" />
            <!-- 尾翼 -->
            <path d="M20 22 L5 6 C3 4, 10 4, 12 6 L22 20 Z" fill="#2c80c5" />
            <!-- 浮筒支架 -->
            <line x1="45" y1="40" x2="40" y2="50" stroke="#666" stroke-width="3" />
            <line x1="65" y1="40" x2="70" y2="50" stroke="#666" stroke-width="3" />
            <!-- 浮筒 -->
            <rect x="25" y="48" width="55" height="6" rx="3" fill="#2c80c5" stroke="#1d5f96" stroke-width="1.5" />
            <!-- 驾驶舱玻璃 -->
            <path d="M72 20 C76 20, 80 23, 80 26 L68 26 Z" fill="#fff" opacity="0.8" />
          </svg>
        </div>
        <div class="ac404__banner">
          <span>DAL-404: FLIGHT CANCELLED ✈️ 航线未开通</span>
        </div>
      </div>
    </div>

    <!-- 3D 偏转机票主体 -->
    <div 
      class="ac404__ticket-container"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      ref="ticketRef"
      :style="tiltStyle"
    >
      <div class="ac404__ticket">
        <!-- 机票左右圆孔切口 -->
        <div class="ac404__ticket-hole ac404__ticket-hole--top"></div>
        <div class="ac404__ticket-hole ac404__ticket-hole--bottom"></div>

        <!-- 机票左侧主联 (Main Boarding Pass) -->
        <div class="ac404__ticket-main">
          <!-- 头部 LOGO 与标题 -->
          <div class="ac404__ticket-header">
            <div class="ac404__dal-logo">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="46" fill="#19c8b9" stroke="#11a89b" stroke-width="4"/>
                <circle cx="50" cy="50" r="40" stroke="#fff" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>
                <!-- 双椰子树 -->
                <path d="M36 70 H40 V78 H36 Z M60 70 H64 V78 H60 Z" fill="#fff"/>
                <path d="M38 70 C34 66, 30 68, 30 68 C34 70, 36 70, 38 70 Z M62 70 C58 66, 54 68, 54 68 C58 70, 60 70, 62 70 Z" fill="#fff"/>
                <!-- 海鸥 -->
                <path d="M25 45 C35 30, 45 42, 50 48 C55 42, 65 30, 75 45 C65 52, 55 58, 50 62 C45 58, 35 52, 25 45 Z" fill="#fff"/>
              </svg>
            </div>
            <div class="ac404__dal-brand">
              <span class="brand-en">DODO AIRLINES</span>
              <span class="brand-zh">渡渡航空国际联运</span>
            </div>
            <div class="ac404__ticket-title">
              <h2>BOARDING PASS</h2>
              <span class="sub">登机牌 / 404 NOT FOUND</span>
            </div>
          </div>

          <!-- 机票信息区域 -->
          <div class="ac404__ticket-body">
            <div class="ac404__info-row">
              <div class="ac404__info-item">
                <span class="label">PASSENGER NAME / 旅客姓名</span>
                <span class="value">{{ nickname || 'Guest Traveler / 岛民访客' }}</span>
              </div>
              <div class="ac404__info-item">
                <span class="label">FLIGHT / 航班号</span>
                <span class="value highlight">DAL 404</span>
              </div>
            </div>

            <!-- 起飞目的地路程线 -->
            <div class="ac404__route-row">
              <div class="ac404__route-airport">
                <span class="code">WEB</span>
                <span class="name">YOUR BROWSER</span>
              </div>
              <div class="ac404__route-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#11a89b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="ac404__plane-icon">✈️</div>
              </div>
              <div class="ac404__route-airport">
                <span class="code">LOST</span>
                <span class="name">UNKNOWN ISLAND</span>
              </div>
            </div>

            <div class="ac404__info-row">
              <div class="ac404__info-item">
                <span class="label">GATE / 登机口</span>
                <span class="value">404</span>
              </div>
              <div class="ac404__info-item">
                <span class="label">SEAT / 座位号</span>
                <span class="value">04A</span>
              </div>
              <div class="ac404__info-item">
                <span class="label">DATE / 起飞日期</span>
                <span class="value">{{ currentDate }}</span>
              </div>
            </div>
          </div>

          <!-- 机票底部：条形码与红色取消盖章 -->
          <div class="ac404__ticket-footer">
            <div class="ac404__barcode-wrapper">
              <div class="ac404__barcode"></div>
              <span class="ac404__barcode-text">* 404 PAGE NOT FOUND *</span>
            </div>
            
            <!-- 红色取消盖章 -->
            <div class="ac404__stamp">
              <span>CANCELLED</span>
              <span class="zh">未通航</span>
            </div>
          </div>
        </div>

        <!-- 虚线裁剪线 -->
        <div class="ac404__ticket-divider"></div>

        <!-- 机票右侧旅客副联 (Passenger Stub) -->
        <div class="ac404__ticket-stub">
          <div class="ac404__stub-header">
            <span class="title">DAL 404</span>
            <span class="sub">STUB / 旅客联</span>
          </div>
          <div class="ac404__stub-body">
            <div class="ac404__stub-info">
              <span class="label">PASSENGER</span>
              <span class="value truncate">{{ nickname || 'Guest' }}</span>
            </div>
            <div class="ac404__stub-info-grid">
              <div class="ac404__stub-info">
                <span class="label">FROM</span>
                <span class="value">WEB</span>
              </div>
              <div class="ac404__stub-info">
                <span class="label">TO</span>
                <span class="value">LOST</span>
              </div>
            </div>
            <div class="ac404__stub-info-grid">
              <div class="ac404__stub-info">
                <span class="label">GATE</span>
                <span class="value">404</span>
              </div>
              <div class="ac404__stub-info">
                <span class="label">SEAT</span>
                <span class="value">04A</span>
              </div>
            </div>
          </div>

          <!-- 渡渡鸟莫里大头印章 -->
          <div class="ac404__stub-mascot">
            <div class="ac404__stub-avatar">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 头部底色 -->
                <circle cx="50" cy="50" r="44" fill="#3a86c8" />
                <!-- 黄色大嘴巴 -->
                <path d="M46 42 C60 42, 82 48, 82 56 C82 64, 58 68, 46 68 C38 68, 38 42, 46 42 Z" fill="#f7cd67" stroke="#5a3a18" stroke-width="3" />
                <path d="M46 56 H76" stroke="#5a3a18" stroke-width="2" stroke-linecap="round" />
                <!-- 大眼睛 -->
                <circle cx="48" cy="34" r="8" fill="#fff" stroke="#5a3a18" stroke-width="2" />
                <circle cx="48" cy="34" r="4" fill="#333" />
                <circle cx="50" cy="32" r="1.5" fill="#fff" />
                <!-- 腮红 -->
                <circle cx="34" cy="46" r="6" fill="#fc736d" opacity="0.8" />
                <!-- 飞行员帽带/耳机 -->
                <path d="M22 28 C28 20, 52 16, 72 24 C76 26, 78 30, 78 34" stroke="#444" stroke-width="6" stroke-linecap="round" />
                <circle cx="24" cy="38" r="9" fill="#f7cd67" stroke="#444" stroke-width="2" />
                <circle cx="76" cy="38" r="9" fill="#f7cd67" stroke="#444" stroke-width="2" />
                <!-- 领带 -->
                <path d="M46 88 L50 96 L54 88 Z" fill="#fc736d" />
              </svg>
            </div>
            <span class="ac404__stub-watermark">DAL APPROVED</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 莫里经典的动森对话框 -->
    <div class="ac404__dialogue-container">
      <div class="ac404__dialogue-box">
        <div class="ac404__dialogue-speaker">
          <span>莫里 (Mori)</span>
        </div>
        <div class="ac404__dialogue-text">
          <p>
            {{ dialogueText }}<span class="ac404__typing-cursor" v-if="isTyping"></span>
          </p>
        </div>
        
        <!-- 动森经典的右下角继续指示小三角形 (上下浮动) -->
        <div class="ac404__dialogue-arrow" :class="{ 'is-typing': isTyping }">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8L12 16L20 8" stroke="#f7cd67" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="#f7cd67"/>
          </svg>
        </div>
      </div>
      
      <!-- 语音播放状态提示音按钮（小小的静音/开启切换） -->
      <div class="ac404__sound-toggle" @click="toggleSound" :title="soundEnabled ? '点击静音' : '点击开启打字音效'">
        <span>{{ soundEnabled ? '🔊 打字音效: 开' : '🔇 打字音效: 关' }}</span>
      </div>
    </div>

    <!-- 重新设计的动森风格操作按钮，符合 lessons.md 交互规范 -->
    <div class="ac404__actions">
      <button class="ac404__btn ac404__btn--primary" @click="goHome" type="button">
        <span class="ac404__btn-finger"></span>
        <span class="ac404__btn-text">重新购买机票 (返回首页)</span>
      </button>
      <button class="ac404__btn" @click="goBack" type="button">
        <span class="ac404__btn-finger"></span>
        <span class="ac404__btn-text">退回候机大厅 (返回上一页)</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";

defineOptions({ name: "Page404" });

const router = useRouter();
const userStore = useUserStore();

// 动态读取当前用户的昵称，无登录时为访客
const nickname = computed(() => {
  return userStore.userInfo?.nickname || userStore.userInfo?.username || "";
});

// 计算当前的日期
const currentDate = computed(() => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
});

// 机票 3D Tilt 偏转动画实现
const ticketRef = ref<HTMLElement | null>(null);
const tiltStyle = reactive({
  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
  transition: "all 0.5s ease",
});

const handleMouseMove = (e: MouseEvent) => {
  if (!ticketRef.value) return;
  const card = ticketRef.value;
  const rect = card.getBoundingClientRect();
  
  // 鼠标相对卡片的 XY 坐标
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 卡片中心坐标
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  // 计算旋转角度 (最大 8 度，保证克制精致)
  const rotateX = -(y - centerY) / 25;
  const rotateY = (x - centerX) / 30;
  
  tiltStyle.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  tiltStyle.transition = "transform 0.08s ease";
};

const handleMouseLeave = () => {
  tiltStyle.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  tiltStyle.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
};

// 莫里打字机对话文字与 Web Audio 音频合成
const fullText = "哎呀……！实在不好意思，您要前往的岛屿航线（URL）目前没有航班在飞……是不是输入了错误的目的地呢？需要退票或者重新购买吗，哔哩！";
const dialogueText = ref("");
const isTyping = ref(true);
const soundEnabled = ref(true);

let typingTimer: any = null;
let audioCtx: AudioContext | null = null;

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
};

// 使用 Web Audio API 合成可爱的动森 8-bit 打字声音 (哔哔短促声)
const playAnimalBeep = () => {
  if (!soundEnabled.value) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine"; // 正弦波，柔和可爱
    
    // 产生高频且略带随机滑音的短促音效，模拟小动物说话
    const baseFreq = 700 + Math.random() * 260;
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, audioCtx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.015, audioCtx.currentTime); // 极低音量，不干扰用户
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06); // 快速渐弱

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch (err) {
    // 忽略任何因浏览器安全策略造成的播放异常
  }
};

// 启动打字机文字蹦出动画
const startTypewriter = () => {
  let index = 0;
  dialogueText.value = "";
  isTyping.value = true;
  
  if (typingTimer) clearInterval(typingTimer);
  
  typingTimer = setInterval(() => {
    if (index < fullText.length) {
      dialogueText.value += fullText[index];
      
      // 非空格和标点符号时，播放小短音
      if (/[^\s，。！？…]/.test(fullText[index])) {
        playAnimalBeep();
      }
      index++;
    } else {
      isTyping.value = false;
      clearInterval(typingTimer);
    }
  }, 65); // 约 65ms 一个字，流利自然
};

onMounted(() => {
  startTypewriter();
});

onUnmounted(() => {
  if (typingTimer) clearInterval(typingTimer);
  if (audioCtx) {
    audioCtx.close();
  }
});

const goHome = () => router.push("/");
const goBack = () => router.back();
</script>

<style lang="scss" scoped>
.ac404 {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 40px 24px;
  overflow: hidden;
  font-family: var(--el-font-family);
  background: linear-gradient(180deg, #dbf3fa 0%, #eaf6db 60%, #e1edd0 100%);
  user-select: none;
}

// 动森经典三角形草地纹理平铺背景
.ac404__grass-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.12;
  pointer-events: none;
  background-color: #794f27;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><path d='M30 10 L40 30 L20 30 Z M0 40 L10 60 L-10 60 Z M60 40 L70 60 L50 60 Z' fill='%23fff' /></svg>");
}

// 落叶与花瓣随机漂落装饰
.ac404__leaves-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.ac404__leaf {
  position: absolute;
  font-size: 20px;
  opacity: 0.75;
  animation: ac404-falling 12s linear infinite;

  &--1 {
    left: 8%;
    top: -5%;
    animation-delay: 0s;
    animation-duration: 10s;
  }
  &--2 {
    left: 25%;
    top: -5%;
    font-size: 24px;
    animation-delay: 3s;
    animation-duration: 13s;
  }
  &--3 {
    left: 55%;
    top: -5%;
    animation-delay: 1.5s;
    animation-duration: 11s;
  }
  &--4 {
    left: 75%;
    top: -5%;
    font-size: 22px;
    animation-delay: 5s;
    animation-duration: 14s;
  }
  &--5 {
    left: 90%;
    top: -5%;
    animation-delay: 0.5s;
    animation-duration: 9s;
  }
}

// 天空微动效（云朵漂移 + 水上飞机拉横幅）
.ac404__sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 250px;
  pointer-events: none;
  z-index: 1;
}

.ac404__cloud {
  position: absolute;
  background: #ffffff;
  border-radius: 100px;
  opacity: 0.85;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: #ffffff;
    border-radius: 50%;
  }

  &--1 {
    width: 120px;
    height: 40px;
    top: 40px;
    left: 10%;
    animation: ac404-wind 35s linear infinite;

    &::before {
      width: 50px;
      height: 50px;
      top: -20px;
      left: 15px;
    }
    &::after {
      width: 40px;
      height: 40px;
      top: -15px;
      right: 20px;
    }
  }

  &--2 {
    width: 180px;
    height: 50px;
    top: 90px;
    right: 15%;
    opacity: 0.65;
    animation: ac404-wind-reverse 45s linear infinite;

    &::before {
      width: 70px;
      height: 70px;
      top: -30px;
      left: 25px;
    }
    &::after {
      width: 50px;
      height: 50px;
      top: -20px;
      right: 35px;
    }
  }

  &--3 {
    width: 100px;
    height: 34px;
    top: 150px;
    left: 45%;
    opacity: 0.75;
    animation: ac404-wind 40s linear infinite;

    &::before {
      width: 40px;
      height: 40px;
      top: -15px;
      left: 12px;
    }
    &::after {
      width: 30px;
      height: 30px;
      top: -10px;
      right: 15px;
    }
  }
}

// 渡渡航空飞机拉横幅动画
.ac404__airplane-wrapper {
  position: absolute;
  top: 60px;
  left: -250px; // 从左侧屏幕外飞入
  display: flex;
  align-items: center;
  z-index: 2;
  animation: ac404-flyby 28s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.ac404__airplane {
  width: 90px;
  height: 54px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.08));
  animation: ac404-bob 2s ease-in-out infinite;

  svg {
    width: 100%;
    height: 100%;
  }
}

.propeller {
  transform-origin: 94px 30px;
  animation: ac404-spin 0.15s linear infinite;
}

.ac404__banner {
  margin-left: -8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 2px dashed #11a89b;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  color: #794f27;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(17, 168, 155, 0.08);
  position: relative;
  animation: ac404-banner-wave 1.5s ease-in-out infinite alternate;

  &::before {
    content: "";
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 2px;
    background: #11a89b;
  }
}

// 机票 3D 浮动卡片包装
.ac404__ticket-container {
  position: relative;
  z-index: 2;
  margin-bottom: 28px;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.ac404__ticket {
  display: flex;
  width: 720px;
  height: 340px;
  background: #fffef6; // 动森暖象牙白机票纸张色
  border: 3px solid #794f27; // 动森深褐黑边框
  border-radius: 32px;
  box-shadow:
    0 16px 48px rgba(121, 79, 39, 0.12),
    0 4px 12px rgba(121, 79, 39, 0.06);
  position: relative;
  overflow: hidden;
}

// 机票上下边缘的半圆切孔，模拟真实撕开机票票根切口
.ac404__ticket-hole {
  position: absolute;
  left: 512px; // 与虚线对齐
  width: 24px;
  height: 24px;
  background: #eaf6db; // 匹配渐变背景背景色，使半圆形成挖空假象
  border: 3px solid #794f27;
  border-radius: 50%;
  z-index: 3;

  &--top {
    top: -14px;
  }

  &--bottom {
    bottom: -14px;
  }
}

// 左侧主联 (Main)
.ac404__ticket-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 28px;
  position: relative;
}

.ac404__ticket-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px dashed rgba(121, 79, 39, 0.15);
}

.ac404__dal-logo {
  width: 48px;
  height: 48px;
  margin-right: 12px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.ac404__dal-brand {
  display: flex;
  flex-direction: column;
  margin-right: auto;

  .brand-en {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 1.5px;
    color: #11a89b;
    line-height: 1.1;
  }

  .brand-zh {
    font-size: 11px;
    font-weight: 700;
    color: #9f927d;
    letter-spacing: 0.5px;
  }
}

.ac404__ticket-title {
  text-align: right;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
    color: #794f27;
    line-height: 1.1;
  }

  .sub {
    font-size: 10px;
    font-weight: 800;
    color: #fc736d;
    letter-spacing: 0.5px;
  }
}

// 机票身体数据项
.ac404__ticket-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
}

.ac404__info-row {
  display: flex;
  gap: 24px;
}

.ac404__info-item {
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 9px;
    font-weight: 800;
    color: #c4b89e;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .value {
    font-size: 16px;
    font-weight: 900;
    color: #794f27;

    &.highlight {
      color: #19c8b9;
      font-size: 18px;
    }
  }
}

// 机场路线代码区域
.ac404__route-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(25, 200, 185, 0.04);
  border-radius: 16px;
  border: 1px solid rgba(25, 200, 185, 0.08);
}

.ac404__route-airport {
  display: flex;
  flex-direction: column;

  .code {
    font-size: 26px;
    font-weight: 900;
    color: #11a89b;
    letter-spacing: 1px;
    line-height: 1;
  }

  .name {
    font-size: 9px;
    font-weight: 700;
    color: #9f927d;
  }
}

.ac404__route-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-grow: 1;
  margin: 0 24px;

  svg {
    width: 100%;
    height: 18px;
  }

  .ac404__plane-icon {
    position: absolute;
    top: -9px;
    font-size: 14px;
    animation: ac404-route-flight 4s ease-in-out infinite;
  }
}

// 机票底部条形码与红色取消盖章
.ac404__ticket-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 14px;
}

.ac404__barcode-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ac404__barcode {
  width: 190px;
  height: 34px;
  background: repeating-linear-gradient(
    90deg,
    #794f27,
    #794f27 2px,
    transparent 2px,
    transparent 5px,
    #794f27 5px,
    #794f27 7px,
    transparent 7px,
    transparent 10px,
    #794f27 10px,
    #794f27 11px,
    transparent 11px,
    transparent 14px
  );
}

.ac404__barcode-text {
  font-size: 8px;
  font-weight: 700;
  color: #c4b89e;
  letter-spacing: 1.5px;
}

// 红色粗框取消通航印章
.ac404__stamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px double #fc736d;
  border-radius: 12px;
  color: #fc736d;
  font-family: inherit;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
  padding: 6px 12px;
  transform: rotate(-12deg) scale(1.05);
  box-shadow: 0 0 0 2px rgba(252, 115, 109, 0.1);
  background: rgba(255, 254, 246, 0.95);
  opacity: 0.85;

  .zh {
    font-size: 9px;
    font-weight: 800;
    margin-top: 2px;
    letter-spacing: 2px;
  }
}

// 撕联裁剪线 (Divider)
.ac404__ticket-divider {
  width: 0;
  height: 100%;
  border-left: 2px dashed rgba(121, 79, 39, 0.22);
  margin-left: -1px;
  z-index: 1;
}

// 右侧副券联 (Stub)
.ac404__ticket-stub {
  width: 196px;
  padding: 24px 20px;
  background: rgba(25, 200, 185, 0.02);
  display: flex;
  flex-direction: column;
}

.ac404__stub-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px dashed rgba(121, 79, 39, 0.15);

  .title {
    font-size: 16px;
    font-weight: 900;
    color: #11a89b;
  }

  .sub {
    font-size: 9px;
    font-weight: 800;
    color: #9f927d;
  }
}

.ac404__stub-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.ac404__stub-info-grid {
  display: flex;
  gap: 16px;
}

.ac404__stub-info {
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 8px;
    font-weight: 800;
    color: #c4b89e;
    margin-bottom: 2px;
  }

  .value {
    font-size: 13px;
    font-weight: 900;
    color: #794f27;
  }
}

// 右侧旅客联底部的莫里头像水印章
.ac404__stub-mascot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.ac404__stub-avatar {
  width: 42px;
  height: 42px;
  border: 2px solid #794f27;
  border-radius: 50%;
  overflow: hidden;

  svg {
    width: 100%;
    height: 100%;
  }
}

.ac404__stub-watermark {
  font-size: 9px;
  font-weight: 900;
  color: #c4b89e;
  letter-spacing: 0.5px;
}

// 莫里对话框样式 (Dialogue Box)
.ac404__dialogue-container {
  width: 100%;
  max-width: 720px;
  margin-bottom: 32px;
  position: relative;
  z-index: 2;
}

.ac404__dialogue-box {
  background: #fffef2; // 极暖白偏乳黄
  border: 3.5px solid #5a3a18; // 深褐粗框
  // 不规则弯曲圆角：动森经典灵魂
  border-radius: 28px 36px 24px 32px / 28px 24px 34px 28px;
  box-shadow: 0 10px 24px rgba(90, 58, 24, 0.08);
  padding: 24px 28px 20px;
  position: relative;
  min-height: 110px;
}

// 说话者姓名气泡
.ac404__dialogue-speaker {
  position: absolute;
  top: -18px;
  left: 28px;
  background: #f7cd67; // 暖黄底色
  border: 3px solid #5a3a18;
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: 0 4px 0 0 #5a3a18;

  span {
    font-size: 14px;
    font-weight: 900;
    color: #5a3a18;
    letter-spacing: 1.5px;
  }
}

// 对话文本
.ac404__dialogue-text {
  p {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.8;
    color: #5a3a18; // 深褐字
    word-break: break-all;
  }
}

// 打字机闪烁光标
.ac404__typing-cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #5a3a18;
  margin-left: 4px;
  vertical-align: middle;
  animation: ac404-blink 0.8s infinite;
}

// 右下角继续指示器小箭头
.ac404__dialogue-arrow {
  position: absolute;
  right: 20px;
  bottom: 12px;
  width: 24px;
  height: 24px;
  color: #f7cd67;
  animation: ac404-bounce 0.8s infinite alternate;

  &.is-typing {
    display: none; // 打字过程中隐藏，打字完显示
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

// 音效控制按钮
.ac404__sound-toggle {
  position: absolute;
  right: 12px;
  top: -28px;
  background: rgba(255, 255, 255, 0.7);
  border: 1.5px solid #d4c9b4;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 800;
  color: #9f927d;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff;
    border-color: #19c8b9;
    color: #11a89b;
  }
}

// 重新设计的动森风格操作按钮 (严格遵循 lessons.md 交互规范)
.ac404__actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 720px;
  z-index: 2;
}

.ac404__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0 32px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #794f27;
  background: #fffef6;
  border: 3px solid #794f27;
  border-radius: 999px;
  box-shadow: 0 6px 0 0 #d4c9b4; // 暖质感偏灰阴影
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;

  // 内部手指元素，对齐 lessons.md：hover 时显现，占空，文字右移
  .ac404__btn-finger {
    position: absolute;
    left: 18px;
    width: 22px;
    height: 22px;
    background: url('/src/assets/select-cursor.svg') no-repeat center;
    background-size: contain;
    opacity: 0;
    transform: translateX(-12px) rotate(-10deg);
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
  }

  .ac404__btn-text {
    display: inline-block;
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 0 0 #d4c9b4;
    background: #ffffff;
    border-color: #19c8b9;
    color: #11a89b;

    .ac404__btn-finger {
      opacity: 1;
      transform: translateX(0) rotate(0deg);
      animation: ac404-wiggle 0.5s ease infinite alternate;
    }

    .ac404__btn-text {
      transform: translateX(12px); // 向右平移避让手指，对齐交互规范
    }
  }

  &:active {
    transform: translateY(4px);
    box-shadow: 0 2px 0 0 #d4c9b4;
  }

  &:focus-visible {
    outline: none;
    border-color: #19c8b9;
  }
}

// 主按钮（绿草地风格）
.ac404__btn--primary {
  color: #ffffff;
  background: linear-gradient(180deg, #84cf4f 0%, #6fba2c 100%);
  border-color: #794f27; // 保持一致的褐黑边框，极富手绘感
  box-shadow: 0 6px 0 0 #5a9e1e;

  &:hover {
    background: linear-gradient(180deg, #90d65a 0%, #7cc634 100%);
    color: #ffffff;
    border-color: #19c8b9;
    box-shadow: 0 8px 0 0 #5a9e1e;
  }

  &:active {
    box-shadow: 0 2px 0 0 #5a9e1e;
  }
}

// ============================================
// 各类精美的动森微动效核心 Keyframes
// ============================================

// 漂落落叶/花瓣动画
@keyframes ac404-falling {
  0% {
    transform: translateY(0) rotate(0deg) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.75;
  }
  90% {
    opacity: 0.75;
  }
  100% {
    transform: translateY(105vh) rotate(360deg) translateX(80px);
    opacity: 0;
  }
}

// 顺风云飘
@keyframes ac404-wind {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
}

// 逆风云飘
@keyframes ac404-wind-reverse {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100vw);
  }
}

// 渡渡航空飞机横掠动画
@keyframes ac404-flyby {
  0% {
    transform: translate(0, 0) scale(1);
    left: -250px;
  }
  50% {
    transform: translate(0, -15px) scale(1);
  }
  100% {
    transform: translate(0, 5px) scale(1);
    left: 100%;
  }
}

// 飞机自身悬浮晃动 (波浪)
@keyframes ac404-bob {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(2deg);
  }
}

// 机翼小幅波折
@keyframes ac404-banner-wave {
  0% {
    transform: skewY(-2deg) translateY(-1px);
  }
  100% {
    transform: skewY(2deg) translateY(1px);
  }
}

// 螺旋桨旋转
@keyframes ac404-spin {
  100% {
    transform: rotate(360deg);
  }
}

// 路线航程飞机移动
@keyframes ac404-route-flight {
  0% {
    left: 10%;
    transform: translateY(-9px) rotate(0deg);
  }
  50% {
    transform: translateY(-13px) rotate(-5deg);
  }
  100% {
    left: 85%;
    transform: translateY(-9px) rotate(5deg);
  }
}

// 打字机闪烁光标
@keyframes ac404-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

// 莫里对话框右下指示符跳动
@keyframes ac404-bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(6px);
  }
}

// 按钮 hover 手指摆动动画
@keyframes ac404-wiggle {
  0% {
    transform: translateX(0) scale(1) rotate(-5deg);
  }
  100% {
    transform: translateX(3px) scale(1.05) rotate(5deg);
  }
}

// 响应式适配
@media (max-width: 768px) {
  .ac404 {
    padding: 30px 16px;
  }

  .ac404__ticket {
    width: 100%;
    max-width: 440px;
    height: auto;
    flex-direction: column;
    border-radius: 24px;
  }

  .ac404__ticket-hole {
    display: none; // 手机端隐藏半圆挖槽
  }

  .ac404__ticket-divider {
    width: 100%;
    height: 0;
    border-left: none;
    border-top: 2px dashed rgba(121, 79, 39, 0.22);
    margin-left: 0;
    margin-top: -1px;
  }

  .ac404__ticket-stub {
    width: 100%;
    padding: 20px 24px;
    background: rgba(25, 200, 185, 0.04);
  }

  .ac404__stub-mascot {
    justify-content: flex-end;
  }

  .ac404__barcode {
    width: 150px;
  }

  .ac404__actions {
    flex-direction: column;
    gap: 14px;
    padding: 0 16px;
  }

  .ac404__btn {
    width: 100%;
  }

  .ac404__dialogue-speaker {
    left: 20px;
  }
}
</style>
