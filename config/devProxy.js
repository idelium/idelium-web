export function resolveDevApiProxyTarget(env = process.env) {
  const target = String(env.VITE_IDELIUM_DEV_API_TARGET ?? "").trim();
  return target || "https://localhost";
}
