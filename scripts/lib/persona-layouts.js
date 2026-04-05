/**
 * Per-Persona Layout Dispatch
 *
 * Replaces one-size-fits-all layouts with persona-specific page structures
 * that collectively exercise ALL section types and configuration variants.
 *
 * Personas:
 *   Sarah Chen   – "Editorial Precision"  → sidebar-forward, narrow gaps
 *   Julian Vane  – "Structured Craftsman" → three-column mastery, default/wide gaps
 *   Emma Rodriguez – "Cinematic Scope"    → extreme ratios, wide gaps
 *   Gallery        – "Process Gallery"    → gallery-forward, balanced gaps
 */

import {
  generateSectionId,
  buildTwoColumnLayout,
  buildThreeColumnLayout,
  buildSidebarLayout,
  buildProjectCardSection,
  buildProjectListSection,
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
 * Extract project headings with fallback to generic defaults.
 * Projects can supply a `headings` object with `challenge`, `approach`, `outcome` keys
 * for voice-appropriate section headings instead of the generic defaults.
 */
function getHeadings(project) {
  return {
    challenge: project.headings?.challenge || 'The Challenge',
    approach: project.headings?.approach || 'The Approach',
    outcome: project.headings?.outcome || 'The Outcome',
  };
}

/**
 * Build an HTML block from projectDetails fields.
 * Renders each present field as <p><strong>Label:</strong> Value</p>.
 */
function buildProjectDetailsHtml(details) {
  if (!details) return '';

  const fields = [
    ['Production', details.production],
    ['Venue', details.venue],
    ['Director', details.director],
    ['Timeline', details.timeline],
    ['Budget', details.budget],
    ['Scale', details.scale],
    ['Year', details.year],
    ['Role', details.role],
    ['Network', details.network],
    ['Presentation', details.presentation],
  ];

  return fields
    .filter(([, value]) => value != null && value !== '')
    .map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`)
    .join('\n');
}

/**
 * Build HTML lists from techniques and recognition arrays.
 */
function buildTechniquesHtml(techniques, recognition) {
  let html = '';

  if (techniques && techniques.length > 0) {
    html += '<h3>Techniques</h3>\n<ul>\n';
    html += techniques.map(t => `  <li>${t}</li>`).join('\n');
    html += '\n</ul>\n';
  }

  if (recognition && recognition.length > 0) {
    html += '<h3>Recognition</h3>\n<ul>\n';
    html += recognition.map(r => `  <li>${r}</li>`).join('\n');
    html += '\n</ul>\n';
  }

  return html;
}

/**
 * Get project IDs for a given category slug from context.
 */
function getProjectIdsForCategory(context, categorySlug) {
  if (!context.categories) return [];
  for (const cat of context.categories.values()) {
    if (cat.slug === categorySlug) {
      return cat.projectIds || [];
    }
  }
  return [];
}

/**
 * Get related project IDs from the same category, excluding currentProjectId.
 * Only returns projects that exist in context.projects.
 */
function getRelatedProjectIds(context, currentProjectId, categorySlug, count) {
  const categoryIds = getProjectIdsForCategory(context, categorySlug);
  const related = categoryIds.filter(
    id => id !== currentProjectId && context.projects && context.projects.has(id)
  );
  return related.slice(0, count);
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
// Carousel Link Builder
// ============================================

/**
 * Build a carousel item's link URL from tagged image metadata.
 *
 * The projectSlug stored in tag context comes from the API response, which may
 * already include the category prefix (e.g. `/professional-work/the-great-gatsby-korea`)
 * or even a leading slash. Prepending categorySlug again produces doubled paths like
 * `/professional-work//professional-work/the-great-gatsby-korea`.
 *
 * This helper detects and handles both cases:
 * - If projectSlug already starts with '/', it is a full path — use it directly.
 * - Otherwise, build `/${categorySlug}/${projectSlug}` as before.
 */
function buildCarouselItemLink(img) {
  if (!img.projectSlug) return '';
  if (img.projectSlug.startsWith('/')) return img.projectSlug;
  return img.categorySlug ? `/${img.categorySlug}/${img.projectSlug}` : `/${img.projectSlug}`;
}

// ============================================
// Gallery Image Consumption Helpers
// ============================================

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
 * Returns null if img is null/undefined.
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

// ============================================
// Genre-Adaptive Template Configuration
// ============================================

/**
 * Genre archetypes influence template parameters within each persona's
 * base aesthetic. A project's category determines its genre, which adjusts
 * pacing (gap sizing), gallery presentation, and narrative emphasis.
 *
 * Three archetypes:
 *   spectacle — Action/fast-paced: tight gaps, grid gallery, metrics-forward
 *   research  — Period/craft-rich: wide gaps, carousel gallery, process-focused
 *   intimate  — Contemporary/understated: default gaps, curated gallery, character-focused
 */
const GENRE_SPECTACLE = 'spectacle';
const GENRE_RESEARCH = 'research';
const GENRE_INTIMATE = 'intimate';

const GENRE_MAP = {
  sarah: {
    'theater-production': GENRE_RESEARCH,
    'film-production': GENRE_INTIMATE,
    'television-production': GENRE_INTIMATE,
    'fashion-design': GENRE_SPECTACLE,
  },
  julian: {
    'menswear-tailoring': GENRE_RESEARCH,
    'theater-production': GENRE_INTIMATE,
    'film-production': GENRE_SPECTACLE,
    'specialty-techniques': GENRE_RESEARCH,
  },
  emma: {
    'action-stunt': GENRE_SPECTACLE,
    'period-epic': GENRE_RESEARCH,
    'contemporary-drama': GENRE_INTIMATE,
    'international-location': GENRE_SPECTACLE,
  },
  gallery: {
    'theatre-work': GENRE_SPECTACLE,
    'bethany-joy': GENRE_SPECTACLE,
    'uncsa-productions': GENRE_RESEARCH,
    'ohio-lights-opera': GENRE_SPECTACLE,
    'theoretical-construction': GENRE_RESEARCH,
    'finished-garments': GENRE_RESEARCH,
    'half-scales': GENRE_RESEARCH,
    'draping-exercises': GENRE_RESEARCH,
    'personal-work': GENRE_INTIMATE,
    'millinery': GENRE_RESEARCH,
  },
};

const GENRE_DEFAULTS = {
  [GENRE_SPECTACLE]: {
    type: GENRE_SPECTACLE,
    gap: 'narrow',
    galleryStyle: 'grid',
    galleryHeading: '',
  },
  [GENRE_RESEARCH]: {
    type: GENRE_RESEARCH,
    gap: 'wide',
    galleryStyle: 'carousel',
    galleryHeading: '',
  },
  [GENRE_INTIMATE]: {
    type: GENRE_INTIMATE,
    gap: 'default',
    galleryStyle: 'grid',
    galleryHeading: '',
  },
};

/**
 * Get genre configuration for a project based on persona and category.
 */
function getGenreConfig(personaKey, categorySlug) {
  const personaMap = GENRE_MAP[personaKey];
  const genreType = personaMap?.[categorySlug] || GENRE_INTIMATE;
  return GENRE_DEFAULTS[genreType];
}

/**
 * Map gallery image items to carousel format.
 */
function carouselImagesPayload(imgs) {
  return (imgs || []).map(img => ({
    imageId: img.imageId,
    imageUrl: img.imageUrl,
    title: img.altText || img.caption || '',
    category: '',
    link: '',
    width: img.width,
    height: img.height,
  }));
}

/**
 * Build the final gallery section using genre-appropriate style.
 * Spectacle/intimate → grid gallery. Research → carousel for progression.
 */
function buildGenreGallery(genre, imgs) {
  if (!imgs || imgs.length === 0) return null;
  if (genre.galleryStyle === 'carousel') {
    return buildCarouselSection({
      heading: genre.galleryHeading,
      images: carouselImagesPayload(imgs),
    });
  }
  return buildGallerySection({
    heading: genre.galleryHeading,
    images: galleryImagesPayload(imgs),
  });
}

// ============================================
// SARAH CHEN — "Editorial Precision"
// Sidebar-forward, narrow gaps
// ============================================

function sarahHomepage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: `${persona.name} Portfolio`,
    bio: '',
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  // 2. Featured carousel
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
        heading: 'Featured Work',
        images: carouselItems,
        autoRotate: true,
        interval: 5000,
      })
    );
  }

  // 3. Category grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'category-grid',
    heading: 'Explore My Work',
    description: '',
    categoryIds: null,
    columns: 4,
    showDescription: true,
    showProjectCount: true,
  });

  // 4. Project grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: 'Recent Projects',
    description: '',
    projectIds: null,
    columns: 3,
    showMetadata: true,
    layout: 'grid',
  });

  return sections;
}

function sarahAboutPage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: `About ${persona.name}`,
    bio: persona.bio,
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: false,
  });

  // 2. Sidebar layout — bio sidebar + philosophy main
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'left',
      sidebarWidth: 320,
      gap: 'narrow',
      mobileStackOrder: 'main-first',
      sidebar: [
        buildTextSection({ body: formatAsHtml(persona.bio) }),
      ],
      main: [
        buildTextSection({
          body:
            '<h2>Design Philosophy</h2>' +
            formatAsHtml(
              'I design costumes that become characters unto themselves. Every fabric choice, every silhouette, every color decision serves the story first. My work spans theater, television, and fashion editorial—each medium demanding its own visual language, its own relationship between body and narrative.'
            ),
        }),
      ],
    })
  );

  // 3. Three-column — training + recognition + process (wide gap for breathing room)
  sections.push(
    buildThreeColumnLayout({
      gap: 'wide',
      mobileStackOrder: 'left-first',
      columns: [
        [
          buildTextSection({
            body: '<h2>Training & Background</h2><p>MFA Costume Design, CalArts. Apprenticed in Portland\'s vibrant theater community before expanding into television and editorial work.</p>',
          }),
        ],
        [
          buildTextSection({
            body: '<h2>Recognition</h2><p>Regional theater awards, streaming platform features, and fashion week presentations have marked the journey so far.</p>',
          }),
        ],
        [
          buildTextSection({
            body: '<h2>Process</h2><p>Research-driven and detail-obsessed. Every project begins with deep character study, fabric exploration, and close collaboration with directors to align costume language with narrative intent.</p>',
          }),
        ],
      ],
    })
  );

  // 4. Gallery — studio & process (empty images is fine)
  sections.push(buildGallerySection({ heading: 'Studio & Process', images: [] }));

  return sections;
}

function sarahCategoryPage(category, categoryIndex, context) {
  const sections = [];

  if (categoryIndex <= 1) {
    // Variant A (indices 0, 1)

    // 1. Text section — headline + introduction
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Sidebar — approach sidebar + project list main
    const catProjectIds = getProjectIdsForCategory(context, category.slug);
    sections.push(
      buildSidebarLayout({
        sidebarPosition: 'left',
        sidebarWidth: 280,
        gap: 'narrow',
        mobileStackOrder: 'main-first',
        sidebar: [
          buildTextSection({
            body:
              '<h2>My Approach</h2>' +
              formatAsHtml(category.categoryContent?.approach || ''),
          }),
        ],
        main: [
          buildProjectListSection({
            projectIds: catProjectIds.slice(0, 3),
            layout: 'mini-grid',
            showMetadata: true,
          }),
        ],
      })
    );

    // 3. Project grid (inline)
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: 'All Work',
      projectIds: null,
      columns: 2,
      showMetadata: true,
      layout: 'grid',
    });
  } else {
    // Variant B (indices 2, 3)

    // 1. Text section
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Project grid (inline)
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 2,
      showMetadata: false,
      layout: 'grid',
    });
  }

  return sections;
}

function sarahProjectPage(project, galleryImages, context) {
  const orderIndex = project.order != null ? project.order : 0;
  const isEven = orderIndex % 2 === 0;
  const { getNext, getNextN, remaining } = createImageConsumer(galleryImages);
  const genre = getGenreConfig('sarah', project.categorySlug);

  if (isEven) {
    return sarahTemplateA(project, getNext, getNextN, remaining, context, genre);
  }
  return sarahTemplateB(project, getNext, getNextN, remaining, context, genre);
}

/** Sarah Template A — "Editorial Feature" (even order, genre-adaptive) */
function sarahTemplateA(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Sidebar — details sidebar + title/description main
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'left',
      sidebarWidth: 280,
      gap: 'narrow',
      mobileStackOrder: 'main-first',
      sidebar: [
        buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
      ],
      main: [
        buildTextSection({
          body:
            '<h1>' + project.title + '</h1>' +
            formatAsHtml(project.description),
        }),
      ],
    })
  );

  // 3. Full-width image — visual break
  const breakImg = imageFromGallery(getNext());
  if (breakImg) sections.push(breakImg);

  // 4. Two-column 40-60 — challenge+approach narrative + image
  const narrativeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.challenge + '</h2>' +
            formatAsHtml(project.projectContent?.challenge || '') +
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
      rightColumn: narrativeImg ? [narrativeImg] : [],
    })
  );

  // 5. Two-column 60-40 — image + outcome/techniques
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: outcomeImg ? [outcomeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || '') +
            buildTechniquesHtml(project.techniques, []),
        }),
      ],
    })
  );

  // 6. Related project card (if available)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    1
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'large', showMetadata: true })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

/** Sarah Template B — "Condensed Feature" (odd order, genre-adaptive) */
function sarahTemplateB(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column 60-40 — title/description + details
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h1>' + project.title + '</h1>' +
            formatAsHtml(project.description),
        }),
      ],
      rightColumn: [
        buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
      ],
    })
  );

  // 3. Two-column 40-60 — image + challenge/approach narrative
  const narrativeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: narrativeImg ? [narrativeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.challenge + '</h2>' +
            formatAsHtml(project.projectContent?.challenge || '') +
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
    })
  );

  // 4. Full-width image — visual break
  const breakImg = imageFromGallery(getNext());
  if (breakImg) sections.push(breakImg);

  // 5. Two-column 60-40 — outcome+techniques + image
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || '') +
            buildTechniquesHtml(project.techniques, []),
        }),
      ],
      rightColumn: outcomeImg ? [outcomeImg] : [],
    })
  );

  // 6. Related project list (if available, up to 2)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    2
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectListSection({
        projectIds: relatedIds.slice(0, 2),
        layout: 'vertical',
        showMetadata: true,
      })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

// ============================================
// JULIAN VANE — "Structured Craftsman"
// Three-column mastery, default/wide gaps
// ============================================

function julianHomepage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: `${persona.name} Portfolio`,
    bio: '',
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: false,
  });

  // 2. Carousel — recent work
  const carouselItems = (context.taggedImages?.homeCarousel || []).map(img => ({
    imageId: img.imageId || img.id || null,
    imageUrl: img.imageUrl || img.url || null,
    title: img.title || '',
    category: img.categorySlug || '',
    link: buildCarouselItemLink(img),
    width: img.width,
    height: img.height,
  }));
  sections.push(
    buildCarouselSection({
      heading: 'Recent Work',
      images: carouselItems,
      autoRotate: false,
    })
  );

  // 3. Featured grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'featured-grid',
    heading: 'Signature Pieces',
    items: [],
  });

  // 4. Category grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'category-grid',
    heading: 'Disciplines',
    categoryIds: null,
    columns: 3,
    showDescription: true,
    showProjectCount: false,
  });

  return sections;
}

function julianAboutPage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: `About ${persona.name}`,
    bio: persona.bio,
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: false,
  });

  // 2. Two-column — philosophy + image
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'default',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>Craft Philosophy</h2>' +
            formatAsHtml(
              'Trained on Savile Row and refined through fifteen years of bespoke construction, I approach every garment as a conversation between tradition and the present moment. The techniques are centuries old. The challenge is making them speak to today.'
            ),
        }),
      ],
      rightColumn: [
        buildImageSection({ imageId: null, imageUrl: null, altText: 'Julian at the workbench' }),
      ],
    })
  );

  // 3. Three-column — training disciplines
  sections.push(
    buildThreeColumnLayout({
      gap: 'wide',
      mobileStackOrder: 'left-first',
      columns: [
        [
          buildTextSection({
            body: '<h2>Savile Row Training</h2><p>Traditional tailoring foundation. Canvas work, hand-padding, and the discipline of invisible construction.</p>',
          }),
        ],
        [
          buildTextSection({
            body: '<h2>Theater Craft</h2><p>Where garments must perform—surviving eight shows a week while maintaining the illusion of effortless elegance.</p>',
          }),
        ],
        [
          buildTextSection({
            body: '<h2>Film Work</h2><p>The camera sees everything. Period accuracy and construction quality that holds up under close-up scrutiny.</p>',
          }),
        ],
      ],
    })
  );

  // 4. Two-column — image + recognition
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: 'default',
      mobileStackOrder: 'right-first',
      leftColumn: [
        buildImageSection({ imageId: null, imageUrl: null, altText: 'Tools of the trade' }),
      ],
      rightColumn: [
        buildTextSection({
          body: '<h2>Recognition</h2><p>Industry acknowledgment matters less than the work itself. But it is gratifying when peers and critics notice the craft.</p>',
        }),
      ],
    })
  );

  // 5. Gallery — workshop (empty)
  sections.push(buildGallerySection({ heading: 'The Workshop', images: [] }));

  return sections;
}

function julianCategoryPage(category, categoryIndex, context) {
  const sections = [];
  const catProjectIds = getProjectIdsForCategory(context, category.slug);

  if (categoryIndex <= 1) {
    // Variant A (indices 0, 1)

    // 1. Text — headline + introduction
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Three-column — project cards (one per column, up to 3)
    const cardColumns = [];
    for (let i = 0; i < 3; i++) {
      if (catProjectIds[i]) {
        cardColumns.push([
          buildProjectCardSection({
            projectId: catProjectIds[i],
            cardSize: 'standard',
            showMetadata: true,
          }),
        ]);
      } else {
        cardColumns.push([]);
      }
    }
    sections.push(
      buildThreeColumnLayout({
        gap: 'default',
        mobileStackOrder: 'left-first',
        columns: cardColumns,
      })
    );

    // 3. Project grid (inline) — masonry
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 3,
      showMetadata: true,
      layout: 'masonry',
    });
  } else {
    // Variant B (indices 2, 3)

    // 1. Text
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Project list — first 2
    sections.push(
      buildProjectListSection({
        projectIds: catProjectIds.slice(0, 2),
        layout: 'mini-grid',
        showMetadata: true,
      })
    );

    // 3. Project grid (inline) — masonry
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 3,
      showMetadata: false,
      layout: 'masonry',
    });

    // 4. Category grid — explore other disciplines
    sections.push({
      id: generateSectionId(),
      type: 'category-grid',
      heading: 'Explore Other Disciplines',
      categoryIds: null,
      columns: 2,
      showDescription: false,
      showProjectCount: false,
    });
  }

  return sections;
}

function julianProjectPage(project, galleryImages, context) {
  const orderIndex = project.order != null ? project.order : 0;
  const isEven = orderIndex % 2 === 0;
  const { getNext, getNextN, remaining } = createImageConsumer(galleryImages);
  const genre = getGenreConfig('julian', project.categorySlug);

  if (isEven) {
    return julianTemplateA(project, getNext, getNextN, remaining, context, genre);
  }
  return julianTemplateB(project, getNext, getNextN, remaining, context, genre);
}

/** Julian Template A (even order, genre-adaptive) */
function julianTemplateA(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column 60-40 — title/description + details
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'default',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h1>' + project.title + '</h1>' +
            formatAsHtml(project.description),
        }),
      ],
      rightColumn: [
        buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
      ],
    })
  );

  // 3. Three-column — 3 images (Julian's signature layout)
  const triImgs = getNextN(3);
  const triColumns = triImgs.map(img => {
    const section = imageFromGallery(img);
    return section ? [section] : [];
  });
  while (triColumns.length < 3) triColumns.push([]);
  sections.push(
    buildThreeColumnLayout({
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      columns: triColumns,
    })
  );

  // 4. Two-column 40-60 — image + challenge/approach narrative
  const narrativeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: narrativeImg ? [narrativeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.challenge + '</h2>' +
            formatAsHtml(project.projectContent?.challenge || '') +
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
    })
  );

  // 5. Two-column 60-40 — outcome+techniques + image
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || '') +
            buildTechniquesHtml(project.techniques, project.recognition),
        }),
      ],
      rightColumn: outcomeImg ? [outcomeImg] : [],
    })
  );

  // 6. Related project card (if available)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    1
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'standard', showMetadata: true })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

/** Julian Template B (odd order, genre-adaptive) */
function julianTemplateB(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column 50-50 — overview + image
  const overviewImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '50-50',
      gap: 'wide',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h1>' + project.title + '</h1>' +
            formatAsHtml(project.description),
        }),
      ],
      rightColumn: overviewImg ? [overviewImg] : [],
    })
  );

  // 3. Two-column 40-60 — image + challenge/approach narrative
  const narrativeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: narrativeImg ? [narrativeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.challenge + '</h2>' +
            formatAsHtml(project.projectContent?.challenge || '') +
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
    })
  );

  // 4. Three-column — 3 images (Julian's signature layout)
  const triImgs = getNextN(3);
  const triColumns = triImgs.map(img => {
    const section = imageFromGallery(img);
    return section ? [section] : [];
  });
  while (triColumns.length < 3) triColumns.push([]);
  sections.push(
    buildThreeColumnLayout({
      gap: 'default',
      mobileStackOrder: 'left-first',
      columns: triColumns,
    })
  );

  // 5. Two-column 60-40 — outcome+recognition+techniques + image
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || '') +
            (project.recognition && project.recognition.length > 0
              ? '<h3>Recognition</h3><ul>' +
                project.recognition.map(r => `<li>${r}</li>`).join('') +
                '</ul>'
              : '') +
            buildTechniquesHtml(project.techniques, []),
        }),
      ],
      rightColumn: outcomeImg ? [outcomeImg] : [],
    })
  );

  // 6. Related project list (if available)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    2
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectListSection({
        projectIds: relatedIds.slice(0, 2),
        layout: 'vertical',
        showMetadata: true,
      })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

// ============================================
// EMMA RODRIGUEZ — "Cinematic Scope"
// Extreme ratios, wide gaps
// ============================================

function emmaHomepage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero — use role as title, bio as introduction (not redundant name)
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || 'Film Costume Supervisor',
    bio: persona.bio || '',
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  // 2. Featured carousel — production highlights
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
        heading: 'Featured Productions',
        images: carouselItems,
        autoRotate: true,
        interval: 6000,
      })
    );
  }

  // 3. Category grid — show descriptions so visitors understand specializations
  sections.push({
    id: generateSectionId(),
    type: 'category-grid',
    heading: 'Specializations',
    categoryIds: null,
    columns: 2,
    showDescription: true,
    showProjectCount: true,
  });

  // 4. Project grid — complete filmography as list
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: 'Complete Filmography',
    description: '',
    projectIds: null,
    columns: 3,
    showMetadata: true,
    layout: 'grid',
  });

  return sections;
}

function emmaAboutPage(context) {
  const { persona, profileAssetId, profileAssetUrl, personaData, additionalProfileImages } = context;
  const sections = [];

  // Collect real credits and recognition from persona data
  const categories = personaData?.categories || [];
  const allProjects = categories.flatMap(cat => cat.projects || []);

  const creditsHtml = allProjects.map(p => {
    const details = p.projectDetails || {};
    return `<li><strong>${p.title}</strong> (${details.year || ''}) &mdash; ${details.role || 'Costume Supervisor'}, ${details.production || ''}</li>`;
  }).join('\n');

  const recognitionEntries = allProjects.flatMap(p =>
    (p.recognition || []).map(r => `<li>${r} &mdash; <em>${p.title}</em></li>`)
  );
  const awardsHtml = recognitionEntries.length > 0
    ? recognitionEntries.join('\n')
    : '<li>Multiple festival selections and industry commendations</li>';

  // Aggregate unique techniques across all projects
  const allTechniques = [...new Set(allProjects.flatMap(p => p.techniques || []))];
  const techniquesHtml = allTechniques.slice(0, 12).map(t => `<li>${t}</li>`).join('\n');

  // Find additional profile images for the about page two-column sections
  const candidImg = (additionalProfileImages || []).find(img =>
    img.type === 'candid' || img.title?.toLowerCase().includes('candid') || img.title?.toLowerCase().includes('video village')
  );
  const onJobImg = (additionalProfileImages || []).find(img =>
    img.type === 'on_job' || img.title?.toLowerCase().includes('on-job') || img.title?.toLowerCase().includes('action')
  );
  // Fallback: use any available additional images
  const aboutImg1 = candidImg || (additionalProfileImages || [])[0] || null;
  const aboutImg2 = onJobImg || (additionalProfileImages || [])[1] || null;

  // 1. Hero
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || 'Film Costume Supervisor',
    bio: persona.bio,
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  // 2. Two-column 70-30 — career overview + on-set image
  sections.push(
    buildTwoColumnLayout({
      ratio: '70-30',
      gap: 'wide',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>Career Overview</h2>' +
            formatAsHtml(
              'From independent shorts to studio tentpoles, my work in costume supervision is driven by the conviction that what characters wear shapes how audiences feel. Over two decades of managing wardrobe departments across four continents, I have coordinated teams of up to 45 people, managed budgets exceeding four million dollars, and supervised thousands of costumes per production. Every production is a world to build, one garment at a time.'
            ),
        }),
      ],
      rightColumn: [
        buildImageSection({
          imageId: aboutImg1?.id || null,
          imageUrl: aboutImg1?.url || null,
          altText: aboutImg1?.altText || 'Emma reviewing continuity at video village',
        }),
      ],
    })
  );

  // 3. Two-column 30-70 — image + methodology
  sections.push(
    buildTwoColumnLayout({
      ratio: '30-70',
      gap: 'wide',
      mobileStackOrder: 'right-first',
      leftColumn: [
        buildImageSection({
          imageId: aboutImg2?.id || null,
          imageUrl: aboutImg2?.url || null,
          altText: aboutImg2?.altText || 'Emma adjusting costume on set',
        }),
      ],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>Methodology</h2>' +
            formatAsHtml(
              'I begin with the script and let the characters speak. Research follows\u2014historical, cultural, psychological. Then the sketches, the fabric pulls, the fittings. Collaboration with directors and cinematographers ensures the costumes live within the visual world of the film.'
            ) +
            '<h3>Core Specializations</h3>' +
            '<ul>' + techniquesHtml + '</ul>',
        }),
      ],
    })
  );

  // 4. Sidebar — awards sidebar + key credits main (with REAL data)
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'right',
      sidebarWidth: 320,
      gap: 'wide',
      mobileStackOrder: 'main-first',
      sidebar: [
        buildTextSection({
          body:
            '<h2>Awards & Recognition</h2>' +
            '<ul>' + awardsHtml + '</ul>',
        }),
      ],
      main: [
        buildTextSection({
          body:
            '<h2>Key Credits</h2>' +
            '<ul>' + creditsHtml + '</ul>',
        }),
      ],
    })
  );

  // 5. Three-column — three facets of craft (narrow gap for dense reference)
  sections.push(
    buildThreeColumnLayout({
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      columns: [
        [
          buildTextSection({
            body:
              '<h2>Period Research</h2>' +
              formatAsHtml(
                'Every era has its own textile vocabulary. I work from archival sources, museum collections, and firsthand material analysis to ensure authenticity that holds up on camera.'
              ),
          }),
        ],
        [
          buildTextSection({
            body:
              '<h2>Character Building</h2>' +
              formatAsHtml(
                'Costumes reveal who a character is before they speak. Color palettes, silhouettes, and fabric textures are chosen to externalize internal arcs and relationships.'
              ),
          }),
        ],
        [
          buildTextSection({
            body:
              '<h2>On-Set Adaptation</h2>' +
              formatAsHtml(
                'Film sets are unpredictable. I build flexibility into every design\u2014quick-change systems, weather contingencies, and stunt-safe duplicates that maintain visual continuity.'
              ),
          }),
        ],
      ],
    })
  );

  // 6. Gallery — on set (populated from profile images)
  const galleryImages = (additionalProfileImages || []).map(img => ({
    imageId: img.id,
    imageUrl: img.url,
    altText: img.altText || img.title || 'On set',
    caption: img.caption || img.title || '',
    width: img.width,
    height: img.height,
  }));
  // Include primary profile image in gallery if we have it
  if (profileAssetId && profileAssetUrl) {
    galleryImages.unshift({
      imageId: profileAssetId,
      imageUrl: profileAssetUrl,
      altText: `${persona.name} - professional headshot`,
      caption: persona.name,
    });
  }
  sections.push(buildGallerySection({
    heading: 'On Set',
    images: galleryImages.length > 0 ? galleryImages : [],
  }));

  return sections;
}

function emmaCategoryPage(category, categoryIndex, context) {
  const sections = [];

  if (categoryIndex <= 1) {
    // Variant A (indices 0, 1)

    // 1. Text — headline + intro
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Two-column 70-30 — carousel + approach text
    const carouselImages =
      (context.taggedImages?.categoryCarousels?.get(category.slug) || []).map(img => ({
        imageId: img.imageId || img.id || null,
        imageUrl: img.imageUrl || img.url || null,
        title: img.title || '',
        category: img.categorySlug || '',
        link: buildCarouselItemLink(img),
        width: img.width,
        height: img.height,
      }));
    sections.push(
      buildTwoColumnLayout({
        ratio: '70-30',
        gap: 'wide',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildCarouselSection({
            heading: '',
            images: carouselImages,
            autoRotate: true,
            interval: 4000,
          }),
        ],
        rightColumn: [
          buildTextSection({
            body:
              '<h2>My Approach</h2>' +
              formatAsHtml(category.categoryContent?.approach || ''),
          }),
        ],
      })
    );

    // 3. Project grid — use grid layout with 2 columns for visual presence
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 2,
      showMetadata: true,
      layout: 'grid',
    });
  } else {
    // Variant B (indices 2, 3)

    // 1. Text
    sections.push(
      buildTextSection({
        body: formatAsHtml(
          (category.categoryContent?.headline || '') +
            '. ' +
            (category.categoryContent?.introduction || '')
        ),
      })
    );

    // 2. Project grid (inline)
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 2,
      showMetadata: true,
      layout: 'grid',
    });
  }

  return sections;
}

function emmaProjectPage(project, galleryImages, context) {
  const orderIndex = project.order != null ? project.order : 0;
  const isEven = orderIndex % 2 === 0;
  const { getNext, getNextN, remaining } = createImageConsumer(galleryImages);
  const genre = getGenreConfig('emma', project.categorySlug);

  if (isEven) {
    return emmaTemplateA(project, getNext, getNextN, remaining, context, genre);
  }
  return emmaTemplateB(project, getNext, getNextN, remaining, context, genre);
}

/** Emma Template A (even order, genre-adaptive) */
function emmaTemplateA(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Title/description + details — genre-adaptive layout
  if (genre.type === GENRE_SPECTACLE) {
    // Spectacle: prominent metrics sidebar
    sections.push(
      buildSidebarLayout({
        sidebarPosition: 'left',
        sidebarWidth: 340,
        gap: 'narrow',
        mobileStackOrder: 'main-first',
        sidebar: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
        main: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description),
          }),
        ],
      })
    );
  } else if (genre.type === GENRE_INTIMATE) {
    // Intimate: balanced, character-focused
    sections.push(
      buildTwoColumnLayout({
        ratio: '60-40',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description),
          }),
        ],
        rightColumn: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
      })
    );
  } else {
    // Research: generous layout, lead with beauty
    sections.push(
      buildTwoColumnLayout({
        ratio: '70-30',
        gap: 'wide',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description),
          }),
        ],
        rightColumn: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
      })
    );
  }

  // 3. Visual break — genre-adaptive
  if (genre.type === GENRE_SPECTACLE) {
    // Spectacle: skip the break, consume the image for faster pace
    getNext();
  } else if (genre.type === GENRE_INTIMATE) {
    // Intimate: paired images side-by-side
    const pairA = imageFromGallery(getNext());
    const pairB = imageFromGallery(getNext());
    if (pairA || pairB) {
      sections.push(
        buildTwoColumnLayout({
          ratio: '50-50',
          gap: 'default',
          mobileStackOrder: 'left-first',
          leftColumn: pairA ? [pairA] : [],
          rightColumn: pairB ? [pairB] : [],
        })
      );
    }
  } else {
    // Research: full-width beauty shot
    const breakImg = imageFromGallery(getNext());
    if (breakImg) sections.push(breakImg);
  }

  // 4. Two-column 40-60 — challenge+approach narrative + image
  const narrativeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.challenge + '</h2>' +
            formatAsHtml(project.projectContent?.challenge || '') +
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
      rightColumn: narrativeImg ? [narrativeImg] : [],
    })
  );

  // 5. Two-column 60-40 — image + outcome
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: outcomeImg ? [outcomeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
    })
  );

  // 6. Related project list (if available, up to 2)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    2
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectListSection({
        projectIds: relatedIds.slice(0, 2),
        layout: 'mini-grid',
        showMetadata: true,
      })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

/** Emma Template B (odd order, genre-adaptive) */
function emmaTemplateB(project, getNext, getNextN, remaining, context, genre) {
  const h = getHeadings(project);
  const sections = [];

  // 1. Hero image (full-width)
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Overview — genre-adaptive layout
  if (genre.type === GENRE_SPECTACLE) {
    // Spectacle: prominent metrics sidebar on left
    sections.push(
      buildSidebarLayout({
        sidebarPosition: 'left',
        sidebarWidth: 360,
        gap: 'narrow',
        mobileStackOrder: 'main-first',
        sidebar: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
        main: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description) +
              '<h2>' + h.challenge + '</h2>' +
              formatAsHtml(project.projectContent?.challenge || ''),
          }),
        ],
      })
    );
  } else if (genre.type === GENRE_INTIMATE) {
    // Intimate: balanced two-column, no sidebar
    sections.push(
      buildTwoColumnLayout({
        ratio: '60-40',
        gap: 'default',
        mobileStackOrder: 'left-first',
        leftColumn: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description) +
              '<h2>' + h.challenge + '</h2>' +
              formatAsHtml(project.projectContent?.challenge || ''),
          }),
        ],
        rightColumn: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
      })
    );
  } else {
    // Research: generous sidebar for details
    sections.push(
      buildSidebarLayout({
        sidebarPosition: 'right',
        sidebarWidth: 320,
        gap: 'wide',
        mobileStackOrder: 'main-first',
        sidebar: [
          buildTextSection({ body: buildProjectDetailsHtml(project.projectDetails) }),
        ],
        main: [
          buildTextSection({
            body:
              '<h1>' + project.title + '</h1>' +
              formatAsHtml(project.description) +
              '<h2>' + h.challenge + '</h2>' +
              formatAsHtml(project.projectContent?.challenge || ''),
          }),
        ],
      })
    );
  }

  // 3. Two-column 60-40 — image + approach/techniques
  const approachImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: genre.gap,
      mobileStackOrder: 'left-first',
      leftColumn: approachImg ? [approachImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>' + h.approach + '</h2>' +
            formatAsHtml(project.projectContent?.approach || '') +
            buildTechniquesHtml(project.techniques, []),
        }),
      ],
    })
  );

  // 4. Visual break — genre-adaptive
  if (genre.type === GENRE_SPECTACLE) {
    getNext();
  } else if (genre.type === GENRE_INTIMATE) {
    const pairA = imageFromGallery(getNext());
    const pairB = imageFromGallery(getNext());
    if (pairA || pairB) {
      sections.push(
        buildTwoColumnLayout({
          ratio: '50-50',
          gap: 'default',
          mobileStackOrder: 'left-first',
          leftColumn: pairA ? [pairA] : [],
          rightColumn: pairB ? [pairB] : [],
        })
      );
    }
  } else {
    const breakImg = imageFromGallery(getNext());
    if (breakImg) sections.push(breakImg);
  }

  // 5. Two-column 40-60 — outcome + image
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: genre.gap,
      mobileStackOrder: 'right-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>' + h.outcome + '</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
      rightColumn: outcomeImg ? [outcomeImg] : [],
    })
  );

  // 6. Related project card (if available)
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    1
  );
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'standard', showMetadata: true })
    );
  }

  // 7. Gallery — genre-adaptive style
  const restImgs = remaining();
  const gallerySection = buildGenreGallery(genre, restImgs);
  if (gallerySection) sections.push(gallerySection);

  return sections;
}

// ============================================
// GALLERY — "Process Gallery"
// Gallery-forward, balanced gaps, image-heavy
// Adapts to a data shape with rich descriptions
// and abundant photos, but no projectContent
// (challenge/approach/outcome), techniques, or
// recognition fields.
// ============================================

function galleryHomepage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // 1. Hero — with resume link and role as title
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || 'Draper & Costume Technician',
    bio: persona.bio || '',
    profileImageId: null,
    profileImageUrl: null,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  // 2. Featured carousel — craft highlights
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
        heading: 'Featured Work',
        images: carouselItems,
        autoRotate: true,
        interval: 5000,
      })
    );
  }

  // 3. Project grid — 2 columns for larger image presence
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: 'Recent Work',
    description: '',
    projectIds: null,
    columns: 2,
    showMetadata: true,
    layout: 'grid',
  });

  return sections;
}

function galleryAboutPage(context) {
  const { persona, profileAssetId, profileAssetUrl } = context;
  const sections = [];

  // Hero only — bio text is her actual words from the original site.
  // No fabricated "Craft Philosophy", "Training & Experience", or skill sections.
  const hasResume = !!(persona.resumeUrl);
  sections.push({
    id: generateSectionId(),
    type: 'hero',
    name: persona.name,
    title: persona.role || 'Draper & Costume Technician',
    bio: persona.bio,
    profileImageId: profileAssetId,
    profileImageUrl: profileAssetUrl,
    showResumeLink: hasResume,
    resumeUrl: persona.resumeUrl || '',
  });

  return sections;
}

function galleryCategoryPage(category, categoryIndex, context) {
  const sections = [];

  // Category description — factual, from persona.json only. No editorialising.
  const descText = (category.categoryContent?.introduction || category.description || '').trim();
  if (descText) {
    sections.push(
      buildTextSection({
        body: formatAsHtml(descText),
      })
    );
  }

  // Project grid — all projects, uniform 3-column grid across all 6 categories.
  // No "My Approach", no featured-vs-all split (that caused duplicate cards).
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: category.name || '',
    projectIds: null,
    columns: 3,
    showMetadata: true,
    layout: 'grid',
  });

  return sections;
}

function galleryProjectPage(project, galleryImages, context) {
  // Multi-section projects get a special layout
  if (project.sections && project.sections.length > 0) {
    return galleryMultiSectionPage(project, galleryImages, context);
  }
  
  // Single-section projects use the standard gallery-forward layout
  return gallerySingleProjectPage(project, galleryImages, context);
}

/** Gallery multi-section project page — projects with a sections[] array */
function galleryMultiSectionPage(project, galleryImages, context) {
  const sections = [];
  const { getNext, getNextN, remaining } = createImageConsumer(galleryImages);

  // 1. Hero image (featured image at galleryImages[0])
  const hero = getNext();
  if (hero) {
    sections.push(imageFromGallery(hero));
  }

  // 2. Commentary + credits, same pattern as single projects.
  //    Project details metadata is NOT included — the app renders that in the header.
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

  // 3. Each sub-section: heading + text, then that section's images
  // The populate script places photos sequentially by section.
  // We use each section's photos.length to consume the right count,
  // adjusting for the featured image that was already consumed above.
  for (const subSection of project.sections) {
    // Section heading + description
    if (subSection.title || subSection.description) {
      sections.push(
        buildTextSection({ body: `<h2>${subSection.title || ''}</h2>\n${formatAsHtml(subSection.description || '')}` })
      );
    }

    // Determine how many gallery images belong to this section.
    // The featured image was removed from the gallery queue above,
    // so the section that contained it has one fewer image to consume.
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

  // 4. Any remaining images (overflow / top-level project photos)
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

/** Gallery single project page — text at top, then all images.
 *  Project metadata (role, year, production, etc.) is rendered by the app
 *  in the project header — never duplicate it in the content sections.
 *  projectContent.sidebar = left column (credits/contributors)
 *  projectContent.description = right column (her commentary)
 */
function gallerySingleProjectPage(project, galleryImages, context) {
  const sections = [];
  const { remaining } = createImageConsumer(galleryImages);

  // 1. Two-column text: commentary on left, credits on right.
  //    Project details metadata is NOT included — the app renders that in the header.
  const pc = project.projectContent || {};
  const sidebar = (pc.sidebar || '').trim();
  const commentary = (pc.description || '').trim();

  // Sidebar lines are \n-separated credits — each line becomes its own <p>.
  // formatAsHtml would mangle these since they don't end with sentence punctuation.
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

  // 3. All remaining images — at least 2 columns, never single column
  const restImgs = remaining();
  if (restImgs.length > 0) {
    // Use gallery with minimum 2 columns
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
 * Build the sections array for a project page, dispatching to the
 * appropriate persona-specific layout.
 *
 * @param {string} personaId
 * @param {Object} project - Persona JSON project object
 * @param {Array} galleryImages - Array of {imageId, imageUrl, altText, caption, width, height}
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaProjectPage(personaId, project, galleryImages, context) {
  if (personaId.includes('julian')) {
    return julianProjectPage(project, galleryImages, context);
  }
  if (personaId.includes('emma')) {
    return emmaProjectPage(project, galleryImages, context);
  }
  if (personaId.includes('gallery')) {
    return galleryProjectPage(project, galleryImages, context);
  }
  // Default to Sarah's layout
  return sarahProjectPage(project, galleryImages, context);
}

/**
 * Build the sections array for a homepage.
 *
 * @param {string} personaId
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaHomepage(personaId, context) {
  if (personaId.includes('julian')) {
    return julianHomepage(context);
  }
  if (personaId.includes('emma')) {
    return emmaHomepage(context);
  }
  if (personaId.includes('gallery')) {
    return galleryHomepage(context);
  }
  return sarahHomepage(context);
}

/**
 * Build the sections array for an about page.
 *
 * @param {string} personaId
 * @param {Object} context
 * @returns {Array} sections
 */
export function buildPersonaAboutPage(personaId, context) {
  if (personaId.includes('julian')) {
    return julianAboutPage(context);
  }
  if (personaId.includes('emma')) {
    return emmaAboutPage(context);
  }
  if (personaId.includes('gallery')) {
    return galleryAboutPage(context);
  }
  return sarahAboutPage(context);
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
  if (personaId.includes('julian')) {
    return julianCategoryPage(category, categoryIndex, context);
  }
  if (personaId.includes('emma')) {
    return emmaCategoryPage(category, categoryIndex, context);
  }
  if (personaId.includes('gallery')) {
    return galleryCategoryPage(category, categoryIndex, context);
  }
  return sarahCategoryPage(category, categoryIndex, context);
}
