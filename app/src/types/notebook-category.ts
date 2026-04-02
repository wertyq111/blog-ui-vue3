export interface NotebookCategoryRow {
  id: number | string
  name: string
  description?: string
  priority?: number
  createTime?: string | null
  updateTime?: string | null
}

export interface NotebookCategoryQuery {
  name: string
}

export interface NotebookCategoryFormValue {
  id?: number | string
  name: string
  description: string
  priority: number
}
