<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 全屏 -->
      <div class="navbar-actions__item">
        <Fullscreen />
      </div>

      <!-- 语言选择 -->
      <div class="navbar-actions__item">
        <LangSelect />
      </div>

      <!-- 通知 -->
      <div class="navbar-actions__item">
        <NoticeDropdown />
      </div>

      <!-- 租户选择（如果启用多租户）-->
      <div v-if="showTenantSwitcher" class="navbar-actions__item">
        <TenantSwitcher @change="handleTenantChange" />
      </div>
    </template>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <el-avatar :size="30" :src="avatarSrc" class="user-profile__avatar">
            {{ avatarFallback }}
          </el-avatar>
          <span class="user-profile__name">
            {{ displayName }}
          </span>
          <el-icon class="user-profile__arrow">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">
              {{ t("navbar.profile") }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 更多（系统设置）-->
    <div
      v-if="defaults.showSettings"
      class="navbar-actions__item"
      title="更多"
      @click="handleSettingsClick"
    >
      <div class="i-svg:more" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { confirm, message } from "@/utils/feedback";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { defaults } from "@/settings";
import { DeviceEnum } from "@/enums/settings";
import { useAppStore, useSettingsStore, useUserStore } from "@/store";

// 导入子组件
import Fullscreen from "@/components/Fullscreen/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import NoticeDropdown from "@/components/NoticeDropdown/index.vue";
import TenantSwitcher from "@/components/TenantSwitcher/index.vue";
import { useTenantStoreHook } from "@/store/modules/tenant";
import { ArrowDown } from "@element-plus/icons-vue";
import { resolveAvatar } from "@/utils/avatar";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();
const tenantStore = useTenantStoreHook();

const route = useRoute();
const router = useRouter();

// 是否为桌面设备
const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

const canSwitchTenant = computed(() => userStore.userInfo?.canSwitchTenant === true);

// 是否显示租户选择
const showTenantSwitcher = computed(() => {
  if (!canSwitchTenant.value) {
    return false;
  }
  return tenantStore.tenantList.length > 1;
});

const displayName = computed(
  () => userStore.userInfo.nickname || userStore.userInfo.username || ""
);
const avatarSrc = computed(() =>
  resolveAvatar(userStore.userInfo.avatar, userStore.userInfo.gender)
);
const avatarFallback = computed(() => {
  const name = displayName.value.trim();
  if (!name) {
    return "U";
  }
  return name.charAt(0).toUpperCase();
});

function handleTenantChange(tenantId: number) {
  tenantStore.switchTenant(tenantId).then(
    () => {
      message.success("切换租户成功");
      window.location.href = "/";
    },
    (error: any) => {
      message.error(error.message || "切换租户失败");
    }
  );
}

/**
 * 打开个人中心页面
 */
function handleProfileClick() {
  router.push({ name: "Profile" });
}

// 根据主题和侧边栏配色方案选择样式类
const navbarActionsClass = computed(() => {
  const { effectiveDarkMode } = settingStore;

  return effectiveDarkMode ? "navbar-actions--white-text" : "navbar-actions--dark-text";
});

/**
 * 退出登录
 */
function logout() {
  confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore.logout().then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
  });
}

/**
 * 打开系统设置页面
 */
function handleSettingsClick() {
  settingStore.settingsVisible = true;
}
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  min-height: 32px;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    text-align: center;
    cursor: pointer;
    border-radius: 999px;
    transition: all 0.3s;

    // 确保子元素居中
    > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 确保 Element Plus 组件可以正常工作
    :deep(.el-dropdown),
    :deep(.el-tooltip) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 32px;
    }

    :deep(.i-svg\:language) {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      font-size: 18px;
      line-height: 18px;
      background-size: 18px 18px;
    }

    // 图标样式
    :deep([class^="i-svg:"]) {
      font-size: 16px;
      line-height: 1;
      color: var(--cyber-header-tool-text);
      transition: color 0.3s;
    }

    &:hover {
      background: var(--cyber-header-tool-hover-bg);

      :deep([class^="i-svg:"]) {
        color: var(--cyber-header-tool-hover-text);
      }
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 10px 0 3px;
    border: 1px solid rgba(224, 216, 199, 0.88);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 2px 0 rgba(151, 135, 104, 0.22);
    transition:
      background-color 0.3s ease,
      color 0.3s ease;

    &:hover {
      background: var(--cyber-header-tool-hover-bg);
    }

    &__avatar {
      flex-shrink: 0;
      border: 1px solid color-mix(in srgb, var(--cyber-primary) 22%, transparent);
    }

    &__name {
      margin-left: 7px;
      font-size: 12px;
      font-weight: 800;
      color: var(--app-text-soft, var(--el-text-color-regular));
      white-space: nowrap;
      transition: color 0.3s;
    }

    &__arrow {
      margin-left: 6px;
      font-size: 13px;
      color: var(--app-text-mute, var(--el-text-color-secondary));
      transition: color 0.3s;
    }
  }
}

// 白色文字样式（用于深色背景：暗黑主题、顶部布局、混合布局等）
.navbar-actions--white-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: var(--cyber-header-tool-text);
    }

    &:hover {
      background: var(--cyber-header-tool-hover-bg);

      :deep([class^="i-svg:"]) {
        color: var(--cyber-header-tool-hover-text);
      }
    }
  }

  .user-profile__name {
    color: var(--cyber-header-tool-text);
  }

  .user-profile__arrow {
    color: var(--cyber-text-mute);
  }

  // 租户选择器在白色文字模式下的样式
  ::v-deep(.tenant-switcher__trigger) {
    color: var(--cyber-header-tool-text);
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: var(--cyber-header-tool-text);
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--cyber-header-tool-hover-text);
    background: var(--cyber-header-tool-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: var(--cyber-header-tool-hover-text);
  }
}

// 深色文字样式（用于浅色背景：明亮主题下的左侧布局等）
.navbar-actions--dark-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: var(--cyber-header-tool-text) !important;
    }

    &:hover {
      background: var(--cyber-header-tool-hover-bg);

      :deep([class^="i-svg:"]) {
        color: var(--cyber-header-tool-hover-text) !important;
      }
    }
  }

  .user-profile__name {
    color: var(--cyber-header-tool-text) !important;
  }

  .user-profile__arrow {
    color: var(--cyber-text-mute) !important;
  }

  // 租户选择器在深色文字模式下的样式
  ::v-deep(.tenant-switcher__trigger) {
    color: var(--cyber-header-tool-text) !important;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: var(--cyber-header-tool-text) !important;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--cyber-header-tool-hover-text) !important;
    background: var(--cyber-header-tool-hover-bg);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: var(--cyber-header-tool-hover-text) !important;
  }
}

// 确保下拉菜单中的图标不受影响
::v-deep(.el-dropdown-menu) {
  [class^="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
