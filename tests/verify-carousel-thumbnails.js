const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 VERIFYING CAROUSEL THUMBNAIL DISPLAY\n');
    console.log('==========================================\n');

    // Navigate to admin
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    
    // Find first page link
    const firstPageLink = page.locator('a[href*="/admin/pages/"]').first();
    if (await firstPageLink.count() === 0) {
      console.log('❌ No pages found');
      await browser.close();
      return;
    }

    await firstPageLink.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Navigated to page editor\n');

    // Check for carousel section, create if needed
    let carousel = page.locator('.section-editor-featured-carousel');
    if (await carousel.count() === 0) {
      console.log('Creating carousel section...');
      const addBtn = page.getByRole('button', { name: /Add Section/i });
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await page.getByText('Featured Carousel').click();
        await page.waitForTimeout(1000);
        console.log('✓ Created carousel section\n');
      }
    }

    // BEFORE: Check existing items
    const beforeCount = await page.locator('.featured-item-editor').count();
    console.log(`📊 BEFORE: ${beforeCount} carousel items\n`);

    if (beforeCount > 0) {
      console.log('Checking existing thumbnails:');
      for (let i = 0; i < Math.min(beforeCount, 3); i++) {
        const item = page.locator('.featured-item-editor').nth(i);
        const thumb = item.locator('.featured-item-preview-thumb');
        const hasThumb = await thumb.count() > 0;
        
        if (hasThumb) {
          const src = await thumb.getAttribute('src');
          const visible = await thumb.isVisible();
          console.log(`  Item ${i + 1}: ${visible ? '✓' : '❌'} visible, src: ${src ? src.substring(0, 40) + '...' : 'NULL'}`);
        } else {
          console.log(`  Item ${i + 1}: ❌ No thumbnail element`);
        }
      }
      console.log();
    }

    // Take BEFORE screenshot
    await page.screenshot({ 
      path: 'ai_working/CAROUSEL-BEFORE-adding.png',
      fullPage: true 
    });
    console.log('✓ Screenshot: CAROUSEL-BEFORE-adding.png\n');

    // Open multi-image picker
    console.log('Opening multi-image picker...');
    const multiBtn = page.getByRole('button', { name: /Add Multiple from Gallery/i });
    await multiBtn.click();
    await page.waitForTimeout(1500);

    // Wait for modal to be visible
    const modal = page.locator('.image-picker-modal');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Picker modal opened\n');

    // Take PICKER screenshot
    await page.screenshot({ 
      path: 'ai_working/PICKER-with-opacity-fix.png',
      fullPage: true 
    });
    console.log('✓ Screenshot: PICKER-with-opacity-fix.png\n');

    // Select 2 images
    const imageItems = page.locator('.image-picker-grid .image-item');
    const imageCount = await imageItems.count();
    
    if (imageCount < 2) {
      console.log('❌ Not enough images in gallery');
      await browser.close();
      return;
    }

    console.log(`Selecting first 2 images from ${imageCount} available...`);
    await imageItems.nth(0).click();
    await page.waitForTimeout(300);
    await imageItems.nth(1).click();
    await page.waitForTimeout(300);
    console.log('✓ Selected 2 images\n');

    // Take SELECTED screenshot
    await page.screenshot({ 
      path: 'ai_working/PICKER-with-selection.png',
      fullPage: true 
    });
    console.log('✓ Screenshot: PICKER-with-selection.png\n');

    // Confirm selection
    console.log('Confirming selection...');
    const confirmBtn = page.getByRole('button', { name: /Add \d+ Image/i });
    await confirmBtn.click();
    await page.waitForTimeout(2000); // Wait for items to be added
    console.log('✓ Confirmed\n');

    // AFTER: Check new items
    const afterCount = await page.locator('.featured-item-editor').count();
    const addedCount = afterCount - beforeCount;
    console.log(`📊 AFTER: ${afterCount} carousel items (+${addedCount} new)\n`);

    if (addedCount === 0) {
      console.log('❌ NO NEW ITEMS WERE ADDED!');
      await page.screenshot({ 
        path: 'ai_working/ERROR-no-items-added.png',
        fullPage: true 
      });
      await browser.close();
      return;
    }

    // Check all thumbnails
    console.log('Checking ALL carousel item thumbnails:\n');
    const items = page.locator('.featured-item-editor');
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < afterCount; i++) {
      const item = items.nth(i);
      const thumb = item.locator('.featured-item-preview-thumb');
      const hasThumb = await thumb.count() > 0;
      
      const isNew = i >= beforeCount;
      const label = isNew ? '🆕 NEW' : '    OLD';
      
      if (hasThumb) {
        const src = await thumb.getAttribute('src');
        const visible = await thumb.isVisible();
        
        if (visible && src) {
          successCount++;
          console.log(`  ${label} Item ${i + 1}: ✓ Thumbnail visible`);
          console.log(`              src: ${src.substring(0, 60)}...`);
        } else {
          failCount++;
          console.log(`  ${label} Item ${i + 1}: ❌ Thumbnail has issues`);
          console.log(`              visible: ${visible}, src: ${src || 'NULL'}`);
        }
      } else {
        failCount++;
        console.log(`  ${label} Item ${i + 1}: ❌ NO thumbnail element in DOM`);
        
        // Debug: check item data
        const itemTitle = await item.locator('.featured-item-preview-title').textContent();
        console.log(`              title: "${itemTitle}"`);
      }
    }

    // Take AFTER screenshot
    await page.screenshot({ 
      path: 'ai_working/CAROUSEL-AFTER-adding.png',
      fullPage: true 
    });
    console.log('\n✓ Screenshot: CAROUSEL-AFTER-adding.png\n');

    // Final report
    console.log('==========================================');
    console.log('FINAL RESULTS:');
    console.log(`  ✓ Thumbnails working: ${successCount}`);
    console.log(`  ❌ Thumbnails broken: ${failCount}`);
    console.log(`  Total items: ${afterCount}`);
    
    if (failCount > 0) {
      console.log('\n❌ BUG CONFIRMED: Some items missing thumbnails!');
    } else {
      console.log('\n✅ SUCCESS: All items have working thumbnails!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    await page.screenshot({ 
      path: 'ai_working/ERROR-verification.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();
