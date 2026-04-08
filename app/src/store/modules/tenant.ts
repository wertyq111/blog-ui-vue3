import { store } from "@/store";

/**
 * 租户 Store（已禁用：后端不支持多租户）
 */
export const useTenantStore = defineStore("tenant", () => {
  const currentTenantId = ref<number | null>(null);
  const currentTenant = ref<any>(null);
  const tenantList = ref<any[]>([]);

  function loadTenant() {
    return Promise.resolve();
  }
  function fetchTenantList() {
    return Promise.resolve([]);
  }
  function setTenantList(_list: any[]) {}
  function setCurrentTenant(_tenant: any) {}
  function switchTenant(_tenantId: number) {
    return Promise.resolve();
  }
  function clearTenant() {
    currentTenantId.value = null;
    currentTenant.value = null;
    tenantList.value = [];
  }

  return {
    currentTenantId,
    currentTenant,
    tenantList,
    loadTenant,
    fetchTenantList,
    setTenantList,
    setCurrentTenant,
    switchTenant,
    clearTenant,
  };
});

export function useTenantStoreHook() {
  return useTenantStore(store);
}
