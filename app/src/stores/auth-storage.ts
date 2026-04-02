import type { AuthStateSnapshot } from '@/types/auth'

export const AUTH_STORAGE_KEY = 'blog-ui-vue3.auth'

type StorageSource = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function parseSnapshot(value: string | null): AuthStateSnapshot | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as AuthStateSnapshot
  } catch {
    return null
  }
}

function resolveStorageEntries(): StorageSource[] {
  return [localStorage, sessionStorage]
}

function resolveActiveStorage(): StorageSource | null {
  return resolveStorageEntries().find((storage) => storage.getItem(AUTH_STORAGE_KEY) !== null) ?? null
}

export function readStoredAuthSnapshot(): AuthStateSnapshot | null {
  for (const storage of resolveStorageEntries()) {
    const snapshot = parseSnapshot(storage.getItem(AUTH_STORAGE_KEY))

    if (snapshot) {
      return snapshot
    }
  }

  return null
}

export function writeStoredAuthSnapshot(snapshot: AuthStateSnapshot, remember: boolean): void {
  clearStoredAuthSnapshot()
  ;(remember ? localStorage : sessionStorage).setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot))
}

export function replaceStoredAuthSnapshot(snapshot: AuthStateSnapshot): void {
  const storage = resolveActiveStorage() ?? localStorage

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot))
}

export function replaceStoredAuthToken(token: string): void {
  const storage = resolveActiveStorage()
  const snapshot = storage ? parseSnapshot(storage.getItem(AUTH_STORAGE_KEY)) : null

  if (!storage || !snapshot) {
    return
  }

  storage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      ...snapshot,
      token,
    } satisfies AuthStateSnapshot),
  )
}

export function clearStoredAuthSnapshot(): void {
  for (const storage of resolveStorageEntries()) {
    storage.removeItem(AUTH_STORAGE_KEY)
  }
}
