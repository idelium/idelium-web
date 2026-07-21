import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { isReactive } from "vue";

import Wizard from "@/view/steps/wizard.vue";

describe("steps wizard Postman import", () => {
  function mountWizard() {
    return shallowMount(Wizard, {
      global: {
        stubs: {
          JsonEditor: { template: "<div />" },
          FileUpload: { template: "<div />" },
          draggable: { template: "<div />" },
          "v-select": { template: "<div />" },
        },
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { plugins: "plugins" },
          },
          language: {
            gb: {
              Actions: {
                refresh: "Refresh",
                remove: "Remove",
              },
              Plugins: {
                importPlugin: {
                  extensionIsWrong: "Only JSON files are supported",
                },
              },
              Steps: {
                wizard: {
                  addStep: "Add step",
                  attachScreenshot: "Attach screenshot",
                  failedExit: "Failed exit",
                  importPostman: {
                    isNotCollectionFile: "Invalid Postman file",
                  },
                  name: "Name",
                  step: {
                    addStepType: "Add step type",
                    editStepType: "Edit step type",
                    note: "Note",
                  },
                  typeStepOrderTitle: "Selected steps",
                  typeStepTitle: "Step type",
                  uploadPostmanCollection: "Upload Postman collection",
                  uploadPostmanEnvironment: "Upload Postman environment",
                  uploadPostmanEnvironmentOverrite: "Overwrite",
                },
              },
            },
          },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
        },
      },
    });
  }

  it("stores imported Postman collections outside Vue reactivity", async () => {
    const wrapper = mountWizard();
    const collection = {
      info: { name: "Imported API" },
      item: [{ name: "Status", request: { method: "GET" } }],
    };

    await wrapper.setData({
      files: [{ name: "collection.json" }],
      arraySyntax: [{ typeName: "collection", type: "postman_collection" }],
      stepTypeSelected: {
        name: "postman_collection",
        syntax: [{ typeName: "collection", type: "postman_collection" }],
      },
    });

    await wrapper.vm.inputFilter({
      name: "collection.json",
      file: { text: vi.fn().mockResolvedValue(JSON.stringify(collection)) },
    });

    const importedPayload = wrapper.vm.arrayStepTypeToAdd[0].collection;
    expect(importedPayload.collection.info.name).toBe("Imported API");
    expect(isReactive(importedPayload.collection)).toBe(false);
    expect(wrapper.vm.files).toEqual([]);
  });
});
