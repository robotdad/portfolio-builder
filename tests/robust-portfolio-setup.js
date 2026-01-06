const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function robustPortfolioSetup() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  // Enable console logging for debugging
  page.on('console', msg => console.log(`   [Browser] ${msg.text()}`));

  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));

  try {
    console.log('🎭 Creating Sarah Chen portfolio\n');

    // Step 1: Navigate to /welcome (force onboarding)
    console.log('1️⃣ Starting onboarding...');
    await page.goto('http://localhost:3000/welcome');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Look for any input fields on this page
    const inputs = await page.locator('input').all();
    console.log(`   Found ${inputs.length} input fields`);

    // Fill name field
    const nameField = page.locator('input').first();
    if (await nameField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameField.fill(persona.persona.name);
      console.log(`   ✓ Name: ${persona.persona.name}`);
      await page.waitForTimeout(500);
    }

    // Fill title/role field (likely second input)
    if (inputs.length > 1) {
      await inputs[1].fill(persona.persona.role);
      console.log(`   ✓ Role: ${persona.persona.role}`);
      await page.waitForTimeout(500);
    }

    // Look for submit button
    const buttons = await page.locator('button[type="submit"], button[type="button"]').all();
    console.log(`   Found ${buttons.length} buttons`);
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.match(/continue|next|create|submit/i))) {
        console.log(`   → Clicking: "${text.trim()}"`);
        await button.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        break;
      }
    }

    const afterOnboarding = page.url();
    console.log(`   After submit: ${afterOnboarding}\n`);

    // Step 2: Verify we're at admin
    if (!afterOnboarding.includes('/admin')) {
      await page.goto('http://localhost:3000/admin');
      await page.waitForLoadState('networkidle');
    }

    console.log('2️⃣ Creating categories...');
    
    // Create each category
    for (const category of persona.categories) {
      await page.goto('http://localhost:3000/admin/categories');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Click New Category
      const newCatBtn = page.getByText('New Category').or(page.getByText('+ New Category'));
      const btnVisible = await newCatBtn.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (btnVisible) {
        await newCatBtn.click();
        await page.waitForTimeout(1000);
        
        // Fill category name
        const catNameField = page.locator('input[name="name"]');
        if (await catNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await catNameField.fill(category.name);
          await page.waitForTimeout(300);
          
          // Click Create
          const createBtn = page.getByRole('button', { name: /create category/i });
          if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await createBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
            console.log(`   ✓ ${category.name}`);
          }
        }
      }
    }

    console.log('\n3️⃣ Creating projects...');
    
    // For each category, create one project
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    for (let i = 0; i < persona.categories.length; i++) {
      const category = persona.categories[i];
      const project = category.projects[0]; // First project from each category
      
      // Find category row and navigate to its projects
      const categoryRows = await page.locator('div, li').filter({ hasText: category.name }).all();
      
      for (const row of categoryRows) {
        // Look for a link to projects in this row
        const projectLink = row.locator('a[href*="/projects"]').first();
        if (await projectLink.isVisible({ timeout: 500 }).catch(() => false)) {
          await projectLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
          
          // Create project
          const newProjBtn = page.getByText('New Project').or(page.getByText('+ New Project'));
          if (await newProjBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await newProjBtn.click();
            await page.waitForTimeout(1000);
            
            const titleField = page.locator('input[name="title"]');
            if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
              await titleField.fill(project.title);
              await page.waitForTimeout(300);
              
              const createBtn = page.getByRole('button', { name: /create project|add project/i });
              if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await createBtn.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000);
                console.log(`   ✓ ${category.name}: ${project.title}`);
              }
            }
          }
          
          // Go back to categories for next iteration
          await page.goto('http://localhost:3000/admin/categories');
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    }

    console.log('\n✅ Portfolio setup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'ai_working/setup-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

robustPortfolioSetup().catch(console.error);
