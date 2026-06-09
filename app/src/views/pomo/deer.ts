// 小鹿形象：状态 → 图片 URL（Vite 资源导入，构建期 hash + 缓存）
import deerIdle from "@/assets/pomo/deer-idle.png";
import deerFocus from "@/assets/pomo/deer-focus.png";
import deerRest from "@/assets/pomo/deer-rest.png";
import deerCelebrate from "@/assets/pomo/deer-celebrate.png";
import deerList from "@/assets/pomo/deer-list.png";

export type DeerState = "idle" | "focus" | "rest" | "celebrate" | "list";

const DEER_MAP: Record<DeerState, string> = {
  idle: deerIdle,
  focus: deerFocus,
  rest: deerRest,
  celebrate: deerCelebrate,
  list: deerList,
};

export function deerSrc(state: DeerState): string {
  return DEER_MAP[state] ?? deerIdle;
}
