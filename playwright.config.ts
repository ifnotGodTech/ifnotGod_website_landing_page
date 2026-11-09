import { defineConfig } from "@playwright/test";
import { API_PORT, BACKEND_DIR, OUTBOX_DIR } from "./e2e/backend";

const PORT = 3100;

// Run `npm run build:e2e` first, which builds with accounts switched on. These tests check the production
// server. Accounts use a real backend: the backend's scripts/serve_for_e2e.sh starts it with a fresh
// database and a few client accounts, and writes emails to files, where the tests read reset links. It
// needs PostgreSQL running locally, and the backend repo next to this one (or BACKEND_DIR pointing at it).
export default defineConfig({
  testDir: "./e2e",
  // Pages built on request read plans and accounts from the backend, which shares this machine with
  // every test runner, so a first visit can take more than the default 5 seconds.
  expect: { timeout: 10_000 },
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: [
    {
      command: `"${BACKEND_DIR}/scripts/serve_for_e2e.sh"`,
      url: `http://127.0.0.1:${API_PORT}/health/`,
      env: {
        PORT: String(API_PORT),
        // Its own database and outbox, so the dashboard's tests can run at the same time.
        E2E_DB: "ifnotgod_backend_e2e_web",
        EMAIL_OUTBOX_DIR: OUTBOX_DIR,
        WEB_BASE_URL: `http://localhost:${PORT}`,
        LOG_LEVEL: "ERROR",
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      env: {
        BACKEND_API_URL: `http://127.0.0.1:${API_PORT}`,
        BACKEND_APP_KEY: "local-web-app-key",
        // A made-up client id: the tests check the redirect to Google, never sign in there.
        GOOGLE_CLIENT_ID: "e2e-client-id.apps.googleusercontent.com",
        // A blank key means no test can ever send a real lead email.
        BREVO_API_KEY: "",
      },
    },
  ],
});
