'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ============================================================================
// Types
// ============================================================================

interface FeaturedImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  featuredImage: FeaturedImage | null
  _count: {
    projects: number
  }
}

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
  onViewProjects: () => void
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
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

function ImagePlaceholderIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

function FolderIcon() {
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
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
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
  onViewProjects: () => void
  onDelete: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function DropdownMenu({
  isOpen,
  onClose,
  onViewProjects,
  onDelete,
  triggerRef,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 })

  // Calculate position relative to trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const menuWidth = 160
      
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
  const handleViewProjects = () => {
    onViewProjects()
    onClose()
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  // Handle keyboard navigation within menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]')
      if (!items || items.length === 0) return

      const currentIndex = Array.from(items).findIndex(item => item === document.activeElement)
      let nextIndex: number

      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      } else {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      }

      items[nextIndex]?.focus()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Category actions"
      className="dropdown-menu"
      style={{ top: position.top, right: position.right }}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        role="menuitem"
        className="dropdown-item"
        onClick={handleViewProjects}
        tabIndex={0}
      >
        <span className="dropdown-item-icon">
          <FolderIcon />
        </span>
        View Projects
      </button>
      <div className="dropdown-divider" role="separator" />
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
          min-width: 160px;
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

        .dropdown-divider {
          height: 1px;
          margin: 4px 0;
          background-color: var(--color-border, #e5e7eb);
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
// CategoryCard Component
// ============================================================================

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onViewProjects,
  isDragging = false,
}: CategoryCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  // Format project count text
  const projectCountText = category._count.projects === 1 
    ? '1 project' 
    : `${category._count.projects} projects`

  // Get image URL (prefer thumbnail for card display)
  const imageUrl = category.featuredImage?.thumbnailUrl || category.featuredImage?.url

  return (
    <article
      className={`category-card ${isDragging ? 'category-card--dragging' : ''}`}
      aria-label={`Category: ${category.name}`}
    >
      {/* Featured Image */}
      <div className="category-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.featuredImage?.altText || `Featured image for ${category.name}`}
            className="category-card-img"
            loading="lazy"
          />
        ) : (
          <div className="category-card-placeholder">
            <ImagePlaceholderIcon />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="category-card-content">
        <div className="category-card-info">
          <h3 className="category-card-name">{category.name}</h3>
          <p className="category-card-count">{projectCountText}</p>
        </div>

        {/* Actions */}
        <div className="category-card-actions">
          <button
            type="button"
            className="category-card-btn"
            onClick={onEdit}
            aria-label={`Edit ${category.name}`}
          >
            <EditIcon />
          </button>
          <div className="category-card-menu-wrapper">
            <button
              ref={moreButtonRef}
              type="button"
              className="category-card-btn"
              onClick={handleToggleMenu}
              aria-label={`More actions for ${category.name}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              <MoreIcon />
            </button>
            <DropdownMenu
              isOpen={isMenuOpen}
              onClose={handleCloseMenu}
              onViewProjects={onViewProjects}
              onDelete={onDelete}
              triggerRef={moreButtonRef}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 200ms ease, transform 200ms ease, opacity 200ms ease;
        }

        .category-card:hover {
          box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.08),
            0 2px 4px hsla(0, 0%, 0%, 0.04);
        }

        .category-card:focus-within {
          box-shadow: 0 0 0 2px var(--color-accent, #3b82f6);
        }

        .category-card--dragging {
          opacity: 0.5;
          transform: scale(1.02);
          box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
        }

        /* Image container with 16:9 aspect ratio */
        .category-card-image {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: var(--color-surface-secondary, #f3f4f6);
          overflow: hidden;
        }

        .category-card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 200ms ease;
        }

        .category-card:hover .category-card-img {
          transform: scale(1.03);
        }

        .category-card-placeholder {
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

        /* Content area */
        .category-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
        }

        .category-card-info {
          flex: 1;
          min-width: 0; /* Allow text truncation */
        }

        .category-card-name {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .category-card-count {
          margin: 2px 0 0 0;
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
          line-height: 1.3;
        }

        /* Action buttons */
        .category-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .category-card-menu-wrapper {
          position: relative;
        }

        .category-card-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .category-card-btn:hover {
          background: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
          color: var(--color-text, #1f2937);
        }

        .category-card-btn:focus {
          outline: none;
        }

        .category-card-btn:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: -2px;
          background: var(--color-surface-hover, hsla(0, 0%, 0%, 0.04));
        }

        .category-card-btn:active {
          background: var(--color-surface-active, hsla(0, 0%, 0%, 0.08));
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .category-card,
          .category-card-img,
          .category-card-btn {
            transition: none;
          }

          .category-card:hover .category-card-img {
            transform: none;
          }

          .category-card--dragging {
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

export type { CategoryCardProps, Category, FeaturedImage }
