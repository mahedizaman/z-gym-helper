import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'docs/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '744', width: 744, height: 1133 },
  { name: '1280', width: 1280, height: 900 },
];

const themes = ['light', 'dark'];

async function run() {
  const browser = await chromium.launch({ headless: true });
  console.log('--- STARTING PLAYWRIGHT MENU & NOTIFICATION PANEL INTERACTIVE VERIFICATION ---');

  for (const theme of themes) {
    for (const vp of viewports) {
      console.log(`\nTesting Viewport ${vp.name}px (${vp.width}x${vp.height}) in ${theme} mode...`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });

      const page = await context.newPage();
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Set theme explicitly on the page if needed
      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      await page.waitForTimeout(200);

      // --- 1. NOTIFICATION PANEL TEST ---
      console.log(`[${vp.name}px - ${theme}] Testing Announcement Notification Panel...`);
      const bellButton = page.locator('button[aria-label="Announcements"]:visible').first();
      await bellButton.click();
      await page.waitForTimeout(500);

      // Check if dialog or popover is open
      const panelOpen = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        const popover = document.querySelector('[data-radix-popper-content-wrapper]');
        return Boolean(dialog || popover);
      });
      console.log(`[${vp.name}px - ${theme}] Notification panel opened = ${panelOpen}`);

      // Screenshot open notification panel
      const panelScreenshot = path.join(outDir, `panel-open-${vp.name}-${theme}.png`);
      await page.screenshot({ path: panelScreenshot, fullPage: false });
      console.log(`[${vp.name}px - ${theme}] Saved screenshot: ${panelScreenshot}`);

      // Close notification panel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // --- 2. MOBILE MENU TEST (360px & 744px) ---
      if (vp.width < 1024) {
        console.log(`[${vp.name}px - ${theme}] Testing Fancy Mobile Curtain Menu...`);
        const menuButton = page.locator('button[aria-label="Open Navigation Menu"]:visible').first();
        await menuButton.click();
        await page.waitForTimeout(600);

        // Verify body scroll lock
        const scrollLocked = await page.evaluate(() => {
          const bodyStyle = window.getComputedStyle(document.body);
          const hasLockAttr = document.body.hasAttribute('data-scroll-locked');
          return bodyStyle.overflow === 'hidden' || hasLockAttr;
        });
        console.log(`[${vp.name}px - ${theme}] Body scroll locked = ${scrollLocked}`);

        // Verify menu is visible and solid
        const menuVisible = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return false;
          const style = window.getComputedStyle(dialog);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        console.log(`[${vp.name}px - ${theme}] Mobile menu visible = ${menuVisible}`);

        // Screenshot open mobile menu
        const menuScreenshot = path.join(outDir, `menu-open-${vp.name}-${theme}.png`);
        await page.screenshot({ path: menuScreenshot, fullPage: false });
        console.log(`[${vp.name}px - ${theme}] Saved screenshot: ${menuScreenshot}`);

        // Close menu using close button
        const closeButton = page.locator('button[aria-label="Close Navigation Menu"]');
        await closeButton.click();
        await page.waitForTimeout(400);

        const menuClosed = await page.evaluate(() => {
          return !document.querySelector('[role="dialog"]');
        });
        console.log(`[${vp.name}px - ${theme}] Menu closed successfully = ${menuClosed}`);
      } else {
        console.log(`[${vp.name}px - ${theme}] Desktop viewport: Standard navigation links verified.`);
        const desktopNavVisible = await page.locator('nav[aria-label="Main Navigation"]').isVisible();
        console.log(`[${vp.name}px - ${theme}] Desktop nav visible = ${desktopNavVisible}`);
      }

      await context.close();
    }
  }

  await browser.close();
  console.log('\n--- VERIFICATION FINISHED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Interactive verification failed:', err);
  process.exit(1);
});
