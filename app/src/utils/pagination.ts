/**
 * 分页数据适配器
 *
 * 将后端分页响应信封转换为 vue3-element-admin 期望的格式
 *
 * 后端返回: { code: 0, data: T[], count: number, msg: "..." }
 * 使用 request 的 __returnEnvelope 标记获取完整信封
 */

import type { PageResult } from "@/types/api/common";

/** 后端分页响应信封（含 count） */
interface BackendEnvelope<T = any> {
  code: number;
  data: T[];
  count: number;
  msg: string;
}

/**
 * 将后端分页响应信封转换为前端 PageResult 格式
 *
 * 后端:   { code: 0, data: T[], count: N, msg: "..." }
 * 前端:   { list: T[], total: N }
 */
export function adaptPagination<T>(envelope: BackendEnvelope<T>): PageResult<T> {
  return {
    list: envelope.data ?? [],
    total: envelope.count ?? 0,
  };
}
