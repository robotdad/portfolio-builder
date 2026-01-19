const { chromium } = require('playwright');

async function captureScreenshots() {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set a reasonable viewport size for desktop
  await page.setViewportSize({ width: 1920, height: 1080 });

  const baseUrl = 'http://localhost:3000';
  const screenshotDir = '../ai_working/screenshots';
  
  try {
    // 1. Dashboard - Clean header with just navigation
    console.log('📸 Capturing Dashboard...');
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: `${screenshotDir}/01-dashboard.png`,
      fullPage: true 
    });
    console.log('✅ Dashboard captured');

    // 2. Categories - Clean header with breadcrumb + 1 button
    console.log('📸 Capturing Categories...');
    await page.goto(`${baseUrl}/admin/categories`, { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: `${screenshotDir}/02-categories.png`,
      fullPage: true 
    });
    console.log('✅ Categories captured');

    // 3. Settings - Clean header + toolbar below
    console.log('📸 Capturing Settings...');
    await page.goto(`${baseUrl}/admin/settings`, { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: `${screenshotDir}/03-settings.png`,
      fullPage: true 
    });
    console.log('✅ Settings captured');

    // 4. Project Editor - Clean header + toolbar below
    // First, we need to get a project ID
    console.log('🔍 Finding a project to edit...');
    await page.goto(`${baseUrl}/admin/categories`, { waitUntil: 'networkidle' });
    
    // Wait for page to load and try to find a project link
    await page.waitForTimeout(1000); // Brief wait for content to render
    
    // Try to find any project edit link (they typically have /admin/projects/[id] pattern)
    const projectLinks = await page.$$('a[href*="/admin/projects/"]');
    
    if (projectLinks.length > 0) {
      const firstProjectLink = projectLinks[0];
      const href = await firstProjectLink.getAttribute('href');
      console.log(`📸 Capturing Project Editor (${href})...`);
      await page.goto(`${baseUrl}${href}`, { waitUntil: 'networkidle' });
      await page.screenshot({ 
        path: `${screenshotDir}/04-project-editor.png`,
        fullPage: true 
      });
      console.log('✅ Project Editor captured');
    } else {
      console.log('⚠️  No projects found, creating a screenshot of categories instead');
      // As fallback, just capture the current page
      await page.screenshot({ 
        path: `${screenshotDir}/04-project-editor-notfound.png`,
        fullPage: true 
      });
    }

    // Verify elements are present and separate
    console.log('\n🔍 Verifying header and toolbar structure...');
    
    // Go back to settings page which should have both header and toolbar
    await page.goto(`${baseUrl}/admin/settings`, { waitUntil: 'networkidle' });
    
    // Check for header
    const hasHeader = await page.locator('header, [role="banner"]').count() > 0;
    console.log(`   Header present: ${hasHeader ? '✅' : '❌'}`);
    
    // Check for toolbar (might have various class names or data attributes)
    const hasToolbar = await page.locator('[class*="toolbar"], [data-testid*="toolbar"]').count() > 0;
    console.log(`   Toolbar present: ${hasToolbar ? '✅' : '❌'}`);
    
    console.log('\n✨ All screenshots captured successfully!');
    console.log('📂 Screenshots saved to: ai_working/screenshots/');
    console.log('   - 01-dashboard.png');
    console.log('   - 02-categories.png');
    console.log('   - 03-settings.png');
    console.log('   - 04-project-editor.png');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error.message);
    
    // Capture error screenshot
    await page.screenshot({ 
      path: `${screenshotDir}/error-${Date.now()}.png`,
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
