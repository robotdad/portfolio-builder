const { chromium } = require('playwright');

/**
 * Verification script to take screenshots of populated portfolio
 */

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('📸 Taking verification screenshots...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Dashboard
    console.log('  Taking screenshot: admin dashboard');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-01-dashboard.png', fullPage: true });
    
    // Categories page
    console.log('  Taking screenshot: categories list');
    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-02-categories.png', fullPage: true });
    
    // About page editor
    console.log('  Taking screenshot: About page editor');
    await page.goto(`${BASE_URL}/admin/pages/cmk1fu1if0003h35rqx4q4pje`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-03-about-page.png', fullPage: true });
    
    // Public About page
    console.log('  Taking screenshot: public About page');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification-04-public-about.png', fullPage: true });
    
    console.log('\n✅ Screenshots saved:');
    console.log('  - verification-01-dashboard.png');
    console.log('  - verification-02-categories.png');
    console.log('  - verification-03-about-page.png');
    console.log('  - verification-04-public-about.png\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

main();
