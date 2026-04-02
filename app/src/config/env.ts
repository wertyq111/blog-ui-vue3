const DEFAULT_APP_TITLE = '个人博客管理台 Vue3'
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api'
const REMOTE_API_PORT = '3925'

export interface AppEnv {
  appTitle: string
  apiBaseUrl: string
}

function normalizeValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()

  return normalized && normalized.length > 0 ? normalized : fallback
}

function isLocalHostname(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname)
}

function resolveFallbackApiBaseUrl(browserLocation?: Pick<Location, 'protocol' | 'hostname'>): string {
  if (!browserLocation || isLocalHostname(browserLocation.hostname)) {
    return DEFAULT_API_BASE_URL
  }

  return `${browserLocation.protocol}//${browserLocation.hostname}:${REMOTE_API_PORT}/api`
}

function resolveApiBaseUrl(
  value: string | undefined,
  browserLocation?: Pick<Location, 'protocol' | 'hostname'>,
): string {
  const normalized = value?.trim()
  const fallback = resolveFallbackApiBaseUrl(browserLocation)

  if (!normalized) {
    return fallback
  }

  if (normalized === DEFAULT_API_BASE_URL && browserLocation && !isLocalHostname(browserLocation.hostname)) {
    return fallback
  }

  return normalized
}

export function resolveAppEnv(
  env: ImportMetaEnv,
  browserLocation: Pick<Location, 'protocol' | 'hostname'> | undefined = typeof window !== 'undefined'
    ? window.location
    : undefined,
): AppEnv {
  return {
    appTitle: normalizeValue(env.VITE_APP_TITLE, DEFAULT_APP_TITLE),
    apiBaseUrl: resolveApiBaseUrl(env.VITE_API_BASE_URL, browserLocation),
  }
}
