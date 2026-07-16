import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./tests/setup.js"],
      restoreMocks: true,
      exclude: [...configDefaults.exclude, "e2e/*"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/],
      },
      coverage: {
        provider: "v8",
        include: [
          "src/services/**",
          "src/stores/**",
          "src/domain/**",
          "src/router/**",
          "src/components/header.vue",
          "src/view/pages/login.vue",
          "src/view/testcycles.vue",
        ],
        thresholds: {
          lines: 60,
          functions: 50,
          statements: 60,
          branches: 50,
        },
      },
    },
  }),
);
