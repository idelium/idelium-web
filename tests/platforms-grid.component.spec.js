import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

const bootstrap = vi.hoisted(() => ({
  hide: vi.fn(),
  show: vi.fn(),
}));

vi.mock("@/services/apiClient", () => ({ default: api }));
vi.mock("bootstrap", () => ({
  Modal: vi.fn().mockImplementation(function createModalMock() {
    return {
      hide: bootstrap.hide,
      show: bootstrap.show,
    };
  }),
}));

import Brand from "@/view/platforms/brand.vue";
import ModalAddPlatformForm from "@/view/platforms/addPlatformForm/modalAddPlatformForm.vue";
import ManagePlatform from "@/view/platforms/managePlatform.vue";

const copy = {
  Actions: { delete: "Delete", edit: "Edit" },
  DataTable: { actions: "Actions", bulk: {}, preferences: {}, states: {} },
  Platforms: {
    platforms: "Platforms",
    btnCancel: "Cancel",
    btnModify: "Update",
    btnSave: "Save",
    Grid: {
      searchLabel: "Search platforms",
      searchPlaceholder: "Search",
      paginationLabel: "Platform pages",
      previousPage: "Previous",
      nextPage: "Next",
      pageStatus: "Page {page} of {pages}",
    },
    Brand: { colBrand: "Brand", id: "ID", name: "Brand name" },
    ManagePlatform: {
      all: "All",
      btnAddPlatform: "Add platform",
      colBrand: "Brand",
      colBrowser: "Browser",
      colHost: "Host",
      colId: "ID",
      colLocation: "Location",
      colOs: "OS",
      colStatus: "Status",
      confirmationPlatform: "Delete platform?",
      modalAddPlatform: {
        btnSaveNewPlatform: "Save new platform",
        chooseType: "Select type",
        lblAddress: "Address",
        lblBrand: "Brand",
        lblBrowser: "Browser",
        lblBrowserVersion: "Browser version",
        lblLocation: "Location",
        lblModel: "Model",
        lblOs: "OS",
        lblOsVersion: "OS version",
        lblType: "Type",
        loadingReferences: "Loading platform references...",
        modalTitle: "Add platform",
        placeholderHost: "runner.local",
        validationAddress: "Enter address.",
        validationBrowser: "Select browser.",
        validationBrowserVersion: "Select browser version.",
        validationLocation: "Select location.",
        validationModel: "Select model.",
        validationOs: "Select OS.",
        validationOsVersion: "Select OS version.",
        validationType: "Select type.",
      },
    },
  },
};

function mocks() {
  return {
    $route: { query: {} },
    $router: { replace: vi.fn().mockResolvedValue() },
    config: {
      currentLanguage: "gb",
      serviceBaseUrl: "/api/",
      url: { platforms: "admin/platforms" },
    },
    language: { gb: copy },
    emitter: { emit: vi.fn() },
    Logout: vi.fn(),
    setHeaders: () => ({}),
    $showConfirm: vi.fn().mockResolvedValue(false),
  };
}

describe("platform enterprise grids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the main platform catalogue through the bounded grid contract", async () => {
    api.get.mockImplementation((url, options) => {
      if (url.endsWith("/manageplatforms/1")) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 3,
                hostname: "https://runner.example.test:8691",
                location: 1,
                osDescription: "Linux",
                browserDescription: "Firefox",
                status: 1,
              },
            ],
            meta: { page: 1, pageSize: 25, total: 1, lastPage: 1 },
          },
        });
      }
      expect(options.params).toBeUndefined();
      return Promise.resolve({ data: [] });
    });

    const wrapper = shallowMount(ManagePlatform, {
      props: {
        arrayTypes: [{ id: 1, name: "desktop" }],
        arrayLocations: [{ id: 1, name: "Rome" }],
        arrayStatus: [{ id: 1, name: "Online" }],
      },
      global: {
        stubs: {
          modalAddPlatformForm: true,
          PlatformReferenceGrid: true,
        },
        mocks: mocks(),
      },
    });

    await wrapper.vm.start();

    expect(api.get).toHaveBeenCalledWith(
      "/api/admin/platforms/manageplatforms/1",
      {
        headers: {},
        params: {
          page: 1,
          pageSize: 25,
          search: "",
          sort: "id",
          direction: "asc",
          filter: {},
        },
      },
    );
    expect(wrapper.vm.arrayPlatforms[0]).toMatchObject({
      locationLabel: "Rome",
      statusLabel: "Online",
    });
  });

  it("keeps platform search in the canonical route query", async () => {
    vi.useFakeTimers();
    api.get.mockResolvedValue({
      data: {
        data: [],
        meta: { page: 1, pageSize: 25, total: 0, lastPage: 1 },
      },
    });
    const platformMocks = mocks();
    const wrapper = shallowMount(Brand, {
      global: {
        stubs: { PlatformReferenceGrid: true },
        mocks: platformMocks,
      },
    });
    await Promise.resolve();

    wrapper.vm.platformGridSearch = "samsung";
    wrapper.vm.schedulePlatformGridSearch("samsung");
    await vi.advanceTimersByTimeAsync(250);

    expect(platformMocks.$router.replace).toHaveBeenCalledWith({
      query: { direction: "asc", q: "samsung", sort: "id" },
    });
    vi.useRealTimers();
  });

  it("initializes add platform defaults and emits a complete create payload", async () => {
    api.get.mockImplementation((url) => {
      if (url.endsWith("/brands")) return Promise.resolve({ data: [] });
      if (url.endsWith("/os/1"))
        return Promise.resolve({ data: [{ id: 10, name: "Linux" }] });
      if (url.endsWith("/osversion/10")) {
        return Promise.resolve({ data: [{ id: 11, version: "22.04" }] });
      }
      if (url.endsWith("/browsers/10")) {
        return Promise.resolve({ data: [{ id: 12, name: "Chrome" }] });
      }
      if (url.endsWith("/browserversions/12")) {
        return Promise.resolve({ data: [{ id: 13, version: "126" }] });
      }
      return Promise.resolve({ data: [] });
    });

    const wrapper = shallowMount(ModalAddPlatformForm, {
      props: {
        arrayTypes: [{ id: 1, name: "desktop" }],
        arrayLocations: [{ id: 2, name: "Milan" }],
      },
      global: {
        mocks: mocks(),
      },
    });

    await wrapper.vm.showModal();
    await flushPromises();
    await wrapper.setData({ address: "runner.local" });

    wrapper.vm.save();

    expect(bootstrap.show).toHaveBeenCalled();
    expect(wrapper.emitted("savePlatform")[0][0]).toMatchObject({
      type: 1,
      addressname: "runner.local",
      location: 2,
      os: 10,
      osversion: 11,
      browser: 12,
      brand: -1,
      brandDescription: "NA ",
      osDescription: "Linux 22.04",
      browserDescription: "Chrome 126",
      status: 1,
    });
    expect(bootstrap.hide).toHaveBeenCalled();
  });
});
