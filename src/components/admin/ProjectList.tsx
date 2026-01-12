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
import { ProjectCard, type Project } from './ProjectCard'

// ============================================================================
// Types
// ============================================================================

interface ProjectListProps {
  projects: Project[]
  onCreateClick: () => void
  onDeleteClick: (project: Project) => void
  onReorder: (orderedIds: string[]) => void
  isLoading?: boolean
  categoryName: string
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
  project: Project
  onDelete: () => void
  disabled: boolean
}

function SortableItem({ id, project, onDelete, disabled }: SortableItemProps) {
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
    zIndex: isDragging ? 50 : 'auto',
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? 'sortable-item--dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <ProjectCard
        project={project}
        onDelete={onDelete}
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
          z-index: 50;
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
        <div className="skeleton-meta" />
        <div className="skeleton-description" />
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
          width: 75%;
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

        .skeleton-meta {
          height: 14px;
          width: 50%;
          margin-top: 8px;
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

        .skeleton-description {
          height: 12px;
          width: 90%;
          margin-top: 8px;
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
          .skeleton-meta,
          .skeleton-description {
            animation: none;
            background: var(--color-surface-secondary, #f3f4f6);
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// EmptyState Component
// ============================================================================

interface EmptyStateProps {
  categoryName: string
  onCreateClick: () => void
}

function EmptyState({ categoryName, onCreateClick }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" data-testid="project-list-empty">
      <div className="empty-state-icon">
        <FolderIcon />
      </div>
      <h3 className="empty-state-heading">No projects in {categoryName} yet</h3>
      <p className="empty-state-text">
        Create projects to showcase your work in this category
      </p>
      <button
        type="button"
        className="empty-state-button"
        onClick={onCreateClick}
        data-testid="project-list-empty-create-btn"
      >
        <PlusIcon />
        <span>Create First Project</span>
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
// ProjectList Component
// ============================================================================

export function ProjectList({
  projects,
  onCreateClick,
  onDeleteClick,
  onReorder,
  isLoading = false,
  categoryName,
}: ProjectListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')

  // Configure sensors for desktop, touch, and keyboard (CRITICAL for mobile)
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

    const project = projects.find((p) => p.id === active.id)
    if (project) {
      setAnnouncement(`Picked up ${project.title}. Use arrow keys to move.`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id)
      const newIndex = projects.findIndex((p) => p.id === over.id)

      const newProjects = arrayMove(projects, oldIndex, newIndex)
      const orderedIds = newProjects.map((p) => p.id)

      // Announce the move for screen readers
      const project = projects.find((p) => p.id === active.id)
      if (project) {
        setAnnouncement(
          `Moved ${project.title} from position ${oldIndex + 1} to position ${newIndex + 1} of ${projects.length}.`
        )
      }

      onReorder(orderedIds)
    } else {
      const project = projects.find((p) => p.id === active.id)
      if (project) {
        setAnnouncement(`${project.title} dropped in original position.`)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setAnnouncement('Drag cancelled.')
  }

  // Find active project for overlay
  const activeProject = activeId
    ? projects.find((p) => p.id === activeId)
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="project-list-container">
        <header className="project-list-header">
          <button
            type="button"
            className="project-list-create-btn"
            disabled
            aria-disabled="true"
          >
            <PlusIcon />
            <span>Create Project</span>
          </button>
        </header>

        <div className="project-grid" aria-busy="true" aria-label="Loading projects">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <style jsx>{`
          .project-list-container {
            width: 100%;
          }

          .project-list-header {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 16px;
            margin-bottom: 24px;
          }

          .project-list-create-btn {
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

          .project-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          @media (min-width: 768px) {
            .project-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .project-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}</style>
      </div>
    )
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="project-list-container">
        <EmptyState categoryName={categoryName} onCreateClick={onCreateClick} />

        <style jsx>{`
          .project-list-container {
            width: 100%;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="project-list-container">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <header className="project-list-header">
        <button
          type="button"
          className="project-list-create-btn"
          onClick={onCreateClick}
          data-testid="project-list-create-btn"
        >
          <PlusIcon />
          <span>Create Project</span>
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
          items={projects.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className="project-grid"
            role="list"
            aria-label="Draggable project list"
            data-testid="project-list"
          >
            {projects.map((project) => (
              <div key={project.id} role="listitem">
                <SortableItem
                  id={project.id}
                  project={project}
                  onDelete={() => onDeleteClick(project)}
                  disabled={false}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay for smooth dragging visual */}
        <DragOverlay dropAnimation={null}>
          {activeProject ? (
            <div className="drag-overlay">
              <ProjectCard
                project={activeProject}
                onDelete={() => {}}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <style jsx>{`
        .project-list-container {
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

        .project-list-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .project-list-create-btn {
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

        .project-list-create-btn:hover {
          background: var(--color-accent-hover, #2563eb);
        }

        .project-list-create-btn:focus {
          outline: none;
        }

        .project-list-create-btn:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .project-list-create-btn:active {
          transform: scale(0.98);
        }

        .project-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        /* Tablet: 2 columns */
        @media (min-width: 768px) {
          .project-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Desktop: 3 columns */
        @media (min-width: 1024px) {
          .project-grid {
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
          .project-list-create-btn {
            transition: none;
          }

          .project-list-create-btn:active {
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

export type { ProjectListProps }
