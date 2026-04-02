import axios, { AxiosHeaders, type AxiosInstance, type AxiosResponseHeaders, type RawAxiosResponseHeaders } from 'axios'

import { resolveAppEnv } from '@/config/env'
import { clearStoredAuthSnapshot, readStoredAuthSnapshot, replaceStoredAuthToken } from '@/stores/auth-storage'

type TokenReader = () => string
type TokenWriter = (token: string) => void
type UnauthorizedHandler = () => void
type TokenRefreshHandler = (token: string) => void

export interface ApiClientOptions {
  baseURL: string
  getToken: TokenReader
  setToken: TokenWriter
  onUnauthorized: UnauthorizedHandler
}

let unauthorizedHandler: UnauthorizedHandler = () => {}
let tokenRefreshHandler: TokenRefreshHandler = () => {}

function readResponseToken(headers: RawAxiosResponseHeaders | AxiosResponseHeaders | undefined): string | null {
  if (!headers) {
    return null
  }

  const candidates = [
    headers.Authorization,
    headers.authorization,
  ]

  return candidates.find((value): value is string => typeof value === 'string' && value.length > 0) ?? null
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
}

export function setTokenRefreshHandler(handler: TokenRefreshHandler): void {
  tokenRefreshHandler = handler
}

export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
  })

  client.interceptors.request.use((config) => {
    const token = options.getToken()

    if (!token) {
      return config
    }

    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('Authorization', token)
    config.headers = headers

    return config
  })

  client.interceptors.response.use(
    (response) => {
      const nextToken = readResponseToken(response.headers)

      if (nextToken) {
        options.setToken(nextToken)
        tokenRefreshHandler(nextToken)
      }

      if (response.data?.code === 401) {
        options.onUnauthorized()

        return Promise.reject(new Error(response.data?.msg || '登录状态已过期'))
      }

      return response
    },
    (error) => Promise.reject(error),
  )

  return client
}

const appEnv = resolveAppEnv(import.meta.env)

export const apiClient = createApiClient({
  baseURL: appEnv.apiBaseUrl,
  getToken: () => readStoredAuthSnapshot()?.token ?? '',
  setToken: replaceStoredAuthToken,
  onUnauthorized: () => {
    clearStoredAuthSnapshot()
    unauthorizedHandler()
  },
})
