//import './assets/main.css'

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores/pinia";
import { useSessionStore } from "./stores/session";
import { setUnsavedChangesConfirmationHandler } from "./stores/navigation";
import { installAnalytics } from "./services/analytics";
import { setUnauthorizedHandler } from "./services/apiClient";
import "bootstrap";
import ElementPlus from "element-plus";
import "element-plus/theme-chalk/index.css";
import Toast from "vue3-toast-single";
import "vue3-toast-single/dist/toast.css";
import vSelect from "vue-select";
import Konva from "konva";
import appKonva from "vue-konva";
import appFullscreen from "vue-fullscreen";
import { VueReCaptcha } from "vue-recaptcha-v3";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-chrome";

import mitt from "mitt";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBuilding,
  faLeaf,
  faDraftingCompass,
  faEye,
  faEyeSlash,
  faUsers,
  faClock,
  faCamera,
  faDoorOpen,
  faExpandArrowsAlt,
  faUserSecret,
  faTimesCircle,
  faVial,
  faSync,
  faShoePrints,
  faProjectDiagram,
  faKey,
  faDownload,
  faPlug,
  faVials,
  faPlus,
  faCopy,
  faUserCircle,
  faBars,
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faPen,
  faTrash,
  faClone,
  faRocket,
  faCheckCircle,
  faExclamationTriangle,
  faLaptop,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faUsers,
  faBuilding,
  faDraftingCompass,
  faEye,
  faEyeSlash,
  faProjectDiagram,
  faPlug,
  faClock,
  faCopy,
  faUserCircle,
  faCamera,
  faDoorOpen,
  faClone,
  faDownload,
  faRocket,
  faCheckCircle,
  faExclamationTriangle,
  faLaptop,
  faHistory,
);
library.add(
  faLeaf,
  faUserSecret,
  faTimesCircle,
  faVial,
  faVials,
  faSync,
  faShoePrints,
  faPlus,
  faKey,
  faBars,
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faPen,
  faTrash,
  faExpandArrowsAlt,
);

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import italian from "./languages/italian";
import english from "./languages/english";

Konva.legacyTextRendering = true;

const emitter = mitt();
const app = createApp(App);
app.config.globalProperties.emitter = emitter;

app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.use(Toast, {
  verticalPosition: "bottom",
  horizontalPosition: "right",
  duration: 1500,
});
app.use(appKonva);
app.use(appFullscreen);
app.use(VueReCaptcha, { siteKey: import.meta.env.VITE_GOOGLE_SITE_KEY });
app.component("v-select", vSelect);

app.component("font-awesome-icon", FontAwesomeIcon);

app.config.globalProperties.config = {
  version: __APP_VERSION__,
  productName: "Idelium",
  timeCheck: 5000,
  url: {
    header: "menu/header",
    sidebar: "menu/sidebar",
    roles: "admin/roles",
    accounts: "admin/accounts",
    profile: "admin/profile",
    apikey: "admin/apikey",
    costumers: "admin/costumers",
    projects: "admin/projects",
    environments: "admin/environments",
    plugins: "admin/plugins",
    steps: "admin/steps",
    importtest: "admin/importtest",
    launchPreflight: "admin/launch/preflight",
    launchtest: "admin/launchtest",
    launchTargets: "admin/launch/targets",
    tests: "admin/tests",
    testcycles: "admin/testcycles",
    getTestCyclePerformed: "admin/testcyclesperfomed",
    getTestPerformed: "admin/testsperfomed",
    getStepPerformed: "admin/stepsperfomed",
    parallelRuns: "admin/projects",
    platforms: "admin/platforms",
    login: "login",
    logout: "logout",
    csrf: "sanctum/csrf-cookie",
  },
  demo: false,
  timeChecksession: 30000,
  currentLanguage: "gb",
  projectId: null,
  pluginTemplate:
    'from idelium._internal.wrappers.ideliumselenium import IdeliumSelenium\nfrom idelium._internal.wrappers.ideliumappium import IdeliumAppium\nfrom idelium._internal.commons.resultenum import Result\nfrom idelium._internal.commons.ideliumprinter import InitPrinter\n\ndef init(driver,json_config,param=None):\n      wrapper=IdeliumSelenium()\n      printer=InitPrinter()\n      value= Result.OK#0 is ok, 1 is ko\n      print ("Hello, this is the skeleton")\n      """ please put your code here """\n      return value',
};
app.config.globalProperties.language = {
  gb: english,
  it: italian,
};
app.config.globalProperties.$isAuthenticated = { value: false };

app.config.globalProperties.config.productionTip = false;
app.config.globalProperties.$showAlert = function (options = {}) {
  const labels = this.language?.[this.config?.currentLanguage]?.Dialog || {};
  return new Promise((resolve) => {
    emitter.emit("enterprise-dialog:show", {
      confirmLabel: options.confirmLabel || labels.ok || "OK",
      message: options.message || "",
      resolver: resolve,
      title: options.title || labels.alertTitle || "Attention",
      type: "alert",
      variant: options.variant || "info",
    });
  });
};
app.config.globalProperties.$showConfirm = function (options = {}) {
  const labels = this.language?.[this.config?.currentLanguage]?.Dialog || {};
  return new Promise((resolve) => {
    emitter.emit("enterprise-dialog:show", {
      cancelLabel: options.cancelLabel || labels.cancel || "Cancel",
      confirmLabel: options.confirmLabel || labels.confirm || "Confirm",
      message: options.message || "",
      resolver: resolve,
      title: options.title || labels.confirmTitle || "Confirm action",
      type: "confirm",
      variant: options.variant || "warning",
    });
  });
};
setUnsavedChangesConfirmationHandler((options = {}) => {
  const labels =
    app.config.globalProperties.language?.[
      app.config.globalProperties.config?.currentLanguage
    ]?.Navigation || {};
  return new Promise((resolve) => {
    emitter.emit("enterprise-dialog:show", {
      cancelLabel: labels.stay || "Stay",
      confirmLabel: labels.discard || "Discard changes",
      message:
        options.message ||
        labels.unsavedMessage ||
        "You have unsaved changes. Discard them and continue?",
      resolver: resolve,
      title: labels.unsavedTitle || "Unsaved changes",
      type: "confirm",
      variant: "warning",
    });
  });
});
app.config.globalProperties.Logout = (object, e = null) => {
  object.emitter.emit("showLoader", false);
  const status = e?.response?.status || 401;
  if (status === 401) {
    useSessionStore(pinia).clear();
    if (object.$route.name !== "Login") {
      object.$router.push({
        name: "Login",
        query: { back: object.$route.name },
      });
    }
  }
};
app.config.globalProperties.setHeaders = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};
setUnauthorizedHandler(() => {
  const currentRoute = router.currentRoute.value;
  if (currentRoute.name !== "Login") {
    return router.push({ name: "Login", query: { back: currentRoute.name } });
  }
});

void installAnalytics(app);
app.mount("#app");
