function requireProject(projectId) {
  if (projectId === null || projectId === undefined || projectId === "") {
    throw new Error("A project must be selected");
  }
  return projectId;
}

export function buildTestPayload({ name, description, steps, projectId }) {
  return {
    name: name.trim(),
    description: description.trim(),
    config: JSON.stringify(steps),
    idProject: requireProject(projectId),
  };
}

export function buildTestCyclePayload({ name, description, tests, projectId }) {
  return {
    name: name.trim(),
    description: description.trim(),
    config: JSON.stringify(tests),
    idProject: requireProject(projectId),
  };
}

export function buildStepPayload({ name, description, config, projectId }) {
  return {
    name: name.trim().toLowerCase(),
    description: description.trim().toLowerCase(),
    config: JSON.stringify(config),
    idProject: requireProject(projectId),
  };
}

export function buildEnvironmentPayload({
  code,
  description,
  config,
  projectId,
}) {
  return {
    code: code.trim().toLowerCase(),
    description: description.trim(),
    config: JSON.stringify(config),
    idProject: requireProject(projectId),
  };
}
