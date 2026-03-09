'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'
import { getAspectRatioClass, getOrientationAwareRatio, type AspectRatioPreset } from '@/lib/image-helpers'

interface ProjectCardProps {
  project: {
    slug: string
    title: string
    venue?: string | null
    organization?: string | null
    year?: string | null
    featuredImageUrl?: string | null
    featuredImageAlt?: string
    featuredImageWidth?: number
    featuredImageHeight?: number
  }
  categorySlug: string
  portfolioSlug: string
  className?: string
}

/**
 * ProjectCard with Hover Overlay
 * 
 * Design implementation per slice spec:
 * - Desktop: Clean image, hover reveals overlay with title/venue/year
 * - Mobile: Title and metadata shown below image (no hover)
 * - 16:9 aspect ratio for featured images
 * - Uses Card primitives for consistent styling
 * 
 * @param portfolioSlug - Empty string for published site, "preview" for preview mode
 */
export function ProjectCard({ 
  project, 
  categorySlug, 
  portfolioSlug,
  className = ''
}: ProjectCardProps) {
  // Build href: /category/project for published, /preview/category/project for preview
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''
  const href = `${basePath}/${categorySlug}/${project.slug}`
  
  // Calculate aspect ratio class for grid layout
  const aspectClass = project.featuredImageWidth && project.featuredImageHeight
    ? getAspectRatioClass(project.featuredImageWidth, project.featuredImageHeight)
    : 'square' // Default to square if dimensions unknown

  // Pick the closest aspect ratio preset based on actual image dimensions,
  // but cap extreme portrait ratios to prevent cards taller than the viewport.
  // Only the most extreme ratio (2:3) is capped to 3:4; normal portrait (3:4)
  // is preserved to respect the photographer's composition.
  const rawRatio = project.featuredImageWidth && project.featuredImageHeight
    ? getOrientationAwareRatio(project.featuredImageWidth, project.featuredImageHeight)
    : '4/3' // Safe default when dimensions unknown
  const portraitCaps: Partial<Record<AspectRatioPreset, AspectRatioPreset>> = { '2/3': '3/4' }
  const displayRatio = portraitCaps[rawRatio] ?? rawRatio
  
  // Overlay content for desktop hover
  const overlayContent = (
    <div className="project-overlay">
      <h3 className="project-overlay__title">{project.title}</h3>
      {project.venue && (
        <p className="project-overlay__venue">{project.venue}</p>
      )}
      {project.organization && (
        <p className="project-overlay__organization">{project.organization}</p>
      )}
      {project.year && (
        <p className="project-overlay__year">{project.year}</p>
      )}
    </div>
  )
  
  return (
    <>
      <Link 
        href={href} 
        className={`project-card-link project-card--${aspectClass} ${className}`} 
        data-testid={`project-card-${project.slug}`}
      >
        <Card variant="interactive" className="project-card">
          <CardImage
            src={project.featuredImageUrl || undefined}
            alt={project.featuredImageAlt || project.title}
            aspectRatio={displayRatio}
            hoverOverlay={overlayContent}
            className="project-card__image"
          />
          
          {/* Mobile: Show text below image */}
          <CardBody className="project-card__info">
            <CardTitle>{project.title}</CardTitle>
            {project.venue && (
              <CardDescription>{project.venue}</CardDescription>
            )}
            {project.organization && (
              <CardDescription>{project.organization}</CardDescription>
            )}
          </CardBody>
        </Card>
      </Link>
      
      <style jsx>{`
        .project-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          max-width: 600px;
        }
      `}</style>
      
      <style jsx global>{`
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
        
        .project-overlay__venue,
        .project-overlay__organization,
        .project-overlay__year {
          margin: var(--space-1, 4px) 0 0;
          font-size: var(--font-size-sm, 0.875rem);
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7), 0 0 8px rgba(0, 0, 0, 0.3);
        }
        
        /* Desktop: hide mobile info section */
        @media (hover: hover) and (min-width: 640px) {
          .project-card__info {
            display: none;
          }
        }
        
        /* Mobile: hide overlay, show info below image */
        @media (hover: none), (max-width: 639px) {
          .project-card__image .card-image__overlay {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
