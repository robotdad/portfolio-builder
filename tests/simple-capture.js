const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Capturing admin interface for vision analysis...\n');

    // Just load admin and take screenshot
    console.log('Loading admin...');
    await page.goto('http://localhost:3000/admin', { 
      waitUntil: 'domcontentloaded',
      timeout: 8000 
    });
    await page.waitForTimeout(2000); // Give it time to render
    await page.screenshot({ path: 'tests/screenshots/admin.png', fullPage: false });
    console.log('✓ Admin captured');

    // Try to get to categories quickly
    console.log('Loading categories...');
    await page.goto('http://localhost:3000/admin/categories', {
      waitUntil: 'domcontentloaded',
      timeout: 8000
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/screenshots/categories.png', fullPage: false });
    console.log('✓ Categories captured');

    console.log('\n✅ Screenshots captured successfully');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
