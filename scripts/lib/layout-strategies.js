/**
 * Layout Strategies
 * 
 * Defines persona-specific layout strategies for enhanced pages.
 * Each strategy specifies:
 * - Which categories to enhance (leave others as default)
 * - Home page layout approach
 * - Category page layout template
 * - Project page layout template
 */

import {
  buildTwoColumnLayout,
  buildProjectListSection,
  buildTextSection,
  buildImageSection,
  buildGallerySection,
  formatTextAsHtml,
  extractTagline,
  extractRemainingContent
} from './layout-builders.js';

// ============================================
// Strategy Definitions
// ============================================

export const strategies = {
  /**
   * Sarah Chen - Theater Production Designer
   * 
   * Design approach: Elegant sidebar layouts with project navigation
   * - Category: Sidebar with project cards, main area with intro + carousel
   * - Project: Two-column 60-40 with narrative left, details right
   */
  'sarah-chen': {
    name: 'Designer Showcase',
    // Enhance first 2 categories, leave rest as default
    enhanceCategoryCount: 2,
    
    homePage: {
      useHomeCarousel: true,
      carouselHeading: 'Featured Work'
    },
    
    categoryLayout: {
      type: 'sidebar',
      sidebarPosition: 'left',
      sidebarWidth: 280,
      gap: 'default',
      mobileStackOrder: 'main-first',
      // Sidebar: project cards (compact)
      // Main: intro text + category carousel
    },
    
    projectLayout: {
      type: 'two-column',
      ratio: '60-40',
      gap: 'default',
      mobileStackOrder: 'left-first',
      // Left: challenge/approach/outcome (formatted text)
      // Right: featured image + production details
    }
  },

  /**
   * Emma Rodriguez - Ceramic Artist
   * 
   * Design approach: Gallery-focused with artisan details
   * - Category: Three-column with large project cards
   * - Project: Sidebar with techniques/recognition, main with narrative + gallery
   */
  'emma-rodriguez': {
    name: 'Artisan Gallery',
    // Enhance first 2 categories, leave rest as default
    enhanceCategoryCount: 2,
    
    homePage: {
      useHomeCarousel: true,
      carouselHeading: 'Featured Pieces'
    },
    
    categoryLayout: {
      type: 'three-column',
      gap: 'default',
      mobileStackOrder: 'left-first',
      // 3 large project cards across
    },
    
    projectLayout: {
      type: 'sidebar',
      sidebarPosition: 'left',
      sidebarWidth: 240,
      gap: 'default',
      mobileStackOrder: 'main-first',
      // Sidebar: techniques list, recognition
      // Main: narrative + gallery
    }
  },

  /**
   * Julian Vane - Food/Editorial Photographer
   * 
   * Design approach: Visual storytelling with balanced columns
   * - Category: Two-column 40-60 with text left, project list right
   * - Project: Two-column 50-50 with narrative vs technical details
   */
  'julian-vane': {
    name: 'Visual Storyteller',
    // Enhance first 2 categories, leave rest as default
    enhanceCategoryCount: 2,
    
    homePage: {
      useHomeCarousel: true,
      carouselHeading: 'Recent Work'
    },
    
    categoryLayout: {
      type: 'two-column',
      ratio: '40-60',
      gap: 'default',
      mobileStackOrder: 'left-first',
      // Left: intro + approach text
      // Right: project list (vertical)
    },
    
    projectLayout: {
      type: 'two-column',
      ratio: '50-50',
      gap: 'default',
      mobileStackOrder: 'left-first',
      // Left: challenge/approach/outcome
      // Right: techniques + recognition
    }
  }
};

// ============================================
// Strategy Access Functions
// ============================================

/**
 * Get strategy for a persona
 * @param {string} personaId - Persona identifier
 * @returns {Object|null} Strategy object or null if not found
 */
export function getStrategy(personaId) {
  return strategies[personaId] || null;
}

/**
 * Check if a category should be enhanced based on strategy
 * @param {Object} strategy - Strategy object
 * @param {string} categorySlug - Category slug to check
 * @param {string[]} allCategorySlugs - All category slugs in order
 * @returns {boolean} True if category should be enhanced
 */
export function shouldEnhanceCategory(strategy, categorySlug, allCategorySlugs) {
  if (!strategy || !categorySlug || !allCategorySlugs) {
    return false;
  }
  
  const enhanceCount = strategy.enhanceCategoryCount || 2;
  const categoryIndex = allCategorySlugs.indexOf(categorySlug);
  
  // Enhance first N categories, leave rest as default
  return categoryIndex >= 0 && categoryIndex < enhanceCount;
}

/**
 * Get list of category slugs that should be enhanced
 * @param {Object} strategy - Strategy object
 * @param {string[]} allCategorySlugs - All category slugs in order
 * @returns {string[]} Array of category slugs to enhance
 */
export function getCategoriesToEnhance(strategy, allCategorySlugs) {
  if (!strategy || !allCategorySlugs) {
    return [];
  }
  
  const enhanceCount = strategy.enhanceCategoryCount || 2;
  return allCategorySlugs.slice(0, enhanceCount);
}

// ============================================
// Layout Builder Helpers
// ============================================

/**
 * Build category page sections based on new visual-first design pattern.
 * 
 * Pattern:
 * 1. HERO (two-column 60-40): Featured image left, short tagline right
 * 2. FEATURED PROJECTS (project-list): 3 project cards
 * 3. APPROACH (two-column 40-60): Detailed text left, supporting image right
 * 4. MORE PROJECTS (project-list): Remaining projects if any
 * 
 * @param {Object} _strategy - Strategy object (currently unused, kept for API compatibility)
 * @param {Object} categoryData - Category data from context
 * @param {Array} carouselImages - Tagged carousel images for this category
 * @returns {Array} Array of sections
 */
export function buildCategoryLayoutSections(_strategy, categoryData, carouselImages) {
  const existingSections = categoryData.existingSections || [];
  const projectIds = categoryData.projectIds || [];
  const sections = [];
  
  // Extract intro text from existing sections
  const introSection = existingSections.find(s => s.type === 'text');
  const introContent = introSection?.content || '';
  
  // Get images for the layout
  const images = carouselImages || [];
  const heroImage = images[0] || null;
  const approachImage = images[1] || null;
  
  // --- SECTION 1: HERO (Image + Short Tagline) ---
  const tagline = extractTagline(introContent, 2);
  const heroTaglineHtml = tagline 
    ? `<h1>${categoryData.name || 'Portfolio'}</h1>\n<p>${tagline}</p>`
    : `<h1>${categoryData.name || 'Portfolio'}</h1>`;
  
  if (heroImage) {
    // Two-column hero: image left (60%), text right (40%)
    sections.push(buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'default',
      mobileStackOrder: 'right-first', // Show title first on mobile
      leftColumn: [
        buildImageSection({
          imageId: heroImage.id || null,
          imageUrl: heroImage.url || null,
          altText: heroImage.altText || categoryData.name,
          caption: ''
        })
      ],
      rightColumn: [
        buildTextSection({
          heading: '',
          body: heroTaglineHtml
        })
      ]
    }));
  } else {
    // Fallback: text-only hero
    sections.push(buildTextSection({
      heading: categoryData.name || 'Portfolio',
      body: tagline ? `<p>${tagline}</p>` : ''
    }));
  }
  
  // --- SECTION 2: FEATURED PROJECTS (First 3) ---
  if (projectIds.length > 0) {
    sections.push(buildProjectListSection({
      projectIds: projectIds.slice(0, 3),
      layout: 'mini-grid',
      showMetadata: true
    }));
  }
  
  // --- SECTION 3: APPROACH (Text + Image) ---
  const remainingContent = extractRemainingContent(introContent, 2);
  if (remainingContent) {
    const approachHtml = formatTextAsHtml(remainingContent, {
      heading: 'My Approach',
      addLeadPhrases: true
    });
    
    if (approachImage) {
      // Two-column: text left (40%), image right (60%)
      sections.push(buildTwoColumnLayout({
        ratio: '40-60',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            heading: '',
            body: approachHtml
          })
        ],
        rightColumn: [
          buildImageSection({
            imageId: approachImage.id || null,
            imageUrl: approachImage.url || null,
            altText: approachImage.altText || 'My approach',
            caption: ''
          })
        ]
      }));
    } else {
      // Text-only approach section
      sections.push(buildTextSection({
        heading: '',
        body: approachHtml
      }));
    }
  }
  
  // --- SECTION 4: MORE PROJECTS (Remaining) ---
  if (projectIds.length > 3) {
    sections.push(buildProjectListSection({
      projectIds: projectIds.slice(3),
      layout: 'vertical',
      showMetadata: true
    }));
  }
  
  return sections;
}

/**
 * Build project page sections based on new visual-first design pattern.
 * 
 * Pattern:
 * 1. HERO IMAGE (full-width): Featured image with project title overlay
 * 2. THE CHALLENGE (two-column 50-50): Text left, context image right
 * 3. PROCESS GALLERY (3 images): Visual process documentation
 * 4. THE APPROACH (two-column 60-40): Key image left, methodology text right
 * 5. THE OUTCOME (two-column 50-50): Results text left, outcome image right
 * 6. FINAL GALLERY: Remaining images as full gallery
 * 
 * @param {Object} _strategy - Strategy object (currently unused, kept for API compatibility)
 * @param {Object} projectData - Project data from context
 * @returns {Array} Array of sections
 */
export function buildProjectLayoutSections(_strategy, projectData) {
  const existingSections = projectData.existingSections || [];
  const sections = [];
  
  // Extract content from existing sections
  const textSections = existingSections.filter(s => s.type === 'text');
  const gallerySections = existingSections.filter(s => s.type === 'gallery');
  
  // Helper to extract images from any section (including nested in layouts)
  const extractImagesFromSection = (section) => {
    const images = [];
    if (section.type === 'image' && (section.imageUrl || section.imageId)) {
      images.push(section);
    } else if (section.type === 'gallery' && section.images) {
      images.push(...section.images);
    } else if (section.type === 'layout-two-column') {
      if (section.leftColumn) section.leftColumn.forEach(s => images.push(...extractImagesFromSection(s)));
      if (section.rightColumn) section.rightColumn.forEach(s => images.push(...extractImagesFromSection(s)));
    } else if (section.type === 'layout-three-column' && section.columns) {
      section.columns.forEach(col => col.forEach(s => images.push(...extractImagesFromSection(s))));
    } else if (section.type === 'layout-sidebar') {
      if (section.sidebar) section.sidebar.forEach(s => images.push(...extractImagesFromSection(s)));
      if (section.main) section.main.forEach(s => images.push(...extractImagesFromSection(s)));
    }
    return images;
  };
  
  // Extract ALL images from ALL sections (including nested in layouts)
  const allImages = [];
  for (const section of existingSections) {
    allImages.push(...extractImagesFromSection(section));
  }
  
  // Find specific text content by heading
  const findTextByHeading = (headings) => {
    const normalized = headings.map(h => h.toLowerCase());
    return textSections.find(s => 
      s.heading && normalized.includes(s.heading.toLowerCase())
    );
  };
  
  // Extract narrative sections
  const overviewSection = findTextByHeading(['Overview', 'Introduction', 'About']);
  const challengeSection = findTextByHeading(['The Challenge', 'Challenge', 'Problem']);
  const approachSection = findTextByHeading(['My Approach', 'The Approach', 'Approach', 'Process', 'Methodology']);
  const outcomeSection = findTextByHeading(['Outcome', 'The Outcome', 'Results', 'Impact']);
  
  // Distribute images across sections
  const heroImage = allImages[0] || null;
  const challengeImage = allImages[1] || null;
  const processImages = allImages.slice(2, 5); // 3 images for process gallery
  const approachImage = allImages[5] || null;
  const outcomeImage = allImages[6] || null;
  const remainingImages = allImages.slice(7);
  
  // --- SECTION 1: HERO IMAGE ---
  if (heroImage) {
    // Full-width hero image with title
    const heroTitle = projectData.title || 'Project';
    const heroSummary = overviewSection 
      ? extractTagline(overviewSection.content, 1) 
      : '';
    
    sections.push(buildImageSection({
      imageId: heroImage.imageId || heroImage.id || null,
      imageUrl: heroImage.imageUrl || heroImage.url || null,
      altText: heroImage.altText || heroTitle,
      caption: ''
    }));
    
    // Title and brief summary below hero
    const heroTextHtml = heroSummary
      ? `<h1>${heroTitle}</h1>\n<p>${heroSummary}</p>`
      : `<h1>${heroTitle}</h1>`;
    
    sections.push(buildTextSection({
      heading: '',
      body: heroTextHtml
    }));
  } else {
    // Fallback: text-only header
    sections.push(buildTextSection({
      heading: projectData.title || 'Project',
      body: overviewSection ? `<p>${extractTagline(overviewSection.content, 1)}</p>` : ''
    }));
  }
  
  // --- SECTION 2: THE CHALLENGE (Text + Image) ---
  if (challengeSection) {
    const challengeContent = challengeSection.content || '';
    const challengeHtml = formatTextAsHtml(challengeContent, {
      heading: 'The Challenge',
      addLeadPhrases: true
    });
    
    if (challengeImage) {
      // Two-column 50-50: text left, image right
      sections.push(buildTwoColumnLayout({
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            heading: '',
            body: challengeHtml
          })
        ],
        rightColumn: [
          buildImageSection({
            imageId: challengeImage.imageId || challengeImage.id || null,
            imageUrl: challengeImage.imageUrl || challengeImage.url || null,
            altText: challengeImage.altText || 'Project context',
            caption: challengeImage.caption || ''
          })
        ]
      }));
    } else {
      sections.push(buildTextSection({
        heading: '',
        body: challengeHtml
      }));
    }
  }
  
  // --- SECTION 3: PROCESS GALLERY (3 images) ---
  if (processImages.length > 0) {
    sections.push(buildGallerySection({
      heading: '',
      images: processImages.map(img => ({
        imageId: img.imageId || img.id || null,
        imageUrl: img.imageUrl || img.url || null,
        altText: img.altText || 'Process',
        caption: img.caption || ''
      }))
    }));
  }
  
  // --- SECTION 4: THE APPROACH (Image + Text) ---
  if (approachSection) {
    const approachContent = approachSection.content || '';
    const approachHtml = formatTextAsHtml(approachContent, {
      heading: 'The Approach',
      addLeadPhrases: true
    });
    
    if (approachImage) {
      // Two-column 60-40: image left, text right (alternating from challenge)
      sections.push(buildTwoColumnLayout({
        ratio: '60-40',
        gap: 'default',
        mobileStackOrder: 'right-first', // Show text first on mobile
        leftColumn: [
          buildImageSection({
            imageId: approachImage.imageId || approachImage.id || null,
            imageUrl: approachImage.imageUrl || approachImage.url || null,
            altText: approachImage.altText || 'Approach',
            caption: approachImage.caption || ''
          })
        ],
        rightColumn: [
          buildTextSection({
            heading: '',
            body: approachHtml
          })
        ]
      }));
    } else {
      sections.push(buildTextSection({
        heading: '',
        body: approachHtml
      }));
    }
  }
  
  // --- SECTION 5: THE OUTCOME (Text + Image) ---
  if (outcomeSection) {
    const outcomeContent = outcomeSection.content || '';
    const outcomeHtml = formatTextAsHtml(outcomeContent, {
      heading: 'The Outcome',
      addLeadPhrases: true
    });
    
    if (outcomeImage) {
      // Two-column 50-50: text left, image right
      sections.push(buildTwoColumnLayout({
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            heading: '',
            body: outcomeHtml
          })
        ],
        rightColumn: [
          buildImageSection({
            imageId: outcomeImage.imageId || outcomeImage.id || null,
            imageUrl: outcomeImage.imageUrl || outcomeImage.url || null,
            altText: outcomeImage.altText || 'Outcome',
            caption: outcomeImage.caption || ''
          })
        ]
      }));
    } else {
      sections.push(buildTextSection({
        heading: '',
        body: outcomeHtml
      }));
    }
  }
  
  // --- SECTION 6: FINAL GALLERY (Remaining images) ---
  if (remainingImages.length > 0) {
    sections.push(buildGallerySection({
      heading: '',
      images: remainingImages.map(img => ({
        imageId: img.imageId || img.id || null,
        imageUrl: img.imageUrl || img.url || null,
        altText: img.altText || '',
        caption: img.caption || ''
      }))
    }));
  }
  
  // If no structured content was created, fall back to existing sections
  if (sections.length === 0) {
    return existingSections;
  }
  
  return sections;
}
