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
  }));
}

// ============================================
// SARAH CHEN — "Editorial Precision"
// Sidebar-forward, narrow gaps
// ============================================

function sarahHomepage(context) {
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
    showResumeLink: true,
  });

  // 2. Featured carousel
  const carouselItems = context.taggedImages?.homeCarousel || [];
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

  // 3. Two-column — training + recognition
  sections.push(
    buildTwoColumnLayout({
      ratio: '50-50',
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body: '<h2>Training & Background</h2><p>MFA Costume Design, CalArts. Apprenticed in Portland\'s vibrant theater community before expanding into television and editorial work.</p>',
        }),
      ],
      rightColumn: [
        buildTextSection({
          body: '<h2>Recognition</h2><p>Regional theater awards, streaming platform features, and fashion week presentations have marked the journey so far.</p>',
        }),
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

  if (isEven) {
    return sarahTemplateA(project, getNext, getNextN, remaining, context);
  }
  return sarahTemplateB(project, getNext, getNextN, remaining, context);
}

/** Sarah Template A — "Editorial Feature" (even order indices) */
function sarahTemplateA(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
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

  // 3. Two-column — challenge + image
  const challengeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>The Challenge</h2>' +
            formatAsHtml(project.projectContent?.challenge || ''),
        }),
      ],
      rightColumn: challengeImg ? [challengeImg] : [],
    })
  );

  // 4. Gallery — process (3 images)
  const processImgs = getNextN(3);
  sections.push(
    buildGallerySection({ heading: 'Process', images: galleryImagesPayload(processImgs) })
  );

  // 5. Sidebar — techniques sidebar + approach main
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'right',
      sidebarWidth: 240,
      gap: 'narrow',
      mobileStackOrder: 'main-first',
      sidebar: [
        buildTextSection({ body: buildTechniquesHtml(project.techniques, []) }),
      ],
      main: [
        buildTextSection({
          body:
            '<h2>The Approach</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
    })
  );

  // 6. Two-column — image + outcome
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: 'narrow',
      mobileStackOrder: 'right-first',
      leftColumn: outcomeImg ? [outcomeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>The Outcome</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
    })
  );

  // 7. Related project card (if available)
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

  // 8. Gallery — details (remaining images)
  const detailImgs = remaining();
  if (detailImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: 'Details', images: galleryImagesPayload(detailImgs) })
    );
  }

  return sections;
}

/** Sarah Template B — "Condensed Feature" (odd order indices) */
function sarahTemplateB(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column — title/description + details
  sections.push(
    buildTwoColumnLayout({
      ratio: '70-30',
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

  // 3. Gallery — the work (4 images)
  const workImgs = getNextN(4);
  sections.push(
    buildGallerySection({ heading: 'The Work', images: galleryImagesPayload(workImgs) })
  );

  // 4. Sidebar — image sidebar + approach/techniques main
  const sidebarImg = imageFromGallery(getNext());
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'left',
      sidebarWidth: 280,
      gap: 'default',
      mobileStackOrder: 'sidebar-first',
      sidebar: sidebarImg ? [sidebarImg] : [],
      main: [
        buildTextSection({
          body:
            '<h2>Approach & Technique</h2>' +
            formatAsHtml(
              (project.projectContent?.approach || '') +
                ' ' +
                (project.techniques || []).join('. ')
            ),
        }),
      ],
    })
  );

  // 5. Outcome text
  sections.push(
    buildTextSection({
      body:
        '<h2>The Outcome</h2>' +
        formatAsHtml(project.projectContent?.outcome || ''),
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

  // 7. Gallery — remaining images
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: '', images: galleryImagesPayload(restImgs) })
    );
  }

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
  const carouselItems = context.taggedImages?.homeCarousel || [];
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

  if (isEven) {
    return julianTemplateA(project, getNext, getNextN, remaining, context);
  }
  return julianTemplateB(project, getNext, getNextN, remaining, context);
}

/** Julian Template A (even order indices) */
function julianTemplateA(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column — title/description + details
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

  // 3. Three-column — 3 images
  const triImgs = getNextN(3);
  const triColumns = triImgs.map(img => {
    const section = imageFromGallery(img);
    return section ? [section] : [];
  });
  // Pad to 3 columns
  while (triColumns.length < 3) triColumns.push([]);
  sections.push(
    buildThreeColumnLayout({
      gap: 'narrow',
      mobileStackOrder: 'left-first',
      columns: triColumns,
    })
  );

  // 4. Two-column — challenge + approach
  sections.push(
    buildTwoColumnLayout({
      ratio: '50-50',
      gap: 'default',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>The Challenge</h2>' +
            formatAsHtml(project.projectContent?.challenge || ''),
        }),
      ],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>The Approach</h2>' +
            formatAsHtml(project.projectContent?.approach || ''),
        }),
      ],
    })
  );

  // 5. Gallery — construction process (4 images)
  const processImgs = getNextN(4);
  sections.push(
    buildGallerySection({
      heading: 'Construction Process',
      images: galleryImagesPayload(processImgs),
    })
  );

  // 6. Two-column — image + outcome
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '40-60',
      gap: 'default',
      mobileStackOrder: 'right-first',
      leftColumn: outcomeImg ? [outcomeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>The Outcome</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
    })
  );

  // 7. Techniques & materials text
  sections.push(
    buildTextSection({
      body:
        '<h2>Techniques & Materials</h2>' +
        buildTechniquesHtml(project.techniques, project.recognition),
    })
  );

  // 8. Related project card (if available)
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

  // 9. Gallery — remaining
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: '', images: galleryImagesPayload(restImgs) })
    );
  }

  return sections;
}

/** Julian Template B (odd order indices) */
function julianTemplateB(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column — overview + image
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

  // 3. Three-column — challenge, approach, techniques
  sections.push(
    buildThreeColumnLayout({
      gap: 'default',
      mobileStackOrder: 'right-first',
      columns: [
        [
          buildTextSection({
            body:
              '<h2>The Challenge</h2>' +
              formatAsHtml(project.projectContent?.challenge || ''),
          }),
        ],
        [
          buildTextSection({
            body:
              '<h2>The Approach</h2>' +
              formatAsHtml(project.projectContent?.approach || ''),
          }),
        ],
        [
          buildTextSection({
            body:
              '<h2>Techniques</h2>' +
              buildTechniquesHtml(project.techniques, []),
          }),
        ],
      ],
    })
  );

  // 4. Gallery — process & results (4 images)
  const processImgs = getNextN(4);
  sections.push(
    buildGallerySection({
      heading: 'Process & Results',
      images: galleryImagesPayload(processImgs),
    })
  );

  // 5. Two-column — outcome + related card
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    2
  );
  sections.push(
    buildTwoColumnLayout({
      ratio: '60-40',
      gap: 'wide',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>The Outcome</h2>' +
            formatAsHtml(project.projectContent?.outcome || '') +
            (project.recognition && project.recognition.length > 0
              ? '<h3>Recognition</h3><ul>' +
                project.recognition.map(r => `<li>${r}</li>`).join('') +
                '</ul>'
              : ''),
        }),
      ],
      rightColumn:
        relatedIds.length > 0
          ? [buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'compact', showMetadata: true })]
          : [buildTextSection({ body: '' })],
    })
  );

  // 6. Related project list (if 2+ related)
  if (relatedIds.length >= 2) {
    sections.push(
      buildProjectListSection({
        projectIds: relatedIds.slice(0, 2),
        layout: 'vertical',
        showMetadata: false,
      })
    );
  }

  // 7. Gallery — remaining
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: '', images: galleryImagesPayload(restImgs) })
    );
  }

  return sections;
}

// ============================================
// EMMA RODRIGUEZ — "Cinematic Scope"
// Extreme ratios, wide gaps
// ============================================

function emmaHomepage(context) {
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
    showResumeLink: true,
  });

  // 2. Featured grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'featured-grid',
    heading: 'Selected Productions',
    items: [],
  });

  // 3. Category grid (inline)
  sections.push({
    id: generateSectionId(),
    type: 'category-grid',
    heading: '',
    categoryIds: null,
    columns: 2,
    showDescription: false,
    showProjectCount: true,
  });

  // 4. Project grid (inline) — complete filmography
  sections.push({
    id: generateSectionId(),
    type: 'project-grid',
    heading: 'Complete Filmography',
    description: '',
    projectIds: null,
    columns: 4,
    showMetadata: true,
    layout: 'list',
  });

  return sections;
}

function emmaAboutPage(context) {
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
    showResumeLink: true,
  });

  // 2. Two-column 70-30 — career overview + image
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
              'From independent shorts to studio tentpoles, my work in costume design is driven by the conviction that what characters wear shapes how audiences feel. Every production is a world to build, one garment at a time.'
            ),
        }),
      ],
      rightColumn: [
        buildImageSection({ imageId: null, imageUrl: null, altText: 'Emma on set' }),
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
        buildImageSection({ imageId: null, imageUrl: null, altText: 'Costume design process' }),
      ],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>Methodology</h2>' +
            formatAsHtml(
              'I begin with the script and let the characters speak. Research follows—historical, cultural, psychological. Then the sketches, the fabric pulls, the fittings. Collaboration with directors and cinematographers ensures the costumes live within the visual world of the film.'
            ),
        }),
      ],
    })
  );

  // 4. Sidebar — awards sidebar + key credits main
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'right',
      sidebarWidth: 320,
      gap: 'wide',
      mobileStackOrder: 'main-first',
      sidebar: [
        buildTextSection({
          body:
            '<h2>Awards & Nominations</h2>' +
            '<p>Recognition from industry peers and critics, including festival selections and guild nominations.</p>',
        }),
      ],
      main: [
        buildTextSection({
          body:
            '<h2>Key Credits</h2>' +
            '<p>A filmography spanning indie darlings, prestige television, and studio features. Each project a new world, a new set of rules, a new collaboration.</p>',
        }),
      ],
    })
  );

  // 5. Gallery — on set (empty)
  sections.push(buildGallerySection({ heading: 'On Set', images: [] }));

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
      context.taggedImages?.categoryCarousels?.get(category.slug) || [];
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

    // 3. Project grid (inline)
    sections.push({
      id: generateSectionId(),
      type: 'project-grid',
      heading: '',
      projectIds: null,
      columns: 4,
      showMetadata: true,
      layout: 'list',
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

  if (isEven) {
    return emmaTemplateA(project, getNext, getNextN, remaining, context);
  }
  return emmaTemplateB(project, getNext, getNextN, remaining, context);
}

/** Emma Template A (even order indices) */
function emmaTemplateA(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Two-column 70-30 — overview + production credits
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

  // 3. Two-column 30-70 — image + challenge
  const challengeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '30-70',
      gap: 'wide',
      mobileStackOrder: 'right-first',
      leftColumn: challengeImg ? [challengeImg] : [],
      rightColumn: [
        buildTextSection({
          body:
            '<h2>The Challenge</h2>' +
            formatAsHtml(project.projectContent?.challenge || ''),
        }),
      ],
    })
  );

  // 4. Gallery — production stills (4 images)
  const stillImgs = getNextN(4);
  sections.push(
    buildGallerySection({
      heading: 'Production Stills',
      images: galleryImagesPayload(stillImgs),
    })
  );

  // 5. Approach text (full-width)
  sections.push(
    buildTextSection({
      body:
        '<h2>The Approach</h2>' +
        formatAsHtml(project.projectContent?.approach || ''),
    })
  );

  // 6. Two-column 50-50 — outcome + image
  const outcomeImg = imageFromGallery(getNext());
  sections.push(
    buildTwoColumnLayout({
      ratio: '50-50',
      gap: 'wide',
      mobileStackOrder: 'left-first',
      leftColumn: [
        buildTextSection({
          body:
            '<h2>The Outcome</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
      rightColumn: outcomeImg ? [outcomeImg] : [],
    })
  );

  // 7. Related project list (if available, up to 2)
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

  // 8. Gallery — remaining
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: '', images: galleryImagesPayload(restImgs) })
    );
  }

  return sections;
}

/** Emma Template B (odd order indices) */
function emmaTemplateB(project, getNext, getNextN, remaining, context) {
  const sections = [];

  // 1. Hero image
  const heroImg = imageFromGallery(getNext());
  if (heroImg) sections.push(heroImg);

  // 2. Sidebar — production facts sidebar + overview/challenge main
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
            '<h2>The Challenge</h2>' +
            formatAsHtml(project.projectContent?.challenge || ''),
        }),
      ],
    })
  );

  // 3. Two-column 30-70 — related card + gallery
  const relatedIds = getRelatedProjectIds(
    context,
    project.id || '',
    project.categorySlug || '',
    1
  );
  const inlineGalleryImgs = getNextN(4);
  sections.push(
    buildTwoColumnLayout({
      ratio: '30-70',
      gap: 'default',
      mobileStackOrder: 'right-first',
      leftColumn:
        relatedIds.length > 0
          ? [buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'compact', showMetadata: true })]
          : [],
      rightColumn: [
        buildGallerySection({
          heading: '',
          images: galleryImagesPayload(inlineGalleryImgs),
        }),
      ],
    })
  );

  // 4. Approach text (full-width)
  sections.push(
    buildTextSection({
      body:
        '<h2>The Approach</h2>' +
        formatAsHtml(project.projectContent?.approach || ''),
    })
  );

  // 5. Sidebar — techniques sidebar + outcome main
  sections.push(
    buildSidebarLayout({
      sidebarPosition: 'left',
      sidebarWidth: 240,
      gap: 'default',
      mobileStackOrder: 'sidebar-first',
      sidebar: [
        buildTextSection({
          body: buildTechniquesHtml(project.techniques, []),
        }),
      ],
      main: [
        buildTextSection({
          body:
            '<h2>The Outcome</h2>' +
            formatAsHtml(project.projectContent?.outcome || ''),
        }),
      ],
    })
  );

  // 6. Related project card (standard, if available)
  if (relatedIds.length > 0) {
    sections.push(
      buildProjectCardSection({ projectId: relatedIds[0], cardSize: 'standard', showMetadata: true })
    );
  }

  // 7. Gallery — remaining
  const restImgs = remaining();
  if (restImgs.length > 0) {
    sections.push(
      buildGallerySection({ heading: '', images: galleryImagesPayload(restImgs) })
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
  return sarahCategoryPage(category, categoryIndex, context);
}
