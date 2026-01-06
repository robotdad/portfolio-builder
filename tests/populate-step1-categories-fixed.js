const { chromium } = require('playwright');

/**
 * Step 1: Create categories with improved ID extraction
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
  
  // Click "New Category" button
  await page.getByRole('button', { name: /new category/i }).first().click();
  await page.waitForTimeout(1000);
  
  // Fill in category name
  await page.getByLabel(/category name/i).fill(categoryName);
  
  // Save category
  const saveButton = page.getByRole('button', { name: /save|create/i }).first();
  await saveButton.click();
  
  // Wait for navigation back to categories page
  await page.waitForURL(/\/admin\/categories$/, { timeout: 15000 });
  
  // Wait for UI to update
  await page.waitForTimeout(2000);
  
  // Try multiple methods to get the category ID
  let categoryId = null;
  
  // Method 1: Check sidebar navigation
  const sidebarLink = page.locator(`nav a:has-text("${categoryName}")`).first();
  if (await sidebarLink.count() > 0) {
    const href = await sidebarLink.getAttribute('href');
    const match = href?.match(/\/categories\/(\d+)/);
    if (match) {
      categoryId = match[1];
      console.log(`  Found ID in sidebar: ${categoryId}`);
    }
  }
  
  // Method 2: Check main content area cards
  if (!categoryId) {
    const cards = page.locator('.category-card, [class*="category"]').filter({ hasText: categoryName });
    if (await cards.count() > 0) {
      const card = cards.first();
      // Look for Edit button or view link
      const editButton = card.locator('a[href*="/categories/"], button[data-category-id]').first();
      if (await editButton.count() > 0) {
        const href = await editButton.getAttribute('href') || await editButton.getAttribute('data-category-id');
        const match = href?.match(/\/categories\/(\d+)/) || href?.match(/(\d+)/);
        if (match) {
          categoryId = match[1];
          console.log(`  Found ID in card: ${categoryId}`);
        }
      }
    }
  }
  
  // Method 3: Look for any link with the category name
  if (!categoryId) {
    const allLinks = page.locator(`a:has-text("${categoryName}")`);
    const count = await allLinks.count();
    for (let i = 0; i < count; i++) {
      const link = allLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href?.includes('/categories/')) {
        const match = href.match(/\/categories\/(\d+)/);
        if (match) {
          categoryId = match[1];
          console.log(`  Found ID in link ${i}: ${categoryId}`);
          break;
        }
      }
    }
  }
  
  // Method 4: Navigate to the category by clicking it
  if (!categoryId) {
    console.log(`  Trying to navigate to category...`);
    const categoryLink = page.locator(`a:has-text("${categoryName}")`).first();
    await categoryLink.click();
    await page.waitForURL(/\/admin\/categories\/\d+/, { timeout: 10000 });
    const url = page.url();
    const match = url.match(/\/categories\/(\d+)/);
    if (match) {
      categoryId = match[1];
      console.log(`  Found ID from navigation: ${categoryId}`);
    }
    // Navigate back
    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'domcontentloaded' });
  }
  
  if (!categoryId) {
    throw new Error(`Could not find category ID for: ${categoryName}`);
  }
  
  console.log(`✅ Created category: ${categoryName} (ID: ${categoryId})`);
  return categoryId;
}

async function main() {
  console.log('📁 Step 1: Creating Categories (Fixed)\n');
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
