export interface WallpaperClassifyOption {
  id: number | string
  name: string
}

export interface WallpaperClassifyInfo {
  id?: number | string
  name?: string
}

export interface WallpaperRow {
  id: number | string
  classId?: number | string
  classify?: WallpaperClassifyInfo
  nickname?: string
  url?: string
  smallPicUrl?: string
  description?: string
  tags?: string[] | string
  score?: number
  createTime?: string | null
  updateTime?: string | null
}

export interface WallpaperQuery {
  classId: number | string | ''
  nickname: string
}

export interface WallpaperFormValue {
  id?: number | string
  classId: number | string | ''
  nickname: string
  url: string
  smallPicUrl: string
  description: string
  tags: string[]
  score: number
}
