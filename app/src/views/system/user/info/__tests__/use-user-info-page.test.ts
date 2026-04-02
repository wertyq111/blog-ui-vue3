import { describe, expect, it, vi } from 'vitest'

import { useUserInfoPage } from '../use-user-info-page'

describe('useUserInfoPage', () => {
  it('loads profile data and maps it to page state', async () => {
    const showError = vi.fn()
    const page = useUserInfoPage({
      fetchProfile: vi.fn().mockResolvedValue({
        id: 1,
        username: 'zxf',
        email: 'zxf@example.com',
        phone: '13800000000',
        member: {
          avatar: 'avatar-key',
          realname: '周许峰',
          nickname: '子曰',
          gender: 1,
          address: '杭州',
          intro: 'hello',
        },
      }),
      updateProfile: vi.fn(),
      showSuccess: vi.fn(),
      showError,
      withLoading: async (task) => task(),
    })

    await page.loadProfile()

    expect(page.profileId.value).toBe(1)
    expect(page.username.value).toBe('zxf')
    expect(page.form.realname).toBe('周许峰')
    expect(page.form.mobile).toBe('13800000000')
    expect(showError).not.toHaveBeenCalled()
  })

  it('submits profile form and reports success', async () => {
    const showSuccess = vi.fn()
    const updateProfile = vi.fn().mockResolvedValue({
      id: 1,
      username: 'zxf',
      email: 'next@example.com',
      phone: '13900000000',
      member: {
        realname: '周许峰',
        nickname: '子曰',
        gender: 1,
        avatar: '',
        address: '',
        intro: '',
      },
    })

    const page = useUserInfoPage({
      fetchProfile: vi.fn(),
      updateProfile,
      showSuccess,
      showError: vi.fn(),
      withLoading: async (task) => task(),
    })

    page.form.realname = '周许峰'
    page.form.nickname = '子曰'
    page.form.gender = 1
    page.form.email = 'next@example.com'
    page.form.mobile = '13900000000'

    await page.submitProfile()

    expect(updateProfile).toHaveBeenCalledWith({
      avatar: '',
      realname: '周许峰',
      nickname: '子曰',
      gender: 1,
      email: 'next@example.com',
      mobile: '13900000000',
      address: '',
      intro: '',
    })
    expect(showSuccess).toHaveBeenCalledWith('个人资料保存成功')
  })
})
