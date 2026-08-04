import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { isReactive } from "vue";

import Wizard from "@/view/steps/wizard.vue";
import { STEP_CATALOG_VERSION } from "@/domain/stepCatalog";

describe("steps wizard Postman import", () => {
  function mountWizard(options = {}) {
    return shallowMount(Wizard, {
      props: options.props || {},
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
                    appiumCore: "Mobile actions",
                    basic: "Core actions",
                  },
                  steps: {
                    open_browser: {
                      label: "Open browser",
                      description: "Starts the browser session.",
                    },
                    wait_and_click: {
                      label: "Wait and click",
                      description: "Waits and clicks the target.",
                    },
                    wait_for_next_step: {
                      label: "Wait for condition",
                      description: "Waits before continuing.",
                    },
                    selenium_command: {
                      group: "advanced",
                      label: "Advanced Selenium command",
                      description: "Runs an advanced Selenium command.",
                      note: "Covers browser automation scenarios.",
                    },
                    selenium_actions: {
                      group: "advanced",
                      label: "Selenium action chain",
                      description: "Runs action chains.",
                    },
                    appium_back: {
                      label: "Back navigation",
                      description: "Sends the mobile back command.",
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
                  loadPluginActions: "Load plugin actions",
                  runtimeLabel: "Runtime",
                  actionLabel: "Action",
                  flowRuntime: "Choose runtime",
                  flowConfigure: "Configure fields",
                  flowSequence: "Add to sequence",
                  flowSave: "Save step",
                  importPostman: {
                    isNotCollectionFile: "Invalid Postman file",
                  },
                  name: "Name",
                  step: {
                    addStepType: "Add action",
                    editStepType: "Update selected action",
                    note: "Note",
                  },
                  typeStepOrderTitle: "Selected steps",
                  typeStepOrderDescription:
                    "Select an action to edit its fields.",
                  selectedAction: "Selected",
                  editingActionTitle: "Editing action",
                  cancelEditAction: "Cancel action edit",
                  deleteAction: "Delete action",
                  emptyActionState: "Select an action to edit its fields.",
                  emptyCatalogState: "No actions are available.",
                  emptySequenceState: "Your execution sequence is empty.",
                  validationNoteRequired: "Action note is required",
                  validationFieldRequired: "is required",
                  postmanCollectionLabel: "Collection",
                  postmanCollectionMissing: "Upload a Postman collection",
                  postmanRequestsLabel: "Requests",
                  postmanEnvironmentLabel: "Environment",
                  postmanEnvironmentOptional: "Optional",
                  fieldGroups: {
                    action: {
                      title: "Action values",
                      description: "Define the value or operation.",
                    },
                    advanced: {
                      title: "Advanced settings",
                      description: "Configure additional runtime options.",
                    },
                    assertion: {
                      title: "Assertions",
                      description: "Describe the expected outcome.",
                    },
                    locator: {
                      title: "Locator",
                      description: "Define how the runtime finds the target.",
                    },
                    postman: {
                      title: "Postman package",
                      description: "Upload the collection.",
                    },
                    wait: {
                      title: "Wait policy",
                      description: "Control timeout and wait condition.",
                    },
                  },
                  typeStepTitle: "Action builder",
                  typeStepDescription:
                    "Choose an automation action and configure its fields.",
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
                    appiumCore: "Azioni mobile",
                    basic: "Azioni core",
                  },
                  steps: {
                    open_browser: {
                      label: "Apri browser",
                      description: "Avvia la sessione browser.",
                    },
                    wait_and_click: {
                      label: "Attendi e clicca",
                      description: "Attende e clicca il target.",
                    },
                    wait_for_next_step: {
                      label: "Attendi una condizione",
                      description: "Attende prima di continuare.",
                    },
                    selenium_command: {
                      group: "advanced",
                      label: "Comando Selenium avanzato",
                      description: "Esegue un comando Selenium avanzato.",
                      note: "Copre scenari di automazione browser.",
                    },
                    selenium_actions: {
                      group: "advanced",
                      label: "Catena azioni Selenium",
                      description: "Esegue catene di azioni.",
                    },
                    appium_back: {
                      label: "Navigazione indietro",
                      description: "Invia il comando back mobile.",
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
                  loadPluginActions: "Carica azioni plugin",
                  runtimeLabel: "Runtime",
                  actionLabel: "Azione",
                  flowRuntime: "Scegli runtime",
                  flowConfigure: "Configura campi",
                  flowSequence: "Aggiungi alla sequenza",
                  flowSave: "Salva step",
                  importPostman: {
                    isNotCollectionFile: "File Postman non valido",
                  },
                  name: "Nome",
                  step: {
                    addStepType: "Aggiungi azione",
                    editStepType: "Aggiorna azione selezionata",
                    note: "Nota",
                  },
                  typeStepOrderTitle: "Step selezionati",
                  typeStepOrderDescription:
                    "Seleziona un'azione per modificarne i campi.",
                  selectedAction: "Selezionato",
                  editingActionTitle: "Azione in modifica",
                  cancelEditAction: "Annulla modifica azione",
                  deleteAction: "Elimina azione",
                  emptyActionState: "Seleziona un'azione per modificarne i campi.",
                  emptyCatalogState: "Nessuna azione disponibile.",
                  emptySequenceState: "La sequenza di esecuzione è vuota.",
                  validationNoteRequired: "La nota dell'azione è obbligatoria",
                  validationFieldRequired: "è obbligatorio",
                  postmanCollectionLabel: "Collection",
                  postmanCollectionMissing: "Carica una collection Postman",
                  postmanRequestsLabel: "Request",
                  postmanEnvironmentLabel: "Environment",
                  postmanEnvironmentOptional: "Opzionale",
                  fieldGroups: {
                    action: {
                      title: "Valori azione",
                      description: "Definisci il valore o l'operazione.",
                    },
                    advanced: {
                      title: "Impostazioni avanzate",
                      description: "Configura opzioni aggiuntive.",
                    },
                    assertion: {
                      title: "Assertion",
                      description: "Descrivi il risultato atteso.",
                    },
                    locator: {
                      title: "Locator",
                      description: "Definisci come trovare il target.",
                    },
                    postman: {
                      title: "Pacchetto Postman",
                      description: "Carica la collection.",
                    },
                    wait: {
                      title: "Politica di wait",
                      description: "Controlla timeout e condizione.",
                    },
                  },
                  typeStepTitle: "Costruttore azione",
                  typeStepDescription:
                    "Scegli un'azione di automazione e configura i campi.",
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
    expect(wrapper.vm.stepTypeSelected).toBe(null);
    expect(wrapper.vm.indexForEdit).toBe(-1);
  });

  it("renders the guided authoring flow and empty sequence state", () => {
    const wrapper = mountWizard();

    expect(wrapper.text()).toContain("Choose runtime");
    expect(wrapper.text()).toContain("Configure fields");
    expect(wrapper.text()).toContain("Your execution sequence is empty.");
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
    expect(wrapper.vm.stepOptionDescription(step)).toBe(
      "Runs an advanced Selenium command.",
    );
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
    expect(wrapper.vm.stepOptionDescription(step)).toBe(
      "Esegue un comando Selenium avanzato.",
    );
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

  it("groups core and advanced catalog options", () => {
    const wrapper = mountWizard();
    wrapper.vm.stepsType = [
      { name: "open_browser", syntax: [] },
      { name: "selenium_command", syntax: [] },
      { name: "selenium_actions", syntax: [] },
    ];

    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[0])).toBe(true);
    expect(wrapper.vm.stepOptionGroupLabel(wrapper.vm.stepsType[0])).toBe(
      "Core actions",
    );
    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[1])).toBe(true);
    expect(wrapper.vm.stepOptionGroupLabel(wrapper.vm.stepsType[1])).toBe(
      "Advanced Selenium",
    );
    expect(wrapper.vm.showStepOptionGroup(wrapper.vm.stepsType[2])).toBe(false);
  });

  it("explains Appium actions with mobile-specific labels and groups", () => {
    const wrapper = mountWizard();
    const action = { name: "appium_back", syntax: [] };

    expect(wrapper.vm.stepOptionLabel(action)).toBe("Back navigation");
    expect(wrapper.vm.stepOptionDescription(action)).toBe(
      "Sends the mobile back command.",
    );
    expect(wrapper.vm.stepOptionGroupLabel(action)).toBe("Mobile actions");

    wrapper.vm.config.currentLanguage = "it";

    expect(wrapper.vm.stepOptionLabel(action)).toBe("Navigazione indietro");
    expect(wrapper.vm.stepOptionDescription(action)).toBe(
      "Invia il comando back mobile.",
    );
    expect(wrapper.vm.stepOptionGroupLabel(action)).toBe("Azioni mobile");
  });

  it("summarizes managed wizard actions with runtime and locator context", () => {
    const wrapper = mountWizard();
    const step = {
      stepType: "wait_for_next_step",
      runtime: "selenium",
      findBy: "css",
      target: "[data-testid='selenium-demo-page']",
      waitCondition: "visibility",
      note: "Verify demo page",
    };

    expect(wrapper.vm.managedStepSubtitle(step)).toBe(
      "selenium · wait_for_next_step",
    );
    expect(wrapper.vm.managedStepLocator(step)).toBe(
      "css · [data-testid='selenium-demo-page'] · visibility",
    );
  });

  it("groups wizard fields by user-facing form sections", async () => {
    const wrapper = mountWizard();

    wrapper.vm.stepTypeSelected = {
      name: "wait_for_next_step",
      syntax: [
        { typeName: "findBy", type: "options", options: ["css"] },
        { typeName: "target", type: "string" },
        {
          typeName: "waitCondition",
          type: "options",
          options: ["visibility"],
        },
        { typeName: "waitSeconds", type: "integer" },
      ],
    };
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.groupedSyntaxSections.map((section) => section.id)).toEqual(
      ["locator", "wait"],
    );
    expect(wrapper.text()).toContain("Locator");
    expect(wrapper.text()).toContain("Wait policy");
  });

  it("shows Postman collection metadata in the action profile", async () => {
    const wrapper = mountWizard();

    wrapper.vm.typeOfWrapperSelected = "postman";
    wrapper.vm.stepTypeSelected = {
      name: "postman_collection",
      syntax: [{ typeName: "collection", type: "postman_collection" }],
    };
    await wrapper.vm.$nextTick();
    await wrapper.setData({
      responseTypeSelect: [
        {
          collection: {
            info: { name: "Echo collection" },
            item: [
              { name: "Root", request: { method: "GET" } },
              {
                name: "Folder",
                item: [{ name: "Nested", request: { method: "POST" } }],
              },
            ],
          },
          environment: { name: "demo" },
        },
      ],
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.postmanCollectionName).toBe("Echo collection");
    expect(wrapper.vm.postmanRequestCount).toBe(2);
    expect(wrapper.vm.postmanEnvironmentName).toBe("demo");
  });

  it("cancels action editing without mutating the sequence", async () => {
    const wrapper = mountWizard({
      props: {
        jsonFromEditor_prop: {
          name: "Existing browser flow",
          editorType: "selenium",
          steps: [
            {
              stepType: "open_browser",
              runtime: "selenium",
              note: "Open the application",
              url: "https://idelium.org/demo/",
            },
          ],
        },
      },
    });

    await vi.waitFor(() => expect(wrapper.vm.indexForEdit).toBe(0));
    wrapper.vm.note = "Unsaved change";
    wrapper.vm.cancelActionEdit();

    expect(wrapper.vm.indexForEdit).toBe(-1);
    expect(wrapper.vm.stepTypeSelected).toBe(null);
    expect(wrapper.vm.arrayStepTypeToAdd[0].note).toBe("Open the application");
  });

  it("hydrates the wizard from an existing editable step payload", async () => {
    const wrapper = mountWizard({
      props: {
        jsonFromEditor_prop: {
          name: "Existing browser flow",
          editorType: "selenium",
          failedExit: true,
          attachScreenshot: false,
          steps: [
            {
              stepType: "open_browser",
              runtime: "selenium",
              note: "Open the application",
              url: "https://idelium.org/demo/",
            },
          ],
        },
      },
    });

    expect(wrapper.vm.name).toBe("Existing browser flow");
    expect(wrapper.vm.typeOfWrapperSelected).toBe("selenium");
    expect(wrapper.vm.attachScreenshot).toBe(false);
    expect(wrapper.vm.arrayStepTypeToAdd).toHaveLength(1);
    expect(wrapper.vm.arrayStepTypeToAdd[0]).toMatchObject({
      stepType: "open_browser",
      note: "Open the application",
      url: "https://idelium.org/demo/",
    });
    expect(wrapper.vm.arrayStepTypeToAdd[0].__key).toBeTruthy();
    expect(wrapper.vm.displayCard).toBe("fade-in");
    await vi.waitFor(() =>
      expect(wrapper.vm.stepTypeSelected.name).toBe("open_browser"),
    );
    await vi.waitFor(() => expect(wrapper.vm.note).toBe("Open the application"));
    expect(wrapper.vm.responseTypeSelect[0]).toBe("https://idelium.org/demo/");
    expect(wrapper.vm.isManagedStepSelected(wrapper.vm.arrayStepTypeToAdd[0])).toBe(
      true,
    );
    expect(wrapper.vm.managedStepClass(wrapper.vm.arrayStepTypeToAdd[0])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "is-selected": true }),
      ]),
    );

    await wrapper.setProps({
      jsonFromEditor_prop: {
        name: "Updated mobile flow",
        editorType: "appium",
        failedExit: false,
        attachScreenshot: true,
        steps: [
          {
            stepType: "appium_back",
            runtime: "appium",
            note: "Go back on the device",
          },
        ],
      },
    });

    expect(wrapper.vm.name).toBe("Updated mobile flow");
    expect(wrapper.vm.typeOfWrapperSelected).toBe("appium");
    expect(wrapper.vm.failedExit).toBe(false);
    expect(wrapper.vm.arrayStepTypeToAdd).toHaveLength(1);
    expect(wrapper.vm.arrayStepTypeToAdd[0]).toMatchObject({
      stepType: "appium_back",
      note: "Go back on the device",
    });
    await vi.waitFor(() =>
      expect(wrapper.vm.stepTypeSelected.name).toBe("appium_back"),
    );
    await vi.waitFor(() => expect(wrapper.vm.note).toBe("Go back on the device"));
  });

  it("rebuilds JSON when an existing wizard action is edited", async () => {
    const wrapper = mountWizard({
      props: {
        jsonFromEditor_prop: {
          name: "Open Idelium demo page",
          editorType: "selenium",
          failedExit: true,
          attachScreenshot: true,
          steps: [
            {
              stepType: "open_browser",
              runtime: "selenium",
              url: "https://idelium.org/demo/",
              xpath: "//*",
              note: "Open the Idelium demo page",
            },
            {
              stepType: "wait_for_next_step",
              runtime: "selenium",
              findBy: "css",
              target: "[data-testid='selenium-demo-page']",
              waitCondition: "visibility",
              waitSeconds: 15,
              note: "Verify the main demo page container is visible",
            },
          ],
        },
      },
    });

    await vi.waitFor(() =>
      expect(wrapper.vm.note).toBe("Open the Idelium demo page"),
    );

    wrapper.vm.note = "Open the updated Idelium demo page";
    wrapper.vm.responseTypeSelect[0] = "https://idelium.org/demo/?edited=true";
    wrapper.vm.responseTypeSelect[1] = "//*";
    wrapper.vm.addEditTypeStep(false);

    const lastSync = wrapper.emitted("syncJson").at(-1)[0];
    expect(lastSync.steps[0]).toEqual(
      expect.objectContaining({
        stepType: "open_browser",
        note: "Open the updated Idelium demo page",
        url: "https://idelium.org/demo/?edited=true",
        xpath: "//*",
      }),
    );
    expect(lastSync.steps[1]).toEqual(
      expect.objectContaining({
        stepType: "wait_for_next_step",
        target: "[data-testid='selenium-demo-page']",
      }),
    );
  });
});
