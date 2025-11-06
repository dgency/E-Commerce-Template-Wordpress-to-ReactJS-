import { useQuery } from "@tanstack/react-query";

export interface WordPressSiteInfo {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

// For full WordPress branding, don't force local fallbacks.
// (Intentionally no local fallback assets.)

export function useWordPressSiteInfo() {
  return useQuery<WordPressSiteInfo>({
    queryKey: ["wp-site-info"],
    queryFn: async () => {
      const base = import.meta.env.VITE_WP_API_URL;
      if (!base) throw new Error("VITE_WP_API_URL is not set");
  let info: Record<string, unknown> = {};
  let settings: Record<string, unknown> = {};
      try {
        const res = await fetch(`${base}/wp-json`);
        info = await res.json();
      } catch {
        // ignore
      }
      try {
        const settingsRes = await fetch(`${base}/wp-json/wp/v2/settings`);
        if (settingsRes.ok) settings = await settingsRes.json();
      } catch {
        // ignore
      }
      let logoUrl: string | null = null;
      let faviconUrl: string | null = null;
      // Try to get logo from custom_logo media
      if (settings?.custom_logo) {
        try {
          const logoRes = await fetch(`${base}/wp-json/wp/v2/media/${settings.custom_logo}`);
          if (logoRes.ok) {
            const logoJson = await logoRes.json();
            logoUrl = logoJson?.source_url ?? null;
          }
        } catch {
          // ignore
        }
      }
      // Favicon: site_icon_url or site_icon
      faviconUrl = typeof settings?.site_icon_url === "string"
        ? settings.site_icon_url
        : typeof info?.site_icon_url === "string"
        ? info.site_icon_url
        : null;
      // Keep nulls if WP doesn't provide assets; components should handle gracefully
      return {
        name: typeof settings?.title === "string" ? settings.title : typeof info?.name === "string" ? info.name : undefined,
        description: typeof settings?.description === "string" ? settings.description : typeof info?.description === "string" ? info.description : undefined,
        logoUrl,
        faviconUrl,
      };
    },
    staleTime: 600_000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
