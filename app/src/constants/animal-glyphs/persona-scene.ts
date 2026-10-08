/**
 * 个人中心场景切换专属动森风格矢量图标库
 *
 * @description
 * 遵循《动森矢量图标规范》(docs/standards/animal-vector-icon-specification.md)：
 * - 24×24 画布 (viewBox="0 0 24 24")
 * - 动森标准色板 (stroke: #543d2b, yellow, orange, blue 等)
 * - 关键帧微动效子部件 (.am-bob, .am-glow, .am-spark, .am-spin, .am-lite 等)
 */

export const PERSONA_SCENE_GLYPHS: Record<string, string> = {
  // 清晨：海平面上升起的半个太阳 + 晨光 + 一道海浪
  "scene-morning":
    '<path class="am-glow s" d="M12 6V7.8 M6.3 9.4 L7.6 10.7 M17.7 9.4 L16.4 10.7"/>' +
    '<g class="am-bob">' +
    '<path class="sf" d="M7 15.5 A5 5 0 0 1 17 15.5 Z" fill="var(--am-yellow)"/>' +
    "</g>" +
    '<path class="s" d="M3.5 15.5 H20.5"/>' +
    '<path class="am-lite1 s" d="M6.5 18.8 C8 17.8 9.5 19.8 11 18.8 S14 17.8 15.5 18.8 S17.5 19.4 17.5 18.8" style="stroke:var(--am-blue)"/>',

  // 白天：正午的太阳 + 旋转光芒 + 高光
  "scene-day":
    '<g class="am-spin4" style="transform-box:view-box;transform-origin:12px 12px">' +
    '<path class="s" d="M12 3.5V5.4 M12 18.6V20.5 M3.5 12H5.4 M18.6 12H20.5 M6 6L7.3 7.3 M16.7 16.7L18 18 M6 18L7.3 16.7 M16.7 7.3L18 6"/>' +
    "</g>" +
    '<circle class="sf" cx="12" cy="12" r="4.4" fill="var(--am-yellow)"/>' +
    '<circle class="am-glow" cx="10.6" cy="10.6" r="1.1" fill="#fffaf0"/>',

  // 黄昏：沉入海面的橙色落日 + 两道水面倒影
  "scene-dusk":
    '<g class="am-bob">' +
    '<path class="sf" d="M7 13.5 A5 5 0 0 1 17 13.5 Z" fill="var(--am-orange)"/>' +
    "</g>" +
    '<path class="s" d="M3.5 13.5 H20.5"/>' +
    '<path class="am-lite1 s" d="M8 16.6 H16" style="stroke:var(--am-orange)"/>' +
    '<path class="am-lite2 s" d="M10 19.4 H14" style="stroke:var(--am-orange)"/>',

  // 夜晚：弯月 + 闪烁星星
  "scene-night":
    '<g class="am-bob">' +
    '<path class="sf" d="M19.2 12.63 A7.2 7.2 0 1 1 11.37 4.8 A5.6 5.6 0 0 0 19.2 12.63 Z" fill="#ffe08a"/>' +
    "</g>" +
    '<path class="am-spark" d="M17.6 4 l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="var(--am-yellow)"/>' +
    '<circle class="am-glow" cx="20.2" cy="9.2" r=".8" fill="var(--am-yellow)"/>',

  // 自动：跟随当前时间的小时钟
  "scene-auto":
    '<circle class="sf" cx="12" cy="12" r="7.8" fill="#fffaf0"/>' +
    '<g class="am-spin" style="transform-box:view-box;transform-origin:12px 12px">' +
    '<path class="s" d="M12 12 V7.4"/>' +
    "</g>" +
    '<g class="am-spinm" style="transform-box:view-box;transform-origin:12px 12px">' +
    '<path class="s" d="M12 12 H15.2"/>' +
    "</g>" +
    '<circle cx="12" cy="12" r="1" fill="var(--am-stroke)"/>',
};
