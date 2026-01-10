const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to settings page...');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    
    // Wait for theme cards to load
    await page.waitForSelector('.theme-card', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    console.log('Capturing full settings page...');
    await page.screenshot({ 
      path: 'tests/screenshots/settings-with-real-themes.png', 
      fullPage: true 
    });
    
    // Capture just the theme selector section
    const themeSection = await page.locator('.theme-selector-cards').boundingBox();
    if (themeSection) {
      await page.screenshot({
        path: 'tests/screenshots/theme-selector-closeup.png',
        clip: themeSection
      });
      console.log('✓ Captured theme selector closeup');
    }
    
    // Verify we have 3 theme cards
    const themeCards = await page.locator('.theme-card').count();
    console.log(`✓ Found ${themeCards} theme cards`);
    
    // Check each theme card has a thumbnail
    for (let i = 0; i < themeCards; i++) {
      const card = page.locator('.theme-card').nth(i);
      const title = await card.locator('h4').textContent();
      const hasThumbnail = await card.locator('.theme-card-preview svg').count() > 0;
      console.log(`  - ${title}: ${hasThumbnail ? '✓ Has SVG thumbnail' : '✗ Missing thumbnail'}`);
    }
    
    console.log('\n✅ Theme preview verification complete!');
    
  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'tests/screenshots/error-theme-verification.png' });
  } finally {
    await browser.close();
  }
})();
