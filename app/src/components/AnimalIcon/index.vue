<template>
  <svg
    class="animal-ico"
    :class="{ 'animal-ico--badge': !plain, 'animal-ico--plain': plain }"
    :style="style"
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
  >
    <!-- 彻底去掉外框底盒，直接以 100% 大尺寸渲染图案内容，色彩通过 SCSS 穿透进行拟真着色 -->
    <g
      class="glyph-group"
      v-html="glyphPath"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "AnimalIcon",
});

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    plain?: boolean;
  }>(),
  {
    size: 18,
    plain: false,
  }
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
 * 动森 42 款纯手绘卡通插画 SVG 数据集 (高度复刻用户图片)
 */
const GLYPH_DATABASE: Record<string, string> = {
  // --- 第一行 ---
  "icon-fishrod":
    '<path class="svg-stroke" d="M3 21C3 13 8 7 19 3" fill="none" stroke-width="1.8" />' +
    '<path class="svg-fill-wood svg-stroke" d="M3 21l3-3" stroke-width="2.5" />' +
    '<path class="svg-stroke" d="M19 3c.5 1.5.5 3-1 6.5s-2 5-1 7.5" fill="none" stroke-width="1.2" />' +
    '<path class="svg-fill-blue svg-stroke" d="M15.5 15.2a1.8 1.8 0 102.8.5 1.8 1.8 0 00-2.8-.5z" />',
  
  "icon-net":
    '<path class="svg-fill-wood svg-stroke" d="M9 15L3 21" stroke-width="2.5" />' +
    '<ellipse class="svg-fill-white svg-stroke" cx="14" cy="9.5" rx="5.5" ry="3.8" transform="rotate(-30 14 9.5)" opacity="0.8" />' +
    '<path class="svg-stroke" d="M16.5 11c0 2.5-.8 5-2.5 6.5s-2.5 1.5-3.5.8" fill="none" stroke-width="1.6" />',
  
  "icon-axe":
    '<path class="svg-fill-wood svg-stroke" d="M11 13L4 20" stroke-width="2.5" />' +
    '<path class="svg-fill-grey svg-stroke" d="M9.8 4.8l8.2 4.2-4.2 6.2-6.2-3.8z" />' +
    '<path class="svg-stroke" d="M9.8 8l4.2 3.2" stroke-width="1.5" />',
  
  "icon-shovel":
    '<path class="svg-fill-wood svg-stroke" d="M11 13L7 17" stroke-width="2.2" />' +
    '<path class="svg-fill-red svg-stroke" d="M6 18c-.8.8-2 0-2-.8l1-3.5a1 1 0 011-.8h1.2" />' +
    '<path class="svg-fill-grey svg-stroke" d="M12.5 11.2l6-6-3-3-5 5c-1 1-1 3.5.5 5l1.5 2z" />',
  
  "icon-watering":
    '<path class="svg-fill-teal svg-stroke" d="M6 10h10a4 4 0 014 4v3a2 2 0 01-2 2H8a4 4 0 01-4-4v-3a2 2 0 012-2z" />' +
    '<path class="svg-fill-yellow svg-stroke" d="M19 12l2.5-1.8M21 9v2.5" stroke-width="1.6" />' +
    '<path class="svg-stroke" d="M11 10V6a2 2 0 00-2-2H6" fill="none" stroke-width="1.8" />',
  
  "icon-slingshot":
    '<path class="svg-fill-wood svg-stroke" d="M12 13v7" stroke-width="2.8" />' +
    '<path class="svg-fill-wood svg-stroke" d="M12 13L7 8M12 13l5-5" stroke-width="2.2" />' +
    '<path class="svg-stroke" d="M6.5 8.5C9 11 15 11 17.5 8.5" fill="none" stroke-width="1.8" />' +
    '<circle class="svg-fill-yellow svg-stroke" cx="12" cy="7.5" r="1.8" />',
  
  "icon-ladder":
    '<path class="svg-fill-wood svg-stroke" d="M6 4l10 14M9 3l10 14" stroke-width="2" />' +
    '<path class="svg-stroke" d="M8 7l3 2M10 11l3 2M12 15l3 2" stroke-width="2.2" stroke-linecap="round" />',

  // --- 第二行 ---
  "icon-leaf":
    '<path class="svg-fill-leaf svg-stroke" d="M3.7 13.9C2.4 11.2 2.7 7.9 4.7 5.7c2.2-2.4 5.9-2.9 8.7-1.2 1.3.8 2.7.5 3.5-.3.8-.8 1.9-1.2 3.1-.9.8.2 1.3 1 1 1.8-.3 1.2-.8 2.3-1.6 3.1-.8.8-1.1 2.2-.3 3.5 1.7 2.8 1.2 6.5-1.2 8.7-2.4 2.2-6.1 2.2-8.5 0L7.6 18c-1-.9-2.5-.9-3.5 0-.4.4-.8.4-1.2.1s-.5-.8-.2-1.2c.4-.4.8-1.1 1-1.8V15c-.2-.4-.2-.8-.1-1.1zm11.3-3.4c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z" />',
  
  "icon-tshirt":
    '<path class="svg-fill-blue svg-stroke" d="M6 7l3-3 3 1.5L15 4l3 3v4c0 3-2 5-6 7s-6-4-6-7V7z" />' +
    '<path class="svg-fill-white" d="M12 8c1 0 1.8.8 1.8 1.8S13 11.5 12 11.5s-1.8-.8-1.8-1.8S11 8 12 8z" opacity="0.95" />',
  
  "icon-bellbag":
    '<path class="svg-fill-yellow svg-stroke" d="M16.5 8c.8-1.5 2-2.5 3-2 .8.4 1 1.7.5 3.2L16.5 8zM7.5 8c-.8-1.5-2-2.5-3-2-.8.4-1 1.7-.5 3.2L7.5 8z" />' +
    '<path class="svg-fill-yellow svg-stroke" d="M12 5a1.8 1.8 0 110-3.6A1.8 1.8 0 0112 5z" />' +
    '<path class="svg-fill-yellow svg-stroke" d="M12 8a4.5 4.5 0 00-4 1.5C5.8 10.3 5 12 5 14.5A5.5 5.5 0 0010.5 20h3A5.5 5.5 0 0019 14.5c0-2.5-.8-4.2-3-5z" />' +
    '<path class="svg-fill-wood" d="M12 11.5l.8 1.8 2 .3-1.4 1.4.3 2-1.7-.9-1.7.9.3-2-1.4-1.4 2-.3.8-1.8z" />',
  
  "icon-present":
    '<rect class="svg-fill-white svg-stroke" x="5" y="11" width="14" height="10" rx="1.5" />' +
    '<path class="svg-fill-red svg-stroke" d="M4 8h16v3H4z" />' +
    '<path class="svg-fill-red svg-stroke" d="M11 8h2v13h-2z" />' +
    '<path class="svg-fill-red svg-stroke" d="M8.5 8C7 5 5.5 5.5 5.5 6.5s1.2 1.5 3 1.5zm7 0c1.5-3 3-2.5 3-1.5s-1.2 1.5-3 1.5z" />',
  
  "icon-coinbag":
    '<path class="svg-fill-yellow svg-stroke" d="M12 7c-2.5 0-4 1.5-4 3.5A4.5 4.5 0 0012.5 15H14A4.5 4.5 0 0018.5 10.5c0-2-.8-3.5-3-3.5z" />' +
    '<circle class="svg-fill-wood" cx="12" cy="11.2" r="1.2" />' +
    '<path class="svg-stroke" d="M9.5 8.2s1-.8 2.5-.2" fill="none" stroke-width="1.5" />',
  
  "icon-diy":
    '<rect class="svg-fill-yellow svg-stroke" x="4" y="4" width="16" height="16" rx="2" />' +
    '<path class="svg-fill-grey svg-stroke" d="M9 11.5l3.5 3.5 3-3-3.5-3.5z" />' +
    '<path class="svg-fill-wood svg-stroke" d="M10.2 12.8L7.5 15.5a1 1 0 001.4 1.4l2.7-2.7" stroke-width="2" />',
  
  "icon-fruit":
    '<path class="svg-fill-red svg-stroke" d="M12 6.5C10 5.2 6.2 5.5 5.2 8.5c-.8 3 1.2 7 6.8 9.5 5.5-2.5 7.6-6.5 6.8-9.5C18 5.5 14 5.2 12 6.5z" />' +
    '<path class="svg-stroke" d="M12 6V3.5c1 0 1.8.8 2.5 1.2" fill="none" stroke-width="1.8" />' +
    '<path class="svg-fill-leaf" d="M13.5 4.2c1.2-.5 2 0 2 .8s-.8 1-2 .2z" />',

  // --- 第三行 ---
  "icon-fish":
    '<path class="svg-fill-leaf svg-stroke" d="M2.5 12c1.5-3.5 5-4.5 8.5-3 2.5 1 4.2 3.5 6 3.5.8-.3.8-2 1.2-2.5.4.8.4 3 0 3.8-.4.8-.4-2-1.2-2.5-1.8 0-3.5 2.5-6 3.5-3.5 1.5-7 .5-8.5-3.3z" />' +
    '<circle cx="16" cy="11.2" r="0.8" fill="#543d2b" />',
  
  "icon-butterfly":
    '<ellipse class="svg-fill-yellow svg-stroke" cx="7.5" cy="8.2" rx="4.5" ry="3" transform="rotate(-40 7.5 8.2)" />' +
    '<ellipse class="svg-fill-yellow svg-stroke" cx="16.5" cy="8.2" rx="4.5" ry="3" transform="rotate(40 16.5 8.2)" />' +
    '<ellipse class="svg-fill-yellow svg-stroke" cx="8.5" cy="14.8" rx="3.5" ry="2.2" transform="rotate(-15 8.5 14.8)" />' +
    '<ellipse class="svg-fill-yellow svg-stroke" cx="15.5" cy="14.8" rx="3.5" ry="2.2" transform="rotate(15 15.5 14.8)" />' +
    '<ellipse class="svg-fill-wood svg-stroke" cx="12" cy="11.2" rx="1.5" ry="6.2" />' +
    '<path class="svg-stroke" d="M10.8 5.5c-.8-1.5-2-2-2-2M13.2 5.5c.8-1.5 2-2 2-2" fill="none" stroke-width="1.5" />',
  
  "icon-fossil":
    '<path class="svg-fill-white svg-stroke" d="M6 13.5c0-3.5 2.5-6.5 6-6.5s6 3 6 6.5c0 2-1 3.5-2.2 4.2v2.8a1.2 1.2 0 01-1.2 1.2H9.4a1.2 1.2 0 01-1.2-1.2v-2.8c-1.2-.7-2.2-2.2-2.2-4.2z" />' +
    '<ellipse class="svg-fill-wood" cx="9.5" cy="12.5" rx="1.5" ry="2" />' +
    '<ellipse class="svg-fill-wood" cx="14.5" cy="12.5" rx="1.5" ry="2" />' +
    '<circle cx="12" cy="16.2" r="1.1" fill="#543d2b" />',
  
  "icon-painting":
    '<rect class="svg-fill-yellow svg-stroke" x="4" y="5" width="16" height="14" rx="2" />' +
    '<path class="svg-fill-blue svg-stroke" d="M5 14l3.5-3.5L13 15l4.5-5.5L19 14v4H5z" />' +
    '<circle class="svg-fill-yellow" cx="7.5" cy="8.5" r="1.5" />',
  
  "icon-tulip":
    '<path class="svg-fill-red svg-stroke" d="M12 14.5c2.5 0 4-2.8 4-5.5-1 1-2.5 1-4-1.5-1.5 2.5-3 2.5-4 1.5 0 2.7 1.5 5.5 4 5.5z" />' +
    '<path class="svg-fill-leaf svg-stroke" d="M12 14.5v5.5M8 18.5c1-1 3-1.5 4-2M16 18.5c-1-1-3-1.5-4-2" stroke-width="2.2" stroke-linecap="round" />',
  
  "icon-maple":
    '<path class="svg-fill-orange svg-stroke" d="M12 4.5l2 2.5 3-.5-1 3 2.5 2-3 .5.5 3.5-4-2-4 2 .5-3.5-3-.5 2.5-2-1-3 3 .5z" />' +
    '<path class="svg-stroke" d="M12 14.5V20" stroke-width="2" stroke-linecap="round" />',
  
  "icon-rock":
    '<path class="svg-fill-grey svg-stroke" d="M5 11c0-3.5 2.8-6 6.5-6s6.5 2.5 6.5 6c0 1.2-.5 2.5-1.2 3.5L15.5 19H8.5L7.2 14.5c-.7-1-1.2-2.3-1.2-3.5z" />' +
    '<path class="svg-stroke" d="M8 8.5l3 3M15 15.5l-3-3" opacity="0.6" stroke-linecap="round" />',

  // --- 第四行 ---
  "icon-passport":
    '<rect class="svg-fill-blue svg-stroke" x="5" y="4" width="14" height="16" rx="2" />' +
    '<circle class="svg-fill-yellow svg-stroke" cx="12" cy="10" r="3.2" />' +
    '<circle class="svg-fill-wood" cx="12" cy="9" r="1" />' +
    '<path class="svg-stroke" d="M9 13.5h6" stroke-width="1.8" stroke-linecap="round" />',
  
  "icon-mail":
    '<path class="svg-fill-yellow svg-stroke" d="M3.2 8.5L12 14.5l8.8-6M3 7h18v11H3z" />' +
    '<path class="svg-fill-white svg-stroke" d="M7.5 7.5h9v3.5h-9z" opacity="0.9" />',
  
  "icon-map":
    '<path class="svg-fill-yellow svg-stroke" d="M3.5 5.5l5.5-2.5 6 2.5L20.5 3v12.5l-5.5 2.5-6-2.5L3.5 15.5z" />' +
    '<path class="svg-fill-blue svg-stroke" d="M9 11.2c2 .5 3.5-1.5 5-1s2.5 2 2.5 2.5v3.5c0-.5-1-2-2.5-2.5s-3 1.5-5 1v-3.5z" />' +
    '<path class="svg-stroke" d="M9 3v12.5m6-12.5v12.5" stroke-dasharray="1.5,1.5" />',
  
  "icon-camera":
    '<rect class="svg-fill-grey svg-stroke" x="3.5" y="7" width="17" height="11" rx="2.5" />' +
    '<circle class="svg-fill-blue svg-stroke" cx="12" cy="12.5" r="3.8" />' +
    '<circle cx="12" cy="12.5" r="1.5" fill="#543d2b" />' +
    '<rect class="svg-fill-yellow" x="16.5" y="8.2" width="2.2" height="1.8" rx="0.5" />',
  
  "icon-location":
    '<ellipse class="svg-fill-leaf svg-stroke" cx="12" cy="18" rx="8" ry="3.5" />' +
    '<path class="svg-fill-red svg-stroke" d="M12 4.5C9.5 4.5 7.5 6.5 7.5 9c0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5c0-2.5-2-4.5-4.5-4.5z" />' +
    '<circle cx="12" cy="9" r="1.5" fill="#fff" opacity="0.9" />',
  
  "icon-key":
    '<circle class="svg-fill-yellow svg-stroke" cx="16.5" cy="7.5" r="4.5" />' +
    '<circle cx="16.5" cy="7.5" r="1.8" fill="#543d2b" />' +
    '<path class="svg-fill-yellow svg-stroke" d="M13.2 10.8L4.2 19.8l1.8 1.8.9-.9V19h1.8v-1.8h.9l1.8-1.8" />',
  
  "icon-variant":
    '<rect class="svg-fill-grey svg-stroke" x="5.5" y="3.5" width="13" height="17" rx="3.5" />' +
    '<rect class="svg-fill-leaf" x="7.5" y="6" width="9" height="10" rx="1.5" />' +
    '<path class="svg-fill-white" d="M12 8c.8 0 1.2.5 1.2 1s-.5.7-1.2.7-1.2-.2-1.2-.7.4-1 1-1z" />' +
    '<circle class="svg-fill-yellow" cx="9.5" cy="18.5" r="1" />' +
    '<circle class="svg-fill-yellow" cx="14.5" cy="18.5" r="1" />',

  // --- 第五行 ---
  "icon-miles":
    '<path class="svg-fill-leaf svg-stroke" d="M3.2 8.5C4 5.2 6.5 3.5 9.5 4.2c2.2.5 3.5 2.2 4.2 4.2.8.8 1.5 1.2 2.5 1 1-.2 1.8.2 1.8.9s-.5 1.2-1.5 1.5c-1 .2-1.8 1-2 2 .5 1.2 1 2.2.5 3.2s-1.8 1.5-3.8 1.2L8.2 16.8c-.8-.5-1.5-.2-2 .5s-.8.8-1.5.5c-.8-.3-.8-1 .2-1.8L5.5 14c-.5-.8-.8-1.5-.8-2.2v-1.8c-.8-.5-1.2-1-1.3-1.5z" />',
  
  "icon-needle":
    '<path class="svg-fill-red svg-stroke" d="M12 18.5c-2.5-.5-4-2.5-2.5-4.5s3.5 0 2.5 2.5z" fill="none" stroke-width="1.8" />' +
    '<path class="svg-fill-grey svg-stroke" d="M20 4.5l-15.5 15.5" stroke-width="2.5" stroke-linecap="round" />' +
    '<ellipse cx="18.2" cy="6.2" rx="1" ry="1" fill="#fff" />',
  
  "icon-rabbit":
    '<path class="svg-fill-wood svg-stroke" d="M12 21.5c-4.8 0-8-3.5-8-8 0-3 1.5-4.5 3-5 0-.8.2-2.5.5-3.5.5-.5 1-.8 1.8-.8h5.4c.8 0 1.2.3 1.8.8.3 1 .5 2.7.5 3.5 1.5.5 3 2 3 5a8 8 0 01-8 8z" />' +
    '<ellipse class="svg-fill-yellow svg-stroke" cx="8.5" cy="11.8" rx="2.5" ry="3.2" />' +
    '<ellipse class="svg-fill-yellow svg-stroke" cx="15.5" cy="11.8" rx="2.5" ry="3.2" />' +
    '<circle cx="8.5" cy="11.8" r="0.8" fill="#543d2b" />' +
    '<circle cx="15.5" cy="11.8" r="0.8" fill="#543d2b" />' +
    '<path class="svg-fill-leaf svg-stroke" d="M12 15l1.5-1.5h-3z" />',
  
  "icon-tent":
    '<path class="svg-fill-yellow svg-stroke" d="M12 3.5L3 19.5h18L12 3.5z" />' +
    '<path class="svg-fill-red svg-stroke" d="M12 3.5v3M12 6.5h2.2L12 3.5" />' +
    '<path class="svg-fill-wood" d="M9 19.5l3-7 3 7z" />',
  
  "icon-helicopter":
    '<path class="svg-fill-blue svg-stroke" d="M12 2.2C10 2.2 9 4.2 9 6.5V11l-7 1.5v2.8l7-1v4.8l-3 1.2V22l5-1.5 5 1.5v-1.8l-3-1.2v-4.8l7 1v-2.8L15 11V6.5c0-2.3-1-4.3-3-4.3z" />',
  
  "icon-coffee":
    '<path class="svg-fill-white svg-stroke" d="M5 8.5h11a3.5 3.5 0 013.5 3.5v2.5a3.5 3.5 0 01-3.5 3.5H5a2 2 0 01-2-2v-5.5A2 2 0 015 8.5z" />' +
    '<path class="svg-fill-white svg-stroke" d="M17 10h2c1 0 1.8.8 1.8 1.8v1.4c0 1-.8 1.8-1.8 1.8h-2" />' +
    '<ellipse class="svg-fill-wood" cx="10.5" cy="11.8" rx="4.8" ry="1.5" />' +
    '<path class="svg-stroke" d="M8 5s.8-1.8 0-3M11 5s.8-1.8 0-3M14 5s.8-1.8 0-3" fill="none" stroke-width="1.5" stroke-linecap="round" />' +
    '<ellipse class="svg-fill-white svg-stroke" cx="11" cy="19.5" rx="8" ry="1.8" opacity="0.9" />',
  
  "icon-kk":
    '<path class="svg-fill-yellow svg-stroke" d="M6 13.5c-2.2-2.2-2.2-5.5 0-7.7s5.5-2.2 7.7 0c.5.5.8 1.2.8 1.8L19.5 3l1.5 1.5-4.8 4.8c.8.3 1.2.8 1.8.8 2.2 2.2 2.2 5.5 0 7.7s-5.5 2.2-7.7 0c-.5-.5-.8-1.2-.8-1.8L4.5 21 3 19.5l4.8-4.8c-.8-.3-1.2-.8-1.8-.8z" />' +
    '<circle cx="10.5" cy="10.5" r="1.5" fill="#543d2b" />',

  // --- 第六行 ---
  "icon-settings":
    '<rect class="svg-fill-wood svg-stroke" x="3" y="14" width="18" height="6" rx="1.5" />' +
    '<line class="svg-stroke" x1="6" y1="20" x2="6" y2="23" stroke-width="2.5" stroke-linecap="round" />' +
    '<line class="svg-stroke" x1="18" y1="20" x2="18" y2="23" stroke-width="2.5" stroke-linecap="round" />' +
    '<path class="svg-fill-white svg-stroke" d="M7.5 10.5h6v3.5h-6z" opacity="0.9" />' +
    '<circle class="svg-fill-blue svg-stroke" cx="17.2" cy="10.2" r="1.5" />',
  
  "icon-pot":
    '<path class="svg-fill-grey svg-stroke" d="M4.5 10h15c.5 0 .8.5.8.8v6.4c0 2-2 3.8-4.8 3.8H8.5c-2.8 0-4.8-1.8-4.8-3.8v-6.4c0-.3.3-.8.8-.8z" />' +
    '<circle class="svg-fill-grey svg-stroke" cx="3" cy="13" r="1.8" />' +
    '<circle class="svg-fill-grey svg-stroke" cx="21" cy="13" r="1.8" />' +
    '<path class="svg-stroke" d="M6 21.5L4 23.5M18 21.5l2 2" stroke-width="2.5" stroke-linecap="round" />' +
    '<path class="svg-fill-red" d="M9 22.5c0-1.8 1-2.5 1.5-2.5s1.5.8 1.5 2.5M12 22.5c0-1.8 1-2.5 1.5-2.5s1.5.8 1.5 2.5" opacity="0.9" />',
  
  "icon-brush":
    '<path class="svg-fill-wood svg-stroke" d="M6 18L18 6m-2.5-2.5L20.5 8" stroke-width="2.2" stroke-linecap="round" />' +
    '<path class="svg-fill-grey svg-stroke" d="M15.5 8.5L8 16c-.5.5-.5 1.2 0 1.8l.8.8c.5.5 1.2.5 1.8 0l7.5-7.5-2.6-2.6z" />' +
    '<path class="svg-fill-red" d="M6.5 19.5c-.8.8-2 0-2-.8l1-3.5a1 1 0 011-.8h1.2" opacity="0.95" />',
  
  "icon-sprout":
    '<path class="svg-fill-wood svg-stroke" d="M4 21c0-4.5 3.5-5.5 8-5.5s8 1 8 5.5H4z" />' +
    '<path class="svg-fill-leaf svg-stroke" d="M12 15.5V10c-1.8 0-3.5-1-4.5-2.5 1 2 2.8 2.5 4.5 2.5M12 10c1.8 0 3.5-1 4.5-2.5-1 2-2.8 2.5-4.5 2.5" stroke-width="1.8" />',
  
  "icon-hook":
    '<path class="svg-fill-grey svg-stroke" d="M14.5 4.5V14c0 3-1.8 5-4.5 5s-4.5-2-4.5-4h2.2c0 1.2 1 1.8 2.3 1.8s2.3-.8 2.3-2.8V4.5" stroke-width="2" stroke-linejoin="round" fill="none" />' +
    '<circle class="svg-fill-grey svg-stroke" cx="14.5" cy="4.5" r="1.5" />',
  
  "icon-net-bug":
    '<path class="svg-fill-wood svg-stroke" d="M9 15L3 21" stroke-width="2.5" />' +
    '<ellipse class="svg-fill-white svg-stroke" cx="14" cy="9.5" rx="5.5" ry="3.8" transform="rotate(-30 14 9.5)" opacity="0.8" />' +
    '<path class="svg-stroke" d="M16.5 11c0 2.5-.8 5-2.5 6.5s-2.5 1.5-3.5.8" fill="none" stroke-width="1.6" />' +
    '<circle class="svg-fill-red svg-stroke" cx="19.5" cy="6.5" r="1.8" />' +
    '<circle cx="19.5" cy="6.5" r="0.6" fill="#fff" />',
  
  "icon-chair":
    '<rect class="svg-fill-wood svg-stroke" x="5" y="12" width="14" height="3" rx="1" />' +
    '<line class="svg-stroke" x1="7" y1="15" x2="7" y2="22" stroke-width="2.2" stroke-linecap="round" />' +
    '<line class="svg-stroke" x1="17" y1="15" x2="17" y2="22" stroke-width="2.2" stroke-linecap="round" />' +
    '<path class="svg-fill-wood svg-stroke" d="M6 3.5V12M18 3.5V12" stroke-width="2.2" stroke-linecap="round" />' +
    '<line class="svg-stroke" x1="7" y1="7.5" x2="17" y2="7.5" stroke-width="1.8" stroke-linecap="round" />',
};

const currentIconData = computed<string>(() => {
  return GLYPH_DATABASE[props.name] || "";
});

const glyphPath = computed<string>(() => {
  return currentIconData.value;
});
</script>

<style scoped lang="scss">
.animal-ico {
  flex-shrink: 0;
  vertical-align: middle;
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animal-ico--badge {
  cursor: pointer;
  
  &:hover {
    transform: scale(1.15) translateY(-0.8px);
  }

  // 动森特色极简配色主题，在彩色徽章模式下穿透渲染内部 SVG
  :deep(.svg-stroke) {
    stroke: #543d2b !important;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  :deep(.svg-fill-wood) { fill: #e8c39e !important; }
  :deep(.svg-fill-blue) { fill: #4ea5d9 !important; }
  :deep(.svg-fill-red) { fill: #ff4d6d !important; }
  :deep(.svg-fill-grey) { fill: #b8c4cf !important; }
  :deep(.svg-fill-teal) { fill: #48a9a6 !important; }
  :deep(.svg-fill-yellow) { fill: #ffcc3b !important; }
  :deep(.svg-fill-leaf) { fill: #7bd138 !important; }
  :deep(.svg-fill-white) { fill: #ffffff !important; }
  :deep(.svg-fill-orange) { fill: #ff7b54 !important; }
  :deep(.svg-fill-green) { fill: #45b649 !important; }
}

.animal-ico--plain {
  // 单色极简模式：去掉背景彩色，描边改 currentColor，填充改 none
  :deep(.svg-stroke) {
    stroke: currentColor !important;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  :deep([class^="svg-fill-"]) {
    fill: none !important;
  }
}
</style>
