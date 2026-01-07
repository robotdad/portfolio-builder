const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('TESTING COMPLETE WORKFLOW: Add images to carousel...\n');

    await page.goto('http://localhost:3000/admin', { timeout: 12000 });
    await page.waitForTimeout(2000);

    // Navigate to Home page editor
    console.log('1. Opening Home page editor...');
    const pagesBtn = page.locator('nav').getByText(/^pages$/i).first();
    if (await pagesBtn.isVisible({ timeout: 2000 })) {
      await pagesBtn.click();
      await page.waitForTimeout(300);
    }
    
    const homeLink = page.locator('nav a').filter({ hasText: /home/i }).first();
    if (await homeLink.isVisible({ timeout: 2000 })) {
      await homeLink.click();
      await page.waitForTimeout(3000);
      console.log('   ✓ Home page loaded');
    }

    // Scroll to carousel section
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'ai_working/WORKFLOW-01-page-with-carousel.png', fullPage: true });

    // Click "Add Multiple from Gallery"
    console.log('2. Clicking "Add Multiple from Gallery"...');
    const addMultiBtn = page.getByRole('button', { name: /add multiple.*gallery/i }).first();
    if (await addMultiBtn.isVisible({ timeout: 2000 })) {
      await addMultiBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'ai_working/WORKFLOW-02-picker-opened.png', fullPage: true });
      console.log('   ✓ Multi-select picker opened');

      // Capture grid close-up
      const grid = page.locator('.image-picker-grid');
      if (await grid.isVisible({ timeout: 1000 })) {
        await grid.screenshot({ path: 'ai_working/WORKFLOW-03-grid-CLEAR.png' });
        console.log('   ✓ Grid captured for vision analysis');
      }

      // Select 3 images
      console.log('3. Selecting 3 images...');
      const thumbnails = page.locator('.image-picker-grid button[role="option"]');
      const count = await thumbnails.count();
      console.log(`   Found ${count} images`);

      if (count >= 3) {
        for (let i = 0; i < 3; i++) {
          await thumbnails.nth(i).click();
          await page.waitForTimeout(300);
          console.log(`   ✓ Selected image ${i+1}`);
        }

        await page.screenshot({ path: 'ai_working/WORKFLOW-04-three-selected.png', fullPage: true });
        console.log('   ✓ Three images selected');

        // Check for numbered badges
        const badges = page.locator('.selection-badge');
        const badgeCount = await badges.count();
        console.log(`   Numbered badges visible: ${badgeCount}`);

        // Click "Add X Images" button
        console.log('4. Clicking confirm button...');
        const confirmBtn = page.getByRole('button', { name: /add.*image/i }).first();
        if (await confirmBtn.isVisible({ timeout: 1000 })) {
          const btnText = await confirmBtn.textContent();
          console.log(`   Button text: "${btnText}"`);
          await confirmBtn.click();
          await page.waitForTimeout(2000);
          console.log('   ✓ Confirmation clicked');
        }

        // Check carousel section NOW
        console.log('5. Checking carousel section for new items...');
        await page.evaluate(() => window.scrollTo(0, 2000));
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'ai_working/WORKFLOW-05-after-adding.png', fullPage: true });

        // Find carousel section
        const carouselSection = page.locator('text=/featured.*carousel/i').first();
        if (await carouselSection.isVisible({ timeout: 2000 })) {
          await carouselSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          
          // Capture carousel section
          const section = carouselSection.locator('xpath=ancestor::div[contains(@class, "section") or contains(@class, "carousel")]').first();
          if (await section.isVisible({ timeout: 1000 })) {
            await section.screenshot({ path: 'ai_working/WORKFLOW-06-carousel-WITH-ITEMS.png' });
            console.log('   ✓ Carousel section captured');

            // Count carousel items
            const items = section.locator('[class*="carousel-item"], [class*="featured-item"]');
            const itemCount = await items.count();
            console.log(`\n   CAROUSEL ITEMS: ${itemCount}`);

            // Check for images IN items
            const carouselImages = section.locator('img');
            const imgCount = await carouselImages.count();
            console.log(`   IMAGES IN ITEMS: ${imgCount}`);

            if (imgCount > 0) {
              console.log('   ✓✓✓ IMAGES VISIBLE IN CAROUSEL!');
              for (let i = 0; i < Math.min(3, imgCount); i++) {
                const img = carouselImages.nth(i);
                const src = await img.getAttribute('src');
                console.log(`     Image ${i+1}: ${src?.substring(0, 50)}`);
              }
            } else {
              console.log('   ⚠️⚠️⚠️ NO IMAGES IN CAROUSEL ITEMS!');
            }
          }
        }
      }
    }

    console.log('\n✅ Check ai_working/WORKFLOW-*.png');

  } catch (error) {
    console.error('❌', error.message);
    await page.screenshot({ path: 'ai_working/WORKFLOW-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
