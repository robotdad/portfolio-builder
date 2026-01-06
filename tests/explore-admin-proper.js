const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function exploreAdminProperly() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const findings = {
    steps: [],
    navigation: [],
    sections: [],
    issues: []
  };
  let stepNum = 0;

  async function captureStep(name, description, analysis = {}) {
    stepNum++;
    const filename = `step-${String(stepNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
    
    const step = {
      step: stepNum,
      name,
      description,
      screenshot: filename,
      url: page.url(),
      timestamp: new Date().toISOString(),
      ...analysis
    };
    
    findings.steps.push(step);
    console.log(`✓ Step ${stepNum}: ${name}`);
    return step;
  }

  async function captureNavigation() {
    // Try to capture all navigation elements
    const navElements = {
      header: null,
      sidebar: null,
      mainNav: [],
      buttons: []
    };

    // Check for header
    const header = page.locator('header, [role="banner"]').first();
    if (await header.isVisible().catch(() => false)) {
      navElements.header = {
        text: await header.textContent().catch(() => ''),
        html: await header.innerHTML().catch(() => '')
      };
    }

    // Check for sidebar
    const sidebar = page.locator('aside, nav[class*="sidebar" i]').first();
    if (await sidebar.isVisible().catch(() => false)) {
      navElements.sidebar = {
        text: await sidebar.textContent().catch(() => ''),
        html: await sidebar.innerHTML().catch(() => '')
      };
    }

    // Capture all links
    const links = await page.locator('a[href]').all();
    for (const link of links) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = await link.textContent().catch(() => '');
      if (href && text.trim()) {
        navElements.mainNav.push({ href, text: text.trim() });
      }
    }

    // Capture all buttons
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent().catch(() => '');
      const ariaLabel = await button.getAttribute('aria-label').catch(() => null);
      if (text.trim() || ariaLabel) {
        navElements.buttons.push({ 
          text: text.trim(), 
          ariaLabel,
          visible: await button.isVisible().catch(() => false)
        });
      }
    }

    return navElements;
  }

  try {
    console.log('Starting proper admin interface exploration...\n');

    // Step 1: Try to go directly to admin
    console.log('Attempting to access /admin...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    const adminUrl = page.url();
    console.log(`Current URL after /admin: ${adminUrl}`);
    
    await captureStep('admin-initial', 'First load of /admin route');

    // Step 2: Check if we're in welcome/onboarding
    if (adminUrl.includes('/welcome')) {
      console.log('\n📋 Onboarding flow detected');
      await captureStep('onboarding-start', 'Onboarding welcome screen');

      // Fill out onboarding form with Sarah Chen's data
      const personaData = {
        name: 'Sarah Chen',
        title: 'Theatre Costume Designer',
        bio: 'Theatre designer specializing in character design and fabrication, with experience in Shakespearean tragedy, high-concept sci-fi, and period restoration.'
      };

      // Try to find and fill name field
      const nameSelectors = ['input[name="name"]', 'input[placeholder*="name" i]', 'input[type="text"]'];
      for (const selector of nameSelectors) {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
          await field.fill(personaData.name);
          console.log(`✓ Filled name: ${personaData.name}`);
          break;
        }
      }
      await captureStep('onboarding-name-filled', 'Name field filled');

      // Try to find and fill title/role field
      const titleSelectors = ['input[name="title"]', 'input[name="role"]', 'input[placeholder*="title" i]', 'input[placeholder*="role" i]'];
      for (const selector of titleSelectors) {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
          await field.fill(personaData.title);
          console.log(`✓ Filled title: ${personaData.title}`);
          break;
        }
      }
      await captureStep('onboarding-title-filled', 'Title field filled');

      // Look for continue/submit button
      const continueButton = page.getByRole('button', { name: /continue|next|submit|get started|create portfolio/i }).first();
      if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueButton.click();
        console.log('✓ Clicked continue button');
        await page.waitForLoadState('networkidle');
        await captureStep('onboarding-submitted', 'After submitting onboarding');
      }
    }

    // Step 3: We should now be in the admin interface
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    console.log(`\n📍 Final URL: ${finalUrl}`);
    
    if (!finalUrl.includes('/admin')) {
      findings.issues.push({
        type: 'routing',
        severity: 'high',
        description: 'After accessing /admin, ended up at: ' + finalUrl,
        expected: 'Should be at /admin or /admin/* route'
      });
    }

    await captureStep('admin-main', 'Main admin interface');

    // Step 4: Capture complete navigation structure
    console.log('\n🔍 Analyzing navigation structure...');
    const nav = await captureNavigation();
    findings.navigation = nav;
    
    console.log(`Found ${nav.mainNav.length} navigation links`);
    console.log(`Found ${nav.buttons.length} buttons`);

    // Step 5: Analyze page structure
    const pageStructure = {
      hasHeader: nav.header !== null,
      hasSidebar: nav.sidebar !== null,
      headerContent: nav.header?.text || '',
      sidebarContent: nav.sidebar?.text || '',
      mainLinks: nav.mainNav,
      visibleButtons: nav.buttons.filter(b => b.visible)
    };

    findings.sections.push({
      name: 'Admin Landing Page',
      structure: pageStructure
    });

    // Step 6: Try to navigate to each major section
    const sectionsToExplore = [
      { name: 'Categories', patterns: ['/admin/categories', 'categories'] },
      { name: 'Projects', patterns: ['/admin/projects', 'projects'] },
      { name: 'Settings', patterns: ['/admin/settings', 'settings'] },
      { name: 'Theme', patterns: ['/admin/theme', 'theme'] },
      { name: 'Preview', patterns: ['/preview', 'preview'] }
    ];

    for (const section of sectionsToExplore) {
      console.log(`\n📂 Exploring ${section.name}...`);
      
      // Try direct URL first
      try {
        await page.goto(`http://localhost:3000${section.patterns[0]}`);
        await page.waitForLoadState('networkidle');
        
        const sectionUrl = page.url();
        if (!sectionUrl.includes('404') && !sectionUrl.includes('not-found')) {
          await captureStep(`section-${section.name.toLowerCase()}`, `${section.name} section`);
          
          const sectionNav = await captureNavigation();
          findings.sections.push({
            name: section.name,
            url: sectionUrl,
            navigation: sectionNav,
            accessible: true
          });
          
          // Go back to admin home
          await page.goto('http://localhost:3000/admin');
          await page.waitForLoadState('networkidle');
        } else {
          findings.sections.push({
            name: section.name,
            accessible: false,
            attemptedUrl: section.patterns[0]
          });
        }
      } catch (error) {
        console.log(`⚠ Could not access ${section.name}: ${error.message}`);
        findings.sections.push({
          name: section.name,
          accessible: false,
          error: error.message
        });
      }
    }

    // Step 7: Test adding content - try to find "Add" or "Create" buttons
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    
    console.log('\n➕ Looking for content creation options...');
    const createButtons = await page.getByRole('button', { name: /add|create|new|\+/i }).all();
    
    if (createButtons.length > 0) {
      console.log(`Found ${createButtons.length} create/add buttons`);
      findings.contentCreation = {
        available: true,
        buttonCount: createButtons.length
      };
      
      // Click the first one and see what happens
      if (createButtons.length > 0 && await createButtons[0].isVisible()) {
        await createButtons[0].click();
        await page.waitForTimeout(500);
        await captureStep('create-dialog', 'After clicking create button');
        
        // Check if a modal/dialog opened
        const dialog = page.locator('[role="dialog"], .modal, [class*="dialog"]').first();
        if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
          findings.contentCreation.hasModal = true;
          findings.contentCreation.modalContent = await dialog.textContent().catch(() => '');
        }
      }
    } else {
      findings.contentCreation = {
        available: false,
        note: 'No obvious create/add buttons found'
      };
    }

    // Step 8: Capture full page text for analysis
    const fullPageText = await page.locator('body').textContent();
    findings.fullPageText = fullPageText;

    // Summary
    console.log(`\n✅ Admin exploration complete!`);
    console.log(`✓ Captured ${stepNum} screenshots`);
    console.log(`✓ Found ${findings.navigation.mainNav.length} navigation items`);
    console.log(`✓ Explored ${findings.sections.length} sections`);
    console.log(`✓ Identified ${findings.issues.length} potential issues`);

    // Save findings
    fs.writeFileSync(
      path.join('ai_working', 'admin-findings-detailed.json'),
      JSON.stringify(findings, null, 2)
    );
    console.log(`✓ Findings saved to: ai_working/admin-findings-detailed.json`);

  } catch (error) {
    console.error('❌ Error during exploration:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error-final.png'),
      fullPage: true 
    });
    findings.criticalError = {
      message: error.message,
      stack: error.stack
    };
    throw error;
  } finally {
    await browser.close();
  }

  return findings;
}

exploreAdminProperly().catch(console.error);
