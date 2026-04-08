<template>
  <div class="character-scene">
    <div ref="purpleCharRef" class="char char-purple" :style="purpleStyle">
      <span class="eye eye-left" :style="purpleEyeStyle">
        <span class="pupil" :style="purplePupilStyle"></span>
      </span>
      <span class="eye eye-right" :style="purpleEyeStyle">
        <span class="pupil" :style="purplePupilStyle"></span>
      </span>
    </div>
    <div ref="blackCharRef" class="char char-black" :style="blackStyle">
      <span class="eye eye-left" :style="blackEyeStyle">
        <span class="pupil" :style="blackPupilStyle"></span>
      </span>
      <span class="eye eye-right" :style="blackEyeStyle">
        <span class="pupil" :style="blackPupilStyle"></span>
      </span>
    </div>
    <div ref="orangeCharRef" class="char char-orange" :style="orangeStyle">
      <span class="dot dot-left" :style="orangePupilStyle"></span>
      <span class="dot dot-right" :style="orangePupilStyle"></span>
    </div>
    <div ref="yellowCharRef" class="char char-yellow" :style="yellowStyle">
      <span class="dot dot-left" :style="yellowPupilStyle"></span>
      <span class="dot dot-right" :style="yellowPupilStyle"></span>
      <span class="mouth" :style="yellowMouthStyle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";

interface Props {
  activeField: string;
  isPasswordVisible: boolean;
  form: any;
}

const props = defineProps<Props>();

// Element references
const purpleCharRef = ref<HTMLElement | null>(null);
const blackCharRef = ref<HTMLElement | null>(null);
const orangeCharRef = ref<HTMLElement | null>(null);
const yellowCharRef = ref<HTMLElement | null>(null);

// Mouse and movement state
const mouseX = ref(0);
const mouseY = ref(0);

const purplePos = reactive({ faceX: 0, faceY: 0, bodySkew: 0 });
const blackPos = reactive({ faceX: 0, faceY: 0, bodySkew: 0 });
const orangePos = reactive({ faceX: 0, faceY: 0, bodySkew: 0 });
const yellowPos = reactive({ faceX: 0, faceY: 0, bodySkew: 0 });

// Animation states
const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);
const isLookingAtEachOther = ref(false);
const isPurplePeeking = ref(false);

let lookTimer: any = null;
let purpleBlinkTimer: any = null;
let blackBlinkTimer: any = null;
let purplePeekTimer: any = null;

const isTyping = computed(() => props.activeField === "username" || props.activeField === "password");
const isHidingPassword = computed(() => (props.form.password?.length || 0) > 0 && !props.isPasswordVisible);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const calculatePosition = (el: HTMLElement | null) => {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 };
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 3;
  const deltaX = mouseX.value - centerX;
  const deltaY = mouseY.value - centerY;
  return {
    faceX: clamp(deltaX / 20, -15, 15),
    faceY: clamp(deltaY / 30, -10, 10),
    bodySkew: clamp(-deltaX / 120, -6, 6),
  };
};

const updateCharacterMotion = () => {
  Object.assign(purplePos, calculatePosition(purpleCharRef.value));
  Object.assign(blackPos, calculatePosition(blackCharRef.value));
  Object.assign(orangePos, calculatePosition(orangeCharRef.value));
  Object.assign(yellowPos, calculatePosition(yellowCharRef.value));
};

const handleWindowMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
  updateCharacterMotion();
};

const scheduleBlink = (type: "purple" | "black") => {
  const delay = Math.random() * 4000 + 3000;
  const timer = setTimeout(() => {
    if (type === "purple") isPurpleBlinking.value = true;
    else isBlackBlinking.value = true;
    setTimeout(() => {
      if (type === "purple") isPurpleBlinking.value = false;
      else isBlackBlinking.value = false;
      scheduleBlink(type);
    }, 150);
  }, delay);
  if (type === "purple") purpleBlinkTimer = timer;
  else blackBlinkTimer = timer;
};

const triggerLookAtEachOther = () => {
  isLookingAtEachOther.value = true;
  clearTimeout(lookTimer);
  lookTimer = setTimeout(() => {
    isLookingAtEachOther.value = false;
  }, 800);
};

const schedulePurplePeek = () => {
  clearTimeout(purplePeekTimer);
  isPurplePeeking.value = false;
  if (!((props.form.password?.length || 0) > 0 && props.isPasswordVisible)) return;

  const loop = () => {
    const delay = Math.random() * 3000 + 2000;
    purplePeekTimer = setTimeout(() => {
      isPurplePeeking.value = true;
      setTimeout(() => {
        isPurplePeeking.value = false;
        loop();
      }, 800);
    }, delay);
  };
  loop();
};

watch(
  () => props.activeField,
  (newField, oldField) => {
    const wasTyping = oldField === "username" || oldField === "password";
    const nowTyping = newField === "username" || newField === "password";
    if (!wasTyping && nowTyping) triggerLookAtEachOther();
    if (newField === "password") schedulePurplePeek();
  }
);

watch(
  () => props.isPasswordVisible,
  () => schedulePurplePeek()
);

watch(
  () => props.form.password,
  () => {
    if (isTyping.value) triggerLookAtEachOther();
    schedulePurplePeek();
  }
);

// Computed Styles
const purpleStyle = computed(() => {
  const skew = clamp(purplePos.bodySkew, -6, 6);
  let transform = `skewX(${skew}deg)`;
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) {
    transform = "skewX(0deg)";
  } else if (isTyping.value || isHidingPassword.value) {
    transform = `skewX(${skew - 12}deg) translateX(40px)`;
  }
  return {
    height: isTyping.value || isHidingPassword.value ? "340px" : "300px",
    transform,
  };
});

const getPurpleLook = () => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) {
    return isPurplePeeking.value ? { x: 4, y: 5 } : { x: -4, y: -4 };
  }
  if (isLookingAtEachOther.value) return { x: 3, y: 4 };
  return {
    x: clamp(purplePos.faceX / 3, -5, 5),
    y: clamp(purplePos.faceY / 3, -4, 4),
  };
};

const getPurpleEyeOffset = () => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) {
    return { x: -10, y: -6 };
  }
  if (isLookingAtEachOther.value) return { x: 12, y: 18 };
  return {
    x: clamp(purplePos.faceX, -14, 14),
    y: clamp(purplePos.faceY, -10, 10),
  };
};

const purpleEyeStyle = computed(() => {
  const offset = getPurpleEyeOffset();
  return {
    height: isPurpleBlinking.value ? "2px" : "26px",
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };
});

const purplePupilStyle = computed(() => {
  const look = getPurpleLook();
  return {
    transform: `translate(${look.x}px, ${look.y}px)`,
    opacity: isPurpleBlinking.value ? 0 : 1,
  };
});

const blackStyle = computed(() => {
  const skew = clamp(blackPos.bodySkew, -6, 6);
  let transform = `skewX(${skew}deg)`;
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) {
    transform = "skewX(0deg)";
  } else if (isLookingAtEachOther.value) {
    transform = `skewX(${skew * 1.5 + 10}deg) translateX(20px)`;
  } else if (isTyping.value || isHidingPassword.value) {
    transform = `skewX(${skew * 1.5}deg)`;
  }
  return { transform };
});

const getBlackLook = () => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) return { x: -4, y: -4 };
  if (isLookingAtEachOther.value) return { x: 0, y: -4 };
  return {
    x: clamp(blackPos.faceX / 3, -4, 4),
    y: clamp(blackPos.faceY / 3, -4, 4),
  };
};

const getBlackEyeOffset = () => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) return { x: -16, y: -4 };
  if (isLookingAtEachOther.value) return { x: 6, y: -14 };
  return {
    x: clamp(blackPos.faceX, -12, 12),
    y: clamp(blackPos.faceY, -9, 9),
  };
};

const blackEyeStyle = computed(() => {
  const offset = getBlackEyeOffset();
  return {
    height: isBlackBlinking.value ? "2px" : "24px",
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };
});

const blackPupilStyle = computed(() => {
  const look = getBlackLook();
  return {
    transform: `translate(${look.x}px, ${look.y}px)`,
    opacity: isBlackBlinking.value ? 0 : 1,
  };
});

const orangeStyle = computed(() => {
  const skew = clamp(orangePos.bodySkew, -6, 6);
  return {
    transform: (props.form.password?.length || 0) > 0 && props.isPasswordVisible ? "skewX(0deg)" : `skewX(${skew}deg)`,
  };
});

const orangePupilStyle = computed(() => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) return { transform: "translate(-5px, -4px)" };
  return {
    transform: `translate(${clamp(orangePos.faceX / 3, -5, 5)}px, ${clamp(orangePos.faceY / 3, -4, 4)}px)`,
  };
});

const yellowStyle = computed(() => {
  const skew = clamp(yellowPos.bodySkew, -6, 6);
  return {
    transform: (props.form.password?.length || 0) > 0 && props.isPasswordVisible ? "skewX(0deg)" : `skewX(${skew}deg)`,
  };
});

const getYellowLook = () => {
  if ((props.form.password?.length || 0) > 0 && props.isPasswordVisible) return { x: -5, y: -4 };
  return {
    x: clamp(yellowPos.faceX / 3, -5, 5),
    y: clamp(yellowPos.faceY / 3, -4, 4),
  };
};

const yellowPupilStyle = computed(() => {
  const look = getYellowLook();
  return { transform: `translate(${look.x}px, ${look.y}px)` };
});

const yellowMouthStyle = computed(() => {
  const look = getYellowLook();
  return { transform: `translate(${look.x}px, ${look.y}px)` };
});

onMounted(() => {
  window.addEventListener("mousemove", handleWindowMouseMove);
  scheduleBlink("purple");
  scheduleBlink("black");
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleWindowMouseMove);
  clearTimeout(lookTimer);
  clearTimeout(purpleBlinkTimer);
  clearTimeout(blackBlinkTimer);
  clearTimeout(purplePeekTimer);
});
</script>

<style scoped lang="scss">
.character-scene {
  position: absolute;
  bottom: 92px;
  left: 50%;
  width: 520px;
  height: 420px;
  transform: translateX(-50%);
}

.char {
  position: absolute;
  transition:
    transform 0.7s ease-in-out,
    height 0.7s ease-in-out;
  transform-origin: bottom center;
}

.eye {
  position: absolute;
  display: block;
  width: 26px;
  height: 26px;
  overflow: hidden;
  background: #fff;
  border-radius: 50%;
  transition:
    transform 0.7s ease-in-out,
    height 0.15s ease;
  transform-origin: center center;
}

.pupil {
  position: absolute;
  top: 8px;
  left: 8px;
  display: block;
  width: 10px;
  height: 10px;
  background: #25292f;
  border-radius: 50%;
  transition:
    transform 0.1s ease-out,
    opacity 0.2s ease;
  transform: translate(0, 0);
}

.char-purple {
  bottom: 0;
  left: 78px;
  width: 178px;
  height: 300px;
  background: linear-gradient(180deg, #6d47f4 0%, #5c35db 100%);
  border-radius: 12px 12px 0 0;

  .eye-left {
    top: 24px;
    left: 30px;
  }

  .eye-right {
    top: 24px;
    left: 82px;
  }
}

.char-black {
  bottom: 0;
  left: 242px;
  width: 122px;
  height: 210px;
  background: #2e3036;
  border-radius: 10px 10px 0 0;

  .eye-left {
    top: 18px;
    left: 10px;
    width: 24px;
    height: 24px;
  }

  .eye-right {
    top: 18px;
    left: 50px;
    width: 24px;
    height: 24px;
  }
}

.char-orange {
  bottom: 0;
  left: 20px;
  z-index: 3;
  width: 240px;
  height: 200px;
  background: #f59462;
  border-radius: 120px 120px 0 0;
}

.char-yellow {
  bottom: 0;
  left: 320px;
  z-index: 4;
  width: 142px;
  height: 230px;
  background: #e5d758;
  border-radius: 72px 72px 0 0;
}

.dot {
  position: absolute;
  display: block;
  width: 14px;
  height: 14px;
  background: #2c3037;
  border-radius: 50%;
  transition: transform 0.2s ease-out;
}

.char-orange .dot-left {
  top: 74px;
  left: 70px;
}

.char-orange .dot-right {
  top: 74px;
  left: 114px;
}

.char-yellow .dot-left {
  top: 34px;
  left: 34px;
}

.char-yellow .dot-right {
  top: 34px;
  left: 70px;
}

.char-yellow .mouth {
  position: absolute;
  top: 84px;
  left: 30px;
  width: 80px;
  height: 6px;
  background: #333840;
  border-radius: 6px;
  transition: transform 0.2s ease-out;
}
</style>
