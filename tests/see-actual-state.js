const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Capturing ACTUAL state to see what is broken...\n');

    // Start at admin
    console.log('1. Loading admin dashboard...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ai_working/ACTUAL-01-dashboard.png', fullPage: true });
    console.log('   ✓ Dashboard captured');

    // Navigate to categories
    console.log('2. Going to categories...');
    await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ai_working/ACTUAL-02-categories.png', fullPage: true });
    console.log('   ✓ Categories page captured');

    // Try to open a category
    const categoryLinks = page.locator('a[href^="/admin/categories/"][href*="cat_"]');
    const catCount = await categoryLinks.count();
    console.log(`   Found ${catCount} category links`);

    if (catCount > 0) {
      console.log('3. Opening first category...');
      const firstCat = categoryLinks.first();
      const href = await firstCat.getAttribute('href');
      console.log(`   Navigating to: ${href}`);
      await firstCat.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'ai_working/ACTUAL-03-category-form.png', fullPage: true });
      console.log('   ✓ Category form captured');

      // Look for image picker trigger
      console.log('4. Looking for featured image button...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`   Found ${buttonCount} buttons on page`);

      // Try different button selectors
      const possibleButtons = [
        page.getByText(/choose.*image/i).first(),
        page.getByText(/select.*image/i).first(),
        page.getByText(/featured.*image/i).first(),
        page.locator('button').filter({ hasText: /image/i }).first()
      ];

      let pickerOpened = false;
      for (const btn of possibleButtons) {
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          const text = await btn.textContent();
          console.log(`   Found button: "${text}"`);
          await btn.click();
          await page.waitForTimeout(2000);
          pickerOpened = true;
          break;
        }
      }

      if (pickerOpened) {
        await page.screenshot({ path: 'ai_working/ACTUAL-04-picker-opened.png', fullPage: true });
        console.log('   ✓ Image picker modal captured');

        // Capture JUST the grid
        const grid = page.locator('.image-picker-grid');
        if (await grid.isVisible({ timeout: 2000 }).catch(() => false)) {
          await grid.screenshot({ path: 'ai_working/ACTUAL-05-grid-only.png' });
          console.log('   ✓ Grid isolated captured');

          // Count images
          const imgs = page.locator('.image-picker-grid img');
          const imgCount = await imgs.count();
          console.log(`   Grid has ${imgCount} images`);

          if (imgCount > 0) {
            // Get details of first image
            const first = imgs.first();
            const src = await first.getAttribute('src');
            const visible = await first.isVisible();
            const box = await first.boundingBox();
            console.log(`   First image: src="${src}"`);
            console.log(`   Visible: ${visible}, Size: ${box ? `${box.width}x${box.height}` : 'N/A'}`);
          }
        } else {
          console.log('   ⚠ Grid not found!');
        }
      } else {
        console.log('   ⚠ Could not open image picker');
      }
    }

    console.log('\n✅ Actual state captured - check ai_working/ACTUAL-*.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'ai_working/ACTUAL-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
