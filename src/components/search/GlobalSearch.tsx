import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import SearchResultItem from "@/components/search/SearchResultItem";

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  price?: number;
  images?: string[];
  image?: string;
  category?: string;
};

type CategoryLite = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

type GlobalSearchProps = {
  className?: string;
  placeholder?: string;
};

function useDebounced<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
  placeholder = "Search products…",
}) => {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounced(q, 200);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listId = React.useId();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const enableSearch = debouncedQ.trim().length >= 2;

  const {
    data: productData,
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
  } = useWooCommerceProducts({
    search: debouncedQ,
    per_page: 8,
    enabled: enableSearch,
  });

  const {
    data: categoryData,
    isLoading: loadingCategories,
    isFetching: fetchingCategories,
  } = useWooCommerceCategories({
    search: debouncedQ,
    per_page: 5,
    enabled: enableSearch,
  });

  const products = React.useMemo(
    () => (productData as ProductLite[] | undefined) ?? [],
    [productData]
  );
  const categories = React.useMemo(
    () => (categoryData as CategoryLite[] | undefined) ?? [],
    [categoryData]
  );

  const rows = React.useMemo(
    () => [
      ...products.map((p) => ({
        __type: "product" as const,
        id: p.id,
        title: p.name,
        slug: p.slug,
        price: p.price,
        thumbnail:
          Array.isArray(p.images) && p.images.length > 0
            ? p.images[0]
            : p.image,
        subtitle: p.category,
      })),
      ...categories.map((c) => ({
        __type: "category" as const,
        id: c.id,
        title: c.name,
        slug: c.slug,
        price: undefined as number | undefined,
        thumbnail: c.image,
        subtitle: "Category",
      })),
    ],
    [products, categories]
  );

  React.useEffect(() => {
    if (enableSearch) {
      setOpen(true);
      setActiveIndex(0);
    } else {
      setOpen(false);
    }
  }, [enableSearch, debouncedQ]);

  const moveActive = (dir: 1 | -1) => {
    if (!rows.length) return;
    setActiveIndex((prev) => {
      const next = (prev + dir + rows.length) % rows.length;
      return next;
    });
  };

  const onEnter = () => {
    if (!rows.length) {
      if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setOpen(false);
      return;
    }
    const item = rows[activeIndex];
    if (!item) {
      if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
      setOpen(false);
      return;
    }

    if (item.__type === "product") {
      navigate(`/product/${item.slug}`);
    } else {
      navigate(`/category/${item.slug}`);
    }
    setOpen(false);
  };

  const loading =
    loadingProducts ||
    fetchingProducts ||
    loadingCategories ||
    fetchingCategories;
  const showEmpty = enableSearch && !loading && rows.length === 0;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen && !enableSearch) {
        return;
      }
      setOpen(nextOpen);
    },
    [enableSearch]
  );

  return (
    <div className={`relative ${className ?? ""}`}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Anchor asChild>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              onFocus={() => setOpen(debouncedQ.trim().length >= 2)}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={
                rows[activeIndex]
                  ? `${listId}-item-${activeIndex}`
                  : undefined
              }
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveActive(1);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveActive(-1);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  onEnter();
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
            />
          </div>
        </PopoverPrimitive.Anchor>
        <PopoverContent
          side="bottom"
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 mt-1 rounded-lg bg-white border border-neutral-200 shadow-xl overflow-hidden"
          sideOffset={6}
        >
          <Command aria-label="Search suggestions">
            <CommandList
              id={listId}
              role="listbox"
              className="max-h-[60vh] overflow-auto"
            >
              {loading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : showEmpty ? (
                <CommandEmpty>No matches found.</CommandEmpty>
              ) : (
                <>
                  {products.length > 0 && (
                    <CommandGroup>
                      {products.map((p, idx) => {
                        const absolute = idx;
                        const active = activeIndex === absolute;
                        return (
                          <CommandItem
                            key={p.id}
                            id={`${listId}-item-${absolute}`}
                            value={p.slug}
                            onSelect={() => {
                              navigate(`/product/${p.slug}`);
                              setOpen(false);
                            }}
                            className="w-full px-2 data-[selected=true]:bg-transparent data-[selected=true]:text-foreground"
                          >
                            <SearchResultItem
                              active={active}
                              title={p.name}
                              subtitle={p.category}
                              price={p.price}
                              thumbnail={
                                Array.isArray(p.images) &&
                                p.images.length > 0
                                  ? p.images[0]
                                  : (p as ProductLite).image
                              }
                              onClick={() => {
                                navigate(`/product/${p.slug}`);
                                setOpen(false);
                              }}
                              onMouseEnter={() => setActiveIndex(absolute)}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                  {categories.length > 0 && (
                    <CommandGroup>
                      {categories.map((c, idx) => {
                        const absolute = products.length + idx;
                        const active = activeIndex === absolute;
                        return (
                          <CommandItem
                            key={c.id}
                            id={`${listId}-item-${absolute}`}
                            value={c.slug}
                            onSelect={() => {
                              navigate(`/category/${c.slug}`);
                              setOpen(false);
                            }}
                            className="w-full px-2 data-[selected=true]:bg-transparent data-[selected=true]:text-foreground"
                          >
                            <SearchResultItem
                              active={active}
                              title={c.name}
                              subtitle="Category"
                              price={undefined}
                              thumbnail={(c as CategoryLite).image}
                              onClick={() => {
                                navigate(`/category/${c.slug}`);
                                setOpen(false);
                              }}
                              onMouseEnter={() => setActiveIndex(absolute)}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>

            {/* ✅ See All Results footer */}
            {rows.length > 0 && (
              <div
                className="text-center py-3 border-t border-neutral-200 text-primary font-medium cursor-pointer hover:text-primary/80"
                onClick={() => {
                  navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
                  setOpen(false);
                }}
              >
                See all results
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default GlobalSearch;
