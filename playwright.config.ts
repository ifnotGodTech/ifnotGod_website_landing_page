import { defineConfig } from "@playwright/test";

const PORT = 3100;

// Run `npm run build:e2e` first, which builds with accounts switched on. These tests check the production server.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // A blank key means no test can ever send a real lead email.
    env: { BREVO_API_KEY: "" },
  },
});
