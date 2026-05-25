<!-- 复制组件 -->
<template>
  <el-button link :style="style" @click="handleClipboard">
    <slot>
      <el-icon><DocumentCopy color="var(--el-color-primary)" /></el-icon>
    </slot>
  </el-button>
</template>

<script setup lang="ts">
import { message } from "@/utils/feedback";
defineOptions({
  name: "CopyButton",
  inheritAttrs: false,
});

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  style: {
    type: Object,
    default: () => ({}),
  },
});

function handleClipboard() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // 使用 Clipboard API
    navigator.clipboard.writeText(props.text).then(
      () => {
        message.success("Copy successfully");
      },
      () => {
        message.warning("Copy failed");
      }
    );
  } else {
    // 兼容性处理（useClipboard 有兼容性问题）
    const input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.setAttribute("value", props.text);
    document.body.appendChild(input);
    input.select();
    try {
      const successful = document.execCommand("copy");

      if (successful) {
        message.success("Copy successfully!");
      } else {
        message.warning("Copy failed!");
      }
    } finally {
      document.body.removeChild(input);
    }
  }
}
</script>
