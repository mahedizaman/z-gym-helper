import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots/fix-batch-c');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function run() {
  console.log(`Starting Next.js server on port ${PORT}...`);
  const server = spawn('npm', ['run', 'start', '--', '-p', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) },
  });

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE_URL}/`);
      if (res.status === 200) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '360', width: 360, height: 740 },
    { name: '744', width: 744, height: 1024 },
    { name: '935', width: 935, height: 900 },
    { name: '1280', width: 1280, height: 800 },
  ];

  try {
    for (const osScheme of ['light', 'dark']) {
      console.log(`\n======================================================`);
      console.log(`TEST SUITE: Browser OS is ${osScheme.toUpperCase()}`);
      console.log(`======================================================`);

      for (const vp of viewports) {
        console.log(`\n>>> Viewport ${vp.name} (${vp.width}x${vp.height}) [OS: ${osScheme}] <<<`);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: osScheme,
        });

        const page = await context.newPage();

        // 1. Initial page load
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        // Wait for cookie banner initial delay (800ms)
        await page.waitForTimeout(1000);

        // Verify cookie banner is present initially
        const cookieBannerInitial = await page.evaluate(() => {
          const banner = document.querySelector('[aria-label="Cookie and Privacy Consent"]');
          return banner ? window.getComputedStyle(banner).display : 'none';
        });
        console.log(`Initial cookie banner display: "${cookieBannerInitial}"`);

        // Test both themes by clicking the real in-app toggle!
        for (const targetTheme of ['light', 'dark']) {
          console.log(`\nTesting In-App Theme Toggle to: ${targetTheme.toUpperCase()}...`);

          // Read current theme from <html> class
          let currentClass = await page.evaluate(() => document.documentElement.className);
          let isDark = currentClass.includes('dark');

          if ((targetTheme === 'dark' && !isDark) || (targetTheme === 'light' && isDark)) {
            // Click the real theme toggle button in the navbar
            const toggleBtn = page.locator('button[aria-label*="Switch to"]:visible').first();
            await toggleBtn.click();
            await page.waitForTimeout(400);

            currentClass = await page.evaluate(() => document.documentElement.className);
            isDark = currentClass.includes('dark');
            console.log(`Toggle clicked! <html> class is now: "${currentClass}"`);
          }

          // (A) Test Mobile Menu (width < 1024)
          if (vp.width < 1024) {
            console.log(`Testing Mobile Menu at ${vp.width}px in ${targetTheme}...`);
            const menuBtn = page.locator('button[aria-label="Open Navigation Menu"]:visible').first();
            await menuBtn.click();
            await page.waitForTimeout(600);

            // Automated contrast check on computed colors
            const menuData = await page.evaluate(() => {
              const panel = document.querySelector('[role="dialog"]');
              const link = panel ? panel.querySelector('nav a:not(.bg-lime-brand)') : null;
              const wordmark = panel ? panel.querySelector('a[aria-label="Z-Gym Helper"]') : null;
              const cookie = document.querySelector('[aria-label="Cookie and Privacy Consent"]');

              if (!panel) return null;

              const panelStyle = window.getComputedStyle(panel);
              const linkStyle = link ? window.getComputedStyle(link) : null;

              return {
                panelBg: panelStyle.backgroundColor,
                linkText: linkStyle ? linkStyle.color : null,
                linkBg: linkStyle ? linkStyle.backgroundColor : null,
                wordmarkText: wordmark ? wordmark.textContent : '',
                hasHelperBadge: Boolean(panel.textContent.includes('HELPER')),
                cookieVisibleDuringMenu: cookie ? window.getComputedStyle(cookie).display !== 'none' : false,
              };
            });

            if (menuData) {
              const bgRgb = parseRgb(menuData.panelBg);
              const textRgb = parseRgb(menuData.linkText || 'rgb(0,0,0)');
              const contrast = getContrast(bgRgb, textRgb);
              console.log(
                `Menu Evaluation: PanelBg=${menuData.panelBg}, LinkText=${menuData.linkText}, Contrast=${contrast.toFixed(2)}:1, Wordmark="${menuData.wordmarkText}", HasHelper=${menuData.hasHelperBadge}, CookieHidden=${!menuData.cookieVisibleDuringMenu}`
              );

              if (contrast < 4.5) {
                throw new Error(
                  `FAIL: Menu text contrast ${contrast.toFixed(2)}:1 is below WCAG AA 4.5:1 in ${targetTheme} mode (OS ${osScheme})!`
                );
              }

              if (!menuData.hasHelperBadge) {
                throw new Error(`FAIL: Menu wordmark must include HELPER in ${targetTheme} mode!`);
              }

              if (menuData.cookieVisibleDuringMenu) {
                throw new Error(`FAIL: Cookie banner must be hidden while mobile menu is open!`);
              }
            }

            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, `menu-${vp.name}-${targetTheme}-os-${osScheme}.png`),
            });

            await page.keyboard.press('Escape');
            await page.waitForTimeout(400);
          }

          // (B) Test Notification Panel & Cookie Banner Collision
          console.log(`Testing Notification Panel at ${vp.width}px in ${targetTheme}...`);
          const bellBtn = page.locator('button[aria-label="Announcements"]:visible').first();
          await bellBtn.click();
          await page.waitForTimeout(600);

          const notifData = await page.evaluate(() => {
            const bottomSheet = document.querySelector('.rounded-t-3xl[role="dialog"]');
            const popover = document.querySelector('[data-radix-popper-content-wrapper]');
            const cookie = document.querySelector('[aria-label="Cookie and Privacy Consent"]');

            const activePanel = bottomSheet || popover?.querySelector('[role="dialog"], div');
            const panelStyle = activePanel ? window.getComputedStyle(activePanel) : null;

            return {
              isBottomSheet: Boolean(bottomSheet),
              isPopover: Boolean(popover),
              panelBg: panelStyle ? panelStyle.backgroundColor : null,
              cookieVisibleDuringNotif: cookie ? window.getComputedStyle(cookie).display !== 'none' : false,
            };
          });

          console.log(
            `Notifications Evaluation: IsBottomSheet=${notifData.isBottomSheet}, IsPopover=${notifData.isPopover}, PanelBg=${notifData.panelBg}, CookieHidden=${!notifData.cookieVisibleDuringNotif}`
          );

          if (vp.width < 640) {
            if (!notifData.isBottomSheet) {
              throw new Error(`FAIL: Expected bottom sheet below 640px at ${vp.width}px!`);
            }
          } else {
            if (!notifData.isPopover) {
              throw new Error(`FAIL: Expected anchored popover from 640px up at ${vp.width}px!`);
            }
          }

          if (notifData.cookieVisibleDuringNotif) {
            throw new Error(`FAIL: Cookie banner must be hidden while notifications are open!`);
          }

          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `notifications-${vp.name}-${targetTheme}-os-${osScheme}.png`),
          });

          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);

          // (C) Test Profile Target Modal on /calculator
          console.log(`Testing Profile Modal at ${vp.width}px in ${targetTheme}...`);
          await page.goto(`${BASE_URL}/calculator`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(400);

          const profileBtn = page.locator('button:has-text("লক্ষ্য নির্ধারণ")').first();
          if (await profileBtn.count() > 0) {
            await profileBtn.click();
            await page.waitForTimeout(500);

            const modalData = await page.evaluate(() => {
              const modal = document.querySelector('[role="dialog"]');
              const innerCard = modal ? modal.querySelector('.bg-card') : null;
              const cardStyle = innerCard ? window.getComputedStyle(innerCard) : null;
              const cookie = document.querySelector('[aria-label="Cookie and Privacy Consent"]');

              return {
                cardBg: cardStyle ? cardStyle.backgroundColor : null,
                cookieVisibleDuringModal: cookie ? window.getComputedStyle(cookie).display !== 'none' : false,
              };
            });

            console.log(
              `Profile Modal Evaluation: CardBg=${modalData.cardBg}, CookieHidden=${!modalData.cookieVisibleDuringModal}`
            );

            if (modalData.cookieVisibleDuringModal) {
              throw new Error(`FAIL: Cookie banner must be hidden while profile modal is open!`);
            }

            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, `profile-modal-${vp.name}-${targetTheme}-os-${osScheme}.png`),
            });

            await page.keyboard.press('Escape');
            await page.waitForTimeout(400);
          }

          // (D) Test Share Modal
          console.log(`Testing Share Card Preview at ${vp.width}px in ${targetTheme}...`);
          await page.goto(`${BASE_URL}/progress`, { waitUntil: 'networkidle' });
          await page.waitForTimeout(400);

          const shareBtn = page.locator('button:has-text("কার্ড তৈরি করুন"), button:has-text("কার্ড প্রিভিউ")').first();
          if (await shareBtn.count() > 0) {
            await shareBtn.click();
            await page.waitForTimeout(500);

            const shareData = await page.evaluate(() => {
              const modal = document.querySelector('[role="dialog"]');
              const innerCard = modal ? modal.querySelector('.bg-card') : null;
              const cardStyle = innerCard ? window.getComputedStyle(innerCard) : null;
              const cookie = document.querySelector('[aria-label="Cookie and Privacy Consent"]');

              return {
                cardBg: cardStyle ? cardStyle.backgroundColor : null,
                cookieVisibleDuringShare: cookie ? window.getComputedStyle(cookie).display !== 'none' : false,
              };
            });

            console.log(
              `Share Modal Evaluation: CardBg=${shareData?.cardBg}, CookieHidden=${!shareData?.cookieVisibleDuringShare}`
            );

            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, `share-modal-${vp.name}-${targetTheme}-os-${osScheme}.png`),
            });

            await page.keyboard.press('Escape');
            await page.waitForTimeout(400);
          }
        }

        await context.close();
      }
    }

    console.log('\n======================================================');
    console.log('SUCCESS: All Fix Batch C checks and contrast verifications PASSED!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
