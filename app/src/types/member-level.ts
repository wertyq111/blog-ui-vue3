export interface MemberLevelRow {
  id: number | string
  name: string
  sort?: number | string | null
  status?: number | string | null
  createTime?: string | null
  updateTime?: string | null
}

export interface MemberLevelQuery {
  name: string
}

export interface MemberLevelFormValue {
  id?: number | string
  name: string
  sort: number
}
