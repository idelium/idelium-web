import { useSessionStore } from "@/stores/session";

export const PROJECT_SCOPED_ROUTE_NAMES = new Set([
  "testsperformed",
  "testlauncher",
  "testcycles",
  "tests",
  "steps",
  "plugins",
  "environments",
  "platforms",
  "postman",
]);

export function isProjectScopedRouteName(routeName) {
  return PROJECT_SCOPED_ROUTE_NAMES.has(routeName);
}

export function selectedProjectRoute(link, projectId) {
  if (!PROJECT_SCOPED_ROUTE_NAMES.has(link)) return { path: "/" + link };
  if (!projectId) return { name: "projects" };

  return {
    name: link,
    params: {
      projectId,
    },
  };
}

export function selectedProjectPath(link, projectId) {
  if (!PROJECT_SCOPED_ROUTE_NAMES.has(link)) return "/" + link;
  if (!projectId) return "/" + link;

  return "/projects/" + projectId + "/" + link;
}

export function legacyProjectRouteRedirect(to) {
  const session = useSessionStore();
  const projectId = session.selectedProjectId;
  if (!projectId) return { name: "projects" };

  return {
    name: to.meta.projectRouteName,
    params: {
      ...to.params,
      projectId,
    },
    query: to.query,
  };
}
