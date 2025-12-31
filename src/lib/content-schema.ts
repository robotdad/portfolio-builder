/**
 * Content Schema - Section-based page architecture
 * 
 * Pages are composed of an array of sections that can be reordered.
 * Each section has a type and type-specific content.
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
}

// Featured Grid Section - Grid of featured work
export interface FeaturedGridSection extends BaseSection {
  type: 'featured-grid'
  heading: string
  items: FeaturedWorkItem[]
}

// Union type of all sections
export type Section = TextSection | ImageSection | HeroSection | FeaturedGridSection

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
    label: 'Hero',
    description: 'Name, title, and introduction',
    icon: '👤',
  },
  {
    type: 'featured-grid' as const,
    label: 'Featured Grid',
    description: 'Grid of featured work',
    icon: '⚡',
  },
] as const

export type SectionType = typeof sectionTypes[number]['type']
