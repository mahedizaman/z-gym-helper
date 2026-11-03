import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const widths = [
  { name: '360', width: 360, height: 800 },
  { name: '744', width: 744, height: 1133 },
  { name: '1280', width: 1280, height: 900 },
];

async function main() {
  const outDir = path.resolve(process.cwd(), 'docs/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  for (const { name, width, height } of widths) {
    console.log(`Taking screenshot at ${width}x${height}...`);
    const page = await browser.newPage({
      viewport: { width, height },
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    // Allow Framer Motion / GSAP animations to settle
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(outDir, `landing-${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot: ${screenshotPath}`);

    // Check for horizontal overflow
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Width ${name}px: horizontal overflow = ${overflowX}`);

    await page.close();
  }

  await browser.close();
  console.log('All screenshots completed.');
}

main().catch((err) => {
  console.error('Error taking screenshots:', err);
  process.exit(1);
});
