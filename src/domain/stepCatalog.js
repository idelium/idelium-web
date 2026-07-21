import appium from "@/view/steps/appium";
import postman from "@/view/steps/postman";
import selenium from "@/view/steps/selenium";
import webservices from "@/view/steps/webservices";

export const STEP_CATALOG_VERSION = "2026.07";

export const STEP_RUNTIMES = {
  appium: {
    label: "appium",
    stepsFile: appium.stepsFile,
  },
  postman: {
    label: "postman",
    stepsFile: postman.stepsFile,
  },
  selenium: {
    label: "selenium",
    stepsFile: selenium.stepsFile,
  },
  webservice: {
    label: "webservice",
    stepsFile: webservices.stepsFile,
  },
};

export function getStepCatalog(runtime) {
  return STEP_RUNTIMES[runtime]?.stepsFile || [];
}

export function findCatalogEntry(stepType) {
  for (const [runtime, catalog] of Object.entries(STEP_RUNTIMES)) {
    const entry = catalog.stepsFile.find((step) => step.name === stepType);
    if (entry) {
      return {
        catalogVersion: STEP_CATALOG_VERSION,
        runtime,
        entry,
      };
    }
  }
  return null;
}
