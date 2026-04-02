export interface ApiEnvelope<T> {
  code?: number
  msg?: string
  message?: string
  data?: T
}

export interface PaginatedMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginatedMeta
}
