import { ref, toRaw } from 'vue'

import type { PaginatedMeta } from '@/types/api'
import { extractCollectionPayload, extractErrorMessage } from '@/utils/http'

export interface CrudListRequest<TQuery> {
  page: number
  perPage: number
  query: TQuery
}

export interface UseCrudListOptions<TQuery> {
  createInitialQuery: () => TQuery
  fetchPage: (request: CrudListRequest<TQuery>) => Promise<unknown>
  initialPage?: number
  initialPageSize?: number
}

function cloneValue<T>(value: T): T {
  const rawValue = toRaw(value)

  if (typeof structuredClone === 'function') {
    return structuredClone(rawValue)
  }

  return JSON.parse(JSON.stringify(rawValue)) as T
}

export function useCrudList<TItem, TQuery>(options: UseCrudListOptions<TQuery>) {
  const initialPage = options.initialPage ?? 1
  const initialPageSize = options.initialPageSize ?? 10

  const query = ref<TQuery>(cloneValue(options.createInitialQuery()))
  const items = ref<TItem[]>([])
  const selection = ref<TItem[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const meta = ref<PaginatedMeta>({
    currentPage: initialPage,
    perPage: initialPageSize,
    total: 0,
    lastPage: 1,
  })

  async function reload() {
    loading.value = true
    errorMessage.value = ''

    try {
      const result = extractCollectionPayload<TItem>(
        await options.fetchPage({
          page: meta.value.currentPage,
          perPage: meta.value.perPage,
          query: cloneValue(query.value),
        }),
        {
          currentPage: meta.value.currentPage,
          perPage: meta.value.perPage,
        },
      )

      items.value = result.items
      meta.value = result.meta

      return result
    } catch (error) {
      errorMessage.value = extractErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function search() {
    meta.value = {
      ...meta.value,
      currentPage: 1,
    }

    return reload()
  }

  async function reset() {
    query.value = cloneValue(options.createInitialQuery())
    selection.value = []
    meta.value = {
      ...meta.value,
      currentPage: 1,
    }

    return reload()
  }

  async function changePage(page: number) {
    meta.value = {
      ...meta.value,
      currentPage: page,
    }

    return reload()
  }

  async function changePageSize(perPage: number) {
    meta.value = {
      ...meta.value,
      currentPage: 1,
      perPage,
    }

    return reload()
  }

  function setSelection(nextSelection: TItem[]) {
    selection.value = nextSelection
  }

  return {
    query,
    items,
    selection,
    loading,
    errorMessage,
    meta,
    reload,
    search,
    reset,
    changePage,
    changePageSize,
    setSelection,
  }
}
