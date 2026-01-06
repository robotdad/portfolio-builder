const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureCurrentState() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/current-state';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('📸 Capturing current state of admin interface...\n');

    // Dashboard
    console.log('1. Dashboard');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '01-dashboard.png'),
      fullPage: true 
    });
    console.log('   ✓ Captured\n');

    // Categories
    console.log('2. Categories');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotDir, '02-categories.png'),
      fullPage: true 
    });
    console.log('   ✓ Captured\n');

    // Check navigation tree
    console.log('3. Navigation Tree Analysis');
    const navTree = await page.locator('nav.navigation-tree').textContent();
    console.log('   Content:', navTree);
    console.log('');

    console.log('✅ Screenshots saved to:', screenshotDir);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

captureCurrentState().catch(console.error);
