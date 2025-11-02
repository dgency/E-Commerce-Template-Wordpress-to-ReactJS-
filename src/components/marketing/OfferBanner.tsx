import React, { useEffect, useMemo, useState } from "react";

type OfferBannerProps = {
  href?: string;
  alt?: string;
  className?: string;
  height?: number; // optional min-height; remove to use ratio box
};

const OfferBanner: React.FC<OfferBannerProps> = ({
  href = (import.meta.env.VITE_GLOBAL_OFFER_HREF as string) || "",
  alt = (import.meta.env.VITE_GLOBAL_OFFER_ALT as string) || "Special offer",
  className = "",
  height,
}) => {
  const raw = (import.meta.env.VITE_GLOBAL_OFFER_IMG as string) || "";
  const ver = import.meta.env.VITE_GLOBAL_OFFER_IMG_VERSION
    ? `?v=${import.meta.env.VITE_GLOBAL_OFFER_IMG_VERSION}`
    : "";
  const base = (import.meta.env.BASE_URL as string) || "/";

  // Build candidates from the env path:
  // 1) use as-is
  // 2) if it's relative, try "/relative"
  // 3) also try with BASE_URL prefix for subpath deploys
  const candidates = useMemo(() => {
    if (!raw) return [] as string[];
    const list = new Set<string>();

    // as-is (works for absolute URLs and root "/path")
    list.add(raw + ver);

    // if relative (no http(s) and no leading slash), try root-prefixed
    if (!/^https?:\/\//i.test(raw) && !raw.startsWith("/")) {
      list.add("/" + raw + ver);
      const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
      list.add(`${normalizedBase}/${raw}${ver}`);
    }

    // if root path and we have a non-root BASE_URL, try prefixing
    if (raw.startsWith("/")) {
      const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
      list.add(`${normalizedBase}${raw}${ver}`);
    }

    return Array.from(list);
  }, [raw, ver, base]);

  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setIdx(0);
    setHidden(false);
  }, [raw, ver]);

  if (!raw || hidden || candidates.length === 0) return null;

  const current = candidates[Math.min(idx, candidates.length - 1)];

  const handleError = () => {
    if (idx < candidates.length - 1) {
      setIdx((i) => i + 1); // try next candidate
    } else {
      // nothing worked; hide the banner
      // (also log once for debugging)
      console.warn("[OfferBanner] Failed to load image from:", candidates);
      setHidden(true);
    }
  };

  const Img = (
    <img
      src={current}
      alt={alt}
      width={1920}
      height={540}
      loading="lazy"
      decoding="async"
      sizes="100vw"
      className="absolute inset-0 h-full w-full object-cover"
      onError={handleError}
    />
  );

  // If height provided, use minHeight (fluid width). Otherwise, use a ratio box.
  const wrapperBase =
    "relative w-full overflow-hidden rounded-xl " + (className || "");

  if (typeof height === "number" && Number.isFinite(height)) {
    return (
      <div className={wrapperBase} style={{ minHeight: height }} aria-label="Global offer">
        {href ? (
          <a className="block h-full w-full" href={href} target="_blank" rel="noopener noreferrer">
            {Img}
          </a>
        ) : (
          Img
        )}
      </div>
    );
  }

  // Ratio box (~3.55:1) to avoid CLS
  return (
    <div className={wrapperBase} aria-label="Global offer">
      <div className="block" style={{ paddingTop: "28%" }} />
      {href ? (
        <a className="block absolute inset-0" href={href} target="_blank" rel="noopener noreferrer">
          {Img}
        </a>
      ) : (
        Img
      )}
    </div>
  );
};

export default OfferBanner;
