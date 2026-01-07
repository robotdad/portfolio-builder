const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function addProjectImages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const imagesDir = 'test-assets/personas/sarah-chen/images';
  const personaPath = 'test-assets/personas/sarah-chen/persona.json';
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));
  
  try {
    console.log('🎨 Adding images to project\n');
    
    // Get first project with images from Period Restoration category
    const projectData = persona.categories[2].projects[0]; // The Gilded Court
    console.log(`Project: ${projectData.title}`);
    console.log(`Images available: ${projectData.photos.length}\n`);
    
    // Find the project ID from database
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click into Period Restoration category projects
    const periodLink = page.locator('a[href*="/projects"]').filter({ hasText: 'Period' }).first();
    if (await periodLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await periodLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Click first project
      const projectLink = page.locator('a[href^="/admin/projects/"]').first();
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const projectUrl = page.url();
      console.log(\`✓ Opened project: \${projectUrl}\n\`);
      
      await page.screenshot({ path: 'ai_working/project-before-images.png', fullPage: true });
      
      // Upload featured image - look for the image picker
      console.log('Step 1: Setting featured image');
      const selectImageBtn = page.locator('button:has-text("Select Image"), button:has-text("Change"), button:has-text("Add photo")').first();
      
      if (await selectImageBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await selectImageBtn.click();
        await page.waitForTimeout(500);
        
        // Look for upload option in modal
        const uploadTab = page.locator('button:has-text("Upload"), [role="tab"]:has-text("Upload")').first();
        if (await uploadTab.isVisible({ timeout: 1000 }).catch(() => false)) {
          await uploadTab.click();
          await page.waitForTimeout(300);
        }
        
        const fileInput = page.locator('input[type="file"]').last();
        const featuredImage = projectData.photos.find(p => p.isFeatured);
        const featuredPath = path.join(imagesDir, featuredImage.file);
        
        console.log(\`  → Uploading: \${featuredImage.file}\`);
        await fileInput.setInputFiles(featuredPath);
        await page.waitForTimeout(3000);
        
        // Click select/confirm
        const confirmBtn = page.locator('button:has-text("Select"), button:has-text("Confirm")').last();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(1000);
        }
        console.log('  ✓ Featured image set\n');
      }
      
      await page.screenshot({ path: 'ai_working/project-with-featured.png', fullPage: true });
      
      // Add a gallery section
      console.log('Step 2: Adding gallery section');
      const addSectionBtn = page.locator('button[class*="add-section"], button:has-text("Add Section")').first();
      
      if (await addSectionBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addSectionBtn.click();
        await page.waitForTimeout(500);
        
        // Look for Gallery option
        const galleryBtn = page.locator('button:has-text("Gallery"), button:has-text("Image Gallery")').first();
        if (await galleryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await galleryBtn.click();
          await page.waitForTimeout(1000);
          console.log('  ✓ Gallery section added\n');
          
          // Upload multiple images
          console.log('Step 3: Uploading gallery images');
          const galleryFileInput = page.locator('input[type="file"][multiple], input[type="file"]').last();
          
          if (await galleryFileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            const galleryImages = projectData.photos.slice(0, 4).map(p => path.join(imagesDir, p.file));
            console.log(\`  → Uploading \${galleryImages.length} images...\`);
            
            await galleryFileInput.setInputFiles(galleryImages);
            await page.waitForTimeout(6000); // Wait for all uploads
            
            console.log('  ✓ Gallery images uploaded\n');
          }
        }
      }
      
      await page.screenshot({ path: 'ai_working/project-with-gallery.png', fullPage: true });
      
      // Save
      const saveBtn = page.locator('button:has-text("Save Draft")').first();
      await saveBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Project saved\n');
      
      console.log('✅ Project populated with images successfully!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'ai_working/project-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

addProjectImages().catch(console.error);
