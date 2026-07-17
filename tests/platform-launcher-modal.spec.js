import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/apiClient", () => ({ default: { post: vi.fn() } }));
vi.mock("bootstrap", () => ({
  Modal: vi.fn(() => ({ hide: vi.fn(), show: vi.fn() })),
}));

import ModalListPlatform from "@/view/platformlauncher/modalListPlatform.vue";

describe("platform launcher modal", () => {
  function mountModal() {
    return shallowMount(ModalListPlatform, {
      global: {
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { launchtest: "launch", platforms: "platforms" },
          },
          language: {
            gb: {
              TestLauncher: {
                ModalListPlatform: {
                  all: "All",
                  colBrand: "Brand",
                  colBrowser: "Browser",
                  colLocation: "Location",
                  colOs: "OS",
                  colStatus: "Status",
                  launchtest: "Launch",
                  modalTitle: "Platforms",
                },
              },
            },
          },
          emitter: { emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
        },
      },
    });
  }

  it("keeps lookup helpers safe when API collections are not arrays yet", () => {
    const wrapper = mountModal();

    wrapper.vm.arrayLocations = {};
    wrapper.vm.arrayStatus = null;
    wrapper.vm.arrayTypes = undefined;

    expect(wrapper.vm.getLocationName(1)).toBe("");
    expect(wrapper.vm.getStatusName(1)).toBe("");
    expect(wrapper.vm.getTypeName(1)).toBe("");
  });

  it("resolves lookup names when API collections are arrays", () => {
    const wrapper = mountModal();

    wrapper.vm.arrayLocations = [{ id: 1, name: "Local" }];
    wrapper.vm.arrayStatus = [{ id: 2, name: "free" }];
    wrapper.vm.arrayTypes = [{ id: 3, name: "desktop browsers" }];

    expect(wrapper.vm.getLocationName(1)).toBe("Local");
    expect(wrapper.vm.getStatusName(2)).toBe("free");
    expect(wrapper.vm.getTypeName(3)).toBe("desktop browsers");
  });
});
