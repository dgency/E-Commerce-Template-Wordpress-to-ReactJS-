import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Utility component for scroll restoration on route change.
 * Automatically scrolls to top when pathname changes, unless a hash is present.
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash (e.g. /page#section), skip scroll restoration
    if (hash) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;