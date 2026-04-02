export interface WorkDailyPlatformEntry {
  platformId: number | string | null
  platformName: string
  content: string
}

export interface WorkDailyContent {
  platforms: WorkDailyPlatformEntry[]
}

export interface WorkDailyRow {
  id: number | string
  logDate: string
  content: WorkDailyContent
  createTime?: string
  updateTime?: string
}

export interface WorkDailyQuery {
  platformId: number | string | null
  dateRange: [string, string] | []
  content: string
}

export interface WorkDailyFormValue {
  id?: number | string
  logDate: string
  platforms: WorkDailyPlatformEntry[]
}

export interface WorkDailyReportModelOptions {
  models: string[]
  currentModel: string
}

export type WorkDailyReportType = 'month' | 'week' | 'year'

export interface WorkDailyReportRequest {
  month?: string
  startDate?: string
  endDate?: string
  year?: string
  model?: string
}

export interface WorkDailyImportPayload {
  file: File
  year?: string
}

export interface WorkDailyImportResult {
  count: number
}

export interface WorkDailyPlatformOption {
  id: number | string
  name: string
  status?: number
  sort?: number
}
