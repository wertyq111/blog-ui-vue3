export interface DashboardKpiItem {
  value: number
  delta_7d: number
}

export interface DashboardStreakItem {
  value: number
  hint: string
}

export interface DashboardLongestStreak {
  value: number
  start: string | null
  end: string | null
}

export interface DashboardPeakHour {
  hour: number | null
  period: string | null
  label: string
}

export interface DashboardFavoritePlatform {
  platform_id: number
  name: string
  words: number
  logs: number
  percent: number
}

export interface DashboardMetrics {
  total_words: DashboardKpiItem
  total_logs: DashboardKpiItem
  total_docs: DashboardKpiItem
  active_days: DashboardKpiItem
  current_streak: DashboardStreakItem
  longest_streak: DashboardLongestStreak
  peak_hour: DashboardPeakHour
  favorite_platform: DashboardFavoritePlatform | null
  hour_dist: number[]
  week_dist: number[]
}

export interface DashboardHeatmapCell {
  date: string
  words: number
  logs: number
}

export interface DashboardHeatmap {
  buckets: number[]
  cells: DashboardHeatmapCell[]
}

export interface DashboardTrendItem {
  date: string
  words: number
}

export interface DashboardPlatformDist {
  name: string
  words: number
  pct: number
}

export interface DashboardRecentLog {
  id: number
  log_date: string
  content: any
  create_time: number
  tags?: string[]
}

export interface DashboardTagRanking {
  name: string
  count: number
}

export interface DashboardOverviewData {
  view: string
  range: string
  generated_at: number
  cache_hit: boolean
  metrics: DashboardMetrics
  heatmap: DashboardHeatmap
  trend_30d: DashboardTrendItem[]
  platform_dist: DashboardPlatformDist[]
  recent_logs: DashboardRecentLog[]
  tag_ranking?: DashboardTagRanking[]
}
