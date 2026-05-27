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
         动森风格微观天气生态场景 (DongSen Weather Ecosystem Layout) - HSL Wow Aesthetics
         ========================================================================== -->
    <svg class="dongsen-ecosystem-svg" viewBox="0 0 800 140" xmlns="http://www.w3.org/2000/svg">
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

        <!-- 背景树冠层墨绿渐变 -->
        <linearGradient id="canopyBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#8BB794" />
          <stop offset="60%" stop-color="#497255" />
          <stop offset="100%" stop-color="#314B3A" />
        </linearGradient>

        <!-- 前景树叶团亮翠绿渐变 -->
        <linearGradient id="canopyFgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#B8DCB7" />
          <stop offset="100%" stop-color="#6F9D74" />
        </linearGradient>

        <!-- 树干立体褐色渐变 -->
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#7C5D47" />
          <stop offset="35%" stop-color="#9C775D" />
          <stop offset="70%" stop-color="#85644C" />
          <stop offset="100%" stop-color="#624836" />
        </linearGradient>

        <!-- 发光大叶片特写渐变 -->
        <linearGradient id="leafGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFE1" />
          <stop offset="50%" stop-color="#D9F2D7" />
          <stop offset="100%" stop-color="#A5CFA7" />
        </linearGradient>

        <!-- 依偎兔子温暖奶油渐变 -->
        <linearGradient id="bunnyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#FFEEDC" />
        </linearGradient>
      </defs>

      <!-- 1) 动森公共草地山丘 (水平平滑拉伸且自适应) -->
      <path class="ds-lawn" d="M-20 126 Q400 115, 820 126 L820 145 L-20 145 Z" />

      <!-- 2) 散落在草丘上的多色小野花 -->
      <g class="ds-wildflowers">
        <!-- 左侧小碎花 -->
        <circle cx="280" cy="130" r="1.8" fill="#ffffff" />
        <circle cx="277.5" cy="132" r="1.2" fill="#ffd166" />
        <circle cx="282.5" cy="132" r="1.2" fill="#ffd166" />
        
        <!-- 右侧小碎花 -->
        <circle cx="520" cy="129" r="1.8" fill="#ffffff" />
        <circle cx="517.5" cy="131" r="1.2" fill="#ef476f" />
        <circle cx="522.5" cy="131" r="1.2" fill="#ef476f" />
      </g>

      <!-- 3) 阳光洒下星光粒子 (晴朗/暖色天气下极具灵性地飘落) -->
      <g v-if="weather === 'sunny' || weather === 'partlyCloudy' || weather === 'rainbow' || weather === 'sakura'" class="ds-sparkle-layer">
        <circle class="illustration-sparkle" cx="320" cy="60" r="1.2" fill="#FFFECB" style="animation-delay: 0s; animation-duration: 5s;" />
        <circle class="illustration-sparkle" cx="480" cy="50" r="1.2" fill="#FFFECB" style="animation-delay: 1.5s; animation-duration: 4.5s;" />
        <circle class="illustration-sparkle" cx="260" cy="80" r="1.5" fill="#FFFFFF" style="animation-delay: 0.8s; animation-duration: 6s;" />
        <circle class="illustration-sparkle" cx="540" cy="75" r="1.5" fill="#FFFFFF" style="animation-delay: 2.2s; animation-duration: 5.2s;" />
      </g>

      <!-- 4) 大树冠背景 (叠在树干后方) -->
      <path class="ds-tree-canopy-bg" d="M 400 20 
               A 32 32 0 0 1 445 35
               A 30 30 0 0 1 465 70
               A 28 28 0 0 1 450 110
               A 24 24 0 0 1 412 122
               A 24 24 0 0 1 388 122
               A 28 28 0 0 1 350 110
               A 30 30 0 0 1 335 70
               A 32 32 0 0 1 355 35
               Z" fill="url(#canopyBgGrad)" stroke="#273C2F" stroke-width="1.6" stroke-linejoin="round" />

      <!-- 5) 繁茂的树干骨骼 (手绘风大树干) -->
      <g class="ds-tree-group">
        <!-- 树干阴影 -->
        <path d="M 383 127 Q 395 116 397 96 Q 373 81 356 66 Q 348 59 351 54 Q 356 54 361 61 Q 377 76 399 89 L 399 69 Q 391 61 394 53 Q 397 49 401 53 Q 405 49 408 53 Q 411 61 403 69 L 403 89 Q 425 76 441 61 Q 446 54 451 54 Q 454 59 446 66 Q 429 81 405 96 Q 407 116 419 127 Z" fill="none" stroke="#2B1A0E" stroke-width="3.5" opacity="0.1" />
        <!-- 树干主体 -->
        <path d="M 382 126 
                 Q 394 115 396 95 
                 Q 372 80 355 65
                 Q 347 58 350 53
                 Q 355 53 360 60
                 Q 376 75 398 88
                 L 398 68
                 Q 390 60 393 52
                 Q 396 48 400 52
                 Q 404 48 407 52
                 Q 410 60 402 68
                 L 402 88
                 Q 424 75 440 60
                 Q 445 53 450 53
                 Q 453 58 445 65
                 Q 428 80 404 95
                 Q 406 115 418 126
                 Z" fill="url(#trunkGrad)" stroke="#422E1F" stroke-width="1.5" stroke-linejoin="round" />
        <!-- 树干木纹 -->
        <path d="M 390 120 Q 397 110 398 100 M 410 120 Q 406 111 404 102" stroke="#4C3423" stroke-width="0.8" fill="none" opacity="0.5" />
      </g>

      <!-- 6) 前景蓬松的翠绿叶丛 (叠在树干枝桠上方) -->
      <g class="ds-tree-leaves-front">
        <!-- 左侧叶丛 -->
        <ellipse cx="355" cy="62" rx="20" ry="16" fill="url(#canopyFgGrad)" stroke="#38543B" stroke-width="1.2" opacity="0.96" />
        <circle cx="342" cy="70" r="10" fill="url(#canopyFgGrad)" stroke="#38543B" stroke-width="1.2" opacity="0.96" />
        <!-- 右侧叶丛 -->
        <ellipse cx="445" cy="62" rx="20" ry="16" fill="url(#canopyFgGrad)" stroke="#38543B" stroke-width="1.2" opacity="0.96" />
        <circle cx="458" cy="70" r="10" fill="url(#canopyFgGrad)" stroke="#38543B" stroke-width="1.2" opacity="0.96" />
        <!-- 顶部中心叶丛 -->
        <ellipse cx="400" cy="42" rx="24" ry="18" fill="url(#canopyFgGrad)" stroke="#38543B" stroke-width="1.2" opacity="0.96" />
      </g>

      <!-- 7) 散落在树冠各处的特写“发光大叶片” (带明灭微光动效) -->
      <g class="ds-glow-leaves-group">
        <!-- 顶部左侧大叶 -->
        <g class="ds-glow-leaf ds-glow-leaf-1" transform="translate(368, 55) rotate(-35)">
          <path d="M 0 0 C -4 -7, -4 -12, 0 -17 C 4 -12, 4 -7, 0 0" fill="url(#leafGlowGrad)" stroke="#324B38" stroke-width="0.8" />
          <path d="M 0 0 L 0 -15" stroke="#FFF" stroke-width="0.5" opacity="0.7" />
        </g>
        <!-- 顶部右侧大叶 -->
        <g class="ds-glow-leaf ds-glow-leaf-2" transform="translate(432, 53) rotate(35)">
          <path d="M 0 0 C -4 -7, -4 -12, 0 -17 C 4 -12, 4 -7, 0 0" fill="url(#leafGlowGrad)" stroke="#324B38" stroke-width="0.8" />
          <path d="M 0 0 L 0 -15" stroke="#FFF" stroke-width="0.5" opacity="0.7" />
        </g>
        <!-- 顶部正中央大叶 -->
        <g class="ds-glow-leaf ds-glow-leaf-3" transform="translate(400, 32) rotate(0)">
          <path d="M 0 0 C -4.5 -7.5, -4.5 -13, 0 -18 C 4.5 -13, 4.5 -7.5, 0 0" fill="url(#leafGlowGrad)" stroke="#324B38" stroke-width="0.8" />
          <path d="M 0 0 L 0 -16" stroke="#FFF" stroke-width="0.5" opacity="0.7" />
        </g>
        <!-- 左侧悬挂大叶 -->
        <g class="ds-glow-leaf ds-glow-leaf-2" transform="translate(338, 72) rotate(-85)">
          <path d="M 0 0 C -3.5 -6.5, -3.5 -11, 0 -15 C 3.5 -11, 3.5 -6.5, 0 0" fill="url(#leafGlowGrad)" stroke="#324B38" stroke-width="0.8" />
          <path d="M 0 0 L 0 -13" stroke="#FFF" stroke-width="0.5" opacity="0.6" />
        </g>
        <!-- 右侧悬挂大叶 -->
        <g class="ds-glow-leaf ds-glow-leaf-1" transform="translate(462, 75) rotate(75)">
          <path d="M 0 0 C -3.5 -6.5, -3.5 -11, 0 -15 C 3.5 -11, 3.5 -6.5, 0 0" fill="url(#leafGlowGrad)" stroke="#324B38" stroke-width="0.8" />
          <path d="M 0 0 L 0 -13" stroke="#FFF" stroke-width="0.5" opacity="0.6" />
        </g>
      </g>

      <!-- 8) 树上歌唱的小鸟 (多云/阴天专属) -->
      <g v-if="weather === 'partlyCloudy' || weather === 'cloudy'" class="ds-singing-bird" transform="translate(325, 62)">
        <path d="M0 0 C0 -3.5, 6 -3.5, 6 0 L7.5 3 L-1.5 3 Z" fill="#ffd166" stroke="#5a3d24" stroke-width="0.6" />
        <polygon points="6 -0.5, 9 -1, 6 1" fill="#ff9f43" />
        <circle cx="2.5" cy="-0.5" r="0.4" fill="#25292f" />
        <!-- 歌唱小音符 -->
        <path class="ds-music-note" d="M9 -6 L11 -9 L13 -8 M11 -9 L11 -5" stroke="#ef476f" stroke-width="0.6" fill="none" />
      </g>

      <!-- 9) 温暖露营营火 (夜间专属) -->
      <g v-if="weather === 'night'" class="ds-bonfire" transform="translate(310, 114)">
        <!-- 燃烧柴火 -->
        <line x1="0" y1="10" x2="10" y2="10" stroke="#5a5d64" stroke-width="1.5" stroke-linecap="round" />
        <line x1="2" y1="12" x2="8" y2="8" stroke="#5a5d64" stroke-width="1.5" stroke-linecap="round" />
        <line x1="2" y1="8" x2="8" y2="12" stroke="#5a5d64" stroke-width="1.5" stroke-linecap="round" />
        <!-- 营火火焰 -->
        <path class="ds-flame ds-flame-outer" d="M0 8 C-1 0, 3 -6, 5 -8 C7 -6, 11 0, 10 8 Z" fill="#ff5252" />
        <path class="ds-flame ds-flame-inner" d="M2.5 8.5 C1.5 3.5, 4 0.5, 5 -0.5 C6 0.5, 8.5 3.5, 7.5 8.5 Z" fill="#ffe066" />
      </g>

      <!-- 10) 胖乎乎可爱小雪人 (下雪专属) -->
      <g v-if="weather === 'snow'" class="ds-snowman" transform="translate(450, 114)">
        <circle cx="0" cy="8" r="5" fill="#ffffff" stroke="#5a5d64" stroke-width="0.8" />
        <circle cx="0" cy="0" r="3.5" fill="#ffffff" stroke="#5a5d64" stroke-width="0.8" />
        <circle cx="-1" cy="-0.5" r="0.5" fill="#25292f" />
        <circle cx="1" cy="-0.5" r="0.5" fill="#25292f" />
        <polygon points="0 -1, 3 -0.5, 0 0" fill="#ff9f43" />
        <path d="M-3.5 3 Q0 5 3.5 3" stroke="#eb4141" stroke-width="1.3" stroke-linecap="round" fill="none" />
      </g>

      <!-- 11) 捕樱花蝴蝶 (晴天专属) -->
      <g v-if="weather === 'sunny'" class="ds-butterfly" transform="translate(440, 80)">
        <ellipse cx="0" cy="0" rx="1.8" ry="3.5" fill="#19c8b9" transform="rotate(-30 0 0)" />
        <ellipse cx="3.5" cy="0" rx="1.8" ry="3.5" fill="#19c8b9" transform="rotate(30 3.5 0)" />
        <circle cx="1.7" cy="1.5" r="0.8" fill="#ffd166" />
      </g>

      <!-- 12) 脚底涟漪扩散 (雨天踩水专属) -->
      <g v-if="weather === 'rain' || weather === 'heavyRain' || weather === 'thunder'">
        <ellipse class="ds-ripple ds-ripple-1" cx="422" cy="123" rx="7" ry="1.5" fill="none" stroke="#c0e2f5" stroke-width="0.8" />
        <ellipse class="ds-ripple ds-ripple-2" cx="422" cy="123" rx="7" ry="1.5" fill="none" stroke="#c0e2f5" stroke-width="0.8" />
      </g>

      <!-- 13) 依偎兔子的雨伞 (雨天专属) -->
      <g v-if="weather === 'rain' || weather === 'heavyRain' || weather === 'thunder'" class="ds-leaf-umbrella">
        <path d="M 408 108 L 416 98" stroke="#794f27" stroke-width="1" stroke-linecap="round" fill="none" />
        <path d="M 408 98 C 398 94, 410 82, 424 90 C 418 97, 411 96, 408 98 Z" fill="#7cba70" stroke="#4a8a36" stroke-width="0.8" />
      </g>

      <!-- 14) 依偎兔子的捕虫网 (樱花季专属) -->
      <g v-if="weather === 'sakura'" class="ds-sakura-net">
        <line x1="416" y1="112" x2="430" y2="99" stroke="#9e734c" stroke-width="0.8" stroke-linecap="round" />
        <circle cx="431" cy="98" r="2.6" fill="none" stroke="#9e734c" stroke-width="0.6" />
        <path d="M428.5 98 C428.5 104, 433.5 104, 433.5 98" fill="rgba(255,255,255,0.35)" stroke="#ffffff" stroke-width="0.5" />
      </g>

      <!-- 15) 呼出冷气粒子 (雪天哈气专属) -->
      <g v-if="weather === 'snow'">
        <circle class="ds-breath ds-breath-1" cx="411" cy="102" r="0.9" fill="#ffffff" opacity="0.6" />
        <circle class="ds-breath ds-breath-2" cx="409" cy="100.5" r="1.3" fill="#ffffff" opacity="0.4" />
      </g>

      <!-- 16) 紧紧依偎在大树右侧的小兔子 (Illustration Bunny) -->
      <g class="ds-bunny-wrapper">
        <!-- 兔子主体动作组 -->
        <g class="ds-bunny">
          <!-- 胖胖小圆尾巴 (处于身体右后方，先绘制) -->
          <circle cx="433" cy="116" r="3.2" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" />

          <!-- 椭圆短粗胖下肢 -->
          <rect x="421" y="121" width="7" height="4.5" rx="2" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" />

          <!-- 敦实圆滚身体 -->
          <ellipse cx="422" cy="115" rx="8" ry="9.5" :fill="weather === 'sakura' ? '#ffb6c1' : weather === 'night' ? '#889df0' : 'url(#bunnyGrad)'" stroke="#4A3423" stroke-width="1.2" />
          
          <!-- 雨天专属：套上嫩黄色雨衣披肩 -->
          <path v-if="weather === 'rain' || weather === 'heavyRain' || weather === 'thunder'" d="M 414 110 L 430 110 Q 431 116 422 120 Z" fill="#f7cd67" stroke="#4A3423" stroke-width="0.8" />
          <circle v-if="weather === 'rain' || weather === 'heavyRain' || weather === 'thunder'" cx="422" cy="114" r="0.6" fill="#fff" />

          <!-- 两只抱树的小胖手 (穿过身体叠在树干右边缘) -->
          <path d="M 416 110 Q 407 110 407 113 Q 407 116 416 115" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 417 115 Q 408 116 408 119 Q 408 122 417 121" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />

          <!-- 软萌长耳朵 -->
          <g class="bunny-ear-l">
            <path d="M 413.5 94.5 Q 408 81 416 81 Q 418.5 86.5 418.5 94.5 Z" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" stroke-linejoin="round" />
            <path d="M 414 92.5 Q 410 84.5 415.5 84.5 Q 417 88.5 417 92.5 Z" fill="#FFA5B5" opacity="0.8" />
          </g>
          <g class="bunny-ear-r">
            <path d="M 420 95 Q 424.5 81.5 430 82.5 Q 428.5 88 424 95 Z" fill="#FFF4E6" stroke="#4A3423" stroke-width="1.2" stroke-linejoin="round" />
            <path d="M 421.5 93 Q 424.5 84.5 428 85 Q 427.5 89 424.5 93 Z" fill="#FFA5B5" opacity="0.8" />
          </g>

          <!-- 雪天专属：头上戴红色毛线帽 -->
          <path v-if="weather === 'snow'" d="M 413.5 95.5 Q 418 91 422.5 95.5" fill="#eb4141" stroke="#a62222" stroke-width="0.8" />
          <circle v-if="weather === 'snow'" cx="418" cy="90.5" r="1.5" fill="#ffffff" stroke="#a62222" stroke-width="0.4" />

          <!-- 胖胖小圆脸 -->
          <circle class="ds-bunny-head" cx="418" cy="100.5" r="8" fill="url(#bunnyGrad)" stroke="#4A3423" stroke-width="1.2" />

          <!-- 依偎闭眼、腮红与超萌嘴巴 -->
          <!-- 闭目睡觉眯眼 (夜间/晴天) -->
          <path v-if="weather === 'night' || weather === 'sunny'" d="M 410.5 100 Q 412.5 101.5 414.5 100" fill="none" stroke="#4A3423" stroke-width="1" stroke-linecap="round" />
          <path v-if="weather === 'night' || weather === 'sunny'" d="M 418 100.5 Q 420 102 422 100.5" fill="none" stroke="#4A3423" stroke-width="1" stroke-linecap="round" />
          
          <!-- 常规亮眼睛 -->
          <circle v-else cx="411" cy="99" r="0.7" fill="#25292f" />
          <circle v-if="weather !== 'rain' && weather !== 'heavyRain' && weather !== 'thunder' && weather !== 'snow' && weather !== 'night' && weather !== 'sunny'" cx="416.5" cy="99.5" r="0.7" fill="#25292f" />

          <!-- 害羞粉嫩腮红 -->
          <ellipse cx="409" cy="102" rx="2" ry="1.2" fill="#FFA5B5" opacity="0.85" />
          <ellipse cx="417.5" cy="102.5" rx="2" ry="1.2" fill="#FFA5B5" opacity="0.85" />
          <!-- 满意的微笑小嘴巴 -->
          <path d="M 413.5 102 Q 414.5 103 415.5 102" fill="none" stroke="#4A3423" stroke-width="0.8" stroke-linecap="round" />
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
  height: 100%;
  z-index: 10;
  pointer-events: none;
  overflow: visible;
  /* 左右两侧极其丝滑平缓的渐变羽化消融，实现无缝自然过渡 */
  mask-image: linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%);
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

/* 2) 树木以 400px 126px 根部为中心左右晃动 (Tree Sway) */
.ds-tree-group {
  transform-origin: 400px 126px;
  animation: dsTreeSway 6.5s ease-in-out infinite;
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
  50% { transform: rotate(1.2deg); }
}
@keyframes dsTreeSwayWindy {
  0%, 100% { transform: rotate(-1.5deg); }
  50% { transform: rotate(4.2deg); }
}

/* 3) 特写发光大叶片的明灭微光呼吸 (leafGlow) */
.ds-glow-leaf-1 {
  transform-origin: 368px 55px;
  animation: dsLeafGlow 4s ease-in-out infinite alternate;
}
.ds-glow-leaf-2 {
  transform-origin: 432px 53px;
  animation: dsLeafGlow 4s ease-in-out infinite alternate 1.2s;
}
.ds-glow-leaf-3 {
  transform-origin: 400px 32px;
  animation: dsLeafGlow 4s ease-in-out infinite alternate 2.4s;
}

@keyframes dsLeafGlow {
  0% { opacity: 0.75; filter: drop-shadow(0 0 1px #FFF); }
  100% { opacity: 1.0; filter: drop-shadow(0 0 5px #FFFF99); }
}

/* 4) 暖洋星光粒子在大树两侧唯美飘落 (sparkleRain) */
.illustration-sparkle {
  animation: sparkleRain 5.5s linear infinite;
}
@keyframes sparkleRain {
  0% { transform: translateY(-20px) scale(0.4); opacity: 0; }
  20% { opacity: 0.85; }
  80% { opacity: 0.85; }
  100% { transform: translateY(70px) scale(1.1); opacity: 0; }
}

/* 5) 晴天专属小蝴蝶的漂浮飞舞与高频振翼 */
.ds-butterfly {
  animation: dsButterflyFloat 5s ease-in-out infinite;
}
.ds-butterfly ellipse:nth-child(1) {
  transform-origin: 441.7px 81.5px;
  animation: dsWingFlapL 0.22s linear infinite;
}
.ds-butterfly ellipse:nth-child(2) {
  transform-origin: 441.7px 81.5px;
  animation: dsWingFlapR 0.22s linear infinite;
}

@keyframes dsButterflyFloat {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(3px, -5px) rotate(4deg); }
  50% { transform: translate(6px, -1px) rotate(-3deg); }
  75% { transform: translate(2px, 3px) rotate(3deg); }
}
@keyframes dsWingFlapL {
  0%, 100% { transform: rotate(-30deg) scaleX(1); }
  50% { transform: rotate(-12deg) scaleX(0.2); }
}
@keyframes dsWingFlapR {
  0%, 100% { transform: rotate(30deg) scaleX(1); }
  50% { transform: rotate(12deg) scaleX(0.2); }
}

/* 6) 小鸟高频唱歌 (Singing Bird & Notes) */
.ds-singing-bird {
  transform-origin: 325px 65px;
  animation: dsBirdSing 1.4s ease-in-out infinite;
}
.ds-music-note {
  transform-origin: 334px 56px;
  animation: dsMusicNote 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes dsBirdSing {
  0%, 100% { transform: scale(1); }
  50% { transform: scaleY(1.08) translateY(-0.5px); }
}
@keyframes dsMusicNote {
  0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translate(6px, -12px) scale(1.1); opacity: 0; }
}

/* 7) 雨天踩水波涟漪 (Rain Ripples) */
.ds-ripple-1 {
  transform-origin: 422px 123px;
  animation: dsRippleSpread 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}
.ds-ripple-2 {
  transform-origin: 422px 123px;
  animation: dsRippleSpread 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.1s;
}

@keyframes dsRippleSpread {
  0% { transform: scale(0.4); opacity: 1; stroke-width: 1.2px; }
  100% { transform: scale(1.5); opacity: 0; stroke-width: 0.4px; }
}

/* 8) 树叶雨伞在风里摇曳 (Umbrella Swing) */
.ds-leaf-umbrella {
  transform-origin: 416px 98px;
  animation: dsUmbrellaSwing 4.5s ease-in-out infinite;
}

@keyframes dsUmbrellaSwing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-5deg); }
}

/* 9) 雪天呼出冷气粒子 (Breath Particles) */
.ds-breath-1 {
  transform-origin: 411px 102px;
  animation: dsBreathFloat1 3.2s ease-in-out infinite;
}
.ds-breath-2 {
  transform-origin: 409px 100.5px;
  animation: dsBreathFloat2 3.2s ease-in-out infinite 1.6s;
}

@keyframes dsBreathFloat1 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  15% { opacity: 0.65; }
  100% { transform: translate(-8px, -5px) scale(1.35); opacity: 0; }
}
@keyframes dsBreathFloat2 {
  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
  15% { opacity: 0.45; }
  100% { transform: translate(-12px, -8px) scale(1.45); opacity: 0; }
}

/* 10) 冻抖小雪人 (Snowman Shivering) */
.ds-snowman {
  transform-origin: 450px 122px;
  animation: dsSnowmanShave 6s ease-in-out infinite;
}

@keyframes dsSnowmanShave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(1deg); }
}

/* 11) 捕虫网轻轻上下挥舞 (Net Swing) */
.ds-sakura-net {
  transform-origin: 416px 112px;
  animation: dsNetSwing 3s ease-in-out infinite;
}

@keyframes dsNetSwing {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-8deg); }
}

/* 12) 夜间露营营火双层火焰高频跳动 (Bonfire) */
.ds-flame-outer {
  transform-origin: 315px 124px;
  animation: dsFlameOuter 0.55s ease-in-out infinite;
}
.ds-flame-inner {
  transform-origin: 315px 124px;
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

/* 13) 小兔子依偎依靠、呼吸起伏与双耳朵慢速微晃 */
.ds-bunny {
  animation: dsBunnyBreath 4s ease-in-out infinite alternate;
  transform-origin: 422px 121px;
}
.ds-bunny-head {
  animation: dsBunnyHeadBreath 4s ease-in-out infinite alternate;
}
.bunny-ear-l {
  transform-origin: 413.5px 94.5px;
  animation: dsEarSwingL 4s ease-in-out infinite alternate;
}
.bunny-ear-r {
  transform-origin: 420px 95px;
  animation: dsEarSwingR 4s ease-in-out infinite alternate 0.5s;
}

@keyframes dsBunnyBreath {
  0% { transform: scale(1); }
  100% { transform: scale(1.02) translateY(-0.2px); }
}
@keyframes dsBunnyHeadBreath {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.4px); }
}
@keyframes dsEarSwingL {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(-3deg) translateY(-0.4px); }
}
@keyframes dsEarSwingR {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  50% { transform: rotate(3deg) translateY(-0.4px); }
}
</style>
