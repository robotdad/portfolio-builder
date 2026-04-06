/**
 * Universal Page Layouts
 *
 * Clean, gallery-forward layouts for all personas.
 * Pattern: carousel → hero → featured grid on homepage.
 * Let the images speak — minimal text, generous spacing.
 *
 * Follows the sashagoodner.com pattern: a dramatic carousel opener,
 * a brief personal introduction, and a grid of featured work.
 * Pages stay uncluttered — no multi-column essay layouts, no
 * fabricated philosophy sections, no genre-adaptive branching.
 */

import {
  generateSectionId,
  buildTwoColumnLayout,
  buildTextSection,
  buildImageSection,
  buildGallerySection,
  buildCarouselSection,
} from './layout-builders.js';

// ============================================
// Helper Functions
// ============================================

/**
 * Convert plain text to HTML paragraphs.
 * If text already contains HTML tags, return as-is.
 * Otherwise split into sentences and wrap in <p> tags (2 sentences per paragraph).
 */
function formatAsHtml(text) {
  if (!text || typeof text !== 'string') return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;

  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
  const sentences = text.split(sentenceRegex).filter(s => s.trim());
  const paragraphs = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(' ').trim();
    if (chunk) paragraphs.push(`<p>${chunk}</p>`);
  }

  return paragraphs.join('\n');
}

/**
 * Build a carousel item's link URL from tagged image metadata.
 *
 * The projectSlug stored in tag context may already include the category
 * prefix (e.g. `/professional-work/the-great-gatsby-korea`) or a leading
 * slash. This helper detects and handles both cases.
 */
function buildCarouselItemLink(img) {
  if (!img.projectSlug) return '';
  if (img.projectSlug.startsWith('/')) return img.projectSlug;
  return img.categorySlug ? `/${img.categorySlug}/${img.projectSlug}` : `/${img.projectSlug}`;
}

/**
 * Create gallery consumption helpers from a galleryImages array.
 * Returns { getNext, getNextN, remaining } for consuming images sequentially.
 */
function createImageConsumer(galleryImages) {
  const images = [...(galleryImages || [])];
  return {
    getNext: () => (images.length > 0 ? images.shift() : null),
    getNextN: (n) => {
      const result = [];
      for (let i = 0; i < n && images.length > 0; i++) {
        result.push(images.shift());
      }
      return result;
    },
    remaining: () => [...images],
  };
}

/**
 * Build an image section from a gallery image item.
 */
function imageFromGallery(img) {
  if (!img) return null;
  return buildImageSection({
    imageId: img.imageId,
    imageUrl: img.imageUrl,
    altText: img.altText || '',
    caption: img.caption || '',
    width: img.width,
    height: img.height,
  });
}

/**
 * Map gallery image items to the format expected by buildGallerySection.
 */
function galleryImagesPayload(imgs) {
  return (imgs || []).map(img => ({
    imageId: img.imageId,
    imageUrl: img.imageUrl,
    altText: img.altText || '',
    caption: img.caption || '',
    width: img.width,
    height: img.height,
  }));
}

/**
 * Get all project IDs as an array.
 */
export function getAllProjectIds(context) {
  if (!context.projects) return [];
  return Array.from(context.projects.keys());
}

/**
 * Get all category IDs as an array.
 */
export function getAllCategoryIds(context) {
  if (!context.categories) return [];
  return Array.from(context.categories.values()).map(c => c.id);
}

// ============================================
// Universal Page Layouts
// ============================================

/**
 * Homepage: featured carousel → hero → featured work grid.
 *
 * The carousel is the dramatic visual opener — full-bleed images
 * that auto-rotate. Then a brief personal introduction with profile
 * photo, and finally a 2-column grid of featured work.
 */
function buildHomepage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Featured carousel — the dramatic visual opener
  const carouselItems = (context.taggedImages?.homeCarousel || []).map(img => ({
    imageId: img.imageId || img.id || null,
    imageUrl: img.imageUrl || img.url || null,
    title: img.title || '',
    category: img.categorySlug || '',
    link: buildCarouselItemLink(img),
    width: img.width,
    height: img.height,
  }));
  if (carouselItems.length > 0) {
    sections.push(
      buildCarouselSection({
        heading: '',
        images: carouselItems,
        autoRotate: true,
        interval: 5000,
      })
    );
  }

  // 2. Hero — profile photo, name, title, short bio
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || '',
    bio: persona.bio || '',
    profileImageId: profileAssetId || null,
    profileImageUrl: profileAssetUrl || null,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  // 3. Featured work grid — 2 columns, let the images breathe
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: 'Featured Work',
    description: '',
    projectIds: null,
    columns: 2,
    showMetadata: true,
    layout: 'grid',
  });

  return sections;
}

/**
 * About page: hero with profile photo, name, title, full bio, resume link.
 *
 * No fabricated "Craft Philosophy", "Training & Experience", or skill
 * sections. The bio text from persona.json is the content.
 */
function buildAboutPage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;

  const hasResume = !!(persona.resumeUrl);
  return [{
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || '',
    bio: persona.bio,
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  }];
}

/**
 * Category page: project grid only.
 *
 * No introductory text — just the work. Clean, uniform layout
 * for all categories and subcategories.
 */
function buildCategoryPage(category, _categoryIndex, _context) {
  // Project grid — all projects, uniform 2-column grid
  return [{
    id: generateSectionId(),
    type: 'project-grid',
    heading: category.name || '',
    projectIds: null,
    columns: 2,
    showMetadata: true,
    layout: 'grid',
  }];
}

/**
 * Project page: hero image → optional text → image gallery.
 *
 * Handles both multi-section projects (with a sections[] array,
 * e.g. gallery persona) and standard single projects.
 */
function buildProjectPage(project, galleryImages, context) {
  if (project.sections && project.sections.length > 0) {
    return buildMultiSectionProjectPage(project, galleryImages, context);
  }
  return buildSingleProjectPage(project, galleryImages, context);
}

/**
 * Multi-section project page — for projects with a sections[] array.
 * Hero image, optional commentary, then per-section text + galleries.
 */
function buildMultiSectionProjectPage(project, galleryImages, _context) {
  const sections = [];
  const { getNext, getNextN, remaining } = createImageConsumer(galleryImages);

  // 1. Hero image (first gallery image, full-width)
  const hero = getNext();
  if (hero) {
    sections.push(imageFromGallery(hero));
  }

  // 2. Commentary + sidebar credits (if present)
  const pc = project.projectContent || {};
  const sidebar = (pc.sidebar || '').trim();
  const commentary = (pc.description || '').trim();

  const sidebarHtml = sidebar
    ? sidebar.split('\n').filter(l => l.trim()).map(l => `<p>${l.trim()}</p>`).join('\n')
    : '';

  if (sidebar || commentary) {
    sections.push(
      buildTwoColumnLayout({
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({ body: commentary ? formatAsHtml(commentary) : '' }),
        ],
        rightColumn: [
          buildTextSection({ body: sidebarHtml }),
        ],
      })
    );
  }

  // 3. Per sub-section: heading + description, then that section's images
  for (const subSection of project.sections) {
    if (subSection.title || subSection.description) {
      sections.push(
        buildTextSection({
          body: `<h2>${subSection.title || ''}</h2>\n${formatAsHtml(subSection.description || '')}`,
        })
      );
    }

    const sectionPhotos = subSection.photos || [];
    const hasFeatured = sectionPhotos.some(p => p.isFeatured);
    const imageCount = hasFeatured ? sectionPhotos.length - 1 : sectionPhotos.length;

    if (imageCount > 0) {
      const sectionImages = getNextN(imageCount);
      if (sectionImages.length > 0) {
        sections.push(
          buildGallerySection({
            heading: '',
            images: galleryImagesPayload(sectionImages),
            columns: Math.max(2, Math.min(4, sectionImages.length)),
          })
        );
      }
    }
  }

  // 4. Overflow images
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({
        heading: '',
        images: galleryImagesPayload(restImgs),
        columns: Math.max(2, Math.min(4, restImgs.length)),
      })
    );
  }

  return sections;
}

/**
 * Single project page — hero image, brief description, then all images.
 *
 * Project metadata (role, year, production, venue, etc.) is rendered
 * by the app in the project header — never duplicated in content sections.
 *
 * If the project has commentary + sidebar credits (gallery persona pattern),
 * those are shown in a clean two-column layout. Otherwise, just the project
 * description followed by the gallery.
 */
function buildSingleProjectPage(project, galleryImages, _context) {
  const sections = [];
  const { getNext, remaining } = createImageConsumer(galleryImages);

  // 1. Hero image — first gallery image, full-width
  const hero = getNext();
  if (hero) {
    sections.push(imageFromGallery(hero));
  }

  // 2. Text content
  const pc = project.projectContent || {};
  const sidebar = (pc.sidebar || '').trim();
  const commentary = (pc.description || '').trim();

  if (sidebar || commentary) {
    // Two-column: commentary + credits sidebar
    const sidebarHtml = sidebar
      ? sidebar.split('\n').filter(l => l.trim()).map(l => `<p>${l.trim()}</p>`).join('\n')
      : '';
    sections.push(
      buildTwoColumnLayout({
        ratio: '50-50',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({ body: commentary ? formatAsHtml(commentary) : '' }),
        ],
        rightColumn: [
          buildTextSection({ body: sidebarHtml }),
        ],
      })
    );
  } else if (project.description) {
    // Simple description text
    sections.push(
      buildTextSection({ body: formatAsHtml(project.description) })
    );
  }

  // 3. All remaining images
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({
        heading: '',
        images: galleryImagesPayload(restImgs),
        columns: Math.max(2, Math.min(4, restImgs.length)),
      })
    );
  }

  return sections;
}

// ============================================
// Public API — Persona Dispatch
// ============================================

/**
 * Build the sections array for a homepage.
 *
 * @param {string} personaId
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaHomepage(personaId, context) {
  return buildHomepage(context);
}

/**
 * Build the sections array for an about page.
 *
 * @param {string} personaId
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaAboutPage(personaId, context) {
  return buildAboutPage(context);
}

/**
 * Build the sections array for a category landing page.
 *
 * @param {string} personaId
 * @param {Object} category - Persona JSON category object
 * @param {number} categoryIndex - 0-based index of this category
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaCategoryPage(personaId, category, categoryIndex, context) {
  return buildCategoryPage(category, categoryIndex, context);
}

/**
 * Build the sections array for a project page, dispatching to the
 * appropriate layout based on project data shape.
 *
 * @param {string} personaId
 * @param {Object} project - Persona JSON project object
 * @param {Array} galleryImages - Array of {imageId, imageUrl, altText, caption, width, height}
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaProjectPage(personaId, project, galleryImages, context) {
  return buildProjectPage(project, galleryImages, context);
}
