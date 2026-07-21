import { describe, expect, it } from "vitest";

import appium from "@/view/steps/appium";
import selenium from "@/view/steps/selenium";
import environmentParameters from "@/view/environments/environmentsParameter";
import {
  STEP_CATALOG_VERSION,
  findCatalogEntry,
  getStepCatalog,
} from "@/domain/stepCatalog";

describe("step catalog", () => {
  it("exposes Selenium commands that match the CLI command names", () => {
    const commandNames = getStepCatalog("selenium").map((step) => step.name);

    expect(commandNames).toContain("find_element_by_xpath");
    expect(commandNames).toContain("find_elements");
    expect(commandNames).toContain("selenium_command");
    expect(commandNames).toContain("selenium_actions");
    expect(commandNames).not.toContain("find_element_by_type");
    expect(commandNames).not.toContain("find_elements_by_type");
  });

  it("provides a versioned catalog lookup for runtime-backed steps", () => {
    const seleniumEntry = findCatalogEntry("selenium_command");
    const appiumEntry = findCatalogEntry("appium_mobile_command");

    expect(STEP_CATALOG_VERSION).toBe("2026.07");
    expect(seleniumEntry.runtime).toBe("selenium");
    expect(seleniumEntry.catalogVersion).toBe(STEP_CATALOG_VERSION);
    expect(appiumEntry.runtime).toBe("appium");
  });

  it("exposes Selenium CLI compatibility fields", () => {
    const byName = Object.fromEntries(
      selenium.stepsFile.map((step) => [step.name, step]),
    );
    const waitFields = byName.wait_for_next_step.syntax.map(
      (field) => field.typeName,
    );
    const commandFields = byName.selenium_command.syntax.map(
      (field) => field.typeName,
    );

    expect(waitFields).toContain("waitCondition");
    expect(waitFields).toContain("waitSeconds");
    expect(commandFields).toContain("operation");
    expect(commandFields).toContain("args");
    expect(byName.selenium_actions.syntax[0].typeName).toBe("actions");
  });

  it("uses command-specific Appium parameters for common mobile actions", () => {
    const byName = Object.fromEntries(
      appium.stepsFile.map((step) => [step.name, step]),
    );

    expect(byName.appium_set_page_load_timeout.syntax[0].typeName).toBe(
      "milliseconds",
    );
    expect(byName.appium_orientation.syntax[0].typeName).toBe("orientation");
    expect(byName.appium_get_log.syntax[0].typeName).toBe("typeString");
    expect(byName.appium_activate_app.syntax[0].typeName).toBe("bundleId");
    expect(byName.appium_get_performance_data.syntax[2].typeName).toBe(
      "dataReadTimeout",
    );
  });

  it("exposes Appium mobile command fields supported by the CLI", () => {
    const byName = Object.fromEntries(
      appium.stepsFile.map((step) => [step.name, step]),
    );
    const fields = byName.appium_mobile_command.syntax.map(
      (field) => field.typeName,
    );

    expect(fields).toEqual(["mobileCommand", "params", "requiredPlugin"]);
  });

  it("exposes Selenium and Appium environment metadata supported by the CLI", () => {
    const seleniumFields = environmentParameters.selenium.map(
      (field) => field.typeName,
    );
    const appiumFields = environmentParameters.appium.map(
      (field) => field.typeName,
    );

    expect(seleniumFields).toContain("seleniumGridUrl");
    expect(seleniumFields).toContain("seleniumGridCapabilities");
    expect(seleniumFields).toContain("seleniumHeadless");
    expect(seleniumFields).toContain("seleniumProxyUrl");
    expect(seleniumFields).toContain("seleniumDownloadDirectory");
    expect(seleniumFields).toContain("seleniumLocale");
    expect(seleniumFields).toContain("seleniumBiDiEnabled");
    expect(appiumFields).toContain("automationName");
    expect(appiumFields).toContain("appiumRequiredDrivers");
    expect(appiumFields).toContain("appiumRequiredPlugins");
    expect(appiumFields).toContain("appiumMobileCommandsAllowed");
  });
});
