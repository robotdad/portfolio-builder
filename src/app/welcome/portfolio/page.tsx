'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/onboarding/StepLayout'
import { useOnboardingState } from '@/hooks/useOnboardingState'

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
 * Step 1 of onboarding: Portfolio name.
 * User provides a portfolio name.
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
  const [name, setName] = useState(() => state.portfolioName || '')

  // Optional fields state - initialize from persisted state
  const [title, setTitle] = useState(() => state.portfolioTitle || '')
  const [bio, setBio] = useState(() => state.portfolioBio || '')
  const [photoPreview, setPhotoPreview] = useState<string>(() => state.profilePhotoPreview || '')
  const [photoFile, setPhotoFile] = useState<File | null>(() => state.profilePhotoFile || null)
  const [bioOnHome, setBioOnHome] = useState(() => state.bioOnHome ?? true)
  const [bioOnAbout, setBioOnAbout] = useState(() => state.bioOnAbout ?? false)

  // Collapsible section state - auto-expand if any optional fields have data
  const [isExpanded, setIsExpanded] = useState(() => 
    !!(state.portfolioTitle || state.portfolioBio || state.profilePhotoPreview)
  )

  // Track which fields have been touched (for validation display)
  const [touched, setTouched] = useState(false)

  // Validation error
  const [error, setError] = useState<string | null>(null)

  // Handle name change
  const handleNameChange = useCallback((value: string) => {
    setName(value)
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
  const handleBlur = useCallback(() => {
    setTouched(true)
    setError(validateName(name))
  }, [name])

  // Check if form is valid
  const isFormValid = useCallback((): boolean => {
    return validateName(name) === null
  }, [name])

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const nameError = validateName(name)

    // Mark as touched
    setTouched(true)
    setError(nameError)

    // If valid, save and navigate
    if (nameError === null) {
      updateState({
        portfolioName: name.trim(),
        portfolioTitle: title.trim(),
        portfolioBio: bio.trim(),
        profilePhotoFile: photoFile,
        profilePhotoPreview: photoPreview,
        bioOnHome,
        bioOnAbout,
      })
      completeStep(1)
      router.push('/welcome/theme')
    }
  }, [name, title, bio, photoFile, photoPreview, bioOnHome, bioOnAbout, updateState, completeStep, router])

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
              className={`form-input${touched && error ? ' form-input-error' : ''}`}
              placeholder="e.g., Sarah Chen Costumes"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleBlur}
              maxLength={100}
              autoComplete="off"
              autoFocus
            />
            {touched && error && (
              <p className="form-error" role="alert">
                {error}
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

                {/* Bio Placement Options - only show if bio is provided */}
                {bio.trim() && (
                  <div className="form-group">
                    <label className="form-label">
                      Where should your bio appear?
                    </label>
                    <p className="form-guidance">
                      You can always add or remove it from pages later
                    </p>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bioOnHome}
                          onChange={(e) => setBioOnHome(e.target.checked)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">Home page</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={bioOnAbout}
                          onChange={(e) => setBioOnAbout(e.target.checked)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">About page</span>
                      </label>
                    </div>
                  </div>
                )}
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

        /* Checkbox Group */
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 12px);
          margin-top: var(--space-2, 8px);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          cursor: pointer;
          padding: var(--space-2, 8px);
          border-radius: var(--radius-sm, 4px);
          transition: background-color var(--transition-fast, 150ms);
        }

        .checkbox-label:hover {
          background: var(--color-surface-hover, #f3f4f6);
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--color-accent, #2563eb);
        }

        .checkbox-text {
          font-size: var(--font-size-base, 16px);
          color: var(--color-text, #111827);
          user-select: none;
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
