'use client'

import { useState, useRef, useCallback, useId } from 'react'
import Image from 'next/image'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'
import styles from './FeaturedImagePicker.module.css'
import { CameraIcon, GalleryIcon } from '@/components/shared/icons'

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

  /** Validate a file before upload */
  const validateFile = useCallback((file: File): string | null => {
    const isValidType = ALLOWED_TYPES.includes(file.type) || 
      ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!isValidType) return 'Invalid file format. Please use JPEG, PNG, WebP, or HEIC.'
    if (file.size > MAX_FILE_SIZE) return 'File too large. Maximum size is 10MB.'
    return null
  }, [])

  /** Handle file upload */
  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setInternalError(validationError)
      return
    }

    setUploading(true)
    setInternalError(null)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev >= 90 ? prev : prev + 10)
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
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [validateFile, onUpload, onImageSelect])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleDropzoneClick = useCallback(() => {
    if (!isDisabled) fileInputRef.current?.click()
  }, [isDisabled])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDisabled) setIsDragOver(true)
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
    if (file) handleUpload(file)
  }, [isDisabled, handleUpload])

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

  const handleRemove = useCallback(() => {
    onImageSelect(null)
    setInternalError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [onImageSelect])

  const getDropzoneClass = () => {
    if (isDisabled) return styles.dropzoneDisabled
    if (isDragOver) return styles.dropzoneDragOver
    return styles.dropzone
  }

  return (
    <>
      <div className={styles.featuredImagePicker}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          capture="environment"
          onChange={handleFileChange}
          className={styles.srOnly}
          aria-label="Select image file"
          disabled={isDisabled}
        />

        {currentImage ? (
          <div className={styles.imageSelected}>
            <div className={styles.imagePreviewContainer}>
              <Image
                src={currentImage.thumbnailUrl || currentImage.url}
                alt={currentImage.altText || 'Featured image preview'}
                className={styles.imagePreview}
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
              {uploading && (
                <div className={styles.uploadOverlay} aria-live="polite">
                  <div className={styles.uploadSpinner} aria-hidden="true" />
                  <span className={styles.uploadText}>Uploading...</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className={styles.removeBtn}
              onClick={handleRemove}
              disabled={isDisabled}
              aria-label="Remove featured image"
            >
              Remove
            </button>

            <div className={styles.actionButtons}>
              <button
                type="button"
                className={`btn btn-primary ${styles.actionBtn}`}
                onClick={handleDropzoneClick}
                disabled={isDisabled}
              >
                <CameraIcon />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${styles.actionBtn}`}
                onClick={() => setShowImagePicker(true)}
                disabled={isDisabled}
              >
                <GalleryIcon />
                <span>Choose from Gallery</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div
              id={dropzoneId}
              className={getDropzoneClass()}
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
                <div className={styles.uploadingState} aria-live="polite">
                  <div className={styles.uploadSpinner} aria-hidden="true" />
                  <span className={styles.uploadText}>Uploading...</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <CameraIcon size={48} className={styles.dropzoneIcon} />
                  <span className={styles.dropzoneText}>Tap to add featured image</span>
                  <span className={styles.dropzoneHint}>JPEG, PNG, WebP up to 10MB</span>
                </>
              )}
            </div>

            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <button
              type="button"
              className={`btn btn-secondary ${styles.galleryBtn}`}
              onClick={() => setShowImagePicker(true)}
              disabled={isDisabled}
            >
              <GalleryIcon />
              <span>Choose from Gallery</span>
            </button>
          </div>
        )}

        {error && (
          <p id={`${dropzoneId}-error`} className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>

      <ImagePicker
        isOpen={showImagePicker}
        portfolioId={portfolioId}
        selectedId={currentImage?.id}
        onSelect={handleGallerySelect}
        onCancel={() => setShowImagePicker(false)}
        title="Choose Featured Image"
      />
    </>
  )
}
