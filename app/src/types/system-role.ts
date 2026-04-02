export interface SystemRoleRow {
  id: number | string
  name: string
  code: string
  status?: number
  sort?: number
  note?: string
  createTime?: string | null
  updateTime?: string | null
}

export interface SystemRoleQuery {
  name: string
}

export interface SystemRoleFormValue {
  id?: number | string
  name: string
  code: string
  status: number
  sort: number
  note: string
}

export interface SystemRolePermissionNode {
  id: number | string
  pid?: number | string
  title: string
  icon?: string
  checked?: boolean
  open?: boolean
  children?: SystemRolePermissionNode[]
}
