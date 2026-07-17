import { describe, expect, it, vi } from "vitest";

import { hideModalSafely } from "@/shared/bootstrapModal";

describe("bootstrap modal helpers", () => {
  it("moves focus out of the modal before hiding it", () => {
    const modalElement = document.createElement("div");
    const button = document.createElement("button");
    const modalInstance = { hide: vi.fn() };
    modalElement.append(button);
    document.body.append(modalElement);
    button.focus();

    hideModalSafely(modalElement, modalInstance);

    expect(document.activeElement).not.toBe(button);
    expect(modalInstance.hide).toHaveBeenCalled();
  });
});
