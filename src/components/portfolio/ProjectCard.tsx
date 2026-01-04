'use client'

import Link from 'next/link'
import { ImageWithFallback } from './ImageFallback'

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
 * - Transition: 300ms ease for smooth overlay animation
 * - Graceful fallback for broken/missing images
 */
export function ProjectCard({ 
  project, 
  categorySlug, 
  portfolioSlug,
  className = ''
}: ProjectCardProps) {
  const href = `/${portfolioSlug}/${categorySlug}/${project.slug}`
  
  return (
    <Link
      href={href}
      className={`project-card group ${className}`}
    >
      {/* Image container with 16:9 aspect ratio */}
      <div className="project-card-image-wrapper">
        {project.featuredImageUrl ? (
          <ImageWithFallback
            src={project.featuredImageUrl}
            alt={project.featuredImageAlt || project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="project-card-image"
            aspectRatio="16/9"
            fallbackMessage="Image unavailable"
          />
        ) : (
          <div className="project-card-placeholder">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        
        {/* Desktop hover overlay - hidden on mobile */}
        <div className="project-card-overlay">
          <div className="project-card-overlay-content">
            <h3 className="project-card-overlay-title">{project.title}</h3>
            {project.venue && (
              <p className="project-card-overlay-venue">{project.venue}</p>
            )}
            {project.year && (
              <p className="project-card-overlay-year">{project.year}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile: Show text below image */}
      <div className="project-card-info">
        <h3 className="project-card-title">{project.title}</h3>
        {project.venue && (
          <p className="project-card-venue">{project.venue}</p>
        )}
      </div>
    </Link>
  )
}
