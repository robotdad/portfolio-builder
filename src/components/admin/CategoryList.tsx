'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CategoryListItem } from './CategoryListItem'
import { type Category } from '@/hooks/useCategories'

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the CategoryList component
 */
interface CategoryListProps {
  /** Array of categories to display in the list */
  categories: Category[]
  /** Callback fired when user clicks the create category button */
  onCreateClick: () => void
  /** Callback fired when user clicks edit on a category */
  onEditClick: (category: Category) => void
  /** Callback fired when user clicks delete on a category */
  onDeleteClick: (category: Category) => void
  /** Callback fired when user clicks to view projects within a category */
  onViewProjects: (category: Category) => void
  /** Callback fired when categories are reordered via drag-and-drop */
  onReorder: (orderedIds: string[]) => void
  /** Whether a reorder operation is currently in progress (disables create button) */
  isReordering?: boolean
  /** Whether categories are currently loading (shows skeleton state) */
  isLoading?: boolean
}

// ============================================================================
// Icons
// ============================================================================

function PlusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function FolderIcon() {
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
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

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

// ============================================================================
// SkeletonListItem Component
// ============================================================================

function SkeletonListItem() {
  return (
    <div className="skeleton-list-item" aria-hidden="true">
      <div className="skeleton-drag-handle" />
      <div className="skeleton-thumbnail" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-count" />
      </div>

      <style jsx>{`
        .skeleton-list-item {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
        }

        .skeleton-drag-handle {
          width: 24px;
          height: 44px;
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-thumbnail {
          width: 64px;
          height: 64px;
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: var(--radius-md, 6px);
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
        }

        .skeleton-title {
          height: 18px;
          width: 40%;
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-count {
          height: 14px;
          width: 20%;
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .skeleton-drag-handle,
          .skeleton-thumbnail,
          .skeleton-title,
          .skeleton-count {
            animation: none;
            background: var(--color-surface-secondary, #f3f4f6);
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// DragOverlayItem Component (static version for drag overlay)
// ============================================================================

interface DragOverlayItemProps {
  category: Category
}

function DragOverlayItem({ category }: DragOverlayItemProps) {
  const subcategoryCount = category._count.children ?? 0
  const projectCountText = [
    category._count.projects === 1 ? '1 project' : `${category._count.projects} projects`,
    ...(subcategoryCount > 0
      ? [subcategoryCount === 1 ? '1 subcategory' : `${subcategoryCount} subcategories`]
      : []),
  ].join(' · ')

  const imageUrl = category.featuredImage?.thumbnailUrl || category.featuredImage?.url

  return (
    <div className="drag-overlay-item">
      <div className="drag-overlay-item-handle">
        <DragHandleIcon />
      </div>
      <div className="drag-overlay-item-thumbnail">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill unoptimized style={{ objectFit: 'cover' }} />
        ) : (
          <div className="drag-overlay-item-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="drag-overlay-item-info">
        <h3 className="drag-overlay-item-name">{category.name}</h3>
        <span className="drag-overlay-item-count">{projectCountText}</span>
      </div>

      <style jsx>{`
        .drag-overlay-item {
          display: flex;
          align-items: center;
          gap: var(--space-3, 12px);
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: var(--admin-bg, white);
          border: 1px solid var(--admin-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          box-shadow: 0 12px 32px hsla(0, 0%, 0%, 0.2), 0 4px 12px hsla(0, 0%, 0%, 0.1);
          opacity: 0.95;
          cursor: grabbing;
        }

        .drag-overlay-item-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 44px;
          color: var(--admin-text-muted, #6b7280);
        }

        .drag-overlay-item-thumbnail {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md, 6px);
          overflow: hidden;
          background: var(--admin-bg-secondary, #f3f4f6);
          flex-shrink: 0;
        }

        .drag-overlay-item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .drag-overlay-item-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--admin-text-muted, #9ca3af);
        }

        .drag-overlay-item-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
          min-width: 0;
        }

        .drag-overlay-item-name {
          margin: 0;
          font-size: var(--font-size-base, 1rem);
          font-weight: 600;
          color: var(--admin-text, #111827);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .drag-overlay-item-count {
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--admin-text-muted, #6b7280);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// EmptyState Component
// ============================================================================

interface EmptyStateProps {
  onCreateClick: () => void
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" data-testid="category-list-empty">
      <div className="empty-state-icon">
        <FolderIcon />
      </div>
      <h3 className="empty-state-heading">No categories yet</h3>
      <p className="empty-state-text">
        Create categories to organize your projects
      </p>
      <button
        type="button"
        className="empty-state-button"
        onClick={onCreateClick}
        data-testid="category-list-empty-create-btn"
      >
        <PlusIcon />
        <span>Create First Category</span>
      </button>

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-state-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--color-surface-secondary, #f3f4f6);
          color: var(--color-text-muted, #9ca3af);
          margin-bottom: 16px;
        }

        .empty-state-heading {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
        }

        .empty-state-text {
          margin: 8px 0 24px 0;
          font-size: 14px;
          color: var(--color-text-muted, #6b7280);
          max-width: 280px;
        }

        .empty-state-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--color-accent, #3b82f6);
          color: white;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 200ms ease, transform 100ms ease;
        }

        .empty-state-button:hover {
          background: var(--color-accent-hover, #2563eb);
        }

        .empty-state-button:focus {
          outline: none;
        }

        .empty-state-button:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .empty-state-button:active {
          transform: scale(0.98);
        }

        @media (prefers-reduced-motion: reduce) {
          .empty-state-button {
            transition: none;
          }

          .empty-state-button:active {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// CategoryList Component
// ============================================================================

export function CategoryList({
  categories,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onViewProjects,
  onReorder,
  isReordering = false,
  isLoading = false,
}: CategoryListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')

  // Configure sensors for desktop, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    const category = categories.find((c) => c.id === active.id)
    if (category) {
      setAnnouncement(`Picked up ${category.name}. Use arrow keys to move.`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)

      const newCategories = arrayMove(categories, oldIndex, newIndex)
      const orderedIds = newCategories.map((c) => c.id)

      // Announce the move for screen readers
      const category = categories.find((c) => c.id === active.id)
      if (category) {
        setAnnouncement(
          `Moved ${category.name} from position ${oldIndex + 1} to position ${newIndex + 1} of ${categories.length}.`
        )
      }

      onReorder(orderedIds)
    } else {
      const category = categories.find((c) => c.id === active.id)
      if (category) {
        setAnnouncement(`${category.name} dropped in original position.`)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setAnnouncement('Drag cancelled.')
  }

  // Find active category for overlay
  const activeCategory = activeId
    ? categories.find((c) => c.id === activeId)
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="category-list-container" data-testid="category-list-loading">
        <header className="category-list-header">
          <h2 className="category-list-title">Categories</h2>
          <button
            type="button"
            className="category-list-create-btn"
            disabled
            aria-disabled="true"
          >
            <PlusIcon />
            <span>Create Category</span>
          </button>
        </header>

        <div className="category-list-grid" aria-busy="true" aria-label="Loading categories">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>

        <style jsx>{`
          .category-list-container {
            width: 100%;
          }

          .category-list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }

          .category-list-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text, #1f2937);
          }

          .category-list-create-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: var(--color-accent, #3b82f6);
            color: white;
            font-size: 14px;
            font-weight: 500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            opacity: 0.6;
          }

          .category-list-grid {
            display: flex;
            flex-direction: column;
            gap: var(--space-3, 12px);
          }
        `}</style>
      </div>
    )
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className="category-list-container">
        <header className="category-list-header">
          <h2 className="category-list-title">Categories</h2>
        </header>

        <EmptyState onCreateClick={onCreateClick} />

        <style jsx>{`
          .category-list-container {
            width: 100%;
          }

          .category-list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 24px;
          }

          .category-list-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text, #1f2937);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="category-list-container">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <header className="category-list-header">
        <h2 className="category-list-title">Categories</h2>
        <button
          type="button"
          className="category-list-create-btn"
          onClick={onCreateClick}
          disabled={isReordering}
          data-testid="category-list-create-btn"
        >
          <PlusIcon />
          <span>Create Category</span>
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="category-list-grid"
            role="list"
            aria-label="Draggable category list"
            data-testid="category-list"
          >
            {categories.map((category) => (
              <div key={category.id} role="listitem">
                <CategoryListItem
                  category={category}
                  onNavigate={() => onViewProjects(category)}
                  onEdit={() => onEditClick(category)}
                  onDelete={() => onDeleteClick(category)}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay for visual feedback */}
        <DragOverlay dropAnimation={null}>
          {activeCategory ? (
            <DragOverlayItem category={activeCategory} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <style jsx>{`
        .category-list-container {
          width: 100%;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .category-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-list-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text, #1f2937);
        }

        .category-list-create-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--color-accent, #3b82f6);
          color: white;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 200ms ease, transform 100ms ease;
        }

        .category-list-create-btn:hover:not(:disabled) {
          background: var(--color-accent-hover, #2563eb);
        }

        .category-list-create-btn:focus {
          outline: none;
        }

        .category-list-create-btn:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .category-list-create-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .category-list-create-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .category-list-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 12px);
        }

        @media (prefers-reduced-motion: reduce) {
          .category-list-create-btn {
            transition: none;
          }

          .category-list-create-btn:active:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { CategoryListProps }
