'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'
import { EmptyState } from './EmptyState'
import type { CategoryGridSection } from '@/lib/content-schema'

/**
 * Category data structure (from useCategories hook)
 */
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string
  } | null
  _count: {
    projects: number
  }
}

interface CategoryGridRendererProps {
  section: CategoryGridSection
  categories: Category[]
  portfolioSlug?: string // Empty string for published site, "preview" for preview mode
}

/**
 * CategoryGridRenderer Component
 * 
 * Renders a responsive grid of category cards based on section configuration.
 * 
 * Features:
 * - Filters categories based on section.categoryIds (null = show all)
 * - Sorts by order field
 * - Configurable columns (2, 3, or 4 on desktop)
 * - Responsive: reduces columns on tablet/mobile
 * - Shows category name, description (optional), project count (optional)
 * - Links to category pages
 * - Empty state when no categories
 */
export function CategoryGridRenderer({ 
  section, 
  categories,
  portfolioSlug = ''
}: CategoryGridRendererProps) {
  // Filter categories based on section configuration
  const filteredCategories = section.categoryIds
    ? // If specific category IDs provided, filter and order by that list
      section.categoryIds
        .map(id => categories.find(cat => cat.id === id))
        .filter((cat): cat is Category => cat !== undefined)
    : // Otherwise, use all categories sorted by order
      [...categories].sort((a, b) => a.order - b.order)

  // Build base path for links
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''

  return (
    <section className="section section-category-grid">
      {section.heading && (
        <h2 className="category-grid-heading">{section.heading}</h2>
      )}
      
      {section.description && (
        <p className="category-grid-description">{section.description}</p>
      )}

      {filteredCategories.length > 0 ? (
        <div className={`category-grid category-grid--cols-${section.columns}`}>
          {filteredCategories.map(category => (
            <Link
              key={category.id}
              href={`${basePath}/${category.slug}`}
              className="category-grid-link"
            >
              <Card variant="interactive" className="category-card">
                {category.featuredImage && (
                  <CardImage
                    src={category.featuredImage.url}
                    alt={category.featuredImage.altText || category.name}
                    aspectRatio="16/9"
                  />
                )}
                
                <CardBody>
                  <CardTitle>{category.name}</CardTitle>
                  
                  {section.showDescription && category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                  
                  {section.showProjectCount && (
                    <p className="category-project-count">
                      {category._count.projects} {category._count.projects === 1 ? 'project' : 'projects'}
                    </p>
                  )}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="No categories yet"
          message="Categories will appear here once they're added in the admin panel."
        />
      )}

      <style jsx>{`
        .category-grid-heading {
          margin: 0 0 var(--space-4) 0;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
        }

        .category-grid-description {
          margin: 0 0 var(--space-8) 0;
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          max-width: 42rem;
        }

        .category-grid {
          display: grid;
          gap: var(--space-6);
          grid-template-columns: 1fr;
        }

        /* Responsive column layouts based on section configuration */
        
        /* 2 columns layout */
        @media (min-width: 640px) {
          .category-grid--cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* 3 columns layout */
        @media (min-width: 640px) {
          .category-grid--cols-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .category-grid--cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* 4 columns layout */
        @media (min-width: 640px) {
          .category-grid--cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .category-grid--cols-4 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .category-grid--cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .category-grid-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .category-project-count {
          margin: var(--space-3) 0 0;
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-weight: var(--font-weight-medium);
        }
      `}</style>
    </section>
  )
}
