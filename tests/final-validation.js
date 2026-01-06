const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function finalValidation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots-final';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = {
    timestamp: new Date().toISOString(),
    pages: [],
    issues: [],
    success: false
  };

  async function captureAndAnalyze(name, description, expectedBreadcrumb) {
    const filename = `${name}.png`;
    await page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });

    // Analyze header
    const header = page.locator('header.admin-page-header').first();
    const hasHeader = await header.isVisible().catch(() => false);
    
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]').first();
    const hasBreadcrumb = await breadcrumb.isVisible().catch(() => false);
    const breadcrumbText = hasBreadcrumb ? await breadcrumb.textContent() : null;
    
    const actions = page.locator('.header-actions').first();
    const actionCount = await actions.locator('button, a').count().catch(() => 0);

    const analysis = {
      name,
      description,
      url: page.url(),
      screenshot: filename,
      hasAdminPageHeader: hasHeader,
      hasBreadcrumb,
      breadcrumbText,
      actionCount,
      expectedBreadcrumb,
      breadcrumbMatches: expectedBreadcrumb === null ? !hasBreadcrumb : (breadcrumbText && breadcrumbText.includes(expectedBreadcrumb))
    };

    console.log(`   ✓ ${name}`);
    console.log(`     - AdminPageHeader: ${hasHeader ? '✅' : '❌'}`);
    console.log(`     - Breadcrumb: ${hasBreadcrumb ? `✅ "${breadcrumbText}"` : '(none)'}`);
    console.log(`     - Actions: ${actionCount} button(s)`);

    if (!hasHeader) {
      results.issues.push({
        page: name,
        severity: 'CRITICAL',
        issue: 'Missing AdminPageHeader component'
      });
    }

    if (expectedBreadcrumb && !hasBreadcrumb) {
      results.issues.push({
        page: name,
        severity: 'HIGH',
        issue: 'Missing expected breadcrumb'
      });
    }

    return analysis;
  }

  try {
    console.log('🚀 FINAL COMPREHENSIVE VALIDATION\n');
    console.log('='.repeat(70) + '\n');

    // SETUP: Create complete test portfolio
    console.log('📋 SETUP: Creating test portfolio...\n');
    
    await page.goto('http://localhost:3000/welcome');
    await page.waitForLoadState('networkidle');
    
    // Fill onboarding
    const nameInput = page.locator('input').first();
    await nameInput.fill('Sarah Chen');
    await page.waitForTimeout(300);
    
    const inputs = await page.locator('input').all();
    if (inputs.length > 1) {
      await inputs[1].fill('Theatre Costume Designer');
      await page.waitForTimeout(300);
    }
    
    const submitBtn = page.locator('button[type="submit"], button').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('✓ Portfolio created\n');

    // TEST SEQUENCE
    console.log('🧪 TESTING ALL 4 PAGE TYPES\n');
    console.log('='.repeat(70) + '\n');

    // Test 1: Dashboard
    console.log('1️⃣ DASHBOARD PAGE\n');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    const dash = await captureAndAnalyze('01-dashboard', 'Dashboard (Level 1)', null);
    results.pages.push(dash);
    console.log('');

    // Test 2: Categories
    console.log('2️⃣ CATEGORIES PAGE\n');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    const cats = await captureAndAnalyze('02-categories', 'Categories (Level 2)', 'Dashboard');
    results.pages.push(cats);
    console.log('');

    // Create a category for testing
    console.log('   → Creating test category for Level 3/4 tests...');
    const newCatBtn = page.getByRole('button', { name: /new category/i }).first();
    if (await newCatBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newCatBtn.click();
      await page.waitForTimeout(500);
      
      const catName = page.locator('input[name="name"]');
      await catName.fill('Shakespearean Tragedy');
      await page.waitForTimeout(300);
      
      const createBtn = page.getByRole('button', { name: /create/i }).first();
      await createBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      console.log('   ✓ Category created\n');
    }

    // Test 3: Projects List
    console.log('3️⃣ PROJECTS LIST PAGE\n');
    
    // Find the category link
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    const catLink = page.locator('a[href*="/admin/categories/"][href*="/projects"]').first();
    if (await catLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await catLink.click();
      await page.waitForLoadState('networkidle');
      
      const projs = await captureAndAnalyze('03-projects-list', 'Projects List (Level 3)', 'Shakespearean Tragedy');
      results.pages.push(projs);
      console.log('');

      // Create a project for Level 4 test
      console.log('   → Creating test project for Level 4 test...');
      const newProjBtn = page.getByRole('button', { name: /new project/i }).first();
      if (await newProjBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await newProjBtn.click();
        await page.waitForTimeout(500);
        
        const projTitle = page.locator('input[name="title"]');
        await projTitle.fill('The Obsidian Crown');
        await page.waitForTimeout(300);
        
        const createBtn = page.getByRole('button', { name: /create/i }).first();
        await createBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        console.log('   ✓ Project created\n');
      }

      // Test 4: Project Editor
      console.log('4️⃣ PROJECT EDITOR PAGE\n');
      
      // Find the project link
      const projLink = page.locator('a[href^="/admin/projects/"]').first();
      if (await projLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await projLink.click();
        await page.waitForLoadState('networkidle');
        
        const editor = await captureAndAnalyze('04-project-editor', 'Project Editor (Level 4)', 'The Obsidian Crown');
        results.pages.push(editor);
        console.log('');
      }
    } else {
      console.log('   ⚠️  Could not find category to test Projects List\n');
    }

    // VALIDATION SUMMARY
    console.log('='.repeat(70));
    console.log('📊 VALIDATION RESULTS\n');

    const allHaveHeader = results.pages.every(p => p.hasAdminPageHeader);
    const level2PlusHaveBreadcrumb = results.pages.filter(p => p.expectedBreadcrumb !== null).every(p => p.hasBreadcrumb);
    const dashboardNoBreadcrumb = results.pages.find(p => p.name === '01-dashboard')?.hasBreadcrumb === false;

    console.log('✅ Consistency Checks:');
    console.log(`   ${allHaveHeader ? '✅' : '❌'} All pages use AdminPageHeader: ${results.pages.filter(p => p.hasAdminPageHeader).length}/${results.pages.length}`);
    console.log(`   ${dashboardNoBreadcrumb ? '✅' : '❌'} Dashboard has no breadcrumb (Level 1)`);
    console.log(`   ${level2PlusHaveBreadcrumb ? '✅' : '❌'} Level 2+ pages have breadcrumb`);

    results.success = allHaveHeader && level2PlusHaveBreadcrumb && dashboardNoBreadcrumb;

    if (results.issues.length === 0 && results.success) {
      console.log('\n🎉 SUCCESS: Perfect header consistency across all pages!');
    } else if (results.issues.length > 0) {
      console.log(`\n⚠️  Found ${results.issues.length} issue(s):`);
      results.issues.forEach(issue => {
        console.log(`   - [${issue.severity}] ${issue.page}: ${issue.issue}`);
      });
    }

    console.log(`\n📸 Screenshots: ${screenshotDir}`);
    console.log(`📄 Full report: ai_working/final-validation-results.json\n`);

    // Save results
    fs.writeFileSync(
      'ai_working/final-validation-results.json',
      JSON.stringify(results, null, 2)
    );

    return results;

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

finalValidation().catch(console.error);
