/**
 * Content Schema - Section-based page/project content architecture.
 *
 * Pages and projects are composed of an ordered array of sections.
 * Each section has a type discriminator and type-specific content.
 *
 * This schema is the source of truth for content structure - used by:
 * - Editor components (render appropriate UI per section type)
 * - API routes (validate incoming content)
 * - Portfolio renderers (select correct display component)
 * - Serialization utilities (convert to/from storage format)
 *
 * Content is stored as JSON in draftContent/publishedContent fields.
 * See the Draft/Publish workflow documentation for how these fields relate.
 */

// Base section interface
export interface BaseSection {
  id: string
  type: string
}

// Text Section - Rich text content
export interface TextSection extends BaseSection {
  type: 'text'
  content: string // HTML content from rich text editor
}

// Image Section - Single image with optional caption
export interface ImageSection extends BaseSection {
  type: 'image'
  imageId: string | null // Reference to Asset id
  imageUrl: string | null
  altText: string
  caption: string
  width?: number  // Asset dimensions for orientation-aware display
  height?: number
}

// Hero Section - Name, title, bio, and optional profile image
export interface HeroSection extends BaseSection {
  type: 'hero'
  name: string
  title: string
  bio: string // HTML content
  profileImageId: string | null
  profileImageUrl: string | null
  showResumeLink: boolean
  resumeUrl: string
}

// Featured Work Item - For the featured grid
export interface FeaturedWorkItem {
  id: string
  imageId: string | null
  imageUrl: string | null
  title: string
  category: string
  link: string
  width?: number  // Asset dimensions for orientation-aware display
  height?: number
}

// Featured Grid Section - Grid of featured work
export interface FeaturedGridSection extends BaseSection {
  type: 'featured-grid'
  heading: string
  items: FeaturedWorkItem[]
}

// Featured Carousel Section - Auto-rotating carousel of featured work
export interface FeaturedCarouselSection extends BaseSection {
  type: 'featured-carousel'
  heading: string
  items: FeaturedWorkItem[]  // Reuse existing FeaturedWorkItem type
  autoRotate: boolean
  autoRotateInterval: number  // milliseconds
}

// Gallery Image - Individual image in a gallery
export interface GalleryImage {
  id: string
  imageId: string | null
  imageUrl: string | null
  altText: string
  caption: string
  width?: number  // Asset dimensions for orientation-aware display
  height?: number
}

// Gallery Section - Multiple images in a responsive grid
export interface GallerySection extends BaseSection {
  type: 'gallery'
  heading: string
  images: GalleryImage[]
}

// Category Grid Section - Auto-populated grid of categories
// Displays categories from the database with optional filtering and ordering
export interface CategoryGridSection extends BaseSection {
  type: 'category-grid'
  heading: string
  description: string // Optional intro text
  categoryIds: string[] | null // Explicit ordering, null = use all categories by Category.order
  columns: 2 | 3 | 4 // Grid layout (desktop)
  showDescription: boolean // Show category.description
  showProjectCount: boolean // Show "5 projects"
}

// Project Grid Section - Auto-populated grid of projects
// Displays projects from the parent category with optional filtering and ordering
export interface ProjectGridSection extends BaseSection {
  type: 'project-grid'
  heading: string
  description: string
  projectIds: string[] | null // Explicit ordering, null = use all projects by Project.order
  excludeProjectIds: string[] | null // Exclude these projects (for "show the rest" pattern)
  columns: 2 | 3 | 4
  showMetadata: boolean // Show year, venue, role
  layout: 'grid' | 'masonry' | 'list'
}

// Project Card Section - Single project embed for layout columns
export interface ProjectCardSection extends BaseSection {
  type: 'project-card'
  projectId: string | null // Reference to Project id
  showMetadata: boolean // year, venue, role
  cardSize: 'compact' | 'standard' | 'large'
}

// Project List Section - 2-4 projects in a column
export interface ProjectListSection extends BaseSection {
  type: 'project-list'
  projectIds: string[] // 1-4 max
  layout: 'vertical' | 'mini-grid'
  showMetadata: boolean
}

// ============================================
// CONTENT SECTIONS (can go inside layouts)
// Excludes: HeroSection (page-level only), FeaturedGridSection,
// CategoryGridSection, ProjectGridSection (full-width by design)
// ============================================
export type ContentSection = 
  | TextSection 
  | ImageSection 
  | GallerySection
  | FeaturedCarouselSection
  | ProjectCardSection
  | ProjectListSection

// ============================================
// LAYOUT SECTIONS
// ============================================

// Two-Column Layout
export interface LayoutTwoColumnSection extends BaseSection {
  type: 'layout-two-column'
  ratio: '50-50' | '60-40' | '40-60' | '70-30' | '30-70'
  gap: 'narrow' | 'default' | 'wide'
  mobileStackOrder: 'left-first' | 'right-first'
  leftColumn: ContentSection[]
  rightColumn: ContentSection[]
}

// Three-Column Layout
export interface LayoutThreeColumnSection extends BaseSection {
  type: 'layout-three-column'
  gap: 'narrow' | 'default' | 'wide'
  mobileStackOrder: 'left-first' | 'right-first'
  columns: [ContentSection[], ContentSection[], ContentSection[]]
}

// Sidebar + Main Layout
export interface LayoutSidebarSection extends BaseSection {
  type: 'layout-sidebar'
  sidebarPosition: 'left' | 'right'
  sidebarWidth: 240 | 280 | 320
  gap: 'narrow' | 'default' | 'wide'
  mobileStackOrder: 'sidebar-first' | 'main-first'
  sidebar: ContentSection[]
  main: ContentSection[]
}

// Union of all layout types
export type LayoutSection = 
  | LayoutTwoColumnSection 
  | LayoutThreeColumnSection 
  | LayoutSidebarSection

// Union type of all sections (top-level)
export type Section = 
  | TextSection 
  | ImageSection 
  | HeroSection 
  | FeaturedGridSection 
  | FeaturedCarouselSection 
  | GallerySection
  | CategoryGridSection
  | ProjectGridSection
  | ProjectCardSection
  | ProjectListSection
  | LayoutSection

// Page content structure
export interface PageContent {
  sections: Section[]
}

// Type guards for section types
export function isTextSection(section: Section): section is TextSection {
  return section.type === 'text'
}

export function isImageSection(section: Section): section is ImageSection {
  return section.type === 'image'
}

export function isHeroSection(section: Section): section is HeroSection {
  return section.type === 'hero'
}

export function isFeaturedGridSection(section: Section): section is FeaturedGridSection {
  return section.type === 'featured-grid'
}

export function isFeaturedCarouselSection(section: Section): section is FeaturedCarouselSection {
  return section.type === 'featured-carousel'
}

export function isGallerySection(section: Section): section is GallerySection {
  return section.type === 'gallery'
}

export function isCategoryGridSection(section: Section): section is CategoryGridSection {
  return section.type === 'category-grid'
}

export function isProjectGridSection(section: Section): section is ProjectGridSection {
  return section.type === 'project-grid'
}

export function isProjectCardSection(section: Section): section is ProjectCardSection {
  return section.type === 'project-card'
}

export function isProjectListSection(section: Section): section is ProjectListSection {
  return section.type === 'project-list'
}

// Layout type guards
export function isLayoutSection(section: Section): section is LayoutSection {
  return section.type.startsWith('layout-')
}

export function isLayoutTwoColumnSection(section: Section): section is LayoutTwoColumnSection {
  return section.type === 'layout-two-column'
}

export function isLayoutThreeColumnSection(section: Section): section is LayoutThreeColumnSection {
  return section.type === 'layout-three-column'
}

export function isLayoutSidebarSection(section: Section): section is LayoutSidebarSection {
  return section.type === 'layout-sidebar'
}

export function isContentSection(section: Section): section is ContentSection {
  return !section.type.startsWith('layout-')
}

// Factory functions to create new sections
export function createTextSection(content: string = ''): TextSection {
  return {
    id: generateId(),
    type: 'text',
    content,
  }
}

export function createImageSection(): ImageSection {
  return {
    id: generateId(),
    type: 'image',
    imageId: null,
    imageUrl: null,
    altText: '',
    caption: '',
  }
}

export function createHeroSection(
  name: string = '',
  title: string = '',
  bio: string = ''
): HeroSection {
  return {
    id: generateId(),
    type: 'hero',
    name,
    title,
    bio,
    profileImageId: null,
    profileImageUrl: null,
    showResumeLink: false,
    resumeUrl: '',
  }
}

export function createFeaturedGridSection(): FeaturedGridSection {
  return {
    id: generateId(),
    type: 'featured-grid',
    heading: 'Featured Work',
    items: [],
  }
}

export function createFeaturedCarouselSection(): FeaturedCarouselSection {
  return {
    id: generateId(),
    type: 'featured-carousel',
    heading: 'Featured Work',
    items: [],
    autoRotate: true,
    autoRotateInterval: 5000,
  }
}

export function createFeaturedWorkItem(): FeaturedWorkItem {
  return {
    id: generateId(),
    imageId: null,
    imageUrl: null,
    title: '',
    category: '',
    link: '',
  }
}

export function createGallerySection(): GallerySection {
  return {
    id: generateId(),
    type: 'gallery',
    heading: '',
    images: [],
  }
}

export function createGalleryImage(): GalleryImage {
  return {
    id: generateId(),
    imageId: null,
    imageUrl: null,
    altText: '',
    caption: '',
  }
}

export function createCategoryGridSection(): CategoryGridSection {
  return {
    id: generateId(),
    type: 'category-grid',
    heading: 'Work',
    description: '',
    categoryIds: null, // null = auto-populate all categories
    columns: 3,
    showDescription: true,
    showProjectCount: true,
  }
}

export function createProjectGridSection(): ProjectGridSection {
  return {
    id: generateId(),
    type: 'project-grid',
    heading: 'Projects',
    description: '',
    projectIds: null, // null = auto-populate all projects in category
    excludeProjectIds: null, // null = don't exclude any
    columns: 3,
    showMetadata: true,
    layout: 'grid',
  }
}

export function createProjectCardSection(): ProjectCardSection {
  return {
    id: generateId(),
    type: 'project-card',
    projectId: null,
    showMetadata: true,
    cardSize: 'standard',
  }
}

export function createProjectListSection(): ProjectListSection {
  return {
    id: generateId(),
    type: 'project-list',
    projectIds: [],
    layout: 'vertical',
    showMetadata: true,
  }
}

// Layout factory functions
export function createLayoutTwoColumnSection(): LayoutTwoColumnSection {
  return {
    id: generateId(),
    type: 'layout-two-column',
    ratio: '50-50',
    gap: 'default',
    mobileStackOrder: 'left-first',
    leftColumn: [],
    rightColumn: [],
  }
}

export function createLayoutThreeColumnSection(): LayoutThreeColumnSection {
  return {
    id: generateId(),
    type: 'layout-three-column',
    gap: 'default',
    mobileStackOrder: 'left-first',
    columns: [[], [], []],
  }
}

export function createLayoutSidebarSection(): LayoutSidebarSection {
  return {
    id: generateId(),
    type: 'layout-sidebar',
    sidebarPosition: 'left',
    sidebarWidth: 280,
    gap: 'default',
    mobileStackOrder: 'main-first',
    sidebar: [],
    main: [],
  }
}

// Simple ID generator
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Section type metadata for UI
export const sectionTypes = [
  {
    type: 'text' as const,
    label: 'Text',
    description: 'Rich text content',
    icon: '📝',
  },
  {
    type: 'image' as const,
    label: 'Image',
    description: 'Single image with caption',
    icon: '🖼️',
  },
  {
    type: 'hero' as const,
    label: 'Profile Card',
    description: 'Your bio and photo (uses Default Bio from Settings)',
    icon: '👤',
  },
  {
    type: 'featured-grid' as const,
    label: 'Featured Grid',
    description: 'Grid of featured work',
    icon: '⚡',
  },
  {
    type: 'featured-carousel' as const,
    label: 'Featured Carousel',
    description: 'Auto-rotating carousel of featured work',
    icon: '🎠',
  },
  {
    type: 'gallery' as const,
    label: 'Gallery',
    description: 'Multiple images in a grid',
    icon: '🖼️',
  },
  {
    type: 'category-grid' as const,
    label: 'Category Grid',
    description: 'Grid of all categories',
    icon: '📁',
  },
  {
    type: 'project-grid' as const,
    label: 'Project Grid',
    description: 'Grid of projects in this category',
    icon: '🗂️',
  },
  {
    type: 'project-card' as const,
    label: 'Project Card',
    description: 'Single project embed',
    icon: '📋',
    isContentSection: true,
  },
  {
    type: 'project-list' as const,
    label: 'Project List',
    description: '2-4 projects in a list',
    icon: '📑',
    isContentSection: true,
  },
  {
    type: 'layout-two-column' as const,
    label: 'Two Columns',
    description: 'Side-by-side content layout',
    icon: '▐▐',
    isLayout: true,
  },
  {
    type: 'layout-three-column' as const,
    label: 'Three Columns',
    description: 'Three equal columns',
    icon: '▐▐▐',
    isLayout: true,
  },
  {
    type: 'layout-sidebar' as const,
    label: 'Sidebar + Main',
    description: 'Fixed sidebar with main content',
    icon: '▌█',
    isLayout: true,
  },
] as const

export type SectionType = typeof sectionTypes[number]['type']
