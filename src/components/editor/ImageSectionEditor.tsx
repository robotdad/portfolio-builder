'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { adminFetch } from '@/lib/api/client'
import type { ImageSection as ImageSectionType } from '@/lib/content-schema'

interface ImageSectionEditorProps {
  section: ImageSectionType
  portfolioId: string
  onChange: (section: ImageSectionType) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageSectionEditor({
  section,
  portfolioId,
  onChange,
  onDelete,
  onSaveRequest
}: ImageSectionEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Process and upload a file - extracted for reuse by both click and drag-drop
  const processFile = useCallback(async (file: File) => {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, or WebP.')
      return
    }

    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    // Show preview immediately from local file
    const reader = new FileReader()
    reader.onload = (readEvent) => {
      setPreview(readEvent.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Start upload immediately in background
    setUploading(true)
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
      formData.append('altText', section.altText || '')

      const response = await adminFetch('/api/admin/upload', {
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
      
      // Update section with uploaded image
      onChange({
        ...section,
        imageId: asset.id,
        imageUrl: asset.url,
        altText: asset.altText || section.altText,
      })

      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Auto-save after successful upload
      if (onSaveRequest) {
        onSaveRequest()
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }, [portfolioId, section, onChange, onSaveRequest])

  // Handle file selection from input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  // Drag-and-drop event handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }, [processFile])

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = async () => {
    if (section.imageId) {
      try {
        await fetch(`/api/admin/upload/${section.imageId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
    
    onChange({
      ...section,
      imageId: null,
      imageUrl: null,
    })
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...section,
      altText: e.target.value,
    })
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...section,
      caption: e.target.value,
    })
  }

  // Save alt text to server when it changes and image exists
  const handleAltTextBlur = useCallback(async () => {
    if (!section.imageId) return

    try {
      await fetch(`/api/admin/upload/${section.imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: section.altText }),
      })
    } catch (err) {
      console.error('Failed to save alt text:', err)
    }
  }, [section.imageId, section.altText])

  const displayImage = preview || section.imageUrl

  return (
    <div className="section-editor section-editor-image">
      <div className="section-editor-header">
        <span className="section-type-label">Image</span>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label="Select image file"
        />

        {displayImage ? (
          <div className="image-upload-preview">
            <Image src={displayImage} alt={section.altText || 'Preview'} fill unoptimized style={{ objectFit: 'cover' }} />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="image-upload-remove touch-btn"
              aria-label="Remove image"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDropzoneClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`${isMobile ? 'mobile-image-upload-btn' : 'image-upload-dropzone'} ${isDragging ? 'dragging' : ''}`}
            disabled={uploading}
          >
            {isMobile ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>Tap to add photo</span>
              </>
            ) : (
              <>
                <span className="image-upload-dropzone-icon">{isDragging ? '↓' : '+'}</span>
                <span className="image-upload-dropzone-text">
                  {isDragging ? 'Drop image here' : 'Drag & drop or click to select'}
                </span>
                <span className="image-upload-dropzone-hint">JPEG, PNG, or WebP up to 10MB</span>
              </>
            )}
          </button>
        )}

        {(preview || section.imageUrl) && (
          <>
            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
              <label htmlFor={`altText-${section.id}`} className="form-label">
                Alt Text {!section.altText?.trim() && <span style={{ color: '#DC2626' }}>*</span>}
              </label>
              <input
                type="text"
                id={`altText-${section.id}`}
                value={section.altText}
                onChange={handleAltTextChange}
                onBlur={handleAltTextBlur}
                className="form-input"
                placeholder="Describe this image for accessibility"
              />
            </div>

            <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor={`caption-${section.id}`} className="form-label">
                Caption (optional)
              </label>
              <input
                type="text"
                id={`caption-${section.id}`}
                value={section.caption}
                onChange={handleCaptionChange}
                className="form-input"
                placeholder="Add a caption for this image"
              />
            </div>
          </>
        )}

        {uploading && (
          <div className="image-upload-progress">
            <div
              className="image-upload-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {error && (
          <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>
            {error}
          </p>
        )}
      </div>

      <style jsx>{`
        .image-upload-dropzone.dragging {
          border-color: var(--color-accent, #3b82f6);
          background-color: var(--color-accent-light, rgba(59, 130, 246, 0.1));
          transform: scale(1.02);
        }
        
        .image-upload-dropzone.dragging .image-upload-dropzone-icon {
          color: var(--color-accent, #3b82f6);
        }
      `}</style>
    </div>
  )
}
