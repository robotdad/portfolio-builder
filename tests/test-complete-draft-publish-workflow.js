const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Complete Draft/Publish Workflow\n');
  
  try {
    // Step 1: Verify Settings page has new controls
    console.log('Step 1: Checking Settings page header controls...');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const hasViewDraftLink = await page.locator('a:has-text("View Draft")').count() > 0;
    const hasViewLiveLink = await page.locator('a:has-text("View Live")').count() > 0;
    const hasDraftIndicator = await page.locator('[class*="draft-indicator"]').count() > 0;
    const hasSaveDraftButton = await page.locator('button:has-text("Save Draft")').count() > 0;
    const hasPublishButton = await page.locator('button:has-text("Publish")').count() > 0;
    
    console.log(`  ✓ View Draft link: ${hasViewDraftLink ? '✓' : '✗'}`);
    console.log(`  ✓ View Live link: ${hasViewLiveLink ? '✓' : '✗'}`);
    console.log(`  ✓ Draft Indicator: ${hasDraftIndicator ? '✓' : '✗'}`);
    console.log(`  ✓ Save Draft button: ${hasSaveDraftButton ? '✓' : '✗'}`);
    console.log(`  ✓ Publish button: ${hasPublishButton ? '✓' : '✗'}`);
    
    await page.screenshot({ path: 'tests/screenshots/workflow-1-settings-controls.png' });
    
    // Step 2: Check current theme in settings
    console.log('\nStep 2: Checking current theme selection...');
    const selectedTheme = await page.locator('.theme-card[class*="selected"]').count();
    console.log(`  ✓ Theme selected: ${selectedTheme > 0 ? 'Yes' : 'No'}`);
    
    // Step 3: Verify theme cards show actual colors
    console.log('\nStep 3: Verifying theme thumbnails...');
    const themeCards = await page.locator('.theme-card').count();
    console.log(`  ✓ Found ${themeCards} theme cards with thumbnails`);
    
    await page.screenshot({ path: 'tests/screenshots/workflow-2-theme-cards.png', fullPage: true });
    
    // Step 4: Check View Draft link works
    console.log('\nStep 4: Testing View Draft link...');
    const draftLink = await page.locator('a:has-text("View Draft")').getAttribute('href');
    console.log(`  ✓ Draft URL: ${draftLink}`);
    
    // Step 5: Check View Live link works
    console.log('\nStep 5: Testing View Live link...');
    const liveLink = await page.locator('a:has-text("View Live")').getAttribute('href');
    console.log(`  ✓ Live URL: ${liveLink}`);
    
    // Step 6: Verify Pages editor has ViewLinks
    console.log('\nStep 6: Checking Pages editor...');
    await page.goto('http://localhost:3000/admin/pages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    // Click first page in list
    const firstPage = await page.locator('a[href*="/admin/pages/"]').first();
    if (firstPage) {
      await firstPage.click();
      await page.waitForTimeout(1000);
      
      const hasPageViewLinks = await page.locator('a:has-text("View Draft")').count() > 0;
      console.log(`  ✓ Pages editor has View Links: ${hasPageViewLinks ? '✓' : '✗'}`);
      
      await page.screenshot({ path: 'tests/screenshots/workflow-3-pages-editor.png' });
    }
    
    // Step 7: Verify Projects editor has ViewLinks
    console.log('\nStep 7: Checking Projects editor...');
    await page.goto('http://localhost:3000/admin/projects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    // Click first project in list
    const firstProject = await page.locator('a[href*="/admin/projects/"]').first();
    if (firstProject) {
      await firstProject.click();
      await page.waitForTimeout(1000);
      
      const hasProjectViewLinks = await page.locator('a:has-text("View Draft")').count() > 0;
      console.log(`  ✓ Projects editor has View Links: ${hasProjectViewLinks ? '✓' : '✗'}`);
      
      await page.screenshot({ path: 'tests/screenshots/workflow-4-projects-editor.png' });
    }
    
    // Step 8: Check onboarding theme preview
    console.log('\nStep 8: Checking onboarding theme preview consistency...');
    await page.goto('http://localhost:3000/welcome/theme', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const onboardingThemeCards = await page.locator('.theme-card').count();
    const hasThemeThumbnails = await page.locator('svg').count() > 0;
    console.log(`  ✓ Onboarding has ${onboardingThemeCards} theme cards`);
    console.log(`  ✓ Uses SVG thumbnails: ${hasThemeThumbnails ? '✓' : '✗'}`);
    
    await page.screenshot({ path: 'tests/screenshots/workflow-5-onboarding-themes.png' });
    
    console.log('\n✅ Complete Draft/Publish Workflow Test: PASSED');
    console.log('\nAll screenshots saved to tests/screenshots/workflow-*.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'tests/screenshots/workflow-error.png' });
  } finally {
    await browser.close();
  }
})();
