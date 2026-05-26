/**
 * 动森风格图标管理器
 * 
 * @description
 * 包含完整登记的 42 个动森风格拼图卡片矢量图标。
 * 支持根据原始菜单名称/路由路径/标题关键词进行高准确度模糊匹配。
 */

export const ANIMAL_ICON_NAMES: string[] = [
  // --- 第一行 ---
  "icon-fishrod",
  "icon-net",
  "icon-axe",
  "icon-shovel",
  "icon-watering",
  "icon-slingshot",
  "icon-ladder",
  // --- 第二行 ---
  "icon-leaf",
  "icon-tshirt",
  "icon-bellbag",
  "icon-present",
  "icon-coinbag",
  "icon-diy",
  "icon-fruit",
  // --- 第三行 ---
  "icon-fish",
  "icon-butterfly",
  "icon-fossil",
  "icon-painting",
  "icon-tulip",
  "icon-maple",
  "icon-rock",
  // --- 第四行 ---
  "icon-passport",
  "icon-mail",
  "icon-map",
  "icon-camera",
  "icon-location",
  "icon-key",
  "icon-variant",
  // --- 第五行 ---
  "icon-miles",
  "icon-needle",
  "icon-rabbit",
  "icon-tent",
  "icon-helicopter",
  "icon-coffee",
  "icon-kk",
  // --- 第六行 ---
  "icon-settings",
  "icon-pot",
  "icon-brush",
  "icon-sprout",
  "icon-hook",
  "icon-net-bug",
  "icon-chair",
];

const ANIMAL_ICON_SET = new Set<string>(ANIMAL_ICON_NAMES);

/**
 * 智能关键词 ➔ 动森拼图卡片图标的模糊匹配映射正则库。
 */
const KEYWORD_RULES: Array<[RegExp, string]> = [
  // 1. 系统核心 & 仪表盘 & 首页 ➔ icon-home / icon-helicopter (地图)
  [/(dashboard|home|house|index|weather|travel|trip|fly)/, "icon-tent"],
  
  // 2. 文章管理 & 发布管理 & 核心业务 ➔ icon-leaf / icon-miles (斜叶)
  [/(article|content|post|news|blog|publish|draft|write)/, "icon-leaf"],
  [/(miles|score|grade|point)/, "icon-miles"],
  
  // 3. 财务管理 & 充值 & 钱包 & 订单 ➔ icon-bellbag / icon-coinbag (小袋)
  [/(pay|order|wallet|money|finance|billing|cost)/, "icon-bellbag"],
  [/(coin|cash|bag|deposit|debt|bank)/, "icon-coinbag"],
  [/(stock|investment|shares|report|stat|chart|analysis|turnip)/, "icon-bellbag"], // 兼容原有大头菜

  // 4. 用户 & 角色 & 社交 & 好友 ➔ icon-friends / icon-rabbit (猫头鹰傅达)
  [/(role|permission|auth|lock|key|secure|axe)/, "icon-axe"], // 权限安全
  [/(user|member|people|person|group|account|profile)/, "icon-passport"],
  [/(friend|link|social|friends|union|partner)/, "icon-mail"], // 友情信件
  [/(author|about|ai|assistant|helper|service|rabbit)/, "icon-rabbit"], // 傅达猫头鹰

  // 5. 系统设置 & 参数配置 ➔ icon-settings / icon-chair / icon-ladder
  [/(setting|manage|operation|system|config|gear|tool|develop|code|terminal|init|convert)/, "icon-settings"],
  [/(theme|skin|wardrobe|visual|layout|style|chair)/, "icon-chair"], 
  [/(ladder|step|up|level)/, "icon-ladder"],

  // 6. 知识库 & 文档 & 归档 ➔ icon-painting / icon-fossil
  [/(doc|wiki|knowledge|lib|book|manual|painting)/, "icon-painting"],
  [/(history|backup|archive|log|timeline|fossil)/, "icon-fossil"], // 历史/化石头骨

  // 7. 附件 & 画廊 & 相册 ➔ icon-camera
  [/(photo|picture|image|camera|wallpaper|gallery|album|media|attachment|upload)/, "icon-camera"],

  // 8. 定时任务 & 调度 ➔ icon-watering
  [/(job|cron|time|schedule|watering|plant|crop)/, "icon-watering"],

  // 9. 通知 & 每日广播 ➔ icon-slingshot
  [/(notice|broadcast|announcement|publish-notice|slingshot)/, "icon-slingshot"],

  // 10. 友情信件 & 反馈 ➔ icon-mail
  [/(mail|email|feedback|letter|message-board)/, "icon-mail"],

  // 11. 开发者常用工具/网络/清理 ➔ icon-shovel / icon-needle / icon-fish
  [/(shovel|clean|cache|garbage|clear)/, "icon-shovel"],
  [/(net|api|gateway|route-rule|filter)/, "icon-net"],
  [/(fish|stream|data-flow|channel)/, "icon-fish"],
  [/(needle|sew|thread|connect)/, "icon-needle"],

  // 12. 星级/收藏/置顶 ➔ icon-key
  [/(star|collect|recommend|top|best|key)/, "icon-key"],

  // 13. 缺陷 & 异常管理 ➔ icon-net-bug
  [/(bug|debug|error|exception)/, "icon-net-bug"],

  // 14. 关于本站 ➔ icon-location / icon-map
  [/(about|site|map|location|position|place|region)/, "icon-map"],
  [/(compass|guide-map|explore|redirect)/, "icon-location"],

  // 15. 音频播放器 ➔ icon-kk
  [/(music|play|audio|video|media|kk|guitar)/, "icon-kk"],

  // 16. 工艺制造 & 其它 ➔ icon-pot / icon-brush / icon-sprout / icon-hook
  [/(pot|cook|kitchen)/, "icon-pot"],
  [/(brush|draw|paint)/, "icon-brush"],
  [/(sprout|grow|plant)/, "icon-sprout"],
  [/(hook|link|joint)/, "icon-hook"],
];

/**
 * 将任意字符串稳定散列到 42 个动森图标之一，保证哪怕无任何映射也绝不报错且平滑分配
 */
function hashToAnimalIcon(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) {
    sum = (sum + seed.charCodeAt(i)) % 1000;
  }
  return ANIMAL_ICON_NAMES[sum % ANIMAL_ICON_NAMES.length];
}

/**
 * 将菜单原值智能散列匹配为最新的 42 个动森卡通插画图标之一
 * 
 * @param icon 菜单原始图标名
 * @param seed 辅助映射种子 (如标题、路径)
 * @returns 动森图标名字符串
 */
export function resolveAnimalIcon(icon?: string | null, seed?: string | null): string {
  const raw = (icon ?? "").trim();

  // 已经是有效动森图标，直接返回
  if (ANIMAL_ICON_SET.has(raw)) {
    return raw;
  }

  const normalized = raw
    .replace(/^el-icon-?/, "")
    .replace(/^i-svg:?/, "")
    .toLowerCase();
  const haystack = `${normalized} ${(seed ?? "").toLowerCase()}`;

  for (const [pattern, name] of KEYWORD_RULES) {
    if (pattern.test(haystack)) {
      return name;
    }
  }

  // 兜底散列
  return hashToAnimalIcon(haystack.trim() || "menu");
}
