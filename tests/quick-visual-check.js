const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Quick visual verification of multi-select changes...\n');

    // Go directly to admin
    console.log('1. Loading admin dashboard...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 10000 });
    await page.screenshot({ path: 'tests/screenshots/admin-loaded.png', fullPage: true });
    console.log('   ✓ Admin loaded');

    // Try to find and open category image picker (single-select mode - backward compatibility test)
    console.log('\n2. Testing single-select mode (Categories)...');
    try {
      await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'networkidle', timeout: 10000 });
      
      // Look for New Category button or existing category
      const newCatButton = page.getByRole('button', { name: /new category/i });
      if (await newCatButton.isVisible({ timeout: 2000 })) {
        await newCatButton.click();
        await page.waitForTimeout(500);
        
        // Try to open image picker
        const imageButton = page.locator('button, [role="button"]').filter({ hasText: /choose.*image|featured.*image|select.*image/i }).first();
        if (await imageButton.isVisible({ timeout: 2000 })) {
          await imageButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'tests/screenshots/single-select-mode.png', fullPage: true });
          console.log('   ✓ Single-select mode captured');
          
          // Close modal
          const cancel = page.getByRole('button', { name: /cancel|close/i }).first();
          if (await cancel.isVisible({ timeout: 1000 })) {
            await cancel.click();
          }
        }
      }
    } catch (e) {
      console.log('   ⚠ Could not capture single-select mode:', e.message);
    }

    // Try to find a project with gallery/carousel
    console.log('\n3. Looking for project editor with carousel...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Expand Projects in nav if needed
    const projectsNav = page.locator('nav').getByText(/projects/i).first();
    if (await projectsNav.isVisible({ timeout: 2000 })) {
      await projectsNav.click();
      await page.waitForTimeout(300);
    }
    
    // Find first project link
    const projectLink = page.locator('nav a[href*="/admin/projects/"]').first();
    if (await projectLink.isVisible({ timeout: 2000 })) {
      await projectLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'tests/screenshots/project-editor.png', fullPage: true });
      console.log('   ✓ Project editor loaded');
      
      // Look for carousel or gallery section
      const addMultiButton = page.getByRole('button', { name: /add multiple|multiple.*gallery/i }).first();
      if (await addMultiButton.isVisible({ timeout: 2000 })) {
        console.log('   ✓ Found "Add Multiple" button - clicking...');
        await addMultiButton.click();
        await page.waitForTimeout(1500);
        
        await page.screenshot({ path: 'tests/screenshots/multi-select-modal.png', fullPage: true });
        console.log('   ✓ Multi-select modal captured');
        
        // Try to select a few images
        const thumbnails = page.locator('.image-picker-grid img, .image-picker-grid [role="gridcell"]').first();
        if (await thumbnails.isVisible({ timeout: 2000 })) {
          await thumbnails.click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ path: 'tests/screenshots/one-image-selected.png', fullPage: true });
          console.log('   ✓ One image selected');
          
          // Capture close-up of grid area
          const grid = page.locator('.image-picker-grid').first();
          if (await grid.isVisible({ timeout: 1000 })) {
            await grid.screenshot({ path: 'tests/screenshots/grid-closeup.png' });
            console.log('   ✓ Grid close-up captured');
          }
        }
      } else {
        console.log('   ⚠ No "Add Multiple" button found');
      }
    } else {
      console.log('   ⚠ No project links found');
    }

    console.log('\n✅ Visual capture complete!');
    console.log('\nScreenshots saved:');
    console.log('  - tests/screenshots/admin-loaded.png');
    console.log('  - tests/screenshots/single-select-mode.png (if found)');
    console.log('  - tests/screenshots/project-editor.png');
    console.log('  - tests/screenshots/multi-select-modal.png (if found)');
    console.log('  - tests/screenshots/one-image-selected.png (if found)');
    console.log('  - tests/screenshots/grid-closeup.png (if found)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
