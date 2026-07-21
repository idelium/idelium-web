import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { isReactive } from "vue";

import Wizard from "@/view/steps/wizard.vue";
import { STEP_CATALOG_VERSION } from "@/domain/stepCatalog";

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
                catalog: {
                  compatibilityTitle: "Compatibility",
                  groups: {
                    advanced: "Advanced Selenium",
                    basic: "Basic steps",
                  },
                  steps: {
                    open_browser: {
                      label: "Open browser",
                    },
                    selenium_command: {
                      group: "advanced",
                      label: "Advanced Selenium command",
                      note: "Covers browser automation scenarios.",
                    },
                    selenium_actions: {
                      group: "advanced",
                      label: "Selenium action chain",
                    },
                  },
                  fields: {
                    operation: {
                      label: "Operation",
                      placeholder: "Select operation",
                      hint: "Choose a supported Selenium command.",
                    },
                  },
                  options: {
                    operation: {
                      get_title: "Read page title",
                    },
                  },
                },
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
            it: {
              Actions: {
                refresh: "Aggiorna",
                remove: "Rimuovi",
              },
              Plugins: {
                importPlugin: {
                  extensionIsWrong: "Sono supportati solo file JSON",
                },
              },
              Steps: {
                catalog: {
                  compatibilityTitle: "Compatibilità",
                  groups: {
                    advanced: "Selenium avanzato",
                    basic: "Step base",
                  },
                  steps: {
                    open_browser: {
                      label: "Apri browser",
                    },
                    selenium_command: {
                      group: "advanced",
                      label: "Comando Selenium avanzato",
                      note: "Copre scenari di automazione browser.",
                    },
                    selenium_actions: {
                      group: "advanced",
                      label: "Catena azioni Selenium",
                    },
                  },
                  fields: {
                    operation: {
                      label: "Operazione",
                      placeholder: "Seleziona operazione",
                      hint: "Scegli un comando Selenium supportato.",
                    },
                  },
                  options: {
                    operation: {
                      get_title: "Leggi titolo pagina",
                    },
                  },
                },
                wizard: {
                  addStep: "Aggiungi step",
                  attachScreenshot: "Cattura screenshot",
                  failedExit: "Esci se fallisce",
                  importPostman: {
                    isNotCollectionFile: "File Postman non valido",
                  },
                  name: "Nome",
                  step: {
                    addStepType: "Aggiungi tipo step",
                    editStepType: "Modifica tipo step",
                    note: "Nota",
                  },
                  typeStepOrderTitle: "Step selezionati",
                  typeStepTitle: "Tipo step",
                  uploadPostmanCollection: "Carica collection Postman",
                  uploadPostmanEnvironment: "Carica environment Postman",
                  uploadPostmanEnvironmentOverrite: "Sovrascrivi",
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

  it("stores runtime and catalog version metadata on created steps", async () => {
    const wrapper = mountWizard();

    wrapper.vm.typeOfWrapperSelected = "selenium";
    wrapper.vm.arraySyntax = [{ typeName: "operation", type: "options" }];
    wrapper.vm.responseTypeSelect = ["get_title"];
    wrapper.vm.stepTypeSelected = {
      name: "selenium_command",
      syntax: [{ typeName: "operation", type: "options" }],
    };
    wrapper.vm.note = "Read title";

    wrapper.vm.addEditTypeStep(true);

    expect(wrapper.vm.arrayStepTypeToAdd[0]).toMatchObject({
      stepType: "selenium_command",
      runtime: "selenium",
      catalogVersion: STEP_CATALOG_VERSION,
      operation: "get_title",
      note: "Read title",
    });
  });

  it("localizes catalog-driven labels without changing stored technical values", () => {
    const wrapper = mountWizard();
    const step = {
      name: "selenium_command",
      syntax: [{ typeName: "operation", type: "options" }],
    };
    const syntax = step.syntax[0];

    wrapper.vm.stepTypeSelected = step;

    expect(wrapper.vm.stepOptionLabel(step)).toBe("Advanced Selenium command");
    expect(wrapper.vm.syntaxLabel(syntax)).toBe("Operation");
    expect(wrapper.vm.syntaxPlaceholder(syntax)).toBe("Select operation");
    expect(wrapper.vm.syntaxHint(syntax)).toBe(
      "Choose a supported Selenium command.",
    );
    expect(wrapper.vm.optionLabel(syntax, "get_title")).toBe("Read page title");
    expect(wrapper.vm.stepCompatibilityNote()).toBe(
      "Covers browser automation scenarios.",
    );

    wrapper.vm.config.currentLanguage = "it";

    expect(wrapper.vm.stepOptionLabel(step)).toBe("Comando Selenium avanzato");
    expect(wrapper.vm.syntaxLabel(syntax)).toBe("Operazione");
    expect(wrapper.vm.syntaxPlaceholder(syntax)).toBe("Seleziona operazione");
    expect(wrapper.vm.syntaxHint(syntax)).toBe(
      "Scegli un comando Selenium supportato.",
    );
    expect(wrapper.vm.optionLabel(syntax, "get_title")).toBe(
      "Leggi titolo pagina",
    );
    expect(wrapper.vm.stepCompatibilityNote()).toBe(
      "Copre scenari di automazione browser.",
    );
    expect(step.name).toBe("selenium_command");
    expect(syntax.typeName).toBe("operation");
  });

  it("groups basic and advanced catalog options", () => {
    const wrapper = mountWizard();
    wrapper.vm.stepsType = [
      { name: "open_browser", syntax: [] },
      { name: "selenium_command", syntax: [] },
      { name: "selenium_actions", syntax: [] },
    ];

    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[0])).toBe(true);
    expect(wrapper.vm.stepOptionGroupLabel(wrapper.vm.stepsType[0])).toBe(
      "Basic steps",
    );
    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[1])).toBe(true);
    expect(wrapper.vm.stepOptionGroupLabel(wrapper.vm.stepsType[1])).toBe(
      "Advanced Selenium",
    );
    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[2])).toBe(false);
  });
});
