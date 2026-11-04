import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/ui-batch-b');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn('npm', ['run', 'start', '--', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  // Wait for server to be responsive
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    console.error('Server failed to start in time.');
    server.kill();
    process.exit(1);
  }

  console.log('Server is ready. Launching Playwright browser...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '360', width: 360, height: 740 },
    { name: '744', width: 744, height: 1024 },
    { name: '1280', width: 1280, height: 800 },
  ];

  try {
    for (const vp of viewports) {
      console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);

      // 1. Light Mode & Dark Mode tests
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        // (a) Exercise Detail Page & Pro Tips Contrast
        await page.goto(`${BASE_URL}/exercises/barbell-bench-press`, { waitUntil: 'networkidle' });
        // Force theme class on <html> if necessary
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await page.waitForTimeout(400);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `exercise-detail-${vp.name}-${theme}.png`),
          fullPage: false,
        });

        // (b) Share Card on Landing Page
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await page.waitForTimeout(400);

        // Scroll down to the streak challenge teaser section
        const teaser = page.locator('section:has-text("BUILD STREAKS")');
        if (await teaser.count() > 0) {
          await teaser.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `share-card-landing-${vp.name}-${theme}.png`),
          });
        }

        // (c) Notification Panel Open (using visible selector)
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const bellButton = page.locator('button[aria-label="Announcements"]:visible').first();
        if (await bellButton.count() > 0) {
          await bellButton.click();
          await page.waitForTimeout(600);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `notifications-open-${vp.name}-${theme}.png`),
          });
          // Close it
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }

        // (d) Mobile Menu Open (for 360 and 744)
        if (vp.width < 1024) {
          const menuButton = page.locator('button[aria-label="Open Navigation Menu"]:visible').first();
          if (await menuButton.count() > 0) {
            await menuButton.click();
            await page.waitForTimeout(600);
            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, `mobile-menu-open-${vp.name}-${theme}.png`),
            });
            // Close it
            await page.keyboard.press('Escape');
            await page.waitForTimeout(400);
          }
        }

        await context.close();
      }
    }

    console.log('\nAll screenshots taken successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
