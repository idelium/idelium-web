import { afterEach } from "vitest";
import { config } from "@vue/test-utils";

config.global.stubs = {
  FontAwesomeIcon: true,
  CountryFlag: true,
  VSelect: true,
  RouterLink: true,
  RouterView: true,
};

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});
