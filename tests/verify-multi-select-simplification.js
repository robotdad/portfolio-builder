const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Verifying simplified multi-select image picker...\n');

    // Go to admin
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('1. Navigating to Categories...');
    await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/verify-01-categories.png', fullPage: true });
    console.log('   ✓ Categories page captured');

    // Try to find the first category or create new one
    const categoryLinks = page.locator('a[href*="/admin/categories/"]');
    const categoryCount = await categoryLinks.count();
    
    if (categoryCount > 0) {
      console.log('2. Opening first category...');
      await categoryLinks.first().click();
      await page.waitForTimeout(1500);
    } else {
      console.log('2. Creating new category...');
      const newButton = page.getByRole('button', { name: /new category/i });
      if (await newButton.isVisible({ timeout: 2000 })) {
        await newButton.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: 'tests/screenshots/verify-02-category-form.png', fullPage: true });
    console.log('   ✓ Category form captured');

    // Look for image picker button
    console.log('3. Looking for featured image picker...');
    const imagePickerButtons = page.locator('button').filter({ hasText: /choose|select|featured.*image|add.*image/i });
    const buttonCount = await imagePickerButtons.count();
    console.log(`   Found ${buttonCount} potential image picker buttons`);

    if (buttonCount > 0) {
      console.log('4. Opening image picker...');
      await imagePickerButtons.first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'tests/screenshots/verify-03-picker-modal.png', fullPage: true });
      console.log('   ✓ Image picker modal captured');

      // Check for numbered badges and multi-select UI
      const badges = page.locator('.selection-badge');
      const badgeCount = await badges.count();
      console.log(`   Found ${badgeCount} selection badges`);

      // Try to select an image
      const thumbnails = page.locator('.image-picker-grid img, .image-picker-grid [role="gridcell"]');
      const thumbCount = await thumbnails.count();
      console.log(`   Found ${thumbCount} image thumbnails`);

      if (thumbCount > 0) {
        console.log('5. Selecting first image...');
        await thumbnails.first().click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: 'tests/screenshots/verify-04-one-selected.png', fullPage: true });
        console.log('   ✓ One image selected');

        // Check if numbered badge appeared
        const visibleBadges = await badges.count();
        console.log(`   Selection badges visible: ${visibleBadges}`);

        // Look for footer text
        const footer = page.locator('.image-picker-footer');
        if (await footer.isVisible({ timeout: 1000 })) {
          const footerText = await footer.textContent();
          console.log(`   Footer text: "${footerText}"`);
        }
      }
    } else {
      console.log('   ⚠ No image picker button found');
    }

    console.log('\n✅ Verification screenshots captured');
    console.log('\nScreenshots location: tests/screenshots/verify-*.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/verify-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
