import pluginVue from "eslint-plugin-vue";

export default [
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      globals: {
        __APP_VERSION__: "readonly",
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "axios", message: "Use the shared API client." }] },
      ],
      "no-undef": "off",
      "no-unused-vars": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-deprecated-slot-attribute": "off",
      "vue/no-unused-components": "off",
      "vue/no-unused-vars": "off",
      "vue/require-v-for-key": "off",
      "vue/valid-v-for": "off",
    },
  },
  {
    files: ["src/services/apiClient.js"],
    rules: { "no-restricted-imports": "off" },
  },
];
