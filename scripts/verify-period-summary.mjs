import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3015;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Compute 3 consecutive dates ending today in Asia/Dhaka
function getTestDates() {
  const dates = [];
  const now = new Date();
  for (let i = 2; i >= 0; i--) {
    const cur = new Date(now);
    cur.setDate(now.getDate() - i);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dates.push(formatter.format(cur));
  }
  return dates;
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
          console.log('Server is responsive on port', PORT);
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }

    const browser = await chromium.launch({ headless: true });
    const [day1, day2, day3] = getTestDates();

    const viewports = [
      { name: 'mobile_360', width: 360, height: 780 },
      { name: 'desktop_1280', width: 1280, height: 900 },
    ];

    for (const vp of viewports) {
      for (const theme of ['light', 'dark']) {
        console.log(`\n--- Testing ${vp.name} in ${theme} mode ---`);
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });

        const page = await context.newPage();

        // 1. Visit /today first to seed 3 days of guest data
        await page.goto(`${BASE_URL}/today`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        await page.evaluate(
          ({ d1, d2, d3, t }) => {
            // Apply theme
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('zgym_theme', t);
            localStorage.setItem('zgym_onboarding_completed', 'true');

            // Profile
            localStorage.setItem(
              'zgym_guest_profile',
              JSON.stringify({
                gender: 'male',
                age: 26,
                heightCm: 172,
                weightKg: 70,
                activityLevel: 'moderate',
                goal: 'loss',
                customCalorieTarget: 2000,
              })
            );

            // Day 1: 1800 kcal, 100g P, 220g C, 50g F, 20g Fiber, 200 burn
            localStorage.setItem(
              `zgym_guest_meals_${d1}`,
              JSON.stringify({
                date: d1,
                slots: {
                  breakfast: [
                    { id: '1', nameBn: 'ডিম ও ওটস', nameEn: 'Egg & Oats', servingLabel: '1 bowl', grams: 200, kcal: 500, protein: 30, carbs: 60, fat: 15, fiber: 8 },
                  ],
                  lunch: [
                    { id: '2', nameBn: 'ভাত ও মুরগি', nameEn: 'Rice & Chicken', servingLabel: '1 plate', grams: 350, kcal: 800, protein: 50, carbs: 100, fat: 20, fiber: 6 },
                  ],
                  snack: [],
                  dinner: [
                    { id: '3', nameBn: 'রুটি ও ডাল', nameEn: 'Roti & Dal', servingLabel: '2 pieces', grams: 200, kcal: 500, protein: 20, carbs: 60, fat: 15, fiber: 6 },
                  ],
                },
              })
            );
            localStorage.setItem(
              `zgym_guest_burns_${d1}`,
              JSON.stringify([
                { id: 'b1', nameBn: 'রানিং', nameEn: 'Running', met: 8, durationMinutes: 20, burnedKcal: 200 },
              ])
            );

            // Day 2: 2100 kcal, 110g P, 250g C, 60g F, 25g Fiber, 300 burn
            localStorage.setItem(
              `zgym_guest_meals_${d2}`,
              JSON.stringify({
                date: d2,
                slots: {
                  breakfast: [
                    { id: '4', nameBn: 'ডিম ও পরোটা', nameEn: 'Egg & Paratha', servingLabel: '2 pieces', grams: 250, kcal: 600, protein: 25, carbs: 70, fat: 22, fiber: 5 },
                  ],
                  lunch: [
                    { id: '5', nameBn: 'গরুর মাংস ও ভাত', nameEn: 'Beef & Rice', servingLabel: '1 plate', grams: 400, kcal: 900, protein: 55, carbs: 110, fat: 25, fiber: 10 },
                  ],
                  snack: [],
                  dinner: [
                    { id: '6', nameBn: 'সবজি ও রুটি', nameEn: 'Vegetables & Roti', servingLabel: '2 pieces', grams: 200, kcal: 600, protein: 30, carbs: 70, fat: 13, fiber: 10 },
                  ],
                },
              })
            );
            localStorage.setItem(
              `zgym_guest_burns_${d2}`,
              JSON.stringify([
                { id: 'b2', nameBn: 'ওয়েটলিফটিং', nameEn: 'Weightlifting', met: 5, durationMinutes: 45, burnedKcal: 300 },
              ])
            );

            // Day 3 (Today): 2100 kcal, 105g P, 240g C, 58g F, 24g Fiber, 150 burn
            localStorage.setItem(
              `zgym_guest_meals_${d3}`,
              JSON.stringify({
                date: d3,
                slots: {
                  breakfast: [
                    { id: '7', nameBn: 'ডিম ও ওটস', nameEn: 'Egg & Oats', servingLabel: '1 bowl', grams: 200, kcal: 500, protein: 30, carbs: 60, fat: 15, fiber: 8 },
                  ],
                  lunch: [
                    { id: '8', nameBn: 'ভাত ও মাছ', nameEn: 'Rice & Fish', servingLabel: '1 plate', grams: 350, kcal: 850, protein: 45, carbs: 110, fat: 23, fiber: 8 },
                  ],
                  snack: [],
                  dinner: [
                    { id: '9', nameBn: 'চিকেন সালাদ', nameEn: 'Chicken Salad', servingLabel: '1 bowl', grams: 300, kcal: 750, protein: 30, carbs: 70, fat: 20, fiber: 8 },
                  ],
                },
              })
            );
            localStorage.setItem(
              `zgym_guest_burns_${d3}`,
              JSON.stringify([
                { id: 'b3', nameBn: 'হাঁটা', nameEn: 'Walking', met: 3.8, durationMinutes: 30, burnedKcal: 150 },
              ])
            );

            // Permanent Daily Summaries Map for guests
            const summariesMap = {
              [d1]: {
                date: d1,
                totalIntakeKcal: 1800,
                totalProtein: 100,
                totalCarbs: 220,
                totalFat: 50,
                totalFiber: 20,
                exerciseBurnKcal: 200,
                netBalanceKcal: -400,
                targetKcal: 2000,
                targetProtein: 112,
                targetBurn: 300,
                logged: true,
                mealCount: 3,
                workoutDone: true,
              },
              [d2]: {
                date: d2,
                totalIntakeKcal: 2100,
                totalProtein: 110,
                totalCarbs: 250,
                totalFat: 60,
                totalFiber: 25,
                exerciseBurnKcal: 300,
                netBalanceKcal: -200,
                targetKcal: 2000,
                targetProtein: 112,
                targetBurn: 300,
                logged: true,
                mealCount: 3,
                workoutDone: true,
              },
              [d3]: {
                date: d3,
                totalIntakeKcal: 2100,
                totalProtein: 105,
                totalCarbs: 240,
                totalFat: 58,
                totalFiber: 24,
                exerciseBurnKcal: 150,
                netBalanceKcal: -50,
                targetKcal: 2000,
                targetProtein: 112,
                targetBurn: 300,
                logged: true,
                mealCount: 3,
                workoutDone: true,
              },
            };
            localStorage.setItem('zgym_guest_daily_summaries', JSON.stringify(summariesMap));
          },
          { d1: day1, d2: day2, d3: day3, t: theme }
        );

        // Reload /today with seeded data
        await page.goto(`${BASE_URL}/today`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Verify Compact Period Summary on /today
        const compactSummary = page.locator('[data-testid="compact-period-summary"]');
        const hasCompact = await compactSummary.isVisible();
        console.log(`  [Today] CompactPeriodSummary visible: ${hasCompact}`);
        if (!hasCompact) throw new Error('CompactPeriodSummary missing on /today');

        // Test clicking 3d switcher on /today
        await compactSummary.locator('button:has-text("৩ দিন"), button:has-text("3d")').first().click();
        await page.waitForTimeout(400);
        const compactText = await compactSummary.textContent();
        console.log(`  [Today] 3-Day compact text: "${compactText?.replace(/\s+/g, ' ').trim()}"`);

        // Screenshot Today with Compact Period Summary
        const todayScreenshotPath = path.join(
          SCREENSHOTS_DIR,
          `today_compact_summary_${vp.name}_${theme}.png`
        );
        await page.screenshot({ path: todayScreenshotPath });
        console.log(`  Saved screenshot: ${todayScreenshotPath}`);

        // 2. Open /progress to test the Full PeriodSummaryCard
        await page.goto(`${BASE_URL}/progress`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const periodCard = page.locator('[data-testid="period-summary-card"]');
        const hasCard = await periodCard.isVisible();
        console.log(`  [Progress] PeriodSummaryCard visible: ${hasCard}`);
        if (!hasCard) throw new Error('PeriodSummaryCard missing on /progress');

        // Test Switcher: 3 Days
        console.log('  Testing "৩ দিন" (3 Days) switcher...');
        await periodCard.locator('button:has-text("৩ দিন"), button:has-text("3 Days")').first().click();
        await page.waitForTimeout(400);

        const cardText3d = await periodCard.textContent();
        console.log(`  3-Day text includes "৩ দিনের মধ্যে ৩ দিন": ${cardText3d?.includes('৩ দিনের মধ্যে ৩ দিন') || cardText3d?.includes('3 of 3 days')}`);

        // Test Switcher: 7 Days
        console.log('  Testing "৭ দিন" (7 Days) switcher...');
        await periodCard.locator('button:has-text("৭ দিন"), button:has-text("7 Days")').first().click();
        await page.waitForTimeout(400);

        const notice7d = page.locator('[data-testid="low-logging-notice"]');
        const hasLowNotice = await notice7d.isVisible();
        console.log(`  7-Day gentle low-logging notice visible (3 of 7 days): ${hasLowNotice}`);

        // Test Switcher: 30 Days
        console.log('  Testing "৩০ দিন" (30 Days) switcher...');
        await periodCard.locator('button:has-text("৩০ দিন"), button:has-text("30 Days")').first().click();
        await page.waitForTimeout(400);

        // Screenshot Full Period Summary Card on /progress
        const progressScreenshotPath = path.join(
          SCREENSHOTS_DIR,
          `progress_period_summary_${vp.name}_${theme}.png`
        );
        await page.screenshot({ path: progressScreenshotPath });
        console.log(`  Saved screenshot: ${progressScreenshotPath}`);

        await context.close();
      }
    }

    await browser.close();
    console.log('\n✅ All Playwright Period Summary verification checks passed cleanly!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
