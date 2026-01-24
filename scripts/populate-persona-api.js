#!/usr/bin/env node

/**
 * Enhanced persona population using persona-enhanced.json
 * Resets database and populates rich metadata for categories, projects, and images
 * 
 * Usage: node scripts/populate-persona-enhanced.js [persona-id] [--no-reset]
 * Example: node scripts/populate-persona-enhanced.js sarah-chen
 *          node scripts/populate-persona-enhanced.js emma-rodriguez --no-reset
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const API_BASE = 'http://localhost:3000/api';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

// Generate section IDs
function generateId() {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`API ${method} ${endpoint} returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
  }
  
  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(`API ${method} ${endpoint} failed (${response.status}): ${JSON.stringify(json)}`);
  }
  
  return json;
}

// Upload image helper with enhanced metadata
async function uploadImage(imagePath, portfolioId, altText = '', caption = '') {
  const fileBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imagePath);
  const mimeType = getMimeType(imagePath);
  
  const blob = new Blob([fileBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('portfolioId', portfolioId);
  if (altText) formData.append('altText', altText);
  if (caption) formData.append('caption', caption);
  
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

// Build rich caption from image metadata
function buildCaption(photo) {
  const parts = [];
  
  if (photo.description) {
    parts.push(photo.description);
  }
  
  if (photo.imageMetadata) {
    const meta = photo.imageMetadata;
    const metaParts = [];
    
    if (meta.photographer) metaParts.push(`Photo: ${meta.photographer}`);
    if (meta.scene) metaParts.push(`Scene: ${meta.scene}`);
    if (meta.performance_date) metaParts.push(meta.performance_date);
    if (meta.note) metaParts.push(meta.note);
    
    if (metaParts.length > 0) {
      parts.push(metaParts.join(' | '));
    }
  }
  
  return parts.join('\n');
}

// Find image file - handles both flat and nested folder structures
function findImagePath(personaDir, photo, category = null, project = null) {
  const possiblePaths = [];
  
  // New nested structure: categories/category-slug/project-slug/filename
  if (category && project) {
    const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    const projectSlug = project.slug || project.title.toLowerCase().replace(/\s+/g, '-');
    possiblePaths.push(path.join(personaDir, 'images', 'categories', categorySlug, projectSlug, path.basename(photo.file)));
  }
  
  // Direct path from photo.file (may include folders)
  possiblePaths.push(path.join(personaDir, 'images', photo.file));
  
  // Flat structure fallback
  possiblePaths.push(path.join(personaDir, 'images', path.basename(photo.file)));
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  
  return null;
}

// Build project content sections from enhanced metadata
function buildProjectSections(project, galleryImages) {
  const sections = [];
  
  // Overview section
  if (project.description) {
    sections.push({
      id: generateId(),
      type: 'text',
      heading: 'Overview',
      content: project.description
    });
  }
  
  // Project details as key-value section (if rich details available)
  if (project.projectDetails) {
    const details = project.projectDetails;
    const detailsText = [];
    
    if (details.production) detailsText.push(`**Production:** ${details.production}`);
    if (details.venue) detailsText.push(`**Venue:** ${details.venue}`);
    if (details.director) detailsText.push(`**Director:** ${details.director}`);
    if (details.timeline) detailsText.push(`**Timeline:** ${details.timeline}`);
    if (details.budget) detailsText.push(`**Budget:** ${details.budget}`);
    if (details.scale) detailsText.push(`**Scale:** ${details.scale}`);
    
    if (detailsText.length > 0) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: 'Production Details',
        content: detailsText.join('\n\n')
      });
    }
  }
  
  // Challenge/Approach/Outcome sections
  if (project.projectContent) {
    const content = project.projectContent;
    
    if (content.challenge) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: 'The Challenge',
        content: content.challenge
      });
    }
    
    if (content.approach) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: 'My Approach',
        content: content.approach
      });
    }
    
    if (content.outcome) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: 'Outcome',
        content: content.outcome
      });
    }
  }
  
  // Techniques as list section
  if (project.techniques && project.techniques.length > 0) {
    sections.push({
      id: generateId(),
      type: 'list',
      heading: 'Techniques & Skills',
      items: project.techniques.map(t => ({ text: t }))
    });
  }
  
  // Recognition as list section
  if (project.recognition && project.recognition.length > 0) {
    sections.push({
      id: generateId(),
      type: 'list',
      heading: 'Recognition',
      items: project.recognition.map(r => ({ text: r }))
    });
  }
  
  // Gallery section
  if (galleryImages.length > 0) {
    sections.push({
      id: generateId(),
      type: 'gallery',
      heading: 'Gallery',
      images: galleryImages
    });
  }
  
  return sections;
}

// Build category content sections from enhanced metadata
function buildCategorySections(category) {
  const sections = [];
  
  if (category.categoryContent) {
    const content = category.categoryContent;
    
    if (content.headline || content.introduction) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: content.headline || '',
        content: content.introduction || ''
      });
    }
    
    if (content.approach) {
      sections.push({
        id: generateId(),
        type: 'text',
        heading: 'My Approach',
        content: content.approach
      });
    }
  }
  
  return sections;
}

// Reset database (must run from src directory)
async function resetDatabase() {
  console.log('🗑️  Resetting database...');
  try {
    const srcDir = path.join(PROJECT_ROOT, 'src');
    execSync('npm run db:reset', { 
      cwd: srcDir, 
      stdio: 'inherit'
    });
    console.log('✓ Database reset complete\n');
  } catch (error) {
    throw new Error(`Database reset failed: ${error.message}`);
  }
}

// Main function
async function populatePersonaEnhanced(personaId = 'sarah-chen', skipReset = false) {
  console.log(`🎭 Enhanced Population for: ${personaId}`);
  console.log('============================================================\n');
  
  // Reset database unless --no-reset flag is passed
  if (!skipReset) {
    await resetDatabase();
  } else {
    console.log('⏭️  Skipping database reset (--no-reset)\n');
  }

  const personaDir = path.join(PERSONAS_DIR, personaId);
  
  // Try enhanced first, fall back to regular
  let personaPath = path.join(personaDir, 'persona-enhanced.json');
  if (!fs.existsSync(personaPath)) {
    personaPath = path.join(personaDir, 'persona.json');
    console.log('⚠️  No persona-enhanced.json found, using persona.json\n');
  }

  if (!fs.existsSync(personaPath)) {
    throw new Error(`Persona not found: ${personaPath}`);
  }

  const personaData = JSON.parse(fs.readFileSync(personaPath, 'utf-8'));
  const stats = { 
    categories: 0, 
    projects: 0, 
    images: 0, 
    galleryImages: 0,
    profileImages: 0,
    sectionsCreated: 0
  };
  const startTime = Date.now();

  // Step 1: Get or Create Portfolio
  console.log('📋 Setting up portfolio...');
  
  let portfolio;
  let portfolioId;
  let existingCategories = [];
  
  // After reset, always create fresh. Without reset, try to reuse existing.
  if (skipReset) {
    try {
      const getResponse = await fetch(`${API_BASE}/portfolio`);
      if (getResponse.ok) {
        portfolio = await getResponse.json();
        if (portfolio && portfolio.data?.id) {
          portfolioId = portfolio.data.id;
          existingCategories = portfolio.data.categories || [];
          console.log(`✓ Using existing portfolio: ${portfolioId} (${existingCategories.length} categories)`);
        }
      }
    } catch (err) {
      // Portfolio doesn't exist
    }
  }
  
  if (!portfolioId) {
    const name = personaData.persona?.name || personaId;
    portfolio = await apiCall('POST', '/portfolio', {
      name: `${name} Portfolio`,
      title: `${name} Portfolio`,
      draftTheme: 'modern-minimal',
      publishedTheme: 'modern-minimal',
      draftTemplate: 'featured-grid',
      publishedTemplate: 'featured-grid',
    });
    portfolioId = portfolio.data.id;
    console.log(`✓ Portfolio created: ${portfolioId}`);
  }
  
  console.log('');

  // Step 2: Upload profile images and set bio
  console.log('📸 Setting up profile...');
  
  const persona = personaData.persona || {};
  const profile = personaData.profile || {};
  let profileAssetId = null;
  let profileAssetUrl = null;
  
  // Use bio from enhanced persona or generate one
  let bio = persona.bio || '';
  if (!bio && persona.name && persona.role) {
    const categories = (personaData.categories || []).map(c => c.name).join(', ');
    bio = `${persona.name} is a ${persona.role}${persona.location ? ` based in ${persona.location}` : ''}. ${persona.yearsActive ? `Active ${persona.yearsActive}. ` : ''}Specializing in ${categories}.`;
  }
  
  // Upload primary profile image
  const profileImages = profile.images || [];
  const primaryProfile = profileImages.find(img => img.type === 'headshot_primary') || profileImages[0];
  
  if (primaryProfile) {
    const profilePath = findImagePath(personaDir, primaryProfile);
    if (profilePath) {
      const altText = primaryProfile.title || primaryProfile.description || `${persona.name} profile photo`;
      const caption = buildCaption(primaryProfile);
      
      const profileAsset = await uploadImage(profilePath, portfolioId, altText, caption);
      profileAssetId = profileAsset.id;
      profileAssetUrl = profileAsset.url;
      stats.images++;
      stats.profileImages++;
      
      await apiCall('PUT', '/portfolio', {
        id: portfolioId,
        bio: bio,
        profilePhotoId: profileAsset.id,
      });
      console.log('✓ Profile configured with bio');
    }
  }
  
  // Upload additional profile images (selfies, candids, etc.)
  for (const profileImg of profileImages.slice(1)) {
    const imgPath = findImagePath(personaDir, profileImg);
    if (imgPath) {
      const altText = profileImg.title || profileImg.description || '';
      const caption = buildCaption(profileImg);
      await uploadImage(imgPath, portfolioId, altText, caption);
      stats.images++;
      stats.profileImages++;
      console.log(`  ✓ Uploaded: ${profileImg.title || path.basename(profileImg.file)}`);
    }
  }

  // Step 3: Create pages
  console.log('\n📄 Creating pages...');
  
  const pagesCheck = await fetch(`${API_BASE}/portfolio`);
  const portfolioData = await pagesCheck.json();
  const existingPages = portfolioData?.data?.pages || [];
  
  const homepageExists = existingPages.some(p => p.isHomepage || p.slug === '' || p.slug === 'home');
  if (!homepageExists) {
    const homepageContent = JSON.stringify({
      sections: [{
        id: generateId(),
        type: 'hero',
        name: persona.name || personaId,
        title: `${persona.name || personaId} Portfolio`,
        bio: '',
        profileImageId: null,
        profileImageUrl: null,
        showResumeLink: false,
        resumeUrl: ''
      }]
    });
    
    await apiCall('POST', '/pages', {
      portfolioId: portfolioId,
      title: 'Home',
      slug: '',
      navOrder: 0,
      isHomepage: true,
      showInNav: false,
      draftContent: homepageContent,
      publishedContent: homepageContent
    });
    console.log('  ✓ Homepage created');
  } else {
    console.log('  ✓ Homepage already exists');
  }
  
  const aboutExists = existingPages.some(p => p.slug === 'about');
  if (bio && !aboutExists) {
    const aboutContent = JSON.stringify({
      sections: [{
        id: generateId(),
        type: 'hero',
        name: persona.name || personaId,
        title: `About ${persona.name || personaId}`,
        bio: bio,
        profileImageId: profileAssetId,
        profileImageUrl: profileAssetUrl,
        showResumeLink: false,
        resumeUrl: ''
      }]
    });
    
    await apiCall('POST', '/pages', {
      portfolioId: portfolioId,
      title: 'About',
      slug: 'about',
      navOrder: 1,
      isHomepage: false,
      showInNav: true,
      draftContent: aboutContent,
      publishedContent: aboutContent
    });
    console.log('  ✓ About page created');
  } else if (aboutExists) {
    console.log('  ✓ About page already exists');
  }

  // Step 4: Create categories with rich content
  console.log('\n📁 Creating categories...');
  const categoryMap = {};
  
  // Build lookup of existing categories by name (for --no-reset mode)
  const existingCategoryByName = {};
  for (const cat of existingCategories) {
    existingCategoryByName[cat.name] = cat;
  }
  
  for (const category of personaData.categories || []) {
    let categoryId;
    
    // Check if category already exists (only relevant in --no-reset mode)
    const existing = existingCategoryByName[category.name];
    if (existing) {
      categoryId = existing.id;
      categoryMap[category.name] = categoryId;
      console.log(`  ✓ ${category.name} (existing)`);
      continue; // Skip creation, use existing
    }
    
    const categoryPayload = {
      portfolioId: portfolioId,
      name: category.name
    };
    
    // Add description if available
    if (category.description) {
      categoryPayload.description = category.description;
    }
    
    const created = await apiCall('POST', '/categories', categoryPayload);
    categoryId = created.data.id;
    categoryMap[category.name] = categoryId;
    stats.categories++;
    
    // Add category content sections
    const categorySections = buildCategorySections(category);
    if (categorySections.length > 0) {
      const contentJson = JSON.stringify({ sections: categorySections });
      await apiCall('PUT', `/categories/${categoryId}`, {
        draftContent: contentJson,
        publishedContent: contentJson,
        order: category.order || 0
      });
      stats.sectionsCreated += categorySections.length;
      console.log(`  ✓ ${category.name} (${categorySections.length} sections)`);
    } else {
      console.log(`  ✓ ${category.name}`);
    }
  }

  // Step 5: Process projects with rich metadata
  console.log('\n📝 Creating projects with rich content...');
  
  for (const category of personaData.categories || []) {
    const categoryId = categoryMap[category.name];
    console.log(`\n📁 ${category.name}`);
    console.log('─'.repeat(60));
    
    let categoryFeaturedImageId = null;
    
    for (const project of category.projects || []) {
      console.log(`\n  ${project.title}`);
      
      try {
        // Find featured photo
        const featuredPhoto = project.photos?.find(p => 
          p.tags?.includes('featured') || p.isFeatured
        ) || project.photos?.[0];
        
        if (!featuredPhoto) {
          console.log('    ⚠️  No photos, skipping');
          continue;
        }
        
        const featuredPath = findImagePath(personaDir, featuredPhoto, category, project);
        if (!featuredPath) {
          console.log(`    ⚠️  Featured image not found: ${featuredPhoto.file}`);
          continue;
        }
        
        // Upload featured image with metadata
        const featuredAltText = featuredPhoto.title || featuredPhoto.description || project.title;
        const featuredCaption = buildCaption(featuredPhoto);
        const featuredAsset = await uploadImage(featuredPath, portfolioId, featuredAltText, featuredCaption);
        stats.images++;
        
        // Check if this is the category featured image
        if (category.featuredPhoto && featuredPhoto.file.includes(path.basename(category.featuredPhoto))) {
          categoryFeaturedImageId = featuredAsset.id;
        }
        
        // Extract project details
        const details = project.projectDetails || {};
        
        // Create project with real metadata
        const projectPayload = {
          categoryId,
          title: project.title,
          year: details.year ? String(details.year) : '2024',
          venue: details.venue || details.production || '',
          role: details.role || persona.role || '',
          isFeatured: project.isFeatured || false,
          featuredImageId: featuredAsset.id
        };
        
        const projectData = await apiCall('POST', '/projects', projectPayload);
        const projectId = projectData.data.id;
        stats.projects++;
        
        console.log(`    ✓ Created (${details.year || '2024'}, ${details.venue || 'venue'})`);
        
        // Upload gallery images
        const galleryPhotos = (project.photos || []).filter(p => 
          p !== featuredPhoto && !p.isIdentity
        );
        
        const galleryImages = [];
        
        if (galleryPhotos.length > 0) {
          console.log(`    📷 Uploading ${galleryPhotos.length} gallery images...`);
          
          for (const photo of galleryPhotos) {
            const photoPath = findImagePath(personaDir, photo, category, project);
            if (photoPath) {
              const altText = photo.title || photo.description || '';
              const caption = buildCaption(photo);
              
              const asset = await uploadImage(photoPath, portfolioId, altText, caption);
              
              const galleryRecord = await apiCall('POST', `/projects/${projectId}/gallery`, {
                assetId: asset.id,
                altText: altText,
                caption: caption,
                order: galleryImages.length
              });
              
              galleryImages.push({
                id: galleryRecord.id,
                imageId: asset.id,
                imageUrl: asset.url,
                altText: altText,
                caption: caption
              });
              
              stats.images++;
              stats.galleryImages++;
            }
          }
        }
        
        // Build and save rich project content
        const projectSections = buildProjectSections(project, galleryImages);
        if (projectSections.length > 0) {
          const contentJson = JSON.stringify({ sections: projectSections });
          await apiCall('PUT', `/projects/${projectId}`, {
            draftContent: contentJson,
            publishedContent: contentJson,
            order: project.order || 0
          });
          stats.sectionsCreated += projectSections.length;
          console.log(`    ✓ Added ${projectSections.length} content sections, ${galleryImages.length} gallery images`);
        }
        
      } catch (error) {
        console.error(`    ✗ Failed: ${error.message}`);
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
  console.log('📊 Enhanced Population Complete!');
  console.log('='.repeat(60));
  console.log(`Categories:          ${stats.categories}`);
  console.log(`Projects:            ${stats.projects}`);
  console.log(`Content Sections:    ${stats.sectionsCreated}`);
  console.log(`Total Images:        ${stats.images}`);
  console.log(`  - Profile:         ${stats.profileImages}`);
  console.log(`  - Featured:        ${stats.projects}`);
  console.log(`  - Gallery:         ${stats.galleryImages}`);
  console.log(`Time:                ${elapsed}s`);
  
  // Save summary
  const summary = {
    persona: personaId,
    timestamp: new Date().toISOString(),
    stats,
    elapsed: parseFloat(elapsed),
    success: true,
    enhanced: true
  };
  
  const summaryPath = path.join(PROJECT_ROOT, 'ai_working', `${personaId}-enhanced-summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\n✅ All done! View at: http://localhost:3000/`);
  console.log(`📄 Summary saved: ${summaryPath}`);
}

// Parse arguments
const args = process.argv.slice(2);
const skipReset = args.includes('--no-reset');
const personaId = args.find(arg => !arg.startsWith('--')) || 'sarah-chen';

// Run
populatePersonaEnhanced(personaId, skipReset).catch(err => {
  console.error(`\n✗ Population failed: ${err.message}`);
  process.exit(1);
});
