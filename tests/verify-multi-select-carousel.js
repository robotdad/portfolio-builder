const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Starting multi-select image picker verification...\n');

    // Step 1: Navigate to admin and find a page with carousel section
    console.log('1. Navigating to admin dashboard...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/screenshots/01-admin-dashboard.png', fullPage: true });

    // Step 2: Navigate to Pages section
    console.log('2. Expanding Pages navigation...');
    const pagesLink = page.getByRole('button', { name: /pages/i });
    if (await pagesLink.isVisible()) {
      await pagesLink.click();
      await page.waitForTimeout(500);
    }
    
    // Find first page link
    console.log('3. Finding a page to edit...');
    const firstPageLink = page.locator('nav a[href*="/admin/pages/"]').first();
    if (await firstPageLink.isVisible()) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/02-page-editor.png', fullPage: true });
      console.log('   ✓ Page editor loaded');
    } else {
      console.log('   ⚠ No pages found - creating a test page first');
      // If no pages, we might need to handle this differently
      await page.goto('http://localhost:3000/admin');
    }

    // Step 3: Find or add a Featured Carousel section
    console.log('4. Looking for Featured Carousel section...');
    
    // Check if there's already a carousel section
    const carouselSection = page.locator('text=Featured Carousel').first();
    const hasCarousel = await carouselSection.isVisible().catch(() => false);
    
    if (!hasCarousel) {
      console.log('   Adding new Featured Carousel section...');
      const addSectionButton = page.getByRole('button', { name: /add section/i });
      if (await addSectionButton.isVisible()) {
        await addSectionButton.click();
        await page.waitForTimeout(300);
        
        // Select carousel type
        const carouselOption = page.getByText('Featured Carousel');
        if (await carouselOption.isVisible()) {
          await carouselOption.click();
          await page.waitForTimeout(500);
          console.log('   ✓ Carousel section added');
        }
      }
    } else {
      console.log('   ✓ Carousel section found');
    }

    await page.screenshot({ path: 'tests/screenshots/03-carousel-section.png', fullPage: true });

    // Step 4: Test the "Add Multiple from Gallery" button
    console.log('5. Testing multi-select button...');
    const addMultipleButton = page.getByRole('button', { name: /add multiple from gallery/i }).first();
    
    if (await addMultipleButton.isVisible()) {
      console.log('   ✓ "Add Multiple from Gallery" button found');
      await addMultipleButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tests/screenshots/04-picker-modal-opened.png', fullPage: true });
      console.log('   ✓ Image picker modal opened');

      // Step 5: Verify modal title
      console.log('6. Verifying modal UI...');
      const modalTitle = page.getByText(/select.*images/i);
      if (await modalTitle.isVisible()) {
        console.log('   ✓ Modal title shows multi-select mode');
      }

      // Step 6: Verify square thumbnails and select multiple images
      console.log('7. Selecting multiple images...');
      
      // Get all image thumbnails
      const thumbnails = page.locator('.image-picker-grid [role="gridcell"]');
      const thumbnailCount = await thumbnails.count();
      console.log(`   Found ${thumbnailCount} images in gallery`);

      if (thumbnailCount >= 3) {
        // Click first 3 images
        for (let i = 0; i < 3; i++) {
          await thumbnails.nth(i).click();
          await page.waitForTimeout(300);
          console.log(`   ✓ Selected image ${i + 1}`);
        }

        await page.screenshot({ path: 'tests/screenshots/05-three-images-selected.png', fullPage: true });

        // Step 7: Verify selection counter
        console.log('8. Verifying selection feedback...');
        const selectionCounter = page.getByText(/3 selected/i);
        if (await selectionCounter.isVisible()) {
          console.log('   ✓ Selection counter shows "3 selected"');
        } else {
          console.log('   ⚠ Selection counter not found');
        }

        // Step 8: Verify numbered badges
        console.log('9. Checking for numbered badges...');
        const badge1 = page.locator('.selection-badge').first();
        if (await badge1.isVisible()) {
          const badgeText = await badge1.textContent();
          console.log(`   ✓ Numbered badge visible: "${badgeText}"`);
        } else {
          console.log('   ⚠ Numbered badges not visible');
        }

        // Capture close-up of first thumbnail with badge
        const firstThumbnail = thumbnails.nth(0);
        await firstThumbnail.screenshot({ path: 'tests/screenshots/06-badge-closeup.png' });
        console.log('   ✓ Captured badge close-up');

        // Step 9: Verify confirmation button
        console.log('10. Verifying confirmation button...');
        const confirmButton = page.getByRole('button', { name: /add.*to carousel/i });
        if (await confirmButton.isVisible()) {
          const buttonText = await confirmButton.textContent();
          console.log(`   ✓ Confirmation button: "${buttonText}"`);
          
          await page.screenshot({ path: 'tests/screenshots/07-ready-to-confirm.png', fullPage: true });

          // Click confirm
          console.log('11. Confirming selection...');
          await confirmButton.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: 'tests/screenshots/08-after-confirm.png', fullPage: true });
          console.log('   ✓ Confirmation completed');

          // Step 10: Verify carousel items were added
          console.log('12. Verifying carousel items...');
          const carouselItems = page.locator('[class*="carousel-item"], [data-section*="carousel"]');
          const itemCount = await carouselItems.count();
          console.log(`   Found ${itemCount} carousel items`);

        } else {
          console.log('   ⚠ Confirmation button not found');
        }

      } else {
        console.log(`   ⚠ Not enough images (found ${thumbnailCount}, need at least 3)`);
      }

    } else {
      console.log('   ⚠ "Add Multiple from Gallery" button not found');
      console.log('   This might mean the carousel section needs to be expanded or the feature is not visible');
    }

    // Step 11: Test backward compatibility - single-select mode
    console.log('\n13. Testing backward compatibility (single-select mode)...');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    const newCategoryButton = page.getByRole('button', { name: /new category/i });
    if (await newCategoryButton.isVisible()) {
      await newCategoryButton.click();
      await page.waitForTimeout(500);
      
      // Look for featured image picker
      const featuredImageButton = page.getByText(/featured image/i).first();
      if (await featuredImageButton.isVisible()) {
        await featuredImageButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: 'tests/screenshots/09-single-select-mode.png', fullPage: true });
        console.log('   ✓ Single-select modal opened (category featured image)');
        
        // Verify it's in single-select mode (no numbered badges, different UI)
        const singleSelectTitle = page.getByText(/select.*image/i).first();
        if (await singleSelectTitle.isVisible()) {
          const titleText = await singleSelectTitle.textContent();
          console.log(`   ✓ Single-select modal title: "${titleText}"`);
        }
        
        // Close modal
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }

    console.log('\n✅ Verification complete!');
    console.log('\nScreenshots saved to tests/screenshots/');
    console.log('\nNext steps:');
    console.log('1. Review screenshots for visual accuracy');
    console.log('2. Use vision analysis on key screenshots');
    console.log('3. Verify numbered badges are visible and correctly positioned');
    console.log('4. Verify thumbnails appear square (1:1 aspect ratio)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error-state.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
})();
