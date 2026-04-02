export interface InitModelRow {
  id: number | string
  code: string
  name: string
  tip: string
  template: string
  createTime?: string
  updateTime?: string
}

export interface InitModelQuery {
  code: string
  name: string
}

export interface InitModelFormValue {
  id?: number | string
  code: string
  name: string
  tip: string
  template: string
}

export interface InitModelConvertValue {
  column: string
}
