import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3013;
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
    // Wait for server to be responsive
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (res.status === 200) {
          console.log('Server is ready on port', PORT);
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    // 1. Visit landing page
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Wait for fonts to be ready
    await page.evaluate(async () => {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
    });

    console.log('Validating Bangla text shaping in DOM card...');

    // Locate the off-screen ProgressCardView
    const cardLocator = page.locator('[data-testid="progress-card-view"]').first();
    await cardLocator.waitFor({ state: 'attached', timeout: 5000 });

    const cardText = await cardLocator.innerText();

    // Check mandated Bangla strings
    const hasActiveStreak = cardText.includes('সক্রিয় স্ট্রিক');
    const hasWorkoutsCompleted = cardText.includes('ওয়ার্কআউট সম্পন্ন');
    const hasProgressReport = cardText.includes('অগ্রগতি রিপোর্ট');

    console.log('Found "সক্রিয় স্ট্রিক":', hasActiveStreak);
    console.log('Found "ওয়ার্কআউট সম্পন্ন":', hasWorkoutsCompleted);
    console.log('Found "অগ্রগতি রিপোর্ট":', hasProgressReport);

    if (!hasActiveStreak || !hasWorkoutsCompleted || !hasProgressReport) {
      throw new Error(`Bangla card text missing required strings! Text content: ${cardText}`);
    }

    // 2. Click the download button on the landing page teaser to verify client rasterization
    console.log('Testing client rasterization via download button...');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.locator('button:has-text("ডাউনলোড"), button:has-text("Download")').first().click(),
    ]);

    const downloadedPath = path.join(SCREENSHOTS_DIR, 'progress_card_exported_bangla.png');
    await download.saveAs(downloadedPath);
    console.log(`Saved downloaded card PNG to: ${downloadedPath}`);

    const stats = fs.statSync(downloadedPath);
    console.log(`Downloaded PNG file size: ${Math.round(stats.size / 1024)} KB`);
    if (stats.size < 20000) {
      throw new Error(`Downloaded PNG seems too small (${stats.size} bytes)!`);
    }

    // 3. Take a screenshot of the landing page teaser section
    const teaserLocator = page.locator('section:has-text("সোশ্যাল প্রগ্রেস কার্ড"), section:has-text("স্ট্রিক")').first();
    if (await teaserLocator.isVisible()) {
      await teaserLocator.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await teaserLocator.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'landing_teaser_with_card.png'),
      });
    }

    // 4. Open /progress page to test ProgressShareModal with Square and Story formats
    console.log('Testing /progress modal rasterization...');
    await page.goto(`${BASE_URL}/progress`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Click "প্রগ্রেস কার্ড শেয়ার করুন" button
    const shareModalBtn = page.locator('button:has-text("শেয়ার"), button:has-text("Share Card")').first();
    if (await shareModalBtn.isVisible()) {
      await shareModalBtn.click();
      await page.waitForTimeout(600);

      // Verify modal is open
      const modal = page.locator('[role="dialog"], .fixed.inset-0').first();
      await modal.waitFor({ state: 'visible', timeout: 5000 });

      // Wait for rasterization image to load inside modal
      const previewImg = page.locator('img[alt="Z-Gym Progress Card"]').first();
      await previewImg.waitFor({ state: 'visible', timeout: 5000 });

      const imgSrc = await previewImg.getAttribute('src');
      console.log('Modal card preview src type:', imgSrc?.substring(0, 30));

      if (!imgSrc?.startsWith('blob:')) {
        throw new Error(`Expected modal image src to be a blob URL, got: ${imgSrc}`);
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'modal_card_square_preview.png'),
      });

      // Switch to 4:5 Story format
      const storyBtn = page.locator('button:has-text("4:5 Story"), button:has-text("9:16 Story")').first();
      if (await storyBtn.isVisible()) {
        await storyBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'modal_card_story_preview.png'),
        });
      }

      // Test download from modal
      const [modalDownload] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        page.locator('button:has-text("ডাউনলোড"), button:has-text("Download")').first().click(),
      ]);

      const modalDownloadedPath = path.join(SCREENSHOTS_DIR, 'modal_progress_card_downloaded.png');
      await modalDownload.saveAs(modalDownloadedPath);
      console.log(`Saved modal downloaded card PNG to: ${modalDownloadedPath}`);
    }

    await context.close();
    await browser.close();
    console.log('All Playwright progress card verification checks passed successfully!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
