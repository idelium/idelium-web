import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/apiClient", () => ({ default: { get: vi.fn() } }));

import ImportPlugin from "@/view/plugin/importPlugin.vue";

describe("plugin import component", () => {
  function mountImportPlugin(
    config = { currentLanguage: "gb" },
    emitter = { on: vi.fn() },
  ) {
    return shallowMount(ImportPlugin, {
      global: {
        mocks: {
          config,
          language: {
            gb: {
              Plugins: {
                importPlugin: {
                  importPluginFile: "Upload Idelium plugin file",
                },
              },
            },
            it: {
              Plugins: {
                importPlugin: {
                  importPluginFile: "Carica il plugin Idelium",
                },
              },
            },
          },
          emitter,
        },
        stubs: {
          FileUpload: {
            template: "<div><slot /></div>",
          },
        },
      },
    });
  }

  it("shows the localized plugin upload prompt", () => {
    const wrapper = mountImportPlugin();

    expect(wrapper.text()).toContain("Upload Idelium plugin file");
  });

  it("updates the upload prompt when the plugin page refreshes after a language change", async () => {
    let refreshPlugin;
    const config = { currentLanguage: "gb" };
    const wrapper = mountImportPlugin(config, {
      on: vi.fn((event, callback) => {
        if (event === "refreshPlugin") refreshPlugin = callback;
      }),
    });

    config.currentLanguage = "it";
    refreshPlugin();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Carica il plugin Idelium");
  });
});
