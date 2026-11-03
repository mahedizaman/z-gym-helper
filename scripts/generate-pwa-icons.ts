import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Standard App Icon (512x512 and 192x192)
  const standardSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1A211E" />
          <stop offset="100%" stop-color="#0F1412" />
        </linearGradient>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A9F26B" />
          <stop offset="100%" stop-color="#8FE04F" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
      <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="#25312C" stroke-width="4" />
      
      <!-- Subtle Thunder Pink Energy Accent Arc -->
      <path d="M 80 432 A 200 200 0 0 0 432 432" fill="none" stroke="#FF2E88" stroke-width="6" opacity="0.4" stroke-dasharray="16 12" />

      <!-- Z Bolt Symbol in Light Green #A9F26B -->
      <path d="M 170 120 L 350 120 L 220 260 L 330 260 L 160 410 L 210 280 L 140 280 Z" fill="url(#boltGrad)" filter="url(#glow)" />
    </svg>
  `;

  // 2. Maskable Icon (safe zone within 80% circle, padding = 10%)
  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1A211E" />
          <stop offset="100%" stop-color="#0F1412" />
        </linearGradient>
        <linearGradient id="boltGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#A9F26B" />
          <stop offset="100%" stop-color="#8FE04F" />
        </linearGradient>
      </defs>
      <!-- Full-bleed background for maskable safe area -->
      <rect width="512" height="512" fill="url(#bgGradMask)" />
      
      <!-- Scaled bolt inside central 70% safe area -->
      <g transform="translate(64, 64) scale(0.75)">
        <path d="M 170 120 L 350 120 L 220 260 L 330 260 L 160 410 L 210 280 L 140 280 Z" fill="url(#boltGradMask)" />
      </g>
    </svg>
  `;

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;">${standardSvg}</body></html>`);

  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: path.join(iconsDir, 'icon-512x512.png'), omitBackground: false });
  await page.screenshot({ path: path.join(iconsDir, 'apple-touch-icon.png'), omitBackground: false });

  await page.setViewportSize({ width: 192, height: 192 });
  await page.screenshot({ path: path.join(iconsDir, 'icon-192x192.png'), omitBackground: false });

  // Maskable
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;">${maskableSvg}</body></html>`);
  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: path.join(iconsDir, 'maskable-icon-512x512.png'), omitBackground: false });

  // Favicon 48x48
  await page.setViewportSize({ width: 48, height: 48 });
  await page.screenshot({ path: path.join(process.cwd(), 'public', 'favicon.png'), omitBackground: false });

  await browser.close();
  console.log('Successfully generated all PWA icons in public/icons/');
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
