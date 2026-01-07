const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('TESTING IMAGE VISIBILITY IN PICKER...\n');

    await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Find and click on first category
    const catLink = page.locator('nav a').filter({ hasText: /shakespearean|high concept|period/i }).first();
    if (await catLink.isVisible({ timeout: 3000 })) {
      await catLink.click();
      await page.waitForTimeout(2000);
      
      // Click Edit button
      const editBtn = page.getByRole('button', { name: /edit/i }).first();
      if (await editBtn.isVisible({ timeout: 2000 })) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        
        // Click "Choose from Gallery" or similar
        const galleryBtn = page.locator('button').filter({ hasText: /choose.*gallery|from gallery/i }).first();
        if (await galleryBtn.isVisible({ timeout: 2000 })) {
          await galleryBtn.click();
          await page.waitForTimeout(2500);
          
          // Capture the FULL modal
          await page.screenshot({ path: 'ai_working/TEST-modal-full.png', fullPage: true });
          console.log('✓ Full modal captured');
          
          // Capture JUST the grid
          const grid = page.locator('.image-picker-grid');
          if (await grid.isVisible({ timeout: 2000 })) {
            await grid.screenshot({ path: 'ai_working/TEST-grid-closeup.png' });
            console.log('✓ Grid close-up captured');
            
            // Count images
            const imgs = page.locator('.image-picker-grid img');
            const count = await imgs.count();
            console.log(`\n  Found ${count} images in grid`);
            
            if (count > 0) {
              // Get first 3 image details
              for (let i = 0; i < Math.min(3, count); i++) {
                const img = imgs.nth(i);
                const src = await img.getAttribute('src');
                const box = await img.boundingBox();
                console.log(`  Image ${i+1}: ${box ? `${Math.round(box.width)}x${Math.round(box.height)}px` : 'no box'}`);
                console.log(`    src: ${src?.substring(0, 60)}...`);
              }
              
              // Capture first image close-up
              const firstImg = imgs.first();
              const firstBox = await firstImg.boundingBox();
              if (firstBox) {
                await page.screenshot({ 
                  path: 'ai_working/TEST-first-image.png',
                  clip: {
                    x: firstBox.x - 10,
                    y: firstBox.y - 10,
                    width: firstBox.width + 20,
                    height: firstBox.height + 20
                  }
                });
                console.log('✓ First image isolated');
              }
            } else {
              console.log('  ⚠️ NO IMAGES FOUND!');
            }
          } else {
            console.log('  ⚠️ Grid not visible!');
          }
        }
      }
    }

    console.log('\n✅ Check ai_working/TEST-*.png files');

  } catch (error) {
    console.error('❌', error.message);
    await page.screenshot({ path: 'ai_working/TEST-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
