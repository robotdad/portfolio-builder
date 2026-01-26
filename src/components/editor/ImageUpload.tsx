'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { adminFetch } from '@/lib/api/client'

interface Asset {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  caption?: string | null
}

interface ImageUploadProps {
  portfolioId: string
  currentImage?: Asset | null
  onUploadComplete: (asset: Asset) => void
  onRemove?: () => void
}

// Include HEIC/HEIF for iOS photo library support
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageUpload({
  portfolioId,
  currentImage,
  onUploadComplete,
  onRemove,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [altText, setAltText] = useState(currentImage?.altText || '')
  const [savingAltText, setSavingAltText] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile device for optimized UX
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update altText when currentImage changes
  useEffect(() => {
    if (currentImage?.altText !== undefined) {
      setAltText(currentImage.altText)
    }
  }, [currentImage?.altText])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please use JPEG, PNG, or WebP.')
      return
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    // Create local preview
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

    // Simulate progress for better UX (actual upload doesn't provide progress)
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
      formData.append('altText', altText)

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
      
      // Reset state
      setPreview(null)
      setAltText('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadComplete(asset)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }, [portfolioId, altText, onUploadComplete])

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    setAltText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  // Save alt text for existing images on blur
  const handleAltTextBlur = useCallback(async () => {
    if (!currentImage || preview) return // Only save for existing images, not new uploads
    if (altText === currentImage.altText) return // No change

    setSavingAltText(true)
    setError(null)

    try {
      const response = await fetch(`/api/upload/${currentImage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to save alt text')
      }

      const updatedAsset = await response.json()
      onUploadComplete(updatedAsset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save alt text')
    } finally {
      setSavingAltText(false)
    }
  }, [currentImage, preview, altText, onUploadComplete])

  // Show current image if exists and no new preview
  const displayImage = preview || currentImage?.url

  return (
    <div className="image-upload">
      {/* 
        Mobile-optimized file input:
        - capture="environment" allows camera on mobile
        - accept includes HEIC for iOS photos
        - Multiple accept formats for broad compatibility
      */}
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
          <Image src={displayImage} alt={altText || 'Preview'} fill unoptimized style={{ objectFit: 'cover' }} />
          {(preview || currentImage) && (
            <button
              type="button"
              onClick={handleRemove}
              className="image-upload-remove touch-btn"
              aria-label="Remove image"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleDropzoneClick}
          className={isMobile ? 'mobile-image-upload-btn' : 'image-upload-dropzone'}
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
              <span className="image-upload-dropzone-icon">+</span>
              <span className="image-upload-dropzone-text">
                Click to select an image
              </span>
              <span className="image-upload-dropzone-hint">
                JPEG, PNG, or WebP up to 10MB
              </span>
            </>
          )}
        </button>
      )}

      {(preview || currentImage) && (
        <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
          <label htmlFor="altText" className="form-label">
            Alt Text {!altText?.trim() && <span style={{ color: 'var(--color-error)' }}>*</span>}
          </label>
          <input
            type="text"
            id="altText"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleAltTextBlur}
            className="form-input"
            placeholder="Describe this image for accessibility"
            disabled={savingAltText}
          />
          <p className="form-hint">
            {savingAltText ? 'Saving...' : 'Helps screen readers describe the image to visitors.'}
          </p>
        </div>
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

      {preview && !uploading && (
        <button
          type="button"
          onClick={handleUpload}
          className="btn btn-primary"
          style={{ marginTop: 'var(--space-4)', width: '100%' }}
        >
          Upload Image
        </button>
      )}
    </div>
  )
}
