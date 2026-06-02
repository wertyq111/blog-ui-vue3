/**
 * 工作日常动森图标：把内容里约定的 emoji 升级渲染成动森风 SVG。
 *
 * 设计取舍（见知识库「工作日常内容写作规范」）：内容里仍写 emoji（全平台可读、可移植、
 * 三边 skill 零改动），只在 md-editor-v3 预览里通过 markdown-it 插件把这 18 个已知 emoji
 * 替换为内联 <img>，指向 public/icons/work-daily/<key>.svg。其它地方（Obsidian / API /
 * 列表视图）仍显示 emoji，不破坏。
 */
import { config } from "md-editor-v3";

/** 18 个类别 emoji → SVG 文件名（与 public/icons/work-daily/*.svg 对应）。 */
const EMOJI_TO_KEY: Record<string, string> = {
  "🍃": "need", // 需求开发
  "🐛": "bug", // Bug修复
  "📜": "doc", // 文档编写
  "🦴": "research", // 技术调研
  "✈️": "deploy", // 部署运维（带变体选择符）
  "✈": "deploy", // 部署运维（无变体选择符兜底）
  "🧹": "refactor", // 代码重构
  "🌱": "learn", // 学习成长
  "💬": "meeting", // 会议沟通
  "👀": "review", // 代码审查
  "🐝": "urgent", // 紧急线上故障
  "🥬": "stats", // 数据统计
  "💰": "finance", // 财务管理
  "🎨": "design", // 视觉设计
  "🧱": "infra", // 基础设施
  "💦": "daily", // 日常打卡
  "🍾": "feedback", // 用户互动
  "🚁": "rollback", // 备份回滚
  "🎈": "event", // 运营活动
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 长 key 在前，保证 "✈️"（含 FE0F）先于 "✈" 命中
const KEYS = Object.keys(EMOJI_TO_KEY).sort((a, b) => b.length - a.length);
const EMOJI_RE = new RegExp("(" + KEYS.map(escapeRe).join("|") + ")", "g");

/** markdown-it 插件：把行内文本里的类别 emoji 替换成 <img> SVG 图标。 */
function workDailyIconPlugin(md: any): void {
  md.core.ruler.push("wd_cat_icon", (state: any) => {
    for (const block of state.tokens) {
      if (block.type !== "inline" || !block.children) continue;

      const out: any[] = [];
      for (const tok of block.children) {
        if (tok.type !== "text" || !EMOJI_RE.test(tok.content)) {
          out.push(tok);
          continue;
        }

        EMOJI_RE.lastIndex = 0;
        const text: string = tok.content;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = EMOJI_RE.exec(text)) !== null) {
          if (m.index > last) {
            const t = new state.Token("text", "", 0);
            t.content = text.slice(last, m.index);
            out.push(t);
          }
          const key = EMOJI_TO_KEY[m[0]];
          const img = new state.Token("html_inline", "", 0);
          img.content = `<img class="wd-cat-ico" src="/icons/work-daily/${key}.svg" alt="${m[0]}" />`;
          out.push(img);
          last = m.index + m[0].length;
        }
        if (last < text.length) {
          const t = new state.Token("text", "", 0);
          t.content = text.slice(last);
          out.push(t);
        }
      }
      block.children = out;
    }
  });
}

let registered = false;

/** 注册工作日常图标渲染（全局只需一次；幂等）。 */
export function registerWorkDailyIcons(): void {
  if (registered) return;
  registered = true;
  config({
    markdownItConfig(md: any) {
      md.use(workDailyIconPlugin);
    },
  });
}
