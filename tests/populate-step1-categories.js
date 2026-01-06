const { chromium } = require('playwright');

/**
 * Step 1: Create categories only
 */

const BASE_URL = 'http://localhost:3000';

const CATEGORIES = [
  'Shakespearean Tragedy',
  'High Concept Sci-Fi',
  'Period Restoration'
];

async function createCategory(page, categoryName) {
  console.log(`\n📁 Creating category: ${categoryName}`);
  
  // Navigate to categories page
  await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  console.log('  Loaded categories page');
  
  // Click "New Category" button
  await page.getByRole('button', { name: /new category/i }).first().click();
  console.log('  Clicked New Category button');
  await page.waitForTimeout(1000);
  
  // Fill in category name
  await page.getByLabel(/category name/i).fill(categoryName);
  console.log(`  Filled category name: ${categoryName}`);
  
  // Save category
  const saveButton = page.getByRole('button', { name: /save|create/i }).first();
  await saveButton.click();
  console.log('  Clicked Save button');
  
  // Wait for navigation back to categories page (with generous timeout)
  await page.waitForURL(/\/admin\/categories$/, { timeout: 15000 });
  console.log('  Navigated back to categories page');
  
  // Wait a bit for the UI to update
  await page.waitForTimeout(1000);
  
  // Get the category ID by finding the newly created category in the list
  const categoryLink = page.locator(`a:has-text("${categoryName}")`).first();
  const href = await categoryLink.getAttribute('href');
  const categoryId = href?.match(/\/categories\/(\d+)/)?.[1];
  
  if (!categoryId) {
    throw new Error(`Could not find category ID for: ${categoryName}`);
  }
  
  console.log(`✅ Created category: ${categoryName} (ID: ${categoryId})`);
  return categoryId;
}

async function main() {
  console.log('📁 Step 1: Creating Categories\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  try {
    for (const categoryName of CATEGORIES) {
      const categoryId = await createCategory(page, categoryName);
      results.push({ id: categoryId, name: categoryName });
    }
    
    // Take screenshot
    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'step1-categories-created.png', fullPage: true });
    console.log('\n📸 Screenshot: step1-categories-created.png');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ CATEGORIES CREATED\n');
    console.log('📁 Categories:');
    results.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('step1-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved: step1-results.json\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'step1-error.png', fullPage: true });
    console.error('📸 Error screenshot: step1-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
