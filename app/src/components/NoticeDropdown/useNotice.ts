/**
 * 通知中心逻辑（已禁用：后端无通知 API）
 */
import { ref } from "vue";

export function useNotice() {
  const list = ref<any[]>([]);
  const unreadTotal = ref(0);
  const detail = ref<any>(null);
  const dialogVisible = ref(false);

  function read(_id: string) {}
  function readAll() {}
  function goMore() {}

  return {
    list,
    unreadTotal,
    detail,
    dialogVisible,
    fetchList: () => {},
    read,
    readAll,
    goMore,
  };
}
