import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3009;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/part1');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn('npm', ['run', 'start', '--', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  try {
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (res.status === 200) {
          console.log('Server is ready!');
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }

    const browser = await chromium.launch({ headless: true });
    const viewports = [
      { name: '360_mobile', width: 360, height: 780 },
      { name: '744_tablet', width: 744, height: 1024 },
      { name: '1280_desktop', width: 1280, height: 800 },
    ];

    const themes = ['light', 'dark'];

    for (const vp of viewports) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        // 1. Visit landing page
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

        // Ensure theme class
        await page.evaluate((t) => {
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }
        }, theme);

        await page.waitForTimeout(300);

        // Click visible announcement bell
        const bell = page.locator('button[aria-label="Announcements"]:visible, button:has-text("নোটিশ"):visible').first();
        if (await bell.isVisible()) {
          await bell.click();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `bell_${vp.name}_${theme}.png`),
            fullPage: false,
          });
          console.log(`Captured bell at ${vp.name} (${theme})`);
        }

        // 2. Check /admin redirection without admin auth
        await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `admin_auth_guard_${vp.name}_${theme}.png`),
        });
        console.log(`Captured admin guard at ${vp.name} (${theme})`);

        await context.close();
      }
    }

    await browser.close();
    console.log('Verification screenshots captured successfully!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
