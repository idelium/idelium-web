export function createNoopGtag() {
  return {
    event() {},
  };
}

export async function installAnalytics(
  app,
  env = import.meta.env,
  loader = () => import("vue-gtag"),
) {
  app.config.globalProperties.$gtag = createNoopGtag();
  const tagId = String(env?.VITE_GOOGLE_TAG_ID ?? "").trim();
  if (!tagId) return false;

  try {
    const gtagModule = await loader();
    const createGtag = gtagModule?.createGtag;
    if (typeof createGtag !== "function") return false;
    app.use(createGtag({ tagId }));
    return true;
  } catch {
    return false;
  }
}
