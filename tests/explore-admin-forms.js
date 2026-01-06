const { chromium } = require('playwright');

/**
 * Quick exploration script to understand the admin form structure
 */

const BASE_URL = 'http://localhost:3000';

async function exploreCategoryCreation(page) {
  console.log('\n🔍 Exploring Category Creation Form...');
  
  await page.goto(`${BASE_URL}/admin/categories`);
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
  
  // Take screenshot of categories page
  await page.screenshot({ path: 'explore-categories-page.png', fullPage: true });
  console.log('📸 Screenshot: explore-categories-page.png');
  
  // Find all buttons with "category" in them
  const buttons = await page.locator('button').all();
  console.log(`\nFound ${buttons.length} buttons on page`);
  
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    const role = await buttons[i].getAttribute('type');
    const classes = await buttons[i].getAttribute('class');
    if (text.toLowerCase().includes('category') || text.includes('New') || text.includes('+')) {
      console.log(`Button ${i}: "${text}" (type: ${role}, classes: ${classes?.substring(0, 50)}...)`);
    }
  }
  
  // Click the first "New Category" button
  console.log('\n🖱️  Clicking first New Category button...');
  await page.getByRole('button', { name: /new category/i }).first().click();
  await page.waitForTimeout(1000);
  
  // Take screenshot of form
  await page.screenshot({ path: 'explore-category-form.png', fullPage: true });
  console.log('📸 Screenshot: explore-category-form.png');
  
  // Find all inputs
  const inputs = await page.locator('input, textarea').all();
  console.log(`\nFound ${inputs.length} input fields`);
  
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type');
    const name = await inputs[i].getAttribute('name');
    const id = await inputs[i].getAttribute('id');
    const placeholder = await inputs[i].getAttribute('placeholder');
    const label = await inputs[i].evaluate((el) => {
      const labelEl = document.querySelector(`label[for="${el.id}"]`);
      return labelEl ? labelEl.textContent : null;
    });
    console.log(`Input ${i}: type=${type}, name=${name}, id=${id}, placeholder="${placeholder}", label="${label}"`);
  }
}

async function main() {
  console.log('🔍 Exploring Admin Forms\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await exploreCategoryCreation(page);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'explore-error.png', fullPage: true });
    console.error('📸 Error screenshot: explore-error.png');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
