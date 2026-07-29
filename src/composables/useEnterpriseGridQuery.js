import {
  isGridRouteQueryKey,
  mergeGridRouteState,
  parseGridRouteQuery,
} from "@/domain/enterpriseGrid";

export function createEnterpriseGridQueryController({
  route,
  router,
  allowedFilters = [],
  allowedSorts = [],
  debounceMs = 250,
}) {
  const options = { allowedFilters, allowedSorts };
  let searchTimer = null;

  function current() {
    return parseGridRouteQuery(route.query, options);
  }

  function replace(changes) {
    const preserved = Object.fromEntries(
      Object.entries(route.query).filter(([key]) => !isGridRouteQueryKey(key)),
    );
    return router.replace({
      query: {
        ...preserved,
        ...mergeGridRouteState(route.query, changes, options),
      },
    });
  }

  function setSearch(search) {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      replace({ search });
      searchTimer = null;
    }, debounceMs);
  }

  function dispose() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = null;
  }

  return {
    current,
    dispose,
    replace,
    setSearch,
  };
}
