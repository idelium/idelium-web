export const SECRET_REFERENCE_CONTRACT_VERSION = "environment.secrets.v1";
export const SECRET_REFERENCE_METADATA_FIELDS = Object.freeze([
  "id",
  "name",
  "provider",
  "scope",
  "status",
  "lastValidatedAt",
  "capabilities",
  "usageCount",
]);

const MAX_REFERENCES = 250;
const SAFE_ID = /^[A-Za-z0-9_./:-]{1,200}$/;
const ALLOWED_STATUS = new Set(["active", "revoked", "expired", "unavailable"]);
const SENSITIVE_KEY =
  /(authorization|credential|password|private.?key|secret(?!Ref)|token|value)/i;

export function normalizeSecretReferenceCatalog(rawReferences, context = {}) {
  const tenantId = normalizeId(context.tenantId);
  const requiredCapability = normalizeCapability(context.requiredCapability);
  const references = [];
  const diagnostics = [];

  for (const raw of Array.isArray(rawReferences)
    ? rawReferences.slice(0, MAX_REFERENCES)
    : []) {
    const reference = normalizeReference(raw);
    if (
      reference == null ||
      normalizeId(raw?.tenantId) !== tenantId ||
      (requiredCapability != null &&
        !reference.capabilities.includes(requiredCapability))
    ) {
      diagnostics.push(unavailableDiagnostic());
      continue;
    }
    references.push(reference);
  }

  return {
    contractVersion: SECRET_REFERENCE_CONTRACT_VERSION,
    diagnostics,
    references: references.sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
  };
}

export function findSecretReference(catalog, referenceId) {
  const normalized = normalizeId(referenceId);
  const reference = catalog?.references?.find(
    (candidate) => candidate.id === normalized,
  );
  if (reference == null) {
    return {
      diagnostic: unavailableDiagnostic(),
      reference: null,
    };
  }
  if (reference.status !== "active") {
    return {
      diagnostic: {
        code: `secretReference.${reference.status}`,
        messageKey: `EnvironmentSecrets.validation.${reference.status}`,
        severity: "error",
      },
      reference,
    };
  }
  return { diagnostic: null, reference };
}

export function exportSecretReferences(rawBindings) {
  return (Array.isArray(rawBindings) ? rawBindings : [])
    .slice(0, MAX_REFERENCES)
    .map((binding) => {
      const referenceId = normalizeId(
        binding?.referenceId ?? binding?.secretRef,
      );
      if (referenceId == null) return { value: "[REDACTED]" };
      return {
        alias: normalizeAlias(binding?.alias),
        referenceId,
      };
    });
}

export function containsSensitiveSecretPayload(value) {
  if (value == null || typeof value !== "object") return false;
  return Object.entries(value).some(
    ([key, nested]) =>
      SENSITIVE_KEY.test(key) ||
      (typeof nested === "object" && containsSensitiveSecretPayload(nested)),
  );
}

function normalizeReference(raw) {
  const id = normalizeId(raw?.id);
  const name = String(raw?.name ?? "")
    .trim()
    .slice(0, 160);
  const provider = String(raw?.provider ?? "")
    .trim()
    .slice(0, 80);
  const scope = String(raw?.scope ?? "")
    .trim()
    .slice(0, 160);
  const status = ALLOWED_STATUS.has(raw?.status) ? raw.status : "unavailable";
  if (id == null || name === "" || provider === "" || scope === "") return null;
  return {
    capabilities: Array.isArray(raw?.capabilities)
      ? raw.capabilities
          .map(normalizeCapability)
          .filter((capability) => capability != null)
          .slice(0, 30)
      : [],
    id,
    lastValidatedAt: normalizeTimestamp(raw?.lastValidatedAt),
    name,
    provider,
    scope,
    status,
    usageCount: Number.isInteger(raw?.usageCount)
      ? Math.max(0, Math.min(raw.usageCount, 100_000))
      : 0,
  };
}

function normalizeAlias(value) {
  const alias = String(value ?? "").trim();
  return /^[A-Za-z_][A-Za-z0-9_.-]{0,127}$/.test(alias) ? alias : null;
}

function normalizeCapability(value) {
  const capability = String(value ?? "").trim();
  return /^[A-Za-z0-9_.:-]{1,120}$/.test(capability) ? capability : null;
}

function normalizeId(value) {
  const normalized = String(value ?? "").trim();
  return SAFE_ID.test(normalized) ? normalized : null;
}

function normalizeTimestamp(value) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function unavailableDiagnostic() {
  return {
    code: "secretReference.unavailable",
    messageKey: "EnvironmentSecrets.validation.unavailable",
    severity: "error",
  };
}
