/**
 * 平台脚本专属动森风格矢量图标库
 *
 * @description
 * 遵循《动森矢量图标规范》(docs/standards/animal-vector-icon-specification.md)：
 * - 24×24 画布 (viewBox="0 0 24 24")
 * - 动森标准色板 (stroke: #543d2b, wood, teal, yellow, red, leaf, orange 等)
 * - 关键帧微动效子部件 (.am-bob, .am-glow, .am-spark, .am-smoke, .am-swing, .am-sheen 等)
 */

export const PLATFORM_SCRIPT_GLYPHS: Record<string, string> = {
  // 1 企业贷/授信数据：动森办事小楼 + 绿叶徽章 + 烟囱炊烟 + 闪烁铃钱金币
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

  // 2 个经贷放款/推送：经典动森铃钱袋 + 红丝带 + 星星徽记 + 溢出金币
  "script-loan-disburse":
    '<g class="am-bob">' +
    '<path class="am-swing sf" d="M9.5 7 C9.5 5.5 14.5 5.5 14.5 7 C16 7 16 8.6 14.5 8.6 H9.5 C8 8.6 8 7 9.5 7 Z" fill="var(--am-red)" style="transform-origin:12px 7px"/>' +
    '<path class="sf" d="M8.2 7.8 H15.8 C18 7.8 20 10.5 20 14.5 C20 18.8 16.5 20.8 12 20.8 C7.5 20.8 4 18.8 4 14.5 C4 10.5 6 7.8 8.2 7.8 Z" fill="var(--am-yellow)"/>' +
    '<circle class="sf" cx="12" cy="14.2" r="3.2" fill="#ffe08a"/>' +
    '<path class="am-spark sf" d="M12 12.2 l.5 1.3 1.4.2-1 1 .25 1.4-1.15-.7-1.15.7.25-1.4-1-1 1.4-.2z" fill="var(--am-orange)"/>' +
    '<circle class="am-lite1 sf" cx="17.6" cy="9.2" r="1.8" fill="#ffe08a"/>' +
    '<circle class="am-lite2 sf" cx="6.4" cy="9.2" r="1.8" fill="#ffe08a"/>' +
    "</g>" +
    '<path class="am-spark" d="M19 4 l.45 1.2 1.2.45-1.2.45-.45 1.2-.45-1.2-1.2-.45 1.2-.45z" fill="var(--am-yellow)"/>' +
    '<path class="am-spark2" d="M4.5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 3 验证码手机修改：动森 NookPhone + 验证码对话框 + 钥匙锁角标
  "script-phone-code":
    '<g class="am-bob">' +
    '<rect class="sf" x="5" y="3" width="14" height="18.5" rx="3.2" fill="var(--am-teal)"/>' +
    '<rect class="sf" x="6.8" y="5.2" width="10.4" height="11.5" rx="1.4" fill="#fffaf0"/>' +
    '<rect class="am-sheen sf" x="8" y="7.2" width="8" height="4.6" rx="1.2" fill="#dff1f8"/>' +
    '<circle cx="9.8" cy="9.5" r=".75" fill="var(--am-blue)"/>' +
    '<circle cx="12" cy="9.5" r=".75" fill="var(--am-blue)"/>' +
    '<circle cx="14.2" cy="9.5" r=".75" fill="var(--am-blue)"/>' +
    '<circle cx="12" cy="19" r="1.1" fill="#fffaf0"/>' +
    "</g>" +
    '<g class="am-glow">' +
    '<circle class="sf" cx="17.6" cy="5.4" r="2.6" fill="var(--am-yellow)"/>' +
    '<circle cx="17.6" cy="5.4" r="1" fill="var(--am-stroke)"/>' +
    '<path class="s" d="M17.6 8 L17.6 10.6 L16.5 10.6 M17.6 9.4 L16.7 9.4" stroke-width="1.1"/>' +
    "</g>" +
    '<path class="am-spark" d="M4.5 5.5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',
};

export type PlatformScriptGlyphName = keyof typeof PLATFORM_SCRIPT_GLYPHS;
