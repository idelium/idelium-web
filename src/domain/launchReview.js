import { redactLaunchConfiguration } from "@/domain/launchContracts";

function asText(value, fallback = "n/a") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function shellValue(value) {
  return String(value ?? "")
    .replace(/[\n\r\t]/g, " ")
    .replace(/"/g, '\\"');
}

export function buildLaunchCliCommand({
  baseUrl = "https://localhost",
  concurrency = 1,
  cycle,
  environment,
  projectId,
  target,
  overrides = {},
} = {}) {
  const args = [
    "idelium",
    `--idCycle=${shellValue(cycle?.id)}`,
    `--idProject=${shellValue(projectId)}`,
    `--environment=${shellValue(environment?.code ?? environment?.id)}`,
    `--ideliumwsBaseurl=${shellValue(baseUrl)}`,
  ];
  if (Number(concurrency) > 1) args.push(`--parallel=${Number(concurrency)}`);
  if (target?.type) args.push(`--target=${shellValue(target.type)}`);
  if (overrides.browser)
    args.push(`--browser=${shellValue(overrides.browser)}`);
  if (overrides.device) args.push(`--device=${shellValue(overrides.device)}`);
  return args.join(" ");
}

export function buildLaunchReviewSummary({
  baseUrl,
  concurrency,
  cycle,
  environment,
  launchRequest,
  preflightResult,
  projectId,
  target,
  overrides,
} = {}) {
  const redactedPayload = redactLaunchConfiguration(launchRequest?.body ?? {});
  const warnings = (preflightResult?.diagnostics ?? []).filter(
    (diagnostic) => !diagnostic.blocking,
  );

  return {
    cliCommand: buildLaunchCliCommand({
      baseUrl,
      concurrency,
      cycle,
      environment,
      overrides,
      projectId,
      target,
    }),
    payload: redactedPayload,
    rows: [
      { key: "project", value: asText(projectId) },
      {
        key: "cycle",
        value: `${asText(cycle?.name)} (${asText(cycle?.metadata?.version)})`,
      },
      {
        key: "environment",
        value: `${asText(environment?.name)} (${asText(environment?.metadata?.version)})`,
      },
      { key: "target", value: asText(target?.name) },
      { key: "concurrency", value: asText(concurrency) },
      {
        key: "overrides",
        value: asText(
          Object.values(overrides ?? {})
            .filter(Boolean)
            .join(", "),
        ),
      },
      { key: "artifactPolicy", value: "server-retained redacted artifacts" },
    ],
    warnings,
  };
}

export function serializeLaunchReview(summary) {
  return JSON.stringify(
    {
      cliCommand: summary.cliCommand,
      payload: summary.payload,
      rows: summary.rows,
      warnings: summary.warnings,
    },
    null,
    2,
  );
}
