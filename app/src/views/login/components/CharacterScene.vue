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
  bottom: 78px;
  left: 50%;
  width: 520px;
  height: 420px;
  transform: translateX(-50%);
  z-index: 5;
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
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
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

  &::after {
    content: "";
    position: absolute;
    top: 1px;
    right: 1px;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    opacity: 0.7;
  }
}

/* Purple — leafy hooded character */
.char-purple {
  bottom: 0;
  left: 78px;
  width: 178px;
  height: 300px;
  background: linear-gradient(180deg, #b77dee 0%, #8a52c2 100%);
  border-radius: 70px 70px 14px 14px;
  box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.08), 0 6px 0 0 rgba(0, 0, 0, 0.12);

  &::before {
    content: "";
    position: absolute;
    top: -32px;
    left: 50%;
    transform: translateX(-50%) rotate(-10deg);
    width: 90px;
    height: 56px;
    background: linear-gradient(135deg, #8ac68a 0%, #5c9c5c 100%);
    border-radius: 0 90px 0 90px;
    box-shadow: inset -4px -4px 0 rgba(0, 0, 0, 0.08);
  }

  &::after {
    content: "";
    position: absolute;
    top: 84px;
    left: 22px;
    width: 18px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 138, 168, 0.55);
    box-shadow: 110px 0 rgba(255, 138, 168, 0.55);
  }

  .eye-left {
    top: 30px;
    left: 30px;
  }

  .eye-right {
    top: 30px;
    left: 82px;
  }
}

/* Black — cat-ear character */
.char-black {
  bottom: 0;
  left: 242px;
  width: 122px;
  height: 210px;
  background: #2e3036;
  border-radius: 14px 14px 10px 10px;
  box-shadow: inset 0 -8px 0 rgba(255, 255, 255, 0.05), 0 6px 0 0 rgba(0, 0, 0, 0.18);

  &::before {
    content: "";
    position: absolute;
    top: -20px;
    left: 12px;
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-bottom: 26px solid #2e3036;
    box-shadow: 60px 0 0 -2px #2e3036;
    filter: drop-shadow(2px 0 0 #2e3036);
  }

  &::after {
    content: "";
    position: absolute;
    top: -2px;
    left: -4px;
    right: -4px;
    height: 16px;
    background: var(--cyber-primary);
    border-radius: 6px;
    box-shadow: 0 3px 0 0 var(--cyber-primary-strong);
  }

  .eye-left {
    top: 22px;
    left: 10px;
    width: 24px;
    height: 24px;
  }

  .eye-right {
    top: 22px;
    left: 50px;
    width: 24px;
    height: 24px;
  }
}

/* Orange — apple-shaped fella */
.char-orange {
  bottom: 0;
  left: 20px;
  z-index: 3;
  width: 240px;
  height: 200px;
  background: radial-gradient(circle at 30% 30%, #ffb285 0%, #e59266 60%, #c8703c 100%);
  border-radius: 130px 130px 30px 30px;
  box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.08), 0 6px 0 0 rgba(0, 0, 0, 0.18);

  &::before {
    content: "";
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%) rotate(-25deg);
    width: 40px;
    height: 22px;
    background: #8ac68a;
    border-radius: 0 22px 0 22px;
    box-shadow: inset -3px -3px 0 rgba(0, 0, 0, 0.08);
  }

  &::after {
    content: "";
    position: absolute;
    top: 100px;
    left: 50px;
    width: 22px;
    height: 12px;
    border-radius: 50%;
    background: rgba(220, 80, 100, 0.4);
    box-shadow: 110px 0 rgba(220, 80, 100, 0.4);
  }
}

/* Yellow — chubby smiley */
.char-yellow {
  bottom: 0;
  left: 320px;
  z-index: 4;
  width: 142px;
  height: 230px;
  background: radial-gradient(circle at 30% 30%, #ffe48a 0%, #f7cd67 60%, #d5a830 100%);
  border-radius: 80px 80px 24px 24px;
  box-shadow: inset 0 -8px 0 rgba(0, 0, 0, 0.06), 0 6px 0 0 rgba(0, 0, 0, 0.18);

  &::before {
    content: "";
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 28px;
    background:
      radial-gradient(circle at center, #fff 0 6px, transparent 7px),
      radial-gradient(circle at center, #f8a6b2 0 14px, transparent 15px);
    border-radius: 50%;
    filter: drop-shadow(0 2px 0 #d6788a);
  }

  &::after {
    content: "";
    position: absolute;
    top: 80px;
    left: 18px;
    width: 18px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 138, 168, 0.55);
    box-shadow: 84px 0 rgba(255, 138, 168, 0.55);
  }
}

.dot {
  position: absolute;
  display: block;
  width: 14px;
  height: 14px;
  background: #2c3037;
  border-radius: 50%;
  transition: transform 0.2s ease-out;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    right: 2px;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    opacity: 0.85;
  }
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
  top: 38px;
  left: 34px;
}

.char-yellow .dot-right {
  top: 38px;
  left: 70px;
}

.char-yellow .mouth {
  position: absolute;
  top: 92px;
  left: 36px;
  width: 70px;
  height: 8px;
  background: #5b4a30;
  border-radius: 8px;
  transition: transform 0.2s ease-out;
}
</style>
