<!-- 首页木牌标题（已登录 / 未登录 hero 共用） -->
<template>
  <div class="hero-sign">
    <h1 class="hero-title">
      <span class="hero-sign__ch">博</span>
      <span class="hero-sign__ch">客</span>
      <br />
      <span class="hero-sign__ch">小</span>
      <span class="hero-sign__ch">岛</span>
    </h1>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HeroSign" });
</script>

<style scoped lang="scss">
// 木牌由两根绳子挂着，以绳子顶端为轴轻轻摆动
.hero-sign {
  position: relative;
  display: inline-block;
  margin: 44px 0 20px;
  padding: 16px 30px 12px;
  background: linear-gradient(
    180deg,
    var(--home-sign-wood-top) 0%,
    var(--home-sign-wood-bottom) 100%
  );
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  box-shadow: 0 6px 0 0 var(--home-sign-wood-shadow);
  transform-origin: 50% -34px;
  animation: hero-sign-swing 3.6s ease-in-out infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: -34px;
    width: 3px;
    height: 34px;
    background: var(--home-sign-rope);
  }

  &::before {
    left: 34px;
  }

  &::after {
    right: 34px;
  }
}

.hero-title {
  margin: 0;
  font-size: clamp(52px, 7vw, 88px);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.03em;
  color: #fffdec;
  text-shadow:
    0 2.5px 0 #eed09d,
    0 5px 0 var(--ai-outline),
    0 7.5px 0 var(--ai-outline),
    0 12px 24px rgba(90, 58, 24, 0.18);
}

// 进场逐字弹入；鼠标移上换成同内容的另一组 keyframes 以重播
.hero-sign__ch {
  display: inline-block;
  animation: hero-sign-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:nth-of-type(2) {
    animation-delay: 0.08s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.16s;
  }

  &:nth-of-type(4) {
    animation-delay: 0.24s;
  }
}

.hero-sign:hover .hero-sign__ch {
  animation-name: hero-sign-pop-again;
}

@keyframes hero-sign-swing {
  0%,
  100% {
    transform: rotate(-2.2deg);
  }
  50% {
    transform: rotate(2.2deg);
  }
}

@keyframes hero-sign-pop {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.4);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-sign-pop-again {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0.4);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-sign,
  .hero-sign__ch {
    animation: none;
  }
}
</style>
