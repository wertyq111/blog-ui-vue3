export interface SystemMenuRow {
  id: number | string
  pid: number | string
  title: string
  icon?: string
  path?: string
  component?: string
  target?: string | number
  permission?: string
  type: number
  status: number
  hide: number
  sort: number
  note?: string
  checkedList?: number[]
  children?: SystemMenuRow[]
}

export interface SystemMenuQuery {
  title: string
}

export interface SystemMenuFormValue {
  id?: number | string
  pid: number | string | null
  title: string
  icon: string
  path: string
  component: string
  target: number
  permission: string
  type: number
  status: number
  hide: number
  sort: number
  note: string
  checkedList: number[]
}

export interface SystemMenuOptionNode {
  id: number | string
  label: string
  children?: SystemMenuOptionNode[]
}

export interface SystemMenuPermissionOption {
  key: number
  label: string
}
