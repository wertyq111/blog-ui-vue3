<template>
  <div class="weather-scene" :style="{ background: weatherBg }">
    <!-- Sunny -->
    <template v-if="weather === 'sunny'">
      <div class="w-sun w-sun-big"><div class="w-sun-rays" /></div>
      <div class="w-cloud w-cloud-sm" style="top:30%;left:20%">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <div v-for="i in 4" :key="'sp'+i" class="w-spark" :style="{ top: `${15+(i-1)*14}%`, left: `${12+(i-1)*20}%`, animationDelay: `${(i-1)*0.6}s` }" />
      <svg v-for="i in 3" :key="'bd'+i" class="w-bird" viewBox="0 0 32 16"
        :style="{ top: `${14+(i-1)*11}%`, animationDelay: `-${(i-1)*5}s`, animationDuration: `${15+(i-1)*4}s` }">
        <path class="w-bird-wing" d="M2 12 Q9 2 16 10 Q23 2 30 12" fill="none" stroke="#5a4a32" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </template>

    <!-- Partly Cloudy -->
    <template v-else-if="weather === 'partlyCloudy'">
      <div class="w-sun w-sun-md" />
      <div class="w-cloud" style="top:20%;left:30%;animation-duration:32s">
        <svg viewBox="0 0 120 60"><ellipse cx="35" cy="35" rx="32" ry="18"/><ellipse cx="72" cy="28" rx="28" ry="18"/><ellipse cx="98" cy="38" rx="18" ry="12"/></svg>
      </div>
      <div class="w-cloud" style="top:55%;left:12%;animation-duration:26s;animation-direction:reverse">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <div class="w-cloud w-cloud-sm" style="top:70%;right:30%;animation-duration:22s">
        <svg viewBox="0 0 80 40"><ellipse cx="22" cy="22" rx="20" ry="11"/><ellipse cx="50" cy="18" rx="20" ry="12"/><ellipse cx="68" cy="26" rx="10" ry="8"/></svg>
      </div>
      <svg v-for="i in 3" :key="'bd'+i" class="w-bird" viewBox="0 0 32 16"
        :style="{ top: `${16+(i-1)*12}%`, animationDelay: `-${(i-1)*6}s`, animationDuration: `${16+(i-1)*3}s` }">
        <path class="w-bird-wing" d="M2 12 Q9 2 16 10 Q23 2 30 12" fill="none" stroke="#5a4a32" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </template>

    <!-- Cloudy -->
    <template v-else-if="weather === 'cloudy'">
      <div v-for="i in 5" :key="'cl'+i" class="w-cloud w-cloud-gray"
        :style="{ top: `${10+(i-1)*14}%`, left: `${((i-1)*22)%80}%`, animationDuration: `${22+(i-1)*5}s`, animationDelay: `${(i-1)*-3}s`, opacity: 0.7-(i-1)*0.06 }">
        <svg viewBox="0 0 120 60"><ellipse cx="35" cy="35" rx="32" ry="18"/><ellipse cx="72" cy="28" rx="28" ry="18"/><ellipse cx="98" cy="38" rx="18" ry="12"/></svg>
      </div>
    </template>

    <!-- Rain / Heavy Rain -->
    <template v-else-if="weather === 'rain' || weather === 'heavyRain'">
      <div class="w-cloud w-cloud-dark" style="top:8%;left:20%">
        <svg viewBox="0 0 140 60"><ellipse cx="40" cy="36" rx="36" ry="20"/><ellipse cx="82" cy="28" rx="32" ry="20"/><ellipse cx="115" cy="40" rx="20" ry="14"/></svg>
      </div>
      <div class="w-cloud w-cloud-dark" style="top:20%;right:10%;width:140px">
        <svg viewBox="0 0 140 60"><ellipse cx="40" cy="36" rx="36" ry="20"/><ellipse cx="82" cy="28" rx="32" ry="20"/><ellipse cx="115" cy="40" rx="20" ry="14"/></svg>
      </div>
      <div class="w-rain-layer">
        <span v-for="i in (weather === 'heavyRain' ? 60 : 36)" :key="'dr'+i"
          :class="['w-drop', weather === 'heavyRain' && 'w-drop-heavy']"
          :style="{ left: `${((i-1)*(weather === 'heavyRain' ? 1.7 : 2.8))%100}%`, animationDelay: `-${((i-1)*0.07)%1.2}s`, animationDuration: `${(weather === 'heavyRain' ? 0.45 : 0.7)+((i-1)%4)*0.05}s` }" />
      </div>
      <div class="w-splash-layer">
        <span v-for="i in 8" :key="'spl'+i" class="w-splash"
          :style="{ left: `${6+(i-1)*12.5}%`, animationDelay: `-${((i-1)*0.37)%1.4}s` }" />
      </div>
      <div v-if="weather === 'heavyRain'" class="w-puddle" />
    </template>

    <!-- Thunder -->
    <template v-else-if="weather === 'thunder'">
      <div class="w-cloud w-cloud-dark w-cloud-thunder" style="top:6%;left:16%">
        <svg viewBox="0 0 160 70"><ellipse cx="40" cy="38" rx="38" ry="22"/><ellipse cx="86" cy="28" rx="36" ry="22"/><ellipse cx="130" cy="42" rx="24" ry="16"/></svg>
      </div>
      <div class="w-cloud w-cloud-dark w-cloud-thunder" style="top:20%;right:6%;width:180px">
        <svg viewBox="0 0 160 70"><ellipse cx="40" cy="38" rx="38" ry="22"/><ellipse cx="86" cy="28" rx="36" ry="22"/><ellipse cx="130" cy="42" rx="24" ry="16"/></svg>
      </div>
      <div class="w-rain-layer">
        <span v-for="i in 40" :key="'tdr'+i" class="w-drop w-drop-heavy"
          :style="{ left: `${((i-1)*2.6)%100}%`, animationDelay: `-${((i-1)*0.06)%1}s`, animationDuration: `${0.5+((i-1)%4)*0.05}s` }" />
      </div>
      <div class="w-bolt w-bolt-1">
        <svg viewBox="0 0 30 80" fill="#ffe66e" stroke="#c89a3a" stroke-width="1.5" stroke-linejoin="round"><path d="M14 0 L4 42 L13 42 L8 80 L26 32 L17 32 L22 0 Z"/></svg>
      </div>
      <div class="w-bolt w-bolt-2">
        <svg viewBox="0 0 30 80" fill="#ffe66e" stroke="#c89a3a" stroke-width="1.5" stroke-linejoin="round"><path d="M14 0 L4 42 L13 42 L8 80 L26 32 L17 32 L22 0 Z"/></svg>
      </div>
      <div class="w-bolt w-bolt-3">
        <svg viewBox="0 0 30 80" fill="#ffe66e" stroke="#c89a3a" stroke-width="1.5" stroke-linejoin="round"><path d="M14 0 L4 42 L13 42 L8 80 L26 32 L17 32 L22 0 Z"/></svg>
      </div>
      <div class="w-flash" />
    </template>

    <!-- Snow -->
    <template v-else-if="weather === 'snow'">
      <div class="w-cloud w-cloud-snow" style="top:8%;left:20%">
        <svg viewBox="0 0 140 60"><ellipse cx="40" cy="36" rx="36" ry="20"/><ellipse cx="82" cy="28" rx="32" ry="20"/><ellipse cx="115" cy="40" rx="20" ry="14"/></svg>
      </div>
      <div class="w-cloud w-cloud-snow" style="top:20%;right:12%">
        <svg viewBox="0 0 120 50"><ellipse cx="32" cy="30" rx="30" ry="18"/><ellipse cx="72" cy="22" rx="28" ry="18"/><ellipse cx="98" cy="32" rx="16" ry="12"/></svg>
      </div>
      <div class="w-snow-layer">
        <span v-for="i in 30" :key="'fl'+i" class="w-flake"
          :style="{ left: `${((i-1)*3.4)%100}%`, animationDelay: `-${((i-1)*0.4)%6}s`, animationDuration: `${5+((i-1)%5)}s`, width: `${6+((i-1)%4)*2}px`, height: `${6+((i-1)%4)*2}px`, '--sway': `${(i%2 ? 1 : -1)*(22+((i-1)%3)*14)}px` }">&#10052;</span>
      </div>
      <div class="w-snow-ground" />
    </template>

    <!-- Haze -->
    <template v-else-if="weather === 'haze'">
      <div class="w-sun w-sun-dim" />
      <div class="w-fog w-fog-1" />
      <div class="w-fog w-fog-2" />
      <div class="w-fog w-fog-3" />
      <span v-for="i in 20" :key="'du'+i" class="w-dust"
        :style="{ top: `${((i-1)*7)%90}%`, left: `${((i-1)*11)%95}%`, animationDelay: `${(i-1)*0.25}s` }" />
    </template>

    <!-- Wind -->
    <template v-else-if="weather === 'wind'">
      <div class="w-sun w-sun-md" />
      <div class="w-cloud" style="top:18%;left:30%;animation-duration:8s">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <svg v-for="i in 10" :key="'lf'+i" class="w-leaf-fly" viewBox="0 0 30 24"
        :style="{ top: `${10+(i-1)*8}%`, animationDelay: `-${(i-1)*1.1}s`, animationDuration: `${5+((i-1)%3)}s` }">
        <path d="M2 22c0-12 10-20 26-20 0 14-12 22-26 20z"
          :fill="(i-1)%3===0 ? '#d1da49' : (i-1)%3===1 ? '#7cba70' : '#f7cd67'" stroke="#5a3a18" stroke-width="1.2"/>
      </svg>
      <span v-for="i in 6" :key="'wl'+i" class="w-wind-line"
        :style="{ top: `${20+(i-1)*12}%`, animationDelay: `${(i-1)*0.3}s` }" />
    </template>

    <!-- Rainbow -->
    <template v-else-if="weather === 'rainbow'">
      <div class="w-sun w-sun-md" style="right:10%;top:20%" />
      <svg class="w-rainbow" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path d="M20 200 A 180 180 0 0 1 380 200" fill="none" stroke="#ff6f6f" stroke-width="10"/>
        <path d="M30 200 A 170 170 0 0 1 370 200" fill="none" stroke="#ffae42" stroke-width="10"/>
        <path d="M40 200 A 160 160 0 0 1 360 200" fill="none" stroke="#ffe066" stroke-width="10"/>
        <path d="M50 200 A 150 150 0 0 1 350 200" fill="none" stroke="#7cba70" stroke-width="10"/>
        <path d="M60 200 A 140 140 0 0 1 340 200" fill="none" stroke="#19c8b9" stroke-width="10"/>
        <path d="M70 200 A 130 130 0 0 1 330 200" fill="none" stroke="#889df0" stroke-width="10"/>
        <path d="M80 200 A 120 120 0 0 1 320 200" fill="none" stroke="#b77dee" stroke-width="10"/>
      </svg>
      <div class="w-cloud w-cloud-sm" style="bottom:10%;left:10%">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <div class="w-cloud w-cloud-sm" style="bottom:10%;right:10%">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
    </template>

    <!-- Sakura -->
    <template v-else-if="weather === 'sakura'">
      <div class="w-sun w-sun-md w-sun-pink" />
      <div class="w-cloud w-cloud-pink" style="top:16%;left:26%">
        <svg viewBox="0 0 120 50"><ellipse cx="32" cy="30" rx="30" ry="18"/><ellipse cx="72" cy="22" rx="28" ry="18"/><ellipse cx="98" cy="32" rx="16" ry="12"/></svg>
      </div>
      <svg v-for="i in 20" :key="'pt'+i" class="w-petal" viewBox="0 0 24 24"
        :style="{ left: `${((i-1)*5.1)%100}%`, width: `${14+((i-1)%4)*4}px`, height: `${14+((i-1)%4)*4}px`, animationDelay: `-${((i-1)*0.6)%10}s`, animationDuration: `${8+((i-1)%5)}s`, '--rot': `${((i-1)*47)%360}deg` }">
        <path d="M12 2c4 2 7 6 6 11-1 4-5 7-9 7-3 0-5-2-5-5 0-5 3-11 8-13z" fill="#ffb6c1" stroke="#d6788a" stroke-width="1"/>
        <circle cx="10" cy="12" r="1.5" fill="#fff2ba"/>
      </svg>
    </template>

    <!-- Night -->
    <template v-else-if="weather === 'night'">
      <div class="w-moon">
        <div class="w-moon-crater w-moon-crater-1" />
        <div class="w-moon-crater w-moon-crater-2" />
        <div class="w-moon-crater w-moon-crater-3" />
      </div>
      <span v-for="i in 30" :key="'st'+i" class="w-star"
        :style="{ top: `${((i-1)*7)%70}%`, left: `${((i-1)*13)%95}%`, width: `${1+((i-1)%4)}px`, height: `${1+((i-1)%4)}px`, animationDelay: `${((i-1)*0.3)%4}s` }" />
      <div class="w-cloud w-cloud-night" style="top:40%;left:10%">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <span v-for="i in 4" :key="'ff'+i" class="w-firefly"
        :style="{ top: `${45+((i-1)*11)%35}%`, left: `${12+((i-1)*24)%80}%`, animationDelay: `-${(i-1)*1.7}s` }" />
      <span class="w-shoot" />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ weather: string }>();

const WEATHER_BG: Record<string, string> = {
  sunny:        "radial-gradient(900px 360px at 60% 0%, rgba(255,230,130,0.7) 0%, transparent 60%), linear-gradient(180deg, #fff7d6 0%, #f7e7a3 100%)",
  partlyCloudy: "radial-gradient(900px 360px at 60% 0%, rgba(247,205,103,0.4) 0%, transparent 60%), linear-gradient(180deg, #f4f3d4 0%, #d8e9bc 100%)",
  cloudy:       "linear-gradient(180deg, #cfd5dc 0%, #aab5c1 100%)",
  rain:         "linear-gradient(180deg, #9aabbc 0%, #6f8197 100%)",
  heavyRain:    "linear-gradient(180deg, #6c7f96 0%, #455367 100%)",
  thunder:      "linear-gradient(180deg, #2e3a4a 0%, #1d2532 100%)",
  snow:         "linear-gradient(180deg, #eef4f8 0%, #d6e3ec 100%)",
  haze:         "linear-gradient(180deg, #d8c8a8 0%, #b5a487 100%)",
  wind:         "radial-gradient(900px 360px at 60% 0%, rgba(180,220,130,0.5) 0%, transparent 60%), linear-gradient(180deg, #e6efc8 0%, #c4d39a 100%)",
  rainbow:      "linear-gradient(180deg, #fff0f5 0%, #ffd6e6 50%, #ffe7d4 100%)",
  sakura:       "linear-gradient(180deg, #ffe9ef 0%, #ffd2dd 100%)",
  night:        "linear-gradient(180deg, #1a2440 0%, #0f1730 100%)",
};

const weatherBg = computed(() => WEATHER_BG[props.weather] || WEATHER_BG.partlyCloudy);
</script>

<style lang="scss" scoped>
.weather-scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  transition: background 0.6s ease;
}

/* ===== Sun ===== */
.w-sun {
  position: absolute;
  border-radius: 50%;
  z-index: 2;
}
.w-sun-big {
  top: -30px; right: 4%;
  width: 200px; height: 200px;
  background: radial-gradient(circle, #fff5c0 0%, #ffd17a 40%, transparent 70%);
}
.w-sun-md {
  top: 0; right: 8%;
  width: 140px; height: 140px;
  background: radial-gradient(circle, #fff5c0 0%, #ffd17a 50%, transparent 70%);
  animation: w-sun-pulse 4s ease-in-out infinite;
}
.w-sun-dim {
  top: 12%; right: 14%;
  width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(255,236,180,0.5) 0%, rgba(220,180,120,0.2) 50%, transparent 70%);
  filter: blur(8px);
}
.w-sun-pink {
  background: radial-gradient(circle, #fff0f5 0%, #ffb6c1 40%, transparent 70%) !important;
}

.w-sun-big .w-sun-rays {
  position: absolute; inset: -30px;
  background:
    conic-gradient(from 0deg, transparent 0deg, rgba(255,220,130,0.25) 5deg, transparent 15deg,
      transparent 30deg, rgba(255,220,130,0.25) 35deg, transparent 45deg,
      transparent 60deg, rgba(255,220,130,0.25) 65deg, transparent 75deg,
      transparent 90deg, rgba(255,220,130,0.25) 95deg, transparent 105deg,
      transparent 120deg, rgba(255,220,130,0.25) 125deg, transparent 135deg,
      transparent 150deg, rgba(255,220,130,0.25) 155deg, transparent 165deg,
      transparent 180deg, rgba(255,220,130,0.25) 185deg, transparent 195deg,
      transparent 210deg, rgba(255,220,130,0.25) 215deg, transparent 225deg,
      transparent 240deg, rgba(255,220,130,0.25) 245deg, transparent 255deg,
      transparent 270deg, rgba(255,220,130,0.25) 275deg, transparent 285deg,
      transparent 300deg, rgba(255,220,130,0.25) 305deg, transparent 315deg,
      transparent 330deg, rgba(255,220,130,0.25) 335deg, transparent 345deg);
  border-radius: 50%;
  animation: w-sun-rotate 60s linear infinite;
}

@keyframes w-sun-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.92; }
}
@keyframes w-sun-rotate { to { transform: rotate(360deg); } }

/* sparkles */
.w-spark {
  position: absolute;
  width: 14px; height: 14px;
  background: radial-gradient(circle, rgba(255,240,160,0.9) 0%, transparent 60%);
  border-radius: 50%;
  animation: w-spark 3.2s ease-in-out infinite;
}
.w-spark::before, .w-spark::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(transparent 46%, rgba(255,240,160,0.7) 46% 54%, transparent 54%);
}
.w-spark::after { transform: rotate(90deg); }
@keyframes w-spark {
  0%, 100% { opacity: 0; transform: scale(0.4); }
  50% { opacity: 1; transform: scale(1); }
}

/* birds（晴/多云的远景飞鸟）*/
.w-bird {
  position: absolute;
  left: -6%;
  width: 26px;
  height: 13px;
  z-index: 3;
  animation: w-bird-fly linear infinite;
}
.w-bird-wing {
  transform-box: fill-box;
  transform-origin: 50% 60%;
  animation: w-bird-flap 0.5s ease-in-out infinite alternate;
}
@keyframes w-bird-fly {
  0% { transform: translate(-40px, 0); }
  25% { transform: translate(30vw, -12px); }
  50% { transform: translate(60vw, 4px); }
  75% { transform: translate(90vw, -8px); }
  100% { transform: translate(125vw, 0); }
}
@keyframes w-bird-flap {
  from { transform: scaleY(1); }
  to { transform: scaleY(0.55); }
}

/* ===== Clouds ===== */
.w-cloud {
  position: absolute;
  width: 120px;
  z-index: 2;
  animation: w-cloud-drift 28s ease-in-out infinite;
  filter: drop-shadow(0 4px 0 rgba(255,255,255,0.4));
}
.w-cloud svg { width: 100%; height: auto; display: block; fill: #fff; }
.w-cloud-sm { width: 80px; }
.w-cloud-gray svg { fill: #e8edf2; }
.w-cloud-dark svg { fill: #3e4a5c; }
.w-cloud-snow svg { fill: #fdfdff; }
.w-cloud-pink svg { fill: #fff0f5; }
.w-cloud-night svg { fill: #4a5570; opacity: 0.7; }
@keyframes w-cloud-drift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(50px); }
}

/* ===== Rain ===== */
.w-rain-layer {
  position: absolute; inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}
.w-drop {
  position: absolute;
  top: -10%;
  width: 2px; height: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(180,230,255,0.8) 100%);
  border-radius: 2px;
  animation: w-drop-fall 0.8s linear infinite;
}
.w-drop-heavy {
  width: 2.5px; height: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(220,240,255,0.95) 100%);
}
@keyframes w-drop-fall {
  0% { transform: translateY(-20%); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(120vh); opacity: 0.8; }
}
/* 雨点落地水花：底部循环扩散的椭圆涟漪 */
.w-splash-layer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2px;
  height: 20px;
  z-index: 3;
  pointer-events: none;
}
.w-splash {
  position: absolute;
  bottom: 0;
  width: 12px;
  height: 5px;
  border: 1.5px solid rgba(210, 235, 255, 0.8);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.2);
  animation: w-splash-pop 1.4s ease-out infinite;
}
@keyframes w-splash-pop {
  0% { transform: scale(0.2); opacity: 0; }
  15% { opacity: 0.9; }
  60%, 100% { transform: scale(1.4); opacity: 0; }
}

.w-puddle {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 18px;
  background:
    radial-gradient(40px 8px at 18% 70%, rgba(180,200,220,0.5) 60%, transparent 65%),
    radial-gradient(60px 10px at 50% 80%, rgba(180,200,220,0.4) 60%, transparent 65%),
    radial-gradient(50px 8px at 80% 75%, rgba(180,200,220,0.5) 60%, transparent 65%);
}

/* ===== Thunder ===== */
.w-bolt {
  position: absolute;
  width: 26px; z-index: 4;
  opacity: 0;
}
.w-bolt-1 { top: 30%; left: 30%; animation: w-bolt-flash 5s linear infinite; }
.w-bolt-2 { top: 28%; right: 22%; animation: w-bolt-flash 5s linear infinite 2.5s; }
.w-bolt-3 { top: 46%; left: 56%; width: 16px; animation: w-bolt-flash 5s linear infinite; }

/* 雷云随闪电发光（与 w-bolt-flash / w-flash-bg 同 5s 时间轴，97%/99% 两次亮起） */
.w-cloud-thunder {
  animation:
    w-cloud-drift 28s ease-in-out infinite,
    w-cloud-glow 5s linear infinite;
}
@keyframes w-cloud-glow {
  0%, 96%, 98%, 100% { filter: drop-shadow(0 4px 0 rgba(255, 255, 255, 0.15)) brightness(1); }
  97% { filter: drop-shadow(0 0 18px rgba(255, 240, 150, 0.8)) brightness(1.6); }
  99% { filter: drop-shadow(0 0 14px rgba(255, 240, 150, 0.7)) brightness(1.45); }
}
.w-bolt svg { width: 100%; height: auto; filter: drop-shadow(0 0 8px #fff066); }
@keyframes w-bolt-flash {
  0%, 96%, 100% { opacity: 0; }
  97% { opacity: 1; }
  98% { opacity: 0; }
  99% { opacity: 1; }
}
.w-flash {
  position: absolute; inset: 0;
  background: rgba(255, 255, 220, 0);
  z-index: 1;
  pointer-events: none;
  animation: w-flash-bg 5s linear infinite;
}
@keyframes w-flash-bg {
  0%, 96%, 100% { background: rgba(255,255,220,0); }
  97% { background: rgba(255,255,220,0.4); }
  98% { background: rgba(255,255,220,0); }
  99% { background: rgba(255,255,220,0.3); }
}

/* ===== Snow ===== */
.w-snow-layer {
  position: absolute; inset: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}
.w-flake {
  position: absolute;
  top: -10%;
  color: #fff;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  animation: w-flake-fall linear infinite;
}
/* 之字摇摆下落：--sway 由模板按雪花奇偶交错正负 */
@keyframes w-flake-fall {
  0% { transform: translate(0, -20%) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  33% { transform: translate(var(--sway, 40px), 38vh) rotate(240deg); }
  66% { transform: translate(calc(var(--sway, 40px) * -0.6), 76vh) rotate(480deg); }
  100% { transform: translate(var(--sway, 40px), 120vh) rotate(720deg); opacity: 0.6; }
}
.w-snow-ground {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 16px;
  background:
    radial-gradient(60px 10px at 20% 60%, #fff 60%, transparent 65%),
    radial-gradient(80px 12px at 55% 70%, #fff 60%, transparent 65%),
    radial-gradient(70px 10px at 85% 65%, #fff 60%, transparent 65%);
}

/* ===== Haze ===== */
.w-fog {
  position: absolute;
  left: -10%; right: -10%;
  height: 80px;
  background: linear-gradient(90deg, transparent 0%, rgba(220,200,160,0.5) 30%, rgba(220,200,160,0.7) 50%, rgba(220,200,160,0.5) 70%, transparent 100%);
  filter: blur(6px);
  z-index: 2;
  animation: w-fog-drift 18s linear infinite;
}
.w-fog-1 { top: 20%; animation-duration: 22s; }
.w-fog-2 { top: 45%; animation-duration: 28s; animation-direction: reverse; opacity: 0.7; }
.w-fog-3 { top: 70%; animation-duration: 24s; opacity: 0.6; }
@keyframes w-fog-drift {
  0% { transform: translateX(-10%); }
  100% { transform: translateX(10%); }
}
.w-dust {
  position: absolute;
  width: 6px; height: 6px;
  background: rgba(120,100,70,0.3);
  border-radius: 50%;
  filter: blur(1px);
  animation: w-dust-float 5s linear infinite;
}
@keyframes w-dust-float {
  0% { transform: translate(0, 0); opacity: 0.5; }
  50% { transform: translate(10px, -8px); opacity: 0.8; }
  100% { transform: translate(0, 0); opacity: 0.5; }
}

/* ===== Wind ===== */
.w-leaf-fly {
  position: absolute;
  left: -8%;
  width: 28px; height: 22px;
  z-index: 3;
  animation: w-leaf-blow linear infinite;
}
@keyframes w-leaf-blow {
  0% { transform: translate(-30px, 0) rotate(0deg); }
  100% { transform: translate(120vw, -30px) rotate(720deg); }
}
.w-wind-line {
  position: absolute;
  left: -10%;
  width: 140px; height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%);
  border-radius: 2px;
  animation: w-wind-swoosh 1.6s linear infinite;
}
@keyframes w-wind-swoosh {
  0% { transform: translateX(-10%) scaleX(0.6); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(120vw) scaleX(1.2); opacity: 0; }
}

/* ===== Rainbow ===== */
.w-rainbow {
  position: absolute;
  left: 4%; right: 4%; bottom: -10%;
  width: 92%; height: 75%;
  z-index: 1;
  opacity: 0.85;
  animation: w-rainbow-glow 6s ease-in-out infinite;
}
@keyframes w-rainbow-glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* ===== Sakura ===== */
.w-petal {
  position: absolute;
  top: -8%;
  z-index: 3;
  animation: w-petal-fall linear infinite;
  transform: rotate(var(--rot));
}
@keyframes w-petal-fall {
  0% { transform: translate(0, -20%) rotate(var(--rot)); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate(40px, 50vh) rotate(calc(var(--rot) + 180deg)); }
  100% { transform: translate(-20px, 120vh) rotate(calc(var(--rot) + 540deg)); opacity: 0.6; }
}

/* ===== Night ===== */
.w-moon {
  position: absolute;
  top: 14%; right: 8%;
  width: 120px; height: 120px;
  background: radial-gradient(circle at 35% 35%, #fff8d4 0%, #f3e2a0 60%, #d8c280 100%);
  border-radius: 50%;
  box-shadow: 0 0 50px rgba(255,240,180,0.4);
  z-index: 2;
}
.w-moon-crater {
  position: absolute;
  background: rgba(180,160,100,0.4);
  border-radius: 50%;
}
.w-moon-crater-1 { top: 24px; left: 32px; width: 18px; height: 18px; }
.w-moon-crater-2 { top: 60px; left: 70px; width: 12px; height: 12px; }
.w-moon-crater-3 { top: 80px; left: 30px; width: 16px; height: 16px; }
.w-star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: w-twinkle 2s ease-in-out infinite;
  box-shadow: 0 0 4px rgba(255,255,255,0.8);
}
@keyframes w-twinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.4); }
}
/* 萤火虫：夜间低空游走的柔光点 */
.w-firefly {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #d9f28a;
  border-radius: 50%;
  box-shadow: 0 0 8px 2px rgba(217, 242, 138, 0.7);
  z-index: 3;
  animation: w-firefly-wander 7s ease-in-out infinite;
}
@keyframes w-firefly-wander {
  0%, 100% { transform: translate(0, 0); opacity: 0.15; }
  20% { opacity: 1; }
  35% { transform: translate(26px, -14px); opacity: 0.35; }
  55% { transform: translate(8px, -30px); opacity: 1; }
  75% { transform: translate(-16px, -12px); opacity: 0.3; }
}

.w-shoot {
  position: absolute;
  top: 18%; left: 30%;
  width: 80px; height: 2px;
  background: linear-gradient(90deg, transparent 0%, #fff 100%);
  border-radius: 2px;
  transform: rotate(-25deg);
  animation: w-shoot-go 6s ease-in infinite;
  opacity: 0;
}
@keyframes w-shoot-go {
  0%, 85%, 100% { opacity: 0; transform: rotate(-25deg) translate(0, 0); }
  87% { opacity: 1; }
  95% { opacity: 1; transform: rotate(-25deg) translate(220px, 100px); }
  96% { opacity: 0; }
}
</style>
