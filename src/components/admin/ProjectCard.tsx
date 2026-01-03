'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

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
      width="16"
      height="16"
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
// DropdownMenu Component
// ============================================================================

interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function DropdownMenu({
  isOpen,
  onClose,
  onDelete,
  triggerRef,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

  // Calculate position relative to trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      
      // Position below the button, aligned to the right
      setPosition({
        top: rect.height + 4,
        right: 0,
      })
    }
  }, [isOpen, triggerRef])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose()
      }
    }

    // Use mousedown for immediate response
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, triggerRef])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, triggerRef])

  // Handle menu item selection
  const handleDelete = () => {
    onDelete()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Project actions"
      className="dropdown-menu"
      style={{ top: position.top, right: position.right }}
    >
      <button
        type="button"
        role="menuitem"
        className="dropdown-item dropdown-item--destructive"
        onClick={handleDelete}
        tabIndex={0}
      >
        <span className="dropdown-item-icon">
          <TrashIcon />
        </span>
        Delete
      </button>

      <style jsx>{`
        .dropdown-menu {
          position: absolute;
          z-index: 50;
          min-width: 140px;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.12),
            0 2px 4px hsla(0, 0%, 0%, 0.08);
          padding: 4px 0;
          animation: dropdown-enter 150ms ease-out;
        }

        @keyframes dropdown-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 44px;
          padding: 10px 14px;
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #1f2937);
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .dropdown-item:hover {
          background-color: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .dropdown-item:focus {
          outline: none;
          background-color: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .dropdown-item:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
        }

        .dropdown-item--destructive {
          color: var(--color-error, #ef4444);
        }

        .dropdown-item--destructive:hover {
          background-color: hsla(0, 84%, 60%, 0.08);
        }

        .dropdown-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .dropdown-menu {
            animation: none;
          }
        }
      `}</style>
    </div>
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Get image URL (prefer thumbnail for card display)
  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url

  return (
    <article
      className={`project-card ${isDragging ? 'project-card--dragging' : ''}`}
      aria-label={`Project: ${project.title}`}
    >
      {/* Featured Image */}
      <div className="project-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.featuredImage?.altText || `Featured image for ${project.title}`}
            className="project-card-img"
            loading="lazy"
          />
        ) : (
          <div className="project-card-placeholder">
            <CameraIcon />
          </div>
        )}

        {/* Year Badge */}
        {project.year && (
          <span className="project-card-year">{project.year}</span>
        )}
      </div>

      {/* Content */}
      <div className="project-card-content">
        <div className="project-card-info">
          <h3 className="project-card-title">{project.title}</h3>
          {project.venue && (
            <p className="project-card-venue">{project.venue}</p>
          )}
        </div>

        {/* Actions - visible on mobile, hover on desktop */}
        <div className="project-card-actions">
          <Link
            href={`/admin/projects/${project.id}`}
            className="project-card-btn"
            aria-label={`Edit ${project.title}`}
          >
            <EditIcon />
          </Link>
          <div className="project-card-menu-wrapper">
            <button
              ref={moreButtonRef}
              type="button"
              className="project-card-btn"
              onClick={handleToggleMenu}
              aria-label={`More actions for ${project.title}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <MoreIcon />
            </button>
            <DropdownMenu
              isOpen={isMenuOpen}
              onClose={handleCloseMenu}
              onDelete={onDelete}
              triggerRef={moreButtonRef}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .project-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 200ms ease, transform 200ms ease, opacity 200ms ease;
        }

        .project-card:hover {
          box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.08),
            0 2px 4px hsla(0, 0%, 0%, 0.04);
        }

        .project-card:focus-within {
          box-shadow: 0 0 0 2px var(--color-accent, #3b82f6);
        }

        .project-card--dragging {
          opacity: 0.5;
          transform: scale(1.02);
          box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
        }

        /* Image container with 16:9 aspect ratio */
        .project-card-image {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: var(--color-surface-secondary, #f3f4f6);
          overflow: hidden;
        }

        .project-card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 200ms ease;
        }

        .project-card:hover .project-card-img {
          transform: scale(1.03);
        }

        .project-card-placeholder {
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
        .project-card-year {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 4px 10px;
          background: hsla(0, 0%, 0%, 0.6);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        /* Content area */
        .project-card-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
        }

        .project-card-info {
          flex: 1;
          min-width: 0; /* Allow text truncation */
        }

        .project-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-card-venue {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Action buttons */
        .project-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          /* Always visible on mobile */
          opacity: 1;
          transition: opacity 150ms ease;
        }

        /* Hide on desktop until hover */
        @media (min-width: 640px) {
          .project-card-actions {
            opacity: 0;
          }

          .project-card:hover .project-card-actions,
          .project-card:focus-within .project-card-actions {
            opacity: 1;
          }
        }

        .project-card-menu-wrapper {
          position: relative;
        }

        .project-card-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .project-card-btn:hover {
          background: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
          color: var(--color-text, #1f2937);
        }

        .project-card-btn:focus {
          outline: none;
        }

        .project-card-btn:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
          background: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .project-card-btn:active {
          background: var(--color-surface-active, hsla(0, 0%, 0%, 0.08));
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .project-card,
          .project-card-img,
          .project-card-btn,
          .project-card-actions {
            transition: none;
          }

          .project-card:hover .project-card-img {
            transform: none;
          }

          .project-card--dragging {
            transform: none;
          }
        }
      `}</style>
    </article>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { ProjectCardProps }
export type { Project, FeaturedImage } from '@/hooks/useProjects'
