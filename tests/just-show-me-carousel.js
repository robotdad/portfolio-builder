const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Find ANY page with carousel section
    await page.goto('http://localhost:3000/admin', { timeout: 12000 });
    await page.waitForTimeout(2000);
    
    // Click "Pages" in nav
    const pagesBtn = page.locator('nav button, nav a').filter({ hasText: /^pages$/i }).first();
    if (await pagesBtn.isVisible({ timeout: 2000 })) {
      await pagesBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Click "Home" page
    const homeLink = page.locator('nav a').filter({ hasText: /home/i }).first();
    if (await homeLink.isVisible({ timeout: 2000 })) {
      await homeLink.click();
      await page.waitForTimeout(3000);
      
      // Scroll down to find carousel
      await page.evaluate(() => window.scrollTo(0, 2000));
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'ai_working/SHOW-carousel-page.png', fullPage: true });
      console.log('Page captured');
      
      // Find carousel section header
      const carouselText = page.locator('text=/carousel/i').first();
      if (await carouselText.isVisible({ timeout: 2000 })) {
        await carouselText.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Get parent section
        const section = carouselText.locator('xpath=ancestor::div[contains(@class, "section") or contains(@class, "carousel") or contains(@class, "featured")]').first();
        if (await section.isVisible({ timeout: 1000 })) {
          await section.screenshot({ path: 'ai_working/SHOW-carousel-section.png' });
          console.log('Section captured');
        }
      }
    }
    
  } catch (e) {
    console.error(e.message);
    await page.screenshot({ path: 'ai_working/SHOW-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
