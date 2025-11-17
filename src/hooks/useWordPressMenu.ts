import { useQuery } from "@tanstack/react-query";

export interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  menu_item_parent: number;
  menu_order?: number;
  children?: WPMenuItem[];
}

interface WPMenuItemRaw {
  ID: number;
  title: string;
  url: string;
  menu_item_parent: number;
  menu_order?: number;
  // extra fields may exist but are not required
  [key: string]: unknown;
}

function normalizeApiBase(base: string) {
  const trimmed = base.replace(/\/$/, "");
  // If it already includes /wp-json, keep as-is; else append it
  return trimmed.endsWith("/wp-json") ? trimmed : `${trimmed}/wp-json`;
}

export function buildMenuTree(list: WPMenuItem[]): WPMenuItem[] {
  const map = new Map<number, WPMenuItem>();
  list.forEach((i) => map.set(i.id, { ...i, children: [] }));

  const tree: WPMenuItem[] = [];

  for (const item of map.values()) {
    const parentId = Number(item.menu_item_parent || 0);
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children!.push(item);
    } else {
      tree.push(item);
    }
  }

  const sortByOrder = (a: WPMenuItem, b: WPMenuItem) => (a.menu_order ?? 0) - (b.menu_order ?? 0);
  const sortTree = (nodes: WPMenuItem[]) => {
    nodes.sort(sortByOrder);
    nodes.forEach((n) => n.children && n.children.length && sortTree(n.children));
  };
  sortTree(tree);

  return tree;
}

export function useWordPressMenu(location: string) {
  return useQuery<{ menu: WPMenuItem[] }>({
    queryKey: ["wp-menu", location],
    queryFn: async () => {
      const base = import.meta.env.VITE_WP_API_URL as string | undefined;
      if (!base) throw new Error("VITE_WP_API_URL is not set");
      const api = normalizeApiBase(base);
      const endpoint = `${api}/custom/v1/menu/${location}`;

      const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`);
      const data = (await res.json()) as WPMenuItemRaw[];

      const flat: WPMenuItem[] = (Array.isArray(data) ? data : []).map((i) => ({
        id: Number(i.ID),
        title: String(i.title ?? ""),
        url: String(i.url ?? "#"),
        menu_item_parent: Number(i.menu_item_parent ?? 0),
        menu_order: typeof i.menu_order === "number" ? i.menu_order : undefined,
      }));

      const menu = buildMenuTree(flat);
      return { menu };
    },
    staleTime: 600_000,
    refetchOnWindowFocus: false,
  });
}
