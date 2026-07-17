import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import Apikey from "@/view/apikey.vue";

describe("apikey component", () => {
  beforeEach(() => {
    api.get.mockReset();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  function mountApikey() {
    return shallowMount(Apikey, {
      global: {
        mocks: {
          $route: { name: "apikey" },
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { apikey: "apikey" },
          },
          language: {
            gb: {
              Apikey: {
                title: "Your Idelium Key",
                info: "Use this key with idelium-cli.",
                btnGenerateKey: "Generate new key",
                btnDownloadKey: "Download idelium-cli",
                keyCopy: "Key copied",
                confirmGenerateMessage: "Generate a new key?",
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

  it("opens the Idelium PyPI package from the download button", async () => {
    api.get.mockResolvedValue({ data: { apiKey: "token" } });
    const wrapper = mountApikey();

    await wrapper.findAll("button")[1].trigger("click");

    expect(window.open).toHaveBeenCalledWith(
      "https://pypi.org/project/idelium/",
      "_blank",
    );
  });
});
