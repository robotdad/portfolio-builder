const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));

  try {
    console.log('🔍 DIAGNOSING CAROUSEL IMAGE BUG\n');
    console.log('==========================================\n');

    // 1. Check API response
    console.log('STEP 1: Checking /api/images endpoint...');
    const portfolios = await page.request.get('http://localhost:3000/api/portfolios');
    const portfoliosData = await portfolios.json();
    
    if (!portfoliosData.data || portfoliosData.data.length === 0) {
      console.log('❌ No portfolios found. Cannot test.');
      await browser.close();
      return;
    }

    const portfolioId = portfoliosData.data[0].id;
    console.log(`✓ Using portfolio: ${portfolioId}\n`);

    const imagesResp = await page.request.get(`http://localhost:3000/api/images?portfolioId=${portfolioId}`);
    const imagesData = await imagesResp.json();

    if (!imagesData.success || !imagesData.data || !imagesData.data.images) {
      console.log('❌ API returned invalid response');
      console.log(JSON.stringify(imagesData, null, 2));
      await browser.close();
      return;
    }

    const images = imagesData.data.images;
    console.log(`✓ API returned ${images.length} images\n`);

    if (images.length === 0) {
      console.log('⚠️  No images available. Upload images first.');
      await browser.close();
      return;
    }

    // Check first 3 images for url field
    console.log('STEP 2: Checking image data structure...');
    for (let i = 0; i < Math.min(3, images.length); i++) {
      const img = images[i];
      console.log(`\nImage ${i + 1}:`);
      console.log(`  id: ${img.id}`);
      console.log(`  filename: ${img.filename}`);
      console.log(`  url: ${img.url ? '✓ ' + img.url.substring(0, 50) + '...' : '❌ MISSING/NULL'}`);
      console.log(`  thumbnailUrl: ${img.thumbnailUrl ? '✓ ' + img.thumbnailUrl.substring(0, 50) + '...' : '❌ MISSING/NULL'}`);
    }

    if (!images[0].url) {
      console.log('\n❌ FOUND THE BUG: API images have NO url field!');
      console.log('   The API is not returning image.url');
      console.log('   When carousel items are created with imageUrl: image.url,');
      console.log('   they get imageUrl: undefined, so no thumbnails show!');
      await browser.close();
      return;
    }

    console.log('\n✓ API images have valid url fields\n');

    // 2. Navigate to admin and find carousel
    console.log('STEP 3: Opening admin panel...');
    await page.goto(`http://localhost:3000/admin`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Find pages link
    const pagesLink = page.locator('a[href*="/admin/pages"]').first();
    if (await pagesLink.count() === 0) {
      console.log('❌ No pages found in admin');
      await browser.close();
      return;
    }

    await pagesLink.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Navigated to page editor\n');

    // Check if carousel section exists
    let carouselExists = await page.locator('.section-editor-featured-carousel').count() > 0;
    
    if (!carouselExists) {
      console.log('No carousel found. Creating one...');
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
    } else {
      console.log('✓ Found existing carousel section\n');
    }

    // Count current carousel items
    const itemCount = await page.locator('.featured-item-editor').count();
    console.log(`Current carousel items: ${itemCount}\n`);

    // 3. Test multi-image picker flow
    console.log('STEP 4: Testing multi-image picker...');
    const multiBtn = page.getByRole('button', { name: /Add Multiple from Gallery/i });
    if (await multiBtn.count() === 0) {
      console.log('❌ "Add Multiple from Gallery" button not found');
      await browser.close();
      return;
    }

    await multiBtn.click();
    await page.waitForTimeout(1500);
    console.log('✓ Opened image picker modal\n');

    // Check if modal opened
    const modal = page.locator('.image-picker-modal');
    if (!await modal.isVisible()) {
      console.log('❌ Modal did not open');
      await browser.close();
      return;
    }

    // Check picker grid images
    const pickerImages = page.locator('.image-picker-grid .image-item');
    const pickerCount = await pickerImages.count();
    console.log(`✓ Picker shows ${pickerCount} images\n`);

    if (pickerCount === 0) {
      console.log('❌ No images in picker');
      await browser.close();
      return;
    }

    // 4. Select first 2 images
    console.log('STEP 5: Selecting 2 images...');
    await pickerImages.nth(0).click();
    await page.waitForTimeout(300);
    await pickerImages.nth(1).click();
    await page.waitForTimeout(300);
    console.log('✓ Selected 2 images\n');

    // 5. Click confirm
    console.log('STEP 6: Confirming selection...');
    const confirmBtn = page.getByRole('button', { name: /Add \d+ Image/i });
    await confirmBtn.click();
    await page.waitForTimeout(2000); // Wait for items to be created
    console.log('✓ Clicked confirm\n');

    // 6. Check carousel items after adding
    console.log('STEP 7: Checking carousel items after adding...');
    const newItemCount = await page.locator('.featured-item-editor').count();
    console.log(`Carousel now has ${newItemCount} items (was ${itemCount})\n`);

    if (newItemCount <= itemCount) {
      console.log('❌ NO NEW ITEMS WERE ADDED!');
      console.log('   The handleMultiImageSelect callback may not be firing');
      console.log('   OR the items are being created without imageUrl');
    }

    // Check thumbnails in carousel items
    console.log('STEP 8: Checking thumbnails in carousel items...');
    const items = page.locator('.featured-item-editor');
    
    let itemsWithThumbs = 0;
    let itemsWithoutThumbs = 0;

    for (let i = 0; i < await items.count(); i++) {
      const item = items.nth(i);
      const thumb = item.locator('.featured-item-preview-thumb');
      const hasThumb = await thumb.count() > 0;
      
      if (hasThumb) {
        const src = await thumb.getAttribute('src');
        if (src) {
          itemsWithThumbs++;
          console.log(`  Item ${i + 1}: ✓ Has thumbnail (${src.substring(0, 40)}...)`);
        } else {
          itemsWithoutThumbs++;
          console.log(`  Item ${i + 1}: ❌ Thumb element exists but src is empty`);
        }
      } else {
        itemsWithoutThumbs++;
        console.log(`  Item ${i + 1}: ❌ NO thumbnail element in DOM`);
      }
    }

    console.log(`\n==========================================`);
    console.log(`RESULTS:`);
    console.log(`  Items with thumbnails: ${itemsWithThumbs}`);
    console.log(`  Items WITHOUT thumbnails: ${itemsWithoutThumbs}`);
    
    if (itemsWithoutThumbs > 0) {
      console.log(`\n❌ BUG CONFIRMED: Carousel items missing thumbnails!`);
    } else {
      console.log(`\n✓ All carousel items have thumbnails`);
    }

    // Capture console logs
    if (logs.length > 0) {
      console.log(`\nConsole logs from page:`);
      logs.forEach(log => console.log(`  [${log.type}] ${log.text}`));
    }

    // Take screenshot
    await page.screenshot({ path: 'ai_working/DIAGNOSTIC-final.png', fullPage: true });
    console.log(`\n✓ Screenshot saved: ai_working/DIAGNOSTIC-final.png`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({ path: 'ai_working/DIAGNOSTIC-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
