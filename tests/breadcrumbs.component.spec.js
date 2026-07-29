import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import AppBreadcrumbs from "@/components/navigation/AppBreadcrumbs.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("application breadcrumbs", () => {
  beforeEach(() => {
    const session = useSessionStore(pinia);
    session.$reset();
  });

  it("shows the project hierarchy for project-scoped routes", () => {
    const session = useSessionStore(pinia);
    session.setAvailableContexts({
      projects: [{ id: 7, name: "Automation" }],
    });
    const wrapper = shallowMount(AppBreadcrumbs, {
      global: {
        mocks: {
          $route: {
            meta: { projectScoped: true },
            name: "steps",
            params: { projectId: "7", tab: "new" },
          },
          config: { currentLanguage: "gb" },
          language: {
            gb: {
              Navigation: {
                breadcrumbsLabel: "Breadcrumb",
                project: "Project",
              },
              Sidebar: {
                projects: "Projects",
                steps: "Steps",
              },
            },
          },
        },
      },
    });

    expect(wrapper.vm.breadcrumbs.map((item) => item.label)).toEqual([
      "Projects",
      "Automation",
      "Steps",
    ]);
    expect(wrapper.attributes("aria-label")).toBe("Breadcrumb");
  });
});
