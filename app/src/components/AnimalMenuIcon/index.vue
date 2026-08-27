<template>
  <svg
    class="amico"
    :class="{ 'amico--empty': !glyph }"
    :style="style"
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
  >
    <g v-html="glyph" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { PLATFORM_SCRIPT_GLYPHS } from "@/constants/animal-glyphs/platform-script";

defineOptions({ name: "AnimalMenuIcon" });

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
  }>(),
  { size: 18 }
);

const style = computed(() => {
  const sz = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: sz,
    height: sz,
    minWidth: sz,
    display: "inline-block",
    verticalAlign: "middle",
  };
});

/**
 * 动森语义菜单图标 glyph 库（试点 10 个）。
 *
 * - 24×24 画布；inline fill 复用动森色板（color token 见 _animal-menu-icon.scss 的 .amico 变量）。
 * - 描边形状用 class="s"（仅描边）/ class="sf"（描边+填充）。
 * - 会动的子部件带 am-* 类（动效与 hover 触发集中在 _animal-menu-icon.scss）。
 */
const GLYPH_DATABASE: Record<string, string> = {
  // 1 面板主页：小木屋
  "menu-home":
    '<circle class="am-smoke" cx="16.6" cy="6" r="0.9" fill="#cdd6dd"/>' +
    '<circle class="am-smoke2" cx="17.3" cy="4.4" r="0.7" fill="#cdd6dd"/>' +
    '<g class="am-bob">' +
    '<rect class="sf" x="15.6" y="6.4" width="1.9" height="3.2" rx=".5" fill="#c46b4f"/>' +
    '<path class="sf" d="M3.6 12 L12 4.6 L20.4 12 Z" fill="var(--am-orange)"/>' +
    '<rect class="sf" x="6" y="11.5" width="12" height="8.5" rx="1.2" fill="var(--am-wood)"/>' +
    '<rect class="sf" x="10.4" y="14.6" width="3.2" height="5.4" rx=".7" fill="#a9744f"/>' +
    '<rect class="am-glow sf" x="7.3" y="13.4" width="2.7" height="2.7" rx=".5" fill="var(--am-yellow)"/>' +
    "</g>",

  // 2 工作台：显示器/仪表盘
  "menu-workplace":
    '<g class="am-bob">' +
    '<rect class="sf" x="3.5" y="4.5" width="17" height="11.5" rx="2" fill="#dff1f8"/>' +
    '<rect class="sf" x="5.3" y="6.3" width="13.4" height="8" rx="1" fill="#eaf7fc"/>' +
    '<rect class="am-bar1 sf" x="7" y="9" width="1.9" height="4" rx=".4" fill="var(--am-teal)" style="transform-origin:bottom"/>' +
    '<rect class="am-bar2 sf" x="10" y="8" width="1.9" height="5" rx=".4" fill="var(--am-blue)" style="transform-origin:bottom"/>' +
    '<rect class="am-bar3 sf" x="13" y="10" width="1.9" height="3" rx=".4" fill="var(--am-yellow)" style="transform-origin:bottom"/>' +
    '<rect class="am-scan" x="6" y="6.3" width="2.4" height="8" rx="1" fill="#ffffff" opacity=".7"/>' +
    '<path class="s" d="M10 16 L10 19 M14 16 L14 19 M8 19 H16"/>' +
    "</g>" +
    '<circle class="am-glow" cx="18.4" cy="5.4" r="1" fill="var(--am-red)"/>',

  // 3 用户管理：圆脸小动物
  "menu-user":
    '<g class="am-bob">' +
    '<path class="am-ear sf" d="M6.5 7.5 C5 4.5 7 3 8.3 4.8 Z" fill="var(--am-leaf)" style="transform-origin:bottom right"/>' +
    '<path class="am-ear sf" d="M17.5 7.5 C19 4.5 17 3 15.7 4.8 Z" fill="var(--am-leaf)" style="transform-origin:bottom left"/>' +
    '<circle class="sf" cx="12" cy="12" r="6.5" fill="var(--am-wood)"/>' +
    '<ellipse class="am-blink" cx="9.6" cy="11.4" rx="1" ry="1.3" fill="var(--am-stroke)"/>' +
    '<ellipse class="am-blink" cx="14.4" cy="11.4" rx="1" ry="1.3" fill="var(--am-stroke)"/>' +
    '<circle cx="8.4" cy="13.8" r="1.1" fill="var(--am-red)" opacity=".55"/>' +
    '<circle cx="15.6" cy="13.8" r="1.1" fill="var(--am-red)" opacity=".55"/>' +
    '<path class="s" d="M10.6 14.6 Q12 15.8 13.4 14.6"/>' +
    "</g>" +
    '<path class="am-spark" d="M18.5 9 l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="var(--am-yellow)"/>',

  // 4 角色管理：勋章徽章+缎带
  "menu-role":
    '<path class="am-flag sf" d="M9.5 12 L9.5 20 L12 18 L14.5 20 L14.5 12 Z" fill="var(--am-red)" style="transform-origin:top center"/>' +
    '<g class="am-swing" style="transform-origin:12px 4px">' +
    '<circle class="sf" cx="12" cy="9" r="5.5" fill="var(--am-yellow)"/>' +
    '<circle class="sf" cx="12" cy="9" r="3.6" fill="#ffe08a"/>' +
    '<path class="am-spark" d="M12 6.2 l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="var(--am-orange)"/>' +
    "</g>",

  // 5 菜单管理：木牌指示牌
  "menu-menu":
    '<g class="am-swing" style="transform-origin:12px 21px">' +
    '<rect class="sf" x="11" y="6" width="2" height="15" rx="1" fill="#b07c4e"/>' +
    '<g class="am-lite1"><path class="sf" d="M5 7 H15 L17 9 L15 11 H5 Z" fill="var(--am-leaf)"/></g>' +
    '<g class="am-lite2"><path class="sf" d="M19 12 H9 L7 14 L9 16 H19 Z" fill="var(--am-blue)"/></g>' +
    '<g class="am-lite3"><path class="sf" d="M5 17 H14 L16 19 L14 21 H5 Z" fill="var(--am-yellow)"/></g>' +
    "</g>" +
    '<circle class="am-spark" cx="12" cy="6" r=".9" fill="#fff"/>',

  // 6 职级管理：星级阶梯
  "menu-level":
    '<rect class="sf" x="3.5" y="16" width="5" height="4" rx=".8" fill="var(--am-wood)"/>' +
    '<rect class="sf" x="8.5" y="13" width="5" height="7" rx=".8" fill="var(--am-wood)"/>' +
    '<rect class="sf" x="13.5" y="9.5" width="5" height="10.5" rx=".8" fill="#dcae7e"/>' +
    '<path class="am-lite1" d="M6 13.6 l.6 1.3 1.4.2-1 1 .25 1.4-1.25-.7-1.25.7.25-1.4-1-1 1.4-.2z" fill="var(--am-yellow)"/>' +
    '<path class="am-lite2" d="M11 10.6 l.6 1.3 1.4.2-1 1 .25 1.4-1.25-.7-1.25.7.25-1.4-1-1 1.4-.2z" fill="var(--am-orange)"/>' +
    '<path class="am-spark" d="M16 6.4 l.7 1.5 1.6.25-1.15 1.15.3 1.6-1.45-.8-1.45.8.3-1.6L14.7 8.15 16.3 7.9z" fill="var(--am-red)"/>' +
    '<path class="am-hop s" d="M16 13 V19 M14 15 L16 13 L18 15" style="transform-origin:center"/>',

  // 7 岗位管理：桌牌+小旗
  "menu-position":
    '<path class="am-flag sf" d="M17 4 L21 5.5 L17 7 Z" fill="var(--am-red)" style="transform-origin:left center"/>' +
    '<line class="s" x1="17" y1="4" x2="17" y2="9" stroke-width="1.4"/>' +
    '<rect class="sf" x="4.5" y="8" width="15" height="7" rx="1.6" fill="#fffaf0"/>' +
    '<line class="s" x1="7" y1="10.6" x2="17" y2="10.6"/>' +
    '<line class="s" x1="7" y1="12.6" x2="14" y2="12.6"/>' +
    '<rect class="am-sheen" x="5" y="8" width="3" height="7" rx="1" fill="#fff" opacity=".75"/>' +
    '<g class="am-hop"><path class="sf" d="M8 15 L7 19 H17 L16 15 Z" fill="var(--am-wood)"/></g>',

  // 8 部门管理：圆顶小楼
  "menu-dept":
    '<path class="am-flag sf" d="M12 3 L15 4 L12 5 Z" fill="var(--am-red)" style="transform-origin:left center"/>' +
    '<line class="s" x1="12" y1="3" x2="12" y2="6"/>' +
    '<g class="am-bob">' +
    '<path class="sf" d="M6 20 V10 a6 6 0 0 1 12 0 V20 Z" fill="var(--am-blue)"/>' +
    '<rect class="am-lite1 sf" x="8" y="9" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<rect class="am-lite2 sf" x="13.6" y="9" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<rect class="am-lite3 sf" x="8" y="13" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<rect class="am-lite4 sf" x="13.6" y="13" width="2.4" height="2.4" rx=".4" fill="var(--am-yellow)"/>' +
    '<rect class="sf" x="10.6" y="16" width="2.8" height="4" rx=".5" fill="#2f6f96"/>' +
    "</g>",

  // 9 登录日志：时钟+钥匙角标
  "menu-loginlog":
    '<circle class="sf" cx="11" cy="12" r="7.5" fill="#fffaf0"/>' +
    '<line class="am-spin s" x1="11" y1="12" x2="11" y2="7.5" stroke-width="1.6" style="transform-origin:11px 12px"/>' +
    '<line class="am-spinm s" x1="11" y1="12" x2="14.5" y2="12" stroke-width="1.3" style="transform-origin:11px 12px"/>' +
    '<circle cx="11" cy="12" r="1" fill="var(--am-stroke)"/>' +
    '<g class="am-tick" style="transform-origin:11px 4.6px"><line class="s" x1="11" y1="4.6" x2="11" y2="6.4" stroke-width="1.2"/></g>' +
    '<g class="am-glow">' +
    '<circle class="sf" cx="18.5" cy="6.5" r="2.4" fill="var(--am-yellow)"/>' +
    '<circle cx="18.5" cy="6.5" r=".9" fill="var(--am-stroke)"/>' +
    '<path class="s" d="M18.5 8.9 L18.5 11.5 L17.4 11.5 M18.5 10.4 L17.6 10.4" stroke-width="1.1"/>' +
    "</g>",

  // 10 操作日志：羽毛笔+纸卷
  "menu-operlog":
    '<g class="am-unfurl" style="transform-origin:top center">' +
    '<rect class="sf" x="4.5" y="4" width="12" height="16" rx="1.6" fill="#fffaf0"/>' +
    '<line class="s" x1="7" y1="8" x2="13" y2="8"/>' +
    '<line class="s" x1="7" y1="11" x2="13" y2="11"/>' +
    '<line class="s" x1="7" y1="14" x2="11" y2="14"/>' +
    "</g>" +
    '<path class="am-spark s" d="M6.5 17 l1.4 1.4 2.6-2.8" stroke-width="1.6"/>' +
    '<g class="am-write" style="transform-origin:bottom right">' +
    '<path class="sf" d="M13 18 L20 7 C20.6 6 19 4.4 18 5 L11 16 Z" fill="var(--am-leaf)"/>' +
    '<path class="s" d="M16 9.5 L17 11"/>' +
    '<path class="sf" d="M11 16 L13 18 L10.5 18.5 Z" fill="var(--am-yellow)"/>' +
    "</g>",

  // ===== 第二批：可见菜单 15 个 =====

  // 系统管理 /system：齿轮
  "menu-system":
    '<g class="am-spin4" style="transform-box:view-box;transform-origin:12px 12px">' +
    '<rect class="sf" x="10.7" y="2.6" width="2.6" height="18.8" rx="1.3" fill="var(--am-grey)"/>' +
    '<rect class="sf" x="2.6" y="10.7" width="18.8" height="2.6" rx="1.3" fill="var(--am-grey)"/>' +
    '<rect class="sf" x="10.7" y="2.6" width="2.6" height="18.8" rx="1.3" fill="var(--am-grey)" transform="rotate(45 12 12)"/>' +
    '<rect class="sf" x="10.7" y="2.6" width="2.6" height="18.8" rx="1.3" fill="var(--am-grey)" transform="rotate(-45 12 12)"/>' +
    '<circle class="sf" cx="12" cy="12" r="5" fill="#cfd8df"/>' +
    "</g>" +
    '<circle class="am-glow sf" cx="12" cy="12" r="2.4" fill="var(--am-yellow)"/>' +
    '<path class="am-spark" d="M19 4 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>',

  // 会员管理 /member：VIP 卡
  "menu-member":
    '<g class="am-bob">' +
    '<rect class="sf" x="3.5" y="6" width="17" height="12" rx="2.4" fill="var(--am-blue)"/>' +
    '<circle class="sf" cx="8" cy="11.5" r="2.6" fill="var(--am-yellow)"/>' +
    '<rect x="12" y="9.6" width="5.6" height="1.7" rx=".85" fill="#fff"/>' +
    '<rect x="12" y="12.6" width="4" height="1.5" rx=".75" fill="#fff" opacity=".85"/>' +
    "</g>" +
    '<rect class="am-sheen" x="4" y="6" width="3" height="12" rx="1" fill="#fff" opacity=".5"/>' +
    '<path class="am-spark" d="M18.6 4.5 l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="var(--am-yellow)"/>',

  // 开发管理 /develop：代码尖括号
  "menu-develop":
    '<g class="am-bob">' +
    '<rect class="sf" x="3" y="5" width="18" height="14" rx="3.2" fill="var(--am-teal)"/>' +
    '<path class="s" stroke="#fff" stroke-width="1.7" d="M9 9.5 L6 12 L9 14.5"/>' +
    '<path class="s" stroke="#fff" stroke-width="1.7" d="M15 9.5 L18 12 L15 14.5"/>' +
    '<line class="am-glow" stroke="#fff" stroke-width="1.7" stroke-linecap="round" x1="13" y1="8.6" x2="11" y2="15.4"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 4 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>',

  // 设计管理 /design：调色盘 + 画笔
  "menu-design":
    '<g class="am-swing" style="transform-origin:12px 12px">' +
    '<path class="sf" d="M12 4.5 C6.2 4.5 3.5 8 3.5 11.8 C3.5 15.2 6.3 17.2 8.8 16.2 C10.2 15.6 11 16.6 10.6 17.8 C10 19.8 12.2 20.2 14 19 C18.2 16.2 20.5 11.5 19 8 C17.7 5.8 15 4.5 12 4.5 Z" fill="#fffaf0"/>' +
    '<circle class="am-lite1" cx="7.5" cy="10.2" r="1.2" fill="var(--am-red)"/>' +
    '<circle class="am-lite2" cx="10" cy="7.6" r="1.2" fill="var(--am-blue)"/>' +
    '<circle class="am-lite3" cx="13.6" cy="7.7" r="1.2" fill="var(--am-yellow)"/>' +
    '<circle class="am-lite4" cx="16.2" cy="10.2" r="1.2" fill="var(--am-leaf)"/>' +
    "</g>" +
    '<g class="am-wiggle" style="transform-origin:top right">' +
    '<path class="sf" d="M14 20 L20.5 7.5 C21 6.6 19.6 5.2 18.7 5.7 L12 11.5 Z" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M12 11.5 L14 13.5 L11.4 14 Z" fill="var(--am-red)"/>' +
    "</g>",

  // 个人中心 /user：证件卡 + 剪影
  "menu-profile-center":
    '<g class="am-bob">' +
    '<rect class="sf" x="4" y="4" width="16" height="16" rx="3.4" fill="var(--am-wood)"/>' +
    '<circle class="sf" cx="12" cy="10" r="2.9" fill="#fffaf0"/>' +
    '<path class="sf" d="M6.8 18.5 C6.8 14.8 9 13.3 12 13.3 C15 13.3 17.2 14.8 17.2 18.5 Z" fill="#fffaf0"/>' +
    "</g>" +
    '<rect class="am-sheen" x="4.5" y="4" width="3" height="16" rx="1.4" fill="#fff" opacity=".45"/>' +
    '<path class="am-spark" d="M19 5 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>',

  // 会员等级 /member/memberlevel：皇冠
  "menu-memberlevel":
    '<g class="am-bob">' +
    '<path class="sf" d="M4 17.5 L4 8.5 L8.2 12 L12 6 L15.8 12 L20 8.5 L20 17.5 Z" fill="var(--am-yellow)"/>' +
    '<rect class="sf" x="4" y="17.5" width="16" height="2.8" rx=".8" fill="var(--am-yellow)"/>' +
    '<circle class="am-lite1" cx="8" cy="15" r="1" fill="var(--am-red)"/>' +
    '<circle class="am-lite2" cx="12" cy="15" r="1" fill="var(--am-blue)"/>' +
    '<circle class="am-lite3" cx="16" cy="15" r="1" fill="var(--am-leaf)"/>' +
    "</g>" +
    '<path class="am-spark" d="M12 3 l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="var(--am-orange)"/>',

  // 会员管理 /member/member：双人
  "menu-member-list":
    '<g class="am-bob">' +
    '<circle class="sf" cx="15.5" cy="9.5" r="2.6" fill="var(--am-leaf)"/>' +
    '<path class="sf" d="M10.5 19 C10.5 15.2 12.8 13.8 15.5 13.8 C18.2 13.8 20.5 15.2 20.5 19 Z" fill="var(--am-teal)"/>' +
    '<circle class="sf" cx="8.5" cy="9" r="3" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M3 19.5 C3 15.3 5.6 13.6 8.5 13.6 C11.4 13.6 14 15.3 14 19.5 Z" fill="var(--am-blue)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19 4.5 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>',

  // 路径转换 /develop/convert-path：双箭头循环
  "menu-convert-path":
    '<g class="am-spin4" style="transform-box:view-box;transform-origin:12px 12px">' +
    '<path class="s" stroke-width="1.9" d="M6 9.5 A6.5 6.5 0 0 1 17.5 7.8"/>' +
    '<path class="sf" d="M17.8 4.5 L18.6 8.4 L14.7 7.6 Z" fill="var(--am-blue)"/>' +
    '<path class="s" stroke-width="1.9" d="M18 14.5 A6.5 6.5 0 0 1 6.5 16.2"/>' +
    '<path class="sf" d="M6.2 19.5 L5.4 15.6 L9.3 16.4 Z" fill="var(--am-teal)"/>' +
    "</g>" +
    '<circle class="am-glow" cx="12" cy="12" r="1.6" fill="var(--am-yellow)"/>',

  // 模型初始化 /develop/init-model：立方体 + 火花
  "menu-init-model":
    '<g class="am-bob">' +
    '<path class="sf" d="M12 3.5 L19.5 7.8 L12 12 L4.5 7.8 Z" fill="var(--am-blue)"/>' +
    '<path class="sf" d="M4.5 7.8 L12 12 L12 20.5 L4.5 16.2 Z" fill="var(--am-teal)"/>' +
    '<path class="sf" d="M19.5 7.8 L12 12 L12 20.5 L19.5 16.2 Z" fill="#3a8fc4"/>' +
    "</g>" +
    '<path class="am-spark" d="M20 4 l.45 1.2 1.2.45-1.2.45-.45 1.2-.45-1.2-1.2-.45 1.2-.45z" fill="var(--am-yellow)"/>' +
    '<path class="am-spark2" d="M4 13 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 工作平台 /develop/work-platform：仪表盘网格
  "menu-work-platform":
    '<g class="am-bob">' +
    '<rect class="am-lite1 sf" x="4" y="4" width="7" height="7" rx="1.6" fill="var(--am-teal)"/>' +
    '<rect class="am-lite2 sf" x="13" y="4" width="7" height="7" rx="1.6" fill="var(--am-blue)"/>' +
    '<rect class="am-lite3 sf" x="4" y="13" width="7" height="7" rx="1.6" fill="var(--am-yellow)"/>' +
    '<rect class="am-lite4 sf" x="13" y="13" width="7" height="7" rx="1.6" fill="var(--am-leaf)"/>' +
    "</g>",

  // 工作日常 /develop/work-daily：日历 + 对勾
  "menu-work-daily":
    '<g class="am-bob">' +
    '<rect class="sf" x="4" y="5.5" width="16" height="14.5" rx="2.4" fill="#fffaf0"/>' +
    '<path class="sf" d="M4 10 V7.9 a2.4 2.4 0 0 1 2.4 -2.4 H17.6 A2.4 2.4 0 0 1 20 7.9 V10 Z" fill="var(--am-red)"/>' +
    '<line class="s" x1="8" y1="3.5" x2="8" y2="6.5"/>' +
    '<line class="s" x1="16" y1="3.5" x2="16" y2="6.5"/>' +
    '<path class="am-spark s" stroke-width="1.7" d="M8.5 14.5 l2.2 2.2 4.5-4.6"/>' +
    "</g>",

  // 工作文档 /develop/work-doc：折角文档 + 行
  "menu-work-doc":
    '<g class="am-bob">' +
    '<path class="sf" d="M6 3.5 H14 L18 7.5 V20.5 H6 Z" fill="#fffaf0"/>' +
    '<path class="sf" d="M14 3.5 V7.5 H18 Z" fill="var(--am-blue)"/>' +
    '<line class="am-lite1 s" x1="8.5" y1="11" x2="15.5" y2="11"/>' +
    '<line class="am-lite2 s" x1="8.5" y1="14" x2="15.5" y2="14"/>' +
    '<line class="am-lite3 s" x1="8.5" y1="17" x2="12.5" y2="17"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 待办列表 /develop/todo：剪贴板清单
  "menu-todo":
    '<g class="am-bob">' +
    '<rect class="sf" x="4.5" y="4.5" width="15" height="16.5" rx="2.4" fill="var(--am-wood)"/>' +
    '<rect class="sf" x="8.5" y="2.6" width="7" height="3.4" rx="1.3" fill="var(--am-grey)"/>' +
    '<path class="am-lite1 s" stroke-width="1.6" d="M7.5 10 l1.4 1.4 2.4-2.6"/>' +
    '<line class="am-lite1 s" x1="13" y1="9.8" x2="16.5" y2="9.8"/>' +
    '<path class="am-lite2 s" stroke-width="1.6" d="M7.5 14 l1.4 1.4 2.4-2.6"/>' +
    '<line class="am-lite2 s" x1="13" y1="13.8" x2="16.5" y2="13.8"/>' +
    '<path class="am-lite3 s" stroke-width="1.6" d="M7.5 18 l1.4 1.4 2.4-2.6"/>' +
    '<line class="am-lite3 s" x1="13" y1="17.8" x2="16.5" y2="17.8"/>' +
    "</g>",

  // 图片处理 /design/image-process：图片 + 魔棒
  "menu-image-process":
    '<g class="am-bob">' +
    '<rect class="sf" x="3.5" y="5" width="17" height="14" rx="2.4" fill="var(--am-blue)"/>' +
    '<circle cx="8" cy="9.5" r="1.8" fill="var(--am-yellow)"/>' +
    '<path class="sf" d="M4 18.5 L9 12.5 L12.5 16 L15.5 12.8 L20 18.5 Z" fill="var(--am-leaf)"/>' +
    '<rect class="am-sheen" x="4" y="5" width="3.2" height="14" rx="1.4" fill="#fff" opacity=".5"/>' +
    "</g>" +
    '<g class="am-wiggle" style="transform-origin:bottom left">' +
    '<line class="s" stroke-width="2" x1="14" y1="16" x2="20.5" y2="9.5"/>' +
    '<path class="am-spark" d="M21 6.5 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>' +
    "</g>",

  // 个人资料 /user/profile：头像 + 资料行
  "menu-profile":
    '<g class="am-bob">' +
    '<circle class="sf" cx="8.5" cy="9.5" r="3.4" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M3.5 19 C3.5 15.2 5.8 13.7 8.5 13.7 C11.2 13.7 13.5 15.2 13.5 19 Z" fill="var(--am-blue)"/>' +
    '<line class="am-lite1 s" x1="15" y1="8.5" x2="20.5" y2="8.5"/>' +
    '<line class="am-lite2 s" x1="15" y1="11.5" x2="20.5" y2="11.5"/>' +
    '<line class="am-lite3 s" x1="15" y1="14.5" x2="18.5" y2="14.5"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 4.5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // ===== 第三批：隐藏模块 17 个（小程序 / 烟草 / 用户详情） =====

  // 小程序管理 /mini-program：手机
  "menu-mini-program":
    '<g class="am-bob">' +
    '<rect class="sf" x="6" y="2.5" width="12" height="19" rx="3" fill="var(--am-teal)"/>' +
    '<rect x="7.8" y="5.5" width="8.4" height="11" rx="1" fill="#eafaf8"/>' +
    '<circle class="am-glow" cx="12" cy="8.5" r="1.6" fill="var(--am-blue)"/>' +
    '<rect x="9.4" y="11" width="2" height="2" rx=".5" fill="var(--am-yellow)"/>' +
    '<rect x="12.6" y="11" width="2" height="2" rx=".5" fill="var(--am-red)"/>' +
    '<circle cx="12" cy="19" r=".9" fill="var(--am-grey)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 4 l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="var(--am-yellow)"/>',

  // 壁纸分类 /mini-program/wallpaper-classify：文件夹 + 风景
  "menu-wallpaper-classify":
    '<g class="am-bob">' +
    '<path class="sf" d="M3.5 7 H9 L11 9 H20.5 V19 H3.5 Z" fill="var(--am-blue)"/>' +
    '<rect class="sf" x="5" y="10" width="14" height="8" rx="1" fill="#dff1f8"/>' +
    '<circle cx="8" cy="13" r="1.2" fill="var(--am-yellow)"/>' +
    '<path d="M5.5 18 L9 14 L11.5 16.5 L14 14 L18.5 18 Z" fill="var(--am-leaf)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 壁纸管理 /mini-program/wallpaper：风景画
  "menu-wallpaper":
    '<g class="am-bob">' +
    '<rect class="sf" x="3.5" y="5" width="17" height="14" rx="2.4" fill="var(--am-blue)"/>' +
    '<circle cx="8" cy="9.5" r="1.8" fill="var(--am-yellow)"/>' +
    '<path class="sf" d="M4 18.5 L9 12.5 L12.5 16 L15.5 12.8 L20 18.5 Z" fill="var(--am-leaf)"/>' +
    '<rect class="am-sheen" x="4" y="5" width="3.2" height="14" rx="1.4" fill="#fff" opacity=".5"/>' +
    "</g>",

  // 笔记分类 /mini-program/notebook-category：文件夹 + 行
  "menu-notebook-category":
    '<g class="am-bob">' +
    '<path class="sf" d="M3.5 7 H9 L11 9 H20.5 V19 H3.5 Z" fill="var(--am-yellow)"/>' +
    '<rect class="sf" x="6" y="10.5" width="12" height="7.5" rx="1" fill="#fffaf0"/>' +
    '<line class="am-lite1 s" x1="8" y1="13" x2="16" y2="13"/>' +
    '<line class="am-lite2 s" x1="8" y1="15.5" x2="13" y2="15.5"/>' +
    "</g>",

  // 笔记标签 /mini-program/notebook-label：标签
  "menu-notebook-label":
    '<g class="am-swing" style="transform-origin:top right">' +
    '<path class="sf" d="M4 11 L11 4 H19 a1 1 0 0 1 1 1 V13 L13 20 Z" fill="var(--am-red)"/>' +
    '<circle class="sf" cx="16" cy="8" r="1.4" fill="#fff"/>' +
    "</g>" +
    '<path class="am-spark" d="M5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 笔记管理 /mini-program/notebook：笔记本
  "menu-notebook":
    '<g class="am-bob">' +
    '<rect class="sf" x="5" y="3.5" width="14" height="17" rx="2" fill="var(--am-teal)"/>' +
    '<rect x="8" y="3.5" width="11" height="17" fill="#fffaf0"/>' +
    '<line class="s" x1="8" y1="3.5" x2="8" y2="20.5"/>' +
    '<line class="am-lite1 s" x1="11" y1="8" x2="16.5" y2="8"/>' +
    '<line class="am-lite2 s" x1="11" y1="11" x2="16.5" y2="11"/>' +
    '<line class="am-lite3 s" x1="11" y1="14" x2="14" y2="14"/>' +
    "</g>",

  // 相册分类 /mini-program/photo-category：文件夹 + 拍立得
  "menu-photo-category":
    '<g class="am-bob">' +
    '<path class="sf" d="M3.5 7 H9 L11 9 H20.5 V19.5 H3.5 Z" fill="var(--am-blue)"/>' +
    '<rect class="sf" x="6" y="9.5" width="7.5" height="7.5" rx=".8" fill="#fff" transform="rotate(-8 9.75 13.25)"/>' +
    '<rect class="sf" x="10.5" y="10" width="7.5" height="7.5" rx=".8" fill="#fff" transform="rotate(8 14.25 13.75)"/>' +
    '<rect x="11.5" y="11" width="5.5" height="4" fill="var(--am-leaf)" transform="rotate(8 14.25 13)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 相册管理 /mini-program/photo：相机
  "menu-photo":
    '<g class="am-bob">' +
    '<path class="sf" d="M8 7 L9.5 4.8 H14.5 L16 7 Z" fill="var(--am-grey)"/>' +
    '<rect class="sf" x="3.5" y="7" width="17" height="12" rx="2.5" fill="var(--am-grey)"/>' +
    '<circle class="sf" cx="12" cy="13" r="3.6" fill="var(--am-blue)"/>' +
    '<circle class="am-glow" cx="12" cy="13" r="1.6" fill="#fff"/>' +
    '<rect x="16.5" y="8.5" width="2.2" height="1.8" rx=".5" fill="var(--am-yellow)"/>' +
    "</g>" +
    '<path class="am-spark" d="M5 5.5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 烟草管理 /tobacco：叶片
  "menu-tobacco":
    '<g class="am-swing" style="transform-box:view-box;transform-origin:12px 21px">' +
    '<path class="sf" d="M12 21 C12 21 4 16 4 9 C4 5 8 3 12 3 C16 3 20 5 20 9 C20 16 12 21 12 21 Z" fill="var(--am-leaf)"/>' +
    '<path class="s" d="M12 20 V6"/>' +
    '<path class="s" d="M12 10 L8.5 7.5 M12 13 L15.5 10.5 M12 8 L9.5 9.5"/>' +
    "</g>" +
    '<path class="am-spark" d="M18 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 客户数据 /tobacco/tobacco-customer：人 + 柱状
  "menu-tobacco-customer":
    '<g class="am-bob">' +
    '<circle class="sf" cx="8.5" cy="8.5" r="3" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M3.5 18 C3.5 14.2 5.8 12.8 8.5 12.8 C11.2 12.8 13.5 14.2 13.5 18 Z" fill="var(--am-blue)"/>' +
    '<rect class="am-lite1 sf" x="15" y="13" width="2" height="5" rx=".5" fill="var(--am-teal)"/>' +
    '<rect class="am-lite2 sf" x="18" y="10" width="2" height="8" rx=".5" fill="var(--am-yellow)"/>' +
    "</g>" +
    '<path class="am-spark" d="M19.5 5 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 订货数据 /tobacco/tobacco-order：小票
  "menu-tobacco-order":
    '<g class="am-bob">' +
    '<path class="sf" d="M6 3 H18 V21 L16 19.5 L14 21 L12 19.5 L10 21 L8 19.5 L6 21 Z" fill="#fffaf0"/>' +
    '<line class="am-lite1 s" x1="9" y1="8" x2="15" y2="8"/>' +
    '<line class="am-lite2 s" x1="9" y1="11" x2="15" y2="11"/>' +
    '<line class="am-lite3 s" x1="9" y1="14" x2="13" y2="14"/>' +
    "</g>",

  // 1024定点 /tobacco/tobacco-designated：定位针
  "menu-tobacco-designated":
    '<g class="am-bob">' +
    '<path class="sf" d="M12 3 C8.5 3 6 5.5 6 9 C6 13.5 12 21 12 21 C12 21 18 13.5 18 9 C18 5.5 15.5 3 12 3 Z" fill="var(--am-red)"/>' +
    '<circle class="am-glow" cx="12" cy="9" r="2.2" fill="#fff"/>' +
    "</g>" +
    '<path class="am-spark" d="M18.5 6 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>',

  // 补供数据 /tobacco/tobacco-supplement：箱 + 加号
  "menu-tobacco-supplement":
    '<g class="am-bob">' +
    '<path class="sf" d="M3.5 7.5 L12 4 L20.5 7.5 L12 11 Z" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M3.5 7.5 L12 11 V20 L3.5 16.5 Z" fill="#d9a878"/>' +
    '<path class="sf" d="M20.5 7.5 L12 11 V20 L20.5 16.5 Z" fill="#c69060"/>' +
    "</g>" +
    '<g class="am-glow">' +
    '<circle class="sf" cx="18" cy="6" r="3" fill="var(--am-leaf)"/>' +
    '<path class="s" stroke="#fff" stroke-width="1.4" d="M18 4.4 V7.6 M16.4 6 H19.6"/>' +
    "</g>",

  // 云烟补供 /tobacco/tobacco-yun：云
  "menu-tobacco-yun":
    '<g class="am-bob">' +
    '<path class="sf" d="M7.5 17 A3.6 3.6 0 0 1 7 9.9 A5 5 0 0 1 16.6 8.7 A3.3 3.3 0 0 1 16.8 17 Z" fill="#cfe6f5"/>' +
    "</g>" +
    '<path class="am-spark" d="M11 20 l.35 .95 .95.35-.95.35-.35.95-.35-.95-.95-.35.95-.35z" fill="var(--am-yellow)"/>' +
    '<path class="am-spark2" d="M16 20 l.3 .8 .8.3-.8.3-.3.8-.3-.8-.8-.3.8-.3z" fill="var(--am-yellow)"/>',

  // 供货限量 /tobacco/tobacco-supply：箱 + 仪表
  "menu-tobacco-supply":
    '<g class="am-bob">' +
    '<path class="sf" d="M4.5 9 L7 6 H17 L19.5 9 Z" fill="#d9a878"/>' +
    '<rect class="sf" x="4.5" y="9" width="15" height="11" rx="2" fill="var(--am-wood)"/>' +
    '<path class="s" d="M8 16.5 A4 4 0 0 1 16 16.5"/>' +
    '<line class="am-tick s" x1="12" y1="16.5" x2="14.5" y2="14.5" stroke-width="1.4" style="transform-box:view-box;transform-origin:12px 16.5px"/>' +
    "</g>",

  // 订货检查 /tobacco/tobacco-order-inspect：文档 + 放大镜
  "menu-tobacco-order-inspect":
    '<g class="am-bob">' +
    '<rect class="sf" x="4" y="3.5" width="11" height="15" rx="1.6" fill="#fffaf0"/>' +
    '<line class="s" x1="6.5" y1="7" x2="12" y2="7"/>' +
    '<line class="s" x1="6.5" y1="10" x2="11" y2="10"/>' +
    "</g>" +
    '<g class="am-wiggle" style="transform-origin:center">' +
    '<circle class="sf" cx="15" cy="13" r="4" fill="#dff1f8" opacity=".9"/>' +
    '<circle class="am-glow" cx="15" cy="13" r="1.6" fill="#fff"/>' +
    '<line class="s" x1="18" y1="16" x2="21" y2="19" stroke-width="2"/>' +
    "</g>",

  // 用户详情 /system/user/info：用户 + 放大镜
  "menu-user-info":
    '<g class="am-bob">' +
    '<circle class="sf" cx="10" cy="8.5" r="3" fill="var(--am-wood)"/>' +
    '<path class="sf" d="M4.5 17.5 C4.5 13.8 7 12.3 10 12.3 C13 12.3 15.5 13.8 15.5 17.5 Z" fill="var(--am-blue)"/>' +
    "</g>" +
    '<g class="am-wiggle" style="transform-origin:center">' +
    '<circle class="sf" cx="16.5" cy="15" r="3.4" fill="#dff1f8" opacity=".9"/>' +
    '<circle class="am-glow" cx="16.5" cy="15" r="1.4" fill="#fff"/>' +
    '<line class="s" x1="19" y1="17.4" x2="21.3" y2="19.7" stroke-width="2"/>' +
    "</g>",

  // 平台脚本专属动森图标（由 @/constants/animal-glyphs/platform-script 模块化维护）
  ...PLATFORM_SCRIPT_GLYPHS,
};

const glyph = computed<string>(() => GLYPH_DATABASE[props.name] || "");
</script>
