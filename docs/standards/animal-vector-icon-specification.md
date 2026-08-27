# 动森风格矢量图标设计与生成规范 (Animal Island Vector Icon Specification)

> **适用范围**：`blog-ui-vue3` 全站后台菜单、工具栏、业务卡片、平台脚本及操作模块的矢量 SVG 图标设计与代码生成。  
> **版本**：v1.0 (2026-08)  
> **相关实现**：`app/src/components/AnimalMenuIcon/index.vue`、`app/src/styles/_animal-menu-icon.scss`、`app/src/constants/animal-glyphs/`

---

## 1. 核心设计哲学 (Design Philosophy)

1. **动森美学**：温暖大地色系 + 大圆角与饱满曲线 + 暖棕轮廓描边 + 具象化游戏意象（如小木屋、NookPhone、铃钱袋、绿叶、勋章等）。
2. **极轻量与无损**：纯 SVG 矢量节点，无外部位图依赖，任意 DPI 与尺寸下绝不失真，打包零额外网络开销。
3. **静动结合**：静止态保持干净简约、沉静素雅；在 `:hover`（图标自身 / 父级卡片 / 菜单行 / 表格行）时触发 2~3 个错峰复合微动效。
4. **统一分层与模块化**：图标数据与组件渲染分离，按业务域收敛于 `src/constants/animal-glyphs/` 字典中。

---

## 2. 几何与画布契约 (Canvas & Geometry)

所有矢量图标必须严格遵守以下几何契约：

| 属性 | 规范值 | 说明 |
| :--- | :--- | :--- |
| **画布视口 (viewBox)** | `0 0 24 24` | 严禁使用其他比例或尺寸，基准尺寸 24×24 |
| **安全边距** | 1.5px ~ 2px | 核心几何图形约束在 `[3, 3, 21, 21]` 内部，防止动画与描边被切边 |
| **描边宽度** | `1.3px` | 统一线宽，保持全站视觉重心一致 |
| **线端与拐角** | `stroke-linecap="round"` `stroke-linejoin="round"` | 必须为圆头与圆角，禁止任何尖锐直角 |
| **描边基类** | `class="s"` / `class="sf"` | `s`: 仅描边；`sf`: 描边 + 填充 |

---

## 3. 色彩系统与 CSS 变量 (Color Tokens)

图标内部颜色必须使用全局动森 CSS 变量或指定的辅助安全色，**严禁使用纯黑 (`#000000`) 或冷灰**：

### 3.1 核心 Token 色板（由 `.amico` 注入）

```scss
--am-stroke: #543d2b; // 暖深棕描边（统一外轮廓与关键结构线）
--am-wood:   #e8c39e; // 原木暖沙色（墙体、桌台、木牌、底座）
--am-blue:   #4ea5d9; // 天空微蓝（卡片、屏幕、数据、流转）
--am-red:    #ff4d6d; // 浆果红/珊瑚红（丝带、印记、小旗、告警）
--am-grey:   #b8c4cf; // 浅灰石纹（烟囱、金属扣、边框）
--am-teal:   #48a9a6; // Nook 薄荷青绿（手机壳、主色背景）
--am-yellow: #ffcc3b; // 铃钱金黄（金币、钱袋、皇冠、星徽）
--am-leaf:   #7bd138; // 动森绿叶（屋顶、徽章、叶片、植物）
--am-orange: #ff7b54; // 夕阳暖橙（闪烁星、暖光、砖瓦）
--am-green:  #45b649; // 草木深绿（阴影、深色叶片）
```

### 3.2 常用辅助直值颜色

- `#fffaf0`：象牙米白（纸张、证书、NookPhone 屏幕底色、高光底面）。
- `#ffe08a`：柔和淡金（铃钱币面、勋章内环、金色反光）。
- `#dff1f8`：浅冰蓝（对话气泡、屏幕扫光区、窗户玻璃）。
- `#cdd6dd`：烟圈淡灰（炊烟、蒸汽微粒）。
- `#a9744f` / `#b07c4e`：深原木色（门窗套、木柱、支架）。

---

## 4. 图层分层与动效类名契约 (Layering & Motion System)

每个图标按功能拆分为 3~4 个语义图层，通过标准的 CSS 动效类名实现交互：

```
[Icon 根容器 (24×24)]
 ├── 1. 背景微粒层 (Background)  ── 如烟囱炊烟 (.am-smoke, .am-smoke2)
 ├── 2. 主体呼吸层 (Main Body)    ── 包裹在 <g class="am-bob"> 或 <g class="am-swing"> 中
 ├── 3. 细节与透光层 (Details)    ── 窗口逐级点亮 (.am-lite1 ~ .am-lite4)、屏幕扫光 (.am-sheen)
 └── 4. 前景高光与星闪层 (FX)     ── 悬浮钥匙/印记 (.am-glow)、四角闪星 (.am-spark, .am-spark2)
```

### 4.1 常用动效类名清单

| 类名 | 动效形式 | 推荐使用场景 |
| :--- | :--- | :--- |
| `am-bob` | 上下呼吸微浮动（幅度 ~2.4px） | 图标主体房屋、钱袋、手机、卡片等 |
| `am-smoke` / `am-smoke2` | 炊烟升腾淡出（错峰延迟） | 烟囱、咖啡杯、烹饪锅、温泉 |
| `am-glow` | 呼吸发光与透明度渐变 | 钥匙锁角标、指示灯、警报、核心徽记 |
| `am-spark` / `am-spark2` | 四角星旋转缩放闪烁（0.3x ~ 1.0x） | 铃钱币、奖牌、对勾、成功状态 |
| `am-swing` | 左右摆动（角度 ±7°） | 钱袋系带、木牌吊牌、旗帜、摇摆挂件 |
| `am-sheen` / `am-scan` | 屏幕横向平移亮光 | NookPhone 屏幕、显示器、玻璃扫光 |
| `am-lite1` ~ `am-lite4` | 依次递进点亮（错峰 0.2s） | 窗户灯光、数据柱状图、条目列表 |
| `am-ear` / `am-wiggle` | 局部倾斜摆动 | 动物耳朵、画笔书写、放大镜探查 |
| `am-spin` / `am-spin4` | 360° 匀速顺时针旋转 | 时钟指针、齿轮、循环同步箭头 |

> ⚠️ **关键规则**：动效全部基于纯 CSS `@keyframes`（位于 `_animal-menu-icon.scss`）。所有子部件自动声明 `transform-box: fill-box; transform-origin: center;`，严禁在 SVG 中写死 SMIL 动画或行内 `@keyframes`。

---

## 5. 图标代码规范与目录组织 (File & Code Structure)

### 5.1 目录组织原则

```
app/src/
 ├── constants/
 │    └── animal-glyphs/                # 业务专属动森矢量图标字典
 │         ├── platform-script.ts       # 平台脚本图标字典
 │         └── <domain>.ts              # 其他模块拓展字典
 ├── components/
 │    └── AnimalMenuIcon/
 │         ├── index.vue                # 动森矢量图标统一渲染组件
 │         └── ...
 ├── styles/
 │    └── _animal-menu-icon.scss        # 全局色板、描边基类与 @keyframes 动效
 └── utils/
      └── menuSemanticIcon.ts           # 语义图标名集合与路由映射
```

### 5.2 图标定义范例 (`constants/animal-glyphs/platform-script.ts`)

```ts
export const PLATFORM_SCRIPT_GLYPHS: Record<string, string> = {
  // 意象说明：办事小楼 + 绿叶徽章 + 烟囱炊烟 + 闪烁铃钱金币
  "script-corporate-credit":
    '<circle class="am-smoke" cx="17.6" cy="5" r="0.8" fill="#cdd6dd"/>' +
    '<circle class="am-smoke2" cx="18.2" cy="3.6" r="0.6" fill="#cdd6dd"/>' +
    '<g class="am-bob">' +
    '<rect class="sf" x="16.5" y="5.2" width="1.8" height="3" rx=".4" fill="#c46b4f"/>' +
    '<path class="sf" d="M3.5 11 L12 4.2 L20.5 11 Z" fill="var(--am-leaf)"/>' +
    '<rect class="sf" x="5.5" y="10.5" width="13" height="9.5" rx="1.2" fill="var(--am-wood)"/>' +
    '<rect class="sf" x="10" y="14" width="4" height="6" rx=".6" fill="#a9744f"/>' +
    '<rect class="am-lite1 sf" x="7.2" y="12.2" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<rect class="am-lite2 sf" x="14.4" y="12.2" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<circle class="sf" cx="12" cy="8.2" r="1.4" fill="#fffaf0"/>' +
    '<path d="M12 7.3 C11.3 7.3 11.3 8.5 12 8.9 C12.7 8.5 12.7 7.3 12 7.3 Z" fill="var(--am-leaf)"/>' +
    "</g>" +
    '<g class="am-glow">' +
    '<circle class="sf" cx="19" cy="6" r="2.2" fill="var(--am-yellow)"/>' +
    '<circle cx="19" cy="6" r=".8" fill="var(--am-stroke)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 3.5 l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="var(--am-orange)"/>',
};
```

### 5.3 业务页面调用方式

```html
<template>
  <div class="ps-script-card__icon-wrap">
    <AnimalMenuIcon name="script-corporate-credit" :size="24" />
  </div>
</template>

<script setup lang="ts">
import AnimalMenuIcon from "@/components/AnimalMenuIcon/index.vue";
</script>
```

---

## 6. AI 生成动森矢量图标提示词模板 (AI Generation Prompt)

当需要新增或替换图标时，可直接使用以下标准提示词模板调用大模型生成：

```text
你是一个专业的《集合啦！动物森友会》风格 UI 矢量图形设计师。请为以下业务场景设计一个动森风格的 SVG 矢量图标片段：

【业务名称】：[例如：数据同步中心]
【业务描述】：[例如：多渠道数据定时同步与管道传输]
【核心意象】：[例如：动森木箱 + 双向循环箭头 + 绿叶标签]

【严格技术与视觉规范】：
1. 画布：严格限制在 24x24 viewBox 内（viewBox="0 0 24 24"），核心图形落在 [3,3] 到 [21,21] 之间。
2. 描边与填充：描边统一使用 class="sf"（描边+填充）或 class="s"（仅描边），线宽 1.3px，圆头圆角。描边颜色由系统注入 var(--am-stroke)。
3. 颜色系统（必须使用以下 CSS 变量）：
   - var(--am-wood) 原木暖沙
   - var(--am-teal) Nook 薄荷青绿
   - var(--am-yellow) 铃钱金黄
   - var(--am-leaf) 动森绿叶
   - var(--am-red) 浆果珊瑚红
   - var(--am-blue) 天空微蓝
   - var(--am-orange) 夕阳暖橙
   - #fffaf0 象牙米白底、#ffe08a 浅金高亮、#dff1f8 浅蓝透光
4. 动态分层类名（必须包含 2~3 个动效部件）：
   - 主体包裹在 <g class="am-bob"> 或 <g class="am-swing"> 中；
   - 局部高光/发光使用 <g class="am-glow">；
   - 闪烁星芒使用 <path class="am-spark" d="...">；
   - 扫光或点亮使用 class="am-sheen" 或 class="am-lite1" / class="am-lite2"。
5. 输出格式要求：
   - 仅输出纯 SVG inner XML 字符串（即 <circle...><g class="am-bob">... 等标签，不要包含外层 <svg> 标签）。
   - 保持代码紧凑简洁，字符串拼接格式清晰。
```

---

## 7. 检查清单与反例速查 (Checklist & Anti-Patterns)

| 检查项 | ❌ 严禁出现 | ✅ 正确规范 |
| :--- | :--- | :--- |
| **画布尺寸** | `viewBox="0 0 1024 1024"` 或 `32x32` | 统一 `viewBox="0 0 24 24"` |
| **描边颜色** | `stroke="#000"` 或 `stroke="#333"` | `class="s"` / `class="sf"`（由 `--am-stroke: #543d2b` 统一控制） |
| **拐角形状** | 尖锐直角 `stroke-linejoin="miter"` | `stroke-linejoin="round"` `stroke-linecap="round"` |
| **动画实现** | 嵌入 `<animate>` 或 `<animateTransform>` | 纯 CSS 类名（`am-bob`, `am-glow`, `am-spark`） |
| **图标意象** | 冰冷无趣的抽象科技几何 | 具象温暖的动森道具/建筑/小动物生活化意象 |
| **色彩饱和** | 刺眼荧光色或冷灰蓝 | 温暖大地色、原木色、马卡龙粉彩与奶油米白 |
| **图层溢出** | 元素坐标 `< 0` 或 `> 24` | 严格在安全区内留出 1.5~2px 边距 |
