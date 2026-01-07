const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function populateWithImages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/image-population';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const personaPath = path.join(__dirname, '../test-assets/personas/sarah-chen/persona.json');
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));
  const imagesDir = path.join(__dirname, '../test-assets/personas/sarah-chen/images');

  try {
    console.log('🎭 Populating portfolio with images from test-assets\n');

    // ===== ABOUT PAGE =====
    console.log('📄 About Page - Adding profile photo and bio\n');
    
    // Navigate to About page editor
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click About in sidebar
    const aboutLink = page.locator('a').filter({ hasText: 'About' }).first();
    await aboutLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: path.join(screenshotDir, '01-about-page-empty.png'), fullPage: true });
    console.log('  ✓ About page opened');
    
    // Find the profile photo upload area
    const profilePhotoUpload = page.locator('input[type="file"]').first();
    if (await profilePhotoUpload.isVisible({ timeout: 2000 }).catch(() => false)) {
      const headshot = persona.profile.images[0];
      const headshotPath = path.join(imagesDir, headshot.file);
      
      console.log(`  → Uploading profile photo: ${headshot.file}`);
      await profilePhotoUpload.setInputFiles(headshotPath);
      await page.waitForTimeout(2000);  // Wait for upload
      
      await page.screenshot({ path: path.join(screenshotDir, '02-about-profile-uploaded.png'), fullPage: true });
      console.log('  ✓ Profile photo uploaded');
    }
    
    // Fill in name
    const nameField = page.locator('input[placeholder*="name" i]').first();
    if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nameField.fill(persona.persona.name);
      console.log(`  ✓ Name: ${persona.persona.name}`);
    }
    
    // Fill in title
    const titleField = page.locator('input[placeholder*="Designer" i], input[placeholder*="title" i]').first();
    if (await titleField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await titleField.fill(persona.persona.role);
      console.log(`  ✓ Title: ${persona.persona.role}`);
    }
    
    // Fill in bio using rich text editor
    const bioEditor = page.locator('div[contenteditable="true"], textarea[name="bio"], .ProseMirror').first();
    if (await bioEditor.isVisible({ timeout: 1000 }).catch(() => false)) {
      const bio = 'Theatre designer specializing in character design and fabrication, with experience in Shakespearean tragedy, high-concept sci-fi, and period restoration. My work brings dramatic narratives to life through authentic period detail and imaginative futuristic design.';
      await bioEditor.click();
      await bioEditor.fill(bio);
      console.log('  ✓ Bio added');
    }
    
    // Save
    const saveButton = page.locator('button:has-text("Save Draft")').first();
    if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(2000);
      console.log('  ✓ Saved About page');
    }
    
    await page.screenshot({ path: path.join(screenshotDir, '03-about-page-complete.png'), fullPage: true });
    console.log('');
    
    // ===== PROJECT =====
    console.log('🎨 Project - Adding images to "The Obsidian Crown"\n');
    
    // Navigate to categories
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find Shakespearean Tragedy category (it has projects)
    const categoryLinks = await page.locator('a[href*="/projects"]').all();
    let projectsPageFound = false;
    
    for (const link of categoryLinks) {
      const text = await link.textContent();
      if (text && text.includes('Period')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        projectsPageFound = true;
        break;
      }
    }
    
    if (!projectsPageFound && categoryLinks.length > 0) {
      await categoryLinks[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    console.log('  ✓ Navigated to projects list');
    
    // Click on first project
    const projectLink = page.locator('a[href^="/admin/projects/"]').first();
    if (await projectLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      await page.screenshot({ path: path.join(screenshotDir, '04-project-editor-empty.png'), fullPage: true });
      console.log('  ✓ Project editor opened');
      
      // Add featured image
      console.log('  → Setting featured image...');
      const featuredImageBtn = page.locator('button:has-text("Add photo"), button:has-text("Select"), button:has-text("Change")').first();
      if (await featuredImageBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await featuredImageBtn.click();
        await page.waitForTimeout(500);
        
        // Look for file upload in modal
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          const projectImages = persona.categories[2].projects[0].photos.slice(0, 1);  // First image
          const imagePath = path.join(imagesDir, projectImages[0].file);
          
          console.log(`    Uploading: ${projectImages[0].file}`);
          await fileInput.setInputFiles(imagePath);
          await page.waitForTimeout(3000);  // Wait for upload and processing
          
          // Click select/confirm button
          const selectBtn = page.locator('button:has-text("Select"), button:has-text("Confirm"), button:has-text("Upload")').first();
          if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await selectBtn.click();
            await page.waitForTimeout(1000);
          }
          
          console.log('    ✓ Featured image set');
        }
      }
      
      // Add gallery section
      console.log('  → Adding gallery section...');
      const addSectionBtn = page.locator('button:has-text("Add Section"), .add-section-btn, [aria-label*="Add"]').first();
      if (await addSectionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addSectionBtn.click();
        await page.waitForTimeout(500);
        
        // Look for gallery option in menu
        const galleryOption = page.locator('button:has-text("Gallery"), button:has-text("Image Gallery")').first();
        if (await galleryOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await galleryOption.click();
          await page.waitForTimeout(1000);
          console.log('    ✓ Gallery section added');
          
          // Upload multiple images to gallery
          const galleryUpload = page.locator('input[type="file"]').last();
          if (await galleryUpload.isVisible({ timeout: 2000 }).catch(() => false)) {
            const projectImages = persona.categories[2].projects[0].photos.slice(0, 5);  // First 5 images
            const imagePaths = projectImages.map(p => path.join(imagesDir, p.file));
            
            console.log(`    → Uploading ${imagePaths.length} images to gallery...`);
            await galleryUpload.setInputFiles(imagePaths);
            await page.waitForTimeout(5000);  // Wait for all uploads
            
            console.log('    ✓ Gallery images uploaded');
          }
        }
      }
      
      // Save project
      const saveProjectBtn = page.locator('button:has-text("Save Draft")').first();
      if (await saveProjectBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveProjectBtn.click();
        await page.waitForTimeout(2000);
        console.log('  ✓ Project saved');
      }
      
      await page.screenshot({ path: path.join(screenshotDir, '05-project-with-images.png'), fullPage: true });
    }
    
    console.log('\n✅ Image population complete!');
    console.log(`📸 Screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ 
      path: path.join(screenshotDir, 'error.png'),
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

populateWithImages().catch(console.error);
