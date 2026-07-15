import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/services/apiClient", () => ({ default: api }));

import TestCycles from "@/view/testcycles.vue";
import { pinia } from "@/stores/pinia";
import { useSessionStore } from "@/stores/session";

describe("test-cycle creation component", () => {
  it("submits a project-scoped cycle payload", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: [] });
    useSessionStore(pinia).selectProject(9);
    const wrapper = shallowMount(TestCycles, {
      global: {
        plugins: [pinia],
        mocks: {
          config: {
            currentLanguage: "gb",
            serviceBaseUrl: "/api/",
            url: { tests: "tests", testcycles: "cycles" },
          },
          language: { gb: { TestCycles: {} } },
          emitter: { on: vi.fn(), emit: vi.fn() },
          setHeaders: () => ({}),
          Logout: vi.fn(),
        },
      },
    });
    await wrapper.setData({
      newNameTestCycle: " Release ",
      newDescriptionTestCycle: " Smoke ",
      arrayTestsSelectedDragged: [{ id: 1 }],
    });
    await wrapper.vm.saveTestCycle();
    await vi.waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls.at(-1)[1]).toEqual({
      name: "Release",
      description: "Smoke",
      config: '[{"id":1}]',
      idProject: 9,
    });
  });
});
