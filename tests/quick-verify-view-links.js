/**
 * Quick verification: ViewLinksGroup in Pages/Projects Editors
 * Simpler test with shorter timeouts and early exit
 */

const { chromium } = require('playwright');

async function quickVerify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(5000); // 5 second timeout

  try {
    console.log('🧪 Quick ViewLinksGroup Verification\n');

    // Test Pages Editor
    console.log('📄 Testing Pages Editor...');
    try {
      await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
      const pageLink = page.locator('a[href*="/admin/pages/"]').first();
      await pageLink.click({ timeout: 3000 });
      await page.waitForLoadState('domcontentloaded');
      
      const viewLinks = await page.locator('.view-links-group').count();
      const divider = await page.locator('.action-divider').count();
      
      console.log(`   ViewLinksGroup: ${viewLinks > 0 ? '✅' : '❌'}`);
      console.log(`   Action Divider: ${divider > 0 ? '✅' : '❌'}`);
      
      if (viewLinks > 0) {
        const draftLink = page.locator('.view-link--draft');
        const href = await draftLink.getAttribute('href');
        console.log(`   Draft URL: ${href}`);
      }
      
      await page.screenshot({ path: 'tests/screenshots/pages-quick-check.png' });
    } catch (e) {
      console.log(`   ⚠️ Pages test: ${e.message}`);
    }

    // Test Projects Editor
    console.log('\n📦 Testing Projects Editor...');
    try {
      await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'domcontentloaded' });
      const categoryLink = page.locator('a[href*="/admin/categories/"][href*="/projects"]').first();
      await categoryLink.click({ timeout: 3000 });
      await page.waitForLoadState('domcontentloaded');
      
      const projectLink = page.locator('a[href*="/admin/projects/"]').first();
      await projectLink.click({ timeout: 3000 });
      await page.waitForLoadState('domcontentloaded');
      
      const viewLinks = await page.locator('.view-links-group').count();
      const divider = await page.locator('.action-divider').count();
      
      console.log(`   ViewLinksGroup: ${viewLinks > 0 ? '✅' : '❌'}`);
      console.log(`   Action Divider: ${divider > 0 ? '✅' : '❌'}`);
      
      if (viewLinks > 0) {
        const draftLink = page.locator('.view-link--draft');
        const href = await draftLink.getAttribute('href');
        console.log(`   Draft URL: ${href}`);
      }
      
      await page.screenshot({ path: 'tests/screenshots/projects-quick-check.png' });
    } catch (e) {
      console.log(`   ⚠️ Projects test: ${e.message}`);
    }

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error-quick.png' });
  } finally {
    await browser.close();
  }
}

quickVerify();
