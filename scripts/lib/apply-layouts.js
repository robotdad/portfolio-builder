/**
 * Apply Layouts - Pass 2 Orchestrator
 * 
 * Applies layout enhancements to pages, categories, and projects
 * based on persona-specific strategies. Called after Pass 1 content
 * creation to add multi-column layouts and carousels.
 */

import { 
  getStrategy, 
  shouldEnhanceCategory,
  buildCategoryLayoutSections,
  buildProjectLayoutSections
} from './layout-strategies.js';

import { 
  buildCarouselSection
} from './layout-builders.js';

import { 
  getHomeCarouselImages, 
  getCategoryCarouselImages 
} from './tag-processor.js';

// ============================================
// Main Entry Point
// ============================================

/**
 * Apply layout enhancements to all content
 * 
 * @param {Object} context - Population context from Pass 1
 * @param {string} context.portfolioId - Portfolio ID
 * @param {string} context.portfolioSlug - Portfolio slug
 * @param {string} context.personaId - Persona identifier
 * @param {Object} context.pages - Page info (home, about)
 * @param {Map} context.categories - Category data by slug
 * @param {Map} context.projects - Project data by ID
 * @param {Object} context.taggedImages - Tagged image context
 * @param {Function} apiCall - API call function (method, endpoint, data)
 */
export async function applyLayoutEnhancements(context, apiCall) {
  const strategy = getStrategy(context.personaId);
  
  if (!strategy) {
    console.log(`  ℹ️  No layout strategy for persona: ${context.personaId}`);
    return;
  }
  
  console.log(`  Strategy: ${strategy.name}`);
  
  // Get ordered list of category slugs for enhancement decisions
  const allCategorySlugs = Array.from(context.categories.keys());
  
  // 1. Enhance home page with carousel
  if (strategy.homePage?.useHomeCarousel) {
    await enhanceHomePage(context, strategy, apiCall);
  }
  
  // 2. Enhance select categories
  let enhancedCategories = 0;
  let skippedCategories = 0;
  
  for (const [slug, categoryData] of context.categories) {
    if (shouldEnhanceCategory(strategy, slug, allCategorySlugs)) {
      await enhanceCategoryPage(context, categoryData, strategy, apiCall);
      enhancedCategories++;
    } else {
      skippedCategories++;
    }
  }
  
  console.log(`  ✓ Categories: ${enhancedCategories} enhanced, ${skippedCategories} default`);
  
  // 3. Enhance projects in enhanced categories
  let enhancedProjects = 0;
  let skippedProjects = 0;
  
  for (const [_projectId, projectData] of context.projects) {
    const categorySlug = projectData.categorySlug;
    
    if (shouldEnhanceCategory(strategy, categorySlug, allCategorySlugs)) {
      await enhanceProjectPage(context, projectData, strategy, apiCall);
      enhancedProjects++;
    } else {
      skippedProjects++;
    }
  }
  
  console.log(`  ✓ Projects: ${enhancedProjects} enhanced, ${skippedProjects} default`);
}

// ============================================
// Home Page Enhancement
// ============================================

/**
 * Enhance home page with featured carousel
 */
async function enhanceHomePage(context, strategy, apiCall) {
  const homeCarouselImages = getHomeCarouselImages(context.taggedImages);
  
  if (homeCarouselImages.length === 0) {
    console.log('  ℹ️  No home_carousel tagged images found');
    return;
  }
  
  if (!context.pages?.home?.id) {
    console.log('  ⚠️  No home page ID in context');
    return;
  }
  
  try {
    // Get current page content
    const pageResponse = await apiCall('GET', `/pages/${context.pages.home.id}`);
    const currentContent = parseContent(pageResponse.data?.draftContent);
    
    // Build carousel section with proper links
    // Note: FeaturedCarouselDisplay extracts slug from link and builds URL as /{category}/{slug}
    // So we just provide the project slug, not a full path (to avoid duplicate category in URL)
    const carouselSection = buildCarouselSection({
      heading: strategy.homePage.carouselHeading || 'Featured Work',
      images: homeCarouselImages.map(img => ({
        imageId: img.id,
        imageUrl: img.url,
        title: img.title || img.altText || '',
        category: img.categorySlug || '',
        link: img.projectSlug || ''  // Just the slug, component adds category
      })),
      autoRotate: true,
      interval: 5000
    });
    
    // Add carousel after hero section (or at end if no hero)
    const heroIndex = currentContent.sections.findIndex(s => s.type === 'hero');
    if (heroIndex >= 0) {
      currentContent.sections.splice(heroIndex + 1, 0, carouselSection);
    } else {
      currentContent.sections.push(carouselSection);
    }
    
    // Update page
    const contentJson = JSON.stringify(currentContent);
    await apiCall('PUT', `/pages/${context.pages.home.id}`, {
      draftContent: contentJson
    });
    
    // Publish the page
    await apiCall('POST', `/pages/${context.pages.home.id}/publish`);
    
    console.log(`  ✓ Home page carousel: ${homeCarouselImages.length} images`);
  } catch (error) {
    console.error(`  ⚠️  Home page enhancement failed: ${error.message}`);
  }
}

// ============================================
// Category Page Enhancement
// ============================================

/**
 * Enhance a category page with layout sections
 */
async function enhanceCategoryPage(context, categoryData, strategy, apiCall) {
  const carouselImages = getCategoryCarouselImages(context.taggedImages, categoryData.slug);
  
  try {
    // Build layout sections based on strategy
    const layoutSections = buildCategoryLayoutSections(
      strategy,
      categoryData,
      carouselImages
    );
    
    if (layoutSections.length === 0) {
      return;
    }
    
    // Update category content
    const contentJson = JSON.stringify({ sections: layoutSections });
    await apiCall('PUT', `/categories/${categoryData.id}`, {
      draftContent: contentJson
    });
    
    // Publish the category
    await apiCall('POST', `/categories/${categoryData.id}/publish`);
    
    console.log(`    ✓ ${categoryData.name}: ${strategy.categoryLayout.type} layout`);
  } catch (error) {
    console.error(`    ⚠️ ${categoryData.name} enhancement failed: ${error.message}`);
  }
}

// ============================================
// Project Page Enhancement
// ============================================

/**
 * Enhance a project page with layout sections
 * 
 * NOTE: Currently disabled - Pass 1 (populate-persona-api.js) already creates
 * rich two-column layouts with all images. Re-enabling this would overwrite
 * that work with a different structure.
 */
async function enhanceProjectPage(_context, _projectData, _strategy, _apiCall) {
  // Disabled: Pass 1 creates project layouts, Pass 2 only enhances home/category pages
  return;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Parse content JSON string to object
 * @param {string|null} contentJson - JSON string or null
 * @returns {Object} Parsed content or default structure
 */
function parseContent(contentJson) {
  if (!contentJson) {
    return { sections: [] };
  }
  
  try {
    const parsed = JSON.parse(contentJson);
    return parsed || { sections: [] };
  } catch {
    return { sections: [] };
  }
}

/**
 * Merge existing sections with new layout sections
 * Preserves content while wrapping in layout structure
 * @param {Array} existingSections - Current sections
 * @param {Array} layoutSections - New layout sections
 * @returns {Array} Merged sections
 */
function _mergeSections(existingSections, layoutSections) {
  // For now, layout sections replace existing
  // In a more sophisticated implementation, we could:
  // - Extract content from existing sections
  // - Place into appropriate columns of layout sections
  return layoutSections;
}
