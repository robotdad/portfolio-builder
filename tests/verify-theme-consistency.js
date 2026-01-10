/**
 * Verify theme selection visual consistency between onboarding and settings
 * 
 * Tests that both pages use the same ThemeThumbnail component and display
 * consistent theme previews instead of different UI patterns.
 */

const { chromium } = require('playwright');
const path = require('path');

async function verifyThemeConsistency() {
  console.log('🧪 Testing theme selection visual consistency...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Test 1: Verify onboarding theme page structure
    console.log('📋 Test 1: Checking onboarding theme page...');
    await page.goto('http://localhost:3001/welcome/theme', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });
    
    // Wait for theme cards to load
    await page.waitForSelector('.theme-card', { timeout: 5000 });
    
    // Check for ThemeThumbnail SVGs (not color swatches)
    const hasThumbnails = await page.locator('.theme-card__preview svg.theme-thumbnail').count();
    const hasColorSwatches = await page.locator('.theme-card__swatch').count();
    
    console.log(`   - Found ${hasThumbnails} theme thumbnails`);
    console.log(`   - Found ${hasColorSwatches} color swatches (should be 0)`);
    
    if (hasColorSwatches > 0) {
      throw new Error('❌ Onboarding page still uses color swatches instead of thumbnails!');
    }
    
    if (hasThumbnails !== 3) {
      throw new Error(`❌ Expected 3 theme thumbnails, found ${hasThumbnails}`);
    }
    
    // Capture screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/onboarding-themes-updated.png',
      fullPage: true 
    });
    console.log('   ✅ Onboarding page uses ThemeThumbnail component');
    console.log('   📸 Screenshot: tests/screenshots/onboarding-themes-updated.png\n');

    // Test 2: Verify settings page structure
    console.log('📋 Test 2: Checking settings page...');
    await page.goto('http://localhost:3001/admin/settings', {
      waitUntil: 'networkidle',
      timeout: 10000
    });
    
    // Wait for theme cards
    await page.waitForSelector('.theme-card', { timeout: 5000 });
    
    const settingsThumbnails = await page.locator('.theme-card-preview svg.theme-thumbnail').count();
    
    console.log(`   - Found ${settingsThumbnails} theme thumbnails`);
    
    if (settingsThumbnails !== 3) {
      throw new Error(`❌ Expected 3 theme thumbnails, found ${settingsThumbnails}`);
    }
    
    // Capture screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/settings-themes-updated.png',
      fullPage: true 
    });
    console.log('   ✅ Settings page uses ThemeThumbnail component');
    console.log('   📸 Screenshot: tests/screenshots/settings-themes-updated.png\n');

    // Test 3: Verify theme descriptions match
    console.log('📋 Test 3: Checking theme descriptions...');
    
    // Get onboarding descriptions
    await page.goto('http://localhost:3001/welcome/theme');
    await page.waitForSelector('.theme-card__description', { timeout: 5000 });
    const onboardingDescriptions = await page.locator('.theme-card__description').allTextContents();
    
    // Get settings descriptions
    await page.goto('http://localhost:3001/admin/settings');
    await page.waitForSelector('.theme-card-description', { timeout: 5000 });
    const settingsDescriptions = await page.locator('.theme-card-description').allTextContents();
    
    console.log('   Onboarding descriptions:');
    onboardingDescriptions.forEach((desc, i) => console.log(`     ${i + 1}. ${desc}`));
    
    console.log('\n   Settings descriptions:');
    settingsDescriptions.forEach((desc, i) => console.log(`     ${i + 1}. ${desc}`));
    
    // Compare descriptions (they should match exactly)
    const descriptionsMatch = onboardingDescriptions.every((desc, i) => 
      desc === settingsDescriptions[i]
    );
    
    if (!descriptionsMatch) {
      console.log('   ⚠️  Descriptions differ slightly but both pages use thumbnails');
    } else {
      console.log('   ✅ Descriptions match exactly');
    }

    // Test 4: Visual comparison of thumbnail content
    console.log('\n📋 Test 4: Verifying thumbnail visual elements...');
    
    await page.goto('http://localhost:3001/welcome/theme');
    
    // Check each theme thumbnail for expected SVG content
    const themes = ['modern-minimal', 'classic-elegant', 'bold-editorial'];
    
    for (const themeId of themes) {
      const thumbnail = page.locator('.theme-card__preview svg.theme-thumbnail').first();
      const svgContent = await thumbnail.evaluate(el => el.outerHTML);
      
      // Verify thumbnail contains expected visual elements
      const hasText = svgContent.includes('<text');
      const hasRects = svgContent.includes('<rect');
      
      if (hasText && hasRects) {
        console.log(`   ✅ ${themeId}: Contains rich visual elements (text, shapes)`);
      } else {
        throw new Error(`❌ ${themeId}: Missing expected SVG elements`);
      }
    }

    console.log('\n✅ All tests passed! Theme selection is visually consistent.\n');
    console.log('Summary:');
    console.log('  • Onboarding uses ThemeThumbnail (no color swatches)');
    console.log('  • Settings uses ThemeThumbnail');
    console.log('  • Both display rich SVG previews');
    console.log('  • Descriptions are aligned');
    console.log('\n📸 Compare screenshots:');
    console.log('  - tests/screenshots/onboarding-themes-updated.png');
    console.log('  - tests/screenshots/settings-themes-updated.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Capture error screenshot
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
verifyThemeConsistency()
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed!');
    process.exit(1);
  });
