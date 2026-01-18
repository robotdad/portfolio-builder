'use client'

import { useState, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/onboarding/StepLayout'
import { useOnboardingState } from '@/hooks/useOnboardingState'

/**
 * Step 3: First Category and Project
 * 
 * Final step of the onboarding wizard where users create their first
 * category and project. On successful submission, all onboarding data
 * is sent to the API to create the portfolio.
 */
export default function FirstProjectPage() {
  const router = useRouter()
  const { state, updateState, reset, getState } = useOnboardingState()

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

  // Generate unique IDs for accessibility
  const categoryNameId = useId()
  const categoryNameErrorId = useId()
  const projectTitleId = useId()
  const projectTitleErrorId = useId()

  // Form state
  const [categoryName, setCategoryName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')

  // Validation state
  const [errors, setErrors] = useState<{
    categoryName?: string
    projectTitle?: string
  }>({})
  const [touched, setTouched] = useState<{
    categoryName?: boolean
    projectTitle?: boolean
  }>({})

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize form from persisted state
  useEffect(() => {
    if (state.categoryName) {
      setCategoryName(state.categoryName)
    }
    if (state.projectTitle) {
      setProjectTitle(state.projectTitle)
    }
  }, [state.categoryName, state.projectTitle])

  // Sync local state to onboarding state
  useEffect(() => {
    updateState({ categoryName, projectTitle })
  }, [categoryName, projectTitle, updateState])

  // Validation functions
  const validateCategoryName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Category name is required'
    }
    return undefined
  }

  const validateProjectTitle = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Project title is required'
    }
    return undefined
  }

  // Handle field changes
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCategoryName(value)
    if (touched.categoryName) {
      setErrors((prev) => ({ ...prev, categoryName: validateCategoryName(value) }))
    }
  }

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setProjectTitle(value)
    if (touched.projectTitle) {
      setErrors((prev) => ({ ...prev, projectTitle: validateProjectTitle(value) }))
    }
  }

  // Handle field blur for validation
  const handleCategoryNameBlur = () => {
    setTouched((prev) => ({ ...prev, categoryName: true }))
    setErrors((prev) => ({ ...prev, categoryName: validateCategoryName(categoryName) }))
  }

  const handleProjectTitleBlur = () => {
    setTouched((prev) => ({ ...prev, projectTitle: true }))
    setErrors((prev) => ({ ...prev, projectTitle: validateProjectTitle(projectTitle) }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous submit error
    setSubmitError(null)

    // Validate all fields
    const categoryNameError = validateCategoryName(categoryName)
    const projectTitleError = validateProjectTitle(projectTitle)

    setErrors({
      categoryName: categoryNameError,
      projectTitle: projectTitleError,
    })
    setTouched({
      categoryName: true,
      projectTitle: true,
    })

    // Stop if there are errors
    if (categoryNameError || projectTitleError) {
      return
    }

    // Get the latest state (includes data from previous steps)
    const currentState = getState()

    // Check if we have the required data from previous steps
    if (!currentState.portfolioName) {
      setSubmitError('Missing portfolio information. Please go back and complete the previous steps.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioName: currentState.portfolioName,
          theme: currentState.selectedTheme,
          categoryName: categoryName.trim(),
          projectTitle: projectTitle.trim(),
          // Bio/About fields from Step 1
          portfolioTitle: currentState.portfolioTitle || undefined,
          portfolioBio: currentState.portfolioBio || undefined,
          profilePhoto: currentState.profilePhotoPreview || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create portfolio')
      }

      // Success! Clear state and redirect to admin
      reset()
      router.push('/admin')
    } catch (error) {
      console.error('Onboarding submission error:', error)
      setSubmitError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

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
      title="Add Your First Work"
      subtitle="Create a category to organize your work, then add your first project"
      currentStep={3}
    >
      <form onSubmit={handleSubmit} className="first-project-form" noValidate>
        {/* Submit Error Alert */}
        {submitError && (
          <div className="alert alert-error" role="alert">
            {submitError}
          </div>
        )}

        {/* Category Section */}
        <section className="form-section">
          <h2 className="form-section-header">Category</h2>
          
          <div className="form-group">
            <label htmlFor={categoryNameId} className="form-label">
              Category Name <span className="required">*</span>
            </label>
            <input
              id={categoryNameId}
              type="text"
              className={`form-input ${errors.categoryName && touched.categoryName ? 'form-input-error' : ''}`}
              value={categoryName}
              onChange={handleCategoryNameChange}
              onBlur={handleCategoryNameBlur}
              placeholder="e.g., Theatre, Film, Commercial"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.categoryName && touched.categoryName ? 'true' : 'false'}
              aria-describedby={errors.categoryName && touched.categoryName ? categoryNameErrorId : undefined}
              autoComplete="off"
            />
            {errors.categoryName && touched.categoryName && (
              <p id={categoryNameErrorId} className="form-error" role="alert">
                {errors.categoryName}
              </p>
            )}
            <p className="form-hint">
              Categories help organize your work by type or medium
            </p>
          </div>
        </section>

        {/* Project Section */}
        <section className="form-section">
          <h2 className="form-section-header">First Project</h2>
          
          <div className="form-group">
            <label htmlFor={projectTitleId} className="form-label">
              Project Title <span className="required">*</span>
            </label>
            <input
              id={projectTitleId}
              type="text"
              className={`form-input ${errors.projectTitle && touched.projectTitle ? 'form-input-error' : ''}`}
              value={projectTitle}
              onChange={handleProjectTitleChange}
              onBlur={handleProjectTitleBlur}
              placeholder="e.g., Hamlet 2024, Period Drama, Spring Collection"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={errors.projectTitle && touched.projectTitle ? 'true' : 'false'}
              aria-describedby={errors.projectTitle && touched.projectTitle ? projectTitleErrorId : undefined}
              autoComplete="off"
            />
            {errors.projectTitle && touched.projectTitle && (
              <p id={projectTitleErrorId} className="form-error" role="alert">
                {errors.projectTitle}
              </p>
            )}
            <p className="form-hint">
              You can add more details like venue and credits later
            </p>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-full-width"
            disabled={isSubmitting || !categoryName.trim() || !projectTitle.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Creating Portfolio...</span>
              </>
            ) : (
              'Create Portfolio'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .first-project-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-section-header {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0;
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--color-border);
        }

        .form-section:not(:first-of-type) {
          margin-top: var(--space-4);
        }

        .required {
          color: #dc2626;
        }

        .form-input-error {
          border-color: #dc2626;
        }

        .form-input-error:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
        }

        .form-hint {
          margin-top: var(--space-1);
        }

        .form-actions {
          margin-top: var(--space-4);
        }

        .btn-full-width {
          width: 100%;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          margin-right: var(--space-2);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile-first styles - ensure 16px font on inputs to prevent iOS zoom */
        .form-input {
          font-size: 16px;
        }

        /* Touch targets */
        .btn,
        .form-input {
          min-height: 44px;
        }

        @media (min-width: 640px) {
          .form-section-header {
            font-size: var(--font-size-xl);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .btn-spinner {
            animation: none;
          }
        }
      `}</style>
    </StepLayout>
  )
}
