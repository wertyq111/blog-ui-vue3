export interface NotebookLabelCategoryOption {
  id: number | string
  name: string
}

export interface NotebookLabelRow {
  id: number | string
  name: string
  description?: string
  categoryId?: number | string
  category?: NotebookLabelCategoryOption
  createTime?: string | null
  updateTime?: string | null
}

export interface NotebookLabelQuery {
  name: string
}

export interface NotebookLabelFormValue {
  id?: number | string
  categoryId: number | string | ''
  name: string
  description: string
}
