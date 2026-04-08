import { store } from "@/store";

import AuthAPI from "@/api/auth";
import UserAPI from "@/api/system/user";
import type { LoginRequest, UserInfo } from "@/types/api";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useDictStoreHook } from "@/store/modules/dict";
import { useTagsViewStore } from "@/store";
import { cleanupSseServices } from "@/composables";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref<UserInfo>({} as UserInfo);
  // 记住我状态
  const rememberMe = ref(AuthStorage.getRememberMe());

  /**
   * 登录
   */
  async function login(loginRequest: LoginRequest): Promise<void> {
    const { access_token } = await AuthAPI.login(loginRequest);
    rememberMe.value = loginRequest.remember ?? false;
    AuthStorage.setToken(access_token, rememberMe.value);
  }

  /**
   * 获取用户信息
   *
   * 后端返回格式：{id, username, nickname, avatar, roles: [{code, name}], authorities: [{permission}]}
   * 需映射为：{userId, username, nickname, avatar, roles: string[], perms: string[]}
   */
  async function getUserInfo(): Promise<UserInfo> {
    const raw: any = await UserAPI.getInfo();
    if (!raw) {
      throw new Error("Verification failed, please Login again.");
    }

    // 映射后端数据格式到前端 UserInfo
    const mapped: UserInfo = {
      userId: String(raw.id ?? raw.userId ?? ""),
      username: raw.username,
      nickname: raw.nickname,
      avatar: raw.avatar,
      roles: Array.isArray(raw.roles)
        ? raw.roles.map((r: any) => (typeof r === "string" ? r : r.code || r.name))
        : [],
      perms: Array.isArray(raw.authorities)
        ? raw.authorities.map((a: any) => (typeof a === "string" ? a : a.permission))
        : raw.perms ?? [],
    };

    Object.assign(userInfo.value, mapped);
    return mapped;
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    await AuthAPI.logout();
    resetAllState();
  }

  /**
   * 重置所有系统状态
   */
  function resetAllState(): void {
    resetUserState();
    usePermissionStoreHook().resetRouter();
    useDictStoreHook().clearDictCache();
    useTagsViewStore().delAllViews();
    cleanupSseServices();
  }

  /**
   * 重置用户状态
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
  }

  return {
    userInfo,
    rememberMe,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    login,
    logout,
    getUserInfo,
    resetAllState,
    resetUserState,
  };
});

/**
 * 在组件外部使用 UserStore 的钩子函数
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
