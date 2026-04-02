import { describe, expect, it, vi } from 'vitest'

import type { MemberLevelOption, MemberRow } from '@/types/member'

import { useMemberPage } from '../use-member-page'

function createListResponse(items: MemberRow[]) {
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

describe('useMemberPage', () => {
  it('opens the edit dialog with mapped member values and level options', async () => {
    const fetchMemberLevels = vi.fn<() => Promise<MemberLevelOption[]>>().mockResolvedValue([
      {
        id: 1,
        name: '青铜',
      },
    ])

    const page = useMemberPage({
      fetchMembers: vi.fn().mockResolvedValue(createListResponse([])),
      fetchMemberLevelOptions: fetchMemberLevels,
      updateMember: vi.fn(),
      updateMemberStatus: vi.fn(),
      deleteMember: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.openEdit({
      id: 8,
      memberLevel: 2,
      realname: '测试会员',
      nickname: '会员昵称',
      gender: 1,
      city: ['330000', '330100', '330106'],
      user: {
        username: 'member_user',
      },
    })

    expect(fetchMemberLevels).toHaveBeenCalledTimes(1)
    expect(page.memberLevelOptions.value).toEqual([
      {
        id: 1,
        name: '青铜',
      },
    ])
    expect(page.dialog.visible.value).toBe(true)
    expect(page.dialog.value.value).toEqual({
      id: 8,
      userId: null,
      username: 'member_user',
      memberLevel: 2,
      realname: '测试会员',
      nickname: '会员昵称',
      gender: 1,
      avatar: '',
      birthday: '',
      city: ['330000', '330100', '330106'],
      address: '',
      intro: '',
      signature: '',
      device: 5,
      source: 2,
      status: 1,
    })
  })

  it('updates a member, closes the dialog, and refreshes the list on success', async () => {
    const fetchMembers = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 9, nickname: '旧昵称' }]))
      .mockResolvedValueOnce(createListResponse([{ id: 9, nickname: '新昵称' }]))
    const updateMember = vi.fn().mockResolvedValue({
      id: 9,
      nickname: '新昵称',
    })
    const showSuccess = vi.fn()

    const page = useMemberPage({
      fetchMembers,
      fetchMemberLevelOptions: vi.fn().mockResolvedValue([]),
      updateMember,
      updateMemberStatus: vi.fn(),
      deleteMember: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.openEdit({
      id: 9,
      memberLevel: 1,
      realname: '测试会员',
      nickname: '旧昵称',
      gender: 1,
      city: ['', '', ''],
      user: {
        username: 'member_user',
      },
    })
    page.dialog.value.value.nickname = '新昵称'

    await page.submitDialog()

    expect(updateMember).toHaveBeenCalledWith(9, {
      id: 9,
      userId: null,
      username: 'member_user',
      memberLevel: 1,
      realname: '测试会员',
      nickname: '新昵称',
      gender: 1,
      avatar: '',
      birthday: '',
      city: ['', '', ''],
      address: '',
      intro: '',
      signature: '',
      device: 5,
      source: 2,
      status: 1,
    })
    expect(showSuccess).toHaveBeenCalledWith('会员保存成功')
    expect(page.dialog.visible.value).toBe(false)
    expect(fetchMembers).toHaveBeenCalledTimes(2)
  })

  it('rolls back member status when the status update fails', async () => {
    const showError = vi.fn()
    const page = useMemberPage({
      fetchMembers: vi.fn().mockResolvedValue(createListResponse([])),
      fetchMemberLevelOptions: vi.fn().mockResolvedValue([]),
      updateMember: vi.fn(),
      updateMemberStatus: vi.fn().mockRejectedValue(new Error('状态失败')),
      deleteMember: vi.fn(),
      confirmWarning: vi.fn(),
      showSuccess: vi.fn(),
      showError,
      withLoading: async (task) => task(),
    })

    const row: MemberRow = {
      id: 3,
      status: 1,
      nickname: '测试会员',
    }

    await expect(page.changeStatus(row, 2)).rejects.toThrow('状态失败')

    expect(row.status).toBe(1)
    expect(showError).toHaveBeenCalledWith('状态失败')
  })

  it('deletes a member through the confirmed backend path and reloads the list', async () => {
    const deleteMember = vi.fn().mockResolvedValue(undefined)
    const confirmWarning = vi.fn().mockResolvedValue(undefined)
    const fetchMembers = vi
      .fn()
      .mockResolvedValueOnce(createListResponse([{ id: 3, nickname: '测试会员' }]))
      .mockResolvedValueOnce(createListResponse([]))

    const page = useMemberPage({
      fetchMembers,
      fetchMemberLevelOptions: vi.fn().mockResolvedValue([]),
      updateMember: vi.fn(),
      updateMemberStatus: vi.fn(),
      deleteMember,
      confirmWarning,
      showSuccess: vi.fn(),
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    await page.list.reload()
    await page.removeMember({
      id: 3,
      nickname: '测试会员',
    })

    expect(confirmWarning).toHaveBeenCalledWith('确定要删除此会员吗？')
    expect(deleteMember).toHaveBeenCalledWith(3)
    expect(fetchMembers).toHaveBeenCalledTimes(2)
  })
})
