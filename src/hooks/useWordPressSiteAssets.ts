import { useQuery } from "@tanstack/react-query";

export type SiteAssets = {
  logoUrl: string | null;
  faviconUrl?: string | null;
  siteUrl?: string;
};

export const useWordPressSiteAssets = () => {
  return useQuery<SiteAssets>({
    queryKey: ["wp-site-assets"],
    queryFn: async ({ signal }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Missing Supabase env vars; skipping site assets fetch.");
        return { logoUrl: null, faviconUrl: null } satisfies SiteAssets;
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/wordpress-site-assets`, {
        headers: { Authorization: `Bearer ${supabaseAnonKey}` },
        signal,
      });
      if (!res.ok) return { logoUrl: null, faviconUrl: null } satisfies SiteAssets;
      const data = await res.json();
      const logoUrl = typeof data?.logoUrl === "string" ? data.logoUrl : null;
      const faviconUrl = typeof data?.faviconUrl === "string" ? data.faviconUrl : null;
      return { logoUrl, faviconUrl, siteUrl: data?.siteUrl } satisfies SiteAssets;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
