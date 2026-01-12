'use client'

import { useState, useId } from 'react'
import Image from 'next/image'
import { ImagePicker } from '@/components/shared/ImagePicker'
import type { SiteImage } from '@/lib/types/image-picker'

/**
 * Data structure for category form submission
 */
export interface CategoryFormData {
  name: string
  description?: string
  featuredImageId?: string | null
}

/**
 * Props for the CategoryForm component
 */
export interface CategoryFormProps {
  /** Portfolio ID for image picker */
  portfolioId: string
  /** Existing category data for edit mode (omit for create mode) */
  category?: {
    id: string
    name: string
    description: string | null
    featuredImage: {
      id: string
      url: string
      thumbnailUrl: string
      altText: string
    } | null
  }
  /** Called when form is submitted with valid data */
  onSubmit: (data: CategoryFormData) => Promise<void>
  /** Called when user cancels the form */
  onCancel: () => void
  /** Whether the form is currently submitting */
  isSubmitting: boolean
}

const MAX_DESCRIPTION_LENGTH = 500

/**
 * CategoryForm Component
 * 
 * A form for creating and editing portfolio categories.
 * Supports name, description, and optional featured image selection.
 * 
 * @example
 * ```tsx
 * // Create mode
 * <CategoryForm
 *   onSubmit={handleCreate}
 *   onCancel={() => setShowForm(false)}
 *   isSubmitting={isLoading}
 * />
 * 
 * // Edit mode
 * <CategoryForm
 *   category={existingCategory}
 *   onSubmit={handleUpdate}
 *   onCancel={() => setShowForm(false)}
 *   isSubmitting={isLoading}
 * />
 * ```
 */
export function CategoryForm({
  portfolioId,
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  // Generate unique IDs for form fields (accessibility)
  const nameId = useId()
  const descriptionId = useId()
  const nameErrorId = useId()
  const descriptionErrorId = useId()

  // Form state - initialized from category prop (use key prop on parent to reset)
  const [name, setName] = useState(() => category?.name ?? '')
  const [description, setDescription] = useState(() => category?.description ?? '')
  const [selectedImage, setSelectedImage] = useState<{
    id: string
    url: string
    thumbnailUrl: string
    altText: string
  } | null>(() => category?.featuredImage ?? null)

  // UI state
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({})

  // Determine if we're in edit mode
  const isEditMode = Boolean(category)

  // Validate form fields
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Category name is required'
    }
    return undefined
  }

  const validateDescription = (value: string): string | undefined => {
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
    }
    return undefined
  }

  // Handle field changes with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (touched.name) {
      setErrors((prev) => ({ ...prev, name: validateName(value) }))
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDescription(value)
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateDescription(value) }))
    }
  }

  // Handle field blur for validation
  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }))
    setErrors((prev) => ({ ...prev, name: validateName(name) }))
  }

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }))
    setErrors((prev) => ({ ...prev, description: validateDescription(description) }))
  }

  // Handle image selection from ImagePicker
  const handleImageSelect = (image: SiteImage) => {
    setSelectedImage({
      id: image.id,
      url: image.url,
      thumbnailUrl: image.thumbnailUrl,
      altText: image.meta.alt || image.filename,
    })
    setShowImagePicker(false)
  }

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const nameError = validateName(name)
    const descriptionError = validateDescription(description)

    setErrors({ name: nameError, description: descriptionError })
    setTouched({ name: true, description: true })

    // Stop if there are errors
    if (nameError || descriptionError) {
      return
    }

    // Build form data
    const formData: CategoryFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      featuredImageId: selectedImage?.id ?? null,
    }

    await onSubmit(formData)
  }

  const descriptionLength = description.length
  const isDescriptionNearLimit = descriptionLength > MAX_DESCRIPTION_LENGTH * 0.8

  return (
    <>
      <form onSubmit={handleSubmit} className="category-form" noValidate data-testid="category-form">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor={nameId} className="form-label">
            Category Name <span className="required">*</span>
          </label>
          <input
            id={nameId}
            type="text"
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            placeholder="e.g., Theatre, Film, Commercial"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? nameErrorId : undefined}
            autoFocus
            data-testid="category-form-name-input"
          />
          {errors.name && (
            <p id={nameErrorId} className="form-error" role="alert">
              {errors.name}
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
            placeholder="Optional description for this category..."
            disabled={isSubmitting}
            rows={3}
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? descriptionErrorId : undefined}
            data-testid="category-form-description-input"
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

        {/* Featured Image Field */}
        <div className="form-group">
          <label className="form-label">Featured Image</label>
          
          {selectedImage ? (
            <div className="image-preview">
              <Image
                src={selectedImage.thumbnailUrl || selectedImage.url}
                alt={selectedImage.altText}
                className="image-preview-img"
                width={80}
                height={80}
                unoptimized
                style={{ objectFit: 'cover' }}
              />
              <div className="image-preview-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowImagePicker(true)}
                  disabled={isSubmitting}
                >
                  Change Image
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm btn-danger-text"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="image-select-btn"
              onClick={() => setShowImagePicker(true)}
              disabled={isSubmitting}
              data-testid="category-form-image-picker"
            >
              <svg
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
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>Choose Image</span>
            </button>
          )}
          <p className="form-hint">Optional featured image for the category</p>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="category-form-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            data-testid="category-form-submit-btn"
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Category'
            )}
          </button>
        </div>
      </form>

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        portfolioId={portfolioId}
        selectedId={selectedImage?.id}
        onSelect={handleImageSelect}
        onCancel={() => setShowImagePicker(false)}
        title="Choose Featured Image"
      />

      <style jsx>{`
        .category-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .required {
          color: var(--admin-error, #dc2626);
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

        /* Image Selection Button */
        .image-select-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          width: 100%;
          min-height: 120px;
          padding: var(--space-6);
          background: var(--color-surface);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          transition: border-color var(--transition-fast),
                      background-color var(--transition-fast),
                      color var(--transition-fast);
        }

        .image-select-btn:hover:not(:disabled) {
          border-color: var(--color-accent);
          background: var(--color-background);
          color: var(--color-accent);
        }

        .image-select-btn:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .image-select-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Image Preview */
        .image-preview {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .image-preview-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .image-preview-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        /* Button variants */
        .btn-sm {
          min-height: 36px;
          padding: var(--space-2) var(--space-4);
          font-size: var(--font-size-sm);
        }

        .btn-danger-text {
          color: var(--admin-error, #dc2626);
        }

        .btn-danger-text:hover:not(:disabled) {
          background: rgb(220 38 38 / 0.1);
          border-color: var(--admin-error, #dc2626);
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
          .category-form {
            gap: var(--space-5);
          }

          .image-preview {
            flex-direction: column;
            align-items: stretch;
          }

          .image-preview-img {
            width: 100%;
            height: auto;
            max-height: 200px;
          }

          .image-preview-actions {
            flex-direction: row;
          }

          .image-preview-actions .btn {
            flex: 1;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .image-select-btn,
          .btn-spinner {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  )
}
