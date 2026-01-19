'use client'

import { useRef, useState, useEffect, useCallback, useId } from 'react'

// ============================================================================
// Types
// ============================================================================

interface MultiImageUploadProps {
  /** Array of File objects for uploaded images */
  images: File[]
  /** Array of preview URLs (object URLs) corresponding to images */
  previews: string[]
  /** Callback when images change - receives updated images and previews */
  onImagesChange: (images: File[], previews: string[]) => void
  /** Maximum number of files allowed (default: 10) */
  maxFiles?: number
  /** Maximum file size in MB (default: 10) */
  maxSizeMB?: number
  /** Disabled state */
  disabled?: boolean
}

interface FileError {
  fileName: string
  message: string
}

// ============================================================================
// Constants
// ============================================================================

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const DEFAULT_MAX_FILES = 10
const DEFAULT_MAX_SIZE_MB = 10

// User-friendly error messages matching the design spec
const ERROR_MESSAGES = {
  tooLarge: 'This photo is too large. Try a photo under 10MB.',
  invalidType: "Can't upload this file type. Please use JPG, PNG, or WEBP photos.",
  tooManyFiles: 'You can add up to 10 photos per project.',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect if user is on a mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Validate a single file
 */
function validateFile(file: File, maxSizeMB: number): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return ERROR_MESSAGES.invalidType
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return ERROR_MESSAGES.tooLarge
  }

  return null
}

// ============================================================================
// Component
// ============================================================================

export function MultiImageUpload({
  images,
  previews,
  onImagesChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
}: MultiImageUploadProps) {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // IDs for accessibility
  const sectionId = useId()
  const uploadButtonId = useId()
  const liveRegionId = useId()

  // State
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<FileError[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  // Announce changes to screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message)
    // Clear announcement after a delay so repeated messages are announced
    setTimeout(() => setAnnouncement(''), 100)
  }, [])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Process and validate files, then update state
   */
  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList)
      const newErrors: FileError[] = []
      const validFiles: File[] = []
      const newPreviews: string[] = []

      // Check total file count first
      const totalFiles = images.length + filesArray.length
      if (totalFiles > maxFiles) {
        setErrors([
          {
            fileName: '',
            message: ERROR_MESSAGES.tooManyFiles,
          },
        ])
        announce(ERROR_MESSAGES.tooManyFiles)
        return
      }

      // Validate and process each file
      filesArray.forEach((file: File) => {
        const error = validateFile(file, maxSizeMB)
        if (error) {
          newErrors.push({ fileName: file.name, message: error })
        } else {
          validFiles.push(file)
          newPreviews.push(URL.createObjectURL(file))
        }
      })

      // Update errors
      setErrors(newErrors)

      // Update images if we have valid files
      if (validFiles.length > 0) {
        const updatedImages = [...images, ...validFiles]
        const updatedPreviews = [...previews, ...newPreviews]
        onImagesChange(updatedImages, updatedPreviews)

        // Announce success
        const count = validFiles.length
        announce(
          `${count} ${count === 1 ? 'photo' : 'photos'} added. ${updatedImages.length} total.`
        )
      }

      // Announce errors if any
      if (newErrors.length > 0) {
        announce(`${newErrors.length} ${newErrors.length === 1 ? 'file' : 'files'} could not be added.`)
      }
    },
    [images, previews, maxFiles, maxSizeMB, onImagesChange, announce]
  )

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFiles(files)
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [processFiles]
  )

  /**
   * Handle button click to open file picker
   */
  const handleUploadClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  /**
   * Remove an image by index
   */
  const handleRemoveImage = useCallback(
    (index: number) => {
      if (disabled) return

      const updatedImages = images.filter((_, i) => i !== index)
      const updatedPreviews = previews.filter((_, i) => i !== index)

      // Revoke the removed preview URL
      if (previews[index].startsWith('blob:')) {
        URL.revokeObjectURL(previews[index])
      }

      onImagesChange(updatedImages, updatedPreviews)
      announce(`Photo ${index + 1} removed. ${updatedImages.length} ${updatedImages.length === 1 ? 'photo' : 'photos'} remaining.`)
    },
    [images, previews, disabled, onImagesChange, announce]
  )

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Only set dragging to false if we're leaving the drop zone itself
      if (e.currentTarget === dropZoneRef.current) {
        setIsDragging(false)
      }
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    },
    []
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        processFiles(files)
      }
    },
    [disabled, processFiles]
  )

  /**
   * Handle keyboard navigation for remove buttons
   */
  const handleRemoveKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleRemoveImage(index)
      }
    },
    [handleRemoveImage]
  )

  // Check if we have images
  const hasImages = images.length > 0
  const canAddMore = images.length < maxFiles

  return (
    <div className="multi-image-upload">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title-row">
          <h2 className="section-title">Project Photos</h2>
          <span className="optional-badge">Optional</span>
        </div>
        <p className="section-hint">
          Add a few photos to showcase your work. You can always add more later.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="file-input-hidden"
        aria-label="Choose photos to upload"
        capture={isMobile ? 'environment' : undefined}
      />

      {/* Drop zone / Upload area */}
      {(!hasImages || canAddMore) && (
        <div
          ref={dropZoneRef}
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={hasImages ? 'Add more photos' : 'Add photos'}
          aria-describedby={`${sectionId}-hint`}
          onClick={handleUploadClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleUploadClick()
            }
          }}
        >
          <svg
            className="upload-icon"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 16V8M12 8L9 11M12 8L15 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="drop-zone-text">
            <p className="drop-zone-primary">
              {hasImages ? 'Add More Photos' : 'Add Photos'}
            </p>
            {!isMobile && (
              <p className="drop-zone-secondary">
                {hasImages
                  ? 'Click to choose photos or drag them here'
                  : 'Click to choose photos or drag them here'}
              </p>
            )}
            {isMobile && (
              <p className="drop-zone-secondary">
                Choose from your gallery or take a new photo
              </p>
            )}
          </div>
        </div>
      )}

      {/* Image Grid Preview */}
      {hasImages && (
        <div className="image-grid" role="list" aria-label="Uploaded photos">
          {images.map((image, index) => (
            <div key={`${image.name}-${index}`} className="image-item" role="listitem">
              <div className="image-preview-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={`Photo ${index + 1}: ${image.name}`}
                  className="image-preview"
                />
                <span className="image-number" aria-hidden="true">
                  {index + 1}
                </span>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveImage(index)}
                  onKeyDown={(e) => handleRemoveKeyDown(e, index)}
                  disabled={disabled}
                  aria-label={`Remove photo ${index + 1}`}
                  title={`Remove photo ${index + 1}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="error-list" role="alert">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error.fileName && <strong>{error.fileName}: </strong>}
              {error.message}
            </p>
          ))}
        </div>
      )}

      {/* ARIA live region for screen reader announcements */}
      <div
        id={liveRegionId}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      <style jsx>{`
        .multi-image-upload {
          display: flex;
          flex-direction: column;
          gap: var(--space-4, 16px);
        }

        /* Section Header */
        .section-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 8px);
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
        }

        .section-title {
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-text-primary, #1f2937);
          margin: 0;
        }

        .optional-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px var(--space-2, 8px);
          font-size: var(--font-size-xs, 12px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text-muted, #6b7280);
          background: var(--color-surface, #f9fafb);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-full, 9999px);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .section-hint {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
          margin: 0;
          line-height: var(--leading-relaxed, 1.625);
        }

        /* Hidden file input */
        .file-input-hidden {
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

        /* Drop zone / Upload area */
        .drop-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3, 12px);
          padding: var(--space-8, 32px) var(--space-4, 16px);
          min-height: 160px;
          border: 2px dashed var(--color-border, #d1d5db);
          border-radius: var(--radius-lg, 8px);
          background: var(--color-background, #ffffff);
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .drop-zone:hover:not(.disabled) {
          border-color: var(--color-accent, #2563eb);
          background: var(--color-accent-light, #eff6ff);
        }

        .drop-zone:focus-visible:not(.disabled) {
          border-color: var(--color-accent, #2563eb);
          box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
        }

        .drop-zone.dragging {
          border-color: var(--color-accent, #2563eb);
          background: var(--color-accent-light, #eff6ff);
          border-style: solid;
        }

        .drop-zone.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-icon {
          color: var(--color-text-muted, #6b7280);
          flex-shrink: 0;
        }

        .drop-zone:hover:not(.disabled) .upload-icon {
          color: var(--color-accent, #2563eb);
        }

        .drop-zone-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1, 4px);
          text-align: center;
        }

        .drop-zone-primary {
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-medium, 500);
          color: var(--color-text, #111827);
          margin: 0;
        }

        .drop-zone-secondary {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
          margin: 0;
        }

        /* Image Grid */
        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3, 12px);
          margin-top: var(--space-2, 8px);
        }

        @media (min-width: 640px) {
          .image-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-4, 16px);
          }
        }

        @media (min-width: 768px) {
          .image-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .image-item {
          position: relative;
          aspect-ratio: 1;
        }

        .image-preview-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: var(--radius-md, 6px);
          overflow: hidden;
          background: var(--color-surface, #f9fafb);
        }

        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Image number badge */
        .image-number {
          position: absolute;
          top: var(--space-2, 8px);
          left: var(--space-2, 8px);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          font-size: var(--font-size-xs, 12px);
          font-weight: var(--font-weight-semibold, 600);
          border-radius: var(--radius-full, 9999px);
          pointer-events: none;
        }

        /* Remove button */
        .remove-button {
          position: absolute;
          top: var(--space-2, 8px);
          right: var(--space-2, 8px);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-height: 44px; /* Touch target */
          min-width: 44px; /* Touch target */
          padding: 8px;
          background: rgba(220, 38, 38, 0.9);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-full, 9999px);
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .image-preview-wrapper:hover .remove-button,
        .remove-button:focus-visible {
          opacity: 1;
        }

        .remove-button:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.1);
        }

        .remove-button:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }

        .remove-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Touch devices - always show remove button */
        @media (hover: none) {
          .remove-button {
            opacity: 1;
          }
        }

        /* Error messages */
        .error-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 8px);
          padding: var(--space-3, 12px);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md, 6px);
        }

        .error-message {
          font-size: var(--font-size-sm, 14px);
          color: #dc2626;
          margin: 0;
          line-height: var(--leading-relaxed, 1.625);
        }

        .error-message strong {
          font-weight: var(--font-weight-semibold, 600);
        }

        /* Screen reader only */
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

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .drop-zone,
          .remove-button,
          .upload-icon {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
