import { describe, expect, it } from "vitest";

import english from "@/languages/english";

describe("English localization", () => {
  it("uses English labels for project and account creation actions", () => {
    expect(english.Projects.btnAddProject).toBe("Add project");
    expect(english.Projects.titleAlert).toBe("Attention");
    expect(english.Projects.titleFirstAddModal).toBe("Add your first project");
    expect(english.Accounts.newAccount).toBe("New account");
  });
});
