'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'
import { EmptyState } from './EmptyState'
import { getOrientationAwareRatio } from '@/lib/image-helpers'
import type { ProjectGridSection } from '@/lib/content-schema'

/**
 * Project data structure (from useProjects hook)
 */
export interface Project {
  id: string
  title: string
  slug: string
  year: string | null
  venue: string | null
  role: string | null
  order: number
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string | null
    width?: number
    height?: number
  } | null
}

interface ProjectGridRendererProps {
  section: ProjectGridSection
  projects: Project[]
  categorySlug: string
  portfolioSlug?: string // Empty string for published site, "preview" for preview mode
}

/**
 * ProjectGridRenderer Component
 * 
 * Renders projects in various layouts based on section configuration.
 * 
 * Features:
 * - Filters projects based on section.projectIds (null = show all)
 * - Sorts by order field
 * - Supports grid, masonry, and list layouts
 * - Configurable columns (2, 3, or 4 on desktop)
 * - Responsive: reduces columns on tablet/mobile
 * - Shows project image, title, and optional metadata (year, venue, role)
 * - Hover overlay on desktop, info below on mobile
 * - Links to project detail pages
 * - Empty state when no projects
 */
export function ProjectGridRenderer({ 
  section, 
  projects,
  categorySlug,
  portfolioSlug = ''
}: ProjectGridRendererProps) {
  // Filter projects based on section configuration
  const filteredProjects = section.projectIds
    ? // If specific project IDs provided, filter and order by that list
      section.projectIds
        .map(id => projects.find(proj => proj.id === id))
        .filter((proj): proj is Project => proj !== undefined)
    : // Otherwise, use all projects sorted by order
      [...projects].sort((a, b) => a.order - b.order)

  // Build base path for links
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''

  return (
    <section className="section section-project-grid">
      {section.heading && (
        <h2 className="project-grid-heading">{section.heading}</h2>
      )}
      
      {section.description && (
        <p className="project-grid-description">{section.description}</p>
      )}

      {filteredProjects.length > 0 ? (
        <div 
          className={`
            project-grid 
            project-grid--${section.layout}
            project-grid--cols-${section.columns}
          `.trim().replace(/\s+/g, ' ')}
        >
          {filteredProjects.map(project => (
            <ProjectGridItem
              key={project.id}
              project={project}
              categorySlug={categorySlug}
              basePath={basePath}
              showMetadata={section.showMetadata}
              layout={section.layout}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="No projects yet"
          message="Projects will appear here once they're added to this category."
        />
      )}

      <style jsx>{`
        .project-grid-heading {
          margin: 0 0 var(--space-4) 0;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
        }

        .project-grid-description {
          margin: 0 0 var(--space-8) 0;
          font-size: var(--font-size-lg);
          color: var(--color-text-secondary);
          max-width: 42rem;
        }

        /* Base grid layout */
        .project-grid {
          display: grid;
          gap: var(--space-6);
          grid-template-columns: 1fr;
        }

        /* Grid layout (standard equal-height cards) */
        .project-grid--grid {
          /* Standard grid - uses base styles */
        }

        /* Masonry layout (variable heights based on content) */
        .project-grid--masonry {
          /* Use CSS Grid masonry when supported, fall back to standard grid */
          grid-auto-flow: dense;
        }

        @supports (grid-template-rows: masonry) {
          .project-grid--masonry {
            grid-template-rows: masonry;
            align-items: start;
          }
        }

        /* List layout (single column, horizontal cards on desktop) */
        .project-grid--list {
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        /* Responsive column layouts based on section configuration */
        
        /* 2 columns layout */
        @media (min-width: 640px) {
          .project-grid--grid.project-grid--cols-2,
          .project-grid--masonry.project-grid--cols-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* 3 columns layout */
        @media (min-width: 640px) {
          .project-grid--grid.project-grid--cols-3,
          .project-grid--masonry.project-grid--cols-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .project-grid--grid.project-grid--cols-3,
          .project-grid--masonry.project-grid--cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* 4 columns layout */
        @media (min-width: 640px) {
          .project-grid--grid.project-grid--cols-4,
          .project-grid--masonry.project-grid--cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .project-grid--grid.project-grid--cols-4,
          .project-grid--masonry.project-grid--cols-4 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .project-grid--grid.project-grid--cols-4,
          .project-grid--masonry.project-grid--cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </section>
  )
}

/**
 * Individual project item in the grid
 */
interface ProjectGridItemProps {
  project: Project
  categorySlug: string
  basePath: string
  showMetadata: boolean
  layout: 'grid' | 'masonry' | 'list'
}

function ProjectGridItem({ 
  project, 
  categorySlug, 
  basePath, 
  showMetadata,
  layout 
}: ProjectGridItemProps) {
  const href = `${basePath}/${categorySlug}/${project.slug}`

  // Build metadata string if enabled
  const metadataParts = []
  if (showMetadata) {
    if (project.year) metadataParts.push(project.year)
    if (project.venue) metadataParts.push(project.venue)
    if (project.role) metadataParts.push(project.role)
  }
  const metadata = metadataParts.join(' • ')

  // Overlay content for desktop hover
  const overlayContent = (
    <div className="project-overlay">
      <h3 className="project-overlay__title">{project.title}</h3>
      {showMetadata && metadata && (
        <p className="project-overlay__metadata">{metadata}</p>
      )}
    </div>
  )

  // Pick orientation-aware ratio for list layout too
  const listDisplayRatio = project.featuredImage?.width && project.featuredImage?.height
    ? getOrientationAwareRatio(project.featuredImage.width, project.featuredImage.height)
    : '3/2'

  // List layout uses horizontal card on desktop
  if (layout === 'list') {
    return (
      <>
        <Link href={href} className="project-list-link">
          <Card variant="interactive" className="project-list-card">
            <div className="project-list-content">
              {project.featuredImage && (
                <div className="project-list-image">
                  <CardImage
                    src={project.featuredImage.url}
                    alt={project.featuredImage.altText || project.title}
                    aspectRatio={listDisplayRatio}
                  />
                </div>
              )}
              
              <CardBody className="project-list-info">
                <CardTitle>{project.title}</CardTitle>
                {showMetadata && metadata && (
                  <CardDescription>{metadata}</CardDescription>
                )}
              </CardBody>
            </div>
          </Card>
        </Link>

        <style jsx>{`
          .project-list-link {
            display: block;
            text-decoration: none;
            color: inherit;
          }

          .project-list-content {
            display: flex;
            flex-direction: column;
          }

          .project-list-image {
            flex-shrink: 0;
          }

          .project-list-info {
            flex: 1;
          }

          /* Horizontal layout on desktop */
          @media (min-width: 768px) {
            .project-list-content {
              flex-direction: row;
              align-items: center;
            }

            .project-list-image {
              width: 40%;
              min-width: 300px;
            }
          }
        `}</style>
      </>
    )
  }

  // Pick orientation-aware ratio when image dimensions are available
  const displayRatio = project.featuredImage?.width && project.featuredImage?.height
    ? getOrientationAwareRatio(project.featuredImage.width, project.featuredImage.height)
    : '3/2' // Neutral default

  // Grid and masonry layouts use vertical cards with hover overlay
  return (
    <>
      <Link href={href} className="project-grid-link">
        <Card variant="interactive" className="project-grid-card">
          <CardImage
            src={project.featuredImage?.url || undefined}
            alt={project.featuredImage?.altText || project.title}
            aspectRatio={displayRatio}
            hoverOverlay={overlayContent}
            className="project-grid-image"
          />
          
          {/* Mobile: Show text below image */}
          <CardBody className="project-grid-info">
            <CardTitle>{project.title}</CardTitle>
            {showMetadata && metadata && (
              <CardDescription>{metadata}</CardDescription>
            )}
          </CardBody>
        </Card>
      </Link>

      <style jsx global>{`
        .project-grid-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        /* Overlay content styling */
        .project-overlay {
          text-align: center;
          color: white;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          margin: 0 var(--space-3, 12px) var(--space-3, 12px);
          width: calc(100% - var(--space-3, 12px) * 2);
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 8px;
        }
        
        .project-overlay__title {
          margin: 0;
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.4);
        }
        
        .project-overlay__metadata {
          margin: var(--space-2, 8px) 0 0;
          font-size: var(--font-size-sm, 0.875rem);
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.3);
        }
        
        /* Desktop: hide mobile info section */
        @media (hover: hover) and (min-width: 640px) {
          .project-grid-info {
            display: none;
          }
        }
        
        /* Mobile: hide overlay, show info below image */
        @media (hover: none), (max-width: 639px) {
          .project-grid-image .card-image__overlay {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
