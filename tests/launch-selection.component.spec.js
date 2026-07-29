import { mount, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import LaunchAssetSelector from "@/components/launch/LaunchAssetSelector.vue";
import LaunchTargetConfigurator from "@/components/launch/LaunchTargetConfigurator.vue";
import {
  buildLaunchAssetQuery,
  normalizeLaunchAssetRows,
} from "@/domain/launchSelection";
import {
  normalizeLaunchTargets,
  validateLaunchTargetConfiguration,
} from "@/domain/launchTargets";
import english from "@/languages/english";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";
import TestLauncher from "@/view/testlauncher.vue";

function mountLauncher(overrides = {}) {
  const router = overrides.router ?? { replace: vi.fn() };
  const route = overrides.route ?? { name: "testlauncher", query: {} };
  return shallowMount(TestLauncher, {
    global: {
      plugins: [pinia],
      stubs: {
        fontAwesomeIcon: true,
        LaunchAssetSelector,
        platformLauncher: {
          name: "platformLauncher",
          methods: { showModal: vi.fn() },
          template: "<div />",
        },
      },
      mocks: {
        $route: route,
        $router: router,
        config: {
          currentLanguage: "gb",
          serviceBaseUrl: "/api/",
          url: {
            environments: "environments",
            launchTargets: "launch/targets",
            testcycles: "cycles",
          },
        },
        emitter: { emit: vi.fn(), on: vi.fn() },
        language: { gb: english },
        Logout: vi.fn(),
        setHeaders: () => ({}),
      },
    },
  });
}

describe("launch asset selection", () => {
  beforeEach(() => {
    api.get.mockReset();
    useSessionStore(pinia).selectProject(7);
  });

  it("normalizes bounded authorized assets and disables incompatible records", () => {
    const rows = Array.from({ length: 60 }, (_, index) => ({
      id: index + 1,
      name: `Cycle ${index + 1}`,
      runtime: index === 0 ? "appium" : "selenium",
      status: index === 1 ? "archived" : "active",
      tenantId: "tenant-1",
      updatedAt: "2026-07-01T10:00:00Z",
      version: "v1",
    }));
    rows.push({ id: 99, name: "Forbidden", status: "unauthorized" });

    const assets = normalizeLaunchAssetRows(rows, {
      selectedRuntime: "selenium",
      tenantId: "tenant-1",
      type: "cycle",
    });

    expect(assets).toHaveLength(50);
    expect(assets.some((item) => item.name === "Forbidden")).toBe(false);
    expect(assets[0]).toMatchObject({ disabledReason: "runtime" });
    expect(assets[1]).toMatchObject({ disabledReason: "archived" });
    expect(assets[2]).toMatchObject({
      metadata: { runtime: "selenium", updatedAt: "2026-07-01" },
    });
  });

  it("renders keyboard-accessible radio selectors with disabled reasons", async () => {
    vi.useFakeTimers();
    const wrapper = mount(LaunchAssetSelector, {
      props: {
        copy: english.TestLauncher.cycleSelector,
        groupName: "cycle",
        items: [
          {
            disabledReason: null,
            id: "1",
            identity: "cycle:1",
            metadata: { runtime: "selenium", status: "active" },
            name: "Smoke",
          },
          {
            disabledReason: "archived",
            id: "2",
            identity: "cycle:2",
            metadata: { runtime: "selenium", status: "archived" },
            name: "Old",
          },
        ],
        modelValue: "1",
        query: buildLaunchAssetQuery(),
      },
    });

    expect(wrapper.get("section").attributes("aria-label")).toBe(
      "Test cycle selection",
    );
    expect(
      wrapper.findAll('input[type="radio"]')[1].attributes(),
    ).toHaveProperty("disabled");
    expect(wrapper.text()).toContain("This cycle is archived.");

    await wrapper.get('input[type="search"]').setValue("login");
    await vi.advanceTimersByTimeAsync(250);
    expect(wrapper.emitted("query-change")[0][0]).toMatchObject({
      page: 1,
      pageSize: 50,
      search: "login",
    });
    vi.useRealTimers();
  });

  it("normalizes targets without exposing credentials and validates concurrency", () => {
    const [target] = normalizeLaunchTargets(
      [
        {
          apiToken: "complete-secret-token",
          capacity: { available: 2, max: 4, queued: 1 },
          capabilities: ["browserOverride"],
          credentialUrl: "https://user:password@example.invalid/grid",
          health: "healthy",
          id: "grid-1",
          lastHealthAt: "2026-07-01T10:00:00Z",
          name: "Grid",
          region: "eu",
          runtime: "selenium",
        },
      ],
      { selectedRuntime: "selenium" },
    );

    expect(JSON.stringify(target.raw)).not.toContain("complete-secret-token");
    expect(JSON.stringify(target.raw)).not.toContain("credentialUrl");
    expect(target).toMatchObject({
      capacity: { available: 2, max: 4, queued: 1 },
      healthStale: true,
    });
    expect(
      validateLaunchTargetConfiguration({
        concurrency: 3,
        overrides: { device: "iphone" },
        target,
      }).map((diagnostic) => diagnostic.code),
    ).toEqual([
      "launchTarget.concurrency",
      "launchTarget.healthStale",
      "launchTarget.deviceOverride",
    ]);
  });

  it("renders target capacity, stale health, and constrained overrides", () => {
    const wrapper = mount(LaunchTargetConfigurator, {
      props: {
        concurrency: 2,
        copy: english.LaunchTarget,
        modelValue: "target-1",
        overrides: { browser: "chrome" },
        targets: [
          {
            capabilities: ["browserOverride"],
            capacity: { available: 1, max: 1, queued: 3 },
            disabledReason: null,
            health: "healthy",
            healthStale: true,
            id: "target-1",
            identity: "target:target-1",
            metadata: {
              queue: "3",
              region: "eu",
              runtime: "selenium",
            },
            name: "Selenium grid",
          },
        ],
      },
    });

    expect(wrapper.get("section").attributes("aria-label")).toBe(
      "Execution target and concurrency",
    );
    expect(wrapper.text()).toContain("1/1");
    expect(wrapper.text()).toContain("Health data is stale");
    expect(wrapper.text()).toContain("Reduce concurrency");
    expect(
      wrapper.findAll('input[type="text"]')[1].attributes("disabled"),
    ).toBe("");
  });

  it("loads cycle and environment selectors with bounded API queries", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 3,
              name: "Smoke",
              projectId: 7,
              runtime: "selenium",
              status: "active",
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              capacity: { available: 1, max: 1, queued: 0 },
              health: "healthy",
              id: "platform-pool",
              runtime: "selenium",
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              code: "demo",
              id: 9,
              name: "Demo",
              projectId: 7,
              runtimeType: "selenium",
              status: "active",
            },
          ],
        },
      });

    const router = { replace: vi.fn() };
    const wrapper = mountLauncher({ router });

    await vi.waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
    expect(api.get.mock.calls[0]).toEqual([
      "/api/cycles/7",
      {
        headers: {},
        params: { page: 1, pageSize: 50, search: "" },
      },
    ]);
    expect(api.get.mock.calls[1]).toEqual([
      "/api/launch/targets/7",
      {
        headers: {},
        params: { page: 1, pageSize: 50 },
      },
    ]);
    expect(api.get.mock.calls[2]).toEqual([
      "/api/environments/7",
      {
        headers: {},
        params: { page: 1, pageSize: 50, search: "" },
      },
    ]);
    expect(wrapper.vm.selectedCycleId).toBe("3");
    expect(wrapper.vm.selectedEnvironmentId).toBe("9");
    expect(router.replace).toHaveBeenCalledWith({
      query: { cycleId: "3", environmentId: "9", targetId: "platform-pool" },
    });
  });

  it("preserves route-backed selections and clears only incompatible cycles", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 4,
              name: "Mobile smoke",
              projectId: 7,
              runtime: "appium",
              status: "active",
            },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 8,
              name: "Web",
              projectId: 7,
              runtimeType: "selenium",
              status: "active",
            },
          ],
        },
      });

    const wrapper = mountLauncher({
      route: {
        name: "testlauncher",
        query: { cycleId: "4", environmentId: "8" },
      },
    });

    await vi.waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
    expect(wrapper.vm.selectedEnvironmentId).toBe("8");
    expect(wrapper.vm.selectedCycleId).toBeNull();
  });
});
