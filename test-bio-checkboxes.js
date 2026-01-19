const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set default timeout to 10 seconds
  page.setDefaultTimeout(10000);
  
  const results = {
    checkboxesAppeared: false,
    flowCompleted: false,
    errors: [],
    screenshots: []
  };

  try {
    console.log('Step 1: Navigate to onboarding page...');
    await page.goto('http://localhost:3000/welcome/portfolio');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshot-1-initial.png', fullPage: true });
    results.screenshots.push('screenshot-1-initial.png');

    console.log('Step 2: Fill in portfolio name...');
    const nameInput = page.getByLabel(/portfolio name/i);
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.fill('Test Portfolio');
    await page.screenshot({ path: 'screenshot-2-name-filled.png', fullPage: true });
    results.screenshots.push('screenshot-2-name-filled.png');

    console.log('Step 3: Click "Add More Details (Optional)" to expand...');
    const expandButton = page.getByRole('button', { name: /add more details/i });
    await expandButton.waitFor({ state: 'visible' });
    await expandButton.click();
    await page.waitForTimeout(500); // Brief wait for expansion animation
    await page.screenshot({ path: 'screenshot-3-expanded.png', fullPage: true });
    results.screenshots.push('screenshot-3-expanded.png');

    console.log('Step 4: Fill in bio...');
    const bioInput = page.getByLabel(/about you/i);
    await bioInput.waitFor({ state: 'visible' });
    await bioInput.fill("I'm a designer");
    await page.screenshot({ path: 'screenshot-4-bio-filled.png', fullPage: true });
    results.screenshots.push('screenshot-4-bio-filled.png');

    console.log('Step 5: Check if "Where should your bio appear?" section appears...');
    // Wait a moment for the section to appear
    await page.waitForTimeout(500);
    
    const bioPlacementSection = page.getByText(/where should your bio appear/i);
    const isSectionVisible = await bioPlacementSection.isVisible().catch(() => false);
    
    if (isSectionVisible) {
      console.log('✓ Bio placement section is visible!');
      results.checkboxesAppeared = true;
      
      console.log('Step 6: Check both checkboxes...');
      // Look for Home page checkbox
      const homeCheckbox = page.getByRole('checkbox', { name: /home page/i });
      const aboutCheckbox = page.getByRole('checkbox', { name: /about page/i });
      
      const homeVisible = await homeCheckbox.isVisible().catch(() => false);
      const aboutVisible = await aboutCheckbox.isVisible().catch(() => false);
      
      console.log(`  Home page checkbox visible: ${homeVisible}`);
      console.log(`  About page checkbox visible: ${aboutVisible}`);
      
      if (homeVisible) {
        await homeCheckbox.check();
        console.log('  ✓ Checked Home page checkbox');
      }
      
      if (aboutVisible) {
        await aboutCheckbox.check();
        console.log('  ✓ Checked About page checkbox');
      }
      
      console.log('Step 7: Take screenshot of form with checkboxes...');
      await page.screenshot({ path: 'screenshot-5-checkboxes-checked.png', fullPage: true });
      results.screenshots.push('screenshot-5-checkboxes-checked.png');
    } else {
      console.log('✗ Bio placement section NOT visible');
      results.errors.push('Bio placement section did not appear after filling bio');
      await page.screenshot({ path: 'screenshot-error-no-section.png', fullPage: true });
      results.screenshots.push('screenshot-error-no-section.png');
    }

    console.log('Step 8: Click Continue...');
    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshot-6-theme-step.png', fullPage: true });
    results.screenshots.push('screenshot-6-theme-step.png');

    console.log('Step 9: Complete theme step...');
    // Select first theme
    const themeOption = page.locator('[role="radio"]').first();
    await themeOption.waitFor({ state: 'visible' });
    await themeOption.click();
    
    const themeContinue = page.getByRole('button', { name: /continue/i });
    await themeContinue.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshot-7-category-step.png', fullPage: true });
    results.screenshots.push('screenshot-7-category-step.png');

    console.log('Step 10: Complete category/project step...');
    // Select a category
    const categorySelect = page.getByRole('combobox');
    await categorySelect.waitFor({ state: 'visible' });
    await categorySelect.click();
    
    // Select first option
    const firstOption = page.getByRole('option').first();
    await firstOption.click();
    
    // Fill project name
    const projectNameInput = page.getByLabel(/project name/i);
    await projectNameInput.fill('Test Project');
    
    await page.screenshot({ path: 'screenshot-8-project-filled.png', fullPage: true });
    results.screenshots.push('screenshot-8-project-filled.png');
    
    // Click finish/complete
    const finishButton = page.getByRole('button', { name: /(finish|complete)/i });
    await finishButton.click();
    
    console.log('Step 11: Wait for portfolio creation...');
    // Wait for redirect to home or success
    await page.waitForURL('**/', { timeout: 10000 }).catch(() => {
      console.log('Did not redirect to home, checking current URL...');
    });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshot-9-after-complete.png', fullPage: true });
    results.screenshots.push('screenshot-9-after-complete.png');
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('localhost:3000') && !currentUrl.includes('welcome')) {
      console.log('✓ Portfolio creation succeeded!');
      results.flowCompleted = true;
      
      console.log('Step 12: Check if Home page has profile card...');
      await page.goto('http://localhost:3000/');
      await page.waitForLoadState('networkidle');
      
      const profileCard = page.locator('text="I\'m a designer"');
      const hasProfileCard = await profileCard.isVisible().catch(() => false);
      console.log(`  Profile card with bio on Home page: ${hasProfileCard}`);
      
      await page.screenshot({ path: 'screenshot-10-home-page.png', fullPage: true });
      results.screenshots.push('screenshot-10-home-page.png');
      
      console.log('Step 13: Check if About page was created...');
      await page.goto('http://localhost:3000/about');
      await page.waitForLoadState('networkidle');
      
      const pageContent = await page.content();
      const hasAboutPage = !pageContent.includes('404') && !pageContent.includes('not found');
      console.log(`  About page exists: ${hasAboutPage}`);
      
      const aboutBio = page.locator('text="I\'m a designer"');
      const hasAboutBio = await aboutBio.isVisible().catch(() => false);
      console.log(`  Bio visible on About page: ${hasAboutBio}`);
      
      await page.screenshot({ path: 'screenshot-11-about-page.png', fullPage: true });
      results.screenshots.push('screenshot-11-about-page.png');
    } else {
      results.errors.push('Did not redirect to home page after completion');
    }

  } catch (error) {
    console.error('Error during test:', error);
    results.errors.push(error.message);
    await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
    results.screenshots.push('screenshot-error.png');
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Checkboxes appeared: ${results.checkboxesAppeared ? 'YES' : 'NO'}`);
  console.log(`✓ Flow completed: ${results.flowCompleted ? 'YES' : 'NO'}`);
  console.log(`✓ Errors: ${results.errors.length === 0 ? 'NONE' : results.errors.join(', ')}`);
  console.log(`✓ Screenshots: ${results.screenshots.join(', ')}`);
  console.log('='.repeat(60));
})();
