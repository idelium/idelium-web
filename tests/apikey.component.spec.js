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

  function mountApikey() {
    return shallowMount(Apikey, {
      global: {
        mocks: {
          $route: { name: "apikey" },
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
                scopeRunExecute: "Run execution",
                scopeRunExecuteHelp: "Allows launching approved tests.",
                scopeArtifactRead: "Artifact read",
                scopeArtifactReadHelp: "Allows reading artifacts.",
                scopeCredentialAdmin: "Credential administration",
                scopeCredentialAdminHelp: "Allows credential administration.",
                validation: {
                  duplicate: "Duplicate name.",
                  "dangerous-combination": "Dangerous combination.",
                  "invalid-date": "Invalid date.",
                  "maximum-lifetime": "Maximum lifetime.",
                  "missing-capability": "Missing capability.",
                  required: "Required field.",
                  "unauthorized-scope": "Unauthorized scope.",
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

  it("opens the Idelium PyPI package from the download button", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const wrapper = mountApikey();

    const downloadButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Download idelium-cli"));

    await downloadButton.trigger("click");

    expect(window.open).toHaveBeenCalledWith(
      "https://pypi.org/project/idelium/",
      "_blank",
    );
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
      query: { credentialId: "cred-3", mode: "reveal-once" },
    });
    expect(wrapper.text()).toContain("idelium_secret_revealed_once_value");
    expect(JSON.stringify(wrapper.vm.credentials)).not.toContain(
      "idelium_secret_revealed_once_value",
    );
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
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
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
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
});
