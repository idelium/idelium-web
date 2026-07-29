import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("copy-to-clipboard", () => ({ default: vi.fn(() => true) }));

import LaunchAssetSelector from "@/components/launch/LaunchAssetSelector.vue";
import LaunchPreflightPanel from "@/components/launch/LaunchPreflightPanel.vue";
import LaunchReviewSummary from "@/components/launch/LaunchReviewSummary.vue";
import LaunchTargetConfigurator from "@/components/launch/LaunchTargetConfigurator.vue";
import {
  createLaunchApiRequest,
  normalizeLaunchConfiguration,
} from "@/domain/launchContracts";
import { normalizeLaunchError } from "@/domain/launchErrors";
import {
  launchConfigurationHash,
  normalizePreflightResult,
} from "@/domain/launchPreflight";
import { buildLaunchReviewSummary } from "@/domain/launchReview";
import {
  canReplayLaunchRequest,
  canonicalExecutionRoute,
  createLaunchSubmission,
} from "@/domain/launchSubmission";
import { normalizeLaunchAssetRows } from "@/domain/launchSelection";
import {
  normalizeLaunchTargets,
  validateLaunchTargetConfiguration,
} from "@/domain/launchTargets";
import english from "@/languages/english";
import italian from "@/languages/italian";

const secret = "complete-secret-token";

describe("launch flow security, accessibility, and compatibility", () => {
  it("blocks forged launch references without disclosing unauthorized metadata", () => {
    const result = normalizeLaunchConfiguration({
      cycle: { id: "cycle-1", name: "Foreign", tenantId: "tenant-2" },
      environment: { id: "environment-1", projectId: "project-2" },
      idProject: "project-1",
      target: { id: "target-1", type: "platform" },
      tenantId: "tenant-1",
    });
    const assets = normalizeLaunchAssetRows(
      [
        { id: "cycle-1", name: "Authorized", status: "active" },
        { id: "cycle-2", name: "Removed Access", status: "unauthorized" },
      ],
      { type: "cycle" },
    );

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain(
      "launch.security.crossTenantReference",
    );
    expect(JSON.stringify(result)).not.toContain("Removed Access");
    expect(assets.map((asset) => asset.name)).toEqual(["Authorized"]);
  });

  it("keeps Selenium, Appium, and Postman launch fixtures bounded and credential-free", () => {
    const targets = normalizeLaunchTargets(
      [
        {
          apiKey: secret,
          capabilities: ["browserOverride", "parallel"],
          capacity: { available: 2, max: 4, queued: 0 },
          health: "healthy",
          id: "selenium-grid",
          runtime: "selenium",
        },
        {
          capabilities: ["deviceOverride"],
          capacity: { available: 1, max: 1, queued: 1 },
          health: "healthy",
          id: "appium-pool",
          runtime: "appium",
        },
        {
          authorization: `Bearer ${secret}`,
          capacity: { available: 3, max: 3, queued: 0 },
          health: "healthy",
          id: "postman-runner",
          runtime: "api",
        },
      ],
      { selectedRuntime: "selenium" },
    );

    expect(JSON.stringify(targets)).not.toContain(secret);
    expect(
      targets.find((target) => target.id === "selenium-grid"),
    ).toMatchObject({ disabledReason: null });
    expect(targets.find((target) => target.id === "appium-pool")).toMatchObject(
      {
        disabledReason: "runtime",
      },
    );
  });

  it("proves one logical launch submission replays by idempotency key", () => {
    const request = createLaunchApiRequest({
      cycle: { id: "cycle-1" },
      environment: { code: "demo", id: "environment-1" },
      idProject: "project-1",
      target: { id: "target-1", type: "platform" },
      tenantId: "tenant-1",
    });
    const first = createLaunchSubmission(request);
    const retry = createLaunchSubmission(request, first.idempotencyKey);

    expect(canReplayLaunchRequest(first, retry)).toBe(true);
    expect(canonicalExecutionRoute("project-1", "run-1")).toEqual({
      name: "execution-detail",
      params: { projectId: "project-1", runId: "run-1" },
    });
  });

  it("redacts diagnostics, CLI commands, captured summaries, and errors", () => {
    const request = createLaunchApiRequest({
      cycle: { id: "cycle-1", name: "Smoke" },
      environment: { code: "demo", id: "environment-1", name: "Demo" },
      idProject: "project-1",
      options: { API_TOKEN: secret, browser: "chrome" },
      target: { id: "target-1", type: "platform" },
      tenantId: "tenant-1",
    });
    const preflight = normalizePreflightResult(
      {
        diagnostics: [
          {
            area: "environment",
            blocking: false,
            code: "secret.expiring",
            message: `Authorization: Bearer ${secret}`,
            severity: "warning",
          },
        ],
      },
      launchConfigurationHash(request.body),
    );
    const review = buildLaunchReviewSummary({
      cycle: { id: "cycle-1", name: "Smoke" },
      environment: { code: "demo", id: "environment-1", name: "Demo" },
      launchRequest: request,
      preflightResult: preflight,
      projectId: "project-1",
      target: { name: "Platform pool", type: "platform" },
    });
    const error = normalizeLaunchError({
      response: {
        data: { message: `token=${secret}` },
        status: 422,
      },
    });

    expect(JSON.stringify({ error, preflight, review })).not.toContain(secret);
    expect(review.cliCommand).toContain("--idCycle=cycle-1");
    expect(review.cliCommand).not.toContain("API_TOKEN");
  });

  it("keeps critical launch controls keyboard reachable and localized", async () => {
    const asset = {
      disabledReason: null,
      id: "cycle-1",
      identity: "cycle:cycle-1",
      metadata: { runtime: "selenium", status: "active" },
      name: "Smoke",
    };
    const target = {
      capabilities: ["browserOverride"],
      capacity: { available: 1, max: 1, queued: 0 },
      disabledReason: null,
      health: "healthy",
      healthStale: false,
      id: "target-1",
      identity: "target:target-1",
      metadata: { queue: "0", region: "local", runtime: "selenium" },
      name: "Target",
    };
    const selector = mount(LaunchAssetSelector, {
      props: {
        copy: english.TestLauncher.cycleSelector,
        groupName: "cycle",
        items: [asset],
        modelValue: "cycle-1",
      },
    });
    const targetPanel = mount(LaunchTargetConfigurator, {
      props: {
        copy: english.LaunchTarget,
        modelValue: "target-1",
        targets: [target],
      },
    });
    const preflight = mount(LaunchPreflightPanel, {
      props: {
        copy: english.LaunchPreflight,
        result: normalizePreflightResult({ diagnostics: [] }, "hash"),
        stale: false,
      },
      global: { stubs: { fontAwesomeIcon: true } },
    });
    const review = mount(LaunchReviewSummary, {
      props: {
        copy: english.LaunchReview,
        summary: buildLaunchReviewSummary({
          cycle: asset,
          environment: { code: "demo", id: "env-1", name: "Demo" },
          projectId: "project-1",
          target,
        }),
      },
    });

    expect(selector.findAll("input, button").length).toBeGreaterThan(1);
    expect(targetPanel.findAll("input, button").length).toBeGreaterThan(2);
    expect(preflight.get("section").attributes("aria-label")).toBe(
      "Launch preflight diagnostics",
    );
    await review.get("button").trigger("click");
    expect(review.text()).toContain("CLI command copied to clipboard.");
    expect(italian.LaunchReview.copyCommand).toBeTruthy();
    expect(italian.LaunchErrors.authorization).toBeTruthy();
  });

  it("keeps reduced-width and zoom containment styles in critical launch panels", () => {
    const sources = [
      "src/components/launch/LaunchAssetSelector.vue",
      "src/components/launch/LaunchTargetConfigurator.vue",
      "src/components/launch/LaunchPreflightPanel.vue",
      "src/components/launch/LaunchReviewSummary.vue",
      "src/view/testlauncher.vue",
    ].map((file) => readFileSync(file, "utf8"));

    for (const source of sources) {
      expect(source).toContain("@media");
      expect(source).toContain("min-width: 0");
    }
  });
});
