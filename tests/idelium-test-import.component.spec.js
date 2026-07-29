import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import ImportIdeliumTest from "@/view/tests/importIdeliumTest.vue";
import english from "@/languages/english";

describe("Idelium test import component", () => {
  function mountImport() {
    return mount(ImportIdeliumTest, {
      global: {
        mocks: {
          config: { currentLanguage: "gb" },
          language: { gb: english },
        },
        stubs: {
          "file-upload": {
            template: '<div class="file-upload"><slot /></div>',
          },
        },
      },
    });
  }

  it("loads a native Idelium JSON test definition", async () => {
    const wrapper = mountImport();
    const definition = {
      name: "Idelium demo smoke test",
      description: "Open the public Idelium demo page.",
      steps: [
        {
          name: "Open Idelium demo",
          failedExit: true,
          attachScreenshot: true,
          steps: [
            {
              stepType: "open_browser",
              url: "https://idelium.org/demo/",
            },
          ],
        },
      ],
    };

    wrapper.vm.loadJson(definition);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showUpload).toBe(false);
    expect(wrapper.emitted("importTest").at(-1)[0]).toEqual({
      name: "Idelium demo smoke test",
      description: "Open the public Idelium demo page.",
      tests: definition.steps,
    });
  });

  it("rejects definitions without executable Idelium steps", () => {
    const wrapper = mountImport();

    wrapper.vm.loadJson({
      name: "Invalid import",
      description: "No executable steps",
      steps: [{ name: "Empty step", steps: [] }],
    });

    expect(wrapper.vm.showUpload).toBe(true);
    expect(wrapper.vm.errortext).toBe(english.Tests.ideliumImport.invalidStep);
    expect(wrapper.emitted("importTest")).toBeUndefined();
  });
});
