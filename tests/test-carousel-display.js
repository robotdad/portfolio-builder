const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('TESTING CAROUSEL IMAGE DISPLAY (what user is actually complaining about)...\n');

    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Find project with carousel
    const projectLink = page.locator('nav').getByText(/obsidian|nebula/i).first();
    if (await projectLink.isVisible({ timeout: 3000 })) {
      await projectLink.click();
      await page.waitForTimeout(2500);
      
      await page.screenshot({ path: 'ai_working/CAROUSEL-project-page.png', fullPage: true });
      console.log('✓ Project page with carousel captured');

      // Look for carousel section
      const carouselSection = page.locator('text=/featured.*carousel|carousel/i').first();
      if (await carouselSection.isVisible({ timeout: 2000 })) {
        await carouselSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Capture carousel area
        const section = page.locator('.featured-carousel-editor, [class*="carousel"]').first();
        if (await section.isVisible({ timeout: 2000 })) {
          await section.screenshot({ path: 'ai_working/CAROUSEL-section-closeup.png' });
          console.log('✓ Carousel section isolated');

          // Count carousel items
          const items = section.locator('[class*="carousel-item"], [class*="featured-item"]');
          const itemCount = await items.count();
          console.log(`\nFound ${itemCount} carousel items`);

          // Check for images IN the carousel items
          const carouselImages = section.locator('img');
          const imgCount = await carouselImages.count();
          console.log(`Found ${imgCount} images IN carousel items`);

          if (imgCount === 0) {
            console.log('⚠️⚠️⚠️ NO IMAGES IN CAROUSEL - THIS IS THE PROBLEM!');
          } else {
            for (let i = 0; i < Math.min(3, imgCount); i++) {
              const img = carouselImages.nth(i);
              const src = await img.getAttribute('src');
              const box = await img.boundingBox();
              console.log(`  Carousel image ${i+1}: ${box ? `${Math.round(box.width)}x${Math.round(box.height)}px` : 'invisible'}, src: ${src?.substring(0, 50)}`);
            }
          }
        }
      }
    }

    console.log('\n✅ Check ai_working/CAROUSEL-*.png');

  } catch (error) {
    console.error('❌', error.message);
    await page.screenshot({ path: 'ai_working/CAROUSEL-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
