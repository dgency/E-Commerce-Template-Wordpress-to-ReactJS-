import { useEffect } from "react";

export const FaviconSetter = () => {
  useEffect(() => {
    // Always use local /images/favicon.svg
    const href = "/images/favicon.svg";
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
  }, []);

  return null;
};

export default FaviconSetter;
