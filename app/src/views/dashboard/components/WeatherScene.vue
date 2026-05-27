<template>
  <div class="weather-scene" :class="'ws-mode-' + weather" :style="{ background: weatherBg }">
    <!-- Sunny -->
    <template v-if="weather === 'sunny'">
      <div class="w-sun w-sun-big"><div class="w-sun-rays" /></div>
      <div class="w-cloud w-cloud-sm" style="top:30%;left:20%">
        <svg viewBox="0 0 100 50"><ellipse cx="30" cy="28" rx="28" ry="16"/><ellipse cx="62" cy="22" rx="24" ry="16"/><ellipse cx="82" cy="32" rx="14" ry="10"/></svg>
      </div>
      <div v-for="i in 4" :key="'sp'+i" class="w-spark" :style="{ top: `${15+(i-1)*14}%`, left: `${12+(i-1)*20}%`, animationDelay: `${(i-1)*0.6}s` }" />
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
      <div v-if="weather === 'heavyRain'" class="w-puddle" />
    </template>

    <!-- Thunder -->
    <template v-else-if="weather === 'thunder'">
      <div class="w-cloud w-cloud-dark" style="top:6%;left:16%">
        <svg viewBox="0 0 160 70"><ellipse cx="40" cy="38" rx="38" ry="22"/><ellipse cx="86" cy="28" rx="36" ry="22"/><ellipse cx="130" cy="42" rx="24" ry="16"/></svg>
      </div>
      <div class="w-cloud w-cloud-dark" style="top:20%;right:6%;width:180px">
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
          :style="{ left: `${((i-1)*3.4)%100}%`, animationDelay: `-${((i-1)*0.4)%6}s`, animationDuration: `${5+((i-1)%5)}s`, width: `${6+((i-1)%4)*2}px`, height: `${6+((i-1)%4)*2}px` }">&#10052;</span>
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
      <span class="w-shoot" />
    </template>

    <!-- ==========================================================================
         动森微观天气生态场景 (DongSen Weather Ecosystem Layout) - HSL Wow Aesthetics
         ========================================================================== -->
    <svg class="dongsen-ecosystem-svg" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 樱花树粉嫩经典渐变 -->
        <linearGradient id="sakuraTreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fff0f5" />
          <stop offset="50%" stop-color="#ffb6c1" />
          <stop offset="100%" stop-color="#ff9ebb" />
        </linearGradient>
        
        <!-- 阔叶树茂盛绿渐变 -->
        <linearGradient id="appleTreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a8e6cf" />
          <stop offset="100%" stop-color="#56ab2f" />
        </linearGradient>

        <!-- 针叶松树渐变 (雪天) -->
        <linearGradient id="pineTreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e8f4f8" />
          <stop offset="40%" stop-color="#78a488" />
          <stop offset="100%" stop-color="#406b53" />
        </linearGradient>
      </defs>

      <!-- 1) 动森公共草地山丘 (随天气自动色调变换) -->
      <path class="ds-lawn" d="M-10 122 Q130 112, 260 124 T530 120 L530 145 L-10 145 Z" />

      <!-- 2) 动森经典小树 (左侧) -->
      <g class="ds-tree-group">
        <!-- 树干 -->
        <path class="ds-tree-trunk" d="M72 122 L74 85 L78 85 L80 122 Z" fill="#9e734c" stroke="#5a3d24" stroke-width="0.8" />
        
        <!-- 樱花树 (樱花天) -->
        <g v-if="weather === 'sakura'" class="ds-tree-leaves ds-tree-leaves-sakura">
          <circle cx="64" cy="74" r="16" fill="url(#sakuraTreeGrad)" stroke="#d6788a" stroke-width="1.2" />
          <circle cx="86" cy="78" r="14" fill="url(#sakuraTreeGrad)" stroke="#d6788a" stroke-width="1.2" />
          <circle cx="75" cy="62" r="15" fill="url(#sakuraTreeGrad)" stroke="#d6788a" stroke-width="1.2" />
        </g>
        
        <!-- 针叶落雪松树 (雪天) -->
        <g v-else-if="weather === 'snow'" class="ds-tree-leaves ds-tree-leaves-pine">
          <polygon points="76 42, 60 72, 92 72" fill="url(#pineTreeGrad)" stroke="#2b4c38" stroke-width="1.2" />
          <polygon points="76 60, 52 92, 100 92" fill="url(#pineTreeGrad)" stroke="#2b4c38" stroke-width="1.2" />
          <polygon points="76 78, 44 114, 108 114" fill="url(#pineTreeGrad)" stroke="#2b4c38" stroke-width="1.2" />
          <!-- 树顶积雪 -->
          <path d="M76 42 L66 60 Q76 56, 86 60 Z" fill="#ffffff" />
          <path d="M76 60 L62 82 Q76 78, 90 82 Z" fill="#ffffff" />
          <path d="M76 78 L56 102 Q76 98, 96 102 Z" fill="#ffffff" />
        </g>
        
        <!-- 普通阔叶树冠 (带红苹果) -->
        <g v-else class="ds-tree-leaves">
          <circle cx="64" cy="74" r="16" fill="url(#appleTreeGrad)" stroke="#3f721d" stroke-width="1.2" />
          <circle cx="86" cy="78" r="14" fill="url(#appleTreeGrad)" stroke="#3f721d" stroke-width="1.2" />
          <circle cx="75" cy="62" r="15" fill="url(#appleTreeGrad)" stroke="#3f721d" stroke-width="1.2" />
          <!-- 动森红苹果 -->
          <circle v-if="weather !== 'heavyRain' && weather !== 'thunder'" class="ds-apple ds-apple-1" cx="62" cy="75" r="4.2" fill="#eb4141" stroke="#a62222" stroke-width="0.8" />
          <circle v-if="weather !== 'heavyRain' && weather !== 'thunder'" class="ds-apple ds-apple-2" cx="84" cy="76" r="4.2" fill="#eb4141" stroke="#a62222" stroke-width="0.8" />
        </g>
      </g>

      <!-- 3) 散落在草丘上的五角星多色小野花 -->
      <g class="ds-wildflowers">
        <!-- 黄红野花 -->
        <circle cx="120" cy="126" r="1.5" fill="#ffd166" />
        <circle cx="117" cy="128" r="1.2" fill="#ef476f" />
        <circle cx="123" cy="128" r="1.2" fill="#ef476f" />
        
        <!-- 白青野花 -->
        <circle cx="280" cy="125" r="1.5" fill="#ffffff" />
        <circle cx="277" cy="127" r="1.2" fill="#06d6a0" />
        <circle cx="283" cy="127" r="1.2" fill="#06d6a0" />
      </g>

      <!-- ==========================================
           4) 动森小兔子 (Mascot) 专属动作形态组
           ========================================== -->
      
      <!-- 4.1) 晴天 (sunny)：平躺晒太阳睡觉，蝴蝶飞舞 -->
      <g v-if="weather === 'sunny'" class="ds-mascot-group mode-sunny">
        <!-- 飞舞小蝴蝶 -->
        <g class="ds-butterfly">
          <ellipse cx="232" cy="92" rx="2.5" ry="5" fill="#19c8b9" transform="rotate(-30 232 92)" />
          <ellipse cx="237" cy="92" rx="2.5" ry="5" fill="#19c8b9" transform="rotate(30 237 92)" />
          <circle cx="234.5" cy="94" r="1.2" fill="#ffd166" />
        </g>
        
        <!-- 小兔子侧躺在草地上 -->
        <g class="ds-bunny" transform="translate(196, 123) rotate(-90)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-3 -7 C-5 -13, -3.5 -14, -2 -7 Z" fill="#ffb6c1" />
          <path d="M3 -7 C5 -13, 3.5 -14, 2 -7 Z" fill="#ffb6c1" />
          <!-- 胖小脚 -->
          <rect x="-6" y="14" width="3" height="4.5" rx="1.5" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="3" y="14" width="3" height="4.5" rx="1.5" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与衣服 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="15" rx="5" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 6 L6.5 6 L5 14 L-5 14 Z" fill="#7cba70" />
          <line x1="-5.5" y1="9" x2="5.5" y2="9" stroke="#ffffff" stroke-width="1" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与睡眠眯眼 -->
          <circle cx="-4.5" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4.5" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <path d="M-3.5 -3.5 Q-2 -2 -0.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M0.5 -3.5 Q2 -2 3.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M-1 -0.5 Q0 0.5 1 -0.5" fill="none" stroke="#794f27" stroke-width="0.8" />
        </g>
      </g>

      <!-- 4.2) 多云/阴天 (partlyCloudy/cloudy)：树下乘凉，小鸟唱歌 -->
      <g v-else-if="weather === 'partlyCloudy' || weather === 'cloudy'" class="ds-mascot-group mode-cloudy">
        <!-- 树上歌唱的小鸟 -->
        <g class="ds-singing-bird">
          <path d="M84 54 C84 50, 92 50, 92 54 L94 58 L82 58 Z" fill="#ffd166" stroke="#5a3d24" stroke-width="0.8" />
          <polygon points="92 53, 96 52, 92 55" fill="#ff9f43" />
          <circle cx="87" cy="53" r="0.6" fill="#25292f" />
          <!-- 歌唱小音符 -->
          <path class="ds-music-note" d="M96 46 L98 42 L101 43 M98 42 L98 47" stroke="#ef476f" stroke-width="0.8" fill="none" />
        </g>

        <!-- 坐姿小兔子 (树干右侧) -->
        <g class="ds-bunny" transform="translate(102, 119)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 坐着的脚 -->
          <rect x="-9" y="10" width="5" height="3" rx="1.5" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="4" y="10" width="5" height="3" rx="1.5" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与衣服 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 4 L6.5 4 L5.5 11 L-5.5 11 Z" fill="#ffd166" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与舒爽表情 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <path d="M-3.5 -3.5 Q-2 -2 -0.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M0.5 -3.5 Q2 -2 3.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M-1 -0.5 Q0 0.5 1 -0.5" fill="none" stroke="#794f27" stroke-width="0.8" />
        </g>
      </g>

      <!-- 4.3) 雨天系列 (rain/heavyRain/thunder)：踩水坑，撑叶子雨伞 -->
      <g v-else-if="weather === 'rain' || weather === 'heavyRain' || weather === 'thunder'" class="ds-mascot-group mode-rain">
        <!-- 脚底涟漪扩散 -->
        <ellipse class="ds-ripple ds-ripple-1" cx="196" cy="124" rx="11" ry="2.2" fill="none" stroke="#c0e2f5" stroke-width="1.2" />
        <ellipse class="ds-ripple ds-ripple-2" cx="196" cy="124" rx="11" ry="2.2" fill="none" stroke="#c0e2f5" stroke-width="1.2" />

        <!-- 经典树叶大伞 -->
        <g class="ds-leaf-umbrella">
          <path d="M198 108 L212 90" stroke="#794f27" stroke-width="1.6" stroke-linecap="round" fill="none" />
          <path d="M198 90 C182 84, 202 66, 224 82 C214 93, 203 92, 198 90 Z" fill="#7cba70" stroke="#4a8a36" stroke-width="1" />
          <line x1="202" y1="88" x2="216" y2="78" stroke="#4a8a36" stroke-width="0.8" />
        </g>

        <!-- 站立踩水兔子 -->
        <g class="ds-bunny" transform="translate(196, 118)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 黄色雨靴 -->
          <rect x="-6.5" y="11" width="3.5" height="4.5" rx="1" fill="#f7cd67" stroke="#794f27" stroke-width="0.8" />
          <rect x="3" y="11" width="3.5" height="4.5" rx="1" fill="#f7cd67" stroke="#794f27" stroke-width="0.8" />
          <!-- 身体与小雨衣 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-7 4 L7 4 L6 12 L-6 12 Z" fill="#f7cd67" stroke="#d5a830" stroke-width="0.8" />
          <circle cx="0" cy="8" r="1" fill="#ffffff" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与快乐眯眯眼 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <path d="M-5.5 -3.5 L-2.5 -1.5 M-2.5 -3.5 L-5.5 -1.5" stroke="#794f27" stroke-width="1.2" stroke-linecap="round" />
          <path d="M2.5 -3.5 L5.5 -1.5 M5.5 -3.5 L2.5 -1.5" stroke="#794f27" stroke-width="1.2" stroke-linecap="round" />
          <path d="M-1 1.5 C-1.5 2.5, 1.5 2.5, 1 1.5" stroke="#794f27" stroke-width="1" stroke-linecap="round" fill="none" />
        </g>
      </g>

      <!-- 4.4) 下雪天 (snow)：堆雪人，吐出小冷气 -->
      <g v-else-if="weather === 'snow'" class="ds-mascot-group mode-snow">
        <!-- 动森胖雪人 -->
        <g class="ds-snowman">
          <circle cx="230" cy="116" r="8" fill="#ffffff" stroke="#5a5d64" stroke-width="1" />
          <circle cx="230" cy="103" r="5.6" fill="#ffffff" stroke="#5a5d64" stroke-width="1" />
          <circle cx="228" cy="102.5" r="0.7" fill="#25292f" />
          <circle cx="232" cy="102.5" r="0.7" fill="#25292f" />
          <polygon points="230 102, 235 103, 230 104" fill="#ff9f43" />
          <path d="M224.5 107.5 C224.5 107.5, 230 110.5, 235.5 107.5" stroke="#eb4141" stroke-width="2" stroke-linecap="round" fill="none" />
        </g>

        <!-- 呼出的白气粒子 -->
        <circle class="ds-breath ds-breath-1" cx="193" cy="113" r="1.5" fill="#ffffff" opacity="0.6" />
        <circle class="ds-breath ds-breath-2" cx="191" cy="111" r="2.2" fill="#ffffff" opacity="0.4" />

        <!-- 戴红色毛球毛线帽的兔子 -->
        <g class="ds-bunny" transform="translate(196, 118)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 站立短腿 -->
          <rect x="-5.5" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="3" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与红毛衣 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 4 L6.5 4 L5.5 11 L-5.5 11 Z" fill="#eb4141" stroke="#a62222" stroke-width="0.8" />
          <line x1="-5" y1="7.5" x2="5" y2="7.5" stroke="#ffffff" stroke-width="1" />
          <!-- 头部与红色毛线帽 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-7.5 -4.5 Q0 -10.5 7.5 -4.5" fill="#eb4141" stroke="#a62222" stroke-width="1" />
          <circle cx="0" cy="-9.5" r="1.8" fill="#ffffff" stroke="#a62222" stroke-width="0.5" />
          <!-- 腮红与冻眯眼 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <path d="M-5.5 -3.5 L-2.5 -1.5 M-2.5 -3.5 L-5.5 -1.5" stroke="#794f27" stroke-width="1.2" stroke-linecap="round" />
          <path d="M2.5 -3.5 L5.5 -1.5 M5.5 -3.5 L2.5 -1.5" stroke="#794f27" stroke-width="1.2" stroke-linecap="round" />
          <path d="M-1 1.5 C-1.5 2.5, 1.5 2.5, 1 1.5" stroke="#794f27" stroke-width="1" stroke-linecap="round" fill="none" />
        </g>
      </g>

      <!-- 4.5) 樱花季 (sakura)：手握捕虫网追樱花 -->
      <g v-else-if="weather === 'sakura'" class="ds-mascot-group mode-sakura">
        <!-- 经典的动森捕虫网 -->
        <g class="ds-sakura-net">
          <line x1="200" y1="110" x2="220" y2="88" stroke="#9e734c" stroke-width="1.3" stroke-linecap="round" />
          <circle cx="222" cy="86" r="5" fill="none" stroke="#9e734c" stroke-width="1" />
          <path d="M217 86 C217 96, 227 96, 227 86" fill="rgba(255,255,255,0.4)" stroke="#ffffff" stroke-width="0.8" />
        </g>

        <!-- 欢快站立小兔子 -->
        <g class="ds-bunny" transform="translate(196, 118)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <rect x="-5.5" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="3" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与粉色小裙子 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 4 L6.5 4 L5.5 11 L-5.5 11 Z" fill="#ffb6c1" stroke="#d6788a" stroke-width="0.8" />
          <circle cx="0" cy="7.5" r="1.2" fill="#ffffff" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与开心的表情 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="-2.5" cy="-3.5" r="0.8" fill="#25292f" />
          <circle cx="2.5" cy="-3.5" r="0.8" fill="#25292f" />
          <path d="M-1 -0.5 Q0 0.8 1 -0.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
        </g>
      </g>

      <!-- 4.6) 夜间 (night)：温馨露营营火，兔子篝火打盹 -->
      <g v-else-if="weather === 'night'" class="ds-mascot-group mode-night">
        <!-- 温暖的露营营火 (Bonfire) -->
        <g class="ds-bonfire">
          <!-- 燃烧柴火 -->
          <line x1="130" y1="124" x2="142" y2="124" stroke="#5a5d64" stroke-width="2" stroke-linecap="round" />
          <line x1="132" y1="127" x2="140" y2="121" stroke="#5a5d64" stroke-width="2" stroke-linecap="round" />
          <line x1="132" y1="121" x2="140" y2="127" stroke="#5a5d64" stroke-width="2" stroke-linecap="round" />
          <!-- 橙色篝火光晕 -->
          <ellipse cx="136" cy="122" rx="14" ry="4" fill="rgba(255,82,82,0.12)" />
          <!-- 双层跃动火焰 -->
          <path class="ds-flame ds-flame-outer" d="M130 120 C128 110, 134 102, 136 100 C138 102, 144 110, 142 120 Z" fill="#ff5252" />
          <path class="ds-flame ds-flame-inner" d="M133 121 C132 114, 135 109, 136 108 C137 109, 140 114, 139 121 Z" fill="#ffe066" />
        </g>

        <!-- 抱着手打盹的小兔子 -->
        <g class="ds-bunny" transform="translate(196, 118)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 短腿 -->
          <rect x="-5.5" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="3" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与条纹睡衣 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 4 L6.5 4 L5.5 11 L-5.5 11 Z" fill="#889df0" stroke="#5b6fb8" stroke-width="0.8" />
          <line x1="-5" y1="7.5" x2="5" y2="7.5" stroke="#ffffff" stroke-width="1" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与睡觉卧蚕 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <path d="M-3.5 -3.5 Q-2 -2 -0.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M0.5 -3.5 Q2 -2 3.5 -3.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
          <path d="M-0.8 -0.2 C-0.5 0.5, 0.5 0.5, 0.8 -0.2" fill="none" stroke="#794f27" stroke-width="0.8" stroke-linecap="round" />
        </g>
      </g>

      <!-- 4.7) 兜底模式 (wind, haze 等)：常规站立小兔子 -->
      <g v-else class="ds-mascot-group mode-default">
        <g class="ds-bunny" transform="translate(196, 118)">
          <!-- 耳朵 -->
          <path class="ds-ear-l" d="M-3.5 -6.5 C-6 -14, -3.5 -16, -1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path class="ds-ear-r" d="M3.5 -6.5 C6 -14, 3.5 -16, 1.5 -6.5 Z" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <rect x="-5.5" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <rect x="3" y="10.5" width="2.5" height="4" rx="1.2" fill="#ffffff" stroke="#794f27" stroke-width="1" />
          <!-- 身体与小衣服 -->
          <rect class="ds-bunny-body" x="-7" y="0" width="14" height="12" rx="4" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <path d="M-6.5 4 L6.5 4 L5.5 11 L-5.5 11 Z" fill="#7cba70" />
          <!-- 头部 -->
          <circle class="ds-bunny-head" cx="0" cy="-2.5" r="7.2" fill="#ffffff" stroke="#794f27" stroke-width="1.2" />
          <!-- 腮红与大眼睛 -->
          <circle cx="-4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="4" cy="-1.5" r="1.5" fill="#ffb6c1" opacity="0.8" />
          <circle cx="-2.5" cy="-3.5" r="0.8" fill="#25292f" />
          <circle cx="2.5" cy="-3.5" r="0.8" fill="#25292f" />
          <path d="M-1 -0.5 Q0 0.8 1 -0.5" fill="none" stroke="#794f27" stroke-width="1" stroke-linecap="round" />
        </g>
      </g>
    </svg>
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
@keyframes w-flake-fall {
  0% { transform: translate(0, -20%) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate(40px, 120vh) rotate(720deg); opacity: 0.6; }
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

/* ==========================================
   动森风格微生态场景 CSS (DongSen Ecosystem)
   ========================================== */
.dongsen-ecosystem-svg {
  position: absolute;
  left: 0;
  bottom: -4px; /* 稍微贴地 */
  width: 100%;
  height: 110px;
  z-index: 10;
  pointer-events: none;
  overflow: visible;
}

/* 1) 动森经典草丘色调 (随天气自动平滑过渡) */
.ds-lawn {
  transition: fill 0.6s ease, stroke 0.6s ease;
}
.ws-mode-sunny .ds-lawn { fill: #9ad47b; stroke: #4f852f; }
.ws-mode-partlyCloudy .ds-lawn { fill: #a2db85; stroke: #5b923a; }
.ws-mode-cloudy .ds-lawn { fill: #8cc49a; stroke: #4e855c; }
.ws-mode-rain .ds-lawn, .ws-mode-heavyRain .ds-lawn { fill: #5ea176; stroke: #315c41; }
.ws-mode-thunder .ds-lawn { fill: #48825c; stroke: #264a32; }
.ws-mode-snow .ds-lawn { fill: #e8f4f8; stroke: #a3bdcc; }
.ws-mode-haze .ds-lawn { fill: #b8a582; stroke: #7b6d50; }
.ws-mode-wind .ds-lawn { fill: #b3df86; stroke: #62963d; }
.ws-mode-rainbow .ds-lawn { fill: #a2df91; stroke: #529456; }
.ws-mode-sakura .ds-lawn { fill: #ffb9cb; stroke: #cf6680; }
.ws-mode-night .ds-lawn { fill: #2d4538; stroke: #122118; }

/* 2) 树木左右可爱的自然摇曳 (Tree Sway) */
.ds-tree-group {
  transform-origin: 76px 122px;
  animation: dsTreeSway 6s ease-in-out infinite;
}
/* 大风/雷雨/暴雨天气下摇曳更剧烈 */
.ws-mode-wind .ds-tree-group {
  animation: dsTreeSwayWindy 2.5s ease-in-out infinite;
}
.ws-mode-heavyRain .ds-tree-group,
.ws-mode-thunder .ds-tree-group {
  animation: dsTreeSwayWindy 3.5s ease-in-out infinite;
}

@keyframes dsTreeSway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1.5deg); }
}
@keyframes dsTreeSwayWindy {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(4.5deg); }
}

/* 3) 树上的红苹果微幅晃动 (Apple Swing) */
.ds-apple-1 {
  transform-origin: 62px 75px;
  animation: dsAppleSwing 3.5s ease-in-out infinite;
}
.ds-apple-2 {
  transform-origin: 84px 76px;
  animation: dsAppleSwing 3.5s ease-in-out infinite 0.8s;
}

@keyframes dsAppleSwing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-7deg); }
}

/* 4) 晴天专属飞舞小蝴蝶 (Butterfly Fly & Flap) */
.ds-butterfly {
  animation: dsButterflyFloat 5s ease-in-out infinite;
}
.ds-butterfly ellipse:nth-child(1) {
  transform-origin: 234.5px 94px;
  animation: dsWingFlapL 0.22s linear infinite;
}
.ds-butterfly ellipse:nth-child(2) {
  transform-origin: 234.5px 94px;
  animation: dsWingFlapR 0.22s linear infinite;
}

@keyframes dsButterflyFloat {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(3px, -5px) rotate(5deg); }
  50% { transform: translate(7px, -1px) rotate(-3deg); }
  75% { transform: translate(2px, 3px) rotate(4deg); }
}
@keyframes dsWingFlapL {
  0%, 100% { transform: rotate(-30deg) scaleX(1); }
  50% { transform: rotate(-12deg) scaleX(0.18); }
}
@keyframes dsWingFlapR {
  0%, 100% { transform: rotate(30deg) scaleX(1); }
  50% { transform: rotate(12deg) scaleX(0.18); }
}

/* 5) 小鸟高频唱歌 (Singing Bird & Notes) */
.ds-singing-bird {
  transform-origin: 88px 58px;
  animation: dsBirdSing 1.4s ease-in-out infinite;
}
.ds-music-note {
  transform-origin: 98px 42px;
  animation: dsMusicNote 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes dsBirdSing {
  0%, 100% { transform: scale(1); }
  50% { transform: scaleY(1.08) translateY(-0.6px); }
}
@keyframes dsMusicNote {
  0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translate(7px, -14px) scale(1.1); opacity: 0; }
}

/* 6) 雨天踩水波涟漪 (Rain Ripples) */
.ds-ripple-1 {
  transform-origin: 196px 124px;
  animation: dsRippleSpread 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}
.ds-ripple-2 {
  transform-origin: 196px 124px;
  animation: dsRippleSpread 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.1s;
}

@keyframes dsRippleSpread {
  0% { transform: scale(0.4); opacity: 1; stroke-width: 1.5px; }
  100% { transform: scale(1.5); opacity: 0; stroke-width: 0.5px; }
}

/* 7) 树叶雨伞在风里摇曳 (Umbrella Swing) */
.ds-leaf-umbrella {
  transform-origin: 198px 108px;
  animation: dsUmbrellaSwing 4.5s ease-in-out infinite;
}

@keyframes dsUmbrellaSwing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-5deg); }
}

/* 8) 雪天呼出冷气粒子 (Breath Particles) */
.ds-breath-1 {
  transform-origin: 193px 113px;
  animation: dsBreathFloat1 3.2s ease-in-out infinite;
}
.ds-breath-2 {
  transform-origin: 191px 111px;
  animation: dsBreathFloat2 3.2s ease-in-out infinite 1.6s;
}

@keyframes dsBreathFloat1 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  15% { opacity: 0.65; }
  100% { transform: translate(-9px, -6px) scale(1.35); opacity: 0; }
}
@keyframes dsBreathFloat2 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  15% { opacity: 0.45; }
  100% { transform: translate(-13px, -9px) scale(1.45); opacity: 0; }
}

/* 9) 冻抖小雪人 (Snowman Shivering) */
.ds-snowman {
  transform-origin: 230px 124px;
  animation: dsSnowmanShave 6s ease-in-out infinite;
}

@keyframes dsSnowmanShave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1deg); }
}

/* 10) 捕虫网轻轻上下挥舞 (Net Swing) */
.ds-sakura-net {
  transform-origin: 200px 110px;
  animation: dsNetSwing 3s ease-in-out infinite;
}

@keyframes dsNetSwing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-9deg); }
}

/* 11) 夜间露营营火双层火焰高频跳动 (Bonfire) */
.ds-flame-outer {
  transform-origin: 136px 120px;
  animation: dsFlameOuter 0.55s ease-in-out infinite;
}
.ds-flame-inner {
  transform-origin: 136px 120px;
  animation: dsFlameInner 0.4s ease-in-out infinite;
}

@keyframes dsFlameOuter {
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
  25% { transform: scaleY(1.18) scaleX(0.9); opacity: 1; }
  50% { transform: scaleY(0.88) scaleX(1.1); opacity: 0.9; }
  75% { transform: scaleY(1.12) scaleX(0.95); opacity: 1; }
}
@keyframes dsFlameInner {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  30% { transform: scaleY(0.82) scaleX(1.12); }
  60% { transform: scaleY(1.22) scaleX(0.88); }
}

/* 12) 小兔子精细灵性呼吸与耳朵微动 (Bunny Breath & Ear Swing) */
.ds-bunny-head {
  animation: dsBunnyHeadBreath 3s ease-in-out infinite;
}
.ds-ear-l {
  transform-origin: -2.5px -6.5px;
  animation: dsEarSwingL 3s ease-in-out infinite;
}
.ds-ear-r {
  transform-origin: 2.5px -6.5px;
  animation: dsEarSwingR 3s ease-in-out infinite;
}

@keyframes dsBunnyHeadBreath {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.6px); }
}
@keyframes dsEarSwingL {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(-3.5deg) translateY(-0.6px); }
}
@keyframes dsEarSwingR {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(3.5deg) translateY(-0.6px); }
}
</style>
