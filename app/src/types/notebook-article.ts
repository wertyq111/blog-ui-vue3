export interface NotebookArticleLabelOption {
  id: number | string
  name: string
}

export interface NotebookArticleCategoryOption {
  id: number | string
  name: string
  labels?: NotebookArticleLabelOption[]
}

export interface NotebookArticleRow {
  id: number | string
  title: string
  content?: string
  cover?: string
  viewStatus?: boolean
  viewCount?: number
  likeCount?: number
  recommendStatus?: boolean
  commentStatus?: boolean
  categoryId?: number | string
  labelId?: number | string
  category?: NotebookArticleCategoryOption
  label?: NotebookArticleLabelOption
  member?: {
    id?: number | string
    nickname?: string
  }
  createTime?: string | null
  updateTime?: string | null
}

export interface NotebookArticleQuery {
  title: string
  categoryId: number | string | ''
  labelId: number | string | ''
}

export interface NotebookArticleFormValue {
  id?: number | string
  title: string
  content: string
  cover: string
  categoryId: number | string | ''
  labelId: number | string | ''
  viewStatus: boolean
  commentStatus: boolean
  recommendStatus: boolean
  password: string
}
