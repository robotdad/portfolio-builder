'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'
import type { ProjectListSection } from '@/lib/content-schema'

/**
 * Project data structure for list rendering
 */
export interface ProjectWithImage {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  role: string | null
  featuredImage: {
    url: string
    thumbnailUrl: string
    altText: string | null
  } | null
}

interface ProjectListRendererProps {
  section: ProjectListSection
  portfolioSlug: string
  categorySlug?: string
  projects?: ProjectWithImage[]
}

/**
 * ProjectListRenderer Component
 * 
 * Renders 2-4 projects in a vertical list or mini-grid layout.
 * Designed for use in layout columns on public pages.
 * 
 * Features:
 * - Vertical layout: Full-width cards stacked with gap
 * - Mini-grid layout: 2-column grid for compact display
 * - 4:3 aspect ratio (compact style)
 * - Optional metadata display (year, venue)
 * - Hover overlay on desktop, info below on mobile
 * - Links to project detail pages
 * - Silently skips missing projects
 */
export function ProjectListRenderer({
  section,
  portfolioSlug,
  categorySlug,
  projects = [],
}: ProjectListRendererProps) {
  // Filter projects based on section.projectIds
  // Skip any IDs that don't match an actual project
  const filteredProjects = section.projectIds
    .map(id => projects.find(proj => proj.id === id))
    .filter((proj): proj is ProjectWithImage => proj !== undefined)

  // Empty state: render nothing if no valid projects
  if (filteredProjects.length === 0) {
    return null
  }

  // Build base path for links
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''

  return (
    <div className={`project-list project-list--${section.layout}`}>
      {filteredProjects.map(project => (
        <ProjectListItem
          key={project.id}
          project={project}
          categorySlug={categorySlug}
          basePath={basePath}
          showMetadata={section.showMetadata}
          layout={section.layout}
        />
      ))}

      <style jsx>{`
        .project-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Mini-grid: 2 columns */
        .project-list--mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* On very small screens, mini-grid falls back to single column */
        @media (max-width: 400px) {
          .project-list--mini-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Individual project item in the list
 */
interface ProjectListItemProps {
  project: ProjectWithImage
  categorySlug?: string
  basePath: string
  showMetadata: boolean
  layout: 'vertical' | 'mini-grid'
}

function ProjectListItem({
  project,
  categorySlug,
  basePath,
  showMetadata,
  // layout prop available for future per-item styling differences
  layout: _layout,
}: ProjectListItemProps) {
  // Build href - only include categorySlug if provided
  const href = categorySlug
    ? `${basePath}/${categorySlug}/${project.slug}`
    : `${basePath}/${project.slug}`

  // Build metadata string if enabled
  const metadataParts: string[] = []
  if (showMetadata) {
    if (project.year) metadataParts.push(project.year)
    if (project.venue) metadataParts.push(project.venue)
  }
  const metadata = metadataParts.join(' • ')

  // Overlay content for desktop hover
  const overlayContent = (
    <div className="project-list-overlay">
      <h3 className="project-list-overlay__title">{project.title}</h3>
      {showMetadata && metadata && (
        <p className="project-list-overlay__metadata">{metadata}</p>
      )}
    </div>
  )

  return (
    <>
      <Link href={href} className="project-list-item-link">
        <Card variant="interactive" className="project-list-item-card">
          <CardImage
            src={project.featuredImage?.url || undefined}
            alt={project.featuredImage?.altText || project.title}
            aspectRatio="4/3"
            hoverOverlay={overlayContent}
            className="project-list-item-image"
          />

          {/* Mobile: Show text below image */}
          <CardBody className="project-list-item-info">
            <CardTitle className="project-list-item-title">{project.title}</CardTitle>
            {showMetadata && metadata && (
              <CardDescription>{metadata}</CardDescription>
            )}
          </CardBody>
        </Card>
      </Link>

      <style jsx>{`
        .project-list-item-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
      `}</style>

      <style jsx global>{`
        /* Overlay content styling */
        .project-list-overlay {
          text-align: center;
          color: white;
          padding: var(--space-3, 12px);
        }

        .project-list-overlay__title {
          margin: 0;
          font-size: var(--font-size-base, 1rem);
          font-weight: 600;
          line-height: 1.3;
        }

        .project-list-overlay__metadata {
          margin: var(--space-1, 4px) 0 0;
          font-size: var(--font-size-xs, 0.75rem);
          opacity: 0.9;
        }

        /* Compact card title */
        .project-list-item-card .project-list-item-title {
          font-size: var(--font-size-sm, 0.875rem);
        }

        /* Desktop: hide mobile info section */
        @media (hover: hover) and (min-width: 640px) {
          .project-list-item-info {
            display: none;
          }
        }

        /* Mobile: hide overlay, show info below image */
        @media (hover: none), (max-width: 639px) {
          .project-list-item-image .card-image__overlay {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
