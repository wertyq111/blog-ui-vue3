export interface MemberUserSummary {
  id?: number | string
  username?: string | null
}

export interface MemberLevelOption {
  id: number | string
  name: string
}

export interface MemberRow {
  id: number | string
  userId?: number | string | null
  user?: MemberUserSummary | null
  memberLevel?: number | string | null
  realname?: string | null
  nickname?: string | null
  gender?: number | string | null
  avatar?: string | null
  birthday?: number | string | null
  city?: string[]
  address?: string | null
  intro?: string | null
  signature?: string | null
  device?: number | string | null
  source?: number | string | null
  status?: number | string | null
  createTime?: string | null
  updateTime?: string | null
}

export interface MemberQuery {
  username: string
  nickname: string
  gender: string
  include: string[]
}

export interface MemberFormValue {
  id?: number | string
  userId?: number | string | null
  username?: string
  memberLevel: number | string | null
  realname: string
  nickname: string
  gender: number
  avatar: string
  birthday: string
  city: string[]
  address: string
  intro: string
  signature: string
  device: number
  source: number
  status: number
}
