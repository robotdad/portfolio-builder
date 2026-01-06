const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function populateSarahPortfolio() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));

  try {
    console.log('🎭 Populating Sarah Chen Portfolio\n');

    // Create all 3 categories with 2 projects each
    for (let catIdx = 0; catIdx < persona.categories.length; catIdx++) {
      const category = persona.categories[catIdx];
      console.log(`📁 Category ${catIdx + 1}: ${category.name}`);

      // Navigate to categories page
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Create category
      const newCatBtn = page.locator('button:has-text("New Category"), button:has-text("+ New Category")').first();
      if (await newCatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newCatBtn.click();
        await page.waitForTimeout(500);

        const nameField = page.locator('input[name="name"]');
        await nameField.fill(category.name);
        await page.waitForTimeout(300);

        const descField = page.locator('textarea[name="description"]');
        if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
          await descField.fill(`Portfolio work in ${category.name.toLowerCase()}`);
        }

        const createBtn = page.locator('button:has-text("Create Category")');
        await createBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log(`   ✓ Created category`);
      }

      // Navigate back and find the category's projects link
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Find projects link for this category
      const allLinks = await page.locator('a[href*="/projects"]').all();
      let foundLink = null;
      
      for (const link of allLinks) {
        const text = await link.textContent();
        if (text && text.includes(category.name.split(' ')[0])) {
          foundLink = link;
          break;
        }
      }

      if (!foundLink && allLinks.length > catIdx) {
        foundLink = allLinks[catIdx];
      }

      if (foundLink) {
        await foundLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Create 2 projects for this category
        for (let projIdx = 0; projIdx < Math.min(2, category.projects.length); projIdx++) {
          const project = category.projects[projIdx];

          const newProjBtn = page.locator('button:has-text("New Project"), button:has-text("+ New Project")').first();
          if (await newProjBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await newProjBtn.click();
            await page.waitForTimeout(500);

            const titleField = page.locator('input[name="title"]');
            await titleField.fill(project.title);
            await page.waitForTimeout(300);

            const descField = page.locator('textarea[name="description"]');
            if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
              await descField.fill(project.description);
            }

            const createBtn = page.locator('button:has-text("Create Project"), button:has-text("Add Project")').first();
            await createBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
            console.log(`   ✓ Project: ${project.title}`);
          }
        }
      }

      console.log('');
    }

    console.log('✅ Portfolio populated successfully!');
    console.log(`   • ${persona.categories.length} categories`);
    console.log(`   • ${persona.categories.length * 2} projects total\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'ai_working/populate-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

populateSarahPortfolio().catch(console.error);
