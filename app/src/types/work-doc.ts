export interface WorkDocCategoryRow {
  id: number | string
  parentId: number
  name: string
  icon: string
  description: string
  sort: number
  status: number
  children?: WorkDocCategoryRow[]
}

export interface WorkDocCategoryQuery {
  status: number | null
}

export interface WorkDocCategoryFormValue {
  id?: number | string
  parentId: number
  name: string
  icon: string
  description: string
  sort: number
  status: number
}

export interface WorkDocCategoryReorderItem {
  id: number | string
  parentId: number
  sort: number
}

export interface WorkDocCategoryOption {
  id: number | string
  name: string
}

export interface WorkDocRow {
  id: number | string
  categoryId: number | string | null
  title: string
  content: string
  templateType: string
  tags: string[]
  status: number
  priority: number
  source: string
  isPin: number
  category?: WorkDocCategoryOption | null
  createTime?: string
  updateTime?: string
}

export interface WorkDocQuery {
  keyword: string
  status: number | null
  templateType: string | null
  categoryId: number | string | null
}

export interface WorkDocFormValue {
  id?: number | string
  categoryId: number | string | null
  title: string
  content: string
  templateType: string
  tags: string[]
  status: number
  priority: number
  source: string
  isPin: number
}
