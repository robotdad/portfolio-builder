/**
 * Test to diagnose the page navigation href issue
 * 
 * Purpose: Understand why Playwright sees href as null but navigation works
 */

const { chromium } = require('playwright');

async function testPageNavigation() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting page navigation diagnosis...\n');

    // Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Loaded admin page\n');

    // Wait for navigation tree to load
    await page.waitForSelector('nav[aria-label="Main navigation"]', { timeout: 10000 });
    console.log('✓ Navigation tree loaded\n');

    // Find the "About" page link (or first page link if About doesn't exist)
    const pageLinks = await page.locator('.page-link').all();
    
    if (pageLinks.length === 0) {
      console.error('❌ No page links found in navigation');
      return;
    }

    console.log(`📋 Found ${pageLinks.length} page link(s)\n`);

    // Test the first page link
    const firstLink = pageLinks[0];
    const linkText = await firstLink.locator('.page-title').textContent();
    
    console.log(`🔍 Examining link: "${linkText}"\n`);

    // 1. Check immediate DOM state
    console.log('--- Immediate DOM Check ---');
    const immediateHref = await firstLink.getAttribute('href');
    console.log(`getAttribute('href'): ${immediateHref}`);

    // 2. Check if it's actually an <a> tag
    const tagName = await firstLink.evaluate(el => el.tagName);
    console.log(`Tag name: ${tagName}`);

    // 3. Check all attributes
    const allAttributes = await firstLink.evaluate(el => {
      const attrs = {};
      for (let attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    });
    console.log('All attributes:', allAttributes);

    // 4. Check if there's a nested <a> tag
    const nestedA = await firstLink.locator('a').first();
    const hasNestedA = await nestedA.count() > 0;
    if (hasNestedA) {
      console.log('\n--- Found nested <a> tag ---');
      const nestedHref = await nestedA.getAttribute('href');
      const nestedAttrs = await nestedA.evaluate(el => {
        const attrs = {};
        for (let attr of el.attributes) {
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });
      console.log(`Nested <a> href: ${nestedHref}`);
      console.log('Nested <a> attributes:', nestedAttrs);
    }

    // 5. Wait a bit for hydration and check again
    console.log('\n--- After 2 second delay (hydration) ---');
    await page.waitForTimeout(2000);
    const delayedHref = await firstLink.getAttribute('href');
    console.log(`getAttribute('href') after delay: ${delayedHref}`);

    // 6. Check computed properties
    const computedHref = await firstLink.evaluate(el => {
      return {
        href: el.href,
        getAttribute: el.getAttribute('href'),
        hasAttribute: el.hasAttribute('href'),
        outerHTML: el.outerHTML.substring(0, 200)
      };
    });
    console.log('\n--- Computed properties ---');
    console.log(computedHref);

    // 7. Test actual navigation
    console.log('\n--- Testing Navigation ---');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    await firstLink.click();
    await page.waitForLoadState('networkidle');
    
    const newUrl = page.url();
    console.log(`After click URL: ${newUrl}`);
    console.log(`Navigation worked: ${newUrl !== currentUrl ? '✅' : '❌'}`);

    // 8. Check if it's an expected pattern
    console.log('\n--- Analysis ---');
    if (!immediateHref && newUrl.includes('/admin/pages/')) {
      console.log('⚠️  CONFIRMED: href is null but navigation works via JS routing');
      console.log('This is likely Next.js client-side routing behavior');
    }

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// Run the test
testPageNavigation().catch(console.error);
