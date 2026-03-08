'use client'

import Link from 'next/link'

import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'
import { AdaptiveGrid } from '@/components/layout/AdaptiveGrid'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'

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

interface SubCategory {
  id: string
  name: string
  slug: string
  featuredImage: {
    id: string
    url: string
    altText: string
    width: number
    height: number
  } | null
  projectCount: number
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
  parentCategory?: {
    name: string
    slug: string
  }
  projects: CategoryProject[]
  subcategories?: SubCategory[]
  /** Empty string for published site, "preview" for preview mode */
  portfolioSlug?: string
}

/**
 * CategoryLanding Page Template
 * 
 * Displays either:
 * - Subcategory tiles (for parent categories with children)
 * - Project grid (for leaf categories with projects)
 * 
 * Layout:
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column (2 on larger phones)
 * 
 * Features:
 * - Breadcrumb navigation
 * - Subcategory cards with project counts
 * - Project cards with hover overlay
 * - Professional empty state when no content
 * 
 * Note: Navigation and footer are provided by the layout.
 */
export function CategoryLanding({ 
  portfolio: _portfolio, 
  category, 
  parentCategory: _parentCategory,
  projects,
  subcategories,
  portfolioSlug = ''
}: CategoryLandingProps) {
  const hasSubcategories = subcategories && subcategories.length > 0

  return (
    <>
      <div className="container">
        <header className="category-header">
          <h1 className="category-title">{category.name}</h1>
        </header>
        
        {hasSubcategories ? (
          /* Subcategory tiles for parent categories */
          <AdaptiveGrid
            items={subcategories}
            minCardWidth={320}
            idealCardWidth={350}
            maxCardWidth={600}
          >
            {subcategories.map(sub => (
              <Link
                key={sub.id}
                href={`/${sub.slug}`}
                className="subcategory-card-link"
                data-testid={`subcategory-card-${sub.slug}`}
              >
                <Card variant="interactive" className="subcategory-card">
                  <CardImage
                    src={sub.featuredImage?.url || undefined}
                    alt={sub.featuredImage?.altText || sub.name}
                    aspectRatio="4/3"
                    objectFit="contain"
                    className="subcategory-card__image"
                  />
                  <CardBody className="subcategory-card__info">
                    <CardTitle>{sub.name}</CardTitle>
                    <CardDescription>
                      {sub.projectCount} {sub.projectCount === 1 ? 'project' : 'projects'}
                    </CardDescription>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </AdaptiveGrid>
        ) : projects.length > 0 ? (
          /* Project grid for leaf categories */
          <AdaptiveGrid
            items={projects}
            minCardWidth={320}
            idealCardWidth={350}
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

      <style jsx global>{`
        .subcategory-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          max-width: 600px;
        }
        
        .subcategory-card__info {
          text-align: center;
          padding: var(--space-4, 16px) var(--space-3, 12px);
        }
      `}</style>
    </>
  )
}
