const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function exploreAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const findings = [];
  let stepNum = 0;

  async function captureStep(name, description) {
    stepNum++;
    const filename = `${String(stepNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
    
    findings.push({
      step: stepNum,
      name,
      description,
      screenshot: filename,
      url: page.url(),
      timestamp: new Date().toISOString()
    });
    
    console.log(`✓ Step ${stepNum}: ${name}`);
  }

  try {
    console.log('Starting admin interface exploration...\n');

    // Initial load
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await captureStep('initial-load', 'Landing page or redirect');

    // Check if we need to go through onboarding
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/welcome')) {
      console.log('Found onboarding flow, proceeding...\n');
      
      await captureStep('welcome-start', 'Welcome/onboarding initial screen');
      
      // Try to find and fill name
      const nameInput = page.locator('input[name="name"], input[type="text"]').first();
      if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameInput.fill('Sarah Chen');
        await captureStep('name-filled', 'Name field filled');
      }
      
      // Try to find and fill role
      const roleInput = page.locator('input[name="role"], input[placeholder*="role" i], input[placeholder*="title" i]').first();
      if (await roleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await roleInput.fill('Theatre Costume Designer');
        await captureStep('role-filled', 'Role field filled');
      }
      
      // Try to find submit/continue button
      const continueButton = page.getByRole('button', { name: /continue|next|submit|get started/i }).first();
      if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueButton.click();
        await page.waitForLoadState('networkidle');
        await captureStep('onboarding-submitted', 'After submitting onboarding');
      }
    }

    // Now we should be in the admin area
    await page.waitForTimeout(1000); // Give it a moment to settle
    await captureStep('admin-landing', 'Admin interface landing page');

    // Capture navigation/header
    const header = page.locator('header, nav, [role="banner"], [role="navigation"]').first();
    if (await header.isVisible({ timeout: 2000 }).catch(() => false)) {
      findings.push({
        component: 'header',
        note: 'Header/navigation found',
        html: await header.innerHTML().catch(() => 'Unable to capture HTML')
      });
    }

    // Look for sidebar
    const sidebar = page.locator('aside, [role="complementary"], nav[class*="sidebar" i]').first();
    if (await sidebar.isVisible({ timeout: 2000 }).catch(() => false)) {
      findings.push({
        component: 'sidebar',
        note: 'Sidebar navigation found',
        html: await sidebar.innerHTML().catch(() => 'Unable to capture HTML')
      });
    }

    // Try to find main navigation items
    const navLinks = await page.locator('a[href*="/admin"], button').all();
    console.log(`\nFound ${navLinks.length} potential navigation elements`);
    
    // Capture all visible text for navigation analysis
    const visibleText = await page.locator('body').textContent();
    findings.push({
      component: 'page-text',
      note: 'All visible text on admin landing',
      content: visibleText
    });

    // Try to explore different sections
    const sectionsToTry = [
      { name: 'Projects', patterns: [/project/i, /portfolio/i] },
      { name: 'Categories', patterns: [/categor/i] },
      { name: 'Settings', patterns: [/setting/i, /profile/i] },
      { name: 'Theme', patterns: [/theme/i, /template/i] },
      { name: 'Publish', patterns: [/publish/i, /preview/i] },
      { name: 'About', patterns: [/about/i] }
    ];

    for (const section of sectionsToTry) {
      for (const pattern of section.patterns) {
        const link = page.getByRole('link', { name: pattern }).or(
          page.getByRole('button', { name: pattern })
        ).first();
        
        if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`\nExploring ${section.name}...`);
          await link.click();
          await page.waitForLoadState('networkidle');
          await captureStep(`section-${section.name.toLowerCase()}`, `${section.name} section`);
          
          // Go back to admin home
          const homeLink = page.getByRole('link', { name: /home|dashboard|admin/i }).first();
          if (await homeLink.isVisible({ timeout: 1000 }).catch(() => false)) {
            await homeLink.click();
            await page.waitForLoadState('networkidle');
          }
          break; // Found this section, move to next
        }
      }
    }

    // Try to add a project/category if possible
    const addButtons = page.getByRole('button', { name: /add|create|new/i });
    const addButtonCount = await addButtons.count();
    if (addButtonCount > 0) {
      console.log(`\nFound ${addButtonCount} add/create buttons`);
      await captureStep('add-buttons-visible', 'State showing add/create buttons');
      
      // Click first add button
      await addButtons.first().click();
      await page.waitForTimeout(500);
      await captureStep('add-dialog-open', 'After clicking add button');
    }

    // Summary
    console.log(`\n✓ Exploration complete!`);
    console.log(`✓ Captured ${stepNum} screenshots`);
    console.log(`✓ Screenshots saved to: ${screenshotDir}`);

    // Save findings
    fs.writeFileSync(
      path.join('ai_working', 'exploration-findings.json'),
      JSON.stringify(findings, null, 2)
    );
    console.log(`✓ Findings saved to: ai_working/exploration-findings.json`);

  } catch (error) {
    console.error('Error during exploration:', error);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

exploreAdmin().catch(console.error);
