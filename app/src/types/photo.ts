export interface PhotoCategoryOption {
  id: number | string
  name: string
}

export interface PhotoMemberInfo {
  id?: number | string
  nickname?: string
}

export interface PhotoRow {
  id: number | string
  url?: string
  smallPicUrl?: string
  remark?: string
  categoryId?: number | string
  category?: PhotoCategoryOption
  member?: PhotoMemberInfo
  createTime?: string | null
  updateTime?: string | null
}

export interface PhotoQuery {
  categoryId: number | string | ''
  remark: string
}

export interface PhotoFormValue {
  id?: number | string
  categoryId: number | string | ''
  url: string
  remark: string
}
