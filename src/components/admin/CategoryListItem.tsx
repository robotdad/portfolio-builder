'use client'

import { useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface CategoryListItemProps {
  category: Category
  onNavigate: (categoryId: string) => void
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

// ============================================================================
// Icons
// ============================================================================

function DragHandleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6" cy="4" r="1" fill="currentColor" />
      <circle cx="10" cy="4" r="1" fill="currentColor" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="10" cy="8" r="1" fill="currentColor" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ============================================================================
// CategoryListItem Component
// ============================================================================

export function CategoryListItem({
  category,
  onNavigate,
  onEdit,
  onDelete,
}: CategoryListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleNavigate = useCallback(() => {
    onNavigate(category.id)
  }, [category.id, onNavigate])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(category)
  }, [category, onEdit])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(category)
  }, [category, onDelete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavigate()
    }
  }, [handleNavigate])

  const projectCountText = category._count.projects === 1
    ? '1 project'
    : `${category._count.projects} projects`

  const imageUrl = category.featuredImage?.thumbnailUrl || category.featuredImage?.url

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`category-list-item ${isDragging ? 'category-list-item--dragging' : ''}`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${category.name} projects`}
    >
      {/* Drag Handle */}
      <div 
        className="category-list-item-drag-handle" 
        {...listeners} 
        {...attributes}
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandleIcon />
      </div>

      {/* Thumbnail */}
      <div className="category-list-item-thumbnail">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="" 
            loading="lazy"
          />
        ) : (
          <div className="category-list-item-placeholder">
            <FolderIcon />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="category-list-item-info">
        <h3 className="category-list-item-name">{category.name}</h3>
        <span className="category-list-item-count">{projectCountText}</span>
      </div>

      {/* Actions */}
      <div className="category-list-item-actions">
        <button
          className="category-list-item-action"
          onClick={handleEdit}
          aria-label={`Edit ${category.name}`}
          type="button"
        >
          <EditIcon />
          <span className="category-list-item-action-text">Edit</span>
        </button>

        <button
          className="category-list-item-action category-list-item-action--danger"
          onClick={handleDelete}
          aria-label={`Delete ${category.name}`}
          type="button"
        >
          <TrashIcon />
          <span className="category-list-item-action-text">Delete</span>
        </button>
      </div>

      {/* Navigation Indicator */}
      <div className="category-list-item-chevron" aria-hidden="true">
        <ChevronRightIcon />
      </div>

      <style jsx>{`
        .category-list-item {
          display: grid;
          grid-template-columns: auto 64px 1fr auto auto;
          align-items: center;
          gap: var(--space-3, 12px);
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: var(--admin-bg, white);
          border: 1px solid var(--admin-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          cursor: pointer;
          transition: background-color 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
        }

        .category-list-item:hover {
          background: var(--admin-bg-secondary, #f9fafb);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .category-list-item:focus-visible {
          outline: 2px solid var(--admin-primary, #3b82f6);
          outline-offset: 2px;
        }

        .category-list-item--dragging {
          opacity: 0.5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Drag Handle */
        .category-list-item-drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 44px;
          color: var(--admin-text-muted, #6b7280);
          cursor: grab;
          touch-action: none;
        }

        .category-list-item-drag-handle:active {
          cursor: grabbing;
        }

        /* Thumbnail */
        .category-list-item-thumbnail {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md, 6px);
          overflow: hidden;
          background: var(--admin-bg-secondary, #f3f4f6);
          flex-shrink: 0;
        }

        .category-list-item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-list-item-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-muted, #9ca3af);
        }

        /* Info */
        .category-list-item-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
          min-width: 0;
        }

        .category-list-item-name {
          margin: 0;
          font-size: var(--font-size-base, 1rem);
          font-weight: 600;
          color: var(--admin-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .category-list-item-count {
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--admin-text-muted, #6b7280);
        }

        /* Actions */
        .category-list-item-actions {
          display: flex;
          gap: var(--space-2, 8px);
        }

        .category-list-item-action {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1, 4px);
          padding: var(--space-2, 8px) var(--space-3, 12px);
          background: transparent;
          border: 1px solid var(--admin-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          color: var(--admin-text, #374151);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
          min-height: 44px;
        }

        .category-list-item-action:hover {
          background: var(--admin-bg-secondary, #f3f4f6);
          border-color: var(--admin-text-muted, #9ca3af);
        }

        .category-list-item-action:focus-visible {
          outline: 2px solid var(--admin-primary, #3b82f6);
          outline-offset: 2px;
        }

        .category-list-item-action--danger {
          color: var(--admin-error, #dc2626);
        }

        .category-list-item-action--danger:hover {
          background: hsl(0, 86%, 97%);
          border-color: var(--admin-error, #dc2626);
        }

        /* Chevron */
        .category-list-item-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-muted, #9ca3af);
        }

        /* Mobile Layout */
        @media (max-width: 767px) {
          .category-list-item {
            grid-template-columns: auto 48px 1fr auto;
            grid-template-rows: auto auto;
            gap: var(--space-2, 8px);
            padding: var(--space-3, 12px);
          }

          .category-list-item-thumbnail {
            width: 48px;
            height: 48px;
          }

          .category-list-item-info {
            grid-column: 3;
            grid-row: 1;
          }

          .category-list-item-chevron {
            grid-column: 4;
            grid-row: 1;
          }

          .category-list-item-actions {
            grid-column: 2 / -1;
            grid-row: 2;
            justify-content: flex-start;
          }

          .category-list-item-action-text {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}

export type { CategoryListItemProps, Category, FeaturedImage }
