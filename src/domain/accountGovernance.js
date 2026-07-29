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
    permissions: [
      "account.invite",
      "account.role.assign",
      "account.suspend",
      "credential.audit",
    ],
  },
  operator: {
    assignmentConstraints: ["tenant-bound"],
    display: { gb: "Operator", it: "Operatore" },
    permissions: ["run.execute", "artifact.read"],
  },
  superadmin: {
    assignmentConstraints: [
      "platform-only",
      "cannot-remove-last-admin",
      "tenant-bound",
    ],
    display: { gb: "Super administrator", it: "Super amministratore" },
    permissions: ["*"],
  },
  viewer: {
    assignmentConstraints: ["tenant-bound"],
    display: { gb: "Viewer", it: "Visualizzatore" },
    permissions: ["artifact.read"],
  },
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
  };
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
      reason: options.reason,
      timestamp: options.timestamp,
    }),
    body: {
      accountId: descriptor.id,
      operation: normalizedOperation,
      reason: safeText(options.reason),
      roleId: normalizeRoleId(options.roleId ?? descriptor.roleId),
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
    if (options.lastAdmin === true) return rejected("last-admin-protected");
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
    if (options.lastAdmin === true) return rejected("last-admin-protected");
    if (!ROLE_DEFINITIONS[normalizeRoleId(options.roleId)])
      return rejected("invalid-role");
    return [ACCOUNT_STATUSES.ACTIVE, ACCOUNT_STATUSES.INVITED].includes(status)
      ? { allowed: true, nextStatus: status }
      : rejected("invalid-transition");
  }
  if (operation === "archive") {
    if (options.lastAdmin === true) return rejected("last-admin-protected");
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
    reason: safeText(context.reason),
    roleId: descriptor.roleId,
    status: descriptor.status,
    tenantId: descriptor.tenantId,
    timestamp: safeIsoTimestamp(context.timestamp) ?? new Date().toISOString(),
  };
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
