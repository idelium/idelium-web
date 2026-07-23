import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import ShowPostmanCollection from "@/view/testperformed/showPostmanCollection.vue";

function mountPostmanDetails() {
  return shallowMount(ShowPostmanCollection, {
    global: {
      stubs: {
        PostmanResultTable: {
          props: ["results", "labels"],
          template: '<div class="postman-table">{{ results.length }}</div>',
        },
        modalPostmanResponse: { template: "<div />" },
      },
      mocks: {
        $route: { params: { projectId: 3, id: 44 } },
        config: {
          currentLanguage: "gb",
          serviceBaseUrl: "/api/",
          url: { getStepPerformed: "steps-performed" },
        },
        language: {
          gb: {
            Postman: {
              detailsEyebrow: "Execution detail",
              detailsTitle: "Postman details",
              detailsDescription: "Inspect every request.",
              executionResults: "Postman execution results",
              executionResultsHelp: "Review request results.",
              emptyResults: "No Postman execution data.",
              requests: "requests",
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

describe("Postman details page", () => {
  it("uses the full-page enterprise layout and renders performed requests", async () => {
    api.get.mockResolvedValue({
      data: [
        {
          name: "postman",
          data: JSON.stringify([
            {
              status: 200,
              method: "get",
              url: "https://example.test/health",
            },
          ]),
        },
      ],
    });

    const wrapper = mountPostmanDetails();

    await vi.waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/api/steps-performed/44", {
        headers: {},
      }),
    );

    expect(wrapper.classes()).toContain("postman-details-page");
    expect(wrapper.find(".postman-details-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("postman");
    expect(wrapper.vm.dataTest).toMatchObject([{ method: "GET", status: 200 }]);
    expect(wrapper.find(".postman-table").text()).toBe("1");
  });
});
