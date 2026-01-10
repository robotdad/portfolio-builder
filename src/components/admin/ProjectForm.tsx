'use client'

import { useState, useEffect, useId, useCallback } from 'react'
import { FeaturedImagePicker, type FeaturedImage } from './FeaturedImagePicker'
import { GalleryImageGrid, type GalleryImage } from './GalleryImageGrid'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'
import { 
  ProjectBasicInfo, 
  validateTitle, 
  validateYear, 
  validateVenue, 
  validateRole,
  MAX_TITLE_LENGTH,
  type BasicInfoValues,
  type BasicInfoErrors,
  type BasicInfoTouched,
} from './ProjectBasicInfo'
import { ProjectDescription, validateDescription, MAX_DESCRIPTION_LENGTH } from './ProjectDescription'
import { ProjectMetadata } from './ProjectMetadata'
import { ProjectFormActions } from './ProjectFormActions'

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
  const featuredId = useId()

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

  // Unified handlers for basic info fields
  const handleBasicInfoChange = useCallback(
    (field: keyof BasicInfoValues, value: string) => {
      switch (field) {
        case 'title':
          setTitle(value)
          if (touched.title) {
            setErrors((prev) => ({ ...prev, title: validateTitle(value) }))
          }
          break
        case 'year':
          setYear(value)
          if (touched.year) {
            setErrors((prev) => ({ ...prev, year: validateYear(value) }))
          }
          break
        case 'venue':
          setVenue(value)
          if (touched.venue) {
            setErrors((prev) => ({ ...prev, venue: validateVenue(value) }))
          }
          break
        case 'role':
          setRole(value)
          if (touched.role) {
            setErrors((prev) => ({ ...prev, role: validateRole(value) }))
          }
          break
      }
    },
    [touched]
  )

  const handleBasicInfoBlur = useCallback(
    (field: keyof BasicInfoValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      switch (field) {
        case 'title':
          setErrors((prev) => ({ ...prev, title: validateTitle(title) }))
          break
        case 'year':
          setErrors((prev) => ({ ...prev, year: validateYear(year) }))
          break
        case 'venue':
          setErrors((prev) => ({ ...prev, venue: validateVenue(venue) }))
          break
        case 'role':
          setErrors((prev) => ({ ...prev, role: validateRole(role) }))
          break
      }
    },
    [title, year, venue, role]
  )

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value)
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }))
    }
  }, [touched.description])

  const handleDescriptionBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, description: true }))
    setErrors((prev) => ({ ...prev, description: validateDescription(description) }))
  }, [description])

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
  // Render
  // ============================================================================

  return (
    <>
      <form onSubmit={handleSubmit} className="project-form" noValidate>
        {/* Title field - always visible */}
        <ProjectBasicInfo
          values={{ title, year, venue, role }}
          errors={errors}
          touched={touched}
          onChange={handleBasicInfoChange}
          onBlur={handleBasicInfoBlur}
          titleOnly={mode === 'quick-add'}
        />

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
            {/* Description Field */}
            <ProjectDescription
              value={description}
              error={errors.description}
              touched={touched.description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
            />

            {/* Featured Checkbox */}
            <ProjectMetadata
              isFeatured={isFeatured}
              onFeaturedChange={setIsFeatured}
            />

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
        <ProjectFormActions
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          onCancel={onCancel}
        />
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

        /* Mobile Styles */
        @media (max-width: 767px) {
          .project-form {
            gap: var(--space-5);
          }

          .expand-btn {
            min-height: 48px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .expand-btn {
            transition: none;
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
