'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RichTextEditor } from './RichTextEditor'
import type { HeroSection } from '@/lib/content-schema'

interface HeroSectionEditorProps {
  section: HeroSection
  portfolioId: string
  onChange: (section: HeroSection) => void
  onDelete: () => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function HeroSectionEditor({ 
  section, 
  portfolioId, 
  onChange, 
  onDelete 
}: HeroSectionEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Profile image upload handlers
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
      formData.append('altText', `Profile photo of ${section.name || 'portfolio owner'}`)

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
        ...section,
        profileImageId: asset.id,
        profileImageUrl: asset.url,
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
  }, [portfolioId, section, onChange])

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
    
    onChange({
      ...section,
      profileImageId: null,
      profileImageUrl: null,
    })
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = preview || section.profileImageUrl

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
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Select profile image"
          />

          {displayImage ? (
            <div className="hero-profile-preview">
              <img src={displayImage} alt="Profile preview" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="hero-profile-remove touch-btn"
                aria-label="Remove profile image"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDropzoneClick}
              className="hero-profile-upload"
              disabled={uploading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <span>Add photo</span>
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
              Upload Photo
            </button>
          )}

          {error && (
            <p className="form-error" style={{ marginTop: 'var(--space-2)' }}>
              {error}
            </p>
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
