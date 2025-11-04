import md5 from "blueimp-md5";

/**
 * Build a Gravatar URL from an email address.
 * - Email is lowercased and trimmed before hashing
 * - Uses identicon as default to always render something
 */
export function gravatarUrl(
  email?: string | null,
  options?: { size?: number; defaultImage?: string }
): string {
  const normalized = (email || "").trim().toLowerCase();
  const hash = md5(normalized);
  const size = options?.size ?? 160; // reasonable default for avatars
  const d = encodeURIComponent(options?.defaultImage ?? "identicon");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${d}`;
}
