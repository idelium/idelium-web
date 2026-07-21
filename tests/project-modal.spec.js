import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("bootstrap", () => ({
  Modal: vi.fn(() => ({ hide: vi.fn(), show: vi.fn() })),
}));

import ModalModifyProject from "@/view/project/modalModifyProject.vue";

describe("project modal", () => {
  function mountProjectModal(projects = []) {
    return mount(ModalModifyProject, {
      props: {
        arrayProjects: projects,
      },
      global: {
        stubs: {
          FontAwesomeIcon: true,
        },
        mocks: {
          config: {
            currentLanguage: "gb",
          },
          language: {
            gb: {
              Projects: {
                btnAddProject: "Add project",
                btnCancel: "Cancel",
                btnModalModifyProject: "Modify project",
                description: "description",
                formHelp:
                  "Create a project workspace by entering the fields managed by Idelium.",
                placeholderDescription: "Describe the project scope",
                placeholderName: "Project code or name",
                project: "project",
                projectDescriptionHelp:
                  "Describe what this project contains or validates.",
                projectIsDuplicated: "A project with this name already exists",
                projectNameHelp: "Use a short, recognizable project name.",
                titleAddModal: "Add project",
                titleFirstAddModal: "Add your first project",
                titleModifyModal: "Modify project",
              },
            },
          },
        },
      },
    });
  }

  it("renders a localized form matching the project payload fields", () => {
    const wrapper = mountProjectModal();

    expect(wrapper.find("label[for='project-name']").text()).toBe("project");
    expect(wrapper.find("#project-name").attributes("placeholder")).toBe(
      "Project code or name",
    );
    expect(wrapper.find("label[for='project-description']").text()).toBe(
      "description",
    );
    expect(wrapper.find("#project-description").attributes("placeholder")).toBe(
      "Describe the project scope",
    );
    expect(wrapper.findAll("#project-name")).toHaveLength(1);
    expect(wrapper.findAll("#project-description")).toHaveLength(1);
    expect(wrapper.findAll("#projectModal")).toHaveLength(1);
    expect(wrapper.findAll("#projectModalLabel")).toHaveLength(1);
  });

  it("emits only the fields persisted by the project endpoint", async () => {
    const wrapper = mountProjectModal();

    wrapper.vm.showModal(null, "new");
    wrapper.vm.name = "demo";
    wrapper.vm.projectDescription = "Demo project";

    wrapper.vm.sendData();

    expect(wrapper.emitted("updateData")[0][0]).toEqual({
      description: "Demo project",
      id: null,
      name: "demo",
      type: "new",
    });
  });
});
