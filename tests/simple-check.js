const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Check API response structure
    const response = await page.request.get('http://localhost:3000/api/images?portfolioId=test');
    const json = await response.json();
    
    console.log('API Response structure:');
    console.log('- success:', json.success);
    console.log('- has data:', !!json.data);
    
    if (json.data && json.data.images && json.data.images[0]) {
      const firstImg = json.data.images[0];
      console.log('\nFirst image object:');
      console.log('- id:', firstImg.id);
      console.log('- url:', firstImg.url || 'MISSING ❌');
      console.log('- thumbnailUrl:', firstImg.thumbnailUrl || 'MISSING ❌');
      console.log('- filename:', firstImg.filename);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
