const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('EMERGENCY: Capturing actual state of image picker...\n');

    // Go to project with carousel
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Find a project
    await page.goto('http://localhost:3000/admin/projects', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ai_working/BROKEN-01-projects-list.png', fullPage: true });
    console.log('✓ Projects list captured');

    // Click first project
    const firstProject = page.locator('a[href*="/admin/projects/"]').first();
    if (await firstProject.isVisible({ timeout: 3000 })) {
      await firstProject.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'ai_working/BROKEN-02-project-editor.png', fullPage: true });
      console.log('✓ Project editor captured');

      // Look for image picker button
      const pickerButtons = page.locator('button').filter({ hasText: /gallery|image|choose/i });
      const count = await pickerButtons.count();
      console.log(`Found ${count} image picker buttons`);

      if (count > 0) {
        // Click first one
        await pickerButtons.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'ai_working/BROKEN-03-picker-modal.png', fullPage: true });
        console.log('✓ Image picker modal captured');

        // Capture just the grid area
        const grid = page.locator('.image-picker-grid').first();
        if (await grid.isVisible({ timeout: 2000 })) {
          await grid.screenshot({ path: 'ai_working/BROKEN-04-grid-closeup.png' });
          console.log('✓ Grid close-up captured');

          // Get grid HTML to debug
          const gridHTML = await grid.innerHTML();
          console.log('\nGrid HTML preview (first 500 chars):');
          console.log(gridHTML.substring(0, 500));
        }

        // Check for images
        const images = page.locator('.image-picker-grid img');
        const imgCount = await images.count();
        console.log(`\nFound ${imgCount} img elements in grid`);

        if (imgCount > 0) {
          // Check first image properties
          const firstImg = images.first();
          const src = await firstImg.getAttribute('src');
          const width = await firstImg.evaluate(el => el.clientWidth);
          const height = await firstImg.evaluate(el => el.clientHeight);
          console.log(`First image: src="${src}" size=${width}x${height}`);
        }
      }
    }

    console.log('\n✅ Emergency capture complete - check ai_working/BROKEN-*.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'ai_working/BROKEN-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
