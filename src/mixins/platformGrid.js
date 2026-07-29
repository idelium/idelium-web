import {
  isGridRouteQueryKey,
  parseGridResponse,
  parseGridRouteQuery,
  serializeGridRouteQuery,
} from "@/domain/enterpriseGrid";

export const PLATFORM_GRID_SORTS = [
  "id",
  "name",
  "brand",
  "model",
  "version",
  "hostname",
  "osDescription",
  "browserDescription",
  "status",
];
export const PLATFORM_GRID_FILTERS = [
  "brand",
  "browser",
  "location",
  "os",
  "status",
];

export const platformGrid = {
  data() {
    return {
      platformGridError: null,
      platformGridLoading: false,
      platformGridMeta: {
        page: 1,
        pageSize: 25,
        total: 0,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      platformGridQuery: {
        page: 1,
        pageSize: 25,
        search: "",
        sort: "id",
        direction: "asc",
        filters: {},
      },
      platformGridSearch: "",
      platformGridSearchTimer: null,
      platformGridUpdatingRoute: false,
    };
  },
  computed: {
    platformGridCopy() {
      return this.language[this.config.currentLanguage].Platforms.Grid;
    },
    platformGridTableCopy() {
      return this.language[this.config.currentLanguage].DataTable;
    },
    platformGridSort() {
      return {
        field: this.platformGridQuery.sort,
        direction: this.platformGridQuery.direction,
      };
    },
  },
  created() {
    this.restorePlatformGridQuery();
  },
  beforeUnmount() {
    clearTimeout(this.platformGridSearchTimer);
  },
  methods: {
    restorePlatformGridQuery() {
      const parsed = parseGridRouteQuery(this.$route?.query || {}, {
        allowedFilters: PLATFORM_GRID_FILTERS,
        allowedSorts: PLATFORM_GRID_SORTS,
      });
      this.platformGridQuery = {
        page: parsed.page,
        pageSize: parsed.pageSize,
        search: parsed.search,
        sort: parsed.sort?.field || "id",
        direction: parsed.sort?.direction || "asc",
        filters: parsed.filters,
      };
      this.platformGridSearch = parsed.search;
    },
    applyPlatformGridResponse(response) {
      const result = parseGridResponse(response);
      this.platformGridMeta = result.meta;
      return result.rows;
    },
    platformGridRequestOptions() {
      const { filters, ...query } = this.platformGridQuery;
      return {
        params: {
          ...query,
          filter: filters,
        },
      };
    },
    async updatePlatformGridRoute(changes) {
      const next = { ...this.platformGridQuery, ...changes };
      if (
        changes.search !== undefined ||
        changes.sort !== undefined ||
        changes.direction !== undefined
      ) {
        next.page = 1;
      }
      this.platformGridQuery = next;
      if (this.$router && this.$route) {
        const preserved = Object.fromEntries(
          Object.entries(this.$route.query || {}).filter(
            ([key]) => !isGridRouteQueryKey(key),
          ),
        );
        this.platformGridUpdatingRoute = true;
        try {
          await this.$router.replace({
            query: {
              ...preserved,
              ...serializeGridRouteQuery(
                {
                  ...next,
                  sort: { field: next.sort, direction: next.direction },
                },
                {
                  allowedFilters: PLATFORM_GRID_FILTERS,
                  allowedSorts: PLATFORM_GRID_SORTS,
                },
              ),
            },
          });
        } finally {
          this.platformGridUpdatingRoute = false;
        }
      }
      return this.reloadPlatformGrid();
    },
    schedulePlatformGridSearch(value) {
      clearTimeout(this.platformGridSearchTimer);
      this.platformGridSearchTimer = setTimeout(() => {
        this.platformGridSearchTimer = null;
        this.updatePlatformGridRoute({ search: value });
      }, 250);
    },
    clearPlatformGridSearch() {
      this.platformGridSearch = "";
      return this.updatePlatformGridRoute({ search: "" });
    },
    changePlatformGridPage(page) {
      return this.updatePlatformGridRoute({
        page: Math.max(Number(page) || 1, 1),
      });
    },
    sortPlatformGrid(sort) {
      return this.updatePlatformGridRoute({
        sort: sort.field,
        direction: sort.direction,
      });
    },
    filterPlatformGrid(filters) {
      return this.updatePlatformGridRoute({ filters });
    },
  },
};
