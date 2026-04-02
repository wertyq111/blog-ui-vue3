import { describe, expect, it, vi } from 'vitest'

import type { MemberLevelRow } from '@/types/member-level'

import { useMemberLevelPage } from '../use-member-level-page'

function createListResponse(items: MemberLevelRow[]) {
  return {
    items,
    meta: {
      currentPage: 1,
      perPage: 10,
      total: items.length,
      lastPage: 1,
    },
  }
}

describe('useMemberLevelPage', () => {
  it('opens the edit dialog with the member level mapped into form state', () => {
    const page = useMemberLevelPage({
      fetchMemberLevels: vi.fn().mockResolvedValue(createListResponse([])),
      createMemberLevel: vi.fn(),
      updateMemberLevel: vi.fn(),
      deleteMemberLevel: vi.fn(),
      batchDeleteMemberLevel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.openEdit({
      id: 8,
      name: '黄金会员',
      sort: 30,
    })

    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.isEditing.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 8,
      name: '黄金会员',
      sort: 30,
    })
  })

  it('creates a member level, closes the dialog, and refreshes the list on success', async () => {
    const fetchMemberLevels = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([]))
      .mockResolvedValueOnce(createListResponse([{ id: 1, name: '黄金会员', sort: 30 }]))
    const createMemberLevel = vi.fn().mockResolvedValue({
      id: 1,
      name: '黄金会员',
      sort: 30,
    })
    const showSuccess = vi.fn()

    const page = useMemberLevelPage({
      fetchMemberLevels,
      createMemberLevel,
      updateMemberLevel: vi.fn(),
      deleteMemberLevel: vi.fn(),
      batchDeleteMemberLevel: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.openCreate()
    page.dialog.value.value.name = '黄金会员'
    page.dialog.value.value.sort = 30

    await page.submitDialog()

    expect(createMemberLevel).toHaveBeenCalledWith({
      name: '黄金会员',
      sort: 30,
    })
    expect(showSuccess).toHaveBeenCalledWith('会员等级保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchMemberLevels).toHaveBeenCalledTimes(2)
    expect(page.list.items.value).toEqual([{ id: 1, name: '黄金会员', sort: 30 }])
  })

  it('deletes a member level through the confirmed backend path and reloads the list', async () => {
    const deleteMemberLevel = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const fetchMemberLevels = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 3, name: '白银会员', sort: 20 }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useMemberLevelPage({
      fetchMemberLevels,
      createMemberLevel: vi.fn(),
      updateMemberLevel: vi.fn(),
      deleteMemberLevel,
      batchDeleteMemberLevel: vi.fn(),
      confirmWarning,
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeMemberLevel({
      id: 3,
      name: '白银会员',
      sort: 20,
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此会员等级吗？')
    expect(deleteMemberLevel).toHaveBeenCalledWith(3)
    expect(fetchMemberLevels).toHaveBeenCalledTimes(2)
  })

  it('batch deletes selected member levels and clears the selection after reload', async () => {
    const batchDelete = vi.fn().mockResolvedValue(undefined)
    const fetchMemberLevels = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 3, name: '白银会员', sort: 20 }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useMemberLevelPage({
      fetchMemberLevels,
      createMemberLevel: vi.fn(),
      updateMemberLevel: vi.fn(),
      deleteMemberLevel: vi.fn(),
      batchDeleteMemberLevel: batchDelete,
      confirmWarning: vi.fn().mockResolvedValue(undefined),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    page.list.setSelection([{ id: 3, name: '白银会员', sort: 20 }])

    await page.removeSelectedMemberLevels()

    expect(batchDelete).toHaveBeenCalledWith([3])
    expect(page.list.selection.value).toEqual([])
    expect(fetchMemberLevels).toHaveBeenCalledTimes(2)
  })
})
