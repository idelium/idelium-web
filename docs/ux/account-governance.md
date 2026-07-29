# Account lifecycle and role governance contract

Idelium account governance uses the `2026-07-29.accounts.v1` contract to align
Web and API behavior for invitations, activation, suspension, role assignment,
audit, and protected administrator invariants.

## Lifecycle states

- `invited`: an invitation has been issued and can be accepted, resent, or
  cancelled.
- `active`: the account can sign in and use permissions granted by its role.
- `suspended`: sign-in and privileged operations are disabled until reactivated.
- `expired-invitation`: the invitation was not accepted before its expiration.
- `archived`: the account or invitation is retained for audit but no longer
  usable.

Existing accounts without explicit lifecycle metadata map deterministically to
`active`. Existing archived or suspended metadata maps to the matching lifecycle
state. Expired invitations are derived from `invitationExpiresAt`.

## Roles and permissions

Canonical role IDs are `superadmin`, `admin`, `operator`, and `viewer`. Every
role exposes localized display metadata, a permissions summary, and assignment
constraints. Role assignments are always tenant-bound and must be validated by
the API independently of the UI.

The UI may explain permissions, but it is not the authority. Server-side checks
must enforce role existence, tenant ownership, capability authorization, and
assignment constraints for every mutation.

## Role picker and permission matrix

The account invitation flow uses a role picker instead of a native role select.
The picker submits the stable role ID returned by the API; localized labels are
display-only metadata and must not be used as authorization identifiers.

Each role option displays:

- localized role name;
- role purpose;
- key permissions summary;
- assignment restrictions;
- risk level.

Unavailable roles remain visible but disabled with an authorized explanation so
administrators understand why the assignment cannot be made. The read-only
permission matrix groups permissions by assets, execution, governance, and
administration. Permission names and status indicators are exposed through
keyboard-focusable controls and screen-reader labels.

The picker warns when a role change would reduce governance or critical platform
ownership permissions. The API must still enforce the final assignment boundary,
including attempts to submit a role above the actor's capability.

## Account listing

The account listing uses the shared enterprise DataTable through a bounded
server-side grid contract. The client sends page, page size, search, sort, and
safe filter parameters only; it must not request or render unbounded customer
account sets.

Authorized columns include account, display name, customer, role, lifecycle
status, teams, last activity, and updated timestamp. Last activity is shown only
when the active session has the activity-read capability. Otherwise the column is
omitted rather than rendering sensitive activity details.

Filters are persisted in the URL with safe `f.*` keys for role, status, team,
and invitation state. Reloading the page reconstructs the authorized filtered
view and resets pagination when search or filters change.

Governance actions are capability-scoped and semantically colored:

- resend and cancel invitation require `account.invite`;
- role change requires `account.role.assign`;
- suspend requires `account.suspend`;
- reactivate requires `account.reactivate`;
- audit requires `account.audit`;
- archive requires `account.archive`;
- detail requires `account.detail`.

The UI may expose unavailable actions as disabled when the current row state does
not allow the operation. The API remains responsible for tenant ownership,
current lifecycle state, and capability enforcement.

## Suspension, reactivation, and invitation management

Lifecycle actions are confirmed before submission and include the account,
assigned role, and operational impact. Suspend and cancel-invitation actions use
warning confirmations because they remove access or invalidate pending access.
Reactivate and resend-invitation actions explain the API-controlled conditions
that must still pass.

Requests are idempotent and tenant-scoped through the shared account operation
contract. The client sends the intended operation, target account, tenant,
actor-derived idempotency key, and safe audit intent. The API remains the source
of truth for rate limits, already-transitioned rows, self-suspension protection,
last-administrator protection, concurrent updates, and lifecycle state.

The UI does not mark an account as suspended, active, archived, or invited until
the API returns durable confirmation. On failure, the visible account state is
left unchanged and the operator receives safe localized feedback. Suspend may
invalidate active sessions and account-bound credentials according to API policy;
reactivation does not automatically restore credentials unless the API policy
explicitly does so.

## Last-administrator and privileged-change protection

Role changes, suspension, and archival paths carry administrator-invariant
context whenever the selected account is the last active administrator for the
tenant. The client requires an explicit replacement administrator before a
protected demotion can be submitted and shows a stronger confirmation for
privilege elevation, critical-role changes, and self-sensitive role changes.

The client-side check is only a safety rail. Every privileged request is
submitted through the account operation contract with tenant, actor, target
account, requested role, optional replacement administrator, idempotency key, and
safe audit intent. The API must re-read the current tenant state and reject stale
or concurrent transitions that would leave the tenant without an administrator.
The UI treats such rejections as durable failures and leaves the existing account
state visible until the API confirms a successful transition.

## Operations

The contract defines these account operations:

- `invite`;
- `resend-invite`;
- `cancel-invite`;
- `suspend`;
- `reactivate`;
- `role-change`;
- `archive`;
- `audit`.

Every mutation uses an idempotency key derived from operation, tenant, target
account, and actor. Audit records contain actor, timestamp, target account,
tenant, operation, outcome, role, status, and reason when provided.

## Invitation-based creation

New accounts are created through invitations, not administrator-selected
passwords. The invitation request collects email, display name, role, and an
optional approved team or customer assignment. The API is responsible for
validating tenant membership, role assignment capability, duplicate accounts,
and delivery policy.

The UI must not display or log invitation tokens. Delivery feedback is generic
so duplicate or cross-tenant conditions do not reveal protected account
existence. Repeated submissions use an idempotency key derived from tenant,
email, role, and actor to prevent uncontrolled duplicate invitations.

## Protected invariants

The API must independently enforce:

- no cross-tenant account mutation;
- no unsupported or missing capability mutation;
- no self-suspension, self-archive, or self-role downgrade through the standard
  account-management path;
- no removal, suspension, archive, or downgrade of the last administrator;
- no invalid lifecycle transition, such as reactivating an already active
  account or resending an invitation for an active account.

Failures must not disclose whether forged customer, project, tenant, account, or
role identifiers exist outside the active tenant.

## Compatibility and rollback

Legacy active accounts remain compatible and are normalized into the new
descriptor without requiring a data migration. Rollback may continue to treat
legacy accounts as active, but it must not bypass tenant ownership,
last-administrator protection, or role assignment constraints.
