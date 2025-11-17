import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useWordPressMenu, WPMenuItem } from "@/hooks/useWordPressMenu";

function convertToRelative(url: string) {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function useMenuLocation(): string {
  const loc = import.meta.env.VITE_WP_MENU_LOCATION as string | undefined;
  return loc && loc.trim().length > 0 ? loc : "main-menu";
}

function MenuList({ items, depth = 0 }: { items: WPMenuItem[]; depth?: number }) {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-4 lg:gap-6">
      {items.map((item) => {
        const to = convertToRelative(item.url);
        const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        return (
          <div key={item.id} className="group relative">
            <Link
              to={to}
              className={`text-sm font-medium transition-colors whitespace-nowrap hover:text-primary ${active ? "text-primary" : "text-foreground"}`}
            >
              {item.title}
            </Link>

            {hasChildren && (
              <div className="absolute left-0 top-full hidden group-hover:block bg-background border border-border shadow-md rounded-md p-3 min-w-[220px] z-50">
                <div className="flex flex-col">
                  {item.children!.map((child) => {
                    const childTo = convertToRelative(child.url);
                    const childActive = location.pathname === childTo || (childTo !== "/" && location.pathname.startsWith(childTo));
                    const childHasChildren = Array.isArray(child.children) && child.children.length > 0;

                    return (
                      <div key={child.id} className="group/item relative">
                        <Link
                          to={childTo}
                          className={`block py-1.5 px-3 rounded-sm transition-colors hover:text-primary ${childActive ? "text-primary" : "text-foreground"}`}
                        >
                          {child.title}
                        </Link>
                        {childHasChildren && (
                          <div className="absolute left-full top-0 ml-1 hidden group-hover/item:block bg-background border border-border shadow-md rounded-md p-3 min-w-[220px] z-50">
                            <div className="flex flex-col">
                              {child.children!.map((gchild) => {
                                const gTo = convertToRelative(gchild.url);
                                const gActive = location.pathname === gTo || (gTo !== "/" && location.pathname.startsWith(gTo));
                                return (
                                  <Link
                                    key={gchild.id}
                                    to={gTo}
                                    className={`block py-1.5 px-3 rounded-sm transition-colors hover:text-primary ${gActive ? "text-primary" : "text-foreground"}`}
                                  >
                                    {gchild.title}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function WPMenu() {
  const location = useMenuLocation();
  const { data, isLoading, error } = useWordPressMenu(location);

  const menu = useMemo(() => data?.menu ?? [], [data]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load menu
      </div>
    );
  }

  if (!menu.length) {
    return (
      <nav className="flex items-center gap-4 lg:gap-6">
        <Link to="/shop" className="text-sm font-medium hover:text-primary">All Products</Link>
      </nav>
    );
  }

  return <MenuList items={menu} />;
}
