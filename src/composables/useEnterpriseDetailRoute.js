const SAFE_DETAIL_ID = /^[a-zA-Z0-9_.:-]{1,128}$/;

export function createEnterpriseDetailRouteController({
  route,
  router,
  queryKey = "detail",
}) {
  function current() {
    const value = String(route.query[queryKey] ?? "");
    return SAFE_DETAIL_ID.test(value) ? value : null;
  }

  function open(entityId) {
    const value = String(entityId ?? "");
    if (!SAFE_DETAIL_ID.test(value)) {
      throw new TypeError("Detail routes require a stable safe entity ID.");
    }
    return router.push({
      query: { ...route.query, [queryKey]: value },
    });
  }

  function close() {
    const query = { ...route.query };
    delete query[queryKey];
    return router.push({ query });
  }

  return { close, current, open };
}
