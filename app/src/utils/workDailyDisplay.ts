/**
 * 工作日常内容提取工具（dashboard「最近日志」与后台「工作日常列表」共用）
 *
 * 后端 work-daily 内容可能是：
 *   - { platforms: [{ platform_id, content }, ...] }  —— 标准结构
 *   - 纯字符串                                          —— 兼容旧数据
 */

export function getRawText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "object" && Array.isArray((content as any).platforms)) {
    return ((content as any).platforms as Array<{ content?: string }>)
      .map((p) => p.content ?? "")
      .join("\n");
  }
  return String(content);
}

export function extractTitle(content: unknown, maxLen = 60): string {
  const raw = getRawText(content);
  const headingMatch = raw.match(/^#{1,4}\s+(.+)/m);
  if (headingMatch) return headingMatch[1].replace(/\*\*/g, "").trim().slice(0, maxLen);
  const firstLine = raw.split("\n").find((l) => l.trim().length > 0);
  return (firstLine || "").replace(/^#+\s*/, "").replace(/\*\*/g, "").trim().slice(0, maxLen) || "无标题";
}

export function extractDesc(content: unknown, maxLen = 120): string {
  const raw = getRawText(content);
  const lines = raw.split("\n").filter((l) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#") && !t.startsWith("|") && !t.startsWith("---");
  });
  const text = lines.slice(0, 2).join(" ").replace(/\*\*/g, "").replace(/<[^>]+>/g, "").trim();
  return text.slice(0, maxLen);
}

export function countWords(content: unknown): number {
  const raw = getRawText(content);
  return raw.replace(/<[^>]+>/g, "").replace(/\s+/g, "").length;
}
