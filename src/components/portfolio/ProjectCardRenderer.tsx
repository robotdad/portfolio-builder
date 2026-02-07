'use client'

import Link from 'next/link'
import Image from 'next/image'

// ============================================================================
// Types
// ============================================================================

interface ProjectCardSection {
  type: 'project-card'
  projectId: string | null
  showMetadata: boolean
  cardSize: 'compact' | 'standard' | 'large'
}

interface ProjectWithImage {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  role: string | null
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string | null
  } | null
}

interface ProjectCardRendererProps {
  section: ProjectCardSection
  portfolioSlug: string
  categorySlug?: string
  projects?: ProjectWithImage[]
}

// ============================================================================
// Icons
// ============================================================================

function CameraIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CONFIG = {
  compact: {
    width: 120,
    titleSize: '14px',
    metaSize: '11px',
  },
  standard: {
    width: 200,
    titleSize: '16px',
    metaSize: '12px',
  },
  large: {
    width: '100%',
    titleSize: '18px',
    metaSize: '12px',
  },
} as const

// ============================================================================
// ProjectCardRenderer Component
// ============================================================================

/**
 * Renders a single project card for embedding in layout columns.
 * 
 * Features:
 * - 4:3 aspect ratio thumbnail
 * - Always-visible title below image
 * - Optional metadata line (year, venue)
 * - Subtle hover effect (lift + shadow)
 * - Size variants: compact, standard, large
 * - Graceful handling of missing project or image
 */
export function ProjectCardRenderer({
  section,
  portfolioSlug,
  categorySlug,
  projects = [],
}: ProjectCardRendererProps) {
  const config = SIZE_CONFIG[section.cardSize]
  
  // Handle: projectId is null
  if (!section.projectId) {
    return (
      <div className="project-card project-card--placeholder">
        <div className="project-card__image">
          <div className="project-card__placeholder-icon">
            <CameraIcon size={section.cardSize === 'compact' ? 24 : 32} />
          </div>
        </div>
        <div className="project-card__content">
          <span className="project-card__title project-card__title--placeholder">
            Select a project
          </span>
        </div>
        
        <style jsx>{`
          .project-card {
            width: ${typeof config.width === 'number' ? `${config.width}px` : config.width};
          }
          
          .project-card--placeholder {
            opacity: 0.6;
          }
          
          .project-card__image {
            position: relative;
            aspect-ratio: 3 / 2;
            border-radius: var(--radius-md, 8px);
            overflow: hidden;
            background: var(--color-bg-secondary, #f3f4f6);
          }
          
          .project-card__placeholder-icon {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-secondary, #9ca3af);
          }
          
          .project-card__content {
            margin-top: var(--space-2, 8px);
          }
          
          .project-card__title {
            display: block;
            font-size: ${config.titleSize};
            font-weight: 500;
            color: var(--color-text-primary, #111827);
            line-height: 1.3;
          }
          
          .project-card__title--placeholder {
            color: var(--color-text-secondary, #6b7280);
            font-style: italic;
          }
        `}</style>
      </div>
    )
  }
  
  // Find the project in the array
  const project = projects.find((p) => p.id === section.projectId)
  
  // Handle: project not found
  if (!project) {
    return (
      <div className="project-card project-card--not-found">
        <div className="project-card__image">
          <div className="project-card__placeholder-icon">
            <CameraIcon size={section.cardSize === 'compact' ? 24 : 32} />
          </div>
        </div>
        <div className="project-card__content">
          <span className="project-card__title project-card__title--error">
            Project not found
          </span>
        </div>
        
        <style jsx>{`
          .project-card {
            width: ${typeof config.width === 'number' ? `${config.width}px` : config.width};
          }
          
          .project-card--not-found {
            opacity: 0.6;
          }
          
          .project-card__image {
            position: relative;
            aspect-ratio: 3 / 2;
            border-radius: var(--radius-md, 8px);
            overflow: hidden;
            background: var(--color-bg-secondary, #f3f4f6);
          }
          
          .project-card__placeholder-icon {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-secondary, #9ca3af);
          }
          
          .project-card__content {
            margin-top: var(--space-2, 8px);
          }
          
          .project-card__title {
            display: block;
            font-size: ${config.titleSize};
            font-weight: 500;
            line-height: 1.3;
          }
          
          .project-card__title--error {
            color: var(--color-text-secondary, #6b7280);
            font-style: italic;
          }
        `}</style>
      </div>
    )
  }
  
  // Build link path
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''
  const href = categorySlug ? `${basePath}/${categorySlug}/${project.slug}` : '#'
  
  // Build metadata string
  const metadataParts: string[] = []
  if (section.showMetadata) {
    if (project.year) metadataParts.push(project.year)
    if (project.venue) metadataParts.push(project.venue)
  }
  const metadata = metadataParts.join(' • ')
  
  // Get image URL
  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url
  
  return (
    <Link href={href} className="project-card-link">
      <article className="project-card">
        <div className="project-card__image">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={project.featuredImage?.altText || project.title}
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="project-card__placeholder-icon">
              <CameraIcon size={section.cardSize === 'compact' ? 24 : 32} />
            </div>
          )}
        </div>
        
        <div className="project-card__content">
          <h3 className="project-card__title">{project.title}</h3>
          {section.showMetadata && metadata && (
            <span className="project-card__meta">{metadata}</span>
          )}
        </div>
      </article>
      
      <style jsx>{`
        .project-card-link {
          display: block;
          text-decoration: none;
          color: inherit;
          width: ${typeof config.width === 'number' ? `${config.width}px` : config.width};
        }
        
        .project-card {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        
        .project-card-link:hover .project-card,
        .project-card-link:focus-visible .project-card {
          transform: translateY(-2px);
        }
        
        .project-card-link:hover .project-card__image,
        .project-card-link:focus-visible .project-card__image {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .project-card__image {
          position: relative;
          aspect-ratio: 3 / 2;
          border-radius: var(--radius-md, 8px);
          overflow: hidden;
          background: var(--color-bg-secondary, #f3f4f6);
          transition: box-shadow 200ms ease;
        }
        
        .project-card__placeholder-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary, #9ca3af);
        }
        
        .project-card__content {
          margin-top: var(--space-2, 8px);
        }
        
        .project-card__title {
          margin: 0;
          font-size: ${config.titleSize};
          font-weight: 500;
          color: var(--color-text-primary, #111827);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .project-card__meta {
          display: block;
          margin-top: var(--space-1, 4px);
          font-size: ${config.metaSize};
          color: var(--color-text-secondary, #6b7280);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .project-card,
          .project-card__image {
            transition: none;
          }
          
          .project-card-link:hover .project-card {
            transform: none;
          }
        }
      `}</style>
    </Link>
  )
}
