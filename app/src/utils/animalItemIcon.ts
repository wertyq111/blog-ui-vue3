/**
 * 动森物品图标加载器
 *
 * @description
 * 兼容自上游 animal-island-ui（MIT, guokaigdg）的 488 个物品图标 PNG。
 * 资产位于 `@/assets/animal-items/item-*.png`，按编号引用（编号非严格连续：
 * 实际范围 1~490，缺 488/489 两号，故一律以 itemNumberToPath 实测映射为准，
 * 不要假设 1~N 连续）。
 *
 * 仿上游机制用 Vite `import.meta.glob` 懒加载——488 个 PNG 不进主 bundle，
 * 仅在首次 resolve 某编号时按需取 chunk URL，并缓存复用。
 */

// query: "?url" + import: "default" → 每个 loader 调用后返回该 PNG 的最终 URL 字符串
const itemLoaders = import.meta.glob<string>("../assets/animal-items/item-*.png", {
  query: "?url",
  import: "default",
});

const itemNumberToPath: Record<number, string> = {};
for (const path of Object.keys(itemLoaders)) {
  const matched = /item-(\d+)\.png$/.exec(path);
  if (matched) {
    itemNumberToPath[Number(matched[1])] = path;
  }
}

/** 物品图标编号列表（升序，实测存在的编号，非 1~N 连续） */
export const ITEM_LIST: number[] = Object.keys(itemNumberToPath)
  .map(Number)
  .sort((a, b) => a - b);

/** 物品图标总数 */
export const ITEM_COUNT = ITEM_LIST.length;

const urlCache = new Map<number, string>();

/** 该编号是否存在对应图标 */
export function hasItem(item: number): boolean {
  return item in itemNumberToPath;
}

/**
 * 把存储值解析为有效的物品图标编号；解析不出或图标不存在则返回 null。
 * 接受 `item-42` / `item-042` / 裸数字 `42` / number；旧体系遗留值
 * （如 `icon-rabbit`、`menu-home`、`el-icon-xxx`）一律返回 null，由调用方回退。
 */
export function parseItemId(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isInteger(raw) && hasItem(raw) ? raw : null;
  }
  if (typeof raw === "string") {
    const matched = /^(?:item-)?0*(\d+)$/.exec(raw.trim());
    if (!matched) return null;
    const n = Number(matched[1]);
    return hasItem(n) ? n : null;
  }
  return null;
}

/** 把编号规范化为存储用的 item id 字符串，如 42 → "item-42" */
export function toItemId(item: number): string {
  return `item-${item}`;
}

/** 同步读缓存：命中返回 URL，未命中返回 undefined（用于二次渲染零延迟） */
export function getCachedItemUrl(item: number): string | undefined {
  return urlCache.get(item);
}

/**
 * 解析物品图标的 URL。命中缓存同步返回；未命中则异步加载 chunk 并缓存。
 * 业务侧可在 hover / 滚动等时机预热，避开首次 render 的空白闪烁。
 */
export async function resolveItemUrl(item: number): Promise<string | undefined> {
  const cached = urlCache.get(item);
  if (cached) return cached;

  const path = itemNumberToPath[item];
  if (!path) return undefined;

  const loader = itemLoaders[path];
  if (!loader) return undefined;

  const url = await loader();
  urlCache.set(item, url);
  return url;
}
