/** 首页 KPI 的展示值（均已格式化为字符串） */
export interface HomeStats {
  /** 本年字数，如 17.5w */
  words: string;
  /** 累计日志条数 */
  logs: string;
  /** 最长连续天数 */
  streak: string;
  /** 高产时段，如 下午 */
  peak: string;
}
