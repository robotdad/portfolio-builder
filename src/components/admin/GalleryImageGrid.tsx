'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
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
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ============================================================================
// Types
// ============================================================================

export interface GalleryImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string | null
}

export interface GalleryImageGridProps {
  images: GalleryImage[]
  onAdd: () => void
  onRemove: (imageId: string) => void
  onReorder: (orderedIds: string[]) => void
  maxImages?: number
  disabled?: boolean
}

// ============================================================================
// Icons
// ============================================================================

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
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

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ============================================================================
// SortableThumbnail Component
// ============================================================================

interface SortableThumbnailProps {
  image: GalleryImage
  position: number
  onRemove: () => void
  disabled: boolean
}

function SortableThumbnail({
  image,
  position,
  onRemove,
  disabled,
}: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled })

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
      className={`thumbnail-item ${isDragging ? 'thumbnail-item--dragging' : ''}`}
      aria-label={`Image ${position} of gallery`}
      {...attributes}
      {...listeners}
    >
      <Image
        src={image.thumbnailUrl}
        alt={image.altText || `Gallery image ${position}`}
        className="thumbnail-image"
        fill
        unoptimized
        draggable={false}
        style={{ objectFit: 'cover' }}
      />
      <div className="thumbnail-overlay">
        <button
          type="button"
          className="remove-button icon-btn destructive"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove image ${position}`}
          disabled={disabled}
        >
          <CloseIcon />
        </button>
      </div>

      <style jsx>{`
        .thumbnail-item {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: grab;
          touch-action: none;
          background: var(--color-surface-secondary, #f3f4f6);
        }

        .thumbnail-item:active {
          cursor: grabbing;
        }

        .thumbnail-item--dragging {
          z-index: 50;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .thumbnail-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          transition: opacity 150ms ease;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 4px;
        }

        .thumbnail-item:hover .thumbnail-overlay,
        .thumbnail-item:focus-within .thumbnail-overlay {
          opacity: 1;
        }

        .remove-button {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--color-error, #ef4444);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 150ms ease, transform 100ms ease;
        }

        .remove-button:hover {
          background: var(--color-error-hover, #dc2626);
        }

        .remove-button:focus {
          outline: none;
        }

        .remove-button:focus-visible {
          outline: 2px solid white;
          outline-offset: 1px;
        }

        .remove-button:active {
          transform: scale(0.95);
        }

        .remove-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (prefers-reduced-motion: reduce) {
          .thumbnail-overlay {
            transition: none;
          }

          .remove-button {
            transition: none;
          }

          .remove-button:active {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// ThumbnailOverlay Component (for drag preview)
// ============================================================================

interface ThumbnailOverlayProps {
  image: GalleryImage
}

function ThumbnailOverlay({ image }: ThumbnailOverlayProps) {
  return (
    <div className="overlay-thumbnail">
      <Image
        src={image.thumbnailUrl}
        alt={image.altText || 'Dragging image'}
        className="overlay-image"
        fill
        unoptimized
        draggable={false}
        style={{ objectFit: 'cover' }}
      />

      <style jsx>{`
        .overlay-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
          cursor: grabbing;
        }

        .overlay-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (prefers-reduced-motion: reduce) {
          .overlay-thumbnail {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// AddImageButton Component
// ============================================================================

interface AddImageButtonProps {
  onClick: () => void
  disabled: boolean
}

function AddImageButton({ onClick, disabled }: AddImageButtonProps) {
  return (
    <button
      type="button"
      className="add-button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Add image to gallery"
    >
      <PlusIcon />
      <span className="add-text">Add</span>

      <style jsx>{`
        .add-button {
          width: 80px;
          height: 80px;
          border: 2px dashed var(--color-border, #d1d5db);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--color-text-muted, #6b7280);
          transition: border-color 150ms ease, background-color 150ms ease,
            color 150ms ease;
        }

        .add-button:hover:not(:disabled) {
          border-color: var(--color-accent, #3b82f6);
          background: var(--color-surface-secondary, #f9fafb);
          color: var(--color-accent, #3b82f6);
        }

        .add-button:focus {
          outline: none;
        }

        .add-button:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        .add-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-text {
          font-size: 12px;
          font-weight: 500;
        }

        @media (prefers-reduced-motion: reduce) {
          .add-button {
            transition: none;
          }

          .add-button:active:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </button>
  )
}

// ============================================================================
// GalleryImageGrid Component
// ============================================================================

export function GalleryImageGrid({
  images,
  onAdd,
  onRemove,
  onReorder,
  maxImages = 20,
  disabled = false,
}: GalleryImageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState<string>('')

  // Configure sensors for desktop and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  )

  const canAddMore = images.length < maxImages

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    const index = images.findIndex((img) => img.id === active.id)
    if (index !== -1) {
      setAnnouncement(`Picked up image ${index + 1}. Use arrow keys to move.`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)

      const newImages = arrayMove(images, oldIndex, newIndex)
      const orderedIds = newImages.map((img) => img.id)

      setAnnouncement(
        `Moved image from position ${oldIndex + 1} to position ${newIndex + 1} of ${images.length}.`
      )

      onReorder(orderedIds)
    } else {
      setAnnouncement('Image dropped in original position.')
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setAnnouncement('Drag cancelled.')
  }

  // Find active image for overlay
  const activeImage = activeId
    ? images.find((img) => img.id === activeId)
    : null

  // Empty state - just show add button
  if (images.length === 0) {
    return (
      <div className="gallery-grid-container">
        <div className="gallery-grid">
          <AddImageButton onClick={onAdd} disabled={disabled} />
        </div>
        <p className="helper-text">Drag thumbnails to reorder</p>

        <style jsx>{`
          .gallery-grid-container {
            width: 100%;
          }

          .gallery-grid {
            display: grid;
            grid-template-columns: repeat(2, 80px);
            gap: 8px;
          }

          .helper-text {
            margin: 8px 0 0 0;
            font-size: 12px;
            color: var(--color-text-muted, #6b7280);
          }

          @media (min-width: 640px) {
            .gallery-grid {
              grid-template-columns: repeat(3, 80px);
            }
          }

          @media (min-width: 1024px) {
            .gallery-grid {
              grid-template-columns: repeat(4, 80px);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="gallery-grid-container">
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={images.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="gallery-grid" role="list" aria-label="Gallery images">
            {images.map((image, index) => (
              <div key={image.id} role="listitem">
                <SortableThumbnail
                  image={image}
                  position={index + 1}
                  onRemove={() => onRemove(image.id)}
                  disabled={disabled}
                />
              </div>
            ))}
            {canAddMore && (
              <AddImageButton onClick={onAdd} disabled={disabled} />
            )}
          </div>
        </SortableContext>

        {/* Drag overlay for smooth dragging visual */}
        <DragOverlay dropAnimation={null}>
          {activeImage ? <ThumbnailOverlay image={activeImage} /> : null}
        </DragOverlay>
      </DndContext>

      <p className="helper-text">Drag thumbnails to reorder</p>

      <style jsx>{`
        .gallery-grid-container {
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

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 80px);
          gap: 8px;
        }

        .helper-text {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: var(--color-text-muted, #6b7280);
        }

        /* Tablet: 3 columns */
        @media (min-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 80px);
          }
        }

        /* Desktop: 4 columns */
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(4, 80px);
          }
        }
      `}</style>
    </div>
  )
}


