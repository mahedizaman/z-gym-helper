import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const widths = [
  { name: '360', width: 360, height: 800 },
  { name: '744', width: 744, height: 1133 },
  { name: '1280', width: 1280, height: 900 },
];

const routes = [
  { slug: 'home', path: '/' },
  { slug: 'foods', path: '/foods' },
  { slug: 'calculator', path: '/calculator' },
  { slug: 'bmi', path: '/bmi' },
  { slug: 'exercises', path: '/exercises' },
  { slug: 'exercise-detail', path: '/exercises/barbell-bench-press' },
  { slug: 'plans', path: '/plans' },
  { slug: 'plan-detail', path: '/plans/full-body-3' },
  { slug: 'dashboard', path: '/dashboard' },
  { slug: 'progress', path: '/progress' },
  { slug: 'log', path: '/log' },
  { slug: 'settings', path: '/settings' },
  { slug: 'login', path: '/login' },
  { slug: 'leaderboard', path: '/leaderboard' },
  { slug: 'challenges', path: '/challenges' },
  { slug: 'challenge-detail', path: '/c/preview' },
  { slug: 'admin', path: '/admin' },
];

async function main() {
  const outDir = path.resolve(process.cwd(), 'docs/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  for (const route of routes) {
    for (const { name, width, height } of widths) {
      console.log(`Taking screenshot for ${route.slug} at ${width}x${height}...`);
      const page = await browser.newPage({
        viewport: { width, height },
      });

      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle' });
      // Allow client hydration and motion animations to settle
      await page.waitForTimeout(1000);

      const screenshotPath = path.join(outDir, `${route.slug}-${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check for horizontal overflow
      const overflowX = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      console.log(`[${route.slug}] Width ${name}px: horizontal overflow = ${overflowX}`);

      await page.close();
    }
  }

  await browser.close();
  console.log('All screenshots completed successfully.');
}

main().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
