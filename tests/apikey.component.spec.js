import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
const clipboard = vi.hoisted(() => vi.fn(() => true));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("copy-to-clipboard", () => ({ default: clipboard }));

import Apikey from "@/view/apikey.vue";

describe("apikey component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    clipboard.mockClear();
    vi.spyOn(Storage.prototype, "setItem");
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  function mountApikey(options = {}) {
    return shallowMount(Apikey, {
      global: {
        mocks: {
          $route: options.route ?? { name: "apikey", params: {}, query: {} },
          $router: options.router,
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { apikey: "apikey" },
          },
          language: {
            gb: {
              Actions: {
                copy: "Copy",
                download: "Download",
                refresh: "Refresh",
              },
              Apikey: {
                title: "Your Idelium Key",
                info: "Use this key with idelium-cli.",
                btnGenerateKey: "Generate new key",
                btnDownloadKey: "Download idelium-cli",
                btnCopyKey: "Copy key",
                btnDownloadConfig: "Download key",
                cliEyebrow: "Idelium CLI",
                credentialEyebrow: "Credential",
                statusActive: "Active",
                packageEyebrow: "Package",
                cliTitle: "Idelium CLI",
                cliInfo: "Install the CLI from PyPI.",
                keyCopy: "Key copied",
                confirmGenerateMessage: "Generate a new key?",
                tabsLabel: "API key sections",
                tabOverview: "Overview",
                tabOverviewDescription: "Current key.",
                tabCli: "CLI usage",
                tabCliDescription: "Install snippets.",
                tabCredentials: "Credentials",
                tabCredentialsDescription: "Credential inventory.",
                tabCreate: "Create",
                tabCreateDescription: "Create credential.",
                tabOperations: "Operations",
                tabOperationsDescription: "Rotate or revoke.",
                operationsEmptyTitle: "No operation selected",
                operationsEmptyDescription: "Select an operation.",
                credentialLifecycleTitle: "Credential lifecycle",
                credentialLifecycleDescription: "Manage credentials safely.",
                revealOnceNotice: "Secret is shown only once.",
                revealOnceTitle: "Reveal-once credential",
                revealOnceHelp: "Copy or download now.",
                revealOnceAcknowledge:
                  "I understand this secret cannot be shown again.",
                revealOnceReady: "Credential created.",
                revealOnceExpired: "Secret cleared.",
                acknowledgementRequired: "Acknowledge first.",
                copySecret: "Copy secret",
                copySecretFeedback: "Secret copied.",
                downloadSecret: "Download secret",
                downloadSecretFeedback: "Secret downloaded.",
                clearSecret: "Clear secret",
                copySnippet: "Copy",
                copySnippetFeedback: "Usage snippet copied.",
                usageGuidance: "Use approved secret stores.",
                usageSnippetTitles: {
                  "generic-ci": "Generic CI",
                  "github-actions": "GitHub Actions",
                  "local-shell": "Local shell",
                },
                inventoryTitle: "Credential inventory",
                inventoryScrollRegion: "Scrollable credential inventory",
                actionsLabel: "Actions",
                moreActions: "More actions",
                clearFilters: "Clear filters",
                resultCount: "{count} credentials",
                selectPage: "Select this page",
                selectRow: "Select",
                emptyTitle: "No credentials",
                emptyDescription: "Create one.",
                noResultsTitle: "No matching credentials",
                noResultsDescription: "Clear filters.",
                colName: "Name",
                colFingerprint: "Prefix / fingerprint",
                colScopes: "Scopes",
                colStatus: "Status",
                colOwner: "Owner",
                colCreated: "Created",
                colLastUsed: "Last used",
                colExpiry: "Expiry",
                colLineage: "Lineage",
                filterStatus: "Status",
                filterScope: "Scope",
                filterOwner: "Owner",
                filterExpiry: "Expiry",
                filterAll: "All",
                noExpiry: "No expiry",
                neverUsed: "Never used",
                lastUsedUnavailable: "Unavailable",
                legacyName: "Legacy API key",
                createTooltip: "Create credential",
                rotateTooltip: "Rotate credential",
                revokeTooltip: "Revoke credential",
                auditTooltip: "Open audit",
                actions: {
                  audit: "Audit",
                  cancel: "Cancel",
                  create: "Create",
                  revoke: "Revoke",
                  rotate: "Rotate",
                },
                statuses: {
                  active: "Active",
                  expired: "Expired",
                  expiring: "Expiring",
                  legacy: "Legacy",
                  revoked: "Revoked",
                  rotated: "Rotated",
                  unknown: "Unknown",
                },
                createCredentialTitle: "Create named credential",
                createCredentialHelp: "Use least privilege.",
                description: "Description",
                constraints: "Approved constraints",
                createFailed: "Credential creation failed.",
                rotationTitle: "Rotate credential",
                rotationHelp: "Issue a replacement credential.",
                rotationPolicy: "Rotation policy",
                rotationImmediate: "Immediate cutover",
                rotationOverlap24h: "24-hour overlap",
                rotationOverlap7d: "7-day overlap",
                rotationFailed: "Credential rotation failed.",
                rotatedFrom: "Rotated from",
                rotatedCredential: "Rotated credential",
                revocationTitle: "Revoke credential",
                revocationHelp: "Invalidate deliberately.",
                revocationImpact: "Immediate consequence",
                revocationImpactHelp: "Cannot authenticate after confirmation.",
                confirmCredentialName: "Confirm credential name",
                confirmCredentialFingerprint: "Confirm prefix or fingerprint",
                revocationReason: "Audit reason",
                revocationElevatedConfirm: "I understand the protected impact.",
                revocationFailed: "Credential revocation failed.",
                scopeRunExecute: "Run execution",
                scopeRunExecuteHelp: "Allows launching approved tests.",
                scopeArtifactRead: "Artifact read",
                scopeArtifactReadHelp: "Allows reading artifacts.",
                scopeCredentialAdmin: "Credential administration",
                scopeCredentialAdminHelp: "Allows credential administration.",
                validation: {
                  duplicate: "Duplicate name.",
                  "dangerous-combination": "Dangerous combination.",
                  "already-revoked": "Already revoked.",
                  "confirmation-mismatch": "Confirmation mismatch.",
                  "elevated-confirmation-required":
                    "Elevated confirmation required.",
                  "invalid-date": "Invalid date.",
                  "maximum-lifetime": "Maximum lifetime.",
                  "missing-capability": "Missing capability.",
                  "reason-required": "Reason required.",
                  required: "Required field.",
                  "terminal-state": "Terminal state.",
                  "unauthorized-scope": "Unauthorized scope.",
                  "unsupported-policy": "Unsupported policy.",
                },
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
          $wkToast: vi.fn(),
        },
      },
    });
  }

  async function selectTab(wrapper, tab) {
    wrapper.vm.selectApiKeyTab(tab);
    await wrapper.vm.$nextTick();
  }

  it("opens the Idelium PyPI package from the download button", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const wrapper = mountApikey();
    await selectTab(wrapper, "cli");

    const downloadButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Download idelium-cli"));

    await downloadButton.trigger("click");

    expect(window.open).toHaveBeenCalledWith(
      "https://pypi.org/project/idelium/",
      "_blank",
    );
  });

  it("splits the API key workspace into task-focused tabs", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".apikey-tab")).toHaveLength(5);
    expect(wrapper.find(".apikey-card-main").exists()).toBe(true);
    expect(wrapper.find(".apikey-cli-card").exists()).toBe(false);

    await selectTab(wrapper, "cli");

    expect(wrapper.find(".apikey-card-main").exists()).toBe(false);
    expect(wrapper.find(".apikey-cli-card").exists()).toBe(true);
  });

  it("syncs API key tabs with routable URLs", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const push = vi.fn();
    const wrapper = mountApikey({
      route: { name: "apikey", params: { tab: "credentials" }, query: {} },
      router: { push },
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeApikeyTab).toBe("credentials");
    expect(
      wrapper.findComponent({ name: "EnterpriseDataTable" }).exists(),
    ).toBe(true);

    await selectTab(wrapper, "cli");

    expect(push).toHaveBeenCalledWith({
      name: "apikey",
      params: { tab: "cli" },
      query: {},
    });
  });

  it("renders redacted pinned usage snippets and copies them accessibly", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();

    const snippets = wrapper.vm.usageSnippets;
    const rendered = snippets.map((snippet) => snippet.body).join("\n");

    expect(snippets.map((snippet) => snippet.title)).toEqual([
      "Local shell",
      "GitHub Actions",
      "Generic CI",
    ]);
    expect(rendered).toContain("idelium==1.0.14");
    expect(rendered).toContain("actions/checkout@v4");
    expect(rendered).toContain("https://idelium.org");
    expect(rendered).not.toContain("idelium.io");
    expect(rendered).not.toContain("latest");
    expect(rendered).not.toContain("idelium_secret");

    await wrapper.vm.copyUsageSnippet(snippets[1]);
    expect(clipboard).toHaveBeenCalledWith(snippets[1].body);
  });

  it("renders a credential inventory without exposing complete secrets", async () => {
    api.get.mockResolvedValue({
      data: {
        apiKey: "legacy-secret-value-must-stay-out-of-inventory",
        credentials: [
          {
            actor: "admin@idelium.org",
            apiKey: "idelium_complete_secret_must_not_render",
            fingerprint: "safe-fingerprint",
            id: "cred-1",
            name: "CI production",
            scopes: ["run:execute"],
            status: "active",
            tenantId: "tenant-1",
          },
          {
            actor: "admin@idelium.org",
            id: "cred-2",
            keyPrefix: "idelium_old",
            name: "Old key",
            scopes: ["artifact:read"],
            status: "revoked",
            tenantId: "tenant-1",
          },
        ],
      },
    });

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.credentialRows).toHaveLength(2));
    await selectTab(wrapper, "credentials");

    const inventory = wrapper.findComponent({ name: "EnterpriseDataTable" });
    expect(inventory.exists()).toBe(true);
    expect(inventory.props("columns").map((column) => column.key)).toEqual([
      "name",
      "fingerprint",
      "scopes",
      "status",
      "actor",
      "createdAt",
      "lastUsedAt",
      "expiresAt",
      "lineage",
    ]);
    expect(JSON.stringify(inventory.props("rows"))).toContain(
      "safe-fingerprint",
    );
    expect(JSON.stringify(inventory.props("rows"))).not.toContain(
      "complete_secret",
    );
    expect(wrapper.text()).not.toContain("complete_secret");
  });

  it("submits a named credential once and navigates to reveal-once state", async () => {
    const push = vi.fn();
    api.get.mockResolvedValue({ data: { credentials: [] } });
    api.post.mockResolvedValue({
      data: {
        id: "cred-3",
        key: "idelium_secret_revealed_once_value",
        name: "CI",
        scopes: ["run:execute"],
        tenantId: "current-tenant",
      },
    });

    const wrapper = mountApikey();
    wrapper.vm.$router = { push };
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(api.get).toHaveBeenCalled());
    await selectTab(wrapper, "create");
    await wrapper.setData({
      credentialCreate: {
        constraints: "",
        description: "CI token",
        expiresAt: "2027-07-01",
        name: "CI",
        scopes: ["run:execute"],
      },
    });

    await wrapper.get(".apikey-create-form").trigger("submit");
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      "/api/apikey/credentials",
      expect.objectContaining({
        description: "CI token",
        name: "CI",
        scopes: ["run:execute"],
      }),
      {
        headers: {
          "Idempotency-Key":
            "credential:create:current-tenant:current-user:CI:2027-07-01:run:execute",
        },
      },
    );
    expect(push).toHaveBeenCalledWith({
      name: "apikey",
      params: { tab: "create" },
      query: { credentialId: "cred-3", mode: "reveal-once" },
    });
    expect(wrapper.text()).toContain("idelium_secret_revealed_once_value");
    expect(JSON.stringify(wrapper.vm.credentials)).not.toContain(
      "idelium_secret_revealed_once_value",
    );
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it("requires acknowledgement before copying and downloading the reveal-once secret", async () => {
    api.get.mockResolvedValue({ data: { credentials: [] } });
    const createObjectURL = vi.fn(() => "blob:secret-download");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    wrapper.vm.openRevealOnceSession({
      id: "cred-4",
      key: "idelium_secret_revealed_once_value",
      name: "CI",
      scopes: ["run:execute"],
      tenantId: "current-tenant",
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".apikey-reveal-panel").exists()).toBe(true);
    await wrapper.vm.copyRevealOnceSecret();
    expect(clipboard).not.toHaveBeenCalled();
    expect(wrapper.vm.revealFeedback).toBe("Credential created.");

    await wrapper.setData({ revealAcknowledged: true });
    await wrapper.vm.copyRevealOnceSecret();
    expect(clipboard).toHaveBeenCalledWith(
      "idelium_secret_revealed_once_value",
    );
    await wrapper.vm.downloadRevealOnceSecret();

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:secret-download");
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it("clears reveal-once material on route changes and page lifecycle cleanup", async () => {
    api.get.mockResolvedValue({ data: { credentials: [] } });
    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    wrapper.vm.openRevealOnceSession({
      id: "cred-5",
      key: "idelium_secret_revealed_once_value",
      name: "CI",
      scopes: ["run:execute"],
      tenantId: "current-tenant",
    });

    Apikey.watch.$route.call(
      wrapper.vm,
      {
        fullPath: "/apikey?mode=reveal-once&credentialId=cred-5",
        name: "apikey",
        params: {},
        query: { credentialId: "cred-5", mode: "reveal-once" },
      },
      { fullPath: "/apikey", name: "apikey", params: {}, query: {} },
    );
    expect(wrapper.vm.activeRevealSecret).toBe(
      "idelium_secret_revealed_once_value",
    );

    Apikey.watch.$route.call(
      wrapper.vm,
      {
        fullPath: "/projects/2/apikey",
        name: "apikey",
        params: { idProject: "2" },
        query: {},
      },
      {
        fullPath: "/projects/1/apikey",
        name: "apikey",
        params: { idProject: "1" },
        query: {},
      },
    );
    expect(wrapper.vm.activeRevealSecret).toBe("");

    wrapper.vm.openRevealOnceSession({
      id: "cred-5",
      key: "idelium_secret_revealed_once_value",
      name: "CI",
      scopes: ["run:execute"],
      tenantId: "current-tenant",
    });
    window.dispatchEvent(new Event("pagehide"));
    expect(wrapper.vm.activeRevealSecret).toBe("");
  });

  it("rotates a credential with an idempotent policy request and reveal-once replacement", async () => {
    api.get.mockResolvedValue({
      data: {
        credentials: [
          {
            expiresAt: "2027-07-01",
            fingerprint: "safe-fingerprint",
            id: "cred-old",
            lastUsedAt: "2026-07-29T09:00:00Z",
            name: "CI",
            scopes: ["run:execute"],
            status: "active",
            tenantId: "current-tenant",
          },
        ],
      },
    });
    api.post.mockResolvedValue({
      data: {
        credential: {
          id: "cred-new",
          key: "idelium_rotated_secret_revealed_once",
          name: "CI rotated",
          scopes: ["run:execute"],
          tenantId: "current-tenant",
        },
      },
    });

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.credentialRows).toHaveLength(1));

    wrapper.vm.handleCredentialAction({
      action: "rotate",
      row: { id: "cred-old", name: "CI" },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".apikey-rotation-card").text()).toContain("CI");

    await wrapper.setData({ rotationPolicy: "overlap-7d" });
    await wrapper.vm.rotateCredential();
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      "/api/apikey/credentials/cred-old/rotate",
      {
        credentialId: "cred-old",
        policy: "overlap-7d",
        tenantId: "current-tenant",
      },
      {
        headers: {
          "Idempotency-Key":
            "credential:rotate:current-tenant:cred-old:current-user:overlap-7d",
        },
      },
    );
    expect(wrapper.vm.activeRevealSecret).toBe(
      "idelium_rotated_secret_revealed_once",
    );
    expect(JSON.stringify(wrapper.vm.credentials)).not.toContain(
      "rotated_secret",
    );
    expect(wrapper.vm.credentialRows.map((row) => row.status)).toContain(
      "rotated",
    );
  });

  it("keeps the original credential unchanged when rotation fails", async () => {
    const originalCredential = {
      id: "cred-old",
      name: "CI",
      scopes: ["run:execute"],
      status: "active",
      tenantId: "current-tenant",
    };
    api.get.mockResolvedValue({ data: { credentials: [originalCredential] } });
    api.post.mockRejectedValue(new Error("network"));

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.credentialRows).toHaveLength(1));

    wrapper.vm.handleCredentialAction({
      action: "rotate",
      row: { id: "cred-old", name: "CI" },
    });
    await wrapper.vm.rotateCredential();

    expect(wrapper.vm.rotationErrors).toEqual(["Credential rotation failed."]);
    expect(wrapper.vm.credentials).toEqual([originalCredential]);
    expect(wrapper.vm.activeRevealSecret).toBe("");
  });

  it("revokes a credential only after durable API confirmation", async () => {
    api.get.mockResolvedValue({
      data: {
        credentials: [
          {
            fingerprint: "safe-fingerprint",
            id: "cred-old",
            lastUsedAt: "2026-07-29T09:00:00Z",
            name: "CI",
            scopes: ["run:execute"],
            status: "active",
            tenantId: "current-tenant",
          },
          {
            fingerprint: "backup-fingerprint",
            id: "cred-backup",
            name: "Backup",
            scopes: ["run:execute"],
            status: "active",
            tenantId: "current-tenant",
          },
        ],
      },
    });
    api.post.mockResolvedValue({
      data: {
        actor: "current-user",
        revokedAt: "2026-07-29T10:00:00Z",
        status: "revoked",
      },
    });

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.credentialRows).toHaveLength(2));

    wrapper.vm.confirmCredentialAction({
      action: "revoke",
      row: { id: "cred-old", name: "CI" },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".apikey-rotation-card").text()).toContain("CI");
    await wrapper.setData({
      revocationForm: {
        confirmFingerprint: "safe-fingerprint",
        confirmName: "CI",
        elevated: false,
        reason: "Compromised automation host",
      },
    });

    await wrapper.vm.revokeCredential();
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      "/api/apikey/credentials/cred-old/revoke",
      {
        actor: "current-user",
        credentialId: "cred-old",
        elevated: false,
        reason: "Compromised automation host",
        tenantId: "current-tenant",
      },
      {
        headers: {
          "Idempotency-Key":
            "credential:revoke:current-tenant:cred-old:current-user:Compromised-automation-host",
        },
      },
    );
    expect(
      wrapper.vm.credentials.find((credential) => credential.id === "cred-old")
        .status,
    ).toBe("revoked");
  });

  it("does not report revoked before the API confirms revocation", async () => {
    const originalCredential = {
      fingerprint: "safe-fingerprint",
      id: "cred-old",
      name: "CI",
      scopes: ["run:execute"],
      status: "active",
      tenantId: "current-tenant",
    };
    api.get.mockResolvedValue({ data: { credentials: [originalCredential] } });
    api.post.mockRejectedValue(new Error("network"));

    const wrapper = mountApikey();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.credentialRows).toHaveLength(1));

    wrapper.vm.confirmCredentialAction({
      action: "revoke",
      row: { id: "cred-old", name: "CI" },
    });
    await wrapper.setData({
      revocationForm: {
        confirmFingerprint: "safe-fingerprint",
        confirmName: "CI",
        elevated: true,
        reason: "Compromised automation host",
      },
    });
    await wrapper.vm.revokeCredential();

    expect(wrapper.vm.revocationErrors).toEqual([
      "Credential revocation failed.",
    ]);
    expect(wrapper.vm.credentials).toEqual([originalCredential]);
  });
});
