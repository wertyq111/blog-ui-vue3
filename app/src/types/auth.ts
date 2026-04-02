import type { BackendMenuNode } from './menu'

export interface CurrentUser {
  id: number | string
  username?: string
  email?: string
  phone?: string
  nickname?: string
  realname?: string
  avatar?: string
  roles?: Array<string | { id: number | string; code?: string; name?: string }>
  authorities?: Array<string | { permission?: string }>
  permissions?: string[]
  member?: {
    avatar?: string
    nickname?: string
    realname?: string
  }
}

export interface AuthTokens {
  accessToken: string
  tokenType?: string
  expiresIn?: number
}

export interface AuthStateSnapshot {
  token: string
  user: CurrentUser | null
  menus: BackendMenuNode[]
  permissions: string[]
}
