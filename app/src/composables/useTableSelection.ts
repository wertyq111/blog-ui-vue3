import { computed, ref, type Ref } from "vue";

type RowId = string | number | undefined | null;

/**
 * 表格行选择 Composable
 *
 * @description 提供统一的表格行选择逻辑，包括选中ID管理和清空选择
 * @template T 数据项类型，必须包含 id 属性
 * @returns 返回选中的ID列表、选择变化处理函数、清空选择函数
 *
 * @example
 * ```typescript
 * const { selectedIds, handleSelectionChange, clearSelection } = useTableSelection<UserVO>();
 * ```
 */
export function useTableSelection<T extends { id?: string | number }>(
  rows?: Ref<T[] | undefined>,
  getId?: (row: T) => RowId
) {
  /**
   * 选中的数据项ID列表
   */
  const selectedIds = ref<string[]>([]);
  const checkedIds = selectedIds;

  const rowIds = computed(() =>
    (rows?.value ?? [])
      .map((row) => (getId ? getId(row) : row.id))
      .filter((id): id is string | number => id !== undefined && id !== null)
      .map((id) => String(id))
  );

  /**
   * 表格选中项变化处理
   * @param selection 选中的行数据列表
   */
  function handleSelectionChange(selection: T[]): void {
    selectedIds.value = selection
      .map((item) => item.id)
      .filter((id): id is string | number => id !== undefined && id !== null)
      .map((id) => String(id));
  }

  /**
   * 清空选择
   */
  function clearSelection(): void {
    selectedIds.value = [];
  }

  /**
   * 检查指定ID是否被选中
   * @param id 要检查的ID
   * @returns 是否被选中
   */
  function isSelected(id: RowId): boolean {
    return id !== undefined && id !== null && selectedIds.value.includes(String(id));
  }

  function isChecked(id: RowId): boolean {
    return isSelected(id);
  }

  function toggleRow(id: RowId): void {
    if (id === undefined || id === null) return;
    const key = String(id);
    const index = selectedIds.value.indexOf(key);
    if (index >= 0) selectedIds.value.splice(index, 1);
    else selectedIds.value.push(key);
  }

  function toggleAll(): void {
    selectedIds.value = allChecked.value ? [] : [...rowIds.value];
  }

  /**
   * 获取选中的数量
   */
  const selectedCount = computed(() => selectedIds.value.length);

  /**
   * 是否有选中项
   */
  const hasSelection = computed(() => selectedIds.value.length > 0);

  const allChecked = computed(
    () => rowIds.value.length > 0 && rowIds.value.every((id) => selectedIds.value.includes(id))
  );

  return {
    selectedIds,
    checkedIds,
    selectedCount,
    hasSelection,
    allChecked,
    handleSelectionChange,
    clearSelection,
    isSelected,
    isChecked,
    toggleRow,
    toggleAll,
  };
}
