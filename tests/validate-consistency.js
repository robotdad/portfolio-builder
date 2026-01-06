const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function validateHeaderConsistency() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots-after';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const validation = {
    timestamp: new Date().toISOString(),
    pages: [],
    consistencyChecks: [],
    issues: []
  };

  let stepNum = 0;

  async function captureStep(name, description) {
    stepNum++;
    const filename = `step-${String(stepNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
    
    console.log(`✓ Step ${stepNum}: ${name}`);
    return filename;
  }

  async function analyzeHeader() {
    // Check for AdminPageHeader presence
    const header = page.locator('header.admin-page-header').first();
    const headerExists = await header.isVisible().catch(() => false);
    
    if (!headerExists) {
      return {
        hasAdminPageHeader: false,
        note: 'Page does not use AdminPageHeader component'
      };
    }

    // Capture header structure
    const headerHTML = await header.innerHTML().catch(() => '');
    const headerText = await header.textContent().catch(() => '');
    
    // Check for breadcrumb
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]').first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    
    // Check for actions
    const actions = page.locator('.header-actions').first();
    const hasActions = await actions.isVisible().catch(() => false);
    const actionsHTML = hasActions ? await actions.innerHTML().catch(() => '') : '';
    
    return {
      hasAdminPageHeader: true,
      hasBreadcrumb,
      hasActions,
      headerText: headerText.substring(0, 200), // Truncate for readability
      breadcrumbItems: hasBreadcrumb ? await breadcrumb.textContent() : null,
      actionButtons: hasActions ? await actions.locator('button, a').count() : 0
    };
  }

  try {
    console.log('🔍 Validating header consistency across all admin pages...\n');

    // Step 1: Create portfolio through onboarding
    console.log('1️⃣ Setting up test portfolio...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    const screenshot1 = await captureStep('initial-load', 'Initial /admin load');
    
    // Check if onboarding needed
    if (page.url().includes('/welcome')) {
      console.log('   → Completing onboarding flow...');
      
      // Fill name
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameField.fill('Sarah Chen');
      }
      
      // Fill title
      const titleField = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleField.fill('Theatre Costume Designer');
      }
      
      // Submit
      const continueBtn = page.getByRole('button', { name: /continue|create|submit/i }).first();
      if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }

    await page.waitForTimeout(1000);
    const screenshot2 = await captureStep('dashboard-ready', 'Dashboard after setup');

    // Step 2: Validate Dashboard header
    console.log('\n2️⃣ Validating Dashboard header...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    const dashboardHeader = await analyzeHeader();
    validation.pages.push({
      route: '/admin',
      name: 'Dashboard',
      screenshot: await captureStep('dashboard-header', 'Dashboard header'),
      headerAnalysis: dashboardHeader
    });
    
    console.log(`   → Has AdminPageHeader: ${dashboardHeader.hasAdminPageHeader ? '✅' : '❌'}`);
    console.log(`   → Has Breadcrumb: ${dashboardHeader.hasBreadcrumb ? '✅' : '(none - expected for dashboard)'}`);
    console.log(`   → Action Buttons: ${dashboardHeader.actionButtons}`);

    // Step 3: Create a category (so we can test categories page)
    console.log('\n3️⃣ Creating test category...');
    const createCategoryBtn = page.getByRole('button', { name: /new category|create category/i }).first();
    if (await createCategoryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createCategoryBtn.click();
      await page.waitForTimeout(500);
      
      // Fill category form
      const categoryNameField = page.locator('input[name="name"]').first();
      if (await categoryNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryNameField.fill('Shakespearean Tragedy');
        
        const submitBtn = page.getByRole('button', { name: /create|save/i }).first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
        }
      }
    }

    // Step 4: Validate Categories page header
    console.log('\n4️⃣ Validating Categories page header...');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    const categoriesHeader = await analyzeHeader();
    validation.pages.push({
      route: '/admin/categories',
      name: 'Categories',
      screenshot: await captureStep('categories-header', 'Categories page header'),
      headerAnalysis: categoriesHeader
    });
    
    console.log(`   → Has AdminPageHeader: ${categoriesHeader.hasAdminPageHeader ? '✅' : '❌'}`);
    console.log(`   → Has Breadcrumb: ${categoriesHeader.hasBreadcrumb ? '✅' : '❌'}`);
    console.log(`   → Breadcrumb: ${categoriesHeader.breadcrumbItems || 'N/A'}`);
    console.log(`   → Action Buttons: ${categoriesHeader.actionButtons}`);

    // Step 5: Get category ID and navigate to projects list
    console.log('\n5️⃣ Navigating to Projects list...');
    const categoryLink = page.locator('a[href*="/admin/categories/"][href*="/projects"]').first();
    let categoryId = null;
    
    if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      const href = await categoryLink.getAttribute('href');
      categoryId = href?.match(/\/categories\/([^/]+)\/projects/)?.[1];
      await categoryLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      console.log('   → No categories with projects found, skipping projects list test');
    }

    // Step 6: Validate Projects List header (if we got there)
    if (categoryId) {
      console.log('\n6️⃣ Validating Projects list header...');
      const projectsHeader = await analyzeHeader();
      validation.pages.push({
        route: `/admin/categories/${categoryId}/projects`,
        name: 'Projects List',
        screenshot: await captureStep('projects-list-header', 'Projects list header'),
        headerAnalysis: projectsHeader
      });
      
      console.log(`   → Has AdminPageHeader: ${projectsHeader.hasAdminPageHeader ? '✅' : '❌'}`);
      console.log(`   → Has Breadcrumb: ${projectsHeader.hasBreadcrumb ? '✅' : '❌'}`);
      console.log(`   → Breadcrumb: ${projectsHeader.breadcrumbItems || 'N/A'}`);
      console.log(`   → Action Buttons: ${projectsHeader.actionButtons}`);

      // Step 7: Create a project (so we can test project editor)
      console.log('\n7️⃣ Creating test project...');
      const createProjectBtn = page.getByRole('button', { name: /new project/i }).first();
      if (await createProjectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await createProjectBtn.click();
        await page.waitForTimeout(500);
        
        const projectTitleField = page.locator('input[name="title"]').first();
        if (await projectTitleField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await projectTitleField.fill('The Obsidian Crown');
          
          const submitBtn = page.getByRole('button', { name: /create|add project/i }).first();
          if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await submitBtn.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    // Step 8: Validate Project Editor header
    console.log('\n8️⃣ Validating Project editor header...');
    const projectLink = page.locator('a[href^="/admin/projects/"]').first();
    
    if (await projectLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      
      const projectEditorHeader = await analyzeHeader();
      validation.pages.push({
        route: page.url(),
        name: 'Project Editor',
        screenshot: await captureStep('project-editor-header', 'Project editor header'),
        headerAnalysis: projectEditorHeader
      });
      
      console.log(`   → Has AdminPageHeader: ${projectEditorHeader.hasAdminPageHeader ? '✅' : '❌'}`);
      console.log(`   → Has Breadcrumb: ${projectEditorHeader.hasBreadcrumb ? '✅' : '❌'}`);
      console.log(`   → Breadcrumb: ${projectEditorHeader.breadcrumbItems || 'N/A'}`);
      console.log(`   → Action Buttons: ${projectEditorHeader.actionButtons}`);
    } else {
      console.log('   → No project found to test editor');
    }

    // Step 9: Consistency validation
    console.log('\n9️⃣ Running consistency checks...');
    
    const pagesWithHeaders = validation.pages.filter(p => p.headerAnalysis.hasAdminPageHeader);
    const pagesWithBreadcrumbs = validation.pages.filter(p => p.headerAnalysis.hasBreadcrumb);
    
    validation.consistencyChecks = [
      {
        check: 'All pages use AdminPageHeader',
        pass: pagesWithHeaders.length === validation.pages.length,
        result: `${pagesWithHeaders.length}/${validation.pages.length} pages`,
        details: pagesWithHeaders.map(p => p.name)
      },
      {
        check: 'Level 2+ pages use breadcrumbs',
        pass: validation.pages.filter(p => p.name !== 'Dashboard').every(p => p.headerAnalysis.hasBreadcrumb),
        result: `${pagesWithBreadcrumbs.length}/${validation.pages.length - 1} non-dashboard pages`,
        details: pagesWithBreadcrumbs.map(p => p.name)
      },
      {
        check: 'Dashboard does NOT use breadcrumb',
        pass: !validation.pages.find(p => p.name === 'Dashboard')?.headerAnalysis.hasBreadcrumb,
        result: validation.pages.find(p => p.name === 'Dashboard')?.headerAnalysis.hasBreadcrumb ? 'FAIL - has breadcrumb' : 'PASS'
      }
    ];

    // Check for issues
    validation.pages.forEach(page => {
      if (!page.headerAnalysis.hasAdminPageHeader) {
        validation.issues.push({
          severity: 'critical',
          page: page.name,
          issue: 'Does not use AdminPageHeader component'
        });
      }
      
      if (page.name !== 'Dashboard' && !page.headerAnalysis.hasBreadcrumb) {
        validation.issues.push({
          severity: 'high',
          page: page.name,
          issue: 'Missing breadcrumb navigation (required for Level 2+ pages)'
        });
      }
      
      if (page.name === 'Dashboard' && page.headerAnalysis.hasBreadcrumb) {
        validation.issues.push({
          severity: 'medium',
          page: page.name,
          issue: 'Has breadcrumb but should not (dashboard is Level 1)'
        });
      }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ Consistency Checks:');
    validation.consistencyChecks.forEach(check => {
      const icon = check.pass ? '✅' : '❌';
      console.log(`   ${icon} ${check.check}: ${check.result}`);
    });

    if (validation.issues.length === 0) {
      console.log('\n🎉 NO ISSUES FOUND - All pages have consistent headers!');
    } else {
      console.log(`\n⚠️  Found ${validation.issues.length} issue(s):`);
      validation.issues.forEach(issue => {
        console.log(`   [${issue.severity.toUpperCase()}] ${issue.page}: ${issue.issue}`);
      });
    }

    console.log(`\n📸 Screenshots saved: ${stepNum} files in ${screenshotDir}`);
    console.log(`📄 Validation report: ai_working/validation-results.json`);

    // Save validation results
    fs.writeFileSync(
      'ai_working/validation-results.json',
      JSON.stringify(validation, null, 2)
    );

  } catch (error) {
    console.error('❌ Validation failed:', error);
    validation.criticalError = {
      message: error.message,
      stack: error.stack
    };
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }

  return validation;
}

validateHeaderConsistency().catch(console.error);
