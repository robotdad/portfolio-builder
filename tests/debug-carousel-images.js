const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 Investigating carousel image display issue...\n');

    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');

    // Click on a page with carousel (assume "Home" or first page)
    const firstPageLink = page.locator('[href*="/admin/pages/"]').first();
    if (await firstPageLink.count() > 0) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✓ Navigated to page editor');
    } else {
      console.log('❌ No pages found');
      await browser.close();
      return;
    }

    // Look for carousel editor on the page
    const carouselEditor = page.locator('.section-editor-featured-carousel');
    if (await carouselEditor.count() === 0) {
      console.log('⚠️  No carousel section found on this page');
      await browser.close();
      return;
    }
    
    console.log('✓ Found carousel editor section\n');

    // Check carousel items
    const carouselItems = page.locator('.featured-item-editor');
    const itemCount = await carouselItems.count();
    
    console.log(`📊 Found ${itemCount} carousel items\n`);

    if (itemCount === 0) {
      console.log('⚠️  No carousel items to inspect');
      await browser.close();
      return;
    }

    // Inspect each carousel item
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      const item = carouselItems.nth(i);
      
      // Check the preview thumbnail in header
      const previewThumb = item.locator('.featured-item-preview-thumb');
      const thumbExists = await previewThumb.count() > 0;
      
      console.log(`\n🔍 Carousel Item ${i + 1}:`);
      console.log(`   Preview thumbnail exists: ${thumbExists}`);
      
      if (thumbExists) {
        const src = await previewThumb.getAttribute('src');
        const display = await previewThumb.evaluate(el => window.getComputedStyle(el).display);
        const opacity = await previewThumb.evaluate(el => window.getComputedStyle(el).opacity);
        const width = await previewThumb.evaluate(el => window.getComputedStyle(el).width);
        const height = await previewThumb.evaluate(el => window.getComputedStyle(el).height);
        
        console.log(`   - src: ${src ? src.substring(0, 60) + '...' : 'NULL/EMPTY'}`);
        console.log(`   - display: ${display}`);
        console.log(`   - opacity: ${opacity}`);
        console.log(`   - computed size: ${width} x ${height}`);
      }
      
      // Check if item is expanded
      const isExpanded = await item.locator('.featured-item-toggle').getAttribute('aria-expanded');
      console.log(`   Expanded: ${isExpanded}`);
      
      if (isExpanded === 'true') {
        // Check the main image preview
        const imagePreview = item.locator('.featured-item-image-preview');
        if (await imagePreview.count() > 0) {
          const mainImg = imagePreview.locator('img');
          if (await mainImg.count() > 0) {
            const mainSrc = await mainImg.getAttribute('src');
            console.log(`   Main image src: ${mainSrc ? mainSrc.substring(0, 60) + '...' : 'NULL/EMPTY'}`);
          } else {
            console.log(`   ❌ Main image element NOT FOUND`);
          }
        } else {
          console.log(`   ⚠️  No image preview container (might be upload area)`);
        }
      }
    }

    // Take screenshot of carousel section
    await page.screenshot({ 
      path: 'ai_working/DEBUG-carousel-images.png',
      fullPage: true 
    });
    console.log('\n✓ Screenshot saved: ai_working/DEBUG-carousel-images.png');

    // Check if there's a multi-image picker button
    const multiImageBtn = page.getByRole('button', { name: /Add Multiple from Gallery/i });
    if (await multiImageBtn.count() > 0) {
      console.log('\n🔍 Testing multi-image picker flow...');
      
      // Click to open picker
      await multiImageBtn.click();
      await page.waitForTimeout(1000); // Wait for modal animation
      
      // Check if modal opened
      const modal = page.locator('.image-picker-modal');
      if (await modal.isVisible()) {
        console.log('✓ Multi-image picker modal opened');
        
        // Check image grid
        const imageItems = page.locator('.image-picker-grid .image-item');
        const imageCount = await imageItems.count();
        console.log(`   Found ${imageCount} images in picker`);
        
        if (imageCount > 0) {
          // Check first image
          const firstImg = imageItems.first().locator('img');
          const imgSrc = await firstImg.getAttribute('src');
          const imgOpacity = await firstImg.evaluate(el => window.getComputedStyle(el).opacity);
          const parentOpacity = await imageItems.first().evaluate(el => window.getComputedStyle(el).opacity);
          
          console.log(`   First image src: ${imgSrc ? imgSrc.substring(0, 60) + '...' : 'NULL'}`);
          console.log(`   Image opacity: ${imgOpacity}`);
          console.log(`   Parent button opacity: ${parentOpacity}`);
          
          // Take screenshot of picker
          await page.screenshot({ 
            path: 'ai_working/DEBUG-picker-modal.png',
            fullPage: true 
          });
          console.log('✓ Picker modal screenshot saved');
        }
        
        // Close modal
        const cancelBtn = page.getByRole('button', { name: /Cancel/i });
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'ai_working/DEBUG-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
