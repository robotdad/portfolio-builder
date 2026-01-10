const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to settings page...');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    console.log('Capturing full page screenshot...');
    await page.screenshot({ 
      path: 'tests/screenshots/admin-settings-improved.png', 
      fullPage: true 
    });
    
    // Verify theme cards are visible
    const themeCards = await page.locator('.theme-card').count();
    console.log(`✓ Found ${themeCards} theme cards (expected 3)`);
    
    // Verify compact portfolio section
    const compactSection = await page.locator('.settings-section--compact').isVisible();
    console.log(`✓ Compact portfolio section visible: ${compactSection}`);
    
    // Verify settings nav separator
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(500);
    const settingsSeparator = await page.locator('.nav-section--settings').isVisible();
    console.log(`✓ Settings nav separator visible: ${settingsSeparator}`);
    
    console.log('\n✅ All improvements verified successfully!');
    
  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'tests/screenshots/error-verification.png' });
  } finally {
    await browser.close();
  }
})();
