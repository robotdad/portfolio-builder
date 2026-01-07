const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('SHOWING THE ACTUAL PROBLEM USER IS SEEING...\n');

    // Go to a category that exists
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Click on first category in sidebar nav
    console.log('1. Finding category in nav...');
    const categoryInNav = page.locator('nav a').filter({ hasText: /shakespearean|high concept|period/i }).first();
    if (await categoryInNav.isVisible({ timeout: 3000 })) {
      const catName = await categoryInNav.textContent();
      console.log(`   Found: "${catName}"`);
      await categoryInNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'ai_working/PROBLEM-01-category-page.png', fullPage: true });
      console.log('   ✓ Category page captured');

      // Click Edit on first category
      const editButton = page.getByRole('button', { name: /edit/i }).first();
      if (await editButton.isVisible({ timeout: 2000 })) {
        await editButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'ai_working/PROBLEM-02-edit-form.png', fullPage: true });
        console.log('   ✓ Edit form captured');

        // Look for the featured image section/button
        console.log('2. Looking for image picker button...');
        const imageButtons = page.locator('button, [role="button"]').filter({ hasText: /image|choose|select|featured/i });
        const btnCount = await imageButtons.count();
        console.log(`   Found ${btnCount} potential buttons`);

        for (let i = 0; i < btnCount; i++) {
          const btn = imageButtons.nth(i);
          const text = await btn.textContent();
          console.log(`   Button ${i}: "${text}"`);
        }

        // Click button that might open picker
        if (btnCount > 0) {
          await imageButtons.first().click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'ai_working/PROBLEM-03-picker-modal-FULL.png', fullPage: true });
          console.log('   ✓ Modal captured (full page)');

          // Zoom in on just the modal
          const modal = page.locator('[role="dialog"], .modal, .image-picker-modal').first();
          if (await modal.isVisible({ timeout: 2000 })) {
            await modal.screenshot({ path: 'ai_working/PROBLEM-04-modal-ONLY.png' });
            console.log('   ✓ Modal isolated captured');
          }

          // Zoom in on just the grid
          const grid = page.locator('.image-picker-grid').first();
          if (await grid.isVisible({ timeout: 2000 })) {
            await grid.screenshot({ path: 'ai_working/PROBLEM-05-grid-ONLY.png' });
            console.log('   ✓ Grid isolated captured');

            // Count images
            const imgs = page.locator('.image-picker-grid img');
            const imgCount = await imgs.count();
            console.log(`\n   CRITICAL: Grid has ${imgCount} <img> elements`);

            if (imgCount > 0) {
              const first = imgs.first();
              const src = await first.getAttribute('src');
              const box = await first.boundingBox();
              const computed = await first.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                  width: style.width,
                  height: style.height,
                  objectFit: style.objectFit,
                  display: style.display
                };
              });
              console.log(`   First image src: ${src}`);
              console.log(`   Bounding box: ${box ? `${box.width}x${box.height}` : 'null'}`);
              console.log(`   Computed style:`, computed);

              // Check wrapper
              const wrapper = page.locator('.image-wrapper').first();
              if (await wrapper.isVisible({ timeout: 1000 })) {
                const wrapperBox = await wrapper.boundingBox();
                const wrapperStyle = await wrapper.evaluate(el => {
                  const style = window.getComputedStyle(el);
                  return {
                    aspectRatio: style.aspectRatio,
                    width: style.width,
                    height: style.height
                  };
                });
                console.log(`   Wrapper box: ${wrapperBox ? `${wrapperBox.width}x${wrapperBox.height}` : 'null'}`);
                console.log(`   Wrapper style:`, wrapperStyle);
              }
            } else {
              console.log('   ⚠️ NO IMAGES FOUND IN GRID!');
            }
          } else {
            console.log('   ⚠️ GRID NOT VISIBLE!');
          }
        }
      }
    }

    console.log('\n✅ Problem captured - analyzing ai_working/PROBLEM-*.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'ai_working/PROBLEM-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
