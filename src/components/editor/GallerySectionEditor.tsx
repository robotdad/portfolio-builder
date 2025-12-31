'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
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
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { GallerySection as GallerySectionType, GalleryImage } from '@/lib/content-schema'
import { createGalleryImage } from '@/lib/content-schema'

interface GallerySectionEditorProps {
  section: GallerySectionType
  portfolioId: string
  onChange: (section: GallerySectionType) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB per file

export function GallerySectionEditor({
  section,
  portfolioId,
  onChange,
  onDelete,
  onSaveRequest,
}: GallerySectionEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = section.images.findIndex((img) => img.id === active.id)
      const newIndex = section.images.findIndex((img) => img.id === over.id)

      const newImages = arrayMove(section.images, oldIndex, newIndex)
      onChange({
        ...section,
        images: newImages,
      })
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // Process and upload files - reusable for both click and drag-drop
  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      setError(null)

      // Validate all files first
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`Invalid file type: ${file.name}. Please use JPEG, PNG, or WebP.`)
          return
        }
        if (file.size > MAX_SIZE) {
          setError(`File too large: ${file.name}. Maximum size is 10MB.`)
          return
        }
      }

      setUploading(true)
      setUploadProgress(0)

      const newImages: GalleryImage[] = []
      const totalFiles = files.length

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()
          formData.append('file', file)
          formData.append('portfolioId', portfolioId)
          formData.append('altText', '')

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || `Failed to upload ${file.name}`)
          }

          const asset = await response.json()

          // Create a new gallery image
          const galleryImage = createGalleryImage()
          galleryImage.imageId = asset.id
          galleryImage.imageUrl = asset.url
          galleryImage.altText = asset.altText || ''

          newImages.push(galleryImage)

          // Update progress
          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
        }

        // Add all new images to the gallery
        onChange({
          ...section,
          images: [...section.images, ...newImages],
        })

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        // Auto-save after successful upload
        if (onSaveRequest) {
          onSaveRequest()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [portfolioId, section, onChange, onSaveRequest]
  )

  // Handle file input change
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      processFiles(files)
    },
    [processFiles]
  )

  // Drag-and-drop event handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      )
      processFiles(files)
    },
    [processFiles]
  )

  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const image = section.images.find((img) => img.id === imageId)
      if (image?.imageId) {
        try {
          await fetch(`/api/upload/${image.imageId}`, { method: 'DELETE' })
        } catch (err) {
          console.error('Failed to delete image:', err)
        }
      }

      onChange({
        ...section,
        images: section.images.filter((img) => img.id !== imageId),
      })
    },
    [section, onChange]
  )

  const handleImageChange = useCallback(
    (imageId: string, updates: Partial<GalleryImage>) => {
      // Update local state
      onChange({
        ...section,
        images: section.images.map((img) =>
          img.id === imageId ? { ...img, ...updates } : img
        ),
      })

      // Sync alt text and caption to server if imageId exists
      const image = section.images.find((img) => img.id === imageId)
      if (image?.imageId && (updates.altText !== undefined || updates.caption !== undefined)) {
        // Fire-and-forget server update
        fetch(`/api/upload/${image.imageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            altText: updates.altText ?? image.altText,
            caption: updates.caption ?? image.caption,
          }),
        }).catch((err) => console.error('Failed to sync image metadata:', err))
      }
    },
    [section, onChange]
  )

  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...section,
      heading: e.target.value,
    })
  }

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const activeImage = activeId ? section.images.find((img) => img.id === activeId) : null

  return (
    <div
      className={`section-editor section-editor-gallery ${isDragOver ? 'drag-over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="section-editor-header">
        <span className="section-type-label">Gallery</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div className="section-editor-content">
        {/* Heading input */}
        <div className="form-group">
          <label htmlFor={`heading-${section.id}`} className="form-label">
            Gallery Heading (optional)
          </label>
          <input
            type="text"
            id={`heading-${section.id}`}
            value={section.heading}
            onChange={handleHeadingChange}
            className="form-input"
            placeholder="e.g., Project Photos, Behind the Scenes"
          />
        </div>

        {/* Image count */}
        <div className="gallery-info">
          <span className="gallery-count">
            {section.images.length} {section.images.length === 1 ? 'image' : 'images'}
          </span>
        </div>

        {/* Gallery grid with drag and drop */}
        {section.images.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={section.images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="gallery-editor-grid">
                {section.images.map((image) => (
                  <SortableGalleryImage
                    key={image.id}
                    image={image}
                    isExpanded={expandedImageId === image.id}
                    onToggleExpand={() =>
                      setExpandedImageId(expandedImageId === image.id ? null : image.id)
                    }
                    onRemove={() => handleRemoveImage(image.id)}
                    onChange={(updates) => handleImageChange(image.id, updates)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeImage ? (
                <div className="gallery-image-drag-overlay">
                  <img src={activeImage.imageUrl || ''} alt={activeImage.altText || 'Image'} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Upload area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Select image files"
          multiple
        />

        <button
          type="button"
          onClick={handleDropzoneClick}
          className="gallery-upload-btn"
          disabled={uploading}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>
            {uploading
              ? `Uploading... ${uploadProgress}%`
              : section.images.length === 0
              ? 'Click to add images'
              : 'Add more images'}
          </span>
          <span className="gallery-upload-hint">Select multiple images at once</span>
        </button>

        {uploading && (
          <div className="image-upload-progress">
            <div
              className="image-upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

// Sortable gallery image component
interface SortableGalleryImageProps {
  image: GalleryImage
  isExpanded: boolean
  onToggleExpand: () => void
  onRemove: () => void
  onChange: (updates: Partial<GalleryImage>) => void
}

function SortableGalleryImage({
  image,
  isExpanded,
  onToggleExpand,
  onRemove,
  onChange,
}: SortableGalleryImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gallery-editor-item ${isExpanded ? 'expanded' : ''}`}
    >
      <div className="gallery-editor-item-preview">
        {/* Drag handle */}
        <button
          type="button"
          className="gallery-item-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>

        {/* Image thumbnail */}
        <div className="gallery-editor-item-thumb" onClick={onToggleExpand}>
          <img src={image.imageUrl || ''} alt={image.altText || 'Gallery image'} />
        </div>

        {/* Quick actions */}
        <div className="gallery-editor-item-actions">
          <button
            type="button"
            onClick={onToggleExpand}
            className="gallery-item-edit-btn"
            aria-label="Edit image details"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="gallery-item-delete-btn"
            aria-label="Remove image"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded edit form */}
      {isExpanded && (
        <div className="gallery-editor-item-details">
          <div className="form-group">
            <label htmlFor={`altText-${image.id}`} className="form-label">
              Alt Text {!image.altText?.trim() && <span style={{ color: '#DC2626' }}>*</span>}
            </label>
            <input
              type="text"
              id={`altText-${image.id}`}
              value={image.altText}
              onChange={(e) => onChange({ altText: e.target.value })}
              className="form-input"
              placeholder="Describe this image for accessibility"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`caption-${image.id}`} className="form-label">
              Caption (optional)
            </label>
            <input
              type="text"
              id={`caption-${image.id}`}
              value={image.caption}
              onChange={(e) => onChange({ caption: e.target.value })}
              className="form-input"
              placeholder="Add a caption for this image"
            />
          </div>
        </div>
      )}
    </div>
  )
}
