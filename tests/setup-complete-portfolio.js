const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function setupCompletePortfolio() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  // Load Sarah Chen persona data
  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));

  try {
    console.log('🎭 Setting up complete portfolio with Sarah Chen persona...\n');

    // Navigate to admin (should already have portfolio from previous setup)
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    console.log('✓ Connected to admin\n');

    // For each category, ensure it exists and has projects
    for (let catIdx = 0; catIdx < persona.categories.length; catIdx++) {
      const category = persona.categories[catIdx];
      console.log(`📁 Category ${catIdx + 1}: ${category.name}`);

      // Navigate to categories page
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      
      // Find category by name or create if doesn't exist
      let categoryLink = page.locator(`text="${category.name}"`).first();
      let categoryExists = await categoryLink.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (!categoryExists) {
        console.log(`   → Creating category...`);
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
            }
          }
        }
      }

      // Navigate to this category's projects
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      
      const projectsLink = page.locator(`a[href*="/admin/categories/"][href*="/projects"]`).filter({ hasText: category.name }).first();
      if (await projectsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await projectsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Create first 2 projects for this category
        for (let projIdx = 0; projIdx < Math.min(2, category.projects.length); projIdx++) {
          const project = category.projects[projIdx];
          
          // Check if project already exists
          const existingProject = page.locator(`text="${project.title}"`).first();
          const projectExists = await existingProject.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (!projectExists) {
            console.log(`   → Adding project: ${project.title}`);
            
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
                }
              }
            }
          } else {
            console.log(`   ✓ Project already exists: ${project.title}`);
          }
        }
      }
      
      console.log(''); // Empty line between categories
    }

    console.log('✅ Complete portfolio setup finished!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Portfolio: ${persona.persona.name} - ${persona.persona.role}`);
    console.log(`   • Categories: ${persona.categories.length}`);
    console.log(`   • Projects: ~${persona.categories.length * 2} total`);

  } catch (error) {
    console.error('❌ Portfolio setup failed:', error);
    await page.screenshot({ 
      path: 'ai_working/screenshots-after/setup-error.png',
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

setupCompletePortfolio().catch(console.error);
