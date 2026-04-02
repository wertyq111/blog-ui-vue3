export interface PhotoCategoryRow {
  id: number | string
  memberId?: number | string
  name: string
  createTime?: string | null
  updateTime?: string | null
}

export interface PhotoCategoryQuery {
  name: string
}

export interface PhotoCategoryFormValue {
  id?: number | string
  name: string
}
