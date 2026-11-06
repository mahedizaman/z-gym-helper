import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3014;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

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
    // Wait for server to respond
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (res.status === 200) {
          console.log('Server is responsive on port', PORT);
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }

    const browser = await chromium.launch({ headless: true });

    const viewports = [
      { name: 'mobile_360', width: 360, height: 780 },
      { name: 'tablet_744', width: 744, height: 1133 },
      { name: 'desktop_1280', width: 1280, height: 900 },
    ];

    for (const vp of viewports) {
      for (const theme of ['light', 'dark']) {
        console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height}) in ${theme} mode...`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });

        const page = await context.newPage();

        // 1. Open /today as fresh guest (clean localStorage)
        await page.goto(`${BASE_URL}/today`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);

        // Ensure theme class on <html> matches
        await page.evaluate((t) => {
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, theme);

        // Check if Onboarding modal is visible
        const onboardingHeading = page.locator('text=আপনার মূল লক্ষ্য কোনটি');
        const hasOnboarding = await onboardingHeading.isVisible().catch(() => false);
        console.log(`  Onboarding visible: ${hasOnboarding}`);

        if (hasOnboarding) {
          // Take screenshot of onboarding
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `today_onboarding_${vp.name}_${theme}.png`),
          });

          // Step 1 -> Next
          await page.locator('text=পরবর্তী ধাপ').click();
          await page.waitForTimeout(300);

          // Step 2 -> Next
          await page.locator('text=পরবর্তী ধাপ').click();
          await page.waitForTimeout(300);

          // Step 3 -> Finish
          await page.locator('text=আজ শুরু করুন').click();
          await page.waitForTimeout(400);
        }

        // 2. We are now on /today with targets filled
        // Take screenshot of empty / fresh /today
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `today_screen_empty_${vp.name}_${theme}.png`),
        });

        // 3. Add a food item via "+ খাবার"
        const addFoodBtn = page.locator('button:has-text("+ খাবার"), button:has-text("+ Add Food")').first();
        if (await addFoodBtn.isVisible()) {
          await addFoodBtn.click();
          await page.waitForTimeout(400);

          // Click first food item in picker
          const firstFood = page.locator('div[role="dialog"] button.group').first();
          if (await firstFood.isVisible()) {
            await firstFood.click();
            await page.waitForTimeout(300);

            // Confirm selection with "মিলে যোগ করুন"
            const confirmBtn = page.locator('button:has-text("মিলে যোগ করুন"), button:has-text("Add to Meal")').first();
            if (await confirmBtn.isVisible()) {
              await confirmBtn.click();
              await page.waitForTimeout(400);
            }
          }
        }

        // 4. Add a workout via "+ ব্যায়াম"
        const addWorkoutBtn = page.locator('button:has-text("+ ব্যায়াম"), button:has-text("+ Add Workout")').first();
        if (await addWorkoutBtn.isVisible()) {
          await addWorkoutBtn.click();
          await page.waitForTimeout(400);

          // Click "যোগ করুন" / "Add Workout"
          const submitWorkoutBtn = page.locator('div[role="dialog"] button[type="submit"]').first();
          if (await submitWorkoutBtn.isVisible()) {
            await submitWorkoutBtn.click();
            await page.waitForTimeout(400);
          }
        }

        // 5. Take screenshot of /today with logged food & workout
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `today_screen_logged_${vp.name}_${theme}.png`),
        });

        // 6. Reload and verify persistence
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);
        await page.evaluate((t) => {
          if (t === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }, theme);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `today_screen_reloaded_${vp.name}_${theme}.png`),
        });

        // 7. Verify navigation and Feedback dialog in More Menu
        const moreBtn = vp.width >= 1024
          ? page.locator('nav button:has-text("আরও")').first()
          : page.locator('button:has-text("আরও")').first();

        if (await moreBtn.isVisible()) {
          await moreBtn.click();
          await page.waitForTimeout(400);

          // Click "মতামত দিন"
          const feedbackBtn = page.locator('button:has-text("মতামত দিন")').first();
          if (await feedbackBtn.isVisible()) {
            await feedbackBtn.click();
            await page.waitForTimeout(300);

            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, `feedback_dialog_${vp.name}_${theme}.png`),
            });

            // Close feedback
            const closeBtn = page.locator('button[aria-label="বন্ধ করুন"], button[aria-label="Close"]').first();
            if (await closeBtn.isVisible()) {
              await closeBtn.click();
              await page.waitForTimeout(200);
            }
          }
        }

        await context.close();
      }
    }

    await browser.close();
    console.log('Playwright tests and multi-viewport screenshots completed successfully!');
  } finally {
    server.kill();
  }
}

run().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
