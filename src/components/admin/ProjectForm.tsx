'use client'

import { useState, useEffect, useId, useCallback } from 'react'
import { FeaturedImagePicker, type FeaturedImage } from './FeaturedImagePicker'
import { GalleryImageGrid, type GalleryImage } from './GalleryImageGrid'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'

// ============================================================================
// Types
// ============================================================================

/**
 * Data structure for project form submission
 */
export interface ProjectFormData {
  title: string
  year?: string
  venue?: string
  role?: string
  description?: string
  isFeatured?: boolean
  featuredImageId?: string | null
  galleryImageIds?: string[]
}

/**
 * Props for the ProjectForm component
 */
export interface ProjectFormProps {
  /** Portfolio ID for image picker */
  portfolioId: string
  /** Existing project data for edit mode (omit for create mode) */
  project?: {
    id: string
    title: string
    year: string | null
    venue: string | null
    role: string | null
    description: string | null
    isFeatured: boolean
    featuredImage: {
      id: string
      url: string
      thumbnailUrl: string
      altText: string | null
    } | null
    galleryImages?: Array<{
      id: string
      url: string
      thumbnailUrl: string
      altText: string | null
    }>
  }
  /** Category ID this project belongs to */
  categoryId: string
  /** Called when form is submitted with valid data */
  onSubmit: (data: ProjectFormData) => Promise<void>
  /** Called when user cancels the form */
  onCancel: () => void
  /** Whether the form is currently submitting */
  isSubmitting: boolean
  /** Initial form mode - defaults to 'quick-add' for create, 'full' for edit */
  initialMode?: 'quick-add' | 'full'
}

// ============================================================================
// Constants
// ============================================================================

const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000

// ============================================================================
// Validation Functions
// ============================================================================

const validateTitle = (value: string): string | undefined => {
  if (!value.trim()) {
    return 'Project title is required'
  }
  if (value.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`
  }
  return undefined
}

const validateYear = (value: string): string | undefined => {
  if (value && value.length > 50) {
    return 'Year must be 50 characters or less'
  }
  return undefined
}

const validateVenue = (value: string): string | undefined => {
  if (value && value.length > 200) {
    return 'Venue must be 200 characters or less'
  }
  return undefined
}

const validateRole = (value: string): string | undefined => {
  if (value && value.length > 200) {
    return 'Role must be 200 characters or less'
  }
  return undefined
}

const validateDescription = (value: string): string | undefined => {
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
  }
  return undefined
}

// ============================================================================
// ProjectForm Component
// ============================================================================

/**
 * ProjectForm Component
 * 
 * A form for creating and editing portfolio projects.
 * Supports two modes:
 * - Quick-add: Just title and featured image (for fast creation)
 * - Full: All fields including gallery images
 * 
 * @example
 * ```tsx
 * // Create mode (quick-add)
 * <ProjectForm
 *   categoryId="category-123"
 *   onSubmit={handleCreate}
 *   onCancel={() => setShowForm(false)}
 *   isSubmitting={isLoading}
 * />
 * 
 * // Edit mode (full)
 * <ProjectForm
 *   project={existingProject}
 *   categoryId="category-123"
 *   onSubmit={handleUpdate}
 *   onCancel={() => setShowForm(false)}
 *   isSubmitting={isLoading}
 * />
 * ```
 */
export function ProjectForm({
  portfolioId,
  project,
  categoryId,
  onSubmit,
  onCancel,
  isSubmitting,
  initialMode,
}: ProjectFormProps) {
  // Generate unique IDs for form fields (accessibility)
  const titleId = useId()
  const yearId = useId()
  const venueId = useId()
  const roleId = useId()
  const descriptionId = useId()
  const featuredId = useId()
  const titleErrorId = useId()
  const yearErrorId = useId()
  const venueErrorId = useId()
  const roleErrorId = useId()
  const descriptionErrorId = useId()
  const featuredImageErrorId = useId()

  // Determine if we're in edit mode
  const isEditMode = Boolean(project)

  // Determine form mode (quick-add for create, full for edit by default)
  const defaultMode = initialMode ?? (isEditMode ? 'full' : 'quick-add')
  const [mode, setMode] = useState<'quick-add' | 'full'>(defaultMode)

  // Form state
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [venue, setVenue] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<FeaturedImage | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])

  // UI state
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [errors, setErrors] = useState<{
    title?: string
    year?: string
    venue?: string
    role?: string
    description?: string
    featuredImage?: string
  }>({})
  const [touched, setTouched] = useState<{
    title?: boolean
    year?: boolean
    venue?: boolean
    role?: boolean
    description?: boolean
    featuredImage?: boolean
  }>({})

  // Reset form state when project prop changes
  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setYear(project.year || '')
      setVenue(project.venue || '')
      setRole(project.role || '')
      setDescription(project.description || '')
      setIsFeatured(project.isFeatured)
      setFeaturedImage(project.featuredImage)
      setGalleryImages(project.galleryImages || [])
      setMode('full')
    } else {
      setTitle('')
      setYear('')
      setVenue('')
      setRole('')
      setDescription('')
      setIsFeatured(false)
      setFeaturedImage(null)
      setGalleryImages([])
      setMode(initialMode ?? 'quick-add')
    }
    setErrors({})
    setTouched({})
  }, [project, initialMode])

  // ============================================================================
  // Field Handlers
  // ============================================================================

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    if (touched.title) {
      setErrors((prev) => ({ ...prev, title: validateTitle(value) }))
    }
  }

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }))
    setErrors((prev) => ({ ...prev, title: validateTitle(title) }))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setYear(value)
    if (touched.year) {
      setErrors((prev) => ({ ...prev, year: validateYear(value) }))
    }
  }

  const handleYearBlur = () => {
    setTouched((prev) => ({ ...prev, year: true }))
    setErrors((prev) => ({ ...prev, year: validateYear(year) }))
  }

  const handleVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setVenue(value)
    if (touched.venue) {
      setErrors((prev) => ({ ...prev, venue: validateVenue(value) }))
    }
  }

  const handleVenueBlur = () => {
    setTouched((prev) => ({ ...prev, venue: true }))
    setErrors((prev) => ({ ...prev, venue: validateVenue(venue) }))
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRole(value)
    if (touched.role) {
      setErrors((prev) => ({ ...prev, role: validateRole(value) }))
    }
  }

  const handleRoleBlur = () => {
    setTouched((prev) => ({ ...prev, role: true }))
    setErrors((prev) => ({ ...prev, role: validateRole(role) }))
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDescription(value)
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }))
    }
  }

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }))
    setErrors((prev) => ({ ...prev, description: validateDescription(description) }))
  }

  // ============================================================================
  // Image Handlers
  // ============================================================================

  const handleFeaturedImageSelect = useCallback((image: FeaturedImage | null) => {
    setFeaturedImage(image)
    if (image) {
      setErrors((prev) => ({ ...prev, featuredImage: undefined }))
    }
  }, [])

  /**
   * Handle featured image upload
   * Calls POST /api/upload with FormData
   */
  const handleFeaturedImageUpload = useCallback(async (file: File): Promise<FeaturedImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('categoryId', categoryId)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    return {
      id: result.id,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      altText: result.altText || file.name,
    }
  }, [categoryId])

  /**
   * Handle adding images to gallery from ImagePicker
   */
  const handleGalleryImagesSelect = useCallback((image: SiteImage) => {
    // Check if image already exists in gallery
    if (galleryImages.some((img) => img.id === image.id)) {
      setShowGalleryPicker(false)
      return
    }

    setGalleryImages((prev) => [
      ...prev,
      {
        id: image.id,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        altText: image.meta.alt || image.filename,
      },
    ])
    setShowGalleryPicker(false)
  }, [galleryImages])

  const handleGalleryImageRemove = useCallback((imageId: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== imageId))
  }, [])

  const handleGalleryImageReorder = useCallback((orderedIds: string[]) => {
    setGalleryImages((prev) => {
      const imageMap = new Map(prev.map((img) => [img.id, img]))
      return orderedIds.map((id) => imageMap.get(id)!).filter(Boolean)
    })
  }, [])

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const titleError = validateTitle(title)
    const yearError = validateYear(year)
    const venueError = validateVenue(venue)
    const roleError = validateRole(role)
    const descriptionError = validateDescription(description)
    
    // In quick-add mode, featured image is required
    const featuredImageError = 
      mode === 'quick-add' && !featuredImage
        ? 'Featured image is required'
        : undefined

    setErrors({
      title: titleError,
      year: yearError,
      venue: venueError,
      role: roleError,
      description: descriptionError,
      featuredImage: featuredImageError,
    })
    setTouched({
      title: true,
      year: true,
      venue: true,
      role: true,
      description: true,
      featuredImage: true,
    })

    // Stop if there are errors
    if (titleError || yearError || venueError || roleError || descriptionError || featuredImageError) {
      return
    }

    // Build form data
    const formData: ProjectFormData = {
      title: title.trim(),
      year: year.trim() || undefined,
      venue: venue.trim() || undefined,
      role: role.trim() || undefined,
      description: description.trim() || undefined,
      isFeatured,
      featuredImageId: featuredImage?.id ?? null,
      galleryImageIds: galleryImages.map((img) => img.id),
    }

    await onSubmit(formData)
  }

  // ============================================================================
  // Computed Values
  // ============================================================================

  const descriptionLength = description.length
  const isDescriptionNearLimit = descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <form onSubmit={handleSubmit} className="project-form" noValidate>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor={titleId} className="form-label">
            Project Title <span className="required">*</span>
          </label>
          <input
            id={titleId}
            type="text"
            className={`form-input ${errors.title ? 'form-input-error' : ''}`}
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="e.g., Hamlet, The Crown, Nike Campaign"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? titleErrorId : undefined}
            autoFocus
          />
          {errors.title && (
            <p id={titleErrorId} className="form-error" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        {/* Featured Image Field */}
        <div className="form-group">
          <label id={featuredId} className="form-label">
            Featured Image {mode === 'quick-add' && <span className="required">*</span>}
          </label>
          <FeaturedImagePicker
            portfolioId={portfolioId}
            currentImage={featuredImage}
            onImageSelect={handleFeaturedImageSelect}
            onUpload={handleFeaturedImageUpload}
            disabled={isSubmitting}
            required={mode === 'quick-add'}
            error={errors.featuredImage}
          />
        </div>

        {/* Quick-Add Mode: Expand Button */}
        {mode === 'quick-add' && (
          <button
            type="button"
            className="expand-btn"
            onClick={() => setMode('full')}
            disabled={isSubmitting}
          >
            <ExpandIcon />
            <span>Add More Details</span>
          </button>
        )}

        {/* Full Mode: Additional Fields */}
        {mode === 'full' && (
          <>
            {/* Year Field */}
            <div className="form-group">
              <label htmlFor={yearId} className="form-label">
                Year
              </label>
              <input
                id={yearId}
                type="text"
                className={`form-input ${errors.year ? 'form-input-error' : ''}`}
                value={year}
                onChange={handleYearChange}
                onBlur={handleYearBlur}
                placeholder="e.g., 2024 or 2023-2024"
                disabled={isSubmitting}
                aria-invalid={errors.year ? 'true' : 'false'}
                aria-describedby={errors.year ? yearErrorId : undefined}
              />
              {errors.year ? (
                <p id={yearErrorId} className="form-error" role="alert">
                  {errors.year}
                </p>
              ) : (
                <p className="form-hint">Optional - can be a range like "2023-2024"</p>
              )}
            </div>

            {/* Venue Field */}
            <div className="form-group">
              <label htmlFor={venueId} className="form-label">
                Venue
              </label>
              <input
                id={venueId}
                type="text"
                className={`form-input ${errors.venue ? 'form-input-error' : ''}`}
                value={venue}
                onChange={handleVenueChange}
                onBlur={handleVenueBlur}
                placeholder="e.g., National Theatre, Netflix, BBC"
                disabled={isSubmitting}
                aria-invalid={errors.venue ? 'true' : 'false'}
                aria-describedby={errors.venue ? venueErrorId : undefined}
              />
              {errors.venue && (
                <p id={venueErrorId} className="form-error" role="alert">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor={roleId} className="form-label">
                Role
              </label>
              <input
                id={roleId}
                type="text"
                className={`form-input ${errors.role ? 'form-input-error' : ''}`}
                value={role}
                onChange={handleRoleChange}
                onBlur={handleRoleBlur}
                placeholder="e.g., Director, Lead Actor, Producer"
                disabled={isSubmitting}
                aria-invalid={errors.role ? 'true' : 'false'}
                aria-describedby={errors.role ? roleErrorId : undefined}
              />
              {errors.role && (
                <p id={roleErrorId} className="form-error" role="alert">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor={descriptionId} className="form-label">
                Description
              </label>
              <textarea
                id={descriptionId}
                className={`form-textarea ${errors.description ? 'form-input-error' : ''}`}
                value={description}
                onChange={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                placeholder="Optional description of the project..."
                disabled={isSubmitting}
                rows={4}
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? descriptionErrorId : undefined}
              />
              <div className="form-field-footer">
                {errors.description ? (
                  <p id={descriptionErrorId} className="form-error" role="alert">
                    {errors.description}
                  </p>
                ) : (
                  <span className="form-hint">Optional</span>
                )}
                <span
                  className={`char-count ${isDescriptionNearLimit ? 'char-count-warning' : ''}`}
                  aria-live="polite"
                >
                  {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span className="checkbox-text">Feature on homepage</span>
              </label>
              <p className="form-hint">Featured projects appear in the portfolio highlights section</p>
            </div>

            {/* Gallery Images Field */}
            <div className="form-group">
              <label className="form-label">Gallery Images</label>
              <GalleryImageGrid
                images={galleryImages}
                onAdd={() => setShowGalleryPicker(true)}
                onRemove={handleGalleryImageRemove}
                onReorder={handleGalleryImageReorder}
                maxImages={20}
                disabled={isSubmitting}
              />
              <p className="form-hint">Additional images for the project gallery (optional)</p>
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Project'
            )}
          </button>
        </div>
      </form>

      {/* Gallery Image Picker Modal */}
      <ImagePicker
        isOpen={showGalleryPicker}
        portfolioId={portfolioId}
        onSelect={handleGalleryImagesSelect}
        onCancel={() => setShowGalleryPicker(false)}
        title="Add Gallery Image"
      />

      <style jsx>{`
        .project-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .required {
          color: var(--admin-error, #dc2626);
        }

        .form-input {
          font-size: 16px; /* Prevents iOS auto-zoom on focus */
        }

        .form-textarea {
          font-size: 16px; /* Prevents iOS auto-zoom on focus */
        }

        .form-input-error {
          border-color: var(--admin-error, #dc2626);
        }

        .form-input-error:focus {
          border-color: var(--admin-error, #dc2626);
          box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
        }

        .form-field-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          margin-top: var(--space-1);
        }

        .char-count {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .char-count-warning {
          color: var(--admin-error, #dc2626);
        }

        /* Expand Button */
        .expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          transition: border-color var(--transition-fast),
                      color var(--transition-fast),
                      background-color var(--transition-fast);
        }

        .expand-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background: var(--color-surface);
        }

        .expand-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .expand-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Checkbox */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: var(--color-accent);
          cursor: pointer;
        }

        .checkbox-input:disabled {
          cursor: not-allowed;
        }

        .checkbox-text {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text);
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-border);
        }

        /* Button Spinner */
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile Styles */
        @media (max-width: 767px) {
          .project-form {
            gap: var(--space-5);
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }

          .expand-btn {
            min-height: 48px;
          }

          .checkbox-label {
            min-height: 44px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .expand-btn,
          .btn-spinner {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  )
}

// ============================================================================
// Icons
// ============================================================================

function ExpandIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
