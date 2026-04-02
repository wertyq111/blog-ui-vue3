import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import type { LoadingOptionsResolved } from 'element-plus'

export function showSuccess(message: string): void {
  ElMessage.success(message)
}

export function showError(message: string): void {
  ElMessage.error(message)
}

export async function confirmWarning(message: string, title = '提示'): Promise<void> {
  await ElMessageBox.confirm(message, title, {
    type: 'warning',
  })
}

export async function withLoading<T>(
  task: () => Promise<T>,
  options: Partial<LoadingOptionsResolved> = {},
): Promise<T> {
  const loading = ElLoading.service({
    lock: true,
    ...options,
  })

  try {
    return await task()
  } finally {
    loading.close()
  }
}
