'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { FeaturedGridSection, FeaturedWorkItem } from '@/lib/content-schema'
import { createFeaturedWorkItem } from '@/lib/content-schema'

interface FeaturedGridEditorProps {
  section: FeaturedGridSection
  portfolioId: string
  onChange: (section: FeaturedGridSection) => void
  onDelete: () => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function FeaturedGridEditor({ 
  section, 
  portfolioId, 
  onChange, 
  onDelete 
}: FeaturedGridEditorProps) {
  const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, heading: e.target.value })
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

  return (
    <div className="section-editor section-editor-featured-grid">
      <div className="section-editor-header">
        <span className="section-type-label">Featured Grid</span>
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
          <label htmlFor={`grid-heading-${section.id}`} className="form-label">
            Section Heading
          </label>
          <input
            type="text"
            id={`grid-heading-${section.id}`}
            value={section.heading}
            onChange={handleHeadingChange}
            className="form-input"
            placeholder="Featured Work"
          />
        </div>

        {/* Grid Items */}
        <div className="featured-grid-items">
          <label className="form-label">Work Items</label>
          
          {section.items.length === 0 ? (
            <div className="featured-grid-empty">
              <p>No items yet. Add your first featured work.</p>
            </div>
          ) : (
            <div className="featured-grid-list">
              {section.items.map((item, index) => (
                <FeaturedItemEditor
                  key={item.id}
                  item={item}
                  portfolioId={portfolioId}
                  onChange={(updated) => handleItemChange(index, updated)}
                  onDelete={() => handleItemDelete(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddItem}
            className="btn btn-secondary featured-grid-add-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Work Item
          </button>
        </div>
      </div>
    </div>
  )
}

// Sub-component for editing individual featured work items
interface FeaturedItemEditorProps {
  item: FeaturedWorkItem
  portfolioId: string
  onChange: (item: FeaturedWorkItem) => void
  onDelete: () => void
}

function FeaturedItemEditor({ 
  item, 
  portfolioId, 
  onChange, 
  onDelete 
}: FeaturedItemEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(!item.imageUrl) // Start expanded if no image
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, title: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, category: e.target.value })
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...item, link: e.target.value })
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, or WebP.')
      return
    }

    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = useCallback(async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('portfolioId', portfolioId)
      formData.append('altText', item.title || 'Featured work')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      setProgress(100)
      const asset = await response.json()
      
      onChange({
        ...item,
        imageId: asset.id,
        imageUrl: asset.url,
      })

      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }, [portfolioId, item, onChange])

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    if (item.imageId) {
      try {
        await fetch(`/api/upload/${item.imageId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
    
    onChange({
      ...item,
      imageId: null,
      imageUrl: null,
    })
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = preview || item.imageUrl

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
            {item.title || 'Untitled work'}
          </span>
          {displayImage && (
            <img 
              src={displayImage} 
              alt="" 
              className="featured-item-preview-thumb"
            />
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
              <div className="featured-item-image-preview">
                <img src={displayImage} alt={item.title || 'Preview'} />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="featured-item-image-remove touch-btn"
                  aria-label="Remove image"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDropzoneClick}
                className="featured-item-upload-btn"
                disabled={uploading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>Add image</span>
              </button>
            )}

            {uploading && (
              <div className="image-upload-progress">
                <div
                  className="image-upload-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {preview && !uploading && (
              <button
                type="button"
                onClick={handleUpload}
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-2)', width: '100%' }}
              >
                Upload Image
              </button>
            )}

            {error && (
              <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>
                {error}
              </p>
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
    </div>
  )
}
