import type { DashboardHeatmap } from "@/types/api/dashboard-stats";

export interface WeekDot {
  date: string;
  words: number;
  level: number;
  label: string;
}

// 周一为一周第一天
const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// 以传入"今天"（YYYY-MM-DD）为基准回退到本周一
function mondayOf(today: string): Date {
  const [y, m, d] = today.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const dow = base.getDay(); // 0=周日, 1=周一, … 6=周六
  const offset = dow === 0 ? -6 : 1 - dow;
  base.setDate(base.getDate() + offset);
  return base;
}

// 本周（周一→周日）固定 7 格；尚未到来或无记录的日期 words=0、level=0，
// 自然不计入"本周已记录"。heatmap.cells 末项即后端口径下的今天。
export function buildWeekDots(heatmap: DashboardHeatmap | null): WeekDot[] {
  const cells = heatmap?.cells;
  if (!cells?.length) return [];

  const buckets = heatmap!.buckets?.length ? heatmap!.buckets : [0, 500, 1500, 3000];
  const wordsByDate = new Map(cells.map((c) => [c.date, c.words]));
  const monday = mondayOf(cells[cells.length - 1].date);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const date = fmtDate(day);
    const words = wordsByDate.get(date) ?? 0;
    let level = 0;
    if (words > 0) {
      if (words >= buckets[3]) level = 4;
      else if (words >= buckets[2]) level = 3;
      else if (words >= buckets[1]) level = 2;
      else level = 1;
    }
    return { date, words, level, label: WEEK_LABELS[i] };
  });
}

export function countWeekRecorded(dots: WeekDot[]): number {
  return dots.filter((d) => d.words > 0).length;
}
