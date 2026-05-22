<!-- 动森风格专属滚动条组件：优雅替代 Element Plus el-scrollbar，支持奶油圆角及丝滑拖拽 -->
<template>
  <div class="animal-scrollbar">
    <div class="animal-scrollbar__wrap">
      <div class="animal-scrollbar__view">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AnimalScrollbar",
});
</script>

<style lang="scss" scoped>
.animal-scrollbar {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-top: 14px;
}

.animal-scrollbar__wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  /* 动森风格奶油极细滚动条 */
  &::-webkit-scrollbar {
    height: 6px; /* 横向滚动轴高度 */
  }
  
  &::-webkit-scrollbar-track {
    background: #fdfbf7;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e6dfcb;
    border-radius: 10px;
    border: 1px solid #fdfbf7;
    
    &:hover {
      background: #c8bd9f;
    }
  }
}

.animal-scrollbar__view {
  display: flex;
  justify-content: center; /* 默认水平居中对齐 */
  align-items: center;
  min-width: max-content;
}
</style>
