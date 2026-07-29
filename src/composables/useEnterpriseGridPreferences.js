import {
  sanitizeGridPreferences,
  storageKeyForGrid,
} from "@/domain/enterpriseGrid";

export function createEnterpriseGridPreferencesController({
  storage,
  scope,
  columns,
}) {
  const key = storageKeyForGrid(scope);

  function defaults() {
    return sanitizeGridPreferences(null, columns);
  }

  function load() {
    if (!storage) return defaults();
    try {
      const value = JSON.parse(storage.getItem(key) || "null");
      return sanitizeGridPreferences(value, columns);
    } catch {
      storage.removeItem(key);
      return defaults();
    }
  }

  function save(preferences) {
    const sanitized = sanitizeGridPreferences(preferences, columns);
    storage?.setItem(key, JSON.stringify(sanitized));
    return sanitized;
  }

  function reset() {
    storage?.removeItem(key);
    return defaults();
  }

  return { defaults, key, load, reset, save };
}
