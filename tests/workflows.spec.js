import { describe, expect, it } from "vitest";

import {
  buildEnvironmentPayload,
  buildStepPayload,
  buildTestCyclePayload,
  buildTestPayload,
} from "@/domain/workflowPayloads";

describe("workflow payloads", () => {
  it("builds tenant-scoped test and test-cycle payloads", () => {
    expect(
      buildTestPayload({
        name: " Login ",
        description: " Happy path ",
        steps: [1],
        projectId: 4,
      }),
    ).toEqual({
      name: "Login",
      description: "Happy path",
      config: "[1]",
      idProject: 4,
    });
    expect(
      buildTestCyclePayload({
        name: " Release ",
        description: " Smoke ",
        tests: [2],
        projectId: 4,
      }),
    ).toEqual({
      name: "Release",
      description: "Smoke",
      config: "[2]",
      idProject: 4,
    });
  });

  it("extracts normalized step and environment persistence rules", () => {
    expect(
      buildStepPayload({
        name: " STEP ",
        description: " DESC ",
        config: {},
        projectId: 2,
      }),
    ).toEqual({
      name: "step",
      description: "desc",
      config: "{}",
      idProject: 2,
    });
    expect(
      buildEnvironmentPayload({
        code: " PROD ",
        description: " Main ",
        config: {},
        projectId: 2,
      }),
    ).toEqual({
      code: "prod",
      description: "Main",
      config: "{}",
      idProject: 2,
    });
  });

  it("rejects writes without a selected project", () => {
    expect(() =>
      buildTestPayload({
        name: "x",
        description: "x",
        steps: [],
        projectId: null,
      }),
    ).toThrow("A project must be selected");
  });
});
