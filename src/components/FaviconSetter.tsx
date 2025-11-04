import { useEffect } from "react";
import { useWordPressSiteAssets } from "@/hooks/useWordPressSiteAssets";

export const FaviconSetter = () => {
  const { data } = useWordPressSiteAssets();

  useEffect(() => {
    if (!data?.faviconUrl) return;
    const href = data.faviconUrl;
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];
    rels.forEach((rel) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    });
  }, [data?.faviconUrl]);

  return null;
};

export default FaviconSetter;
