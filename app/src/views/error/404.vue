<template>
  <div class="ac404">
    <!-- 漂浮的叶子装饰 -->
    <span class="ac404__leaf ac404__leaf--1" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M27 5C13 5 5 13 5 27c14 0 22-8 22-22Z"
          fill="#82d5bb"
        />
        <path d="M9 23 23 9" stroke="#11a89b" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>
    <span class="ac404__leaf ac404__leaf--2" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M27 5C13 5 5 13 5 27c14 0 22-8 22-22Z" fill="#f7cd67" />
        <path d="M9 23 23 9" stroke="#dba90e" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>
    <span class="ac404__leaf ac404__leaf--3" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M27 5C13 5 5 13 5 27c14 0 22-8 22-22Z" fill="#f8a6b2" />
        <path d="M9 23 23 9" stroke="#e05a5a" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>

    <div class="ac404__card">
      <div class="ac404__code">
        <span class="ac404__digit">4</span>
        <span class="ac404__blob">
          <svg viewBox="0 0 64 64" fill="none">
            <path
              d="M51 8C40 4 24 4 13 8 4 18 4 46 13 56c11 4 27 4 38 0 9-10 9-38 0-48Z"
              fill="#19c8b9"
            />
            <circle cx="25" cy="30" r="4" fill="#fff" />
            <circle cx="39" cy="30" r="4" fill="#fff" />
            <path
              d="M25 40c3 3 11 3 14 0"
              stroke="#fff"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <span class="ac404__digit">4</span>
      </div>

      <h1 class="ac404__title">哎呀，这座小岛还没开通</h1>
      <p class="ac404__desc">
        您要找的页面好像迷路在森林里了～<br />
        检查一下网址，或者乘坐海鸥航空回到家吧
      </p>

      <div class="ac404__actions">
        <button class="ac404__btn ac404__btn--primary" type="button" @click="goHome">
          返回首页
        </button>
        <button class="ac404__btn" type="button" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Page404" });

const router = useRouter();
const goHome = () => router.push("/");
const goBack = () => router.back();
</script>

<style lang="scss" scoped>
.ac404 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  overflow: hidden;
  font-family: var(--animal-font-family);
  background:
    radial-gradient(circle at 18% 20%, rgba(130, 213, 187, 0.28), transparent 42%),
    radial-gradient(circle at 82% 78%, rgba(247, 205, 103, 0.24), transparent 46%),
    linear-gradient(180deg, #fdfdf5 0%, var(--animal-bg-color) 60%, #f0e8d8 100%);
}

.ac404__card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 540px;
  padding: 48px 44px 52px;
  text-align: center;
  background: rgba(253, 253, 245, 0.85);
  backdrop-filter: blur(8px);
  border: 2px solid var(--animal-border-color-light);
  border-radius: 48px 40px 52px 44px / 44px 52px 40px 48px;
  box-shadow: 0 12px 32px rgba(61, 52, 40, 0.12);
  animation: ac404-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.ac404__code {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  line-height: 1;
}

.ac404__digit {
  font-size: 110px;
  font-weight: 900;
  letter-spacing: 2px;
  color: transparent;
  background: linear-gradient(180deg, #3dd4c6 0%, #19c8b9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 6px 0 rgba(17, 168, 155, 0.18);
}

.ac404__blob {
  width: 116px;
  height: 116px;
  filter: drop-shadow(0 8px 0 rgba(17, 168, 155, 0.45));
  animation: ac404-bob 3s ease-in-out infinite;

  svg {
    width: 100%;
    height: 100%;
  }
}

.ac404__title {
  margin: 0 0 12px;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--animal-text-color);
}

.ac404__desc {
  margin: 0 0 32px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.8;
  color: var(--animal-text-color-secondary);
}

.ac404__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.ac404__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--animal-text-color);
  cursor: pointer;
  background: #fdfdf5;
  border: 2px solid #fdfdf5;
  border-radius: 50px;
  box-shadow: 0 5px 0 0 var(--animal-shadow-warm);
  transition:
    transform 0.18s var(--animal-motion-ease),
    box-shadow 0.18s var(--animal-motion-ease);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 0 0 var(--animal-shadow-warm);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 0 var(--animal-shadow-warm);
  }

  &:focus-visible {
    outline: 2px solid var(--animal-primary-color);
    outline-offset: 2px;
  }
}

.ac404__btn--primary {
  color: #fff;
  background: linear-gradient(180deg, #3dd4c6 0%, #19c8b9 100%);
  border-color: #19c8b9;
  box-shadow: 0 5px 0 0 #11a89b;

  &:hover {
    box-shadow: 0 7px 0 0 #11a89b;
  }

  &:active {
    box-shadow: 0 1px 0 0 #11a89b;
  }
}

.ac404__leaf {
  position: absolute;
  z-index: 0;
  opacity: 0.85;

  svg {
    width: 100%;
    height: 100%;
  }

  &--1 {
    top: 14%;
    left: 12%;
    width: 56px;
    height: 56px;
    animation: ac404-float 6s ease-in-out infinite;
  }

  &--2 {
    bottom: 16%;
    left: 18%;
    width: 40px;
    height: 40px;
    animation: ac404-float 5s ease-in-out infinite 0.6s;
  }

  &--3 {
    top: 22%;
    right: 14%;
    width: 48px;
    height: 48px;
    animation: ac404-float 7s ease-in-out infinite 1.2s;
  }
}

@keyframes ac404-pop {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.94);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes ac404-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }

  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@keyframes ac404-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-14px) rotate(12deg);
  }
}

@media (max-width: 640px) {
  .ac404__card {
    padding: 36px 24px 40px;
  }

  .ac404__digit {
    font-size: 76px;
  }

  .ac404__blob {
    width: 84px;
    height: 84px;
  }

  .ac404__title {
    font-size: 21px;
  }
}
</style>
