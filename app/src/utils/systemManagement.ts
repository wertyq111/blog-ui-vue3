import type { OptionItem } from "@/types/api";

export function isHttpUrl(url?: string): boolean {
  return !!url && (/^https?:\/\//.test(url) || url.startsWith("//"));
}

export function buildOptionTree<T extends { id: number; pid: number; title: string }>(
  flatList: T[]
): OptionItem[] {
  const map = new Map<number, OptionItem & { _pid: number }>();
  for (const item of flatList) {
    map.set(item.id, {
      value: item.id,
      label: item.title,
      children: [],
      _pid: item.pid,
    } as OptionItem & { _pid: number });
  }

  const roots: OptionItem[] = [];
  for (const node of map.values()) {
    const pid = node._pid;
    if (pid === 0 || !map.has(pid)) {
      roots.push(node);
    } else {
      const parent = map.get(pid)!;
      parent.children ??= [];
      parent.children.push(node);
    }
    delete (node as Partial<OptionItem & { _pid: number }>)._pid;
  }
  return roots;
}
