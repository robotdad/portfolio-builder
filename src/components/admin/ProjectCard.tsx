'use client'

import Link from 'next/link'
import { type Project, type FeaturedImage } from '@/hooks/useProjects'

// ============================================================================
// Types
// ============================================================================

interface ProjectCardProps {
  project: Project
  onDelete: () => void
  isDragging?: boolean
}

// ============================================================================
// Icons
// ============================================================================

function CameraIcon() {
  return (
    <svg
      width="48"
      height="48"
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

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

// ============================================================================
// ProjectCard Component
// ============================================================================

export function ProjectCard({
  project,
  onDelete,
  isDragging = false,
}: ProjectCardProps) {
  // Get image URL (prefer thumbnail for card display)
  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className={`admin-project-card ${isDragging ? 'admin-project-card--dragging' : ''}`}
      aria-label={`Edit project: ${project.title}`}
    >
      {/* Featured Image */}
      <div className="admin-project-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.featuredImage?.altText || `Featured image for ${project.title}`}
            className="admin-project-card-img"
            loading="lazy"
          />
        ) : (
          <div className="admin-project-card-placeholder">
            <CameraIcon />
          </div>
        )}

        {/* Year Badge */}
        {project.year && (
          <span className="admin-project-card-year">{project.year}</span>
        )}

        {/* Delete Button */}
        <button
          type="button"
          className="admin-project-card-delete icon-btn destructive"
          onClick={handleDelete}
          aria-label={`Delete ${project.title}`}
        >
          <TrashIcon />
        </button>
      </div>

      {/* Content */}
      <div className="admin-project-card-content">
        <div className="admin-project-card-info">
          <h3 className="admin-project-card-title">{project.title}</h3>
          {project.venue && (
            <p className="admin-project-card-venue">{project.venue}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-project-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 200ms ease, transform 200ms ease, opacity 200ms ease;
          text-decoration: none;
          color: inherit;
        }

        .admin-project-card:hover {
          box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.08),
            0 2px 4px hsla(0, 0%, 0%, 0.04);
        }

        .admin-project-card:focus {
          outline: none;
        }

        .admin-project-card:focus-visible {
          box-shadow: 0 0 0 2px var(--color-accent, #3b82f6);
        }

        .admin-project-card--dragging {
          opacity: 0.5;
          transform: scale(1.02);
          box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
        }

        /* Image container with 16:9 aspect ratio */
        .admin-project-card-image {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: var(--color-surface-secondary, #f3f4f6);
          overflow: hidden;
        }

        .admin-project-card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 200ms ease;
        }

        .admin-project-card:hover .admin-project-card-img {
          transform: scale(1.03);
        }

        .admin-project-card-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted, #9ca3af);
        }

        /* Year badge */
        .admin-project-card-year {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          background: hsla(0, 0%, 0%, 0.6);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        /* Delete button - uses global .icon-btn pattern with overlay styling */
        .admin-project-card-delete {
          position: absolute;
          top: 8px;
          right: 8px;
          /* Touch target sizing comes from .icon-btn class */
          /* Using CSS variables for responsive sizing */
          min-width: var(--touch-target); /* 44px mobile, 36px desktop */
          min-height: var(--touch-target);
          padding: var(--button-icon-padding); /* 12px mobile, 8px desktop */
          background: hsla(0, 84%, 60%, 0.9);
          border-radius: 50%;
          color: #ffffff;
          transition: background-color 150ms ease, opacity 150ms ease, transform 150ms ease;
          /* Always visible on mobile */
          opacity: 1;
        }

        .admin-project-card-delete svg {
          width: 14px; /* Smaller icon for card overlay */
          height: 14px;
        }

        .admin-project-card-delete:hover {
          background: hsla(0, 84%, 50%, 1);
          transform: scale(1.1);
        }

        .admin-project-card-delete:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px hsla(0, 84%, 60%, 0.5);
        }

        .admin-project-card-delete:active {
          transform: scale(0.95);
        }

        /* Hide on desktop until hover */
        @media (min-width: 640px) {
          .admin-project-card-delete {
            opacity: 0;
          }

          .admin-project-card:hover .admin-project-card-delete,
          .admin-project-card:focus-within .admin-project-card-delete {
            opacity: 1;
          }
        }

        /* Content area */
        .admin-project-card-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
        }

        .admin-project-card-info {
          flex: 1;
          min-width: 0; /* Allow text truncation */
        }

        .admin-project-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-project-card-venue {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #6b7280;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .admin-project-card,
          .admin-project-card-img,
          .admin-project-card-delete {
            transition: none;
          }

          .admin-project-card:hover .admin-project-card-img {
            transform: none;
          }

          .admin-project-card-delete:hover,
          .admin-project-card-delete:active {
            transform: none;
          }

          .admin-project-card--dragging {
            transform: none;
          }
        }
      `}</style>
    </Link>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ProjectCardProps }
export type { Project, FeaturedImage } from '@/hooks/useProjects'
