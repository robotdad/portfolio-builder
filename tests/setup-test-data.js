const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function setupTestData() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  // Load Sarah Chen persona data
  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));

  try {
    console.log('🎭 Setting up test portfolio with Sarah Chen persona...\n');

    // Step 1: Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Complete onboarding if needed
    if (page.url().includes('/welcome')) {
      console.log('1️⃣ Completing onboarding...');
      
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameField.fill(persona.persona.name);
        console.log(`   ✓ Name: ${persona.persona.name}`);
      }
      
      const titleField = page.locator('input[name="title"], input[placeholder*="title" i], input[placeholder*="role" i]').first();
      if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleField.fill(persona.persona.role);
        console.log(`   ✓ Role: ${persona.persona.role}`);
      }
      
      const continueBtn = page.getByRole('button', { name: /continue|create|submit/i }).first();
      if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueBtn.click();
        await page.waitForLoadState('networkidle');
        console.log('   ✓ Onboarding complete');
      }
    }

    await page.waitForTimeout(1000);

    // Step 3: Create first category
    console.log('\n2️⃣ Creating categories...');
    
    for (let i = 0; i < persona.categories.length; i++) {
      const category = persona.categories[i];
      
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      
      const createBtn = page.getByRole('button', { name: /new category/i }).first();
      if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(500);
        
        const nameField = page.locator('input[name="name"]').first();
        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill(category.name);
          
          const submitBtn = page.getByRole('button', { name: /create/i }).first();
          if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await submitBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);
            console.log(`   ✓ Category: ${category.name}`);
          }
        }
      }
    }

    // Step 4: Add projects to first category
    console.log('\n3️⃣ Creating projects for first category...');
    
    // Navigate to categories page to find the category link
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    // Click on first category to go to its projects
    const firstCategoryLink = page.locator('a[href*="/admin/categories/"][href*="/projects"]').first();
    if (await firstCategoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstCategoryLink.click();
      await page.waitForLoadState('networkidle');
      
      // Get first category data
      const firstCategory = persona.categories[0];
      
      // Create projects for this category
      for (let i = 0; i < Math.min(2, firstCategory.projects.length); i++) {
        const project = firstCategory.projects[i];
        
        const createProjectBtn = page.getByRole('button', { name: /new project/i }).first();
        if (await createProjectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await createProjectBtn.click();
          await page.waitForTimeout(500);
          
          const titleField = page.locator('input[name="title"]').first();
          if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleField.fill(project.title);
            
            const submitBtn = page.getByRole('button', { name: /create|add project/i }).first();
            if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await submitBtn.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(500);
              console.log(`   ✓ Project: ${project.title}`);
            }
          }
        }
      }
    }

    console.log('\n✅ Test data setup complete!');
    console.log(`   • Portfolio: ${persona.persona.name}`);
    console.log(`   • Categories: ${persona.categories.length}`);
    console.log(`   • Projects: ${Math.min(2, persona.categories[0].projects.length)} in first category`);

  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

setupTestData().catch(console.error);
