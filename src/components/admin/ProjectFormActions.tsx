'use client'

// ============================================================================
// Types
// ============================================================================

interface ProjectFormActionsProps {
  isSubmitting: boolean
  isEditMode: boolean
  onCancel: () => void
  /** Whether the form has validation errors */
  hasErrors?: boolean
}

// ============================================================================
// Components
// ============================================================================

function Spinner() {
  return (
    <span className="spinner" aria-hidden="true">
      <svg
        className="spinner__icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="spinner__track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.25"
        />
        <path
          className="spinner__head"
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function ProjectFormActions({
  isSubmitting,
  isEditMode,
  onCancel,
  hasErrors = false,
}: ProjectFormActionsProps) {
  const submitLabel = isEditMode ? 'Save Changes' : 'Create Project'
  const submittingLabel = isEditMode ? 'Saving...' : 'Creating...'

  return (
    <div className="form-actions">
      <button
        type="button"
        className="btn btn--secondary"
        onClick={onCancel}
        disabled={isSubmitting}
        data-testid="project-form-cancel-btn"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn--primary"
        disabled={isSubmitting || hasErrors}
        aria-busy={isSubmitting}
        data-testid="project-form-submit-btn"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            <span>{submittingLabel}</span>
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  )
}

export default ProjectFormActions
