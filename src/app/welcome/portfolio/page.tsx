'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/onboarding/StepLayout'
import { useOnboardingState } from '@/hooks/useOnboardingState'

/**
 * Generates a URL-safe slug from a portfolio name.
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .replace(/^-|-$/g, '')         // Trim hyphens
}

/**
 * Validates a slug for URL safety.
 * Must contain only lowercase letters, numbers, and hyphens.
 * Cannot start or end with a hyphen.
 */
const validateSlug = (slug: string): string | null => {
  if (!slug) {
    return 'Portfolio URL is required'
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return 'Only lowercase letters, numbers, and hyphens allowed'
  }
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return 'Cannot start or end with a hyphen'
  }
  return null
}

/**
 * Validates portfolio name.
 */
const validateName = (name: string): string | null => {
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Portfolio name is required'
  }
  if (trimmed.length > 100) {
    return 'Portfolio name must be 100 characters or less'
  }
  return null
}

interface FormState {
  name: string
  slug: string
}

interface TouchedState {
  name: boolean
  slug: boolean
}

interface ErrorsState {
  name: string | null
  slug: string | null
}

/**
 * Chevron icon for collapsible section
 */
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Step 1 of onboarding: Portfolio name and URL slug.
 * User provides a portfolio name and can customize the auto-generated URL slug.
 * Optional "About You" section for professional title, bio, and profile photo.
 */
export default function PortfolioPage() {
  const router = useRouter()
  const { state, updateState, completeStep } = useOnboardingState()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Portfolio existence check - redirect if already onboarded
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio')
        const result = await res.json()
        // API returns { success: true, data: portfolio } - unwrap it
        if (result.success && result.data?.id) {
          router.push('/admin')
          return
        }
      } catch {
        // If check fails, allow onboarding to proceed
      }
      setIsChecking(false)
    }
    checkPortfolio()
  }, [router])

  // Form state - initialize from persisted state using lazy initialization
  const [form, setForm] = useState<FormState>(() => ({
    name: state.portfolioName || '',
    slug: state.portfolioSlug || '',
  }))

  // Optional fields state - initialize from persisted state
  const [title, setTitle] = useState(() => state.portfolioTitle || '')
  const [bio, setBio] = useState(() => state.portfolioBio || '')
  const [photoPreview, setPhotoPreview] = useState<string>(() => state.profilePhotoPreview || '')
  const [photoFile, setPhotoFile] = useState<File | null>(() => state.profilePhotoFile || null)

  // Collapsible section state - auto-expand if any optional fields have data
  const [isExpanded, setIsExpanded] = useState(() => 
    !!(state.portfolioTitle || state.portfolioBio || state.profilePhotoPreview)
  )

  // Track if slug has been manually edited - true if persisted slug exists
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() => !!state.portfolioSlug)

  // Track which fields have been touched (for validation display)
  const [touched, setTouched] = useState<TouchedState>({
    name: false,
    slug: false,
  })

  // Validation errors
  const [errors, setErrors] = useState<ErrorsState>({
    name: null,
    slug: null,
  })

  // Handle name change - auto-generate slug if not manually edited
  const handleNameChange = useCallback((value: string) => {
    setForm(prev => {
      const newSlug = slugManuallyEdited ? prev.slug : generateSlug(value)
      return {
        name: value,
        slug: newSlug,
      }
    })
  }, [slugManuallyEdited])

  // Handle slug change - mark as manually edited
  const handleSlugChange = useCallback((value: string) => {
    // Sanitize input: lowercase and remove invalid characters as user types
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlugManuallyEdited(true)
    setForm(prev => ({
      ...prev,
      slug: sanitized,
    }))
  }, [])

  // Handle title change
  const handleTitleChange = useCallback((value: string) => {
    if (value.length <= 100) {
      setTitle(value)
    }
  }, [])

  // Handle bio change
  const handleBioChange = useCallback((value: string) => {
    if (value.length <= 500) {
      setBio(value)
    }
  }, [])

  // Handle photo upload
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoFile(file)
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // Handle photo removal
  const handlePhotoRemove = useCallback(() => {
    setPhotoFile(null)
    setPhotoPreview('')
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Validate field on blur
  const handleBlur = useCallback((field: keyof FormState) => {
    setTouched(prev => ({ ...prev, [field]: true }))

    if (field === 'name') {
      setErrors(prev => ({ ...prev, name: validateName(form.name) }))
    } else if (field === 'slug') {
      setErrors(prev => ({ ...prev, slug: validateSlug(form.slug) }))
    }
  }, [form.name, form.slug])

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    const nameError = validateName(form.name)
    const slugError = validateSlug(form.slug)
    return nameError === null && slugError === null
  }, [form.name, form.slug])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const nameError = validateName(form.name)
    const slugError = validateSlug(form.slug)

    // Mark all as touched
    setTouched({ name: true, slug: true })
    setErrors({ name: nameError, slug: slugError })

    // If valid, save and navigate
    if (nameError === null && slugError === null) {
      updateState({
        portfolioName: form.name.trim(),
        portfolioSlug: form.slug,
        portfolioTitle: title.trim(),
        portfolioBio: bio.trim(),
        profilePhotoFile: photoFile,
        profilePhotoPreview: photoPreview,
      })
      completeStep(1)
      router.push('/welcome/theme')
    }
  }, [form, title, bio, photoFile, photoPreview, updateState, completeStep, router])

  // Show loading state while checking for existing portfolio
  if (isChecking) {
    return (
      <div className="loading-container">
        <span>Loading...</span>
        <style jsx>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: var(--color-text-muted, #6b7280);
          }
        `}</style>
      </div>
    )
  }

  return (
    <StepLayout
      title="Name Your Portfolio"
      subtitle="Choose a name that represents you or your work"
      currentStep={1}
    >
      <form onSubmit={handleSubmit} className="portfolio-form" noValidate>
        <div className="form-fields">
          {/* Portfolio Name Field */}
          <div className="form-group">
            <label htmlFor="portfolio-name" className="form-label">
              Portfolio Name <span className="required">*</span>
            </label>
            <input
              id="portfolio-name"
              type="text"
              className={`form-input${touched.name && errors.name ? ' form-input-error' : ''}`}
              placeholder="e.g., Sarah Chen Costumes"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur('name')}
              maxLength={100}
              autoComplete="off"
              autoFocus
            />
            {touched.name && errors.name && (
              <p className="form-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Slug Field */}
          <div className="form-group">
            <label htmlFor="portfolio-slug" className="form-label">
              Portfolio URL <span className="required">*</span>
            </label>
            <div className="slug-input-wrapper">
              <span className="slug-prefix">yoursite.com/</span>
              <input
                id="portfolio-slug"
                type="text"
                className={`form-input slug-input${touched.slug && errors.slug ? ' form-input-error' : ''}`}
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() => handleBlur('slug')}
                autoComplete="off"
              />
            </div>
            {touched.slug && errors.slug && (
              <p className="form-error" role="alert">
                {errors.slug}
              </p>
            )}
          </div>

          {/* Collapsible About You Section */}
          <div className="collapsible-section">
            <button
              type="button"
              className="collapsible-trigger"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              <span>Add More Details (Optional)</span>
              <ChevronIcon className={`chevron-icon${isExpanded ? ' rotated' : ''}`} />
            </button>
            <div className={`collapsible-content${isExpanded ? ' expanded' : ''}`}>
              <div className="collapsible-inner">
                {/* Professional Title Field */}
                <div className="form-group">
                  <label htmlFor="portfolio-title" className="form-label">
                    Your Title (optional)
                  </label>
                  <input
                    id="portfolio-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Costume Designer, Freelance Stylist"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    maxLength={100}
                    autoComplete="off"
                  />
                  <div className="char-count">
                    {title.length}/100
                  </div>
                </div>

                {/* Short Bio Field */}
                <div className="form-group">
                  <label htmlFor="portfolio-bio" className="form-label">
                    About You (optional)
                  </label>
                  <textarea
                    id="portfolio-bio"
                    className="form-textarea"
                    placeholder="Tell visitors a bit about your work and experience..."
                    value={bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <div className="char-count">
                    {bio.length}/500
                  </div>
                </div>

                {/* Profile Photo Field */}
                <div className="form-group">
                  <label className="form-label">
                    Profile Photo (optional)
                  </label>
                  <p className="form-guidance">
                    A professional photo helps visitors connect with you
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="file-input-hidden"
                    aria-label="Upload profile photo"
                  />
                  {photoPreview ? (
                    <div className="photo-preview-container">
                      {/* eslint-disable-next-line @next/next/no-img-element -- photoPreview is a data URL from FileReader which next/image doesn't support */}
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="photo-preview"
                      />
                      <div className="photo-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleUploadClick}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={handlePhotoRemove}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="photo-upload-area"
                      onClick={handleUploadClick}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="upload-icon"
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
                      <span>Click to upload a photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary continue-btn"
            disabled={!isFormValid()}
          >
            Continue
          </button>
        </div>
      </form>

      <style jsx>{`
        .portfolio-form {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-6, 24px);
        }

        .form-input {
          font-size: 16px; /* Prevents iOS zoom */
        }

        .form-textarea {
          font-size: 16px; /* Prevents iOS zoom */
          resize: vertical;
          min-height: 100px;
        }

        .required {
          color: #dc2626;
        }

        .form-input-error {
          border-color: #DC2626;
        }

        .form-input-error:focus {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
        }

        .slug-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border, #d1d5db);
          border-radius: var(--radius-md, 6px);
          background: var(--color-background, #ffffff);
          overflow: hidden;
          transition: border-color var(--transition-fast, 150ms),
                      box-shadow var(--transition-fast, 150ms);
        }

        .slug-input-wrapper:hover {
          border-color: var(--color-border-strong, #9ca3af);
        }

        .slug-input-wrapper:focus-within {
          border-color: var(--color-accent, #2563eb);
          box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
        }

        .slug-input-wrapper:has(.form-input-error) {
          border-color: #DC2626;
        }

        .slug-input-wrapper:has(.form-input-error):focus-within {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
        }

        .slug-prefix {
          padding: 0 0 0 var(--space-4, 16px);
          color: var(--color-text-muted, #6b7280);
          font-size: 16px;
          white-space: nowrap;
          user-select: none;
        }

        .slug-input {
          border: none;
          background: transparent;
          padding-left: var(--space-1, 4px);
        }

        .slug-input:focus {
          outline: none;
          box-shadow: none;
        }

        /* Collapsible Section Styles */
        .collapsible-section {
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-md, 6px);
          background: var(--color-surface, #f9fafb);
        }

        .collapsible-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4, 16px);
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--font-size-base, 16px);
          font-weight: 500;
          color: var(--color-text, #111827);
          text-align: left;
          transition: background-color var(--transition-fast, 150ms);
        }

        .collapsible-trigger:hover {
          background: var(--color-surface-hover, #f3f4f6);
        }

        .collapsible-trigger:focus-visible {
          outline: 2px solid var(--color-accent, #2563eb);
          outline-offset: -2px;
        }

        .chevron-icon {
          flex-shrink: 0;
          color: var(--color-text-muted, #6b7280);
          transition: transform var(--transition-fast, 150ms);
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }

        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }

        .collapsible-content.expanded {
          max-height: 800px;
          transition: max-height 0.4s ease-in;
        }

        .collapsible-inner {
          padding: 0 var(--space-4, 16px) var(--space-4, 16px);
          display: flex;
          flex-direction: column;
          gap: var(--space-5, 20px);
        }

        /* Character Count */
        .char-count {
          margin-top: var(--space-1, 4px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
          text-align: right;
        }

        /* Form Guidance Text */
        .form-guidance {
          margin: 0 0 var(--space-2, 8px);
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
        }

        /* Photo Upload Styles */
        .file-input-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        .photo-upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-2, 8px);
          padding: var(--space-6, 24px);
          border: 2px dashed var(--color-border, #d1d5db);
          border-radius: var(--radius-md, 6px);
          background: var(--color-background, #ffffff);
          cursor: pointer;
          transition: border-color var(--transition-fast, 150ms),
                      background-color var(--transition-fast, 150ms);
          width: 100%;
        }

        .photo-upload-area:hover {
          border-color: var(--color-accent, #2563eb);
          background: var(--color-accent-light, #eff6ff);
        }

        .photo-upload-area:focus-visible {
          outline: 2px solid var(--color-accent, #2563eb);
          outline-offset: 2px;
        }

        .upload-icon {
          color: var(--color-text-muted, #6b7280);
        }

        .photo-upload-area span {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-text-muted, #6b7280);
        }

        .photo-preview-container {
          display: flex;
          align-items: center;
          gap: var(--space-4, 16px);
        }

        .photo-preview {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-full, 9999px);
          border: 2px solid var(--color-border, #e5e7eb);
        }

        .photo-actions {
          display: flex;
          gap: var(--space-2, 8px);
        }

        .btn-sm {
          padding: var(--space-1, 4px) var(--space-3, 12px);
          font-size: var(--font-size-sm, 14px);
        }

        .btn-ghost {
          background: transparent;
          color: var(--color-text-muted, #6b7280);
          border: none;
        }

        .btn-ghost:hover {
          background: var(--color-surface-hover, #f3f4f6);
          color: var(--color-text, #111827);
        }

        .btn-secondary {
          background: var(--color-background, #ffffff);
          color: var(--color-text, #111827);
          border: 1px solid var(--color-border, #d1d5db);
        }

        .btn-secondary:hover {
          background: var(--color-surface-hover, #f3f4f6);
          border-color: var(--color-border-strong, #9ca3af);
        }

        .form-actions {
          margin-top: auto;
          padding-top: var(--space-8, 32px);
        }

        .continue-btn {
          width: 100%;
          min-height: 44px;
          font-size: var(--font-size-base, 16px);
        }

        @media (min-width: 640px) {
          .continue-btn {
            width: auto;
            min-width: 160px;
            margin-left: auto;
            display: block;
          }
        }
      `}</style>
    </StepLayout>
  )
}
