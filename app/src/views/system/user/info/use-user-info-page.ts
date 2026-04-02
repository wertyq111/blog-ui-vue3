import { reactive, ref } from 'vue'

import { fetchCurrentSystemUserProfile, updateCurrentSystemUserProfile } from '@/api/system-user'
import type { SystemUserProfile, SystemUserProfileFormValue } from '@/types/system-user'
import { showError, showSuccess, withLoading } from '@/utils/feedback'
import { extractErrorMessage } from '@/utils/http'

interface UserInfoPageDependencies {
  fetchProfile: () => Promise<SystemUserProfile>
  updateProfile: (payload: SystemUserProfileFormValue) => Promise<SystemUserProfile>
  showSuccess: (message: string) => void
  showError: (message: string) => void
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

/** 创建个人资料页的默认表单值，供初始化和重置状态使用。 */
function createEmptyProfileFormValue(): SystemUserProfileFormValue {
  return {
    avatar: '',
    realname: '',
    nickname: '',
    gender: '',
    email: '',
    mobile: '',
    address: '',
    intro: '',
  }
}

/** 将远端用户资料映射到页面表单模型，供详情加载和保存后回填使用。 */
function mapProfileToFormValue(profile: SystemUserProfile): SystemUserProfileFormValue {
  const member = profile.member ?? {}

  return {
    avatar: member.avatar ?? '',
    realname: member.realname ?? '',
    nickname: member.nickname ?? '',
    gender: member.gender ?? '',
    email: profile.email ?? '',
    mobile: profile.phone ?? '',
    address: member.address ?? '',
    intro: member.intro ?? '',
  }
}

/** 组装 `system/user/info` 页面的状态与行为，供详情页加载和保存资料。 */
export function useUserInfoPage(overrides: Partial<UserInfoPageDependencies> = {}) {
  const dependencies: UserInfoPageDependencies = {
    fetchProfile: fetchCurrentSystemUserProfile,
    updateProfile: updateCurrentSystemUserProfile,
    showSuccess,
    showError,
    withLoading,
    ...overrides,
  }

  const profileId = ref<number | string | null>(null)
  const username = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const form = reactive<SystemUserProfileFormValue>(createEmptyProfileFormValue())

  /** 用最新资料覆盖本地页面状态，供加载接口返回后统一更新视图。 */
  function applyProfile(profile: SystemUserProfile): void {
    profileId.value = profile.id
    username.value = profile.username

    const nextValue = mapProfileToFormValue(profile)
    form.avatar = nextValue.avatar
    form.realname = nextValue.realname
    form.nickname = nextValue.nickname
    form.gender = nextValue.gender
    form.email = nextValue.email
    form.mobile = nextValue.mobile
    form.address = nextValue.address
    form.intro = nextValue.intro
  }

  /** 加载当前登录用户资料，供页面首次进入和保存完成后刷新显示。 */
  async function loadProfile(): Promise<void> {
    loading.value = true

    try {
      const profile = await dependencies.withLoading(() => dependencies.fetchProfile())
      applyProfile(profile)
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      loading.value = false
    }
  }

  /** 提交当前表单并刷新页面状态，供点击“保存更改”按钮时调用。 */
  async function submitProfile(): Promise<void> {
    saving.value = true

    try {
      const profile = await dependencies.withLoading(() => dependencies.updateProfile(form))
      applyProfile(profile)
      dependencies.showSuccess('个人资料保存成功')
    } catch (error) {
      dependencies.showError(extractErrorMessage(error))
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    profileId,
    username,
    loading,
    saving,
    form,
    loadProfile,
    submitProfile,
  }
}
