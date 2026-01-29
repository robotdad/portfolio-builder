'use client'

import { Breadcrumb } from './Breadcrumb'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'
import { AdaptiveGrid } from '@/components/layout/AdaptiveGrid'

interface CategoryProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  order: number
  featuredImageUrl?: string | null
  featuredImageAlt?: string
  featuredImageWidth?: number
  featuredImageHeight?: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface CategoryLandingProps {
  portfolio: {
    name: string
    publishedTheme: string
  }
  category: Category
  projects: CategoryProject[]
  /** Empty string for published site, "preview" for preview mode */
  portfolioSlug?: string
}

/**
 * CategoryLanding Page Template
 * 
 * Displays all projects in a category as a responsive grid:
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column (2 on larger phones)
 * 
 * Features:
 * - Breadcrumb navigation (just category name on category page)
 * - Project cards with hover overlay
 * - Professional empty state when no projects
 * 
 * Note: Navigation and footer are provided by the layout.
 */
export function CategoryLanding({ 
  portfolio, 
  category, 
  projects,
  portfolioSlug = ''
}: CategoryLandingProps) {
  return (
    <div className="container">
      {/* Page header with breadcrumb */}
      <header className="category-header">
        <Breadcrumb 
          items={[
            { label: category.name }
          ]} 
        />
        <h1 className="category-title">{category.name}</h1>
      </header>
      
      {/* Projects grid or empty state */}
      {projects.length > 0 ? (
        <AdaptiveGrid
          items={projects}
          minCardWidth={320}
          idealCardWidth={450}
          maxCardWidth={600}
        >
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={{
                slug: project.slug,
                title: project.title,
                venue: project.venue,
                year: project.year,
                featuredImageUrl: project.featuredImageUrl,
                featuredImageAlt: project.featuredImageAlt,
                featuredImageWidth: project.featuredImageWidth,
                featuredImageHeight: project.featuredImageHeight,
              }}
              categorySlug={category.slug}
              portfolioSlug={portfolioSlug}
            />
          ))}
        </AdaptiveGrid>
      ) : (
        <EmptyState
          icon="folder"
          title={`No projects in ${category.name} yet`}
          message="Projects added to this category will appear here. Add projects in the admin panel to showcase your work."
        />
      )}
    </div>
  )
}
