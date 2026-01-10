import { ComponentType } from 'react'

// Types for template props - templates receive identical props
export interface FeaturedProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  featuredImageUrl: string | null
  featuredImageAlt: string
  categorySlug: string
  categoryName: string
  order: number
}

export interface NavPage {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  showInNav: boolean
}

export interface NavCategory {
  id: string
  name: string
  slug: string
}

export interface ProfilePhoto {
  url: string
  thumbnailUrl?: string
  altText?: string
}

export interface TemplateProps {
  portfolio: {
    slug: string
    name: string
    bio?: string | null
    profilePhoto?: ProfilePhoto | null
    showAboutSection?: boolean | null
  }
  sections: any[] // Section[] from content-schema
  featuredProjects: FeaturedProject[]
}

// Template metadata for UI
export interface TemplateDefinition {
  id: string
  name: string
  description: string
  bestFor: string
}

export const templates: TemplateDefinition[] = [
  {
    id: 'featured-grid',
    name: 'Featured Grid',
    description: 'Grid of project cards with hover overlays',
    bestFor: 'Organized, gallery-like presentation',
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Full-width stacked images for editorial browsing',
    bestFor: 'Visual storytellers and fashion designers',
  },
]

export type TemplateId = 'featured-grid' | 'clean-minimal'

// Template components will be added via dynamic imports to avoid circular deps
export { FeaturedGridTemplate } from './FeaturedGridTemplate'
export { CleanMinimalTemplate } from './CleanMinimalTemplate'
