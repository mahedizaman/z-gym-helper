import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';

const PORT = 3006;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/ui-batch-b');

async function run() {
  const server = spawn('npm', ['run', 'start', '--', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  const browser = await chromium.launch({ headless: true });

  try {
    for (const theme of ['light', 'dark']) {
      for (const vp of [
        { name: '360', width: 360, height: 740 },
        { name: '744', width: 744, height: 1024 },
        { name: '1280', width: 1280, height: 800 },
      ]) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        // 1. Landing page share card teaser
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await page.waitForTimeout(300);

        // Type a custom name in the interactive card
        const nameInput = page.locator('input[placeholder*="নাম লিখুন"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.scrollIntoViewIfNeeded();
          await nameInput.fill('IronTamer');
          await page.waitForTimeout(300);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `share-card-interactive-${vp.name}-${theme}.png`),
          });
        }

        // 2. Exercise detail Pro Trainer tips box
        await page.goto(`${BASE_URL}/exercises/barbell-bench-press`, { waitUntil: 'networkidle' });
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await page.waitForTimeout(300);
        const tipsBox = page.locator('text=প্রো ট্রেইনার টিপস').first();
        if (await tipsBox.count() > 0) {
          await tipsBox.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `pro-trainer-tips-${vp.name}-${theme}.png`),
          });
        }

        await context.close();
      }
    }
    console.log('Extra screenshots saved successfully!');
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
