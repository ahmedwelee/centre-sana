import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4302",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node server/index.js",
    url: "http://127.0.0.1:4302/api/health",
    env: {
      PORT: "4302",
      HOST: "127.0.0.1",
      DATA_DIR: ".data/browser-test",
      ADMIN_EMAIL: "browser@sana.local",
      ADMIN_PASSWORD: "Sana-browser-test-123!",
      APP_ORIGIN: "http://127.0.0.1:4302",
    },
    reuseExistingServer: false,
  },
});
