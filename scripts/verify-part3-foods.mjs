import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3011;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/part3');

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

        // 1. Visit /foods and search
        await page.goto(`${BASE_URL}/foods`, { waitUntil: 'networkidle' });

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

        // Type in search bar
        const searchInput = page.locator('input[placeholder*="খাবার খুঁজুন"], input[placeholder*="Search"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('ভাত');
          await page.waitForTimeout(400);
        }

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `foods_search_${vp.name}_${theme}.png`),
          fullPage: false,
        });
        console.log(`Captured /foods search at ${vp.name} (${theme})`);

        // 2. Visit /calculator and open food picker
        await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' });
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

        // Click Add Food on lunch or first meal slot
        const addFoodBtn = page.locator('button:has-text("খাবার যোগ"), button:has-text("Add Food")').first();
        if (await addFoodBtn.isVisible()) {
          await addFoodBtn.click();
          await page.waitForTimeout(400);

          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `calculator_food_picker_${vp.name}_${theme}.png`),
            fullPage: false,
          });
          console.log(`Captured food picker modal at ${vp.name} (${theme})`);
        }

        await context.close();
      }
    }

    await browser.close();
    console.log('Part 3 verification completed successfully!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
