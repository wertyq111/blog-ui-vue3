export interface WorkPlatformRow {
  id: number | string
  name: string
  status: number
  sort: number
  createTime?: string
  updateTime?: string
}

export interface WorkPlatformQuery {
  name: string
  status: number | null
}

export interface WorkPlatformFormValue {
  id?: number | string
  name: string
  status: number
  sort: number
}

export interface WorkPlatformReorderItem {
  id: number | string
  sort: number
}
