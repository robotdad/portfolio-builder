'use client'

import Link from 'next/link'
import { Card, CardImage, CardBody, CardTitle, CardDescription, Button } from '@/components/ui'
import { type Project } from '@/hooks/useProjects'
import { DragHandle } from '@/components/shared/DragHandle'

// ============================================================================
// Types
// ============================================================================

interface ProjectCardProps {
  project: Project
  onDelete: () => void
  onRename?: () => void
  onMove?: () => void
  isDragging?: boolean
  dragHandleProps?: any
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

function MoveIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Folder body */}
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      {/* Arrow indicating move */}
      <polyline points="12 12 16 12" />
      <polyline points="14 10 16 12 14 14" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
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
  onRename,
  onMove,
  isDragging = false,
  dragHandleProps,
}: ProjectCardProps) {
  const imageUrl = project.featuredImage?.thumbnailUrl || project.featuredImage?.url

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }

  const handleRename = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onRename?.()
  }

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onMove?.()
  }

  return (
    <Link
      href={`/admin/projects/${project.id}`}
      className="project-card-link"
      aria-label={`Edit project: ${project.title}`}
      data-testid={`project-card-${project.id}`}
    >
      <Card variant="interactive" isDragging={isDragging}>
        {/* Image Section with Overlays */}
        <div className="image-section">
          {imageUrl ? (
            <CardImage
              src={imageUrl}
              alt={project.featuredImage?.altText || `Featured image for ${project.title}`}
              aspectRatio="16/9"
            />
          ) : (
            <div className="placeholder">
              <CameraIcon />
            </div>
          )}

          {/* Year Badge */}
          {project.year && (
            <span className="year-badge">{project.year}</span>
          )}

          {/* Drag Handle */}
          {dragHandleProps && (
            <div
              className="drag-handle-wrapper"
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              aria-label="Drag to reorder project"
              data-testid="project-card-drag-handle"
            >
              <DragHandle />
            </div>
          )}

          {/* Delete Button */}
          <div className="delete-wrapper">
            <Button
              variant="destructive"
              iconOnly
              size="sm"
              onClick={handleDelete}
              aria-label={`Delete ${project.title}`}
              data-testid="project-card-delete-btn"
            >
              <TrashIcon />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardBody>
          <div className="card-title-row">
            <CardTitle>{project.title}</CardTitle>
            {onRename && (
              <button
                className="rename-btn"
                onClick={handleRename}
                aria-label={`Rename ${project.title}`}
                type="button"
                data-testid="project-card-rename-btn"
              >
                <PencilIcon />
              </button>
            )}
            {onMove && (
              <button
                className="move-btn"
                onClick={handleMove}
                aria-label={`Move ${project.title} to a different category`}
                type="button"
                data-testid="project-card-move-btn"
              >
                <MoveIcon />
              </button>
            )}
          </div>
          {project.venue && <CardDescription>{project.venue}</CardDescription>}
        </CardBody>
      </Card>

      <style jsx global>{`
        .project-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .image-section {
          position: relative;
        }

        .placeholder {
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-surface-dim, hsl(0, 0%, 96%));
          color: var(--color-text-muted, hsl(0, 0%, 60%));
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rename-btn,
        .move-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          padding: 0;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--color-text-muted, #9ca3af);
          cursor: pointer;
          opacity: 0;
          transition: opacity 150ms ease, background-color 150ms ease, color 150ms ease;
        }

        .rename-btn:hover,
        .move-btn:hover {
          background: var(--color-surface-dim, #f3f4f6);
          color: var(--color-text, #1f2937);
        }

        .rename-btn:focus-visible,
        .move-btn:focus-visible {
          opacity: 1;
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .project-card-link:hover .rename-btn,
        .project-card-link:focus-within .rename-btn,
        .project-card-link:hover .move-btn,
        .project-card-link:focus-within .move-btn {
          opacity: 1;
        }

        /* Always show on mobile */
        @media (max-width: 639px) {
          .rename-btn,
          .move-btn {
            opacity: 1;
          }
        }

        .year-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          background: hsla(0, 0%, 0%, 0.6);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        .drag-handle-wrapper {
          position: absolute;
          bottom: 8px;
          left: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: hsla(0, 0%, 100%, 0.95);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          color: var(--color-text-muted, #6b7280);
          opacity: 1;
          transition: opacity var(--transition-fast, 150ms) ease,
                      background-color var(--transition-fast, 150ms) ease,
                      transform 100ms ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .drag-handle-wrapper:hover {
          background: white;
          color: var(--color-text, #1f2937);
          transform: scale(1.05);
        }

        .drag-handle-wrapper:active {
          transform: scale(0.98);
        }

        /* Hide drag handle on desktop until hover/focus */
        @media (min-width: 640px) {
          .drag-handle-wrapper {
            opacity: 0;
          }

          :global(.project-card-link:hover) .drag-handle-wrapper,
          :global(.project-card-link:focus-within) .drag-handle-wrapper {
            opacity: 1;
          }
        }

        .delete-wrapper {
          position: absolute;
          top: 8px;
          right: 8px;
          opacity: 1;
        }

        /* Hide delete button on desktop until hover/focus */
        @media (min-width: 640px) {
          .delete-wrapper {
            opacity: 0;
            transition: opacity var(--transition-fast, 150ms) ease;
          }

          .project-card-link:hover .delete-wrapper,
          .project-card-link:focus-within .delete-wrapper {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .drag-handle-wrapper,
          .delete-wrapper {
            transition: none;
          }

          .drag-handle-wrapper:hover,
          .drag-handle-wrapper:active {
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
export type { Project } from '@/hooks/useProjects'
