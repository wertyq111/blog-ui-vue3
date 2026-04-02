import { ref } from 'vue'

import {
  createSystemMenu,
  deleteSystemMenu,
  fetchSystemMenuDetail,
  fetchSystemMenuList,
  updateSystemMenu,
} from '@/api/system-menu'
import { useDialogForm } from '@/composables/use-dialog-form'
import type {
  SystemMenuFormValue,
  SystemMenuOptionNode,
  SystemMenuPermissionOption,
  SystemMenuQuery,
  SystemMenuRow,
} from '@/types/system-menu'
import { confirmWarning, showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface MenuPageDependencies {
  fetchMenus: (query: SystemMenuQuery) => Promise<SystemMenuRow[]>
  fetchMenuDetail: (id: number | string) => Promise<SystemMenuRow>
  createMenu: (payload: SystemMenuFormValue) => Promise<SystemMenuRow>
  updateMenu: (id: number | string, payload: SystemMenuFormValue) => Promise<SystemMenuRow>
  deleteMenu: (id: number | string) => Promise<void>
  confirmWarning: (message: string, title?: string) => Promise<void>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

const PERMISSION_OPTIONS: SystemMenuPermissionOption[] = [
  { key: 1, label: '查询' },
  { key: 5, label: '添加' },
  { key: 10, label: '修改' },
  { key: 15, label: '删除' },
  { key: 20, label: '详情' },
  { key: 25, label: '状态' },
  { key: 30, label: '批量删除' },
  { key: 35, label: '添加子级' },
  { key: 40, label: '全部展开' },
  { key: 45, label: '全部折叠' },
  { key: 50, label: '导出数据' },
  { key: 55, label: '导入数据' },
  { key: 60, label: '分配权限' },
  { key: 65, label: '重置密码' },
]

function createInitialQuery(): SystemMenuQuery {
  return {
    title: '',
  }
}

function createEmptyFormValue(): SystemMenuFormValue {
  return {
    pid: null,
    title: '',
    icon: '',
    path: '',
    component: '',
    target: 0,
    permission: '',
    type: 0,
    status: 1,
    hide: 0,
    sort: 0,
    note: '',
    checkedList: [],
  }
}

function isExternalLink(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')
}

function normalizeTargetValue(row: SystemMenuRow): number {
  if (row.target === '_blank' || row.target === 2 || isExternalLink(row.path)) {
    return 2
  }

  if (row.target === 1 || isExternalLink(row.component)) {
    return 1
  }

  return 0
}

function mapRowToFormValue(row: SystemMenuRow): SystemMenuFormValue {
  return {
    id: row.id,
    pid: row.pid === 0 || row.pid === '0' ? null : row.pid,
    title: row.title ?? '',
    icon: row.icon ?? '',
    path: row.path ?? '',
    component: row.component ?? '',
    target: normalizeTargetValue(row),
    permission: row.permission ?? '',
    type: row.type ?? 0,
    status: row.status ?? 1,
    hide: row.hide ?? 0,
    sort: row.sort ?? 0,
    note: row.note ?? '',
    checkedList: [...(row.checkedList ?? [])],
  }
}

function toNodeId(value: number | string | undefined | null): string {
  if (value === undefined || value === null) {
    return ''
  }

  return String(value)
}

function buildMenuTree(rows: SystemMenuRow[]): SystemMenuRow[] {
  const nodeMap = new Map<string, SystemMenuRow>()
  const roots: SystemMenuRow[] = []

  for (const row of rows) {
    const node: SystemMenuRow = {
      ...row,
      children: [],
    }
    nodeMap.set(toNodeId(row.id), node)
  }

  for (const row of rows) {
    const nodeId = toNodeId(row.id)
    const node = nodeMap.get(nodeId)

    if (!node) {
      continue
    }

    const parentId = toNodeId(row.pid)
    const parent = parentId ? nodeMap.get(parentId) : undefined

    if (!parent || parentId === '0') {
      roots.push(node)
      continue
    }

    parent.children?.push(node)
  }

  return roots
}

function mapMenuOptions(nodes: SystemMenuRow[]): SystemMenuOptionNode[] {
  return nodes
    .filter((node) => node.type === 0)
    .map((node) => ({
      id: node.id,
      label: node.title,
      children: node.children?.length ? mapMenuOptions(node.children) : undefined,
    }))
}

export function useMenuPage(overrides: Partial<MenuPageDependencies> = {}) {
  const dependencies: MenuPageDependencies = {
    fetchMenus: fetchSystemMenuList,
    fetchMenuDetail: fetchSystemMenuDetail,
    createMenu: createSystemMenu,
    updateMenu: updateSystemMenu,
    deleteMenu: deleteSystemMenu,
    confirmWarning,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const query = ref<SystemMenuQuery>(createInitialQuery())
  const items = ref<SystemMenuRow[]>([])
  const menuOptions = ref<SystemMenuOptionNode[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  const dialog = useDialogForm<SystemMenuFormValue, SystemMenuRow>({
    createInitialValue: createEmptyFormValue,
    mapSourceToValue: mapRowToFormValue,
  })

  async function reload(): Promise<void> {
    loading.value = true
    errorMessage.value = ''

    try {
      const rows = await dependencies.fetchMenus({
        title: query.value.title,
      })
      const tree = buildMenuTree(rows)
      items.value = tree
      menuOptions.value = mapMenuOptions(tree)
    } catch (error) {
      errorMessage.value = extractErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function search(): Promise<void> {
    await reload()
  }

  async function reset(): Promise<void> {
    query.value = createInitialQuery()
    await reload()
  }

  function openCreate(parentId?: number | string): void {
    dialog.openCreate({
      pid: parentId ?? null,
    })
  }

  async function openEdit(row: SystemMenuRow): Promise<void> {
    const detail = await dependencies.fetchMenuDetail(row.id)
    dialog.openEdit(detail)
  }

  async function submitDialog(): Promise<void> {
    try {
      await dependencies.withLoading(() =>
        dialog.submit(async (value, source) => {
          if (source) {
            await dependencies.updateMenu(source.id, value)
          } else {
            await dependencies.createMenu(value)
          }

          dependencies.showSuccess('菜单保存成功')
          await reload()
        }),
      )
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    }
  }

  async function removeMenu(row: SystemMenuRow): Promise<void> {
    try {
      await dependencies.confirmWarning('确定要删除此菜单吗？')
      await dependencies.withLoading(() => dependencies.deleteMenu(row.id))
      dependencies.showSuccess('菜单删除成功')
      await reload()
    } catch (error) {
      if (error instanceof Error) {
        dependencies.showError(extractErrorMessage(error))
      }
      throw error
    }
  }

  return {
    list: {
      query,
      items,
      loading,
      errorMessage,
      reload,
      search,
      reset,
    },
    dialog,
    menuOptions,
    permissionOptions: PERMISSION_OPTIONS,
    openCreate,
    openEdit,
    submitDialog,
    removeMenu,
  }
}
