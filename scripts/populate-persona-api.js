#!/usr/bin/env node

/**
 * Pure API-based persona population - NO UI automation
 * Fast, reliable, direct database population via REST API
 * 
 * Usage: node scripts/populate-persona-api.js [persona-id]
 * Example: node scripts/populate-persona-api.js sarah-chen
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const PERSONAS_DIR = 'test-assets/personas';

async function apiCall(context, method, endpoint, data = null) {
  const opts = { data };
  const response = await context.request[method.toLowerCase()](`${API_BASE}${endpoint}`, opts);
  
  if (!response.ok()) {
    const error = await response.text();
    throw new Error(`API ${method} ${endpoint} failed (${response.status()}): ${error}`);
  }
  
  return await response.json();
}

async function uploadImage(context, imagePath, portfolioId) {
  const response = await context.request.post(`${API_BASE}/upload`, {
    multipart: {
      file: fs.createReadStream(imagePath),
      portfolioId: portfolioId
    }
  });
  
  if (!response.ok()) {
    throw new Error(`Upload failed: ${response.statusText()}`);
  }
  
  return await response.json();
}

async function main() {
  const personaId = process.argv[2] || 'sarah-chen';
  const personaDir = path.join(PERSONAS_DIR, personaId);
  const personaPath = path.join(personaDir, 'persona.json');
  
  if (!fs.existsSync(personaPath)) {
    throw new Error(`Persona not found: ${personaId}\nPath: ${personaPath}`);
  }
  
  console.log(`🎭 Populating Portfolio for: ${personaId} (API-only mode)`);
  console.log('='.repeat(60));
  
  const personaData = JSON.parse(fs.readFileSync(personaPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const stats = {
    categories: 0,
    projects: 0,
    images: 0,
    galleryImages: 0
  };
  
  const startTime = Date.now();
  
  try {
    // Step 1: Get or Create Portfolio
    console.log('\n📋 Setting up portfolio...');
    
    // Check if portfolio already exists
    let getResponse = await context.request.get(`${API_BASE}/portfolio`);
    let portfolio;
    
    if (getResponse.ok()) {
      portfolio = await getResponse.json();
      if (portfolio && portfolio.id) {
        console.log(`✓ Using existing portfolio: ${portfolio.id}`);
      } else {
        // No portfolio exists (API returned null), create one
        portfolio = await apiCall(context, 'POST', '/portfolio', {
          name: `${personaData.persona.name} Portfolio`,
          slug: personaId,
          title: `${personaData.persona.name} Portfolio`,
          draftTheme: 'modern-minimal',
          publishedTheme: 'modern-minimal',
          draftTemplate: 'featured-grid',
          publishedTemplate: 'featured-grid',
          showAboutSection: true
        });
        console.log(`✓ Portfolio created: ${portfolio.id}`);
      }
    } else {
      // Create new portfolio
      portfolio = await apiCall(context, 'POST', '/portfolio', {
        name: `${personaData.persona.name} Portfolio`,
        slug: personaId,
        title: `${personaData.persona.name} Portfolio`,
        draftTheme: 'modern-minimal',
        publishedTheme: 'modern-minimal',
        draftTemplate: 'featured-grid',
        publishedTemplate: 'featured-grid',
        showAboutSection: true
      });
      console.log(`✓ Portfolio created: ${portfolio.id}`);
    }
    
    const portfolioId = portfolio.id;
    
    // Step 2: Upload and set profile photo
    console.log('\n📸 Setting up profile...');
    const profilePhoto = personaData.profile.images[0];
    const profilePath = path.join(personaDir, 'images', profilePhoto.file);
    
    const profileAsset = await uploadImage(context, profilePath, portfolioId);
    stats.images++;
    
    // Construct bio
    const bio = `${personaData.persona.name} is a ${personaData.persona.role} specializing in ${personaData.categories.map(c => c.name).join(', ')}. With extensive experience bringing creative visions to life, their work has been featured across major productions, known for meticulous attention to detail and artistic innovation.`;
    
    await apiCall(context, 'PUT', '/portfolio', {
      id: portfolioId,
      bio: bio,
      profilePhotoId: profileAsset.id,
      showAboutSection: true
    });
    
    console.log('✓ Profile configured');
    
    // Step 3: Create categories
    console.log('\n📁 Creating categories...');
    const categoryMap = {};
    
    for (const category of personaData.categories) {
      const created = await apiCall(context, 'POST', '/categories', {
        portfolioId: portfolioId,
        name: category.name
      });
      categoryMap[category.name] = created.data.id;
      stats.categories++;
      console.log(`  ✓ ${category.name}`);
    }
    
    // Step 4: Process projects
    console.log('\n📝 Creating projects with images...');
    
    for (const category of personaData.categories) {
      const categoryId = categoryMap[category.name];
      console.log(`\n📁 ${category.name}`);
      console.log('─'.repeat(60));
      
      let categoryFeaturedImageId = null;
      
      for (const project of category.projects) {
        console.log(`\n  ${project.title}`);
        
        try {
          // Upload featured image
          const featuredPhoto = project.photos.find(p => p.isFeatured);
          if (!featuredPhoto) {
            console.log('    ⚠️  No featured image, skipping');
            continue;
          }
          
          const featuredPath = path.join(personaDir, 'images', featuredPhoto.file);
          if (!fs.existsSync(featuredPath)) {
            console.log(`    ⚠️  Image not found: ${featuredPhoto.file}`);
            continue;
          }
          
          const featuredAsset = await uploadImage(context, featuredPath, portfolioId);
          stats.images++;
          
          // Track for category featured image
          if (featuredPhoto.file === category.featuredPhoto) {
            categoryFeaturedImageId = featuredAsset.id;
          }
          
          // Create project
          const projectData = await apiCall(context, 'POST', '/projects', {
            categoryId,
            title: project.title,
            year: '2024',
            venue: 'Regional Theatre',
            role: 'Lead Designer',
            isFeatured: project.isFeatured,
            featuredImageId: featuredAsset.id
          });
          
          const projectId = projectData.data.id;
          stats.projects++;
          console.log(`    ✓ Created with featured image`);
          
          // Upload gallery images
          const galleryPhotos = project.photos.filter(p => !p.isFeatured);
          if (galleryPhotos.length > 0) {
            console.log(`    📷 Uploading ${galleryPhotos.length} gallery images...`);
            
            const galleryImages = [];
            for (const photo of galleryPhotos) {
              const photoPath = path.join(personaDir, 'images', photo.file);
              if (fs.existsSync(photoPath)) {
                const asset = await uploadImage(context, photoPath, portfolioId);
                
                // Create gallery image with CORRECT structure
                const galleryItemId = `gallery_image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                galleryImages.push({
                  id: galleryItemId,           // Unique gallery item ID
                  imageId: asset.id,           // Asset ID reference
                  imageUrl: asset.url,         // Full URL to image
                  altText: photo.description || '',
                  caption: photo.description || ''
                });
                
                stats.images++;
                stats.galleryImages++;
              }
            }
            
            // Add gallery to project with correct structure
            if (galleryImages.length > 0) {
              const sectionId = `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              const sections = [{
                id: sectionId,
                type: 'gallery',
                heading: '',  // Required by schema
                images: galleryImages
              }];
              
              await apiCall(context, 'PUT', `/projects/${projectId}`, {
                draftContent: JSON.stringify({ sections })
              });
              
              console.log(`    ✓ Added ${galleryImages.length} gallery images`);
            }
          }
          
        } catch (error) {
          console.error(`    ❌ Failed: ${error.message}`);
        }
      }
      
      // Set category featured image
      if (categoryFeaturedImageId) {
        await apiCall(context, 'PUT', `/categories/${categoryId}`, {
          featuredImageId: categoryFeaturedImageId
        });
        console.log(`  ✓ Category featured image set`);
      }
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Population Complete!');
    console.log('='.repeat(60));
    console.log(`Categories:          ${stats.categories}`);
    console.log(`Projects:            ${stats.projects}`);
    console.log(`Total Images:        ${stats.images}`);
    console.log(`  - Profile:         1`);
    console.log(`  - Featured:        ${stats.projects}`);
    console.log(`  - Gallery:         ${stats.galleryImages}`);
    console.log(`Time:                ${elapsed}s`);
    
    // Save summary
    const summary = {
      persona: personaId,
      timestamp: new Date().toISOString(),
      stats,
      elapsed: parseFloat(elapsed),
      success: true
    };
    
    const summaryPath = path.join('ai_working', `${personaId}-summary.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Take screenshots
    console.log('\n📸 Capturing screenshots...');
    const page = await context.newPage();
    
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join('ai_working', `${personaId}-dashboard.png`),
      fullPage: true 
    });
    console.log('  ✓ Dashboard');
    
    await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join('ai_working', `${personaId}-categories.png`),
      fullPage: true 
    });
    console.log('  ✓ Categories');
    
    await page.goto(`http://localhost:3000/${personaId}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join('ai_working', `${personaId}-public-site.png`),
      fullPage: true 
    });
    console.log('  ✓ Public site');
    
    console.log(`\n✅ All done! View at: http://localhost:3000/${personaId}`);
    console.log(`📄 Summary saved: ${summaryPath}`);
    
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error('\n❌ Population failed:', error.message);
    
    const errorReport = {
      persona: personaId,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      stats,
      elapsed: parseFloat(elapsed),
      success: false
    };
    
    const errorPath = path.join('ai_working', `${personaId}-error.json`);
    fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));
    
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
