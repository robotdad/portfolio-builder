#!/usr/bin/env node

/**
 * Persona population script
 * Resets database and populates rich metadata for categories, projects, and images
 * 
 * Usage: node scripts/populate-persona-api.js [persona-id] [--no-reset]
 * Example: node scripts/populate-persona-api.js sarah-chen
 *          node scripts/populate-persona-api.js emma-rodriguez --no-reset
 * 
 * Authentication:
 *   - Run `npm run auth:login` first if auth is enabled
 *   - Or set AUTH_DISABLED=true for local development
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Layout enhancement modules
import { createTagContext, processPhotoTags } from './lib/tag-processor.js';
// Note: applyLayoutEnhancements is no longer used - replaced by per-persona layouts
// import { applyLayoutEnhancements } from './lib/apply-layouts.js';

// Per-persona layout dispatch
import {
  buildPersonaProjectPage,
  buildPersonaHomepage,
  buildPersonaAboutPage,
  buildPersonaCategoryPage,
} from './lib/persona-layouts.js';

// Auth support
import { getAuthHeaders, requireAuth } from './lib/auth-helper.js';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
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
  const authHeaders = getAuthHeaders();
  const opts = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders,
    },
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
  
  const authHeaders = getAuthHeaders();
  const response = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    body: formData,
    headers: authHeaders,
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
/**
 * Format plain text as HTML with proper paragraph structure
 */
function formatAsHtml(text) {
  if (!text) return '';
  // If already has HTML tags, return as-is
  if (/<[^>]+>/.test(text)) return text;
  
  // Split into sentences, group into paragraphs of 2-3 sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const paragraphs = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(' ');
    if (chunk.trim()) {
      paragraphs.push(`<p>${chunk.trim()}</p>`);
    }
  }
  
  return paragraphs.join('\n');
}

/**
 * Build project sections with SIDE-BY-SIDE layouts using layout-two-column.
 * 
 * Layout Pattern:
 * 1. HERO: Full-width image (immediate visual impact)
 * 2. INTRO: Two-column 60-40 (description left, project details right)
 * 3. CHALLENGE: Two-column 50-50 (text left, image right)
 * 4. PROCESS GALLERY: Full-width gallery (visual break)
 * 5. APPROACH: Two-column 40-60 (image left, text right) - ALTERNATES
 * 6. OUTCOME: Two-column 50-50 (text left, image right)
 * 7. DETAILS: Two-column 60-40 (techniques left, recognition right)
 * 8. FINAL GALLERY: Remaining images
 */
function buildProjectSections(project, galleryImages) {
  const sections = [];
  const images = [...galleryImages]; // Copy so we can consume from it
  
  // Helper to get next image if available
  const getNextImage = () => images.length > 0 ? images.shift() : null;
  
  // Helper to create image section for use in columns
  const createImageSection = (img, fallbackAlt = '') => ({
    id: generateId(),
    type: 'image',
    imageId: img.imageId || img.assetId || null,
    imageUrl: img.imageUrl || img.url || null,
    altText: img.altText || fallbackAlt,
    caption: img.caption || '',
    width: img.width,
    height: img.height
  });
  
  // Helper to create text section for use in columns
  const createTextSection = (content) => ({
    id: generateId(),
    type: 'text',
    content: content
  });
  
  // 1. HERO IMAGE - Full width at top (immediate visual impact)
  const heroImage = getNextImage();
  if (heroImage) {
    sections.push(createImageSection(heroImage, project.title || 'Hero image'));
  }
  
  // 2. INTRO SECTION - Two columns: Description (60%) + Project Details (40%)
  const hasDescription = project.description;
  const hasDetails = project.projectDetails && Object.keys(project.projectDetails).length > 0;
  
  if (hasDescription || hasDetails) {
    // Build description HTML
    const descriptionHtml = hasDescription 
      ? `<h1>${project.title || 'Project'}</h1>\n${formatAsHtml(project.description)}`
      : `<h1>${project.title || 'Project'}</h1>`;
    
    // Build details HTML
    let detailsHtml = '';
    if (hasDetails) {
      const details = project.projectDetails;
      const detailParts = [];
      if (details.production) detailParts.push(`<p><strong>Production:</strong> ${details.production}</p>`);
      if (details.venue) detailParts.push(`<p><strong>Venue:</strong> ${details.venue}</p>`);
      if (details.director) detailParts.push(`<p><strong>Director:</strong> ${details.director}</p>`);
      if (details.timeline) detailParts.push(`<p><strong>Timeline:</strong> ${details.timeline}</p>`);
      if (details.year) detailParts.push(`<p><strong>Year:</strong> ${details.year}</p>`);
      if (details.budget) detailParts.push(`<p><strong>Budget:</strong> ${details.budget}</p>`);
      if (details.scale) detailParts.push(`<p><strong>Scale:</strong> ${details.scale}</p>`);
      detailsHtml = `<h2>Details</h2>\n${detailParts.join('\n')}`;
    }
    
    if (hasDescription && hasDetails) {
      // Two-column layout: description left, details right
      sections.push({
        id: generateId(),
        type: 'layout-two-column',
        ratio: '60-40',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [createTextSection(descriptionHtml)],
        rightColumn: [createTextSection(detailsHtml)]
      });
    } else {
      // Single column fallback
      sections.push(createTextSection(hasDescription ? descriptionHtml : detailsHtml));
    }
  }
  
  // 3. CHALLENGE SECTION - Two columns: Text (50%) + Image (50%)
  if (project.projectContent?.challenge) {
    const challengeImage = getNextImage();
    const challengeHtml = `<h2>The Challenge</h2>\n${formatAsHtml(project.projectContent.challenge)}`;
    
    if (challengeImage) {
      sections.push({
        id: generateId(),
        type: 'layout-two-column',
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [createTextSection(challengeHtml)],
        rightColumn: [createImageSection(challengeImage, 'Challenge context')]
      });
    } else {
      sections.push(createTextSection(challengeHtml));
    }
  }
  
  // 4. PROCESS GALLERY - Full width visual break (3 images)
  const processImages = [];
  for (let i = 0; i < 3 && images.length > 0; i++) {
    const img = images.shift();
    processImages.push({
      id: generateId(),
      imageId: img.imageId || img.assetId || null,
      imageUrl: img.imageUrl || img.url || null,
      altText: img.altText || 'Process image',
      caption: img.caption || '',
      width: img.width,
      height: img.height
    });
  }
  if (processImages.length > 0) {
    sections.push({
      id: generateId(),
      type: 'gallery',
      heading: '',
      images: processImages
    });
  }
  
  // 5. APPROACH SECTION - Two columns: Image (40%) + Text (60%) - ALTERNATES direction
  if (project.projectContent?.approach) {
    const approachImage = getNextImage();
    const approachHtml = `<h2>My Approach</h2>\n${formatAsHtml(project.projectContent.approach)}`;
    
    if (approachImage) {
      sections.push({
        id: generateId(),
        type: 'layout-two-column',
        ratio: '40-60',
        gap: 'default',
        mobileStackOrder: 'right-first', // Show text first on mobile
        leftColumn: [createImageSection(approachImage, 'Approach visualization')],
        rightColumn: [createTextSection(approachHtml)]
      });
    } else {
      sections.push(createTextSection(approachHtml));
    }
  }
  
  // 6. OUTCOME SECTION - Two columns: Text (50%) + Image (50%)
  if (project.projectContent?.outcome) {
    const outcomeImage = getNextImage();
    const outcomeHtml = `<h2>The Outcome</h2>\n${formatAsHtml(project.projectContent.outcome)}`;
    
    if (outcomeImage) {
      sections.push({
        id: generateId(),
        type: 'layout-two-column',
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [createTextSection(outcomeHtml)],
        rightColumn: [createImageSection(outcomeImage, 'Project outcome')]
      });
    } else {
      sections.push(createTextSection(outcomeHtml));
    }
  }
  
  // 7. TECHNIQUES + RECOGNITION - Two columns if both exist
  const hasTechniques = project.techniques && project.techniques.length > 0;
  const hasRecognition = project.recognition && project.recognition.length > 0;
  
  if (hasTechniques || hasRecognition) {
    const techniquesHtml = hasTechniques
      ? `<h2>Techniques & Skills</h2>\n${project.techniques.map(t => `<p>• ${t}</p>`).join('\n')}`
      : '';
    
    const recognitionHtml = hasRecognition
      ? `<h2>Recognition</h2>\n${project.recognition.map(r => `<p><em>${r}</em></p>`).join('\n')}`
      : '';
    
    if (hasTechniques && hasRecognition) {
      sections.push({
        id: generateId(),
        type: 'layout-two-column',
        ratio: '60-40',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [createTextSection(techniquesHtml)],
        rightColumn: [createTextSection(recognitionHtml)]
      });
    } else {
      sections.push(createTextSection(hasTechniques ? techniquesHtml : recognitionHtml));
    }
  }
  
  // 8. FINAL GALLERY - Any remaining images
  if (images.length > 0) {
    const galleryImageItems = images.map(img => ({
      id: generateId(),
      imageId: img.imageId || img.assetId || null,
      imageUrl: img.imageUrl || img.url || null,
      altText: img.altText || '',
      caption: img.caption || '',
      width: img.width,
      height: img.height
    }));
    
    sections.push({
      id: generateId(),
      type: 'gallery',
      heading: 'Gallery',
      images: galleryImageItems
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
  
  // Check authentication before proceeding
  await requireAuth({ apiBase: API_BASE, verify: true });
  
  // Reset database unless --no-reset flag is passed
  if (!skipReset) {
    await resetDatabase();
  } else {
    console.log('⏭️  Skipping database reset (--no-reset)\n');
  }

  const personaDir = path.join(PERSONAS_DIR, personaId);
  
  // Load persona data
  const personaPath = path.join(personaDir, 'persona.json');

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
    sectionsCreated: 0,
    tags: 0,
    tagAssignments: 0
  };
  const startTime = Date.now();

  // Layout enhancement context - tracks IDs and tagged images for Pass 2
  const populationContext = {
    portfolioId: null,
    portfolioSlug: null,
    personaId: personaId,
    pages: { home: null },
    categories: new Map(),
    projects: new Map(),
    taggedImages: createTagContext()
  };

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
    } catch {
      // Portfolio doesn't exist - continue to create new one
    }
  }
  
  if (!portfolioId) {
    const name = personaData.persona?.name || personaId;
    const theme = personaData.persona?.theme || 'modern-minimal';
    const template = personaData.persona?.template || 'featured-grid';
    portfolio = await apiCall('POST', '/admin/portfolio', {
      name: `${name} Portfolio`,
      title: `${name} Portfolio`,
      draftTheme: theme,
      publishedTheme: theme,
      draftTemplate: template,
      publishedTemplate: template,
    });
    portfolioId = portfolio.data.id;
    console.log(`✓ Portfolio created: ${portfolioId}`);
  }
  
  // Track portfolio in context for Pass 2
  populationContext.portfolioId = portfolioId;
  populationContext.portfolioSlug = portfolio?.data?.slug || personaId;
  
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
      
      await apiCall('PUT', '/admin/portfolio', {
        id: portfolioId,
        bio: bio,
        contactEmail: persona.email || null,
        profilePhotoId: profileAsset.id,
      });
      console.log('✓ Profile configured with bio');
    }
  }
  
  // Track persona data in context for per-persona layout builders
  populationContext.persona = persona;
  populationContext.personaData = personaData;
  populationContext.profileAssetId = profileAssetId;
  populationContext.profileAssetUrl = profileAssetUrl;
  populationContext.additionalProfileImages = [];

  // Upload additional profile images (selfies, candids, etc.)
  for (const profileImg of profileImages.slice(1)) {
    const imgPath = findImagePath(personaDir, profileImg);
    if (imgPath) {
      const altText = profileImg.title || profileImg.description || '';
      const caption = buildCaption(profileImg);
      const asset = await uploadImage(imgPath, portfolioId, altText, caption);
      stats.images++;
      stats.profileImages++;
      // Track additional profile image assets for about page layouts
      populationContext.additionalProfileImages.push({
        id: asset.id,
        url: asset.url,
        altText,
        caption,
        type: profileImg.type || '',
        title: profileImg.title || '',
        width: asset.width,
        height: asset.height,
      });
      console.log(`  ✓ Uploaded: ${profileImg.title || path.basename(profileImg.file)}`);
    }
  }

  // Step 3: Create pages
  console.log('\n📄 Creating pages...');
  
  const pagesCheck = await fetch(`${API_BASE}/portfolio`);
  const portfolioData = await pagesCheck.json();
  const existingPages = portfolioData?.data?.pages || [];
  
  const existingHomepage = existingPages.find(p => p.isHomepage || p.slug === '' || p.slug === 'home');
  if (!existingHomepage) {
    const homepageContent = JSON.stringify({
      sections: [{
        id: generateId(),
        type: 'hero',
        name: persona.name || personaId,
        title: persona.role || '',
        bio: '',
        profileImageId: profileAssetId,
        profileImageUrl: profileAssetUrl,
        showResumeLink: !!(persona.resumeUrl),
        resumeUrl: persona.resumeUrl || ''
      }]
    });
    
    const homePage = await apiCall('POST', '/admin/pages', {
      portfolioId: portfolioId,
      title: 'Home',
      slug: '',
      navOrder: 0,
      isHomepage: true,
      showInNav: false,
      draftContent: homepageContent,
      publishedContent: homepageContent
    });
    // Track home page for Pass 2
    populationContext.pages.home = { id: homePage.data.id, slug: '' };
    console.log('  ✓ Homepage created');
  } else {
    // Track existing home page for Pass 2
    populationContext.pages.home = { id: existingHomepage.id, slug: existingHomepage.slug || '' };
    console.log('  ✓ Homepage already exists');
  }
  
  const aboutExists = existingPages.some(p => p.slug === 'about');
  if (bio && !aboutExists) {
    const aboutSections = buildPersonaAboutPage(personaId, populationContext);
    const aboutContent = JSON.stringify({ sections: aboutSections });
    
    const aboutPage = await apiCall('POST', '/admin/pages', {
      portfolioId: portfolioId,
      title: 'About',
      slug: 'about',
      navOrder: 1,
      isHomepage: false,
      showInNav: true,
      draftContent: aboutContent,
      publishedContent: aboutContent
    });
    populationContext.pages.about = { id: aboutPage.data.id, slug: 'about' };
    stats.sectionsCreated += aboutSections.length;
    console.log(`  ✓ About page created (${aboutSections.length} sections)`);
  } else if (aboutExists) {
    const existingAbout = existingPages.find(p => p.slug === 'about');
    if (existingAbout) populationContext.pages.about = { id: existingAbout.id, slug: 'about' };
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
    
    const created = await apiCall('POST', '/admin/categories', categoryPayload);
    categoryId = created.data.id;
    const categorySlug = created.data.slug || category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
    categoryMap[category.name] = categoryId;
    stats.categories++;
    
    // Track category for Pass 2
    populationContext.categories.set(categorySlug, {
      id: categoryId,
      slug: categorySlug,
      name: category.name,
      projectIds: [],
      existingSections: buildCategorySections(category)
    });
    
    // Add category content sections
    const categorySections = buildCategorySections(category);
    if (categorySections.length > 0) {
      const contentJson = JSON.stringify({ sections: categorySections });
      await apiCall('PUT', `/admin/categories/${categoryId}`, {
        draftContent: contentJson,
        order: category.order || 0
      });
      await apiCall('POST', `/admin/categories/${categoryId}/publish`);
      stats.sectionsCreated += categorySections.length;
      console.log(`  ✓ ${category.name} (${categorySections.length} sections)`);
    } else {
      console.log(`  ✓ ${category.name}`);
    }
  }

  // Step 5: Process projects with rich metadata
  console.log('\n📝 Creating projects with rich content...');
  
  const projectTagsMap = new Map();
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
        
        const projectData = await apiCall('POST', '/admin/projects', projectPayload);
        const projectId = projectData.data.id;
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
        const projectSlug = projectData.data.slug || project.slug || project.title.toLowerCase().replace(/\s+/g, '-');
        stats.projects++;
        
        // Track project for Pass 2
        populationContext.projects.set(projectId, {
          id: projectId,
          slug: projectSlug,
          title: project.title,
          categorySlug: categorySlug,
          featuredImageId: featuredAsset.id,
          existingSections: buildProjectSections(project, [])  // Gallery filled later
        });
        
        // Track project tags for post-creation tag assignment
        if (project.tags && project.tags.length > 0) {
          projectTagsMap.set(projectId, project.tags);
        }
        
        // Add project ID to category's project list
        const categoryContext = populationContext.categories.get(categorySlug);
        if (categoryContext) {
          categoryContext.projectIds.push(projectId);
        }
        
        // Process tags on featured image
        if (featuredPhoto.tags && featuredPhoto.tags.length > 0) {
          processPhotoTags(featuredPhoto, featuredAsset, categorySlug, populationContext.taggedImages, projectSlug, project.title);
        }
        
        console.log(`    ✓ Created (${details.year || '2024'}, ${details.venue || 'venue'})`);
        
        // Upload gallery images (excluding identity photos only - featured IS included)
        const galleryPhotos = (project.photos || []).filter(p => 
          p !== featuredPhoto && !p.isIdentity
        );
        
        // Start with featured image as hero (already uploaded above)
        const galleryImages = [{
          id: `featured-${featuredAsset.id}`,
          imageId: featuredAsset.id,
          imageUrl: featuredAsset.url,
          altText: featuredAltText,
          caption: featuredCaption,
          width: featuredAsset.width,
          height: featuredAsset.height
        }];
        
        if (galleryPhotos.length > 0) {
          console.log(`    📷 Uploading ${galleryPhotos.length} gallery images...`);
          
          for (const photo of galleryPhotos) {
            const photoPath = findImagePath(personaDir, photo, category, project);
            if (photoPath) {
              const altText = photo.title || photo.description || '';
              const caption = buildCaption(photo);
              
              const asset = await uploadImage(photoPath, portfolioId, altText, caption);
              
              const galleryRecord = await apiCall('POST', `/admin/projects/${projectId}/gallery`, {
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
                caption: caption,
                width: asset.width,
                height: asset.height
              });
              
              // Process tags on gallery images
              if (photo.tags && photo.tags.length > 0) {
                const catSlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
                processPhotoTags(photo, asset, catSlug, populationContext.taggedImages, projectSlug, project.title);
              }
              
              stats.images++;
              stats.galleryImages++;
            }
          }
        }
        
        // Build and save rich project content (per-persona layout)
        const projectSections = buildPersonaProjectPage(personaId, project, galleryImages, populationContext);
        if (projectSections.length > 0) {
          const contentJson = JSON.stringify({ sections: projectSections });
          await apiCall('PUT', `/admin/projects/${projectId}`, {
            draftContent: contentJson,
            publishedContent: contentJson,
            order: project.order || 0
          });
          stats.sectionsCreated += projectSections.length;
          console.log(`    ✓ Added ${projectSections.length} content sections, ${galleryImages.length} gallery images`);
          
          // Update context with actual sections including gallery for Pass 2
          const projectContext = populationContext.projects.get(projectId);
          if (projectContext) {
            projectContext.existingSections = projectSections;
          }
        }
        
      } catch (error) {
        console.error(`    ✗ Failed: ${error.message}`);
      }
    }
    
    // Set category featured image
    if (categoryFeaturedImageId) {
      await apiCall('PUT', `/admin/categories/${categoryId}`, {
        featuredImageId: categoryFeaturedImageId
      });
      console.log(`  ✓ Category featured image set`);
    }
  }
  
  // Step 6: Create tags and assign to projects
  if (projectTagsMap.size > 0) {
    console.log('\n🏷️  Creating tags and assigning to projects...');
    
    // Collect all unique tags from project tag data
    const uniqueTags = new Map();
    for (const tags of projectTagsMap.values()) {
      for (const tag of tags) {
        const key = `${tag.type}:${tag.value}`;
        if (!uniqueTags.has(key)) {
          uniqueTags.set(key, tag);
        }
      }
    }
    
    // Create each tag via API
    const tagIdMap = new Map();
    for (const [key, tag] of uniqueTags) {
      try {
        const created = await apiCall('POST', '/admin/tags', {
          portfolioId,
          type: tag.type,
          value: tag.value,
        });
        tagIdMap.set(key, created.data.id);
      } catch (error) {
        console.error(`    ✗ Failed to create tag ${key}: ${error.message}`);
      }
    }
    console.log(`  ✓ Created ${tagIdMap.size} tags`);
    
    // Assign tags to each project
    let assignedCount = 0;
    for (const [projectId, tags] of projectTagsMap) {
      const tagIds = tags
        .map(t => tagIdMap.get(`${t.type}:${t.value}`))
        .filter(Boolean);
      
      if (tagIds.length > 0) {
        try {
          await apiCall('PUT', `/admin/projects/${projectId}/tags`, { tagIds });
          assignedCount++;
        } catch (error) {
          console.error(`    ✗ Failed to assign tags to project ${projectId}: ${error.message}`);
        }
      }
    }
    console.log(`  ✓ Assigned tags to ${assignedCount} projects`);
    stats.tags = tagIdMap.size;
    stats.tagAssignments = assignedCount;
  }
  
  // Pass 2: Per-persona page finalization (homepage + category pages)
  // Now that all projects and categories exist, build rich per-persona layouts
  console.log('\n🎨 Finalizing per-persona page layouts...');
  
  // 2a: Update homepage with per-persona layout
  try {
    const homeSections = buildPersonaHomepage(personaId, populationContext);
    const homeContent = JSON.stringify({ sections: homeSections });
    const homePageId = populationContext.pages.home?.id;
    if (homePageId) {
      await apiCall('PUT', `/admin/pages/${homePageId}`, {
        draftContent: homeContent,
      });
      // Publish so the public site renders updated content
      await apiCall('POST', `/admin/pages/${homePageId}/publish`);
      stats.sectionsCreated += homeSections.length;
      console.log(`  ✓ Homepage updated & published (${homeSections.length} sections)`);
    }
  } catch (error) {
    console.error(`  ⚠️ Homepage layout failed: ${error.message}`);
  }
  
  // 2b: Rebuild about page with per-persona layout (now has access to all uploaded images)
  try {
    const aboutPageId = populationContext.pages.about?.id;
    if (aboutPageId) {
      const aboutSections = buildPersonaAboutPage(personaId, populationContext);
      const aboutContent = JSON.stringify({ sections: aboutSections });
      await apiCall('PUT', `/admin/pages/${aboutPageId}`, {
        draftContent: aboutContent,
      });
      // Publish so the public site renders updated content
      await apiCall('POST', `/admin/pages/${aboutPageId}/publish`);
      stats.sectionsCreated += aboutSections.length;
      console.log(`  ✓ About page updated & published (${aboutSections.length} sections)`);
    }
  } catch (error) {
    console.error(`  ⚠️ About page layout failed: ${error.message}`);
  }
  
  // 2c: Update category pages with per-persona layouts
  let catIdx = 0;
  for (const category of personaData.categories || []) {
    try {
      // Match the slug resolution used in Step 4 (line 723) — prefer API-returned slug
      // which is stored as the map key in populationContext.categories
      const categoryContext = populationContext.categories.get(category.slug)
        || [...populationContext.categories.values()].find(c => c.name === category.name);
      if (categoryContext) {
        const catSections = buildPersonaCategoryPage(personaId, category, catIdx, populationContext);
        const catContent = JSON.stringify({ sections: catSections });
        await apiCall('PUT', `/admin/categories/${categoryContext.id}`, {
          draftContent: catContent
        });
        await apiCall('POST', `/admin/categories/${categoryContext.id}/publish`);
        stats.sectionsCreated += catSections.length;
        console.log(`  ✓ ${category.name} landing updated (${catSections.length} sections)`);
      }
    } catch (error) {
      console.error(`  ⚠️ Category ${category.name} layout failed: ${error.message}`);
    }
    catIdx++;
  }
  
  // Note: Legacy applyLayoutEnhancements() is no longer called.
  // Per-persona layouts above provide comprehensive coverage of all section types.
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Enhanced Population Complete!');
  console.log('='.repeat(60));
  console.log(`Categories:          ${stats.categories}`);
  console.log(`Projects:            ${stats.projects}`);
  console.log(`Content Sections:    ${stats.sectionsCreated}`);
  console.log(`Tags:                ${stats.tags}`);
  console.log(`Tag Assignments:     ${stats.tagAssignments}`);
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
