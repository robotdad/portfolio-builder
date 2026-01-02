'use client'

import { useState } from 'react'
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CategoryCard } from './CategoryCard'
import { type Category } from '@/hooks/useCategories'

// ============================================================================
// Types
// ============================================================================

interface CategoryListProps {
  categories: Category[]
  onCreateClick: () => void
  onEditClick: (category: Category) => void
  onDeleteClick: (category: Category) => void
  onViewProjects: (category: Category) => void
  onReorder: (orderedIds: string[]) => void
  isReordering?: boolean
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

// ============================================================================
// SortableItem Component
// ============================================================================

interface SortableItemProps {
  id: string
  category: Category
  onEdit: () => void
  onDelete: () => void
  onViewProjects: () => void
  disabled: boolean
}

function SortableItem({ id, category, onEdit, onDelete, onViewProjects, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? 'sortable-item--dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CategoryCard
        category={category}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewProjects={onViewProjects}
        isDragging={isDragging}
      />

      <style jsx>{`
        .sortable-item {
          touch-action: none;
          cursor: grab;
        }

        .sortable-item:active {
          cursor: grabbing;
        }

        .sortable-item--dragging {
          z-index: 10;
        }

        @media (prefers-reduced-motion: reduce) {
          .sortable-item {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// SkeletonCard Component
// ============================================================================

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-count" />
      </div>

      <style jsx>{`
        .skeleton-card {
          display: flex;
          flex-direction: column;
          background: var(--color-bg, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
        }

        .skeleton-image {
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background: linear-gradient(
            90deg,
            var(--color-surface-secondary, #f3f4f6) 25%,
            var(--color-surface-tertiary, #e5e7eb) 50%,
            var(--color-surface-secondary, #f3f4f6) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-content {
          padding: 12px 14px;
        }

        .skeleton-title {
          height: 18px;
          width: 70%;
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
          width: 40%;
          margin-top: 6px;
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
          .skeleton-image,
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
// AddCategoryCard Component
// ============================================================================

interface AddCategoryCardProps {
  onClick: () => void
}

function AddCategoryCard({ onClick }: AddCategoryCardProps) {
  return (
    <button
      type="button"
      className="add-category-card"
      onClick={onClick}
      aria-label="Add new category"
    >
      <div className="add-category-icon">
        <PlusIcon />
      </div>
      <span className="add-category-text">Add Category</span>

      <style jsx>{`
        .add-category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 180px;
          background: transparent;
          border: 2px dashed var(--color-border, #e5e7eb);
          border-radius: 12px;
          padding: 24px;
          cursor: pointer;
          transition: border-color 200ms ease, background-color 200ms ease;
        }

        .add-category-card:hover {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-surface-hover, hsla(217, 91%, 60%, 0.04));
        }

        .add-category-card:focus {
          outline: none;
        }

        .add-category-card:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
          border-color: var(--color-accent, #3b82f6);
        }

        .add-category-card:active {
          background-color: var(--color-surface-active, hsla(217, 91%, 60%, 0.08));
        }

        .add-category-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-surface-secondary, #f3f4f6);
          color: var(--color-text-muted, #6b7280);
          transition: background-color 200ms ease, color 200ms ease;
        }

        .add-category-card:hover .add-category-icon {
          background: var(--color-accent, #3b82f6);
          color: white;
        }

        .add-category-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-muted, #6b7280);
          transition: color 200ms ease;
        }

        .add-category-card:hover .add-category-text {
          color: var(--color-accent, #3b82f6);
        }

        @media (prefers-reduced-motion: reduce) {
          .add-category-card,
          .add-category-icon,
          .add-category-text {
            transition: none;
          }
        }
      `}</style>
    </button>
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
    <div className="empty-state" role="status">
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
      <div className="category-list-container">
        <header className="category-list-header">
          <h2 className="category-list-title">Categories</h2>
          <button
            type="button"
            className="category-list-create-btn"
            disabled
            aria-disabled="true"
          >
            <PlusIcon />
            <span>New Category</span>
          </button>
        </header>

        <div className="category-grid" aria-busy="true" aria-label="Loading categories">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
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

          .category-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          @media (min-width: 640px) {
            .category-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .category-grid {
              grid-template-columns: repeat(3, 1fr);
            }
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
        >
          <PlusIcon />
          <span>New Category</span>
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
          strategy={rectSortingStrategy}
        >
          <div
            className="category-grid"
            role="list"
            aria-label="Draggable category list"
          >
            {categories.map((category) => (
              <div key={category.id} role="listitem">
                <SortableItem
                  id={category.id}
                  category={category}
                  onEdit={() => onEditClick(category)}
                  onDelete={() => onDeleteClick(category)}
                  onViewProjects={() => onViewProjects(category)}
                  disabled={isReordering}
                />
              </div>
            ))}

            {/* Add Category card at the end */}
            <div role="listitem">
              <AddCategoryCard onClick={onCreateClick} />
            </div>
          </div>
        </SortableContext>

        {/* Drag overlay for visual feedback */}
        <DragOverlay dropAnimation={null}>
          {activeCategory ? (
            <div className="drag-overlay">
              <CategoryCard
                category={activeCategory}
                onEdit={() => {}}
                onDelete={() => {}}
                onViewProjects={() => {}}
                isDragging={true}
              />
            </div>
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

        .category-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Tablet: 2 columns */
        @media (min-width: 640px) {
          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Desktop: 3 columns */
        @media (min-width: 1024px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .drag-overlay {
          opacity: 0.9;
          box-shadow: 0 12px 32px hsla(0, 0%, 0%, 0.2),
            0 4px 12px hsla(0, 0%, 0%, 0.1);
          border-radius: 12px;
          transform: scale(1.02);
          cursor: grabbing;
        }

        @media (prefers-reduced-motion: reduce) {
          .category-list-create-btn {
            transition: none;
          }

          .category-list-create-btn:active:not(:disabled) {
            transform: none;
          }

          .drag-overlay {
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
