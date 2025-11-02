import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import { useMediaQuery } from "@/hooks/use-mobile";
import { X } from "lucide-react";

type FilterTerms = {
  brand: string[];
  color: string[];
  size: string[];
};

type SelectedFilters = {
  category: string[];
  brand: string[];
  color: string[];
  size: string[];
};

interface FilterSidebarProps {
  onFilterChange?: (filters: SelectedFilters) => void;
  drawerOpen?: boolean;
  setDrawerOpen?: (open: boolean) => void;
}

export default function FilterSidebar({
  onFilterChange,
  drawerOpen,
  setDrawerOpen,
}: FilterSidebarProps) {
  const { data: categories = [] } = useWooCommerceCategories();
  const [terms] = useState<FilterTerms>({
    brand: ["Nike", "Adidas", "Puma"],
    color: ["Red", "Blue", "Green"],
    size: ["S", "M", "L", "XL"],
  });
  const [selected, setSelected] = useState<SelectedFilters>({
    category: [],
    brand: [],
    color: [],
    size: [],
  });

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(selected).forEach(([key, values]) => {
      if (values.length) params.set(key, values.join(","));
    });
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [selected]);

  // Debounce filter change
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange?.(selected);
    }, 300);
    return () => clearTimeout(handler);
  }, [selected, onFilterChange]);

  // Lock scroll when drawer open
  useEffect(() => {
    if (!isDesktop && drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [drawerOpen, isDesktop]);

  function handleChange(key: keyof SelectedFilters, value: string) {
    setSelected((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function handleClearAll() {
    setSelected({
      category: [],
      brand: [],
      color: [],
      size: [],
    });
  }

  function handleApplyFilters() {
    setDrawerOpen?.(false);
    onFilterChange?.(selected);
  }

  // Main sidebar/drawer content
  const filterContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading text-lg text-muted-foreground">
          Filters
        </span>
      </div>

      {/* Clear All button */}
      <Button
        variant="outline"
        size="sm"
        className="mb-4 w-full font-medium"
        onClick={handleClearAll}
      >
        Clear All Filters
      </Button>

      {/* Accordion Filters */}
      <Accordion type="multiple" defaultValue={["category"]} className="mb-2">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selected.category.includes(cat.slug)}
                  onChange={() => handleChange("category", cat.slug)}
                  className="accent-pink-500 rounded focus:ring-2 focus:ring-pink-300"
                />
                <span className="text-muted-foreground">{cat.name}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>

        {Object.entries(terms).map(([key, values]) => (
          <AccordionItem value={key} key={key}>
            <AccordionTrigger>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </AccordionTrigger>
            <AccordionContent>
              {values.map((term) => (
                <label key={term} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={selected[key as keyof SelectedFilters].includes(term)}
                    onChange={() =>
                      handleChange(key as keyof SelectedFilters, term)
                    }
                    className="accent-pink-500 rounded focus:ring-2 focus:ring-pink-300"
                  />
                  <span className="text-muted-foreground">{term}</span>
                </label>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Mobile action bar */}
      {!isDesktop && (
        <div className="mt-auto pt-2 pb-4 sticky bottom-0 bg-gradient-to-t from-white via-gray-50 to-transparent backdrop-blur-sm">
          <div className="flex gap-2 px-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Desktop: Sticky Sidebar | Mobile: Drawer content only (no extra SheetClose)
  return isDesktop ? (
    <aside className="lg:sticky lg:top-24 h-[calc(100vh-7rem)] w-64 p-4 bg-gradient-to-b from-white via-gray-50 to-gray-100 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 flex flex-col">
      {filterContent}
    </aside>
  ) : (
    filterContent
  );
}
