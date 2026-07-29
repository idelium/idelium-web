import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useSequenceEditor } from "@/composables/useSequenceEditor";
import { useNavigationStore } from "@/stores/navigation";

function mountEditor(options = {}) {
  let editor;
  const wrapper = mount(
    defineComponent({
      setup() {
        editor = useSequenceEditor({
          sourceId: "sequence:test:4",
          label: "Test sequence",
          initialSequence: [{ id: 1, name: "First" }],
          serverVersion: "v1",
          save: vi.fn().mockResolvedValue({
            savedAt: "2026-07-29T08:00:00.000Z",
            serverVersion: "v2",
          }),
          ...options,
        });
        return () => h("div");
      },
    }),
  );
  return { editor, wrapper };
}

describe("useSequenceEditor", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("tracks bounded meaningful history and central dirty state", () => {
    const { editor } = mountEditor({ historyLimit: 2 });
    const navigation = useNavigationStore();

    expect(editor.apply([{ id: 1, name: "First" }])).toBe(false);
    editor.apply([{ id: 1 }, { id: 2 }]);
    editor.apply([{ id: 2 }, { id: 1 }]);
    editor.apply([{ id: 2, config: { retries: 1 } }, { id: 1 }]);

    expect(editor.dirty.value).toBe(true);
    expect(navigation.unsavedSourceLabels).toEqual(["Test sequence"]);
    expect(editor.undo()).toBe(true);
    expect(editor.sequence.value).toEqual([{ id: 2 }, { id: 1 }]);
    expect(editor.undo()).toBe(true);
    expect(editor.sequence.value).toEqual([{ id: 1 }, { id: 2 }]);
    expect(editor.undo()).toBe(false);
    expect(editor.redo()).toBe(true);
  });

  it("clears history and dirty state at a successful persistence boundary", async () => {
    const save = vi.fn().mockResolvedValue({
      savedAt: "2026-07-29T08:00:00.000Z",
      serverVersion: "v2",
    });
    const { editor } = mountEditor({ save });
    editor.apply([{ id: 2 }]);

    await Promise.all([editor.save(), editor.save()]);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({
      sequence: [{ id: 2 }],
      expectedVersion: "v1",
    });
    expect(save.mock.calls[0][0].idempotencyKey).toBeTruthy();
    expect(editor.dirty.value).toBe(false);
    expect(editor.canUndo.value).toBe(false);
    expect(editor.lastSavedAt.value).toBe("2026-07-29T08:00:00.000Z");
    expect(editor.serverVersion.value).toBe("v2");
    expect(useNavigationStore().hasUnsavedChanges).toBe(false);
  });

  it("preserves local work and diagnostics after validation failure", async () => {
    const save = vi.fn().mockRejectedValue({
      status: 422,
      message: "Authorization: Bearer must-not-render",
    });
    const { editor } = mountEditor({ save });
    editor.apply([{ id: 2, config: { retries: 3 } }]);

    await expect(editor.save()).rejects.toMatchObject({
      code: "sequence.validationFailed",
      status: 422,
    });

    expect(editor.sequence.value).toEqual([{ id: 2, config: { retries: 3 } }]);
    expect(editor.dirty.value).toBe(true);
    expect(editor.diagnostics.value[0].code).toBe("sequence.validationFailed");
    expect(JSON.stringify(editor.diagnostics.value)).not.toContain(
      "must-not-render",
    );
  });

  it("supports compare, retry, and explicit reload after a conflict", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce({
        status: 409,
        serverVersion: "v2",
        remoteSequence: [{ id: 3 }],
        capabilities: { compare: true, reload: true, retry: true },
        message: "token=must-not-render",
      })
      .mockResolvedValueOnce({ serverVersion: "v3" });
    const { editor } = mountEditor({ save });
    editor.apply([{ id: 2 }]);

    await expect(editor.save()).rejects.toMatchObject({
      code: "sequence.conflict",
    });
    expect(editor.dirty.value).toBe(true);
    expect(editor.compareConflict()).toEqual({
      baseline: [{ id: 1, name: "First" }],
      local: [{ id: 2 }],
      remote: [{ id: 3 }],
      serverVersion: "v2",
    });

    await editor.retryConflict("v2");
    expect(save.mock.calls[1][0]).toMatchObject({
      sequence: [{ id: 2 }],
      expectedVersion: "v2",
    });

    editor.apply([{ id: 4 }]);
    editor.reloadConflict([{ id: 5 }], "v4");
    expect(editor.sequence.value).toEqual([{ id: 5 }]);
    expect(editor.dirty.value).toBe(false);
    expect(editor.canUndo.value).toBe(false);
  });

  it("clears dirty state on discard, context reset, and teardown", () => {
    const { editor, wrapper } = mountEditor();
    const navigation = useNavigationStore();

    editor.apply([{ id: 2 }]);
    editor.discard();
    expect(navigation.hasUnsavedChanges).toBe(false);

    editor.apply([{ id: 3 }]);
    editor.reset([{ id: 4 }], "project-2:v1");
    expect(editor.sequence.value).toEqual([{ id: 4 }]);
    expect(navigation.hasUnsavedChanges).toBe(false);

    editor.apply([{ id: 5 }]);
    wrapper.unmount();
    expect(navigation.hasUnsavedChanges).toBe(false);
  });
});
