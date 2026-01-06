const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function setupAndValidate() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots-final';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('🎯 Complete Portfolio Setup & Validation\n');

    // SETUP PHASE
    console.log('📋 SETUP: Creating portfolio from scratch...\n');
    
    // 1. Onboarding
    console.log('Step 1: Onboarding');
    await page.goto('http://localhost:3000/welcome');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.locator('input').first().fill('Sarah Chen');
    await page.waitForTimeout(300);
    
    const inputs = await page.locator('input').all();
    if (inputs.length > 1) {
      await inputs[1].fill('Theatre Costume Designer');
    }
    await page.waitForTimeout(300);
    
    await page.locator('button').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   ✓ Portfolio created\n');

    // 2. Create Category
    console.log('Step 2: Creating category');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    const newCatButton = page.locator('button:has-text("New Category"), button:has-text("+ New Category")').first();
    await newCatButton.click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[name="name"]').fill('Shakespearean Tragedy');
    await page.waitForTimeout(300);
    
    await page.locator('button:has-text("Create")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('   ✓ Category created\n');

    // 3. Navigate to Projects List and create project
    console.log('Step 3: Creating project');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Find link to projects (may be in the category row)
    const linksToProjects = await page.locator('a[href*="/projects"]').all();
    if (linksToProjects.length > 0) {
      await linksToProjects[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      const newProjButton = page.locator('button:has-text("New Project"), button:has-text("+ New Project")').first();
      await newProjButton.click();
      await page.waitForTimeout(1000);
      
      await page.locator('input[name="title"]').fill('The Obsidian Crown');
      await page.waitForTimeout(300);
      
      await page.locator('button:has-text("Create"), button:has-text("Add Project")').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      console.log('   ✓ Project created\n');
    }

    // VALIDATION PHASE
    console.log('='.repeat(70));
    console.log('🔍 VALIDATION: Capturing all 4 page types\n');

    const results = [];

    // Page 1: Dashboard
    console.log('📸 1. Dashboard');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'final-01-dashboard.png'),
      fullPage: true 
    });
    
    const dashHeader = page.locator('header.admin-page-header');
    const dashHasBreadcrumb = await dashHeader.locator('nav[aria-label="Breadcrumb"]').isVisible().catch(() => false);
    console.log(`   → AdminPageHeader: ${await dashHeader.isVisible() ? '✅' : '❌'}`);
    console.log(`   → Breadcrumb: ${dashHasBreadcrumb ? '❌ UNEXPECTED' : '✅ None (correct)'}`);
    results.push({
      page: 'Dashboard',
      hasHeader: await dashHeader.isVisible(),
      hasBreadcrumb: dashHasBreadcrumb
    });

    // Page 2: Categories
    console.log('\n📸 2. Categories');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'final-02-categories.png'),
      fullPage: true 
    });
    
    const catHeader = page.locator('header.admin-page-header');
    const catBreadcrumb = catHeader.locator('nav[aria-label="Breadcrumb"]');
    const catHasBreadcrumb = await catBreadcrumb.isVisible().catch(() => false);
    const catBreadcrumbText = catHasBreadcrumb ? await catBreadcrumb.textContent() : '';
    console.log(`   → AdminPageHeader: ${await catHeader.isVisible() ? '✅' : '❌'}`);
    console.log(`   → Breadcrumb: ${catHasBreadcrumb ? `✅ "${catBreadcrumbText}"` : '❌ Missing'}`);
    results.push({
      page: 'Categories',
      hasHeader: await catHeader.isVisible(),
      hasBreadcrumb: catHasBreadcrumb,
      breadcrumbText: catBreadcrumbText
    });

    // Page 3: Projects List
    console.log('\n📸 3. Projects List');
    const projectsListLink = page.locator('a[href*="/projects"]').first();
    if (await projectsListLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectsListLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: path.join(screenshotDir, 'final-03-projects-list.png'),
        fullPage: true 
      });
      
      const projListHeader = page.locator('header.admin-page-header');
      const projListBreadcrumb = projListHeader.locator('nav[aria-label="Breadcrumb"]');
      const projListHasBreadcrumb = await projListBreadcrumb.isVisible().catch(() => false);
      const projListBreadcrumbText = projListHasBreadcrumb ? await projListBreadcrumb.textContent() : '';
      console.log(`   → AdminPageHeader: ${await projListHeader.isVisible() ? '✅' : '❌'}`);
      console.log(`   → Breadcrumb: ${projListHasBreadcrumb ? `✅ "${projListBreadcrumbText}"` : '❌ Missing'}`);
      results.push({
        page: 'Projects List',
        hasHeader: await projListHeader.isVisible(),
        hasBreadcrumb: projListHasBreadcrumb,
        breadcrumbText: projListBreadcrumbText
      });

      // Page 4: Project Editor
      console.log('\n📸 4. Project Editor');
      const projectLink = page.locator('a[href^="/admin/projects/"]').first();
      if (await projectLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await projectLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await page.screenshot({ 
          path: path.join(screenshotDir, 'final-04-project-editor.png'),
          fullPage: true 
        });
        
        const editorHeader = page.locator('header.admin-page-header');
        const editorBreadcrumb = editorHeader.locator('nav[aria-label="Breadcrumb"]');
        const editorHasBreadcrumb = await editorBreadcrumb.isVisible().catch(() => false);
        const editorBreadcrumbText = editorHasBreadcrumb ? await editorBreadcrumb.textContent() : '';
        console.log(`   → AdminPageHeader: ${await editorHeader.isVisible() ? '✅' : '❌'}`);
        console.log(`   → Breadcrumb: ${editorHasBreadcrumb ? `✅ "${editorBreadcrumbText}"` : '❌ Missing'}`);
        results.push({
          page: 'Project Editor',
          hasHeader: await editorHeader.isVisible(),
          hasBreadcrumb: editorHasBreadcrumb,
          breadcrumbText: editorBreadcrumbText
        });
      }
    }

    // RESULTS
    console.log('\n' + '='.repeat(70));
    console.log('📊 VALIDATION RESULTS\n');

    const allHaveHeader = results.every(r => r.hasHeader);
    const dashboardNoBreadcrumb = results.find(r => r.page === 'Dashboard')?.hasBreadcrumb === false;
    const othersHaveBreadcrumb = results.filter(r => r.page !== 'Dashboard').every(r => r.hasBreadcrumb);

    console.log(`✅ All pages use AdminPageHeader: ${allHaveHeader ? 'YES' : 'NO'} (${results.filter(r => r.hasHeader).length}/${results.length})`);
    console.log(`✅ Dashboard has no breadcrumb: ${dashboardNoBreadcrumb ? 'YES' : 'NO'}`);
    console.log(`✅ All other pages have breadcrumb: ${othersHaveBreadcrumb ? 'YES' : 'NO'}`);

    const perfect = allHaveHeader && dashboardNoBreadcrumb && othersHaveBreadcrumb;
    
    console.log('\n' + '='.repeat(70));
    if (perfect) {
      console.log('🎉 PERFECT! All headers are consistent!\n');
    } else {
      console.log('⚠️  Some issues found:\n');
      results.forEach(r => {
        if (!r.hasHeader) console.log(`   ❌ ${r.page}: Missing AdminPageHeader`);
        if (r.page !== 'Dashboard' && !r.hasBreadcrumb) console.log(`   ❌ ${r.page}: Missing breadcrumb`);
        if (r.page === 'Dashboard' && r.hasBreadcrumb) console.log(`   ❌ ${r.page}: Should not have breadcrumb`);
      });
      console.log('');
    }

    console.log(`📸 Screenshots saved to: ${screenshotDir}`);
    console.log(`   → ${results.length} page types captured\n`);

    // Save results
    fs.writeFileSync(
      'ai_working/final-validation-results.json',
      JSON.stringify({ timestamp: new Date().toISOString(), results, perfect }, null, 2)
    );

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

setupAndValidate().catch(console.error);
