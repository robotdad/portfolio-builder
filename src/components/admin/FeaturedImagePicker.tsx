'use client'

import { useState, useRef, useCallback, useId } from 'react'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'

/**
 * Image data structure for featured images
 */
export interface FeaturedImage {
  id: string
  url: string
  thumbnailUrl: string
  altText: string | null
}

/**
 * Props for the FeaturedImagePicker component
 */
export interface FeaturedImagePickerProps {
  /** Portfolio ID for image picker */
  portfolioId: string
  /** Currently selected featured image */
  currentImage: FeaturedImage | null
  /** Called when an image is selected or removed */
  onImageSelect: (image: FeaturedImage | null) => void
  /** Called when a file is uploaded - returns the new image data */
  onUpload: (file: File) => Promise<FeaturedImage>
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Whether an image is required */
  required?: boolean
  /** Error message to display */
  error?: string
}

// Allowed image types (including HEIC for iOS)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * FeaturedImagePicker Component
 * 
 * A unified component for selecting a featured image via upload or from gallery.
 * Supports drag-drop, file upload, and gallery selection.
 * 
 * @example
 * ```tsx
 * <FeaturedImagePicker
 *   currentImage={project.featuredImage}
 *   onImageSelect={(image) => setFeaturedImage(image)}
 *   onUpload={async (file) => {
 *     const result = await uploadImage(file)
 *     return result
 *   }}
 *   required
 * />
 * ```
 */
export function FeaturedImagePicker({
  portfolioId,
  currentImage,
  onImageSelect,
  onUpload,
  disabled = false,
  required = false,
  error: externalError,
}: FeaturedImagePickerProps) {
  const dropzoneId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const error = externalError || internalError
  const isDisabled = disabled || uploading

  /**
   * Validate a file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const isValidType = ALLOWED_TYPES.includes(file.type) || 
      ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      return 'Invalid file format. Please use JPEG, PNG, WebP, or HEIC.'
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }

    return null
  }, [])

  /**
   * Handle file upload
   */
  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setInternalError(validationError)
      return
    }

    setUploading(true)
    setInternalError(null)
    setUploadProgress(0)

    // Simulate progress for better UX (actual upload doesn't provide progress)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 150)

    try {
      const result = await onUpload(file)
      clearInterval(progressInterval)
      setUploadProgress(100)
      onImageSelect(result)
    } catch (err) {
      clearInterval(progressInterval)
      setInternalError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [validateFile, onUpload, onImageSelect])

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  /**
   * Handle dropzone click to open file picker
   */
  const handleDropzoneClick = useCallback(() => {
    if (!isDisabled) {
      fileInputRef.current?.click()
    }
  }, [isDisabled])

  /**
   * Handle drag events for drop zone
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDisabled) {
      setIsDragOver(true)
    }
  }, [isDisabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (isDisabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [isDisabled, handleUpload])

  /**
   * Handle image selection from gallery
   */
  const handleGallerySelect = useCallback((image: SiteImage) => {
    onImageSelect({
      id: image.id,
      url: image.url,
      thumbnailUrl: image.thumbnailUrl,
      altText: image.meta.alt || image.filename,
    })
    setShowImagePicker(false)
    setInternalError(null)
  }, [onImageSelect])

  /**
   * Handle image removal
   */
  const handleRemove = useCallback(() => {
    onImageSelect(null)
    setInternalError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageSelect])

  return (
    <>
      <div className="featured-image-picker">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Select image file"
          disabled={isDisabled}
        />

        {currentImage ? (
          /* With Image State */
          <div className="image-selected">
            <div className="image-preview-container">
              <img
                src={currentImage.thumbnailUrl || currentImage.url}
                alt={currentImage.altText || 'Featured image preview'}
                className="image-preview"
              />
              {uploading && (
                <div className="upload-overlay" aria-live="polite">
                  <div className="upload-spinner" aria-hidden="true" />
                  <span className="upload-text">Uploading...</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="remove-btn"
              onClick={handleRemove}
              disabled={isDisabled}
              aria-label="Remove featured image"
            >
              Remove
            </button>

            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-primary action-btn"
                onClick={handleDropzoneClick}
                disabled={isDisabled}
              >
                <CameraIcon />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary action-btn"
                onClick={() => setShowImagePicker(true)}
                disabled={isDisabled}
              >
                <GalleryIcon />
                <span>Choose from Gallery</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="empty-state">
            <div
              id={dropzoneId}
              className={`dropzone ${isDragOver ? 'drag-over' : ''} ${isDisabled ? 'disabled' : ''}`}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              onClick={handleDropzoneClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleDropzoneClick()
                }
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-label={`Add featured image${required ? ' (required)' : ''}`}
              aria-describedby={error ? `${dropzoneId}-error` : undefined}
            >
              {uploading ? (
                <div className="uploading-state" aria-live="polite">
                  <div className="upload-spinner" aria-hidden="true" />
                  <span className="upload-text">Uploading...</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <CameraIcon className="dropzone-icon" />
                  <span className="dropzone-text">Tap to add featured image</span>
                  <span className="dropzone-hint">JPEG, PNG, WebP up to 10MB</span>
                </>
              )}
            </div>

            <div className="divider">
              <span className="divider-text">or</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary gallery-btn"
              onClick={() => setShowImagePicker(true)}
              disabled={isDisabled}
            >
              <GalleryIcon />
              <span>Choose from Gallery</span>
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p id={`${dropzoneId}-error`} className="error-message" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        portfolioId={portfolioId}
        selectedId={currentImage?.id}
        onSelect={handleGallerySelect}
        onCancel={() => setShowImagePicker(false)}
        title="Choose Featured Image"
      />

      <style jsx>{`
        .featured-image-picker {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        /* Hidden but accessible */
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

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          min-height: 160px;
          padding: var(--space-6);
          background: var(--color-surface);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: border-color var(--transition-fast),
                      background-color var(--transition-fast);
        }

        .dropzone:hover:not(.disabled),
        .dropzone:focus-visible:not(.disabled) {
          border-color: var(--color-accent);
          background: var(--color-background);
        }

        .dropzone:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .dropzone.drag-over {
          border-color: var(--color-accent);
          background: rgba(59, 130, 246, 0.05);
        }

        .dropzone.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dropzone-icon {
          width: 48px;
          height: 48px;
          color: var(--color-text-muted);
        }

        .dropzone-text {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .dropzone-hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--color-border);
        }

        .divider-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          text-transform: lowercase;
        }

        /* Gallery Button */
        .gallery-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          min-height: 48px;
          width: 100%;
        }

        /* With Image State */
        .image-selected {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .image-preview-container {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-surface);
        }

        .image-preview {
          display: block;
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: var(--radius-lg);
        }

        .remove-btn {
          align-self: flex-start;
          padding: var(--space-1) var(--space-2);
          background: none;
          border: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .remove-btn:hover:not(:disabled) {
          color: var(--admin-error, #dc2626);
        }

        .remove-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-buttons {
          display: flex;
          gap: var(--space-4);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          flex: 1;
          min-height: 44px;
        }

        /* Upload Progress Overlay */
        .upload-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          background: rgba(0, 0, 0, 0.6);
          border-radius: var(--radius-lg);
        }

        .uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
        }

        .upload-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .upload-text {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: white;
        }

        .progress-bar {
          width: 120px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: white;
          border-radius: 2px;
          transition: width 0.15s ease-out;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Error Message */
        .error-message {
          margin: 0;
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--admin-error, #dc2626);
          background: rgba(220, 38, 38, 0.1);
          border-radius: var(--radius-md);
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .dropzone {
            min-height: 140px;
            padding: var(--space-5);
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .remove-btn {
            min-height: 44px;
            padding: var(--space-2) var(--space-3);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .dropzone,
          .remove-btn {
            transition: none;
          }

          .upload-spinner {
            animation: none;
          }

          .progress-fill {
            transition: none;
          }
        }
      `}</style>
    </>
  )
}

/**
 * Camera icon SVG component
 */
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

/**
 * Gallery icon SVG component
 */
function GalleryIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
