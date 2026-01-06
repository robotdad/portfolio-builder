const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveValidation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots-final';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const validation = {
    timestamp: new Date().toISOString(),
    pages: [],
    consistencyChecks: [],
    issues: [],
    visualAnalysis: []
  };

  let stepNum = 0;

  async function captureStep(name, description) {
    stepNum++;
    const filename = `${String(stepNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
    
    console.log(`✓ Captured: ${name}`);
    return filename;
  }

  async function analyzeHeader() {
    const header = page.locator('header.admin-page-header').first();
    const headerExists = await header.isVisible().catch(() => false);
    
    if (!headerExists) {
      return { hasAdminPageHeader: false };
    }

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]').first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    
    const actions = page.locator('.header-actions').first();
    const hasActions = await actions.isVisible().catch(() => false);
    
    return {
      hasAdminPageHeader: true,
      hasBreadcrumb,
      hasActions,
      breadcrumbText: hasBreadcrumb ? await breadcrumb.textContent() : null,
      actionButtonCount: hasActions ? await actions.locator('button, a').count() : 0,
      headerText: await header.textContent()
    };
  }

  try {
    console.log('🔍 Comprehensive Header Validation\n');
    console.log('='.repeat(60) + '\n');

    // Page 1: Dashboard
    console.log('1️⃣ Dashboard (/admin)');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    const dashboardAnalysis = await analyzeHeader();
    validation.pages.push({
      route: '/admin',
      name: 'Dashboard',
      level: 1,
      screenshot: await captureStep('dashboard', 'Dashboard page'),
      analysis: dashboardAnalysis,
      expected: { hasBreadcrumb: false, hasActions: true }
    });
    console.log(`   AdminPageHeader: ${dashboardAnalysis.hasAdminPageHeader ? '✅' : '❌'}`);
    console.log(`   Breadcrumb: ${dashboardAnalysis.hasBreadcrumb ? '❌ (should not have)' : '✅ (none)'}`);
    console.log(`   Actions: ${dashboardAnalysis.actionButtonCount || 0} buttons\n`);

    // Page 2: Categories
    console.log('2️⃣ Categories (/admin/categories)');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    const categoriesAnalysis = await analyzeHeader();
    validation.pages.push({
      route: '/admin/categories',
      name: 'Categories',
      level: 2,
      screenshot: await captureStep('categories', 'Categories page'),
      analysis: categoriesAnalysis,
      expected: { hasBreadcrumb: true, hasActions: true }
    });
    console.log(`   AdminPageHeader: ${categoriesAnalysis.hasAdminPageHeader ? '✅' : '❌'}`);
    console.log(`   Breadcrumb: ${categoriesAnalysis.hasBreadcrumb ? '✅' : '❌'} - "${categoriesAnalysis.breadcrumbText || 'N/A'}"`);
    console.log(`   Actions: ${categoriesAnalysis.actionButtonCount || 0} buttons\n`);

    // Page 3: Projects List (need to find a category)
    console.log('3️⃣ Projects List (/admin/categories/[id]/projects)');
    
    // Find first category link
    const categoryLinks = await page.locator('a[href*="/admin/categories/"][href*="/projects"]').all();
    if (categoryLinks.length > 0) {
      const categoryHref = await categoryLinks[0].getAttribute('href');
      await page.goto(`http://localhost:3000${categoryHref}`);
      await page.waitForLoadState('networkidle');
      
      const projectsListAnalysis = await analyzeHeader();
      validation.pages.push({
        route: categoryHref,
        name: 'Projects List',
        level: 3,
        screenshot: await captureStep('projects-list', 'Projects list page'),
        analysis: projectsListAnalysis,
        expected: { hasBreadcrumb: true, hasActions: true }
      });
      console.log(`   AdminPageHeader: ${projectsListAnalysis.hasAdminPageHeader ? '✅' : '❌'}`);
      console.log(`   Breadcrumb: ${projectsListAnalysis.hasBreadcrumb ? '✅' : '❌'} - "${projectsListAnalysis.breadcrumbText || 'N/A'}"`);
      console.log(`   Actions: ${projectsListAnalysis.actionButtonCount || 0} buttons\n`);
      
      // Page 4: Project Editor (need to find or create a project)
      console.log('4️⃣ Project Editor (/admin/projects/[id])');
      
      const projectLinks = await page.locator('a[href^="/admin/projects/"]').all();
      if (projectLinks.length > 0) {
        const projectHref = await projectLinks[0].getAttribute('href');
        await page.goto(`http://localhost:3000${projectHref}`);
        await page.waitForLoadState('networkidle');
        
        const projectEditorAnalysis = await analyzeHeader();
        validation.pages.push({
          route: projectHref,
          name: 'Project Editor',
          level: 4,
          screenshot: await captureStep('project-editor', 'Project editor page'),
          analysis: projectEditorAnalysis,
          expected: { hasBreadcrumb: true, hasActions: true }
        });
        console.log(`   AdminPageHeader: ${projectEditorAnalysis.hasAdminPageHeader ? '✅' : '❌'}`);
        console.log(`   Breadcrumb: ${projectEditorAnalysis.hasBreadcrumb ? '✅' : '❌'} - "${projectEditorAnalysis.breadcrumbText || 'N/A'}"`);
        console.log(`   Actions: ${projectEditorAnalysis.actionButtonCount || 0} buttons\n`);
      } else {
        console.log('   ⚠️  No projects found - creating one...');
        
        // Create a project
        const createBtn = page.getByRole('button', { name: /new project/i }).first();
        if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await createBtn.click();
          await page.waitForTimeout(500);
          
          const titleField = page.locator('input[name="title"]').first();
          if (await titleField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await titleField.fill('Test Project');
            const submitBtn = page.getByRole('button', { name: /create/i }).first();
            if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await submitBtn.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(1000);
              
              // Now find and navigate to the project
              const newProjectLink = page.locator('a[href^="/admin/projects/"]').first();
              if (await newProjectLink.isVisible({ timeout: 2000 }).catch(() => false)) {
                await newProjectLink.click();
                await page.waitForLoadState('networkidle');
                
                const projectEditorAnalysis = await analyzeHeader();
                validation.pages.push({
                  route: page.url(),
                  name: 'Project Editor',
                  level: 4,
                  screenshot: await captureStep('project-editor', 'Project editor page'),
                  analysis: projectEditorAnalysis,
                  expected: { hasBreadcrumb: true, hasActions: true }
                });
                console.log(`   AdminPageHeader: ${projectEditorAnalysis.hasAdminPageHeader ? '✅' : '❌'}`);
                console.log(`   Breadcrumb: ${projectEditorAnalysis.hasBreadcrumb ? '✅' : '❌'} - "${projectEditorAnalysis.breadcrumbText || 'N/A'}"`);
                console.log(`   Actions: ${projectEditorAnalysis.actionButtonCount || 0} buttons\n`);
              }
            }
          }
        }
      }
    } else {
      console.log('   ⚠️  No categories found\n');
    }

    // Consistency validation
    console.log('='.repeat(60));
    console.log('📊 CONSISTENCY VALIDATION\n');
    
    // Check 1: All pages use AdminPageHeader
    const pagesWithHeader = validation.pages.filter(p => p.analysis.hasAdminPageHeader);
    const check1 = {
      name: 'All pages use AdminPageHeader',
      pass: pagesWithHeader.length === validation.pages.length,
      tested: validation.pages.length,
      passed: pagesWithHeader.length,
      failed: validation.pages.filter(p => !p.analysis.hasAdminPageHeader).map(p => p.name)
    };
    validation.consistencyChecks.push(check1);
    console.log(`✓ ${check1.name}: ${check1.passed}/${check1.tested} pages`);
    if (!check1.pass) {
      console.log(`   Failed: ${check1.failed.join(', ')}`);
    }

    // Check 2: Dashboard does NOT have breadcrumb
    const dashboard = validation.pages.find(p => p.name === 'Dashboard');
    const check2 = {
      name: 'Dashboard has no breadcrumb (Level 1)',
      pass: dashboard ? !dashboard.analysis.hasBreadcrumb : false,
      result: dashboard ? (dashboard.analysis.hasBreadcrumb ? 'FAIL' : 'PASS') : 'N/A'
    };
    validation.consistencyChecks.push(check2);
    console.log(`✓ ${check2.name}: ${check2.result}`);

    // Check 3: All Level 2+ pages HAVE breadcrumb
    const level2Plus = validation.pages.filter(p => p.level >= 2);
    const level2PlusWithBreadcrumb = level2Plus.filter(p => p.analysis.hasBreadcrumb);
    const check3 = {
      name: 'All Level 2+ pages have breadcrumb',
      pass: level2PlusWithBreadcrumb.length === level2Plus.length,
      tested: level2Plus.length,
      passed: level2PlusWithBreadcrumb.length,
      failed: level2Plus.filter(p => !p.analysis.hasBreadcrumb).map(p => p.name)
    };
    validation.consistencyChecks.push(check3);
    console.log(`✓ ${check3.name}: ${check3.passed}/${check3.tested} pages`);
    if (!check3.pass) {
      console.log(`   Missing breadcrumb: ${check3.failed.join(', ')}`);
    }

    // Identify issues
    validation.pages.forEach(page => {
      if (!page.analysis.hasAdminPageHeader) {
        validation.issues.push({
          severity: 'CRITICAL',
          page: page.name,
          issue: 'Does not use AdminPageHeader component',
          expected: 'All admin pages must use AdminPageHeader',
          actual: 'Using old custom header implementation'
        });
      }

      if (page.expected.hasBreadcrumb && !page.analysis.hasBreadcrumb) {
        validation.issues.push({
          severity: 'HIGH',
          page: page.name,
          issue: 'Missing breadcrumb navigation',
          expected: `Level ${page.level} pages must have breadcrumb`,
          actual: 'No breadcrumb found'
        });
      }

      if (!page.expected.hasBreadcrumb && page.analysis.hasBreadcrumb) {
        validation.issues.push({
          severity: 'MEDIUM',
          page: page.name,
          issue: 'Has breadcrumb when it should not',
          expected: 'Dashboard (Level 1) should not have breadcrumb',
          actual: 'Breadcrumb present'
        });
      }
    });

    // Final summary
    console.log('\n' + '='.repeat(60));
    if (validation.issues.length === 0) {
      console.log('🎉 SUCCESS: All headers are consistent!');
      console.log('='.repeat(60));
      console.log('\n✅ All pages use unified AdminPageHeader component');
      console.log('✅ Navigation patterns follow hierarchy rules');
      console.log('✅ Breadcrumbs used consistently on Level 2+ pages');
      console.log('✅ Dashboard correctly has no breadcrumb');
    } else {
      console.log('⚠️  ISSUES FOUND');
      console.log('='.repeat(60));
      console.log(`\nFound ${validation.issues.length} issue(s):\n`);
      validation.issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.severity}] ${issue.page}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Expected: ${issue.expected}`);
        console.log(`   Actual: ${issue.actual}\n`);
      });
    }

    console.log(`\n📸 Screenshots: ${stepNum} files in ${screenshotDir}`);
    console.log(`📄 Validation report: ai_working/comprehensive-validation-results.json`);

    // Save results
    fs.writeFileSync(
      'ai_working/comprehensive-validation-results.json',
      JSON.stringify(validation, null, 2)
    );

    return validation;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

comprehensiveValidation().catch(console.error);
