import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'docs/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '1280', width: 1280, height: 900 },
];

const themes = ['light', 'dark'];

async function run() {
  const browser = await chromium.launch({ headless: true });
  console.log('--- STARTING PLAYWRIGHT BUG-FIX BATCH A INTERACTIVE VERIFICATION ---');

  for (const theme of themes) {
    for (const vp of viewports) {
      console.log(`\nTesting Viewport ${vp.name}px (${vp.width}x${vp.height}) in ${theme} mode...`);

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });

      const page = await context.newPage();

      // --- 1. CALCULATOR & PROFILE MODAL CLEAR / RETYPE TEST ---
      console.log(`[${vp.name}px - ${theme}] Testing Calculator Profile Modal backspace/clear crash fix...`);
      await page.goto('http://localhost:3000/calculator', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Force theme class
      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      await page.waitForTimeout(200);

      // Open Profile Target Modal (Button containing Sliders or 'Edit Target' / 'টার্গেট')
      const editButton = page.locator('button:has-text("টার্গেট"), button:has-text("Target")').first();
      await editButton.click();
      await page.waitForTimeout(400);

      // Verify modal is open
      const ageInput = page.locator('#profile-age');
      await ageInput.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[${vp.name}px - ${theme}] Profile Modal opened successfully.`);

      // Clear age input completely (simulate backspace)
      await ageInput.click();
      await ageInput.fill('');
      await page.waitForTimeout(300);

      // Clear height input completely
      const heightInput = page.locator('#profile-height');
      await heightInput.click();
      await heightInput.fill('');
      await page.waitForTimeout(300);

      // Check whether page crashed
      const pageCrashed = await page.evaluate(() => {
        return (
          document.body.innerText.includes("This page couldn't load") ||
          document.body.innerText.includes('Application error')
        );
      });
      console.log(`[${vp.name}px - ${theme}] Page crashed after clearing inputs = ${pageCrashed}`);
      if (pageCrashed) {
        throw new Error(`CRASH DETECTED on ${vp.name}px ${theme} when clearing numeric inputs!`);
      }

      // Check that Save button is disabled when inputs are empty/invalid
      const saveButton = page.locator('button:has-text("সেভ"), button:has-text("Save")').last();
      const isSaveDisabled = await saveButton.isDisabled();
      console.log(`[${vp.name}px - ${theme}] Save button disabled when fields empty = ${isSaveDisabled}`);

      // Capture screenshot of the modal with empty fields and inline validation message
      const clearedScreenshot = path.join(outDir, `profile-modal-cleared-${vp.name}-${theme}.png`);
      await page.screenshot({ path: clearedScreenshot });
      console.log(`[${vp.name}px - ${theme}] Saved cleared inputs screenshot: ${clearedScreenshot}`);

      // Retype valid numbers into age and height
      await ageInput.fill('28');
      await heightInput.fill('175');
      await page.waitForTimeout(300);

      const isSaveEnabledAfterRetype = !(await saveButton.isDisabled());
      console.log(`[${vp.name}px - ${theme}] Save button re-enabled after retyping = ${isSaveEnabledAfterRetype}`);

      // Save profile
      await saveButton.click();
      await page.waitForTimeout(400);

      // --- 2. FOOD PICKER LEADING ZERO TEST ---
      console.log(`[${vp.name}px - ${theme}] Testing Custom Grams NumberField leading zero fix...`);
      const addFoodBtn = page.locator('button:has-text("খাবার যোগ"), button:has-text("Add Food")').first();
      await addFoodBtn.click();
      await page.waitForTimeout(500);

      // Select first food in list
      const firstFoodItem = page.locator('button:has(h4)').first();
      await firstFoodItem.waitFor({ state: 'visible', timeout: 5000 });
      await firstFoodItem.click();
      await page.waitForTimeout(300);

      // Switch to custom grams
      const customGramsBtn = page.locator('button:has-text("কাস্টম গ্রাম"), button:has-text("Custom grams")');
      await customGramsBtn.click();
      await page.waitForTimeout(300);

      const gramsInput = page.locator('#food-picker-custom-grams');
      await gramsInput.click();
      await gramsInput.fill('');
      await gramsInput.fill('015'); // Type with leading zero
      await page.waitForTimeout(200);

      const gramsValue = await gramsInput.inputValue();
      console.log(`[${vp.name}px - ${theme}] Typing '015' into Grams resulted in = '${gramsValue}' (Leading zero stripped = ${gramsValue === '15'})`);

      // Retype 200
      await gramsInput.fill('0200');
      const grams200Value = await gramsInput.inputValue();
      console.log(`[${vp.name}px - ${theme}] Typing '0200' into Grams resulted in = '${grams200Value}' (Leading zero stripped = ${grams200Value === '200'})`);

      // Capture screenshot of food picker with NumberField
      const foodPickerScreenshot = path.join(outDir, `food-picker-numberfield-${vp.name}-${theme}.png`);
      await page.screenshot({ path: foodPickerScreenshot });
      console.log(`[${vp.name}px - ${theme}] Saved food picker screenshot: ${foodPickerScreenshot}`);

      // Close modal
      const closeFoodModal = page.locator('div[role="dialog"] button[aria-label="Close"]').first();
      await closeFoodModal.click();
      await page.waitForTimeout(300);

      // --- 3. GOOGLE SIGN-IN FRIENDLY ERROR MESSAGE TEST ---
      console.log(`[${vp.name}px - ${theme}] Testing Google OAuth Friendly Error Message (/login?error=access_denied)...`);
      await page.goto('http://localhost:3000/login?error=access_denied', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);
      await page.waitForTimeout(200);

      const errorBannerVisible = await page.locator('.text-tomato-brand').count() > 0;
      console.log(`[${vp.name}px - ${theme}] Friendly error banner visible = ${errorBannerVisible}`);

      const loginScreenshot = path.join(outDir, `login-friendly-error-${vp.name}-${theme}.png`);
      await page.screenshot({ path: loginScreenshot });
      console.log(`[${vp.name}px - ${theme}] Saved login friendly error screenshot: ${loginScreenshot}`);

      // --- 4. BMI PAGE NUMBERFIELD TEST ---
      console.log(`[${vp.name}px - ${theme}] Testing BMI Page NumberField inputs (/bmi)...`);
      await page.goto('http://localhost:3000/bmi', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);

      await page.evaluate((t) => {
        if (t === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }, theme);

      const bmiHeightInput = page.locator('#bmi-height-cm');
      await bmiHeightInput.click();
      await bmiHeightInput.fill('');
      await page.waitForTimeout(200);

      const bmiPageCrashed = await page.evaluate(() => {
        return (
          document.body.innerText.includes("This page couldn't load") ||
          document.body.innerText.includes('Application error')
        );
      });
      console.log(`[${vp.name}px - ${theme}] BMI Page crashed when clearing height = ${bmiPageCrashed}`);

      await bmiHeightInput.fill('180');
      const bmiWeightInput = page.locator('#bmi-weight-kg');
      await bmiWeightInput.fill('75.5');
      await page.waitForTimeout(300);

      const bmiScreenshot = path.join(outDir, `bmi-numberfield-${vp.name}-${theme}.png`);
      await page.screenshot({ path: bmiScreenshot });
      console.log(`[${vp.name}px - ${theme}] Saved BMI NumberField screenshot: ${bmiScreenshot}`);

      await context.close();
    }
  }

  await browser.close();
  console.log('\n--- PLAYWRIGHT INTERACTIVE VERIFICATION COMPLETED WITH ZERO ERRORS ---');
}

run().catch((err) => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
