export interface ServerPathRow {
  id: number | string
  code: string
  name: string
  url: string
  target: string
  sources: string[]
  sort: number
  createTime?: string
  updateTime?: string
}

export interface ServerPathQuery {
  name: string
}

export interface ServerPathFormValue {
  id?: number | string
  code: string
  name: string
  url: string
  target: string
  sources: string[]
  sort: number
}

export interface ServerPathConvertValue {
  path: string
}
