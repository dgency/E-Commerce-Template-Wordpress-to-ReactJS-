import { createContext, useContext } from "react";
import { useWordPressSiteInfo } from "@/hooks/useWordPressSiteInfo";

const SiteBrandContext = createContext<any>(null);

export const SiteBrandProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data } = useWordPressSiteInfo();

  // Dynamically update favicon
  if (data?.faviconUrl) {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link) link.href = data.faviconUrl;
    else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = data.faviconUrl;
      document.head.appendChild(newLink);
    }
  }

  return <SiteBrandContext.Provider value={data}>{children}</SiteBrandContext.Provider>;
};

export const useSiteBrand = () => useContext(SiteBrandContext);
