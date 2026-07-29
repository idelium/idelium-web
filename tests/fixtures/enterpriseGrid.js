export function enterpriseGridRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Record ${String(index + 1).padStart(4, "0")}`,
    status: index % 2 === 0 ? "active" : "inactive",
  }));
}

export const ENTERPRISE_GRID_FIXTURE_SIZES = Object.freeze([0, 1, 100, 1_000]);

export const MALFORMED_ENTERPRISE_GRID_ROWS = Object.freeze([
  null,
  {},
  { id: null, name: "Missing identity" },
  { id: 1, name: { protected: "Complex value" } },
]);
