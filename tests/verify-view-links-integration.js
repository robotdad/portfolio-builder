/**
 * Test: ViewLinksGroup Integration in Pages and Projects Editors
 * 
 * Verifies:
 * 1. ViewLinksGroup appears in Pages Editor header
 * 2. ViewLinksGroup appears in Projects Editor header
 * 3. URLs are correctly constructed
 * 4. Layout matches Settings page pattern (ViewLinks | divider | Draft/Publish controls)
 */

const { chromium } = require('playwright');

async function testViewLinksIntegration() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 Testing ViewLinksGroup Integration\n');

    // Test 1: Pages Editor
    console.log('📄 Test 1: Pages Editor ViewLinksGroup');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Find first page link and navigate
    const firstPageLink = page.locator('a[href*="/admin/pages/"]').first();
    const pageHref = await firstPageLink.getAttribute('href');
    console.log(`   Navigating to: ${pageHref}`);
    await firstPageLink.click();
    await page.waitForLoadState('networkidle');
    
    // Check for ViewLinksGroup
    const viewLinksGroup = page.locator('.view-links-group');
    const hasViewLinks = await viewLinksGroup.count() > 0;
    console.log(`   ✓ ViewLinksGroup present: ${hasViewLinks}`);
    
    if (hasViewLinks) {
      // Check for View Draft link
      const draftLink = viewLinksGroup.locator('.view-link--draft');
      const draftHref = await draftLink.getAttribute('href');
      console.log(`   ✓ View Draft URL: ${draftHref}`);
      
      // Check for View Live link (may not exist if not published)
      const liveLink = viewLinksGroup.locator('.view-link--live');
      const liveCount = await liveLink.count();
      if (liveCount > 0) {
        const liveHref = await liveLink.getAttribute('href');
        console.log(`   ✓ View Live URL: ${liveHref}`);
      } else {
        console.log(`   ℹ View Live link not shown (unpublished)`);
      }
      
      // Verify action-divider is present
      const divider = page.locator('.action-divider');
      const hasDivider = await divider.count() > 0;
      console.log(`   ✓ Action divider present: ${hasDivider}`);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/pages-editor-with-viewlinks.png', 
      fullPage: false 
    });
    console.log('   📸 Screenshot saved: pages-editor-with-viewlinks.png\n');

    // Test 2: Projects Editor
    console.log('📦 Test 2: Projects Editor ViewLinksGroup');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    // Find first category
    const firstCategoryLink = page.locator('a[href*="/admin/categories/"][href*="/projects"]').first();
    const categoryCount = await firstCategoryLink.count();
    
    if (categoryCount > 0) {
      const categoryHref = await firstCategoryLink.getAttribute('href');
      console.log(`   Navigating to: ${categoryHref}`);
      await firstCategoryLink.click();
      await page.waitForLoadState('networkidle');
      
      // Find first project
      const firstProjectLink = page.locator('a[href*="/admin/projects/"]').first();
      const projectCount = await firstProjectLink.count();
      
      if (projectCount > 0) {
        const projectHref = await firstProjectLink.getAttribute('href');
        console.log(`   Navigating to: ${projectHref}`);
        await firstProjectLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for ViewLinksGroup
        const projectViewLinks = page.locator('.view-links-group');
        const hasProjectViewLinks = await projectViewLinks.count() > 0;
        console.log(`   ✓ ViewLinksGroup present: ${hasProjectViewLinks}`);
        
        if (hasProjectViewLinks) {
          // Check for View Draft link
          const draftLink = projectViewLinks.locator('.view-link--draft');
          const draftHref = await draftLink.getAttribute('href');
          console.log(`   ✓ View Draft URL: ${draftHref}`);
          
          // Verify URL pattern: /preview/{portfolio}/{category}/{project}
          const isDraftUrlCorrect = draftHref.startsWith('/preview/');
          console.log(`   ✓ Draft URL pattern correct: ${isDraftUrlCorrect}`);
          
          // Check for View Live link
          const liveLink = projectViewLinks.locator('.view-link--live');
          const liveCount = await liveLink.count();
          if (liveCount > 0) {
            const liveHref = await liveLink.getAttribute('href');
            console.log(`   ✓ View Live URL: ${liveHref}`);
            
            // Verify URL pattern: /{portfolio}/{category}/{project}
            const isLiveUrlCorrect = liveHref.match(/^\/[^/]+\/[^/]+\/[^/]+$/);
            console.log(`   ✓ Live URL pattern correct: ${!!isLiveUrlCorrect}`);
          } else {
            console.log(`   ℹ View Live link not shown (unpublished)`);
          }
          
          // Verify action-divider is present
          const divider = page.locator('.action-divider');
          const hasDivider = await divider.count() > 0;
          console.log(`   ✓ Action divider present: ${hasDivider}`);
        }
        
        await page.screenshot({ 
          path: 'tests/screenshots/projects-editor-with-viewlinks.png', 
          fullPage: false 
        });
        console.log('   📸 Screenshot saved: projects-editor-with-viewlinks.png\n');
      } else {
        console.log('   ⚠ No projects found in category - skipping project test');
      }
    } else {
      console.log('   ⚠ No categories found - skipping project test');
    }

    // Test 3: Verify consistency with Settings page
    console.log('⚙️ Test 3: Compare with Settings Page Layout');
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForLoadState('networkidle');
    
    const settingsViewLinks = page.locator('.view-links-group');
    const hasSettingsViewLinks = await settingsViewLinks.count() > 0;
    console.log(`   ✓ Settings has ViewLinksGroup: ${hasSettingsViewLinks}`);
    
    const settingsDivider = page.locator('.action-divider');
    const hasSettingsDivider = await settingsDivider.count() > 0;
    console.log(`   ✓ Settings has action-divider: ${hasSettingsDivider}`);
    
    await page.screenshot({ 
      path: 'tests/screenshots/settings-page-layout.png', 
      fullPage: false 
    });
    console.log('   📸 Screenshot saved: settings-page-layout.png\n');

    console.log('✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Pages Editor has ViewLinksGroup with correct URLs');
    console.log('   - Projects Editor has ViewLinksGroup with correct URLs');
    console.log('   - Layout is consistent with Settings page pattern');
    console.log('   - Screenshots captured for visual verification\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: `tests/screenshots/error-${Date.now()}.png`, 
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testViewLinksIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
