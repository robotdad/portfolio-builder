#!/usr/bin/env node

/**
 * Pure API-based persona population - NO browser automation
 * Uses native fetch (Node 18+) for fast, reliable REST API calls
 * 
 * Usage: node scripts/populate-persona-api.js [persona-id]
 * Example: node scripts/populate-persona-api.js sarah-chen
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
// Resolve paths relative to script location (project root), not cwd
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PERSONAS_DIR = path.join(PROJECT_ROOT, 'test-assets/personas');

// Helper to get MIME type
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', 
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[ext] || 'application/octet-stream';
}

// Generic API call helper
async function apiCall(method, endpoint, data = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) {
    opts.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, opts);
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(`API ${method} ${endpoint} failed (${response.status}): ${JSON.stringify(json)}`);
  }
  
  return json;
}

// Upload image helper using FormData
async function uploadImage(imagePath, portfolioId) {
  const fileBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imagePath);
  const mimeType = getMimeType(imagePath);
  
  // Use Blob instead of File - Node.js's File constructor doesn't properly transmit
  // buffer data via arrayBuffer(). Pass filename as 3rd param to formData.append()
  const blob = new Blob([fileBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, fileName);  // filename as 3rd param
  formData.append('portfolioId', portfolioId);
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${JSON.stringify(json)}`);
  }
  
  return json;
}

// Main function - no longer needs async IIFE with browser
async function populatePersona(personaId = 'sarah-chen') {
  console.log(`🎭 Populating Portfolio for: ${personaId} (API-only mode)`);
  console.log('============================================================\n');

  const personaDir = path.join(PERSONAS_DIR, personaId);
  const personaPath = path.join(personaDir, 'persona.json');

  if (!fs.existsSync(personaPath)) {
    throw new Error(`Persona not found: ${personaPath}`);
  }

  const personaData = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));
  const stats = { categories: 0, projects: 0, images: 0, galleryImages: 0 };
  const startTime = Date.now();

  // Step 1: Get or Create Portfolio
  console.log('📋 Setting up portfolio...');
  
  let portfolio;
  let portfolioId;
  
  try {
    // Check if portfolio already exists
    const getResponse = await fetch(`${API_BASE}/portfolio`);
    if (getResponse.ok) {
      portfolio = await getResponse.json();
      if (portfolio && portfolio.data?.id) {
        portfolioId = portfolio.data.id;
        console.log(`✓ Using existing portfolio: ${portfolioId}`);
      }
    }
  } catch (err) {
    // Portfolio doesn't exist, will create below
  }
  
  if (!portfolioId) {
    // Create new portfolio
    portfolio = await apiCall('POST', '/portfolio', {
      name: `${personaData.persona.name} Portfolio`,
      title: `${personaData.persona.name} Portfolio`,
      draftTheme: 'modern-minimal',
      publishedTheme: 'modern-minimal',
      draftTemplate: 'featured-grid',
      publishedTemplate: 'featured-grid',
      showAboutSection: true
    });
    portfolioId = portfolio.data.id;
    console.log(`✓ Portfolio created: ${portfolioId}`);
  }
  
  console.log('');

  // Step 2: Upload and set profile photo
  console.log('📸 Setting up profile...');
  const profilePhoto = personaData.profile?.images?.[0];
  
  if (profilePhoto) {
    const profilePath = path.join(personaDir, 'images', profilePhoto.file);
    if (fs.existsSync(profilePath)) {
      const profileAsset = await uploadImage(profilePath, portfolioId);
      stats.images++;

      // Construct bio
      const bio = `${personaData.persona.name} is a ${personaData.persona.role} specializing in ${personaData.categories.map(c => c.name).join(', ')}. With extensive experience bringing creative visions to life, their work has been featured across major productions, known for meticulous attention to detail and artistic innovation.`;

      await apiCall('PUT', '/portfolio', {
        id: portfolioId,
        bio: bio,
        profilePhotoId: profileAsset.id,
        showAboutSection: true
      });
      console.log('✓ Profile configured');
    }
  }

  // Step 3: Create categories
  console.log('\n📁 Creating categories...');
  const categoryMap = {};
  
  for (const category of personaData.categories || []) {
    const created = await apiCall('POST', '/categories', {
      portfolioId: portfolioId,
      name: category.name
    });
    categoryMap[category.name] = created.data.id;
    stats.categories++;
    console.log(`  ✓ ${category.name}`);
  }

  // Step 4: Process projects
  console.log('\n📝 Creating projects with images...');
  
  for (const category of personaData.categories || []) {
    const categoryId = categoryMap[category.name];
    console.log(`\n📁 ${category.name}`);
    console.log('─'.repeat(60));
    
    let categoryFeaturedImageId = null;
    
    for (const project of category.projects || []) {
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
        
        const featuredAsset = await uploadImage(featuredPath, portfolioId);
        stats.images++;
        
        // Track for category featured image
        if (featuredPhoto.file === category.featuredPhoto) {
          categoryFeaturedImageId = featuredAsset.id;
        }
        
        // Create project
        const projectData = await apiCall('POST', '/projects', {
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
              const asset = await uploadImage(photoPath, portfolioId);
              
              // Create ProjectGalleryImage junction record
              await apiCall('POST', `/projects/${projectId}/gallery`, {
                assetId: asset.id,
                altText: photo.description || '',
                caption: photo.description || '',
                order: galleryImages.length
              });
              
              // Create gallery image with CORRECT structure
              const galleryItemId = `gallery_image_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              galleryImages.push({
                id: galleryItemId,           // Unique gallery item ID
                imageId: asset.id,                // Asset ID reference
                imageUrl: asset.url,              // Full URL to image
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
            
            await apiCall('PUT', `/projects/${projectId}`, {
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
      await apiCall('PUT', `/categories/${categoryId}`, {
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
  
  const summaryPath = path.join(PROJECT_ROOT, 'ai_working', `${personaId}-summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ All done! View at: http://localhost:3000/`);
  console.log(`📄 Summary saved: ${summaryPath}`);
}

// Run
populatePersona(process.argv[2] || 'sarah-chen').catch(err => {
  console.error(`\n❌ Population failed: ${err.message}`);
  process.exit(1);
});
