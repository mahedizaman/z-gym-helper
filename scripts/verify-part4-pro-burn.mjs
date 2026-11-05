import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3012;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/part4');

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
        const res = await fetch(`${BASE_URL}/calculator`);
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

        // Visit /calculator
        await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' });
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        } else {
          await page.evaluate(() => document.documentElement.classList.remove('dark'));
        }
        await page.waitForTimeout(300);

        // Screenshot 1: Daily Plan Card & Top Targets
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `calculator_daily_plan_${vp.name}_${theme}.png`),
          fullPage: false,
        });

        // Click "প্ল্যান কাস্টমাইজ" / "Customize Plan" button
        const customizeBtn = page.locator('button:has-text("কাস্টমাইজ"), button:has-text("Customize")').first();
        if (await customizeBtn.isVisible()) {
          await customizeBtn.click();
          await page.waitForTimeout(250);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `calculator_plan_customizer_${vp.name}_${theme}.png`),
            fullPage: false,
          });
        }

        // Scroll to Exercise Burn Section
        const exerciseHeading = page.locator('h3:has-text("ব্যায়াম ও ক্যালোরি বার্ন"), h3:has-text("Exercise & Calorie Burn")').first();
        if (await exerciseHeading.isVisible()) {
          await exerciseHeading.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);

          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `calculator_exercise_burn_${vp.name}_${theme}.png`),
            fullPage: false,
          });
        }

        // Scroll slightly down to verify sticky header opacity
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(200);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `sticky_header_opaque_${vp.name}_${theme}.png`),
          fullPage: false,
        });

        await context.close();
      }
    }

    await browser.close();
    console.log('Part 4 Playwright screenshots saved successfully!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
