import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("bootstrap", () => ({
  Modal: vi.fn(function Modal() {
    return { hide: vi.fn(), show: vi.fn() };
  }),
}));

import ModalModifyAccount from "@/view/account/modalModifyAccount.vue";

describe("account modal", () => {
  function mountAccountModal(props = {}) {
    return mount(ModalModifyAccount, {
      props: {
        arrayAccounts: [],
        roles: [{ id: 2, name: "admin" }],
        costumers: [{ id: 7, costumer: "demo" }],
        isSuperAdmin: true,
        ...props,
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
              Accounts: {
                accountExist: "Account already exists",
                btnCancel: "Cancel",
                costumer: "customer",
                createFormHelp:
                  "This form creates the sign-in account and assigns the customer and role used at first access.",
                emailHelp: "The email address is used as the sign-in account.",
                formHelp:
                  "Create an account by filling only the fields managed by Idelium.",
                invitationFormHelp:
                  "Invite the user by email and assign the role they will receive after activation.",
                invitationExpiryHelp:
                  "Idelium sends an activation invitation. The administrator never enters the user's password.",
                modifyFormHelp:
                  "This form updates only the editable account profile fields saved by Idelium.",
                name: "name",
                nameHelp:
                  "Use the display name shown in account lists and profile views.",
                passwordHelp:
                  "Use a password that satisfies the configured Idelium password policy.",
                placeholderConfirmPassword: "Confirm password",
                placeholderCostumer: "Select a customer",
                placeholderEmail: "user@example.com",
                placeholderName: "Full name",
                placeholderPassword: "Password",
                placeholderRole: "Select a role",
                role: "role",
                modal: {
                  addAccount: "Add account",
                  modifyAccount: "Modify account",
                  titleModal: "Account details",
                },
              },
              Profile: {
                confirmPassword: "confirm password",
                email: "email",
                password: "password",
              },
            },
          },
        },
      },
    });
  }

  it("renders an invitation form without administrator-entered password fields", async () => {
    const wrapper = mountAccountModal();

    wrapper.vm.showModal(null, "new");
    await wrapper.vm.$nextTick();

    expect(wrapper.find("label[for='account-email']").text()).toBe("email");
    expect(wrapper.find("#account-email").attributes("placeholder")).toBe(
      "user@example.com",
    );
    expect(wrapper.find("label[for='account-name']").text()).toBe("name");
    expect(wrapper.find("label[for='account-password']").exists()).toBe(false);
    expect(wrapper.find("label[for='account-confirm-password']").exists()).toBe(
      false,
    );
    expect(wrapper.find("label[for='account-role']").text()).toBe("role");
    expect(wrapper.find("label[for='account-customer']").text()).toBe(
      "customer",
    );
    expect(wrapper.findAll("#account-email")).toHaveLength(1);
    expect(wrapper.findAll("#account-name")).toHaveLength(1);
    expect(wrapper.findAll("#account-password")).toHaveLength(0);
    expect(wrapper.findAll("#account-confirm-password")).toHaveLength(0);
    expect(wrapper.findAll("#account-role")).toHaveLength(1);
    expect(wrapper.findAll("#account-customer")).toHaveLength(1);
    expect(wrapper.findAll("#accountModal")).toHaveLength(1);
    expect(wrapper.findAll("#accountModalLabel")).toHaveLength(1);
    expect(wrapper.text()).not.toContain("Modal title");
  });

  it("emits only invitation fields during account creation", () => {
    const wrapper = mountAccountModal();

    wrapper.vm.showModal(null, "new");
    wrapper.vm.email = "user@example.com";
    wrapper.vm.name = "User Example";
    wrapper.vm.selectedRole = 2;
    wrapper.vm.selectedCostumer = 7;

    wrapper.vm.sendData();

    expect(wrapper.emitted("updateData")[0][0]).toEqual({
      email: "user@example.com",
      id: null,
      idCostumer: 7,
      name: "User Example",
      role: 2,
      type: "new",
    });
  });

  it("separates account updates from fields that are only saved during creation", () => {
    const wrapper = mountAccountModal();

    wrapper.vm.showModal(
      {
        email: "existing@example.com",
        id: 42,
        idCostumer: 7,
        name: "Existing User",
        role: 2,
      },
      "modify",
    );
    wrapper.vm.name = "Renamed User";
    wrapper.vm.password = "Password1";
    wrapper.vm.confirmPassword = "Password1";

    expect(wrapper.find("#account-email").exists()).toBe(false);
    expect(wrapper.find("#account-role").exists()).toBe(false);
    expect(wrapper.find("#account-customer").exists()).toBe(false);

    wrapper.vm.sendData();

    expect(wrapper.emitted("updateData")[0][0]).toEqual({
      id: 42,
      name: "Renamed User",
      password: "Password1",
      type: "modify",
    });
  });
});
