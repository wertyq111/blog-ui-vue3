import type { BackendMenuNode } from '@/types/menu'
import type { AuthTokens, CurrentUser } from '@/types/auth'

import { extractPayload } from '@/utils/http'

import { apiClient } from './client'

export interface LoginPayload {
  username: string
  password: string
  captcha: string
  captchaKey: string
  remember: boolean
}

export interface CaptchaPayload {
  captchaImageContent: string
  captchaKey: string
}

function normalizeAccessToken(token: string): string {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

export async function loginByPassword(payload: LoginPayload): Promise<AuthTokens> {
  const response = await apiClient.post('/user/login', {
    username: payload.username,
    password: payload.password,
    captcha: payload.captcha,
    captcha_key: payload.captchaKey,
    remember: payload.remember,
  })

  const data = extractPayload<{ access_token: string; token_type?: string; expires_in?: number }>(response)

  return {
    accessToken: normalizeAccessToken(data.access_token),
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  }
}

export async function fetchCaptcha(): Promise<CaptchaPayload> {
  const response = await apiClient.get('/captcha')
  const data = extractPayload<{ captcha_image_content: string; captcha_key: string }>(response)

  return {
    captchaImageContent: data.captcha_image_content,
    captchaKey: data.captcha_key,
  }
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get('/users/getUserInfo', {
    params: {
      include: ['member'],
    },
  })

  return extractPayload<CurrentUser>(response)
}

export async function fetchMenuTree(): Promise<BackendMenuNode[]> {
  const response = await apiClient.get('/index/getMenuList')

  return extractPayload<BackendMenuNode[]>(response)
}
