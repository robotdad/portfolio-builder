const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to admin settings page...');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle' });
    
    // Wait for the theme selector to be visible
    await page.waitForSelector('.theme-selector', { state: 'visible', timeout: 10000 });
    console.log('Theme selector loaded');
    
    // Wait for fonts to load (important for typography to display correctly)
    await page.waitForTimeout(1500);
    
    // Capture full theme selector
    console.log('Capturing full theme selector...');
    const themeSelector = page.locator('.theme-selector');
    await themeSelector.screenshot({ 
      path: 'tests/screenshots/theme-selector-with-actual-colors.png' 
    });
    
    // Capture individual theme cards for detailed view
    const themeCards = await page.locator('.theme-card').all();
    console.log(`Found ${themeCards.length} theme cards`);
    
    for (let i = 0; i < themeCards.length; i++) {
      const card = themeCards[i];
      const themeName = await card.locator('.theme-card-name').textContent();
      const fileName = themeName.toLowerCase().replace(/\s+/g, '-');
      
      console.log(`Capturing ${themeName} thumbnail...`);
      await card.screenshot({ 
        path: `tests/screenshots/theme-card-${fileName}.png` 
      });
    }
    
    // Capture just the thumbnails (the SVG previews)
    const thumbnails = await page.locator('.theme-thumbnail').all();
    for (let i = 0; i < thumbnails.length; i++) {
      const thumbnail = thumbnails[i];
      const parentCard = thumbnail.locator('..').locator('..');
      const themeName = await parentCard.locator('.theme-card-name').textContent();
      const fileName = themeName.toLowerCase().replace(/\s+/g, '-');
      
      console.log(`Capturing ${themeName} thumbnail detail...`);
      await thumbnail.screenshot({ 
        path: `tests/screenshots/thumbnail-${fileName}.png` 
      });
    }
    
    console.log('\n✅ Screenshots captured successfully!');
    console.log('\n📁 Screenshots saved:');
    console.log('  - tests/screenshots/theme-selector-with-actual-colors.png (full selector)');
    console.log('  - tests/screenshots/theme-card-modern-minimal.png');
    console.log('  - tests/screenshots/theme-card-classic-elegant.png');
    console.log('  - tests/screenshots/theme-card-bold-editorial.png');
    console.log('  - tests/screenshots/thumbnail-modern-minimal.png (detail)');
    console.log('  - tests/screenshots/thumbnail-classic-elegant.png (detail)');
    console.log('  - tests/screenshots/thumbnail-bold-editorial.png (detail)');
    
    console.log('\n📋 Visual verification checklist:');
    console.log('\n🎨 Modern Minimal should show:');
    console.log('  ✓ Cool blue-gray background (hsl(210, 15%, 97%))');
    console.log('  ✓ Lighter surface card (hsl(210, 12%, 95%))');
    console.log('  ✓ Vibrant blue accent button (hsl(220, 90%, 56%))');
    console.log('  ✓ "Portfolio" heading in Playfair Display serif, semibold');
    console.log('  ✓ Body text in Inter sans-serif');
    console.log('  ✓ Rounded corners (rx=3-4) on button and card');
    
    console.log('\n🎨 Classic Elegant should show:');
    console.log('  ✓ Warm cream background (hsl(40, 30%, 95%))');
    console.log('  ✓ Warm surface (hsl(40, 25%, 93%))');
    console.log('  ✓ Rich terracotta accent button (hsl(25, 60%, 45%))');
    console.log('  ✓ "Portfolio" heading in Playfair Display serif, lighter (400 weight)');
    console.log('  ✓ Body text in Source Sans 3');
    console.log('  ✓ LARGER font sizes compared to Modern');
    console.log('  ✓ Subtle rounded corners (rx=1.5-2)');
    console.log('  ✓ Decorative serif element and elegant divider');
    
    console.log('\n🎨 Bold Editorial should show:');
    console.log('  ✓ Nearly black background (hsl(0, 0%, 5%))');
    console.log('  ✓ Dark surface (hsl(0, 0%, 10%))');
    console.log('  ✓ Hot pink accent button (hsl(340, 85%, 55%))');
    console.log('  ✓ "PORTFOLIO" heading in Sora sans-serif, bold (700)');
    console.log('  ✓ Body text in Geist Sans');
    console.log('  ✓ High contrast: white text on dark background');
    console.log('  ✓ Sharp corners (rx=0) - NO rounding');
    console.log('  ✓ Pink accent bar decoration');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: `tests/screenshots/error-${Date.now()}.png`, 
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
})();
