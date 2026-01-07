const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 Reproducing user\'s carousel image problem...\n');

    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');

    // Expand Pages nav
    const pagesNav = page.locator('nav').getByText('Pages');
    if (await pagesNav.count() > 0) {
      await pagesNav.click();
      await page.waitForTimeout(500);
    }

    // Find first page with carousel (likely Home or About)
    const pageLinks = await page.locator('[href*="/admin/pages/"]').all();
    let foundCarousel = false;

    for (const link of pageLinks) {
      await link.click();
      await page.waitForLoadState('networkidle');
      
      // Check if this page has a carousel section
      const carouselSection = page.locator('.section-editor-featured-carousel');
      if (await carouselSection.count() > 0) {
        foundCarousel = true;
        console.log('✓ Found page with carousel section\n');
        break;
      }
    }

    if (!foundCarousel) {
      console.log('⚠️  No existing carousel found. Creating one...');
      
      // Add a carousel section
      const addSectionBtn = page.getByRole('button', { name: /Add Section/i });
      if (await addSectionBtn.count() > 0) {
        await addSectionBtn.click();
        await page.waitForTimeout(500);
        
        const carouselOption = page.getByText('Featured Carousel');
        if (await carouselOption.count() > 0) {
          await carouselOption.click();
          await page.waitForTimeout(1000);
          console.log('✓ Created carousel section\n');
        }
      }
    }

    // Now we should have a carousel section
    const carouselSection = page.locator('.section-editor-featured-carousel');
    const itemCount = await page.locator('.featured-item-editor').count();
    console.log(`📊 Current carousel items: ${itemCount}\n`);

    // Check existing items BEFORE adding new ones
    if (itemCount > 0) {
      console.log('🔍 BEFORE adding new items:');
      const items = page.locator('.featured-item-editor');
      
      for (let i = 0; i < Math.min(itemCount, 3); i++) {
        const item = items.nth(i);
        const thumb = item.locator('.featured-item-preview-thumb');
        const thumbExists = await thumb.count() > 0;
        
        console.log(`   Item ${i + 1}:`);
        console.log(`      - Thumbnail exists: ${thumbExists}`);
        
        if (thumbExists) {
          const src = await thumb.getAttribute('src');
          const visible = await thumb.isVisible();
          console.log(`      - src: ${src ? src.substring(0, 50) + '...' : 'NULL'}`);
          console.log(`      - visible: ${visible}`);
        }
      }
      console.log('');
    }

    // Click "Add Multiple from Gallery" button
    const multiSelectBtn = page.getByRole('button', { name: /Add Multiple from Gallery/i });
    if (await multiSelectBtn.count() === 0) {
      console.log('❌ Cannot find "Add Multiple from Gallery" button');
      await page.screenshot({ path: 'ai_working/ERROR-no-button.png', fullPage: true });
      await browser.close();
      return;
    }

    await multiSelectBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ Opened multi-image picker modal\n');

    // Check picker modal state
    const modal = page.locator('.image-picker-modal');
    if (!await modal.isVisible()) {
      console.log('❌ Modal did not open');
      await browser.close();
      return;
    }

    // Inspect images in picker
    const pickerImages = page.locator('.image-picker-grid .image-item');
    const pickerImageCount = await pickerImages.count();
    console.log(`📊 Images in picker: ${pickerImageCount}\n`);

    if (pickerImageCount > 0) {
      console.log('🔍 PICKER IMAGES STATE:');
      
      // Check first 3 images
      for (let i = 0; i < Math.min(pickerImageCount, 3); i++) {
        const imageItem = pickerImages.nth(i);
        const img = imageItem.locator('img');
        
        const src = await img.getAttribute('src');
        const imgOpacity = await img.evaluate(el => getComputedStyle(el).opacity);
        const btnOpacity = await imageItem.evaluate(el => getComputedStyle(el).opacity);
        const isDisabled = await imageItem.getAttribute('disabled');
        const hasDisabledClass = await imageItem.evaluate(el => el.classList.contains('disabled'));
        
        console.log(`   Image ${i + 1}:`);
        console.log(`      - src: ${src ? src.substring(0, 50) + '...' : 'NULL'}`);
        console.log(`      - img opacity: ${imgOpacity}`);
        console.log(`      - button opacity: ${btnOpacity}`);
        console.log(`      - disabled attr: ${isDisabled !== null}`);
        console.log(`      - .disabled class: ${hasDisabledClass}`);
      }
      console.log('');

      // Take screenshot of picker BEFORE selection
      await page.screenshot({ 
        path: 'ai_working/PICKER-before-selection.png',
        fullPage: true 
      });
      console.log('✓ Screenshot: PICKER-before-selection.png\n');
    }

    // Select first 2 images
    if (pickerImageCount >= 2) {
      console.log('🖱️  Selecting 2 images...');
      await pickerImages.nth(0).click();
      await page.waitForTimeout(300);
      await pickerImages.nth(1).click();
      await page.waitForTimeout(300);
      console.log('✓ Selected 2 images\n');

      // Take screenshot AFTER selection
      await page.screenshot({ 
        path: 'ai_working/PICKER-after-selection.png',
        fullPage: true 
      });
      console.log('✓ Screenshot: PICKER-after-selection.png\n');

      // Click Confirm
      const confirmBtn = page.getByRole('button', { name: /Confirm/i });
      await confirmBtn.click();
      await page.waitForTimeout(1000);
      console.log('✓ Clicked Confirm\n');
    }

    // Check carousel items AFTER adding
    await page.waitForTimeout(500);
    const newItemCount = await page.locator('.featured-item-editor').count();
    console.log(`📊 Carousel items after adding: ${newItemCount}\n`);

    console.log('🔍 AFTER adding images:');
    const items = page.locator('.featured-item-editor');
    
    for (let i = 0; i < Math.min(newItemCount, 5); i++) {
      const item = items.nth(i);
      const thumb = item.locator('.featured-item-preview-thumb');
      const thumbExists = await thumb.count() > 0;
      
      console.log(`   Item ${i + 1}:`);
      console.log(`      - Thumbnail exists: ${thumbExists}`);
      
      if (thumbExists) {
        const src = await thumb.getAttribute('src');
        const visible = await thumb.isVisible();
        const display = await thumb.evaluate(el => getComputedStyle(el).display);
        const opacity = await thumb.evaluate(el => getComputedStyle(el).opacity);
        const width = await thumb.evaluate(el => getComputedStyle(el).width);
        
        console.log(`      - src: ${src ? src.substring(0, 50) + '...' : 'NULL/EMPTY ❌'}`);
        console.log(`      - visible: ${visible}`);
        console.log(`      - display: ${display}`);
        console.log(`      - opacity: ${opacity}`);
        console.log(`      - width: ${width}`);
      } else {
        console.log(`      - ❌ NO THUMBNAIL ELEMENT IN DOM`);
        
        // Check what the item data actually has
        const itemData = await item.evaluate(el => {
          const toggle = el.querySelector('.featured-item-toggle');
          const img = toggle ? toggle.querySelector('img') : null;
          return {
            hasToggle: !!toggle,
            hasImg: !!img,
            imgSrc: img ? img.getAttribute('src') : null
          };
        });
        console.log(`      - Item structure:`, itemData);
      }
    }
    console.log('');

    // Take final screenshot
    await page.screenshot({ 
      path: 'ai_working/CAROUSEL-final-state.png',
      fullPage: true 
    });
    console.log('✓ Screenshot: CAROUSEL-final-state.png\n');

    console.log('✅ Diagnostic complete. Check screenshots in ai_working/');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'ai_working/ERROR-diagnostic.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
