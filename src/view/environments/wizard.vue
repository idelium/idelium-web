<template>
  <div class="row" style="margin-top: 10px">
    <div class="col-sm-2" />
    <div class="col">
      <div
        class="row my-1"
        v-for="(param, index) in parameters"
        v-bind:key="index"
      >
        <div class="col-sm-2">
          <label :for="'environment-param-' + index"
            >{{ param.typeName }}:</label
          >
        </div>
        <div class="col-sm-6">
          <input
            class="form-control form-control-sm"
            :id="'environment-param-' + index"
            v-model="values[index]"
            :placeholder="param.placeholder"
            v-if="param.type == 'string'"
          />
          <input
            class="form-control form-control-sm"
            :id="'environment-param-' + index"
            v-model="values[index]"
            :placeholder="param.placeholder"
            v-if="param.type == 'int'"
            type="number"
          />
          <select
            v-model="values[index]"
            v-if="param.type == 'options'"
            class="form-control"
            :id="'environment-param-' + index"
          >
            <option
              v-for="(item, index2) in param.options"
              v-bind:key="index2"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
          <textarea
            class="form-control form-control-sm"
            :id="'environment-param-' + index"
            v-model="values[index]"
            :placeholder="param.placeholder"
            v-if="param.type == 'json'"
            rows="4"
          />
          <div class="form-check form-switch">
            <input
              type="checkbox"
              class="form-check-input"
              :id="'environment-param-' + index"
              v-model="values[index]"
              name="check-button"
              v-if="param.type == 'boolean'"
            />
          </div>
        </div>
        <div class="col">
          <span style="color: red" v-if="param.mandatory == true">{{
            language[config.currentLanguage].Environments.mandatory
          }}</span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-10">
          <button
            type="button"
            class="btn btn-success"
            size="sm"
            style="float: right"
            v-on:click="addVariable()"
          >
            {{ language[config.currentLanguage].Environments.addVariable }}
          </button>
        </div>
        <div class="col-sm-2" />
      </div>
      <div
        class="row my-1"
        v-for="(env, index) in environments"
        v-bind:key="index"
      >
        <div class="col-sm-3">
          <input
            class="form-control form-control-sm"
            :id="'environment-variable-name-' + index"
            v-model="environments[index].name"
            :placeholder="language[config.currentLanguage].Environments.name"
          />
        </div>
        <div class="col-sm-6">
          <input
            class="form-control form-control-sm"
            :id="'environment-variable-value-' + index"
            v-model="environments[index].value"
            :placeholder="language[config.currentLanguage].Environments.value"
            :disabled="environments[index].name.length == 0"
          />
        </div>
        <div class="col">
          <span
            class="idelium-action-icon--delete"
            v-on:click="deleteEnv(index)"
            :title="language[config.currentLanguage].Actions.delete"
            role="button"
            style="cursor: pointer"
            ><font-awesome-icon icon="trash" class="idelium-action-icon"
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import param from "./environmentsParameter";
export default {
  name: "EnvironmentsComponent",
  components: {},
  props: {
    json: Object,
    environmentType: String,
  },
  data() {
    return {
      parameters: null,
      values: [],
      environments: [],
    };
  },
  watch: {
    environmentType() {
      this.setTypeEnvironment();
    },
    environments() {
      this.generateJson(true);
    },
    values() {
      this.generateJson(true);
    },
  },
  created() {
    this.setTypeEnvironment();
  },
  methods: {
    setTypeEnvironment() {
      if (this.environmentType == "web") {
        this.parameters = param.selenium;
      } else if (this.environmentType == "app") {
        this.parameters = param.appium;
      } else if (this.environmentType == "webservice")
        this.parameters = param.webservice;
      this.values = [];
      this.environments = [];
      for (let i in this.parameters) {
        this.values.push(this.initialValue(this.parameters[i]));
      }
      this.generateJson(true);
    },
    addVariable() {
      this.environments.push({
        name: "",
        value: "",
      });
    },
    deleteEnv(index) {
      this.environments.splice(index, 1);
    },
    putJson(json) {
      this.values = this.parameters.map((parameter) =>
        this.displayValue(
          parameter,
          this.parameterValueFromJson(parameter, json),
        ),
      );
      this.environments = this.customEnvironmentVariables(json);
    },
    generateJson(isAuto = null) {
      let jsonToSend = {};
      let subParameter = false;
      let jsonSub = {};
      for (let i in this.parameters) {
        if (
          isAuto == false &&
          this.parameters[i].mandatory == true &&
          this.isEmptyValue(this.values[i])
        ) {
          this.$bvModal.msgBoxOk(
            this.language[this.config.currentLanguage].Environments
              .someValuesAreMandatory,
            {
              okVariant: "danger",
              size: "sm",
              buttonSize: "sm",
            },
          );
          return false;
        }
        if (this.parameters[i].typeName == "uiautomator2ServerInstallTimeout")
          subParameter = true;
        let normalizedValue = this.normalizedValue(
          this.parameters[i],
          this.values[i],
          isAuto,
        );
        if (this.parameters[i].type == "json" && normalizedValue === false)
          return false;
        if (this.parameters[i].uiOnly == true) continue;
        if (subParameter == true)
          jsonSub[this.parameters[i].typeName] = normalizedValue;
        else jsonToSend[this.parameters[i].typeName] = normalizedValue;
      }
      if (subParameter == true) jsonToSend["appiumDesiredCaps"] = jsonSub;
      if (!this.applySeleniumConvenienceCapabilities(jsonToSend, isAuto))
        return false;
      for (let i in this.environments) {
        if (isAuto == false && this.isEmptyValue(this.environments[i].value)) {
          this.$bvModal.msgBoxOk(
            this.language[this.config.currentLanguage].Environments
              .someVariableValuesAreEmpty,
            {
              okVariant: "danger",
              size: "sm",
              buttonSize: "sm",
            },
          );
          return false;
        }
        jsonToSend[this.environments[i].name] = this.environments[i].value;
      }
      if (isAuto == false) this.$emit("changeWizardJson", jsonToSend);
    },
    initialValue(parameter) {
      if (parameter.type == "json")
        return JSON.stringify(parameter.default, null, 2);
      return parameter.default;
    },
    normalizedValue(parameter, value, isAuto = null) {
      if (parameter.type != "json") return value;
      if (value === null || value === undefined || value === "") return null;
      if (typeof value != "string") return value;
      try {
        return JSON.parse(value);
      } catch (error) {
        if (isAuto == false) {
          this.$bvModal.msgBoxOk(
            this.language[
              this.config.currentLanguage
            ].Environments.invalidJson.replace("{field}", parameter.typeName),
            {
              okVariant: "danger",
              size: "sm",
              buttonSize: "sm",
            },
          );
        }
        return false;
      }
    },
    displayValue(parameter, value) {
      if (parameter.type == "json")
        return JSON.stringify(value ?? parameter.default, null, 2);
      return value ?? parameter.default;
    },
    parameterValueFromJson(parameter, json) {
      if (!json) return parameter.default;
      if (parameter.uiOnly == true)
        return this.uiOnlyValueFromJson(parameter, json);
      if (Object.prototype.hasOwnProperty.call(json, parameter.typeName))
        return json[parameter.typeName];
      if (
        json.appiumDesiredCaps &&
        Object.prototype.hasOwnProperty.call(
          json.appiumDesiredCaps,
          parameter.typeName,
        )
      )
        return json.appiumDesiredCaps[parameter.typeName];
      return parameter.default;
    },
    customEnvironmentVariables(json) {
      if (!json) return [];
      const knownParameterNames = new Set(
        this.parameters.map((parameter) => parameter.typeName),
      );
      const firstNestedParameterIndex = this.parameters.findIndex(
        (parameter) => parameter.typeName == "uiautomator2ServerInstallTimeout",
      );
      const nestedParameterNames = new Set(
        firstNestedParameterIndex == -1
          ? []
          : this.parameters
              .slice(firstNestedParameterIndex)
              .map((parameter) => parameter.typeName),
      );
      return Object.keys(json)
        .filter((key) => key != "appiumDesiredCaps")
        .filter((key) => !knownParameterNames.has(key))
        .filter((key) => !nestedParameterNames.has(key))
        .map((key) => ({
          name: key,
          value: json[key],
        }));
    },
    isEmptyValue(value) {
      if (value === null || value === undefined) return true;
      if (typeof value == "string") return value.trim().length == 0;
      return false;
    },
    valueForParameter(typeName) {
      const index = this.parameters.findIndex(
        (parameter) => parameter.typeName == typeName,
      );
      return index == -1 ? null : this.values[index];
    },
    uiOnlyValueFromJson(parameter, json) {
      if (this.environmentType != "web") return parameter.default;
      const capabilities = json.seleniumGridCapabilities || {};
      const chromeOptions = capabilities["goog:chromeOptions"] || {};
      const args = chromeOptions.args || [];
      if (parameter.typeName == "seleniumHeadless") {
        return args.some((arg) => String(arg).startsWith("--headless"));
      }
      if (parameter.typeName == "seleniumProxyUrl") {
        return (
          capabilities.proxy?.httpProxy ||
          capabilities.proxy?.sslProxy ||
          parameter.default
        );
      }
      if (parameter.typeName == "seleniumDownloadDirectory") {
        return (
          chromeOptions.prefs?.["download.default_directory"] ||
          parameter.default
        );
      }
      if (parameter.typeName == "seleniumLocale") {
        const localeArgument = args.find((arg) =>
          String(arg).startsWith("--lang="),
        );
        return localeArgument
          ? localeArgument.replace("--lang=", "")
          : parameter.default;
      }
      if (parameter.typeName == "seleniumBiDiEnabled") {
        return capabilities.webSocketUrl === true;
      }
      return parameter.default;
    },
    applySeleniumConvenienceCapabilities(jsonToSend, isAuto = null) {
      if (this.environmentType != "web") return true;
      if (!this.validateSeleniumConfiguration(jsonToSend, isAuto)) return false;

      const capabilities = {
        ...(jsonToSend.seleniumGridCapabilities || {}),
      };
      const browser = jsonToSend.browser;
      const chromeOptions = {
        ...(capabilities["goog:chromeOptions"] || {}),
      };
      const chromeArguments = [...(chromeOptions.args || [])];
      const chromePrefs = {
        ...(chromeOptions.prefs || {}),
      };

      if (this.valueForParameter("seleniumBiDiEnabled") === true)
        capabilities.webSocketUrl = true;
      if (this.valueForParameter("seleniumProxyUrl")) {
        capabilities.proxy = {
          proxyType: "manual",
          httpProxy: this.valueForParameter("seleniumProxyUrl"),
          sslProxy: this.valueForParameter("seleniumProxyUrl"),
        };
      }
      if (
        this.valueForParameter("seleniumHeadless") === true &&
        ["chrome", "edge"].includes(browser)
      ) {
        chromeArguments.push("--headless=new");
      }
      if (this.valueForParameter("seleniumLocale")) {
        chromeArguments.push(
          "--lang=" + this.valueForParameter("seleniumLocale"),
        );
      }
      if (this.valueForParameter("seleniumDownloadDirectory")) {
        chromePrefs["download.default_directory"] = this.valueForParameter(
          "seleniumDownloadDirectory",
        );
      }
      if (chromeArguments.length > 0)
        chromeOptions.args = [...new Set(chromeArguments)];
      if (Object.keys(chromePrefs).length > 0)
        chromeOptions.prefs = chromePrefs;
      if (Object.keys(chromeOptions).length > 0)
        capabilities["goog:chromeOptions"] = chromeOptions;
      jsonToSend.seleniumGridCapabilities = capabilities;
      return true;
    },
    validateSeleniumConfiguration(jsonToSend, isAuto = null) {
      if (isAuto != false) return true;
      if (
        jsonToSend.seleniumGridUrl &&
        !this.isHttpUrlWithoutCredentials(jsonToSend.seleniumGridUrl)
      ) {
        this.showValidationError(
          this.language[this.config.currentLanguage].Environments
            .invalidSeleniumGridUrl,
        );
        return false;
      }
      if (
        this.valueForParameter("seleniumHeadless") === true &&
        ["safari", "iexplorer"].includes(jsonToSend.browser)
      ) {
        this.showValidationError(
          this.language[this.config.currentLanguage].Environments
            .unsupportedHeadlessBrowser,
        );
        return false;
      }
      if (
        this.valueForParameter("seleniumProxyUrl") &&
        !this.isHttpUrlWithoutCredentials(
          this.valueForParameter("seleniumProxyUrl"),
        )
      ) {
        this.showValidationError(
          this.language[this.config.currentLanguage].Environments
            .invalidSeleniumProxyUrl,
        );
        return false;
      }
      return true;
    },
    isHttpUrlWithoutCredentials(value) {
      try {
        const parsedUrl = new URL(value);
        return (
          ["http:", "https:"].includes(parsedUrl.protocol) &&
          parsedUrl.username.length == 0 &&
          parsedUrl.password.length == 0
        );
      } catch {
        return false;
      }
    },
    showValidationError(message) {
      this.$bvModal.msgBoxOk(message, {
        okVariant: "danger",
        size: "sm",
        buttonSize: "sm",
      });
    },
  },
};
</script>
