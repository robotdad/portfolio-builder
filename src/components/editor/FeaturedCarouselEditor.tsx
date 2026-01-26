'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { FeaturedCarouselSection, FeaturedWorkItem } from '@/lib/content-schema'
import { createFeaturedWorkItem } from '@/lib/content-schema'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'

interface FeaturedCarouselEditorProps {
  section: FeaturedCarouselSection
  portfolioId: string
  onChange: (section: FeaturedCarouselSection) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

export function FeaturedCarouselEditor({
  section,
  portfolioId,
  onChange,
  onDelete,
  onSaveRequest,
}: FeaturedCarouselEditorProps) {
  const [showMultiPicker, setShowMultiPicker] = useState(false)

  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, heading: e.target.value })
  }

  const handleAutoRotateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, autoRotate: e.target.checked })
  }

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1000) {
      onChange({ ...section, autoRotateInterval: value })
    }
  }

  const handleAddItem = () => {
    const newItem = createFeaturedWorkItem()
    onChange({
      ...section,
      items: [...section.items, newItem],
    })
  }

  const handleItemChange = (index: number, updatedItem: FeaturedWorkItem) => {
    const newItems = [...section.items]
    newItems[index] = updatedItem
    onChange({ ...section, items: newItems })
  }

  const handleItemDelete = (index: number) => {
    const newItems = section.items.filter((_, i) => i !== index)
    onChange({ ...section, items: newItems })
  }

  const handleMultiSelect = useCallback((images: SiteImage[]) => {
    const newItems = images.map(image => {
      const item = createFeaturedWorkItem()
      return {
        ...item,
        imageId: image.id,
        imageUrl: image.url,
        title: image.meta.alt || image.filename.replace(/\.[^/.]+$/, ''),
      }
    })
    
    onChange({
      ...section,
      items: [...section.items, ...newItems],
    })
    
    setShowMultiPicker(false)
  }, [section, onChange])

  return (
    <div className="section-editor section-editor-featured-carousel">
      <div className="section-editor-header">
        <span className="section-type-label">Featured Carousel</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <div className="section-editor-content">
        {/* Section Heading */}
        <div className="form-group">
          <label htmlFor={`carousel-heading-${section.id}`} className="form-label">
            Section Heading
          </label>
          <input
            type="text"
            id={`carousel-heading-${section.id}`}
            value={section.heading}
            onChange={handleHeadingChange}
            className="form-input"
            placeholder="Featured Work"
          />
        </div>

        {/* Auto-rotate Settings */}
        <div className="form-group">
          <div className="form-checkbox-row">
            <input
              type="checkbox"
              id={`carousel-autorotate-${section.id}`}
              checked={section.autoRotate}
              onChange={handleAutoRotateChange}
              className="form-checkbox"
            />
            <label htmlFor={`carousel-autorotate-${section.id}`} className="form-checkbox-label">
              Auto-rotate slides
            </label>
          </div>
        </div>

        {section.autoRotate && (
          <div className="form-group">
            <label htmlFor={`carousel-interval-${section.id}`} className="form-label">
              Rotation Interval (milliseconds)
            </label>
            <input
              type="number"
              id={`carousel-interval-${section.id}`}
              value={section.autoRotateInterval}
              onChange={handleIntervalChange}
              className="form-input"
              min={1000}
              step={500}
              placeholder="5000"
            />
            <p className="form-hint">
              Minimum 1000ms (1 second). Default is 5000ms (5 seconds).
            </p>
          </div>
        )}

        {/* Carousel Items */}
        <div className="featured-grid-items">
          <label className="form-label">Carousel Items</label>
          
          {section.items.length === 0 ? (
            <div className="featured-grid-empty">
              <p>No items yet. Add your first carousel slide.</p>
            </div>
          ) : (
            <div className="featured-grid-list">
              {section.items.map((item, index) => (
                <CarouselItemEditor
                  key={item.id}
                  item={item}
                  portfolioId={portfolioId}
                  onChange={(updated) => handleItemChange(index, updated)}
                  onDelete={() => handleItemDelete(index)}
                  onSaveRequest={onSaveRequest}
                />
              ))}
            </div>
          )}

          <div className="featured-grid-button-group">
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary featured-grid-add-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Carousel Item
            </button>
            <button
              type="button"
              onClick={() => setShowMultiPicker(true)}
              className="btn btn-secondary featured-grid-add-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Add Multiple from Gallery
            </button>
          </div>
        </div>
      </div>

      <ImagePicker
        isOpen={showMultiPicker}
        portfolioId={portfolioId}
        onMultiSelect={handleMultiSelect}
        onCancel={() => setShowMultiPicker(false)}
        title="Select Multiple Images"
        multiSelect={true}
      />
    </div>
  )
}

// Sub-component for editing individual carousel items (reuses FeaturedWorkItem pattern)
interface CarouselItemEditorProps {
  item: FeaturedWorkItem
  portfolioId: string
  onChange: (item: FeaturedWorkItem) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

function CarouselItemEditor({
  item,
  portfolioId,
  onChange,
  onDelete,
  onSaveRequest,
}: CarouselItemEditorProps) {
  const [optimisticImageUrl, setOptimisticImageUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(!item.imageUrl) // Start expanded if no image
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track previous image for undo
  const previousImageRef = useRef<string | undefined>(item.imageUrl ?? undefined)

  // Use the optimistic upload hook
  const { uploadFile, isUploading, progress, error, retry } = useImageUpload({
    portfolioId,
    context: 'featured',
    currentImageUrl: item.imageUrl ?? undefined,
    onOptimisticUpdate: (previewUrl) => {
      previousImageRef.current = item.imageUrl ?? undefined
      setOptimisticImageUrl(previewUrl)
    },
    onSuccess: (asset) => {
      onChange({
        ...item,
        imageId: asset.id,
        imageUrl: asset.url,
      })
      setOptimisticImageUrl(null)
      onSaveRequest?.()
    },
    onUndo: (previousUrl) => {
      setOptimisticImageUrl(null)
      onChange({
        ...item,
        imageId: previousUrl ? item.imageId : null,
        imageUrl: previousUrl ?? null,
      })
    },
    onError: () => {
      setOptimisticImageUrl(null)
    },
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, title: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, category: e.target.value })
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, link: e.target.value })
  }

  // File selection handler - auto-uploads
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    uploadFile(file)
  }, [uploadFile])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      uploadFile(file)
    }
  }, [uploadFile])

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    if (item.imageId) {
      try {
        await fetch(`/api/admin/upload/${item.imageId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
    
    setOptimisticImageUrl(null)
    onChange({
      ...item,
      imageId: null,
      imageUrl: null,
    })
  }

  const handleGallerySelect = useCallback((image: SiteImage) => {
    onChange({
      ...item,
      imageId: image.id,
      imageUrl: image.url,
    })
    setShowGalleryPicker(false)
  }, [item, onChange])

  const displayImage = optimisticImageUrl || item.imageUrl

  return (
    <div className="featured-item-editor">
      <div className="featured-item-header">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="featured-item-toggle"
          aria-expanded={isExpanded}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="featured-item-preview-title">
            {item.title || 'Untitled slide'}
          </span>
          {displayImage && (
            <div className="featured-item-preview-thumb" style={{ position: 'relative', width: 32, height: 32 }}>
              <Image
                src={displayImage}
                alt=""
                fill
                unoptimized
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="featured-item-delete"
          aria-label="Delete item"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="featured-item-content">
          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
              onChange={handleFileSelect}
              className="sr-only"
              aria-label="Select image file"
            />

            {displayImage ? (
              <div 
                className={`featured-item-image-preview ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Image src={displayImage} alt={item.title || 'Preview'} fill unoptimized style={{ objectFit: 'cover' }} />
                
                {/* Upload progress overlay */}
                {isUploading && (
                  <div className="featured-item-upload-overlay">
                    <ProgressRing progress={progress} size={48} />
                  </div>
                )}
                
                {!isUploading && (
                  <div className="featured-item-image-actions">
                    <button
                      type="button"
                      onClick={handleDropzoneClick}
                      className="featured-item-image-change touch-btn"
                      aria-label="Change image"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGalleryPicker(true)}
                      className="featured-item-image-change touch-btn"
                      aria-label="Choose from gallery"
                    >
                      Gallery
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="featured-item-image-remove touch-btn"
                      aria-label="Remove image"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="featured-item-upload-area">
                <button
                  type="button"
                  onClick={handleDropzoneClick}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`featured-item-upload-btn ${isDragOver ? 'drag-over' : ''}`}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ProgressRing progress={progress} size={40} />
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span>Add image</span>
                      <span className="featured-item-upload-hint">Click or drag to upload</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGalleryPicker(true)}
                  disabled={isUploading}
                >
                  Choose from Gallery
                </button>
              </div>
            )}

            {error && (
              <div className="form-error-with-action" style={{ marginTop: 'var(--space-2)' }}>
                <p className="form-error">{error}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="form-error-action"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor={`item-title-${item.id}`} className="form-label">
              Title
            </label>
            <input
              type="text"
              id={`item-title-${item.id}`}
              value={item.title}
              onChange={handleTitleChange}
              className="form-input"
              placeholder="Project name"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor={`item-category-${item.id}`} className="form-label">
              Category
            </label>
            <input
              type="text"
              id={`item-category-${item.id}`}
              value={item.category}
              onChange={handleCategoryChange}
              className="form-input"
              placeholder="e.g., Illustration, Branding"
            />
          </div>

          {/* Link */}
          <div className="form-group">
            <label htmlFor={`item-link-${item.id}`} className="form-label">
              Link (optional)
            </label>
            <input
              type="text"
              id={`item-link-${item.id}`}
              value={item.link}
              onChange={handleLinkChange}
              className="form-input"
              placeholder="/projects/project-name or https://..."
            />
            <p className="form-hint">
              Link to project page or external site
            </p>
          </div>
        </div>
      )}

      <ImagePicker
        isOpen={showGalleryPicker}
        portfolioId={portfolioId}
        selectedId={item.imageId || undefined}
        onSelect={handleGallerySelect}
        onCancel={() => setShowGalleryPicker(false)}
        title="Choose Carousel Image"
      />
    </div>
  )
}
