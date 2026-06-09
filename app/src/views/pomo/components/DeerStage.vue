<script setup lang="ts">
import { computed } from "vue";
import { deerSrc, type DeerState } from "@/views/pomo/deer";

const props = defineProps<{ state: DeerState }>();
const src = computed(() => deerSrc(props.state));
</script>

<template>
  <div class="deer-stage">
    <Transition name="deer-fade" mode="out-in">
      <img :key="state" :src="src" :class="['deer', state]" alt="番茄钟小鹿" />
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/vars" as *;

.deer-stage {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 160px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba($primary, 0.14) 0%, transparent 100%);
}

.deer {
  height: 152px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 8px rgba(61, 52, 40, 0.18));
  animation: deer-bob 3s $motion-ease infinite;
}

.deer.celebrate {
  animation: deer-pop 0.6s $motion-ease;
}

@keyframes deer-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes deer-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.12) rotate(-3deg);
  }
  100% {
    transform: scale(1);
  }
}

.deer-fade-enter-active,
.deer-fade-leave-active {
  transition:
    opacity $motion-base $motion-ease,
    transform $motion-base $motion-ease;
}
.deer-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.deer-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
