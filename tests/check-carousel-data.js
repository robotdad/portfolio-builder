const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 Checking carousel data flow...\n');

    // Navigate directly to admin
    await page.goto('http://localhost:3000/admin', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check if images API returns proper data
    console.log('📡 Checking /api/images response...\n');
    
    // Get portfolio ID from page (should be in URL after navigation)
    const portfolioId = await page.evaluate(() => {
      const match = window.location.href.match(/portfolio_[a-f0-9]+/);
      return match ? match[0] : null;
    });
    
    if (!portfolioId) {
      console.log('⚠️  No portfolio found. Creating test portfolio...');
      await browser.close();
      return;
    }
    
    console.log(`✓ Found portfolio: ${portfolioId}\n`);
    
    // Fetch images API
    const response = await page.request.get(`http://localhost:3000/api/images?portfolioId=${portfolioId}`);
    const data = await response.json();
    
    console.log(`📊 Images API Response:`);
    console.log(`   Total images: ${data.images?.length || 0}`);
    
    if (data.images && data.images.length > 0) {
      const firstImage = data.images[0];
      console.log(`\n🔍 First image structure:`);
      console.log(`   id: ${firstImage.id}`);
      console.log(`   url: ${firstImage.url || 'NULL ❌'}`);
      console.log(`   thumbnailUrl: ${firstImage.thumbnailUrl || 'NULL ❌'}`);
      console.log(`   filename: ${firstImage.filename}`);
      console.log(`   source.pageTitle: ${firstImage.source?.pageTitle}`);
      
      // Check if url field exists and is populated
      if (!firstImage.url) {
        console.log(`\n❌ FOUND THE BUG: image.url is NULL/undefined!`);
        console.log(`   The API is not returning the 'url' field.`);
        console.log(`   When handleMultiImageSelect assigns imageUrl: image.url,`);
        console.log(`   it's assigning NULL, so no thumbnail shows!`);
      } else {
        console.log(`\n✓ image.url is populated correctly`);
      }
      
      // Check a few more images
      console.log(`\n🔍 Checking all images for missing urls:`);
      let missingCount = 0;
      for (let i = 0; i < Math.min(data.images.length, 10); i++) {
        const img = data.images[i];
        if (!img.url) {
          missingCount++;
          console.log(`   Image ${i + 1}: ❌ url is ${img.url}`);
        }
      }
      
      if (missingCount > 0) {
        console.log(`\n❌ ${missingCount} images have missing 'url' field`);
      } else {
        console.log(`\n✓ All checked images have url field populated`);
      }
    } else {
      console.log(`\n⚠️  No images found in API response`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
