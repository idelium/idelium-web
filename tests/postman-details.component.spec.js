import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/apiClient", () => ({ default: api }));

import ShowPostmanCollection from "@/view/testperformed/showPostmanCollection.vue";

function mountPostmanDetails() {
  const push = vi.fn();
  return shallowMount(ShowPostmanCollection, {
    global: {
      stubs: {
        FontAwesomeIcon: { template: "<i />" },
        PostmanResultTable: {
          props: ["results", "labels"],
          template: '<div class="postman-table">{{ results.length }}</div>',
        },
        modalPostmanResponse: { template: "<div />" },
      },
      mocks: {
        $route: { params: { projectId: 3, id: 44 } },
        $router: { push },
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
              backToTestsPerformed: "Back to tests performed",
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

  it("navigates back to the project-scoped tests performed page", async () => {
    api.get.mockResolvedValue({ data: [] });

    const wrapper = mountPostmanDetails();
    await wrapper.get(".postman-details-back").trigger("click");

    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: "testsperformed",
      params: { projectId: 3 },
    });
  });
});
