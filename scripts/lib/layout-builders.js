/**
 * Layout Builder Functions
 * 
 * Pure factory functions for creating section objects that match
 * the content-schema.ts types. Used by layout strategies to construct
 * enhanced page layouts.
 */

// ============================================
// ID Generation
// ============================================

/**
 * Generate a unique section ID
 * @returns {string} Unique section identifier
 */
export function generateSectionId() {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Layout Container Builders
// ============================================

/**
 * Build a two-column layout section
 * @param {Object} options
 * @param {'50-50' | '60-40' | '40-60' | '70-30' | '30-70'} options.ratio - Column width ratio
 * @param {'narrow' | 'default' | 'wide'} [options.gap='default'] - Gap between columns
 * @param {Array} options.leftColumn - Content sections for left column
 * @param {Array} options.rightColumn - Content sections for right column
 * @param {'left-first' | 'right-first'} [options.mobileStackOrder='left-first'] - Mobile stacking order
 * @returns {Object} LayoutTwoColumnSection
 */
export function buildTwoColumnLayout({ 
  ratio, 
  gap = 'default', 
  leftColumn, 
  rightColumn, 
  mobileStackOrder = 'left-first' 
}) {
  return {
    id: generateSectionId(),
    type: 'layout-two-column',
    ratio,
    gap,
    mobileStackOrder,
    leftColumn: leftColumn || [],
    rightColumn: rightColumn || []
  };
}

/**
 * Build a three-column layout section
 * @param {Object} options
 * @param {'narrow' | 'default' | 'wide'} [options.gap='default'] - Gap between columns
 * @param {Array<Array>} options.columns - Array of 3 content section arrays
 * @param {'left-first' | 'right-first'} [options.mobileStackOrder='left-first'] - Mobile stacking order
 * @returns {Object} LayoutThreeColumnSection
 */
export function buildThreeColumnLayout({ 
  gap = 'default', 
  columns, 
  mobileStackOrder = 'left-first' 
}) {
  // Ensure we have exactly 3 columns
  const normalizedColumns = [
    columns?.[0] || [],
    columns?.[1] || [],
    columns?.[2] || []
  ];
  
  return {
    id: generateSectionId(),
    type: 'layout-three-column',
    gap,
    mobileStackOrder,
    columns: normalizedColumns
  };
}

/**
 * Build a sidebar layout section
 * @param {Object} options
 * @param {'left' | 'right'} [options.sidebarPosition='left'] - Sidebar position
 * @param {240 | 280 | 320} [options.sidebarWidth=280] - Sidebar width in pixels
 * @param {'narrow' | 'default' | 'wide'} [options.gap='default'] - Gap between sidebar and main
 * @param {Array} options.sidebar - Content sections for sidebar
 * @param {Array} options.main - Content sections for main area
 * @param {'sidebar-first' | 'main-first'} [options.mobileStackOrder='sidebar-first'] - Mobile stacking order
 * @returns {Object} LayoutSidebarSection
 */
export function buildSidebarLayout({ 
  sidebarPosition = 'left', 
  sidebarWidth = 280, 
  gap = 'default', 
  sidebar, 
  main, 
  mobileStackOrder = 'sidebar-first' 
}) {
  return {
    id: generateSectionId(),
    type: 'layout-sidebar',
    sidebarPosition,
    sidebarWidth,
    gap,
    mobileStackOrder,
    sidebar: sidebar || [],
    main: main || []
  };
}

// ============================================
// Content Section Builders
// ============================================

/**
 * Build a project card section (single project embed)
 * @param {Object} options
 * @param {string} options.projectId - ID of the project to display
 * @param {'compact' | 'standard' | 'large'} [options.cardSize='standard'] - Card size
 * @param {boolean} [options.showMetadata=true] - Show year, venue, role
 * @returns {Object} ProjectCardSection
 */
export function buildProjectCardSection({ 
  projectId, 
  cardSize = 'standard', 
  showMetadata = true 
}) {
  return {
    id: generateSectionId(),
    type: 'project-card',
    projectId,
    cardSize,
    showMetadata
  };
}

/**
 * Build a project list section (2-4 projects in a column)
 * @param {Object} options
 * @param {string[]} options.projectIds - Array of project IDs (1-4 max)
 * @param {'vertical' | 'mini-grid'} [options.layout='vertical'] - List layout
 * @param {boolean} [options.showMetadata=true] - Show project metadata
 * @returns {Object} ProjectListSection
 */
export function buildProjectListSection({ 
  projectIds, 
  layout = 'vertical', 
  showMetadata = true 
}) {
  return {
    id: generateSectionId(),
    type: 'project-list',
    projectIds: projectIds || [],
    layout,
    showMetadata
  };
}

/**
 * Build a text section with optional heading
 * Supports both plain text and pre-formatted HTML content.
 * 
 * @param {Object} options
 * @param {string} [options.heading=''] - Section heading (rendered separately, not in content)
 * @param {string} options.body - Text content (plain text or HTML)
 * @param {boolean} [options.formatAsHtml=false] - Auto-format plain text as HTML with lead phrases
 * @returns {Object} TextSection
 * 
 * @example
 * // Plain text (legacy)
 * buildTextSection({ heading: 'About', body: 'Some text here.' })
 * 
 * // Pre-formatted HTML
 * buildTextSection({ body: '<h2>About</h2><p><strong>Some text</strong> here.</p>' })
 * 
 * // Auto-format plain text as HTML
 * buildTextSection({ heading: 'About', body: 'Some text here.', formatAsHtml: true })
 */
export function buildTextSection({ heading = '', body, formatAsHtml = false }) {
  let content = body || '';
  
  // Auto-format plain text as HTML if requested
  if (formatAsHtml && content && !content.includes('<p>') && !content.includes('<h2>')) {
    content = formatTextAsHtml(content, { heading: '', addLeadPhrases: true });
  }
  
  return {
    id: generateSectionId(),
    type: 'text',
    heading: heading,
    content: content
  };
}

/**
 * Build an image section
 * @param {Object} options
 * @param {string|null} options.imageId - Asset ID
 * @param {string|null} options.imageUrl - Image URL
 * @param {string} [options.caption=''] - Image caption
 * @param {string} [options.altText=''] - Alt text for accessibility
 * @param {number} [options.width] - Image width in pixels
 * @param {number} [options.height] - Image height in pixels
 * @returns {Object} ImageSection
 */
export function buildImageSection({ 
  imageId, 
  imageUrl, 
  caption = '', 
  altText = '',
  width,
  height
}) {
  const section = {
    id: generateSectionId(),
    type: 'image',
    imageId: imageId || null,
    imageUrl: imageUrl || null,
    caption,
    altText
  };
  if (width != null && height != null) {
    section.width = width;
    section.height = height;
  }
  return section;
}

/**
 * Build a gallery section
 * @param {Object} options
 * @param {string} [options.heading=''] - Gallery heading
 * @param {Array<{imageId: string, imageUrl: string, altText?: string, caption?: string}>} options.images - Gallery images
 * @returns {Object} GallerySection
 */
export function buildGallerySection({ heading = '', images }) {
  const galleryImages = (images || []).map(img => ({
    id: generateSectionId(),
    imageId: img.imageId || null,
    imageUrl: img.imageUrl || null,
    altText: img.altText || '',
    caption: img.caption || ''
  }));
  
  return {
    id: generateSectionId(),
    type: 'gallery',
    heading,
    images: galleryImages
  };
}

/**
 * Build a carousel section (featured-carousel type)
 * @param {Object} options
 * @param {string} [options.heading=''] - Carousel heading
 * @param {Array<{imageId: string, imageUrl: string, title?: string, category?: string, link?: string}>} options.images - Carousel images
 * @param {boolean} [options.autoRotate=true] - Auto-rotate slides
 * @param {number} [options.interval=5000] - Auto-rotate interval in ms
 * @returns {Object} FeaturedCarouselSection
 */
export function buildCarouselSection({ 
  heading = '', 
  images, 
  autoRotate = true, 
  interval = 5000 
}) {
  const items = (images || []).map(img => ({
    id: generateSectionId(),
    imageId: img.imageId || null,
    imageUrl: img.imageUrl || null,
    title: img.title || '',
    category: img.category || '',
    link: img.link || ''
  }));
  
  return {
    id: generateSectionId(),
    type: 'featured-carousel',
    heading,
    items,
    autoRotate,
    autoRotateInterval: interval
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format plain text into properly structured HTML.
 * Breaks long text into paragraphs with optional bold lead phrases.
 * 
 * @param {string} text - Plain text to format
 * @param {Object} options
 * @param {string} [options.heading=''] - Optional h2 heading to prepend
 * @param {boolean} [options.addLeadPhrases=true] - Bold first few words of each paragraph
 * @param {number} [options.maxSentencesPerParagraph=2] - Split long text into paragraphs
 * @returns {string} Properly formatted HTML
 * 
 * @example
 * // Input: "I approach each project with research. Understanding the client is key."
 * // Output: "<p><strong>I approach each project</strong> with research.</p><p><strong>Understanding the client</strong> is key.</p>"
 */
export function formatTextAsHtml(text, options = {}) {
  const { 
    heading = '', 
    addLeadPhrases = true,
    maxSentencesPerParagraph = 2
  } = options;
  
  if (!text || typeof text !== 'string') {
    return heading ? `<h2>${heading}</h2>` : '';
  }
  
  // Check if text is already HTML formatted
  if (text.includes('<p>') || text.includes('<h2>') || text.includes('<h1>')) {
    return heading ? `<h2>${heading}</h2>\n${text}` : text;
  }
  
  let result = '';
  
  // Add heading if provided
  if (heading) {
    result += `<h2>${heading}</h2>\n`;
  }
  
  // Split into sentences (handle common abbreviations)
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
  const sentences = text.split(sentenceRegex).filter(s => s.trim());
  
  // Group sentences into paragraphs
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += maxSentencesPerParagraph) {
    const chunk = sentences.slice(i, i + maxSentencesPerParagraph).join(' ');
    paragraphs.push(chunk.trim());
  }
  
  // Format each paragraph
  for (const para of paragraphs) {
    if (!para) continue;
    
    let formattedPara = para;
    
    // Add bold lead phrase (first 3-5 words)
    if (addLeadPhrases) {
      const words = para.split(/\s+/);
      if (words.length > 4) {
        // Find a good break point (after 3-5 words, ideally at punctuation or natural break)
        let breakPoint = Math.min(4, words.length);
        
        // Look for a better break point (comma, dash, or preposition)
        for (let i = 2; i < Math.min(6, words.length); i++) {
          const word = words[i].toLowerCase();
          if (words[i - 1].endsWith(',') || 
              words[i - 1].endsWith('—') || 
              ['with', 'through', 'into', 'from', 'that', 'and', 'for'].includes(word)) {
            breakPoint = i;
            break;
          }
        }
        
        const leadPhrase = words.slice(0, breakPoint).join(' ');
        const remainder = words.slice(breakPoint).join(' ');
        formattedPara = `<strong>${leadPhrase}</strong> ${remainder}`;
      }
    }
    
    result += `<p>${formattedPara}</p>\n`;
  }
  
  return result.trim();
}

/**
 * Extract a short tagline from longer text (1-2 sentences max)
 * @param {string} text - Full text content
 * @param {number} [maxSentences=2] - Maximum sentences to extract
 * @returns {string} Short tagline
 */
export function extractTagline(text, maxSentences = 2) {
  if (!text) return '';
  
  // If already short, return as-is
  if (text.length < 150) return text;
  
  // Split into sentences and take first N
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
  const sentences = text.split(sentenceRegex).filter(s => s.trim());
  
  return sentences.slice(0, maxSentences).join(' ').trim();
}

/**
 * Extract remaining content after tagline
 * @param {string} text - Full text content
 * @param {number} [skipSentences=2] - Sentences to skip (used for tagline)
 * @returns {string} Remaining content
 */
export function extractRemainingContent(text, skipSentences = 2) {
  if (!text) return '';
  
  const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/g;
  const sentences = text.split(sentenceRegex).filter(s => s.trim());
  
  if (sentences.length <= skipSentences) return '';
  
  return sentences.slice(skipSentences).join(' ').trim();
}

/**
 * Build formatted text with markdown emphasis
 * @param {string} text - Plain text
 * @param {Object} options
 * @param {boolean} [options.bold=false] - Wrap in bold
 * @param {boolean} [options.italic=false] - Wrap in italic
 * @param {boolean} [options.quote=false] - Format as blockquote
 * @returns {string} Formatted text
 */
export function formatText(text, { bold = false, italic = false, quote = false } = {}) {
  let result = text;
  
  if (bold) result = `**${result}**`;
  if (italic) result = `*${result}*`;
  if (quote) result = `> ${result.split('\n').join('\n> ')}`;
  
  return result;
}

/**
 * Build a bullet list from array of items
 * @param {string[]} items - List items
 * @returns {string} Markdown bullet list
 */
export function buildBulletList(items) {
  return items.map(item => `- ${item}`).join('\n');
}

/**
 * Build a testimonial/quote block
 * @param {string} quote - Quote text
 * @param {string} [attribution] - Attribution (author/source)
 * @returns {string} Formatted quote block
 */
export function buildQuoteBlock(quote, attribution) {
  let result = `> "${quote}"`;
  if (attribution) {
    result += `\n> — ${attribution}`;
  }
  return result;
}
