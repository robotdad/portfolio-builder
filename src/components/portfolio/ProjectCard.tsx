'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription } from '@/components/ui'

interface ProjectCardProps {
  project: {
    slug: string
    title: string
    venue?: string | null
    year?: string | null
    featuredImageUrl?: string | null
    featuredImageAlt?: string
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
 */
export function ProjectCard({ 
  project, 
  categorySlug, 
  portfolioSlug,
  className = ''
}: ProjectCardProps) {
  const href = `/${portfolioSlug}/${categorySlug}/${project.slug}`
  
  // Overlay content for desktop hover
  const overlayContent = (
    <div className="project-overlay">
      <h3 className="project-overlay__title">{project.title}</h3>
      {project.venue && (
        <p className="project-overlay__venue">{project.venue}</p>
      )}
      {project.year && (
        <p className="project-overlay__year">{project.year}</p>
      )}
    </div>
  )
  
  return (
    <>
      <Link href={href} className={`project-card-link ${className}`}>
        <Card variant="interactive" className="project-card">
          <CardImage
            src={project.featuredImageUrl || undefined}
            alt={project.featuredImageAlt || project.title}
            aspectRatio="16/9"
            hoverOverlay={overlayContent}
            className="project-card__image"
          />
          
          {/* Mobile: Show text below image */}
          <CardBody className="project-card__info">
            <CardTitle>{project.title}</CardTitle>
            {project.venue && (
              <CardDescription>{project.venue}</CardDescription>
            )}
          </CardBody>
        </Card>
      </Link>
      
      <style jsx>{`
        .project-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
      `}</style>
      
      <style jsx global>{`
        /* Overlay content styling */
        .project-overlay {
          text-align: center;
          color: white;
          padding: var(--space-4, 16px);
        }
        
        .project-overlay__title {
          margin: 0;
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
        }
        
        .project-overlay__venue,
        .project-overlay__year {
          margin: var(--space-1, 4px) 0 0;
          font-size: var(--font-size-sm, 0.875rem);
          opacity: 0.9;
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
