'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { RichTextEditor } from './RichTextEditor'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ProgressRing } from '@/components/shared/ProgressRing'
import type { HeroSection } from '@/lib/content-schema'

interface HeroSectionEditorProps {
  section: HeroSection
  portfolioId: string
  onChange: (section: HeroSection) => void
  onDelete: () => void
  onSaveRequest?: () => void
}

export function HeroSectionEditor({
  section,
  portfolioId,
  onChange,
  onDelete,
  onSaveRequest,
}: HeroSectionEditorProps) {
  const [optimisticImageUrl, setOptimisticImageUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track the previous image URL for undo
  const previousImageRef = useRef<string | undefined>(section.profileImageUrl ?? undefined)

  // Use the optimistic upload hook
  const { uploadFile, isUploading, progress, error, retry } = useImageUpload({
    portfolioId,
    context: 'profile',
    currentImageUrl: section.profileImageUrl ?? undefined,
    onOptimisticUpdate: (previewUrl) => {
      // Store current image as previous before showing preview
      previousImageRef.current = section.profileImageUrl ?? undefined
      setOptimisticImageUrl(previewUrl)
    },
    onSuccess: (asset) => {
      // Update section with server asset
      onChange({
        ...section,
        profileImageId: asset.id,
        profileImageUrl: asset.url,
      })
      setOptimisticImageUrl(null)
      // Trigger auto-save
      onSaveRequest?.()
    },
    onUndo: (previousUrl) => {
      // Revert to previous image
      setOptimisticImageUrl(null)
      onChange({
        ...section,
        profileImageId: previousUrl ? section.profileImageId : null,
        profileImageUrl: previousUrl ?? null,
      })
    },
    onError: (_errorMsg) => {
      // Revert optimistic update on error
      setOptimisticImageUrl(null)
    },
  })

  // Text field handlers (keep existing)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, name: e.target.value })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, title: e.target.value })
  }

  const handleBioChange = (html: string) => {
    onChange({ ...section, bio: html })
  }

  const handleResumeLinkToggle = () => {
    onChange({ ...section, showResumeLink: !section.showResumeLink })
  }

  const handleResumeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...section, resumeUrl: e.target.value })
  }

  // File selection handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Clear input so same file can be selected again
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
    if (section.profileImageId) {
      try {
        await fetch(`/api/upload/${section.profileImageId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
    
    setOptimisticImageUrl(null)
    onChange({
      ...section,
      profileImageId: null,
      profileImageUrl: null,
    })
  }

  // Display the optimistic preview if available, otherwise the saved image
  const displayImage = optimisticImageUrl || section.profileImageUrl

  return (
    <div className="section-editor section-editor-hero">
      <div className="section-editor-header">
        <span className="section-type-label">Hero</span>
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
        {/* Profile Image */}
        <div className="hero-profile-section">
          <label className="form-label">Profile Photo (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            capture="user"
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Select profile image"
          />

          {displayImage ? (
            <div 
              className={`hero-profile-preview ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Image src={displayImage} alt="Profile preview" fill unoptimized style={{ objectFit: 'cover' }} />
              
              {/* Upload progress overlay */}
              {isUploading && (
                <div className="hero-profile-upload-overlay">
                  <ProgressRing progress={progress} size={64} />
                </div>
              )}
              
              {!isUploading && (
                <div className="hero-profile-actions">
                  <button
                    type="button"
                    onClick={handleDropzoneClick}
                    className="hero-profile-change touch-btn"
                    aria-label="Change profile image"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="hero-profile-remove touch-btn"
                    aria-label="Remove profile image"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDropzoneClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`hero-profile-upload ${isDragOver ? 'drag-over' : ''}`}
              disabled={isUploading}
            >
              {isUploading ? (
                <ProgressRing progress={progress} size={48} />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                  <span>Add photo</span>
                  <span className="hero-profile-upload-hint">Click or drag to upload</span>
                </>
              )}
            </button>
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

        {/* Name */}
        <div className="form-group">
          <label htmlFor={`hero-name-${section.id}`} className="form-label">
            Name
          </label>
          <input
            type="text"
            id={`hero-name-${section.id}`}
            value={section.name}
            onChange={handleNameChange}
            className="form-input"
            placeholder="Your name"
          />
        </div>

        {/* Title */}
        <div className="form-group">
          <label htmlFor={`hero-title-${section.id}`} className="form-label">
            Title
          </label>
          <input
            type="text"
            id={`hero-title-${section.id}`}
            value={section.title}
            onChange={handleTitleChange}
            className="form-input"
            placeholder="e.g., Graphic Designer & Illustrator"
          />
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="form-label">Bio</label>
          <RichTextEditor
            value={section.bio}
            onChange={handleBioChange}
            placeholder="Tell visitors about yourself..."
          />
        </div>

        {/* Resume Link */}
        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={section.showResumeLink}
              onChange={handleResumeLinkToggle}
              className="form-checkbox"
            />
            <span>Show resume/CV link</span>
          </label>
          
          {section.showResumeLink && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor={`hero-resume-${section.id}`} className="form-label">
                Resume URL
              </label>
              <input
                type="url"
                id={`hero-resume-${section.id}`}
                value={section.resumeUrl}
                onChange={handleResumeUrlChange}
                className="form-input"
                placeholder="https://..."
              />
              <p className="form-hint">
                Link to your resume PDF or LinkedIn profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
