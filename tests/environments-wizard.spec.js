import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import EnvironmentWizard from "@/view/environments/wizard.vue";

function mountWizard(environmentType = "web", currentLanguage = "gb") {
  const bvModal = {
    msgBoxOk: vi.fn(),
  };
  const wrapper = mount(EnvironmentWizard, {
    props: {
      json: {},
      environmentType,
    },
    global: {
      mocks: {
        $bvModal: bvModal,
        config: {
          currentLanguage,
        },
        language: {
          gb: {
            Actions: {
              delete: "Delete",
            },
            Environments: {
              addVariable: "Add variable",
              invalidJson: "{field} must be valid JSON",
              invalidSeleniumGridUrl:
                "Selenium Grid URL must be an HTTP or HTTPS URL without embedded credentials",
              invalidSeleniumProxyUrl:
                "Selenium proxy URL must be an HTTP or HTTPS URL without embedded credentials",
              mandatory: "mandatory",
              name: "name",
              someValuesAreMandatory: "Please fill the mandatory fields",
              someVariableValuesAreEmpty: "Some variable values are empty",
              unsupportedHeadlessBrowser:
                "Headless mode is not supported for the selected browser",
              value: "value",
            },
          },
          it: {
            Actions: {
              delete: "Elimina",
            },
            Environments: {
              addVariable: "Aggiungi variabile",
              invalidJson: "{field} deve contenere un JSON valido",
              invalidSeleniumGridUrl:
                "L'URL Selenium Grid deve essere HTTP o HTTPS e non deve contenere credenziali",
              invalidSeleniumProxyUrl:
                "L'URL proxy Selenium deve essere HTTP o HTTPS e non deve contenere credenziali",
              mandatory: "obbligatorio",
              name: "nome",
              someValuesAreMandatory: "Compila i campi obbligatori",
              someVariableValuesAreEmpty:
                "Alcuni valori di variabile sono vuoti",
              unsupportedHeadlessBrowser:
                "La modalità headless non è supportata per il browser selezionato",
              value: "valore",
            },
          },
        },
      },
    },
  });
  return { wrapper, bvModal };
}

describe("environment wizard", () => {
  function setValue(wrapper, typeName, value) {
    const index = wrapper.vm.parameters.findIndex(
      (parameter) => parameter.typeName === typeName,
    );
    expect(index).toBeGreaterThanOrEqual(0);
    wrapper.vm.values.splice(index, 1, value);
  }

  it("loads legacy JSON by parameter name instead of object key order", () => {
    const { wrapper } = mountWizard("app");

    wrapper.vm.putJson({
      customSecretName: "runtime-token",
      appiumDesiredCaps: {
        platformVersion: "17.5",
        deviceName: "iPhone 15",
        appPackage: "org.idelium.demo",
        app: "/tmp/app.ipa",
        automationName: "XCUITest",
        platformName: "ios",
        uiautomator2ServerInstallTimeout: 120000,
        androidInstallTimeout: 130000,
      },
      appiumServer: "http://appium:4723/wd/hub",
      os: "ios",
      isRealDevice: true,
      appiumRequiredDrivers: ["xcuitest"],
      appiumRequiredPlugins: ["images"],
      appiumMobileCommandsAllowed: ["customCommand"],
    });

    const valuesByName = Object.fromEntries(
      wrapper.vm.parameters.map((parameter, index) => [
        parameter.typeName,
        wrapper.vm.values[index],
      ]),
    );

    expect(valuesByName.os).toBe("ios");
    expect(valuesByName.appiumServer).toBe("http://appium:4723/wd/hub");
    expect(valuesByName.automationName).toBe("XCUITest");
    expect(valuesByName.platformVersion).toBe("17.5");
    expect(JSON.parse(valuesByName.appiumRequiredDrivers)).toEqual([
      "xcuitest",
    ]);
    expect(JSON.parse(valuesByName.appiumRequiredPlugins)).toEqual(["images"]);
    expect(JSON.parse(valuesByName.appiumMobileCommandsAllowed)).toEqual([
      "customCommand",
    ]);
    expect(wrapper.vm.environments).toEqual([
      {
        name: "customSecretName",
        value: "runtime-token",
      },
    ]);

    wrapper.vm.generateJson(false);

    expect(wrapper.emitted("changeWizardJson")[0][0]).toMatchObject({
      appiumServer: "http://appium:4723/wd/hub",
      appiumRequiredDrivers: ["xcuitest"],
      appiumRequiredPlugins: ["images"],
      appiumMobileCommandsAllowed: ["customCommand"],
      customSecretName: "runtime-token",
      appiumDesiredCaps: {
        automationName: "XCUITest",
        platformVersion: "17.5",
        deviceName: "iPhone 15",
        appPackage: "org.idelium.demo",
        app: "/tmp/app.ipa",
      },
    });
  });

  it("shows localized JSON validation errors in the selected language", async () => {
    const { wrapper, bvModal } = mountWizard("web", "gb");
    const jsonFieldIndex = wrapper.vm.parameters.findIndex(
      (parameter) => parameter.typeName === "seleniumGridCapabilities",
    );

    wrapper.vm.values.splice(jsonFieldIndex, 1, "{invalid");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.values[jsonFieldIndex]).toBe("{invalid");
    expect(
      wrapper.vm.normalizedValue(
        wrapper.vm.parameters[jsonFieldIndex],
        "{invalid",
        false,
      ),
    ).toBe(false);
    expect(bvModal.msgBoxOk).toHaveBeenCalledWith(
      "seleniumGridCapabilities must be valid JSON",
      {
        okVariant: "danger",
        size: "sm",
        buttonSize: "sm",
      },
    );

    bvModal.msgBoxOk.mockClear();
    wrapper.vm.config.currentLanguage = "it";

    expect(
      wrapper.vm.normalizedValue(
        wrapper.vm.parameters[jsonFieldIndex],
        "{invalid",
        false,
      ),
    ).toBe(false);
    expect(bvModal.msgBoxOk).toHaveBeenCalledWith(
      "seleniumGridCapabilities deve contenere un JSON valido",
      {
        okVariant: "danger",
        size: "sm",
        buttonSize: "sm",
      },
    );
  });

  it("maps Selenium convenience fields to W3C capabilities", () => {
    const { wrapper } = mountWizard("web");

    setValue(wrapper, "seleniumGridUrl", "https://grid.example.test:4444");
    setValue(wrapper, "browser", "chrome");
    setValue(wrapper, "seleniumHeadless", true);
    setValue(wrapper, "seleniumProxyUrl", "http://proxy.example.test:8080");
    setValue(wrapper, "seleniumDownloadDirectory", "/tmp/downloads");
    setValue(wrapper, "seleniumLocale", "en-US");
    setValue(wrapper, "seleniumBiDiEnabled", true);
    setValue(
      wrapper,
      "seleniumGridCapabilities",
      JSON.stringify({ platformName: "linux" }),
    );

    wrapper.vm.generateJson(false);

    expect(wrapper.emitted("changeWizardJson")[0][0]).toMatchObject({
      seleniumGridUrl: "https://grid.example.test:4444",
      seleniumGridCapabilities: {
        platformName: "linux",
        webSocketUrl: true,
        proxy: {
          proxyType: "manual",
          httpProxy: "http://proxy.example.test:8080",
          sslProxy: "http://proxy.example.test:8080",
        },
        "goog:chromeOptions": {
          args: ["--headless=new", "--lang=en-US"],
          prefs: {
            "download.default_directory": "/tmp/downloads",
          },
        },
      },
    });
    expect(
      wrapper.emitted("changeWizardJson")[0][0].seleniumHeadless,
    ).toBeUndefined();
  });

  it("blocks Selenium Grid URLs with embedded credentials", () => {
    const { wrapper, bvModal } = mountWizard("web");

    setValue(
      wrapper,
      "seleniumGridUrl",
      "https://user:secret@grid.example.test",
    );

    expect(wrapper.vm.generateJson(false)).toBe(false);
    expect(bvModal.msgBoxOk).toHaveBeenCalledWith(
      "Selenium Grid URL must be an HTTP or HTTPS URL without embedded credentials",
      {
        okVariant: "danger",
        size: "sm",
        buttonSize: "sm",
      },
    );
  });
});
