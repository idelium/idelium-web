const DEFAULT_API_BASE_URL = "/api/";
const DEFAULT_PUBLIC_SITE_URL = "https://github.com/idelium";

function normalizeUrl(value, fallback) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const normalized = candidate || fallback;
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function resolveApiBaseUrl(env = import.meta.env) {
  return normalizeUrl(env?.VITE_IDELIUM_API_BASE_URL, DEFAULT_API_BASE_URL);
}

export function resolvePublicSiteUrl(env = import.meta.env) {
  return normalizeUrl(
    env?.VITE_IDELIUM_PUBLIC_SITE_URL,
    DEFAULT_PUBLIC_SITE_URL,
  );
}
