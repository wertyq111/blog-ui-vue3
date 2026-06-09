<script setup lang="ts">
import { computed } from "vue";
import { deerSrc, type DeerState } from "@/views/pomo/deer";

const props = defineProps<{ state: DeerState }>();

const labels: Record<DeerState, string> = {
  idle: "小鹿待机",
  list: "小鹿整理提醒列表",
  focus: "小鹿专注写字",
  rest: "小鹿休息伸懒腰",
  celebrate: "小鹿庆祝完成",
};

const src = computed(() => deerSrc(props.state));
const label = computed(() => labels[props.state]);
</script>

<template>
  <div class="stage">
    <div class="char-wrap" :class="`state-${state}`">
      <Transition name="deer-fade" mode="out-in">
        <img
          :key="state"
          class="character"
          :src="src"
          :alt="label"
          draggable="false"
        />
      </Transition>
    </div>
    <div class="shadow" :class="`state-${state}`" />
  </div>
</template>

<style scoped lang="scss">
$frame: 238px;

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 268px;
  overflow: visible;
  user-select: none;
}

.char-wrap {
  width: $frame;
  height: $frame;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.char-wrap.state-focus {
  width: 292px;
}

.char-wrap.state-list {
  width: 278px;
}

.character {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 24px rgba(86, 67, 38, 0.16));
}

.state-idle .character {
  transform: scale(1.06);
}

.state-focus .character,
.state-list .character {
  transform: scale(1.04);
}

.state-rest .character,
.state-celebrate .character {
  transform: scale(1.02);
}

.shadow {
  width: 112px;
  height: 16px;
  margin-top: -14px;
  border-radius: 50%;
  background: rgba(80, 70, 50, 0.18);
  filter: blur(2px);
  opacity: 0.78;
}

.shadow.state-focus,
.shadow.state-list {
  width: 140px;
}

.deer-fade-enter-active,
.deer-fade-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.deer-fade-enter-from,
.deer-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-height: 780px) {
  .stage {
    height: 242px;
  }

  .char-wrap {
    width: 220px;
    height: 220px;
  }

  .char-wrap.state-focus {
    width: 270px;
  }

  .char-wrap.state-list {
    width: 256px;
  }
}
</style>
