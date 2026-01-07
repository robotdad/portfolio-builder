const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('SEEING WHAT THE USER ACTUALLY SEES...\n');

    // Go to first category's first project
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Click on Shakespearean Tragedy category in nav
    const catNav = page.locator('nav a').filter({ hasText: /shakespearean/i }).first();
    if (await catNav.isVisible({ timeout: 3000 })) {
      await catNav.click();
      await page.waitForTimeout(1500);
      
      // Click on first project link under this category
      const projectNav = page.locator('nav a[href*="/admin/projects/"]').first();
      if (await projectNav.isVisible({ timeout: 2000 })) {
        await projectNav.click();
        await page.waitForTimeout(2500);
        await page.screenshot({ path: 'ai_working/USER-01-project-page.png', fullPage: true });
        console.log('✓ Project page captured');

        // Look for carousel section specifically
        const sections = page.locator('section, div[class*="section"]');
        const sectionCount = await sections.count();
        console.log(`Found ${sectionCount} sections`);

        // Scroll through and capture each section
        for (let i = 0; i < Math.min(sectionCount, 10); i++) {
          const section = sections.nth(i);
          const text = await section.textContent().catch(() => '');
          if (text.toLowerCase().includes('carousel') || text.toLowerCase().includes('featured')) {
            console.log(`\nFound carousel/featured section ${i}`);
            await section.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await section.screenshot({ path: `ai_working/USER-02-carousel-section.png` });
            console.log('✓ Carousel section captured');

            // Check for images in this section
            const imgs = section.locator('img');
            const imgCount = await imgs.count();
            console.log(`  Images in section: ${imgCount}`);

            if (imgCount === 0) {
              console.log('  ⚠️ NO IMAGES IN CAROUSEL SECTION!');
            }

            // Check for carousel items
            const items = section.locator('[class*="item"], [class*="carousel"]');
            const itemCount = await items.count();
            console.log(`  Carousel items found: ${itemCount}`);
            break;
          }
        }
      }
    }

    console.log('\n✓ Check ai_working/USER-*.png to see the problem');

  } catch (error) {
    console.error('❌', error.message);
    await page.screenshot({ path: 'ai_working/USER-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
