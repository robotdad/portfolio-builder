const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Capture draft site
    console.log('Capturing draft site...');
    const draftPage = await browser.newPage();
    await draftPage.goto('http://localhost:3000/preview/julian-vane', { waitUntil: 'networkidle' });
    await draftPage.waitForTimeout(1000);
    await draftPage.screenshot({ 
      path: 'tests/screenshots/draft-site-modern-theme.png', 
      fullPage: true 
    });
    console.log('✓ Draft site captured');
    await draftPage.close();
    
    // Capture published site
    console.log('Capturing published site...');
    const publishedPage = await browser.newPage();
    await publishedPage.goto('http://localhost:3000/julian-vane', { waitUntil: 'networkidle' });
    await publishedPage.waitForTimeout(1000);
    await publishedPage.screenshot({ 
      path: 'tests/screenshots/published-site-modern-theme.png', 
      fullPage: true 
    });
    console.log('✓ Published site captured');
    await publishedPage.close();
    
    // Capture settings page for comparison
    console.log('Capturing settings page...');
    const settingsPage = await browser.newPage();
    await settingsPage.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    await settingsPage.waitForTimeout(1000);
    await settingsPage.screenshot({ 
      path: 'tests/screenshots/settings-page-current.png', 
      fullPage: true 
    });
    console.log('✓ Settings page captured');
    await settingsPage.close();
    
    console.log('\n✅ All screenshots captured successfully!');
    
  } catch (error) {
    console.error('Error capturing sites:', error);
  } finally {
    await browser.close();
  }
})();
