export interface WallpaperClassifyRow {
  id: number | string
  name: string
  picUrl?: string
  select?: boolean
  sort?: number
  createTime?: string | null
  updateTime?: string | null
}

export interface WallpaperClassifyQuery {
  name: string
}

export interface WallpaperClassifyFormValue {
  id?: number | string
  name: string
  picUrl: string
  select: boolean
  sort: number
}
