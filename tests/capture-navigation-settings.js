const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to admin page...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    
    // Wait for navigation to be visible
    await page.waitForSelector('nav[aria-label="Main navigation"]', { state: 'visible' });
    
    console.log('Capturing navigation sidebar screenshot...');
    const navigation = await page.locator('nav[aria-label="Main navigation"]');
    await navigation.screenshot({ 
      path: 'tests/screenshots/navigation-settings-separator.png'
    });
    
    console.log('Screenshot saved to tests/screenshots/navigation-settings-separator.png');
    console.log('\nVerifying Settings separator styling...');
    
    // Check if the Settings section has the proper class
    const settingsSection = await page.locator('.nav-section--settings');
    const isVisible = await settingsSection.isVisible();
    console.log('Settings section with separator class visible:', isVisible);
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    await page.screenshot({ path: 'tests/screenshots/error-navigation.png' });
  } finally {
    await browser.close();
  }
})();
