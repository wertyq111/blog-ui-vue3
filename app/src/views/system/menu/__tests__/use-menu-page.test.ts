import { describe, expect, it, vi } from 'vitest'

import type { SystemMenuRow } from '@/types/system-menu'

import { useMenuPage } from '../use-menu-page'

describe('useMenuPage', () => {
  it('opens create dialog with parent id seed', () => {
    const page = useMenuPage({
      fetchMenus: vi.fn().mockResolvedValue([]),
      fetchMenuDetail: vi.fn(),
      createMenu: vi.fn(),
      updateMenu: vi.fn(),
      deleteMenu: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openCreate(9)

    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value.pid).toBe(9)
  })

  it('opens edit dialog with fetched detail and mapped target', async () => {
    const fetchMenuDetail = vi.fn().mockResolvedValue({
      id: 7,
      pid: 1,
      title: '菜单管理',
      icon: 'el-icon-s-operation',
      path: '/system/menu',
      component: '/system/menu',
      target: '_self',
      permission: 'sys:menu:index',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: '默认菜单',
      checkedList: [1, 5],
    } satisfies SystemMenuRow)

    const page = useMenuPage({
      fetchMenus: vi.fn().mockResolvedValue([]),
      fetchMenuDetail,
      createMenu: vi.fn(),
      updateMenu: vi.fn(),
      deleteMenu: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 7,
      pid: 1,
      title: '菜单管理',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
    })

    expect(fetchMenuDetail).toHaveBeenCalledWith(7)
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 7,
      pid: 1,
      title: '菜单管理',
      icon: 'el-icon-s-operation',
      path: '/system/menu',
      component: '/system/menu',
      target: 0,
      permission: 'sys:menu:index',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: '默认菜单',
      checkedList: [1, 5],
    })
  })

  it('creates menu and reloads list after submit success', async () => {
    const fetchMenus = vi
      .fn()
      .mockResolvedValueOnce([
        { id: 1, pid: 0, title: '系统管理', type: 0, status: 1, hide: 0, sort: 10 },
      ] as SystemMenuRow[])
      .mockResolvedValueOnce([
        { id: 1, pid: 0, title: '系统管理', type: 0, status: 1, hide: 0, sort: 10 },
        { id: 2, pid: 1, title: '菜单管理', type: 0, status: 1, hide: 0, sort: 20 },
      ] as SystemMenuRow[])
    const createMenu = vi.fn().mockResolvedValue({ id: 2 })

    const page = useMenuPage({
      fetchMenus,
      fetchMenuDetail: vi.fn(),
      createMenu,
      updateMenu: vi.fn(),
      deleteMenu: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate(1)
    page.dialog.value.value.title = '菜单管理'
    page.dialog.value.value.path = '/system/menu'
    page.dialog.value.value.component = '/system/menu'
    page.dialog.value.value.permission = 'sys:menu:index'
    page.dialog.value.value.sort = 20

    await page.submitDialog()

    expect(createMenu).toHaveBeenCalledWith({
      pid: 1,
      title: '菜单管理',
      icon: '',
      path: '/system/menu',
      component: '/system/menu',
      target: 0,
      permission: 'sys:menu:index',
      type: 0,
      status: 1,
      hide: 0,
      sort: 20,
      note: '',
      checkedList: [],
    })
    expect(page.dialog.visible.value).toBe(false)
    expect(page.list.items.value).toHaveLength(1)
    expect(page.list.items.value[0].children).toHaveLength(1)
  })

  it('keeps current list and throws when delete fails', async () => {
    const rows = [
      { id: 1, pid: 0, title: '系统管理', type: 0, status: 1, hide: 0, sort: 10 },
    ] as SystemMenuRow[]
    const deleteMenu = vi.fn().mockRejectedValue(new Error('删除失败'))
    const showError = vi.fn()

    const page = useMenuPage({
      fetchMenus: vi.fn().mockResolvedValue(rows),
      fetchMenuDetail: vi.fn(),
      createMenu: vi.fn(),
      updateMenu: vi.fn(),
      deleteMenu,
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError,
      withLoading: async (task) => task(),
    })

    await page.list.reload()

    await expect(page.removeMenu(rows[0])).rejects.toThrow('删除失败')
    expect(deleteMenu).toHaveBeenCalledWith(1)
    expect(page.list.items.value).toHaveLength(1)
    expect(showError).toHaveBeenCalledWith('删除失败')
  })
})
