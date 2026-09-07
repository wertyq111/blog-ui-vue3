<template>
  <div class="home-page" :class="'home-page--' + currentTimePeriod">
    <!-- 天空背景容器 -->
    <div class="sky">
      <!-- 繁星点缀仅在夜间展示 -->
      <div v-if="currentTimePeriod === 'night'" class="starry-night-stars">
        <span class="star star--1">✦</span>
        <span class="star star--2">✦</span>
        <span class="star star--3">✦</span>
        <span class="star star--4">✦</span>
        <span class="star star--5">✦</span>
        <span class="star star--6">✦</span>
      </div>

      <!-- 夜景层：月亮 + 萤火虫，仅夜间渲染 -->
      <div v-if="currentTimePeriod === 'night'" class="night-scene">
        <div class="night-moon">
          <span class="night-moon__crater night-moon__crater--1"></span>
          <span class="night-moon__crater night-moon__crater--2"></span>
          <span class="night-moon__crater night-moon__crater--3"></span>
        </div>
        <span class="night-firefly night-firefly--1"></span>
        <span class="night-firefly night-firefly--2"></span>
        <span class="night-firefly night-firefly--3"></span>
        <span class="night-firefly night-firefly--4"></span>
        <span class="night-shooting-star"></span>
      </div>
    </div>

    <!-- 漂浮的白云 -->
    <svg class="cloud cloud-1" viewBox="0 0 140 70">
      <ellipse cx="40" cy="45" rx="40" ry="22"/><ellipse cx="80" cy="35" rx="35" ry="22"/><ellipse cx="115" cy="48" rx="22" ry="16"/>
    </svg>
    <svg class="cloud cloud-2" viewBox="0 0 100 50">
      <ellipse cx="30" cy="30" rx="28" ry="16"/><ellipse cx="65" cy="22" rx="24" ry="16"/><ellipse cx="85" cy="34" rx="14" ry="11"/>
    </svg>
    <svg class="cloud cloud-3" viewBox="0 0 80 40">
      <ellipse cx="22" cy="22" rx="22" ry="12"/><ellipse cx="52" cy="18" rx="20" ry="13"/><ellipse cx="70" cy="26" rx="10" ry="8"/>
    </svg>

    <!-- 飘落的绿叶和樱花装饰 -->
    <div class="falling-particles">
      <span class="particle particle--leaf-1">🍃</span>
      <span class="particle particle--flower-1">🌸</span>
      <span class="particle particle--leaf-2">🍃</span>
      <span class="particle particle--flower-2">🌸</span>
      <span class="particle particle--leaf-3">🍁</span>
    </div>

    <!-- 3D 拟物立体双层山坡草地装饰 -->
    <div class="grass-hills">
      <div class="grass-hill grass-hill--back"></div>
      <div class="grass-hill grass-hill--front"></div>
    </div>

    <!-- 导航栏 -->
    <nav class="nav">
      <div class="brand">
        <div class="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c4 0 8-2 11-7 2-3 3-7 3-11-4 0-8 1-11 4-3 3-5 7-5 12 0 1 0 2 2 2z"/>
          </svg>
        </div>
        <span class="brand-text">{{ brandName }}</span>
      </div>
      <div class="nav-links">
        <a class="nav-link nav-link-active" href="javascript:void(0)" @click="scrollToSection('hero')">
          <span class="nav-link-finger"></span>
          <span class="nav-link-text">概览</span>
        </a>
        <a class="nav-link" href="javascript:void(0)" @click="scrollToSection('modules')">
          <span class="nav-link-finger"></span>
          <span class="nav-link-text">模块</span>
        </a>
        <a class="nav-link" href="javascript:void(0)" @click="scrollToSection('about')">
          <span class="nav-link-finger"></span>
          <span class="nav-link-text">关于</span>
        </a>
      </div>
      <div class="nav-spacer"></div>
      
      <!-- 动态本地时钟小挂件 -->
      <div class="nav-clock" :title="'当前时段: ' + timePeriodName">
        <span class="clock-icon">{{ timePeriodIcon }}</span>
        <span class="clock-text">{{ formattedTime }}</span>
      </div>

      <!-- 昼夜开关：手动覆盖时段，刷新后回到跟随本机时间 -->
      <button
        type="button"
        class="nav-daynight"
        :class="{ 'nav-daynight--on': isNightView }"
        :title="dayNightTitle"
        :aria-pressed="isNightView"
        aria-label="昼夜切换"
        @click="toggleDayNight"
      >
        <span class="nav-daynight__face nav-daynight__face--sun">☀️</span>
        <span class="nav-daynight__face nav-daynight__face--moon">🌙</span>
        <span class="nav-daynight__knob"></span>
      </button>

      <router-link v-if="!isLoggedIn" class="btn-ai btn-ai-sm btn-ai-primary" to="/login">
        <span class="btn-ai-finger"></span>
        <span class="btn-ai-text">办理登岛手续 ✈️</span>
      </router-link>
      <router-link v-else class="btn-ai btn-ai-sm btn-ai-primary" to="/dashboard">
        <span class="btn-ai-finger"></span>
        <span class="btn-ai-text">进入工作台</span>
      </router-link>
    </nav>

    <!-- 主视觉 Hero (已登录状态下展示个人小岛概览) -->
    <section v-if="isLoggedIn" id="hero" class="hero">
      <div class="hero-grid">
        <div class="hero-text">
          <span class="hero-tag">
            <span class="hero-tag-dot"></span>
            WELCOME · 博客小岛
          </span>
          <div class="hero-title-row">
            <h1 class="hero-title">
              博客<br/>小岛.
            </h1>
          </div>
          <p class="hero-sub">
            记录开发日常、沉淀项目文档、管理平台来源与工具配置。<br />
            这里是 <b>{{ nickname }}</b> 的小岛 —— 收集本周的灵感、整理项目的航向，也保留一些悠闲发呆的余地。
          </p>
          <div class="hero-actions">
            <router-link class="btn-ai btn-ai-primary btn-ai-lg" to="/dashboard">
              <span class="btn-ai-finger"></span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
              <span class="btn-ai-text">进入工作台</span>
            </router-link>
          </div>
        </div>

        <!-- 岛主大头贴与挂件装饰 (气球礼包与五角星化石) -->
        <div class="hero-avatar-wrap">
          <!-- 动森经典红色漂浮气球礼包 (字数统计) -->
          <div class="deco-balloon-present">
            <div class="balloon-svg">
              <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 气球主体 -->
                <path d="M30 10 C12 10, 8 28, 8 40 C8 52, 18 60, 30 60 C42 60, 52 52, 52 40 C52 28, 48 10, 30 10 Z" fill="#fc736d" stroke="#794f27" stroke-width="2.5" />
                <!-- 气球小嘴 -->
                <path d="M26 60 L34 60 L30 64 Z" fill="#fc736d" stroke="#794f27" stroke-width="2" />
                <!-- 悬挂线 -->
                <line x1="30" y1="64" x2="30" y2="76" stroke="#794f27" stroke-width="1.5" stroke-dasharray="2 2" />
              </svg>
            </div>
            <div class="present-box">
              <span class="present-box-ribbon"></span>
              <div class="present-box-content">
                <span class="lbl">累计字数</span>
                <span class="num">{{ statWords }}</span>
              </div>
            </div>
          </div>

          <!-- 动森五角星蓝色化石 (连续天数统计) -->
          <div class="deco-fossil-streak">
            <div class="fossil-icon">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 蓝色化石底盘 -->
                <circle cx="30" cy="30" r="26" fill="#889df0" stroke="#794f27" stroke-width="3" />
                <circle cx="30" cy="30" r="21" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.6" />
                <!-- 蜗牛螺旋线 -->
                <path d="M30 16 C38 16, 44 22, 44 30 C44 38, 38 44, 30 44 C22 44, 18 38, 20 30 C21 24, 26 22, 30 22 C34 22, 36 25, 34 28 C33 29, 31 29, 30 28" stroke="#794f27" stroke-width="3" stroke-linecap="round" fill="none" />
                <!-- 小五角星 -->
                <path d="M30 24 L31 27 L34 27 L32 29 L33 32 L30 30 L27 32 L28 29 L26 27 L29 27 Z" fill="#fff" stroke="#794f27" stroke-width="1" />
              </svg>
            </div>
            <div class="fossil-content">
              <span class="lbl">连续天数</span>
              <span class="num">{{ statStreak }}<small>天</small></span>
            </div>
          </div>

          <!-- 挂角动森树叶装饰 🍃 -->
          <svg class="deco deco-leaf-1" viewBox="0 0 40 40" fill="#8ac68a">
            <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
          </svg>
          <svg class="deco deco-leaf-2" viewBox="0 0 40 40" fill="#d1da49">
            <path d="M35 5c0 10-5 20-13 28-5 5-12 7-22 7 0-10 2-17 7-22 8-8 18-13 28-13z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M35 5c-8 8-16 14-26 20" stroke="#794f27" stroke-width="1.5" fill="none"/>
          </svg>

          <!-- 岛主圆形框头像 -->
          <div class="hero-avatar">
            <img :src="avatarSrc" :alt="nickname" />
          </div>
          <div class="hero-name">🌿 {{ nickname }} · 岛民岛主</div>
        </div>
      </div>
    </section>

    <!-- 主视觉 Hero (未登录状态下展示前台移居办理柜台) -->
    <section v-else id="hero" class="hero hero--unauth">
      <div class="hero-grid">
        <div class="hero-text">
          <span class="hero-tag hero-tag--unauth">
            <span class="hero-tag-dot"></span>
            NOOK INC. · 移居小岛计划
          </span>
          <div class="hero-title-row">
            <h1 class="hero-title">
              博客<br/>小岛.
            </h1>
          </div>
          <p class="hero-sub">
            想要开启悠闲又充实的开发第二人生吗？<br />
            这里是 <b>Nook Inc. 移居小岛计划柜台</b>，我们将协助你办理博客小岛的定居登记，收集每日灵感，开启趣味生活！
          </p>
          <div class="hero-actions">
            <router-link class="btn-ai btn-ai-primary btn-ai-lg" to="/login">
              <span class="btn-ai-finger"></span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
              <span class="btn-ai-text">填写移居申请卡 🎫</span>
            </router-link>
            <a class="btn-ai btn-ai-lg" href="javascript:void(0)" @click="scrollToSection('modules')">
              <span class="btn-ai-finger"></span>
              <span class="btn-ai-text">小岛生态指南 🔍</span>
            </a>
          </div>
        </div>

        <!-- 动森移居柜台前台接待处 (粒狸与豆狸经典对话插图) -->
        <div class="hero-avatar-wrap hero-avatar-wrap--unauth">
          <!-- 动森经典特产叶子 🍃 -->
          <div class="deco-nook-leaf">
            <svg viewBox="0 0 40 40" fill="#58a032">
              <path d="M5 35c10 0 20-5 28-13 5-5 7-12 7-22-10 0-17 2-22 7-8 8-13 18-13 28z" stroke="#794f27" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M5 35c8-8 16-14 26-20" stroke="#794f27" stroke-width="1.5" fill="none"/>
            </svg>
          </div>

          <!-- 木纹柜台 Desk -->
          <div class="nook-counter">
            <div class="nook-counter-top"></div>
            <div class="nook-counter-body">
              <span class="nook-counter-sign">NOOK INC. 移居小岛前台</span>
            </div>
          </div>

          <!-- 漂浮在空中的 Dodo Airlines 机票 🎫 -->
          <div class="deco-dodo-ticket">
            <div class="ticket-header">DODO AIRLINES</div>
            <div class="ticket-body">
              <span class="ticket-icon">✈️</span>
              <span class="ticket-text">PASS</span>
            </div>
          </div>

          <!-- 粒狸的缝线对话气泡 -->
          <div class="nook-bubble nook-bubble--timmy">
            <div class="nook-bubble-name">🌿 粒狸 (Timmy)</div>
            <div class="nook-bubble-content">
              “欢迎光临！今天是要办理博客小岛的移居定居登记对吧？”
            </div>
          </div>

          <!-- 豆狸的小声复读缝线对话气泡 -->
          <div class="nook-bubble nook-bubble--tommy">
            <div class="nook-bubble-name">🌿 豆狸 (Tommy)</div>
            <div class="nook-bubble-content">
              “...对吧！”
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 岛民广播属性统计面板 (仅在已登录状态展示) -->
    <div v-if="isLoggedIn" class="hero-stats">
      <div class="stat">
        <div class="stat-ico stat-ico-mint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l4-12 3 9 3-6 2 5h4"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statWords }}<small>字</small></div>
          <div class="stat-lbl">本年累计文字</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-yellow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h14M4 12h14M4 18h10"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statLogs }}<small>条日志</small></div>
          <div class="stat-lbl">累计随笔日志</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-pink">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 2 2 2 2-4z"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statStreak }}<small>天</small></div>
          <div class="stat-lbl">最长连续记录</div>
        </div>
      </div>
      <div class="stat">
        <div class="stat-ico stat-ico-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
        </div>
        <div>
          <div class="stat-num">{{ statPeak }}<small>时段</small></div>
          <div class="stat-lbl">高产量活跃时段</div>
        </div>
      </div>
    </div>

    <!-- 模块区：已登录展示“玩家背包栏 Grid”，未登录展示“小岛生态推荐手册 Highlights” -->
    <section id="modules" class="section">
      <div v-if="isLoggedIn">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">MODULES · 岛屿口袋</div>
            <h2 class="section-title">我的背包格子 (Pocket Slots)</h2>
          </div>
          <p class="section-sub">小岛里的常用入口，化为随身背包里的各种神奇道具，点击即可掏出使用。</p>
        </div>
        
        <div class="modules-pocket">
          <div v-for="mod in modules" :key="mod.key" class="pocket-slot" :class="'pocket-slot--' + mod.color" @click="handleModuleClick(mod.key)">
            <!-- 背包格子的圆圈标记角标 -->
            <span class="pocket-slot-tag">{{ mod.tag }}</span>
            
            <div class="pocket-slot-ico-wrap">
              <div class="pocket-slot-ico">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="mod.icon" />
                </svg>
              </div>
            </div>
            <div class="pocket-slot-title">{{ mod.title }}</div>
            <div class="pocket-slot-sub">{{ mod.sub }}</div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="section-head">
          <div>
            <div class="section-eyebrow">HIGHLIGHTS · 岛屿生态手册</div>
            <h2 class="section-title">小岛推荐指南 (Getaway Highlights)</h2>
          </div>
          <p class="section-sub">Nook 移居计划官方倾情推荐，为您全方位展示博客小岛的悠闲生活与核心建设生态。</p>
        </div>
        
        <div class="modules-pocket">
          <div v-for="mod in unauthModules" :key="mod.key" class="pocket-slot" :class="'pocket-slot--' + mod.color" @click="handleModuleClick(mod.key)">
            <!-- 背包格子的圆圈标记角标 -->
            <span class="pocket-slot-tag">{{ mod.tag }}</span>
            
            <div class="pocket-slot-ico-wrap">
              <div class="pocket-slot-ico">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="mod.icon" />
                </svg>
              </div>
            </div>
            <div class="pocket-slot-title">{{ mod.title }}</div>
            <div class="pocket-slot-sub">{{ mod.sub }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于区：已登录展示“动森玩家岛民证 (Island Passport)”，未登录展示“大头针告示板 (Bulletin Board)” -->
    <section id="about" class="section">
      <div v-if="isLoggedIn">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">PASSPORT · 岛民证</div>
            <h2 class="section-title">Nook 岛民登记审查</h2>
          </div>
          <p class="section-sub">符合 Nook Inc. 移居小岛标准的官方认证卡，记录岛主身份与成就。</p>
        </div>

        <div class="passport-container">
          <div class="ac-passport">
            <!-- 岛民证头部缝线装饰 -->
            <div class="ac-passport__header">
              <div class="ac-passport__title-group">
                <h3>PASSPORT</h3>
                <span>Nook Inc. 岛民护照登记卡</span>
              </div>
              <!-- Dodo 联运 Approved 防伪印章 -->
              <div class="ac-passport__stamp-dodo">
                <span>DODO APPR.</span>
                <span class="sub">10.10.9.184</span>
              </div>
            </div>
            
            <div class="ac-passport__card">
              <!-- 左侧大头照照相机区域 -->
              <div class="ac-passport__photo-area">
                <div class="ac-passport__photo">
                  <img :src="avatarSrc" :alt="nickname" />
                </div>
                <div class="ac-passport__photo-stamp">PASSPORT PHOTO</div>
                <!-- 印在照片上的小海鸥 Approved 浅色水印 -->
                <div class="ac-passport__photo-watermark">🍃</div>
              </div>
              
              <!-- 右侧玩家手绘属性明细面联 -->
              <div class="ac-passport__details">
                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">PASSENGER NAME / 岛民姓名</span>
                    <span class="value">🌿 {{ nickname }}</span>
                  </div>
                  <div class="ac-passport__item">
                    <span class="label">NATIVE FRUIT / 特产水果</span>
                    <span class="value fruit-color">{{ userFruit }}</span>
                  </div>
                </div>
                
                <!-- 胶囊称号 (Title) -->
                <div class="ac-passport__row">
                  <div class="ac-passport__item ac-passport__item--title">
                    <span class="label">TITLE / 岛民称号</span>
                    <div class="value-title-wrap">
                      <span class="title-pill">{{ userTitle1 }}</span>
                      <span class="title-pill">{{ userTitle2 }}</span>
                    </div>
                  </div>
                </div>

                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">ISLAND NAME / 注册岛名</span>
                    <span class="value">{{ brandName }}</span>
                  </div>
                  <div class="ac-passport__item">
                    <span class="label">FIRST DEPARTURE / 移居日期</span>
                    <span class="value">2023-01-20</span>
                  </div>
                </div>

                <div class="ac-passport__row">
                  <div class="ac-passport__item">
                    <span class="label">ISLAND COMMENT / 岛民寄语</span>
                    <span class="value comment">“ 不催稿、不焦虑。写点东西、做点项目，让小岛今天比昨天再绿一点。 🌱 ”</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="section-head">
          <div>
            <div class="section-eyebrow">BULLETIN · 广场告示板</div>
            <h2 class="section-title">岛屿公告与基础设施栏 (Bulletin Board)</h2>
          </div>
          <p class="section-sub">记录博客小岛建设进程的大头针告示板，贴着最新的技术公告与移居资讯。</p>
        </div>

        <div class="passport-container">
          <!-- 大头针告示板 (Bulletin Board) 1:1 复刻 -->
          <div class="bulletin-board">
            <!-- 告示板大头针 -->
            <div class="board-pin pin-left">📌</div>
            <div class="board-pin pin-right">📌</div>
            
            <div class="board-header">
              <span class="board-title">📢 博客小岛 · 今日快讯</span>
              <!-- 顶部两只可爱的小鸟剪影 -->
              <div class="board-birds">
                <span class="board-bird">🐦</span>
                <span class="board-bird">🐤</span>
              </div>
            </div>
            
            <div class="board-body">
              <!-- 便签 1：技术基石 -->
              <div class="board-sticky sticky-tech">
                <div class="sticky-head">📋 岛屿基础设施公告</div>
                <div class="sticky-content">
                  本岛已完成技术现代化升级！前端搭载轻盈高效的 <strong>Vue 3.5 + Vite 8</strong> 拟物引擎，样式由 <strong>UnoCSS + Sass</strong> 随心调配；后端基于稳固的 <strong>Laravel 10 API</strong> 强力驱动，测试链则由 <strong>Pest PHP</strong> 严密守卫。🌱
                </div>
                <div class="sticky-foot">Nook 岛建委员会 · 宣</div>
              </div>
              
              <!-- 便签 2：乘客招募 -->
              <div class="board-sticky sticky-recruit">
                <div class="sticky-head">✉️ 登岛民移居招募通知</div>
                <div class="sticky-content">
                  欢迎各位开发者、创作者移居博客小岛！在这里我们不催稿、不焦虑。完成登岛移居手续后，即可当场获得您的专属官方<strong>「岛民证 (Island Passport)」</strong>，并解锁专属的<strong>「随身背包口袋」</strong>！✨
                </div>
                <div class="sticky-foot">Dodo Airlines 客服部</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 尾部露营帐篷小山丘交互条 -->
    <section class="island">
      <div class="island-inner">
        <!-- 露营帐篷矢量插图 -->
        <div class="camp-tent-svg">
          <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 帐篷主体 (乳白色配橙条纹) -->
            <path d="M10 50 L50 15 L90 50 Z" fill="#fffef0" stroke="#794f27" stroke-width="2.5" />
            <path d="M30 32 L50 15 L70 32 Z" fill="#e59266" opacity="0.8" />
            <!-- 帐篷拉链门 (打开) -->
            <path d="M40 50 L50 25 L60 50 Z" fill="#794f27" />
            <path d="M40 50 L45 35 M60 50 L55 35" stroke="#fff" stroke-width="1.5" />
            <!-- 地面铺垫 -->
            <rect x="5" y="49" width="90" height="4" rx="2" fill="#794f27" />
            <!-- 旁边的篝火 -->
            <path d="M22 49 L28 44 M28 49 L22 44" stroke="#794f27" stroke-width="3" stroke-linecap="round" />
            <circle cx="25" cy="42" r="5" fill="#fc736d" class="camp-fire" />
          </svg>
        </div>

        <h3 class="island-title">
          <span v-if="isLoggedIn">今天也是慢慢长大的一天 🌱</span>
          <span v-else>小岛的生活，从一张机票开始 ✈️</span>
        </h3>
        <p class="island-sub">
          <span v-if="isLoggedIn">在这里不焦虑。每天收集一些灵感，搭建好玩的功能。今天的小岛有没有比昨天更绿一点点呢？</span>
          <span v-else>这里是没有焦虑和催促的像素绿洲。每天整理你的随笔，沉淀开发心得。今天的小岛有没有比昨天更绿一点点呢？</span>
        </p>
        <div class="island-actions">
          <router-link v-if="isLoggedIn" class="btn-ai btn-ai-primary" to="/dashboard">
            <span class="btn-ai-finger"></span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">进入工作台</span>
          </router-link>
          <router-link v-else class="btn-ai btn-ai-primary" to="/login">
            <span class="btn-ai-finger"></span>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="btn-arrow-ico"><path d="M3 10h14M11 4l6 6-6 6"/></svg>
            <span class="btn-ai-text">领取我的登岛机票 🎫</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 脚部 -->
    <footer class="foot">
      <div v-if="isLoggedIn" class="foot-credit">© 2026 {{ nickname }} · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
      <div v-else class="foot-credit">© 2026 Nook Inc. · 基于 animal-island-vue3 拟物引擎 · MIT License</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store";
import DashboardStatsAPI from "@/api/develop/dashboard-stats";
import type { DashboardMetrics } from "@/types/api/dashboard-stats";
import islanderSvg from "@/assets/home/islander.svg";
import { resolveAvatar } from "@/utils/avatar";
import { usePublicPageScroll } from "@/composables";

defineOptions({ name: "HomePage" });

usePublicPageScroll();

const router = useRouter();
const userStore = useUserStore();

const isLoggedIn = computed(() => userStore.isLoggedIn());
const nickname = computed(() => userStore.userInfo?.nickname || "岛主");
const avatarSrc = computed(() =>
  isLoggedIn.value
    ? resolveAvatar(userStore.userInfo?.avatar, userStore.userInfo?.gender)
    : islanderSvg
);
const brandName = computed(() =>
  isLoggedIn.value ? `${nickname.value}的小岛` : "博客小岛"
);

/* ---- 24小时时段自动演进逻辑 ---- */
// 时钟推导出的时段（morning / afternoon / sunset / night）
const autoTimePeriod = ref("afternoon");
// 昼夜开关的手动覆盖；null = 跟随本机时间。刷新页面即回到跟随。
const manualDayNight = ref<"day" | "night" | null>(null);
// 页面实际生效的时段：手动优先，未手动过则跟随时钟
const currentTimePeriod = computed(() => {
  if (manualDayNight.value === "day") return "afternoon";
  if (manualDayNight.value === "night") return "night";
  return autoTimePeriod.value;
});
const formattedTime = ref("");
let clockTimer: any = null;

const timePeriodName = computed(() => {
  const map: Record<string, string> = {
    morning: "清晨",
    afternoon: "白天",
    sunset: "黄昏",
    night: "星夜",
  };
  return map[currentTimePeriod.value] || "白天";
});

const timePeriodIcon = computed(() => {
  const map: Record<string, string> = {
    morning: "🌅",
    afternoon: "☀️",
    sunset: "🌇",
    night: "🌌",
  };
  return map[currentTimePeriod.value] || "☀️";
});

const updateClock = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  formattedTime.value = `${hh}:${mm}`;

  const hour = d.getHours();
  if (hour >= 5 && hour < 8) {
    autoTimePeriod.value = "morning";
  } else if (hour >= 8 && hour < 17) {
    autoTimePeriod.value = "afternoon";
  } else if (hour >= 17 && hour < 19) {
    autoTimePeriod.value = "sunset";
  } else {
    autoTimePeriod.value = "night";
  }
};

/* ---- 昼夜开关 ---- */
const isNightView = computed(() => currentTimePeriod.value === "night");

const dayNightTitle = computed(() => {
  const source = manualDayNight.value === null ? "跟随本机时间" : "手动";
  return `昼夜切换：当前 ${timePeriodName.value}（${source}）`;
});

const toggleDayNight = () => {
  manualDayNight.value = isNightView.value ? "day" : "night";
};

/* ---- 动态哈希特产水果与胶囊称号生成 ---- */
const fruits = ["🍒 樱桃", "🍑 蜜桃", "🍊 橘子", "🍎 苹果", "🍐 梨子", "🥥 椰子"];
const titlesFirst = ["刚起步的", "全能的", "悠闲的", "闪闪发光的", "充满灵感的", "传说中的", "爱发呆的", "新来的"];
const titlesSecond = ["岛民", "写作者", "梦想家", "开发者", "收藏家", "园艺家", "旅行者", "创作者"];

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const userFruit = computed(() => {
  const hash = getHash(nickname.value);
  return fruits[hash % fruits.length];
});

const userTitle1 = computed(() => {
  const hash = getHash(nickname.value);
  return titlesFirst[hash % titlesFirst.length];
});

const userTitle2 = computed(() => {
  const hash = getHash(nickname.value + "-suffix");
  return titlesSecond[hash % titlesSecond.length];
});

/* ---- 首页 KPI 统计数据 ---- */
const metrics = ref<DashboardMetrics | null>(null);

function formatWords(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

const statWords = computed(() => metrics.value ? formatWords(metrics.value.total_words.value) : "8.4k");
const statLogs = computed(() => metrics.value ? String(metrics.value.total_logs.value) : "42");
const statStreak = computed(() => metrics.value ? String(metrics.value.longest_streak.value) : "7");
const statPeak = computed(() => metrics.value?.peak_hour?.label || "14点");

onMounted(async () => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);

  if (!isLoggedIn.value) return;
  try {
    const data = await DashboardStatsAPI.getStats("overview", "all");
    metrics.value = data.metrics;
  } catch {
    // 异常时保持静态兜底以保证 wow 体验
  }
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
});

const handleModuleClick = (key: string) => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }
  // 点击背包物品进入对应的功能路由
  if (key === "me" || key === "user") {
    router.push("/profile");
  } else {
    router.push("/dashboard");
  }
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // 更新导航栏上的高亮激活状态
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => link.classList.remove("nav-link-active"));
    
    const activeLink = Array.from(links).find(link => 
      link.querySelector(".nav-link-text")?.textContent === (id === "hero" ? "概览" : id === "modules" ? "模块" : "关于")
    );
    if (activeLink) {
      activeLink.classList.add("nav-link-active");
    }
  }
};

const unauthModules = [
  { key: "daily", color: "pink", tag: "DAILY · 日常", title: "工作日常", sub: "日报 · 周报 · 月报的打理", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS · 开发", title: "开发文档", sub: "小岛技术结晶与沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "docker", color: "blue", tag: "TRANSIT · 联运", title: "Dodo 联运", sub: "本地远端服务无缝对接", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "site", color: "green", tag: "BLUEPRINT · 蓝图", title: "建设蓝图", sub: "站点字典参数系统配置", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
];

const modules = [
  { key: "daily", color: "pink", tag: "DAILY", title: "工作日常", sub: "日报 · 周报 · 月报", icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { key: "docs", color: "yellow", tag: "DOCS", title: "开发文档", sub: "项目资料沉淀", icon: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" },
  { key: "source", color: "blue", tag: "SOURCE", title: "平台来源", sub: "绑定项目上下文", icon: "M6 3h12l4 6-10 13L2 9z" },
  { key: "route", color: "teal", tag: "ROUTE", title: "路径转换", sub: "网址与服务器地址", icon: "M13 2L3 14h9l-1 8 10-12h-9z" },
  { key: "init", color: "orange", tag: "INIT", title: "模型初始化", sub: "框架模板配置", icon: "M12 3v18M3 12h18" },
  { key: "user", color: "purple", tag: "USER", title: "会员管理", sub: "用户资料与头像", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
  { key: "sys", color: "green", tag: "SYS", title: "系统管理", sub: "菜单 · 角色 · 权限", icon: "M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" },
  { key: "site", color: "peach", tag: "SITE", title: "站点配置", sub: "字典 · 参数 · 日志", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "api", color: "lime", tag: "API", title: "接口后台", sub: "Laravel API", icon: "M18 20V10M12 20V4M6 20v-6" },
  { key: "docker", color: "red", tag: "DOCKER", title: "远端验证", sub: "Docker 运行环境", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { key: "mini", color: "brown", tag: "MINI", title: "小程序内容", sub: "壁纸 · 相册 · 记录", icon: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z" },
  { key: "me", color: "mint", tag: "ME", title: "个人中心", sub: "岛主信息与偏好", icon: "M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" },
];
</script>

<style lang="scss" scoped>
.home-page {
  // ── 昼夜 token（昼间值 = 抽取前的字面值，等值重构）────────────
  // 夜间覆盖见 .home-page--night
  --ai-text: var(--ai-text);          // 正文/标题棕
  --ai-text-2: var(--ai-text-2);        // 次级文字
  --ai-primary: var(--ai-primary);       // 主题青
  --ai-primary-active: var(--ai-primary-active);
  --ai-border: var(--ai-border);        // 浅描边
  --ai-outline: var(--ai-text);       // 拟物粗描边（与 --ai-text 昼间同值、夜间相反）
  --ai-btn-face: #fffef6;      // 按钮/卡片面
  --ai-btn-shadow: #d4c9b4;    // 拟物投影
  --ai-shadow-color: var(--ai-shadow-color);  // 柔和阴影

  // ── 首页专有槽 ──────────────────────────────────────────
  --home-hill-back: var(--ai-success);      // 后层山丘
  --home-hill-back-op: 0.45;
  --home-hill-front: #8ac68a;     // 前层山丘
  --home-hill-front-op: 0.65;
  --home-cloud-fill: #fff;        // 云朵填充
  --home-particle-op: 1;          // 飘落 🍃🌸 透明度
  --home-switch-track: #fffef0;   // 昼夜开关轨道
  --home-switch-knob: #ffd85e;    // 昼夜开关拨钮（昼间＝太阳黄）

  position: relative;
  width: 100%;
  font-family: var(--el-font-family);
  user-select: none;
  transition: background 1.5s ease-in-out;
}

// ============================================
// 1. 四套唯美天空时域背景 CSS 定义
// ============================================

// 🌤 清晨天空
.home-page--morning {
  background: linear-gradient(180deg, #fcead2 0%, #ecdcb9 40%, #c1dbbe 100%);
  
  .sky {
    background: radial-gradient(1000px 500px at 70% 0%, rgba(254, 219, 178, 0.4) 0%, transparent 60%);
  }
}

// ☀️ 白昼天空 (经典青绿)
.home-page--afternoon {
  background: linear-gradient(180deg, #dbf3fa 0%, #eaf6db 60%, #e1edd0 100%);
  
  .sky {
    background: radial-gradient(1000px 500px at 80% 0%, rgba(25, 200, 185, 0.08) 0%, transparent 60%);
  }
}

// 🌇 黄昏落日
.home-page--sunset {
  background: linear-gradient(180deg, #fcd5b5 0%, #e5a48b 50%, #af879d 100%);
  
  .sky {
    background: radial-gradient(1100px 600px at 80% 10%, rgba(252, 115, 109, 0.3) 0%, transparent 60%);
  }
}

// 🌌 夜空闪烁
.home-page--night {
  // ── 夜间 token 覆盖（取值来自 夜晚模板.dc.html 的 [data-mode="night"]）──
  // 这一组接管全页约 120 处 token 引用；下方的逐元素规则只处理 token 之外的特例
  --ai-text: #fffdec;
  --ai-text-2: #a9b3d8;
  --ai-primary: #a5b4fc;
  --ai-primary-active: #8b9cf5;
  --ai-border: #2c3859;
  --ai-outline: #0f1731;
  --ai-btn-face: #223058;
  --ai-btn-shadow: #0a1024;
  --ai-shadow-color: #0b1123;

  --home-hill-back: #24406b;
  --home-hill-back-op: 1;      // 暗色山丘不能再压透明度，否则糊成一片
  --home-hill-front: #1a3054;
  --home-hill-front-op: 1;
  --home-cloud-fill: rgba(200, 210, 240, 0.35);
  --home-particle-op: 0.35;
  --home-switch-track: #1c274c;
  --home-switch-knob: #cbd5ff;

  background: linear-gradient(180deg, #151e3f 0%, #213352 60%, #1e2836 100%);
  color: var(--ai-text);

  .sky {
    background: radial-gradient(1000px 500px at 20% 0%, rgba(136, 157, 240, 0.15) 0%, transparent 60%);
  }

  .nav {
    background: rgba(21, 30, 63, 0.85);
    border-bottom-color: #2c3859;
  }

  .brand-text,
  .hero-sub,
  .section-title {
    color: #fffdec !important;
  }

  .hero-sub b {
    color: #3dd4c6 !important;
  }

  .stat {
    background: #1c274c;
    border-color: #2c3859;
  }

  .stat-num {
    color: #fffdec;
  }

  .nav-clock {
    background: #1c274c;
    border-color: #2c3859;
    color: #fffdec;
  }

  .nav-daynight {
    border-color: #2c3859;
  }

  .about-card {
    background: #1c274c;
    border-color: #2c3859;

    p {
      // 原字面值 var(--ai-shadow-color) 在这里是「柔和正文色」，不是阴影色。
      // token 化时按昼间语义归给了 --ai-shadow-color，其夜间值 #0b1123
      // 会在 #1c274c 卡片上变成近黑字，故改用语义正确的 --ai-text-2。
      color: var(--ai-text-2);
    }
  }

  .about-list-row span:last-child {
    color: #fffdec;
  }

  .pocket-slot {
    background: rgba(28, 39, 76, 0.85);
    border-color: #2c3859;

    &:hover {
      background: #1c274c;
    }
  }

  .ac-passport {
    background: #1c274c;
    border-color: var(--ai-outline);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .ac-passport__card {
    background: #1e2836;
    border-color: var(--ai-outline);
  }

  .ac-passport__details .label {
    color: rgba(255, 255, 255, 0.35);
  }

  .ac-passport__details .value {
    color: #fffdec;
  }

  .island-inner {
    background: linear-gradient(180deg, #1c274c 0%, #151e3f 100%);
    border-color: #2c3859;
    box-shadow: 0 8px 0 0 #151d38;
  }

  .island-title {
    color: #fffdec;
  }

  .foot {
    color: rgba(255, 255, 255, 0.4);
  }
}

// 慢动天空层
.sky {
  position: fixed;
  inset: 0;
  z-index: -2;
  transition: all 1.5s ease;
}

// 夜空闪烁的繁星
// ============================================
// 夜景层（月亮 / 萤火虫），仅 currentTimePeriod === "night" 时渲染。
// 走 v-if 而非 opacity 开关：昼间零 DOM、零动画、零合成层。
// 缓动取自 Emil Kowalski 的标准曲线，不用内置 ease-out（太弱）。
// ============================================
.night-scene {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.night-moon {
  position: absolute;
  top: 10%;
  right: 9%;
  width: 96px;
  height: 96px;
  background: radial-gradient(circle at 34% 32%, #fff8dc 0%, #ffe9a8 52%, #f4d489 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 12px rgba(255, 233, 168, 0.1),
    0 0 70px 22px rgba(255, 233, 168, 0.22);
  animation: night-moonrise 2.4s cubic-bezier(0.23, 1, 0.32, 1) both;

  &__crater {
    position: absolute;
    background: rgba(200, 170, 110, 0.32);
    border-radius: 50%;

    &--1 {
      top: 26px;
      left: 22px;
      width: 16px;
      height: 16px;
    }

    &--2 {
      top: 54px;
      left: 46px;
      width: 11px;
      height: 11px;
      opacity: 0.85;
    }

    &--3 {
      top: 34px;
      left: 58px;
      width: 8px;
      height: 8px;
      opacity: 0.7;
    }
  }
}

.night-firefly {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ffe9a8;
  border-radius: 50%;
  box-shadow: 0 0 12px 4px rgba(255, 233, 168, 0.5);
  animation: night-firefly-drift 10s cubic-bezier(0.77, 0, 0.175, 1) infinite;

  &--1 {
    bottom: 22%;
    left: 14%;
    width: 7px;
    height: 7px;
    animation-duration: 9s;
  }

  &--2 {
    bottom: 16%;
    left: 34%;
    width: 5px;
    height: 5px;
    animation-duration: 11s;
    animation-delay: 1.5s;
  }

  &--3 {
    bottom: 28%;
    left: 58%;
    animation-duration: 10s;
    animation-delay: 0.8s;
  }

  &--4 {
    bottom: 19%;
    left: 74%;
    width: 5px;
    height: 5px;
    animation-duration: 12s;
    animation-delay: 2.2s;
  }
}

// 流星：22s 一次，实际掠过只占 0.7s（3.2%），其余时间靠关键帧停在终点透明处充当间隔。
// 用 linear —— 流星是匀速掠过，且 ease-in 会让它「起步慢」，正好错过用户在看的那一瞬。
.night-shooting-star {
  position: absolute;
  top: 6%;
  right: 26%;
  width: 64px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fffdec);
  border-radius: 2px;
  opacity: 0;
  animation: night-shoot 22s linear 4s infinite;
}

@keyframes night-shoot {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(28deg);
  }

  0.5% {
    opacity: 1;
  }

  3.2% {
    opacity: 0;
    transform: translate(-360px, 220px) rotate(28deg);
  }

  100% {
    opacity: 0;
    transform: translate(-360px, 220px) rotate(28deg);
  }
}

@keyframes night-moonrise {
  from {
    opacity: 0;
    transform: translateY(34px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 关键帧名与 .night-firefly 类名刻意错开，避免读代码时把两者当成一个东西
@keyframes night-firefly-drift {
  0% {
    opacity: 0.15;
    transform: translate(0, 0);
  }

  25% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
    transform: translate(60px, -38px);
  }

  75% {
    opacity: 1;
  }

  100% {
    opacity: 0.15;
    transform: translate(0, 0);
  }
}

// 无障碍：前庭敏感用户去掉位移，保留静态存在感（gentler，不是 zero）
@media (prefers-reduced-motion: reduce) {
  .night-moon {
    transform: none;
    animation: night-moon-fade 0.2s ease both;
  }

  .night-firefly {
    opacity: 0.6;
    animation: none;
  }

  // 流星没有「更温和的版本」——静止的白杠是视觉垃圾，直接隐藏才对
  .night-shooting-star {
    opacity: 0;
    animation: none;
  }

  @keyframes night-moon-fade {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}

.starry-night-stars {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  color: #fff;
  opacity: 0.8;
  font-size: 14px;
  animation: ac-star-blink 3s infinite alternate;

  &--1 { top: 12%; left: 15%; animation-duration: 2.2s; }
  &--2 { top: 8%; left: 45%; animation-duration: 3.5s; animation-delay: 0.5s; }
  &--3 { top: 18%; right: 18%; animation-duration: 2.8s; animation-delay: 1.2s; }
  &--4 { top: 32%; left: 30%; animation-duration: 4.1s; }
  &--5 { top: 25%; right: 40%; animation-duration: 3.1s; animation-delay: 0.8s; }
  &--6 { top: 40%; right: 12%; animation-duration: 2.5s; }
}

@keyframes ac-star-blink {
  0% { opacity: 0.1; transform: scale(0.7) rotate(0deg); }
  100% { opacity: 0.9; transform: scale(1.1) rotate(15deg); }
}

// Cloud漂移
.cloud {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  opacity: 0.8;
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.03));
  fill: var(--home-cloud-fill);
}

.cloud-1 { top: 8%; left: 6%; width: 130px; animation: ac-cloud-float 50s linear infinite; }
.cloud-2 { top: 15%; right: 8%; width: 100px; animation: ac-cloud-float-rev 60s linear infinite; }
.cloud-3 { top: 30%; left: 12%; width: 85px; animation: ac-cloud-float 55s linear infinite 5s; }

@keyframes ac-cloud-float {
  0% { transform: translateX(-120px); }
  100% { transform: translateX(100vw); }
}

@keyframes ac-cloud-float-rev {
  0% { transform: translateX(120px); }
  100% { transform: translateX(-100vw); }
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
  overflow: hidden; // 阻断横掠小飞机造成宽度扩展溢出
}

// 飘落花叶粒子层
.falling-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  font-size: 16px;
  opacity: var(--home-particle-op);
  animation: ac-particle-fall 14s linear infinite;

  &--leaf-1 { left: 5%; top: -5%; animation-duration: 10s; }
  &--flower-1 { left: 22%; top: -5%; animation-duration: 13s; animation-delay: 2s; }
  &--leaf-2 { left: 45%; top: -5%; animation-duration: 11s; animation-delay: 0.5s; }
  &--flower-2 { left: 70%; top: -5%; animation-duration: 14s; animation-delay: 3s; }
  &--leaf-3 { left: 88%; top: -5%; animation-duration: 12s; }
}

@keyframes ac-particle-fall {
  0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(110vh) rotate(360deg) translateX(70px); opacity: 0; }
}

// ============================================
// 2. 裸眼 3D 立体波浪双层草坡 (Hills Overlay)
// ============================================
.grass-hills {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 240px;
  z-index: -1;
  pointer-events: none;
  // 两层山丘 width:120% / left:-8%~-10%，右端伸出视口 154px 会撑出横向滚动条；
  // 视觉上本就该被视口切掉，这里直接裁掉（同 .ac404__sky 的处理）
  overflow: hidden;
}

.grass-hill {
  position: absolute;
  bottom: -40px;
  width: 120%;
  height: 200px;
  border-radius: 50%;
  
  &--back {
    left: -10%;
    background: var(--home-hill-back);
    opacity: var(--home-hill-back-op);
    animation: ac-hill-wave 16s ease-in-out infinite alternate;
  }

  &--front {
    left: -8%;
    background: var(--home-hill-front);
    opacity: var(--home-hill-front-op);
    height: 170px;
    animation: ac-hill-wave-rev 12s ease-in-out infinite alternate;
  }
}

@keyframes ac-hill-wave {
  0% { transform: translate(0, 0) scaleY(1); }
  100% { transform: translate(-30px, 8px) scaleY(1.05); }
}

@keyframes ac-hill-wave-rev {
  0% { transform: translate(0, 0) scaleY(1); }
  100% { transform: translate(25px, -6px) scaleY(0.96); }
}

// ============================================
// 3. 顶栏导航 (Navbar)
// ============================================
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 16px 40px;
  background: rgba(253, 253, 245, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 2px solid var(--ai-border);
  box-shadow: 0 4px 16px rgba(121, 79, 39, 0.04);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 18px;
  color: var(--ai-text);
  cursor: pointer;
}

.brand-mark {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--ai-primary) 0%, #82d5bb 100%);
  border: 2px solid var(--ai-outline);
  border-radius: 50% 45% 50% 48% / 48% 50% 45% 50%;
  display: grid;
  place-items: center;
  box-shadow: 0 3px 0 0 var(--ai-outline);

  svg { width: 22px; height: 22px; color: #fff; }
}

.nav-links {
  display: flex;
  gap: 8px;
  margin-left: 28px;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--ai-text-2);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.25, 1, 0.5, 1);
  text-decoration: none;
  overflow: hidden;

  // lessons.md 文字避让小手指 hover 交互规范
  .nav-link-finger {
    position: absolute;
    left: 8px;
    width: 14px;
    height: 14px;
    background: url('/src/assets/select-cursor.svg') no-repeat center;
    background-size: contain;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .nav-link-text {
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  &:hover {
    background: #f0e8d8;
    color: var(--ai-text);

    .nav-link-finger {
      opacity: 1;
      transform: translateX(0);
    }

    .nav-link-text {
      transform: translateX(8px); // 文字向右偏移避让
    }
  }
}

.nav-link-active {
  background: #ffffff;
  color: var(--ai-text);
  border: 1.5px solid var(--ai-border);
  box-shadow: 0 3px 6px rgba(61, 52, 40, 0.05);
}

// 本地时钟挂件
.nav-clock {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fffef0;
  border: 2px solid var(--ai-border);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 800;
  color: var(--ai-text);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-right: 6px;

  .clock-icon {
    font-size: 15px;
  }
}

// 昼夜开关（拨杆形态，与时钟挂件同一套描边/圆角/底色）
.nav-daynight {
  position: relative;
  flex-shrink: 0;
  width: 58px;
  height: 30px;
  padding: 0;
  margin-right: 10px;
  background: var(--home-switch-track);
  border: 2px solid var(--ai-border);
  border-radius: 999px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    background 320ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 320ms cubic-bezier(0.23, 1, 0.32, 1);

  &:hover .nav-daynight__knob {
    transform: translateX(var(--home-switch-x)) scale(1.06);
  }

  &:focus-visible {
    outline: 2px solid var(--ai-primary);
    outline-offset: 2px;
  }
}

.nav-daynight__face {
  position: absolute;
  top: 50%;
  font-size: 13px;
  line-height: 1;
  transform: translateY(-50%);
  pointer-events: none;
  transition: opacity 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.nav-daynight__face--sun {
  left: 6px;
  opacity: 1;
}

.nav-daynight__face--moon {
  right: 6px;
  opacity: 0.35;
}

// 拨钮：位移量由 --home-switch-x 统一驱动，hover 缩放才不会把位移覆盖掉
.nav-daynight__knob {
  --home-switch-x: 0px;

  position: absolute;
  top: 50%;
  left: 2px;
  width: 22px;
  height: 22px;
  margin-top: -11px;
  border-radius: 50%;
  background: var(--home-switch-knob);
  border: 2px solid var(--ai-outline);
  box-shadow: 0 2px 0 0 var(--ai-btn-shadow);
  transform: translateX(var(--home-switch-x));
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), background 320ms ease;
}

.nav-daynight--on {
  .nav-daynight__knob {
    --home-switch-x: 28px;
  }

  .nav-daynight__face--sun { opacity: 0.35; }
  .nav-daynight__face--moon { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .nav-daynight,
  .nav-daynight__face,
  .nav-daynight__knob {
    transition: none;
  }
}

.nav-spacer { flex: 1; }

// ============================================
// 4. 按钮样式 (Buttons with Hand Wiggle hover)
// ============================================
.btn-ai {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 26px;
  font-family: inherit;
  font-weight: 900;
  font-size: 15px;
  color: var(--ai-text);
  background: var(--ai-btn-face);
  border: 2.5px solid var(--ai-outline);
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 0.05em;
  line-height: 1;
  box-shadow: 0 5px 0 0 var(--ai-btn-shadow);
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  text-decoration: none;
  overflow: hidden;

  .btn-ai-finger {
    position: absolute;
    left: 14px;
    width: 20px;
    height: 20px;
    background: url('/src/assets/select-cursor.svg') no-repeat center;
    background-size: contain;
    opacity: 0;
    transform: translateX(-10px) rotate(-10deg);
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .btn-ai-text {
    transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .btn-arrow-ico {
    transition: transform 0.2s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 7px 0 0 var(--ai-btn-shadow);
    border-color: var(--ai-primary);
    color: var(--ai-primary-active);

    .btn-ai-finger {
      opacity: 1;
      transform: translateX(0) rotate(0deg);
      animation: ac-btn-wiggle 0.5s ease infinite alternate;
    }

    .btn-ai-text {
      transform: translateX(12px); // 向右平移避让手指
    }

    .btn-arrow-ico {
      transform: translateX(12px); // 图标跟随右移
    }
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 0 var(--ai-btn-shadow);
  }
}

.btn-ai-primary {
  color: #fff;
  background: linear-gradient(180deg, #84cf4f 0%, var(--ai-success) 100%);
  border-color: var(--ai-outline);
  box-shadow: 0 5px 0 0 #5a9e1e;

  &:hover {
    box-shadow: 0 7px 0 0 #5a9e1e;
    color: #fff;
    border-color: var(--ai-primary);
  }

  &:active {
    box-shadow: 0 2px 0 0 #5a9e1e;
  }
}

.btn-ai-lg { padding: 16px 34px; font-size: 17px; }
.btn-ai-sm { padding: 8px 18px; font-size: 13px; box-shadow: 0 3px 0 0 var(--ai-btn-shadow); }

@keyframes ac-btn-wiggle {
  0% { transform: scale(1) rotate(-5deg); }
  100% { transform: scale(1.08) rotate(5deg); }
}

// ============================================
// 5. 主体视觉 Hero 模块
// ============================================
.hero {
  position: relative;
  padding: 56px 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 50px;
  align-items: center;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #ffffff;
  border: 2px solid var(--ai-outline);
  border-radius: 999px;
  color: var(--ai-primary-active);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 2.5px;
  box-shadow: 0 3px 0 0 rgba(121, 79, 39, 0.1);
}

.hero-tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ai-primary);
  box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.25);
}

.hero-title {
  font-size: clamp(64px, 10vw, 120px);
  font-weight: 900;
  line-height: 0.94;
  letter-spacing: -0.03em;
  margin: 20px 0;
  color: #fffdec;
  text-shadow:
    0 2.5px 0 #eed09d,
    0 5px 0 var(--ai-outline), // 动森深褐黑描边厚度
    0 7.5px 0 var(--ai-outline),
    0 12px 24px rgba(90, 58, 24, 0.18);
}

.hero-title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.hero-sub {
  max-width: 500px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--ai-text);
  font-weight: 700;
  margin-bottom: 32px;

  b { color: var(--ai-primary-active); font-weight: 800; }
}

.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

.hero-avatar-wrap {
  position: relative;
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: min(340px, 75vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #fff7e0 100%);
  border: 5px solid var(--ai-outline); // 动森深褐黑相框粗边
  box-shadow:
    0 0 0 4px #eef9d6,
    0 16px 36px rgba(90, 58, 24, 0.14);
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: grid;
  place-items: center;

  img { width: 92%; height: 92%; object-fit: cover; border-radius: 50%; }
}

.hero-name {
  margin-top: 18px;
  padding: 6px 24px;
  background: var(--ai-btn-face);
  border: 2px.5 solid var(--ai-outline);
  border-radius: 24px 30px 28px 26px / 26px 24px 30px 28px;
  font-weight: 900;
  font-size: 16px;
  color: var(--ai-text);
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
}

// 浮动的红色气球礼物
.deco-balloon-present {
  position: absolute;
  top: -30px;
  left: -80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  animation: ac-balloon-bob 4s ease-in-out infinite;

  .balloon-svg {
    width: 46px;
    height: 60px;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,0.06));
  }

  .present-box {
    margin-top: -12px;
    background: var(--ai-btn-face);
    border: 2px.5 solid var(--ai-outline);
    border-radius: 12px;
    padding: 6px 12px;
    box-shadow: 0 3px 0 0 var(--ai-outline);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    .present-box-ribbon {
      position: absolute;
      top: -3px;
      width: 14px;
      height: 14px;
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><path d='M2 5 C2 2, 5 3, 5 5 C5 3, 8 2, 8 5 Z' fill='%23fc736d' stroke='%23794f27' stroke-width='1.2'/></svg>") no-repeat center;
      background-size: contain;
    }

    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: var(--ai-shadow-color);
      margin-bottom: 2px;
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: var(--ai-red);
    }
  }
}

// 蓝色五角星化石挂饰
.deco-fossil-streak {
  position: absolute;
  bottom: 20px;
  right: -70px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px.5 solid var(--ai-outline);
  border-radius: 20px 24px 22px 26px / 24px 22px 26px 20px;
  padding: 6px 16px;
  box-shadow: 0 4px 0 0 var(--ai-outline);
  z-index: 3;
  transform: rotate(6deg);
  animation: ac-fossil-sway 5s ease-in-out infinite alternate;

  .fossil-icon {
    width: 32px;
    height: 32px;
  }

  .fossil-content {
    display: flex;
    flex-direction: column;

    .lbl {
      font-size: 8px;
      font-weight: 800;
      color: var(--ai-shadow-color);
    }

    .num {
      font-size: 14px;
      font-weight: 900;
      color: #6a86d8;
    }
  }
}

@keyframes ac-balloon-bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-14px) rotate(2deg); }
}

@keyframes ac-fossil-sway {
  0% { transform: rotate(3deg) translateY(0); }
  100% { transform: rotate(9deg) translateY(-4px); }
}

.deco { position: absolute; }
.deco-leaf-1 { top: -14px; right: -14px; width: 52px; transform: rotate(18deg); z-index: 3; }
.deco-leaf-2 { bottom: -14px; left: -14px; width: 44px; transform: rotate(-18deg); z-index: 3; }

// ============================================
// 6. 岛民广播属性统计面板
// ============================================
.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 28px auto 0;
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

.stat {
  background: var(--ai-btn-face);
  border: 2.5px solid var(--ai-outline);
  border-radius: 24px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 4px 0 0 var(--ai-btn-shadow);
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 0 var(--ai-btn-shadow);
    border-color: var(--ai-primary);
  }
}

.stat-ico {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.stat-ico-mint { background: #e6f9f6; color: var(--ai-primary-active); }
.stat-ico-yellow { background: #fff2ba; color: #9f7c00; }
.stat-ico-pink { background: #ffe0e6; color: #c05f76; }
.stat-ico-blue { background: #dfe9ff; color: #6a86d8; }

.stat-num {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  color: var(--ai-text);

  small { font-size: 11px; font-weight: 800; color: var(--ai-text-2); margin-left: 2px; }
}

.stat-lbl { font-size: 11px; color: var(--ai-shadow-color); font-weight: 800; margin-top: 5px; }

// ============================================
// 7. 背包 Slot 物品功能区
// ============================================
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 40px 10px;
  position: relative;
  z-index: 2;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
}

.section-eyebrow {
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: 900;
  color: var(--ai-primary-active);
}

.section-title {
  margin: 6px 0 0;
  font-size: 34px;
  font-weight: 900;
  color: var(--ai-text);
  letter-spacing: -0.02em;
  
  // 对各颜色包格做细腻的拟色适配 (使用 & 连字符修正 SCSS 同级类匹配)
  &--pink { .pocket-slot-ico-wrap { background: #ffe6eb; } }
  &--yellow { .pocket-slot-ico-wrap { background: #fff8d6; } }
  &--blue { .pocket-slot-ico-wrap { background: #e8f0ff; } }
  &--teal { .pocket-slot-ico-wrap { background: #e3faf2; } }
  &--orange { .pocket-slot-ico-wrap { background: #ffebd6; } }
  &--purple { .pocket-slot-ico-wrap { background: #f6ebff; } }
  &--green { .pocket-slot-ico-wrap { background: #ebffe6; } }
  &--peach { .pocket-slot-ico-wrap { background: #ffebd6; } }
  &--lime { .pocket-slot-ico-wrap { background: #fdffe6; } }
  &--red { .pocket-slot-ico-wrap { background: #ffe6e6; } }
  &--brown { .pocket-slot-ico-wrap { background: #fdfaf0; } }
  &--mint { .pocket-slot-ico-wrap { background: #e3faf2; } }
}

.section-sub { color: var(--ai-text-2); font-size: 14px; font-weight: 700; max-width: 480px; }

.modules-pocket {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

// 动森经典背包格子道具卡片
.pocket-slot {
  position: relative;
  background: var(--ai-btn-face);
  border: 3px solid var(--ai-outline);
  border-radius: 28px;
  padding: 24px 20px;
  height: 206px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  overflow: hidden;
  box-shadow: 0 5px 0 0 var(--ai-btn-shadow);
  color: var(--ai-text);
  text-decoration: none;

  // 内阴影和极柔格子平铺底纹
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(121, 79, 39, 0.01) 0px,
      rgba(121, 79, 39, 0.01) 4px,
      transparent 4px,
      transparent 8px
    );
    pointer-events: none;
    z-index: 0;
  }

  .pocket-slot-ico-wrap {
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    background: var(--ai-border);
    border: 2px solid var(--ai-outline);
    border-radius: 18px;
    margin-bottom: auto;
    z-index: 1;
    transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .pocket-slot-ico {
    color: var(--ai-text);
    display: grid;
    place-items: center;
  }

  .pocket-slot-title {
    font-size: 18px;
    font-weight: 900;
    margin-top: 14px;
    letter-spacing: 0.02em;
    z-index: 1;
  }

  .pocket-slot-sub {
    font-size: 12px;
    color: var(--ai-shadow-color);
    font-weight: 800;
    margin-top: 4px;
    z-index: 1;
  }

  // 动森手指光标避让
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 10px 0 0 var(--ai-btn-shadow);
    border-color: var(--ai-primary);
    color: var(--ai-primary-active);

    .pocket-slot-ico-wrap {
      transform: scale(1.1) rotate(6deg);
      background: #e6f9f6;
      border-color: var(--ai-primary);
      color: var(--ai-primary-active);
    }

    .pocket-slot-sub {
      color: var(--ai-primary);
    }
  }

  &:active {
    transform: translateY(3px) scale(0.98);
    box-shadow: 0 2px 0 0 var(--ai-btn-shadow);
  }
}

// 背包格子标签角标
.pocket-slot-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(121, 79, 39, 0.08);
  border: 1.5px solid var(--ai-outline);
  color: var(--ai-text);
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.5px;
  z-index: 1;
}

// 对各颜色包格做细腻的拟色适配
.pocket-slot--pink { .pocket-slot-ico-wrap { background: #ffe6eb; } }
.pocket-slot--yellow { .pocket-slot-ico-wrap { background: #fff8d6; } }
.pocket-slot--blue { .pocket-slot-ico-wrap { background: #e8f0ff; } }
.pocket-slot--teal { .pocket-slot-ico-wrap { background: #e3faf2; } }
.pocket-slot--orange { .pocket-slot-ico-wrap { background: #ffebd6; } }
.pocket-slot--purple { .pocket-slot-ico-wrap { background: #f6ebff; } }
.pocket-slot--green { .pocket-slot-ico-wrap { background: #ebffe6; } }
.pocket-slot--peach { .pocket-slot-ico-wrap { background: #ffebd6; } }
.pocket-slot--lime { .pocket-slot-ico-wrap { background: #fdffe6; } }
.pocket-slot--red { .pocket-slot-ico-wrap { background: #ffe6e6; } }
.pocket-slot--brown { .pocket-slot-ico-wrap { background: #fdfaf0; } }
.pocket-slot--mint { .pocket-slot-ico-wrap { background: #e3faf2; } }

// ============================================
// 8. 岛民证 (Passport)
// ============================================
.passport-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.ac-passport {
  width: 100%;
  max-width: 720px;
  background: #fffef2;
  border: 3.5px solid var(--ai-outline);
  border-radius: 36px;
  box-shadow: 0 16px 40px rgba(121, 79, 39, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.ac-passport__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px;
  background: linear-gradient(180deg, #fffae8 0%, #fff6d1 100%);
  border-bottom: 3px dashed rgba(121, 79, 39, 0.2);

  .ac-passport__title-group {
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      color: var(--ai-text);
      letter-spacing: 2px;
      line-height: 1;
    }
    span {
      font-size: 10px;
      font-weight: 800;
      color: var(--ai-shadow-color);
      letter-spacing: 0.5px;
    }
  }
}

// 渡渡航空防伪盖章印记
.ac-passport__stamp-dodo {
  border: 3px double rgba(25, 200, 185, 0.4);
  border-radius: 10px;
  color: rgba(25, 200, 185, 0.5);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  padding: 4px 10px;
  transform: rotate(-8deg);
  line-height: 1;
  text-align: center;
  display: flex;
  flex-direction: column;

  .sub {
    font-size: 7px;
    font-weight: 800;
    margin-top: 1px;
  }
}

.ac-passport__card {
  display: flex;
  padding: 28px;
  gap: 28px;
  background: var(--ai-btn-face);
}

// 大头照片框
.ac-passport__photo-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.ac-passport__photo {
  width: 170px;
  height: 170px;
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ac-passport__photo-stamp {
  margin-top: 8px;
  font-size: 9px;
  font-weight: 900;
  color: var(--ai-shadow-color);
  letter-spacing: 1px;
}

.ac-passport__photo-watermark {
  position: absolute;
  right: 10px;
  bottom: 30px;
  font-size: 32px;
  color: rgba(124, 186, 112, 0.22);
  pointer-events: none;
  z-index: 1;
  transform: rotate(15deg);
}

// 信息字段
.ac-passport__details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ac-passport__row {
  display: flex;
  gap: 20px;
}

.ac-passport__item {
  display: flex;
  flex-direction: column;
  flex: 1;

  .label {
    font-size: 9px;
    font-weight: 800;
    color: var(--ai-text-3);
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }

  .value {
    font-size: 15px;
    font-weight: 900;
    color: var(--ai-text);

    &.fruit-color {
      color: var(--ai-red); // 特产色
    }

    &.comment {
      font-style: italic;
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--ai-text);
    }
  }
}

// 胶囊称号
.value-title-wrap {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.title-pill {
  background: var(--ai-warning);
  border: 2px solid var(--ai-outline);
  color: var(--ai-text);
  font-size: 11px;
  font-weight: 900;
  padding: 3px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 0 0 var(--ai-outline);
}

// ============================================
// 9. 露营帐篷/页脚收尾
// ============================================
.island {
  margin-top: 48px;
  padding: 60px 40px 40px;
}

.island-inner {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--ai-btn-face);
  border-radius: 48px;
  border: 3.5px solid var(--ai-outline);
  padding: 48px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 0 0 var(--ai-btn-shadow);
}

// 露营帐篷
.camp-tent-svg {
  width: 90px;
  height: 60px;
  margin: 0 auto 16px;

  svg {
    width: 100%;
    height: 100%;
  }
}

.camp-fire {
  transform-origin: 25px 42px;
  animation: ac-fire-flicker 0.4s ease infinite alternate;
}

@keyframes ac-fire-flicker {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.2); opacity: 1; }
}

.island-title {
  font-size: 34px;
  line-height: 1.1;
  color: var(--ai-text);
  margin: 0 0 12px;
  font-weight: 900;
}

.island-sub {
  color: var(--ai-text-2);
  font-weight: 700;
  max-width: 500px;
  margin: 0 auto 28px;
  font-size: 14px;
  line-height: 1.75;
}

.island-actions { display: inline-flex; gap: 14px; }

.foot {
  text-align: center;
  padding: 24px 0 60px;
  color: var(--ai-text-2);
  font-size: 12px;
  font-weight: 700;
}

// ============================================
// 10. 响应式适配
// ============================================
@media (max-width: 1200px) {
  .modules-pocket { grid-template-columns: repeat(3, 1fr); }
  .hero-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .modules-pocket { grid-template-columns: repeat(2, 1fr); }
  .nav { padding: 12px 20px; gap: 12px; }
  .nav-links { display: none; }
  
  .ac-passport {
    border-radius: 24px;
  }
  
  .ac-passport__card {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .ac-passport__photo {
    width: 150px;
    height: 150px;
  }
  
  .ac-passport__header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .ac-passport__stamp-dodo {
    align-self: flex-end;
  }
}

// ============================================
// 11. 未登录动森移居柜台前台视觉 (Unauth Counter)
// ============================================
.hero--unauth {
  padding-bottom: 90px;
}

.hero-tag--unauth {
  color: #58a032 !important;
  border-color: var(--ai-outline) !important;
}

.hero-avatar-wrap--unauth {
  height: 380px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

// 柜台木质底座
.nook-counter {
  width: 280px;
  height: 120px;
  position: relative;
  z-index: 2;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.nook-counter-top {
  height: 14px;
  background: #a98056;
  border: 3.5px solid var(--ai-outline);
  border-radius: 8px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
}

.nook-counter-body {
  flex: 1;
  background: #eed09d;
  border: 3.5px solid var(--ai-outline);
  border-top: none;
  border-radius: 0 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(121, 79, 39, 0.08);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 8px;
    right: 8px;
    top: 8px;
    border: 2px dashed rgba(121, 79, 39, 0.15);
    border-radius: 8px;
    pointer-events: none;
  }
}

.nook-counter-sign {
  font-size: 13px;
  font-weight: 900;
  color: var(--ai-text);
  background: var(--ai-btn-face);
  border: 2px solid var(--ai-outline);
  border-radius: 8px;
  padding: 4px 10px;
  box-shadow: 0 2.5px 0 0 var(--ai-outline);
  letter-spacing: 1px;
}

// 动森小树叶 Nook 标志
.deco-nook-leaf {
  position: absolute;
  top: 170px;
  left: 60px;
  width: 38px;
  height: 38px;
  z-index: 1;
  transform: rotate(-15deg);
  animation: ac-leaf-sway 4s ease-in-out infinite alternate;
}

@keyframes ac-leaf-sway {
  0% { transform: rotate(-20deg) scale(0.95); }
  100% { transform: rotate(-5deg) scale(1.05); }
}

// Dodo 机票 🎫
.deco-dodo-ticket {
  position: absolute;
  top: 150px;
  right: 60px;
  width: 72px;
  height: 100px;
  background: #fffdf0;
  border: 3px solid var(--ai-outline);
  border-radius: 12px;
  z-index: 1;
  transform: rotate(18deg);
  box-shadow: 0 6px 12px rgba(121, 79, 39, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ac-ticket-bob 5s ease-in-out infinite;

  .ticket-header {
    background: #6a86d8;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    text-align: center;
    padding: 3px 0;
    border-bottom: 2.5px solid var(--ai-outline);
  }

  .ticket-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    position: relative;

    &::before, &::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 8px;
      height: 8px;
      background: #eaf6db; // 默认匹配天空时域的混合
      border: 3px solid var(--ai-outline);
      border-radius: 50%;
    }
    &::before { left: -7px; }
    &::after { right: -7px; }
  }

  .ticket-icon { font-size: 18px; }
  .ticket-text {
    font-size: 9px;
    font-weight: 900;
    color: var(--ai-text);
    background: var(--ai-warning);
    border: 1.5px solid var(--ai-outline);
    border-radius: 4px;
    padding: 1px 4px;
  }
}

@keyframes ac-ticket-bob {
  0%, 100% { transform: rotate(18deg) translateY(0); }
  50% { transform: rotate(14deg) translateY(-10px); }
}

// Timmy & Tommy 对话泡泡
.nook-bubble {
  position: absolute;
  background: #fffdf2;
  border: 3px solid var(--ai-outline);
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 8px 0 rgba(121, 79, 39, 0.05), 0 12px 24px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  z-index: 3;
  width: 250px;

  &::after {
    content: "";
    position: absolute;
    bottom: -13px;
    left: 30px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 10px 0 10px;
    border-color: #fffdf2 transparent transparent transparent;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -17px;
    left: 28px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 12px 0 12px;
    border-color: var(--ai-outline) transparent transparent transparent;
    z-index: -1;
  }

  .nook-bubble-name {
    font-size: 10px;
    font-weight: 900;
    color: var(--ai-primary-active);
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }

  .nook-bubble-content {
    font-size: 12px;
    font-weight: 800;
    color: var(--ai-text);
    line-height: 1.5;
  }

  &--timmy {
    top: 10px;
    left: 20px;
    animation: ac-bubble-float 4.5s ease-in-out infinite alternate;
  }

  &--tommy {
    top: 90px;
    right: 20px;
    width: 140px;
    padding: 8px 12px;
    opacity: 0.85;
    animation: ac-bubble-float-rev 5s ease-in-out infinite alternate;

    &::after {
      left: auto;
      right: 30px;
    }
    &::before {
      left: auto;
      right: 28px;
    }

    .nook-bubble-name {
      color: var(--ai-text-2);
    }

    .nook-bubble-content {
      font-size: 11px;
      font-style: italic;
    }
  }
}

@keyframes ac-bubble-float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-6px) scale(1.02); }
}

@keyframes ac-bubble-float-rev {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(5px) scale(0.98); }
}

// ============================================
// 12. 大头针告示板 (Bulletin Board) 样式
// ============================================
.bulletin-board {
  width: 100%;
  max-width: 720px;
  background: #e5cc9c; // 温暖的软木塞底色
  border: 12px solid #946f48; // 木纹厚边框
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    inset 0 0 20px rgba(78, 54, 30, 0.25),
    0 16px 40px rgba(121, 79, 39, 0.12);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.board-pin {
  position: absolute;
  top: -12px;
  font-size: 20px;
  z-index: 3;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,0.15));

  &.pin-left { left: 40px; transform: rotate(-10deg); }
  &.pin-right { right: 40px; transform: rotate(10deg); }
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 3.5px dashed rgba(121, 79, 39, 0.15);
  padding-bottom: 12px;

  .board-title {
    font-size: 18px;
    font-weight: 900;
    color: var(--ai-text);
    letter-spacing: 1px;
  }
}

.board-birds {
  display: flex;
  gap: 12px;
  margin-top: -14px;
}

.board-bird {
  font-size: 20px;
  animation: ac-bird-sing 0.8s ease infinite alternate;

  &:last-child {
    animation-delay: 0.4s;
    transform: scaleX(-1);
  }
}

@keyframes ac-bird-sing {
  0% { transform: translateY(0) rotate(-4deg); }
  100% { transform: translateY(-4px) rotate(4deg); }
}

.board-body {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 20px;
}

// 告示板便签纸
.board-sticky {
  background: #fffdf0;
  border: 2.5px solid var(--ai-outline);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 4px 6px 0 rgba(78, 54, 30, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;

  .sticky-head {
    font-size: 13px;
    font-weight: 900;
    color: var(--ai-text);
    border-bottom: 1.5px dashed rgba(121, 79, 39, 0.15);
    padding-bottom: 6px;
  }

  .sticky-content {
    font-size: 12px;
    font-weight: 800;
    color: var(--ai-text);
    line-height: 1.6;
    flex: 1;

    strong {
      color: var(--ai-primary-active);
      font-weight: 900;
    }
  }

  .sticky-foot {
    font-size: 10px;
    font-weight: 800;
    color: var(--ai-shadow-color);
    text-align: right;
  }
}

.sticky-tech {
  background: #fdfcee; // 浅黄
  transform: rotate(-2.5deg);
}

.sticky-recruit {
  background: #edfbee; // 浅绿
  transform: rotate(2deg);

  .sticky-content strong {
    color: #6a86d8;
  }
}

// 针对移动端的适配
@media (max-width: 768px) {
  .board-body {
    grid-template-columns: 1fr;
  }
  .sticky-tech, .sticky-recruit {
    transform: none;
  }
  .nook-bubble--tommy {
    display: none;
  }
}
</style>
