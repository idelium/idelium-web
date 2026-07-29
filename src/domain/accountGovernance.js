export const ACCOUNT_GOVERNANCE_CONTRACT_VERSION = "2026-07-29.accounts.v1";

export const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: "active",
  ARCHIVED: "archived",
  EXPIRED_INVITATION: "expired-invitation",
  INVITED: "invited",
  SUSPENDED: "suspended",
});

const VALID_STATUSES = new Set(Object.values(ACCOUNT_STATUSES));
const OPERATIONS = new Set([
  "archive",
  "audit",
  "cancel-invite",
  "invite",
  "reactivate",
  "resend-invite",
  "role-change",
  "suspend",
]);
const OPERATION_CAPABILITIES = Object.freeze({
  archive: "account.archive",
  audit: "account.audit",
  "cancel-invite": "account.invite",
  invite: "account.invite",
  reactivate: "account.reactivate",
  "resend-invite": "account.invite",
  "role-change": "account.role.assign",
  suspend: "account.suspend",
});
const ROLE_DEFINITIONS = Object.freeze({
  admin: {
    assignmentConstraints: ["cannot-remove-last-admin", "tenant-bound"],
    display: { gb: "Administrator", it: "Amministratore" },
    purpose: {
      gb: "Manage tenant users, credentials, and operational governance.",
      it: "Gestisce utenti tenant, credenziali e governance operativa.",
    },
    permissions: [
      "account.invite",
      "account.role.assign",
      "account.suspend",
      "credential.audit",
    ],
    riskLevel: "high",
  },
  operator: {
    assignmentConstraints: ["tenant-bound"],
    display: { gb: "Operator", it: "Operatore" },
    purpose: {
      gb: "Run approved tests and inspect retained execution artifacts.",
      it: "Esegue test approvati e consulta artifact di esecuzione conservati.",
    },
    permissions: ["run.execute", "artifact.read"],
    riskLevel: "medium",
  },
  superadmin: {
    assignmentConstraints: [
      "platform-only",
      "cannot-remove-last-admin",
      "tenant-bound",
    ],
    display: { gb: "Super administrator", it: "Super amministratore" },
    purpose: {
      gb: "Administer platform-level tenants, users, credentials, and governance.",
      it: "Amministra tenant, utenti, credenziali e governance a livello piattaforma.",
    },
    permissions: ["*"],
    riskLevel: "critical",
  },
  viewer: {
    assignmentConstraints: ["tenant-bound"],
    display: { gb: "Viewer", it: "Visualizzatore" },
    purpose: {
      gb: "Inspect available artifacts without changing execution or governance state.",
      it: "Consulta gli artifact disponibili senza modificare esecuzioni o governance.",
    },
    permissions: ["artifact.read"],
    riskLevel: "low",
  },
});

const PERMISSION_GROUPS = Object.freeze({
  administration: ["account.invite", "account.role.assign", "account.suspend"],
  assets: ["artifact.read"],
  execution: ["run.execute"],
  governance: ["credential.audit"],
});

export function normalizeAccountDescriptor(account = {}, context = {}) {
  const status = normalizeAccountStatus(account.status, account);
  const roleId = normalizeRoleId(account.roleId ?? account.role);
  return {
    contractVersion:
      account.contractVersion ??
      context.contractVersion ??
      ACCOUNT_GOVERNANCE_CONTRACT_VERSION,
    archivedAt: safeIsoTimestamp(account.archivedAt),
    email: safeEmail(account.email ?? account.account),
    id: safeIdentifier(account.id ?? account.accountId),
    invitationExpiresAt: safeIsoTimestamp(account.invitationExpiresAt),
    invitedAt: safeIsoTimestamp(account.invitedAt),
    lastLoginAt: safeIsoTimestamp(account.lastLoginAt),
    name: safeText(account.name),
    roleId,
    status,
    suspendedAt: safeIsoTimestamp(account.suspendedAt),
    tenantId: safeIdentifier(account.tenantId ?? context.tenantId),
  };
}

export function roleMetadata(roleId, language = "gb") {
  const normalized = normalizeRoleId(roleId);
  const definition = ROLE_DEFINITIONS[normalized] ?? ROLE_DEFINITIONS.viewer;
  return {
    assignmentConstraints: [...definition.assignmentConstraints],
    displayName: definition.display[language] ?? definition.display.gb,
    id: normalized,
    permissions: [...definition.permissions],
    permissionsSummary: definition.permissions.includes("*")
      ? "All tenant administration permissions"
      : definition.permissions.join(", "),
    purpose: definition.purpose[language] ?? definition.purpose.gb,
    riskLevel: definition.riskLevel,
  };
}

export function buildRolePickerOptions(roles = [], options = {}) {
  const language = options.language ?? "gb";
  const assignable = new Set(
    safeArray(options.assignableRoleIds).map((roleId) =>
      safeIdentifier(roleId).toLowerCase(),
    ),
  );
  const hasExplicitAssignments = assignable.size > 0;
  return safeArray(roles).map((role) => {
    const stableId = safeIdentifier(role.id ?? role.roleId ?? role.name);
    const canonicalId = inferCanonicalRole(role);
    const metadata = roleMetadata(canonicalId, language);
    const allowed =
      !hasExplicitAssignments ||
      assignable.has(stableId.toLowerCase()) ||
      assignable.has(canonicalId);
    return {
      ...metadata,
      allowed,
      disabledReason: allowed
        ? ""
        : (options.copy?.unavailableRole ??
          "Your current permissions cannot assign this role."),
      displayName:
        safeText(role.displayName ?? role.label ?? role.name) ||
        metadata.displayName,
      stableId,
      value: stableId,
    };
  });
}

export function permissionMatrixForRoles(roles = [], options = {}) {
  const pickerOptions = buildRolePickerOptions(roles, options);
  return Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => ({
    group,
    permissions: permissions.map((permission) => ({
      permission,
      roles: Object.fromEntries(
        pickerOptions.map((role) => [
          role.stableId,
          role.permissions.includes("*") ||
            role.permissions.includes(permission),
        ]),
      ),
    })),
  }));
}

export function roleReductionWarning(currentRole, nextRole, options = {}) {
  const current = roleMetadata(
    inferCanonicalRole(currentRole),
    options.language,
  );
  const next = roleMetadata(inferCanonicalRole(nextRole), options.language);
  if (current.riskLevel === "critical" && next.riskLevel !== "critical") {
    return "critical-reduction";
  }
  if (
    current.permissions.includes("account.role.assign") &&
    !next.permissions.includes("account.role.assign") &&
    !next.permissions.includes("*")
  ) {
    return "governance-reduction";
  }
  return "";
}

export function accountOperationContract(
  operation,
  account = {},
  options = {},
) {
  const normalizedOperation = safeOperation(operation);
  if (!OPERATIONS.has(normalizedOperation)) {
    return rejected("unsupported-operation");
  }
  const descriptor = normalizeAccountDescriptor(account, options);
  const requestedRoleId = safeIdentifier(
    options.roleId ?? descriptor.roleId,
  ).toLowerCase();
  const authorization = accountAuthorization(
    normalizedOperation,
    descriptor,
    options,
  );
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      reason: authorization.reason,
      status: "rejected",
    };
  }
  const transition = accountTransition(
    normalizedOperation,
    descriptor,
    options,
  );
  if (!transition.allowed) return transition;
  return {
    allowed: true,
    audit: accountAuditRecord(normalizedOperation, "requested", descriptor, {
      actor: options.actor,
      replacementAdminId: options.replacementAdminId,
      reason: options.reason,
      timestamp: options.timestamp,
    }),
    body: {
      accountId: descriptor.id,
      operation: normalizedOperation,
      reason: safeText(options.reason),
      replacementAdminId: safeIdentifier(options.replacementAdminId) || null,
      roleId: requestedRoleId,
      tenantId: descriptor.tenantId,
    },
    headers: {
      "Idempotency-Key": [
        "account",
        normalizedOperation,
        descriptor.tenantId,
        descriptor.id || descriptor.email,
        safeIdentifier(options.actor ?? "actor"),
      ].join(":"),
    },
    status: "ready",
    transition,
  };
}

export function createAccountInvitationRequest(model = {}, options = {}) {
  const requestedRoleId = safeIdentifier(
    model.roleId ?? model.role,
  ).toLowerCase();
  const allowedRoleIds = new Set(
    safeArray(options.allowedRoleIds).map((roleId) =>
      safeIdentifier(roleId).toLowerCase(),
    ),
  );
  const normalized = {
    displayName: safeText(model.name ?? model.displayName),
    email: safeEmail(model.email),
    roleId: requestedRoleId,
    teamId: safeIdentifier(model.teamId ?? model.idCostumer),
    tenantId: safeIdentifier(model.tenantId ?? options.tenantId),
  };
  const errors = [];
  if (
    !normalized.email ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized.email)
  ) {
    errors.push({ field: "email", code: "invalid-email" });
  }
  if (!normalized.displayName) {
    errors.push({ field: "displayName", code: "required" });
  }
  if (
    !ROLE_DEFINITIONS[requestedRoleId] &&
    !allowedRoleIds.has(requestedRoleId)
  ) {
    errors.push({ field: "roleId", code: "invalid-role" });
  }
  if (
    safeArray(options.existingAccounts).some(
      (account) =>
        safeEmail(account.email ?? account.account) === normalized.email,
    )
  ) {
    errors.push({ field: "email", code: "duplicate" });
  }
  const authorization = accountAuthorization(
    "invite",
    { tenantId: normalized.tenantId },
    options,
  );
  if (!authorization.allowed) {
    return {
      allowed: false,
      authorization,
      errors: [{ field: "capability", code: authorization.reason }],
      reason: authorization.reason,
      status: "rejected",
    };
  }
  if (errors.length > 0) {
    return { allowed: false, errors, status: "invalid" };
  }
  return {
    allowed: true,
    body: {
      displayName: normalized.displayName,
      email: normalized.email,
      roleId: normalized.roleId,
      teamId: normalized.teamId || null,
      tenantId: normalized.tenantId,
    },
    headers: {
      "Idempotency-Key": [
        "account",
        "invite",
        normalized.tenantId,
        normalized.email,
        normalized.roleId,
        safeIdentifier(options.actor ?? "actor"),
      ].join(":"),
    },
    safeFeedback: "invitation-requested",
    status: "ready",
  };
}

export function accountAuthorization(operation, account = {}, options = {}) {
  const requiredCapability = OPERATION_CAPABILITIES[operation];
  if (!requiredCapability) {
    return { allowed: false, reason: "unsupported-operation" };
  }
  const capabilities = new Set(safeArray(options.capabilities));
  if (!capabilities.has(requiredCapability)) {
    return { allowed: false, reason: "missing-capability" };
  }
  const activeTenant = safeIdentifier(options.tenantId);
  if (account.tenantId && activeTenant && account.tenantId !== activeTenant) {
    return { allowed: false, reason: "tenant-mismatch" };
  }
  if (
    options.actorAccountId &&
    account.id === options.actorAccountId &&
    ["archive", "role-change", "suspend"].includes(operation)
  ) {
    return { allowed: false, reason: "self-modification-protected" };
  }
  return { allowed: true, reason: "authorized" };
}

export function accountTransition(operation, account = {}, options = {}) {
  const status = account.status;
  if (operation === "invite") return { allowed: true, nextStatus: "invited" };
  if (operation === "resend-invite") {
    return status === ACCOUNT_STATUSES.INVITED
      ? { allowed: true, nextStatus: ACCOUNT_STATUSES.INVITED }
      : rejected("invalid-transition");
  }
  if (operation === "cancel-invite") {
    return [
      ACCOUNT_STATUSES.INVITED,
      ACCOUNT_STATUSES.EXPIRED_INVITATION,
    ].includes(status)
      ? { allowed: true, nextStatus: ACCOUNT_STATUSES.ARCHIVED }
      : rejected("invalid-transition");
  }
  if (operation === "suspend") {
    if (
      options.lastAdmin === true &&
      !safeIdentifier(options.replacementAdminId)
    ) {
      return rejected("replacement-admin-required");
    }
    return status === ACCOUNT_STATUSES.ACTIVE
      ? { allowed: true, nextStatus: ACCOUNT_STATUSES.SUSPENDED }
      : rejected("invalid-transition");
  }
  if (operation === "reactivate") {
    return status === ACCOUNT_STATUSES.SUSPENDED
      ? { allowed: true, nextStatus: ACCOUNT_STATUSES.ACTIVE }
      : rejected("invalid-transition");
  }
  if (operation === "role-change") {
    const requestedRoleId = safeIdentifier(options.roleId).toLowerCase();
    const targetRole = normalizeRoleId(
      options.roleCanonicalId ?? options.roleId,
    );
    const allowedRoleIds = new Set(
      safeArray(options.allowedRoleIds).map((roleId) =>
        safeIdentifier(roleId).toLowerCase(),
      ),
    );
    const validRole =
      ROLE_DEFINITIONS[targetRole] || allowedRoleIds.has(requestedRoleId);
    const targetKeepsAdmin =
      targetRole === "admin" || targetRole === "superadmin";
    if (
      options.lastAdmin === true &&
      !targetKeepsAdmin &&
      !safeIdentifier(options.replacementAdminId)
    ) {
      return rejected("replacement-admin-required");
    }
    if (!validRole) return rejected("invalid-role");
    return [ACCOUNT_STATUSES.ACTIVE, ACCOUNT_STATUSES.INVITED].includes(status)
      ? {
          allowed: true,
          nextStatus: status,
          risk: privilegedChangeRisk(account.roleId, targetRole, options),
        }
      : rejected("invalid-transition");
  }
  if (operation === "archive") {
    if (
      options.lastAdmin === true &&
      !safeIdentifier(options.replacementAdminId)
    ) {
      return rejected("replacement-admin-required");
    }
    return status !== ACCOUNT_STATUSES.ARCHIVED
      ? { allowed: true, nextStatus: ACCOUNT_STATUSES.ARCHIVED }
      : rejected("invalid-transition");
  }
  if (operation === "audit") return { allowed: true, nextStatus: status };
  return rejected("unsupported-operation");
}

export function accountAuditRecord(
  operation,
  outcome,
  account = {},
  context = {},
) {
  const descriptor = normalizeAccountDescriptor(account, context);
  return {
    accountId: descriptor.id,
    actor: safeText(context.actor ?? "unknown"),
    email: descriptor.email,
    operation: safeOperation(operation),
    outcome: safeIdentifier(outcome),
    replacementAdminId: safeIdentifier(context.replacementAdminId) || null,
    reason: safeText(context.reason),
    roleId: descriptor.roleId,
    status: descriptor.status,
    tenantId: descriptor.tenantId,
    timestamp: safeIsoTimestamp(context.timestamp) ?? new Date().toISOString(),
  };
}

export function privilegedChangeRisk(currentRole, nextRole, options = {}) {
  const current = roleMetadata(
    inferCanonicalRole(options.currentRoleName ?? currentRole),
    options.language,
  );
  const next = roleMetadata(
    inferCanonicalRole(options.nextRoleName ?? nextRole),
    options.language,
  );
  if (current.riskLevel === "critical" || next.riskLevel === "critical") {
    return "critical";
  }
  if (
    next.permissions.includes("*") ||
    next.permissions.includes("account.role.assign")
  ) {
    return "elevation";
  }
  if (roleReductionWarning(current.id, next.id, options)) return "reduction";
  return "standard";
}

export function legacyAccountCompatibility(account = {}, context = {}) {
  const descriptor = normalizeAccountDescriptor(account, context);
  return {
    ...descriptor,
    migrationRequired: false,
    status:
      descriptor.status === ACCOUNT_STATUSES.ARCHIVED
        ? ACCOUNT_STATUSES.ARCHIVED
        : ACCOUNT_STATUSES.ACTIVE,
  };
}

function normalizeAccountStatus(value, account) {
  const status = safeIdentifier(value).toLowerCase();
  if (VALID_STATUSES.has(status)) return status;
  if (account.archivedAt) return ACCOUNT_STATUSES.ARCHIVED;
  if (account.suspendedAt) return ACCOUNT_STATUSES.SUSPENDED;
  if (
    account.invitationExpiresAt &&
    new Date(account.invitationExpiresAt) < new Date()
  ) {
    return ACCOUNT_STATUSES.EXPIRED_INVITATION;
  }
  if (account.invitedAt) return ACCOUNT_STATUSES.INVITED;
  return ACCOUNT_STATUSES.ACTIVE;
}

function normalizeRoleId(value) {
  const role = safeIdentifier(value || "viewer").toLowerCase();
  return ROLE_DEFINITIONS[role] ? role : "viewer";
}

function inferCanonicalRole(role) {
  const raw = String(
    role?.canonicalId ?? role?.code ?? role?.name ?? role ?? "",
  )
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  if (raw.includes("super")) return "superadmin";
  if (raw.includes("admin")) return "admin";
  if (raw.includes("operator") || raw.includes("user")) return "operator";
  if (raw.includes("viewer") || raw.includes("read")) return "viewer";
  return normalizeRoleId(raw);
}

function safeOperation(value) {
  return safeIdentifier(value).toLowerCase();
}

function rejected(reason) {
  return { allowed: false, reason, status: "rejected" };
}

function safeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, "")
    .slice(0, 254);
}

function safeIdentifier(value) {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9_.:@-]/g, "-")
    .slice(0, 120);
}

function safeText(value) {
  return String(value ?? "")
    .trim()
    .slice(0, 500);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeIsoTimestamp(value) {
  if (value == null || value === "") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
