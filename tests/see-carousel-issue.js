const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('CAPTURING WHAT USER SEES - CAROUSEL ISSUE...\n');

    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Find a project with images
    console.log('1. Going to first project...');
    await page.goto('http://localhost:3000/admin/projects', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const projectLink = page.locator('a[href*="/admin/projects/"]').first();
    if (await projectLink.isVisible({ timeout: 3000 })) {
      await projectLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'ai_working/CAROUSEL-01-project-editor.png', fullPage: true });
      console.log('   ✓ Project editor captured');

      // Look for carousel section
      const carouselHeading = page.locator('text=/featured carousel|carousel/i').first();
      if (await carouselHeading.isVisible({ timeout: 2000 })) {
        console.log('   ✓ Found carousel section');
        
        // Scroll to carousel
        await carouselHeading.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Capture just the carousel section
        const carouselSection = page.locator('[class*="carousel"], section').filter({ has: carouselHeading }).first();
        if (await carouselSection.isVisible({ timeout: 1000 })) {
          await carouselSection.screenshot({ path: 'ai_working/CAROUSEL-02-section-closeup.png' });
          console.log('   ✓ Carousel section close-up captured');
        }
        
        await page.screenshot({ path: 'ai_working/CAROUSEL-03-with-carousel.png', fullPage: true });
        
        // Check for images in carousel items
        const carouselImages = page.locator('[class*="carousel"] img, [class*="featured"] img');
        const imgCount = await carouselImages.count();
        console.log(`   Found ${imgCount} images in carousel area`);
        
        if (imgCount > 0) {
          const first = carouselImages.first();
          const src = await first.getAttribute('src');
          const visible = await first.isVisible();
          console.log(`   First carousel image: src="${src}", visible=${visible}`);
        } else {
          console.log('   ⚠️ NO IMAGES IN CAROUSEL!');
        }
      } else {
        console.log('   ⚠️ No carousel section found');
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
