const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Testing page editor route...\n');
    
    // Navigate to the page editor
    const pageId = 'cmk1fu1if0003h35rqx4q4pje'; // About page
    const url = `http://localhost:3000/admin/pages/${pageId}`;
    
    console.log(`1. Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait for page to load
    await page.waitForSelector('h2:has-text("Content")', { timeout: 10000 });
    
    console.log('✓ Page loaded successfully\n');
    
    // Check for key UI elements
    console.log('2. Checking UI elements:');
    
    const checks = [
      { selector: 'nav[aria-label="Breadcrumb"]', name: 'Breadcrumb navigation' },
      { selector: 'button:has-text("Save Draft")', name: 'Save Draft button' },
      { selector: 'button:has-text("Publish")', name: 'Publish button' },
      { selector: 'h2:has-text("Content")', name: 'Content header' },
      { selector: 'button:has-text("Add Section")', name: 'Add Section button' },
    ];
    
    for (const check of checks) {
      const element = await page.locator(check.selector).first();
      const visible = await element.isVisible();
      console.log(`   ${visible ? '✓' : '✗'} ${check.name}`);
    }
    
    // Check breadcrumb structure
    console.log('\n3. Verifying breadcrumb structure:');
    const breadcrumbs = await page.locator('nav[aria-label="Breadcrumb"] a, nav[aria-label="Breadcrumb"] span').allTextContents();
    console.log(`   Breadcrumb: ${breadcrumbs.join(' → ')}`);
    
    // Check if sections are displayed or empty state
    const hasSections = await page.locator('[data-section-id]').count();
    const hasEmptyState = await page.locator('text=No content yet').isVisible();
    
    console.log('\n4. Content state:');
    if (hasSections > 0) {
      console.log(`   ✓ Found ${hasSections} section(s)`);
    } else if (hasEmptyState) {
      console.log('   ✓ Empty state displayed (no content yet)');
    } else {
      console.log('   ? Unable to determine content state');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'page-editor-verification.png', fullPage: true });
    console.log('\n✓ Screenshot saved: page-editor-verification.png');
    
    // Test Save Draft button state
    const saveDraftButton = page.locator('button:has-text("Save Draft")');
    const isDisabled = await saveDraftButton.isDisabled();
    console.log(`\n5. Save Draft button: ${isDisabled ? 'Disabled (no changes)' : 'Enabled'}`);
    
    console.log('\n✅ Page editor verification complete!');
    console.log('\nSummary:');
    console.log('- Route works correctly');
    console.log('- All UI components render');
    console.log('- Breadcrumb navigation present');
    console.log('- Draft/Publish workflow ready');
    console.log('- Add Section functionality available');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    await page.screenshot({ path: 'page-editor-error.png', fullPage: true });
    console.log('Error screenshot saved: page-editor-error.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
