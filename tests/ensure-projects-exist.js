const { chromium } = require('playwright');

async function ensureProjectsExist() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔍 Checking for existing projects...\n');

    // Navigate to categories
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');

    // Get all category links to projects
    const categoryLinks = await page.locator('a[href*="/admin/categories/"][href*="/projects"]').all();
    console.log(`Found ${categoryLinks.length} categories\n`);

    let projectsFound = 0;
    let categoryId = null;

    for (let i = 0; i < categoryLinks.length; i++) {
      const link = categoryLinks[i];
      const href = await link.getAttribute('href');
      const categoryName = await link.textContent();
      categoryId = href?.match(/\/categories\/([^/]+)\/projects/)?.[1];
      
      console.log(`${i + 1}. ${categoryName.trim()}`);
      
      // Navigate to projects for this category
      await page.goto(`http://localhost:3000${href}`);
      await page.waitForLoadState('networkidle');
      
      // Count projects
      const projectLinks = await page.locator('a[href^="/admin/projects/"]').all();
      console.log(`   → ${projectLinks.length} project(s)`);
      projectsFound += projectLinks.length;
      
      // If no projects, create one
      if (projectLinks.length === 0) {
        console.log(`   → Creating test project...`);
        const createBtn = page.getByRole('button', { name: /new project/i }).first();
        if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await createBtn.click();
          await page.waitForTimeout(500);
          
          const titleField = page.locator('input[name="title"]').first();
          if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleField.fill(`Test Project ${i + 1}`);
            const submitBtn = page.getByRole('button', { name: /create/i }).first();
            if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await submitBtn.click();
              await page.waitForLoadState('networkidle');
              projectsFound++;
              console.log(`   ✓ Created test project`);
            }
          }
        }
      }
      
      // Go back to categories for next iteration
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
    }

    console.log(`\n✅ Total projects: ${projectsFound}`);
    
    if (categoryId) {
      console.log(`\n🎯 Can test Projects List at: /admin/categories/${categoryId}/projects`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

ensureProjectsExist().catch(console.error);
