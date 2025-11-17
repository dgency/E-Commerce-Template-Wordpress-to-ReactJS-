import { useQuery } from "@tanstack/react-query";
import { functionsFetch } from "@/lib/http/supabaseFunctions";

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  parent?: number;
  children?: MenuItem[];
}

export const useWordPressMenus = (menuLocation: string = "main-menu") => {
  return useQuery<MenuItem[]>({
    queryKey: ["wp-menu", menuLocation],
    queryFn: async () => {
      const response = await functionsFetch(`/wordpress-menus?location=${encodeURIComponent(menuLocation)}`);
      
      if (!response.ok) {
        console.warn("Failed to fetch menu from WordPress");
        return []; // Return empty array on error
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
};
