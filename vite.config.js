import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import { resolveDevApiProxyTarget } from "./config/devProxy";

// https://vitejs.dev/config/

const devEnv = {
  ...loadEnv("development", process.cwd(), ""),
  ...process.env,
};
const devApiProxyTarget = resolveDevApiProxyTarget(devEnv);

export default defineConfig({
  plugins: [vue()],
  preview: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    host: "localhost",
    headers: {
      "Cache-Control": "no-store",
    },
    hmr: {
      clientPort: 5173,
      host: "localhost",
      protocol: "ws",
    },
    proxy: {
      "^/api(?:/|$)": {
        target: devApiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
