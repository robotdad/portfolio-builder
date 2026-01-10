const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to settings page...');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    
    // Wait a moment for any dynamic content to load
    await page.waitForTimeout(1000);
    
    console.log('Capturing screenshot...');
    await page.screenshot({ 
      path: 'tests/screenshots/admin-settings.png', 
      fullPage: true 
    });
    
    console.log('Screenshot saved to tests/screenshots/admin-settings.png');
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    await page.screenshot({ path: 'tests/screenshots/error-settings.png' });
  } finally {
    await browser.close();
  }
})();
