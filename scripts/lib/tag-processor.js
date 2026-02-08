/**
 * Tag Processor
 * 
 * Processes photo tags during Pass 1 image uploads and provides
 * lookup functions for Pass 2 layout enhancement.
 * 
 * Supported tags:
 * - 'home_carousel': Images for home page carousel
 * - 'category_carousel': Images for category page carousels
 * - 'featured': General featured images
 */

// ============================================
// Context Factory
// ============================================

/**
 * Create an empty tag context structure
 * @returns {Object} Empty tag context
 */
export function createTagContext() {
  return {
    homeCarousel: [],           // Assets tagged 'home_carousel'
    categoryCarousels: new Map(), // categorySlug -> Asset[]
    featured: []                // Assets tagged 'featured'
  };
}

// ============================================
// Tag Processing
// ============================================

/**
 * Process photo tags and update context
 * Called during Pass 1 when uploading images
 * 
 * @param {Object} photoMeta - Photo metadata from persona JSON
 * @param {Object} uploadedAsset - Uploaded asset response from API
 * @param {string} categorySlug - Slug of the category this photo belongs to
 * @param {Object} context - Tag context to update (from createTagContext)
 * @param {string} [projectSlug] - Slug of the project this photo belongs to (optional)
 */
export function processPhotoTags(photoMeta, uploadedAsset, categorySlug, context, projectSlug = null) {
  const tags = photoMeta?.tags || [];
  
  if (!tags.length || !uploadedAsset) {
    return;
  }
  
  // Build asset info for context
  const assetInfo = {
    imageId: uploadedAsset.id,
    imageUrl: uploadedAsset.url,
    altText: uploadedAsset.altText || photoMeta.title || '',
    caption: uploadedAsset.caption || photoMeta.description || '',
    title: photoMeta.title || '',
    categorySlug: categorySlug,
    projectSlug: projectSlug,
    width: uploadedAsset.width,
    height: uploadedAsset.height,
  };
  
  // Process each tag
  for (const tag of tags) {
    switch (tag) {
      case 'home_carousel':
        context.homeCarousel.push(assetInfo);
        break;
        
      case 'category_carousel':
        if (categorySlug) {
          if (!context.categoryCarousels.has(categorySlug)) {
            context.categoryCarousels.set(categorySlug, []);
          }
          context.categoryCarousels.get(categorySlug).push(assetInfo);
        }
        break;
        
      case 'featured':
        context.featured.push(assetInfo);
        break;
    }
  }
}

// ============================================
// Lookup Functions (for Pass 2)
// ============================================

/**
 * Get images tagged for home page carousel
 * @param {Object} context - Tag context
 * @returns {Array} Array of asset info objects
 */
export function getHomeCarouselImages(context) {
  return context.homeCarousel || [];
}

/**
 * Get images tagged for a specific category's carousel
 * @param {Object} context - Tag context
 * @param {string} categorySlug - Category slug
 * @returns {Array} Array of asset info objects
 */
export function getCategoryCarouselImages(context, categorySlug) {
  return context.categoryCarousels?.get(categorySlug) || [];
}

/**
 * Get all featured images
 * @param {Object} context - Tag context
 * @returns {Array} Array of asset info objects
 */
export function getFeaturedImages(context) {
  return context.featured || [];
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if a photo has any recognized tags
 * @param {Object} photoMeta - Photo metadata from persona JSON
 * @returns {boolean} True if photo has recognized tags
 */
export function hasRecognizedTags(photoMeta) {
  const tags = photoMeta?.tags || [];
  const recognizedTags = ['home_carousel', 'category_carousel', 'featured'];
  return tags.some(tag => recognizedTags.includes(tag));
}

/**
 * Get summary of tagged images in context
 * @param {Object} context - Tag context
 * @returns {Object} Summary counts
 */
export function getTagSummary(context) {
  const categoryCarouselCount = Array.from(context.categoryCarousels?.values() || [])
    .reduce((sum, arr) => sum + arr.length, 0);
    
  return {
    homeCarousel: context.homeCarousel?.length || 0,
    categoryCarousel: categoryCarouselCount,
    featured: context.featured?.length || 0,
    total: (context.homeCarousel?.length || 0) + categoryCarouselCount + (context.featured?.length || 0)
  };
}
