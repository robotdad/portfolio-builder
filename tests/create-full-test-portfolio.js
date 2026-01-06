const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function createFullTestPortfolio() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));

  try {
    console.log('🎭 Creating complete test portfolio...\n');

    // Step 1: Navigate to admin
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');

    // Step 2: For each category, create it and add 1 project
    for (const category of persona.categories) {
      console.log(`📁 Processing category: ${category.name}`);
      
      // Navigate to categories
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      
      // Create category
      const createCatBtn = page.getByRole('button', { name: /new category/i }).first();
      if (await createCatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createCatBtn.click();
        await page.waitForTimeout(500);
        
        const nameField = page.locator('input[name="name"]').first();
        if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameField.fill(category.name);
          
          const submitBtn = page.getByRole('button', { name: /create/i }).first();
          if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await submitBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);
            console.log(`   ✓ Created category`);
          }
        }
      }

      // Navigate back to categories to find the link to projects
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      
      // Find and click the category's projects link
      const categoryRow = page.locator(`text="${category.name}"`).first();
      if (await categoryRow.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Look for the arrow or "View projects" link in the same row
        const projectsLink = page.locator(`a[href*="/projects"]`).filter({ hasText: category.name }).first();
        
        if (!await projectsLink.isVisible().catch(() => false)) {
          // Try alternative: find any link in the row that goes to projects
          const allProjectLinks = await page.locator('a[href*="/admin/categories/"][href*="/projects"]').all();
          for (const link of allProjectLinks) {
            const linkText = await link.textContent();
            if (linkText.includes(category.name) || linkText.includes('(')) {
              await link.click();
              await page.waitForLoadState('networkidle');
              break;
            }
          }
        } else {
          await projectsLink.click();
          await page.waitForLoadState('networkidle');
        }
        
        // Create one project in this category
        const project = category.projects[0];
        const createProjBtn = page.getByRole('button', { name: /new project/i }).first();
        if (await createProjBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await createProjBtn.click();
          await page.waitForTimeout(500);
          
          const titleField = page.locator('input[name="title"]').first();
          if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleField.fill(project.title);
            
            const submitBtn = page.getByRole('button', { name: /create|add project/i }).first();
            if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await submitBtn.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(500);
              console.log(`   ✓ Created project: ${project.title}`);
            }
          }
        }
      }
      
      console.log(''); // Empty line
    }

    console.log('✅ Complete portfolio created!');
    console.log(`   • ${persona.categories.length} categories`);
    console.log(`   • ${persona.categories.length} projects (1 per category)\n`);

  } catch (error) {
    console.error('❌ Failed to create portfolio:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

createFullTestPortfolio().catch(console.error);
