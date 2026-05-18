<template>
  <el-dropdown trigger="click" @command="handleColorChange">
    <el-icon :size="20">
      <Sunny />
    </el-icon>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item disabled>
          <el-icon><Sunny /></el-icon>
          {{ t("login.light") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { Sunny } from "@element-plus/icons-vue";

const { t } = useI18n();

const handleColorChange = () => {
  // 仅支持亮色模式，无需切换
};
</script>
