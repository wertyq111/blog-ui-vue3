export interface SystemRoleOption {
  id: number | string
  name: string
  code?: string
}

export interface SystemUserRow {
  id: number | string
  username: string
  email?: string
  phone?: string
  avatar?: string
  realname?: string
  status?: number
  roles?: SystemRoleOption[]
  createTime?: string | null
  updateTime?: string | null
}

export interface SystemUserQuery {
  username: string
  phone: string
  status: number | ''
  include?: string[]
}

export interface SystemUserFormValue {
  id?: number | string
  username: string
  email: string
  phone: string
  password: string
  roleIds: Array<number | string>
  status: number
}

export interface SystemUserProfileMember {
  avatar?: string
  realname?: string
  nickname?: string
  gender?: number
  address?: string
  intro?: string
}

export interface SystemUserProfile {
  id: number | string
  username: string
  email?: string
  phone?: string
  member?: SystemUserProfileMember
}

export interface SystemUserProfileFormValue {
  avatar: string
  realname: string
  nickname: string
  gender: number | ''
  email: string
  mobile: string
  address: string
  intro: string
}
