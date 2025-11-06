/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useWordPressSiteInfo, type WordPressSiteInfo } from "@/hooks/useWordPressSiteInfo";

const SiteBrandContext = createContext<WordPressSiteInfo | null>(null);

export const SiteBrandProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { data } = useWordPressSiteInfo();
  // Favicon is handled by FaviconSetter; this provider just supplies brand data.
  return <SiteBrandContext.Provider value={data}>{children}</SiteBrandContext.Provider>;
};

export const useSiteBrand = () => useContext(SiteBrandContext);
