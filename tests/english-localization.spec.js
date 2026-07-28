import { describe, expect, it } from "vitest";

import english from "@/languages/english";

describe("English localization", () => {
  it("uses English labels for project and account creation actions", () => {
    expect(english.Projects.btnAddProject).toBe("Add project");
    expect(english.Projects.titleAlert).toBe("Attention");
    expect(english.Projects.titleFirstAddModal).toBe("Add your first project");
    expect(english.Accounts.newAccount).toBe("New account");
  });

  it("uses customer terminology in user-facing copy", () => {
    expect(english.Sidebar.costumers).toBe("customers");
    expect(english.Header.costumer).toBe("Customer");
    expect(english.Header.btnChangeCostumer).toBe("Switch customer");
    expect(english.Accounts.costumer).toBe("customer");
    expect(english.Costumers.btnNewCostumer).toBe("new customer");
    expect(english.Costumers.btnAddCostumer).toBe("add customer");
  });

  it("localizes DSL v1 authoring guidance", () => {
    expect(english.Steps.dsl.constructsTitle).toBe("DSL v1 authoring guide");
    expect(english.Steps.dsl.constructs.variables.title).toBe(
      "Variables and secrets",
    );
    expect(english.Steps.dsl.constructs.assertions.description).toContain(
      "versioned result contracts",
    );
  });

  it("localizes execution result inspection labels", () => {
    expect(english.ExecutionResult.executionResults).toBe(
      "Execution result details",
    );
    expect(english.ExecutionResult.artifacts).toBe("artifacts");
  });
});
