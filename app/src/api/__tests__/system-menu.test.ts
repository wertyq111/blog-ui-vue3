import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/api/client'

import {
  createSystemMenu,
  deleteSystemMenu,
  fetchSystemMenuDetail,
  fetchSystemMenuList,
  updateSystemMenu,
} from '../system-menu'

describe('system menu api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads menu list from menu index endpoint with trimmed title query', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [{ id: 1, title: '系统管理' }],
      },
    } as never)

    await fetchSystemMenuList({
      title: ' 菜单 ',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/menu/index', {
      params: {
        title: '菜单',
      },
    })
  })

  it('omits blank title filter for list endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: [],
      },
    } as never)

    await fetchSystemMenuList({
      title: '   ',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/menu/index', {
      params: {
        title: undefined,
      },
    })
  })

  it('loads menu detail from info endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 3, title: '菜单管理' },
      },
    } as never)

    await fetchSystemMenuDetail(3)

    expect(apiClient.get).toHaveBeenCalledWith('/menu/info/3', {
      params: {
        include: ['children'],
      },
    })
  })

  it('creates menu with add endpoint and serialized target value', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9 },
      },
    } as never)

    await createSystemMenu({
      pid: null,
      title: ' 菜单管理 ',
      icon: ' el-icon-menu ',
      path: ' /system/menu ',
      component: ' /system/menu ',
      target: 2,
      permission: ' sys:menu:index ',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: ' 菜单备注 ',
      checkedList: [1, 5],
    })

    expect(apiClient.post).toHaveBeenCalledWith('/menu/add', {
      pid: 0,
      title: '菜单管理',
      icon: 'el-icon-menu',
      path: '/system/menu',
      component: '/system/menu',
      target: '_blank',
      permission: 'sys:menu:index',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: '菜单备注',
      checkedList: [1, 5],
    })
  })

  it('updates menu on resource endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        code: 0,
        data: { id: 9 },
      },
    } as never)

    await updateSystemMenu(9, {
      id: 9,
      pid: 1,
      title: '菜单管理',
      icon: '',
      path: '/system/menu',
      component: '/system/menu',
      target: 0,
      permission: '',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: '',
      checkedList: [],
    })

    expect(apiClient.post).toHaveBeenCalledWith('/menu/9', {
      pid: 1,
      title: '菜单管理',
      icon: '',
      path: '/system/menu',
      component: '/system/menu',
      target: '_self',
      permission: '',
      type: 0,
      status: 1,
      hide: 0,
      sort: 10,
      note: '',
      checkedList: [],
    })
  })

  it('deletes menu from resource endpoint', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as never)

    await deleteSystemMenu(5)

    expect(apiClient.delete).toHaveBeenCalledWith('/menu/5')
  })
})
