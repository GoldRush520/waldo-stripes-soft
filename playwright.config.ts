import { defineConfig } from '@playwright/test';

/**
 * Gameplay tests run against the production build in headless Chromium using the machine's GPU
 * (ANGLE/Metal on macOS; elsewhere it may fall back to software rendering, which is only slower).
 * They are functional checks, not performance measurements (see scripts/bench.mjs for those).
 *
 * The tests start a server of their own, on their own port and with a leaderboard kept in memory,
 * so they never write test names into the times you saved while playing.
 */
const PORT = 5182;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    channel: 'chromium',
    launchOptions: { args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] },
  },
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    env: { WALDO_LEADERBOARD_FILE: ':memory:' },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
