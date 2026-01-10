'use client'

import { useCallback } from 'react'
import { FormField } from '@/components/shared/FormField'

// ============================================================================
// Constants
// ============================================================================

export const MAX_DESCRIPTION_LENGTH = 5000
const NEAR_LIMIT_THRESHOLD = 100

// ============================================================================
// Validation
// ============================================================================

export function validateDescription(value: string): string | undefined {
  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
  }
  return undefined
}

// ============================================================================
// Types
// ============================================================================

interface ProjectDescriptionProps {
  value: string
  error?: string
  touched?: boolean
  onChange: (value: string) => void
  onBlur: () => void
}

// ============================================================================
// Component
// ============================================================================

export function ProjectDescription({
  value,
  error,
  touched = false,
  onChange,
  onBlur,
}: ProjectDescriptionProps) {
  const handleChange = useCallback(
    (newValue: string) => onChange(newValue),
    [onChange]
  )

  const charCount = value.length
  const isNearLimit = MAX_DESCRIPTION_LENGTH - charCount <= NEAR_LIMIT_THRESHOLD

  return (
    <div className="project-description">
      <FormField
        type="textarea"
        label="Description"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        touched={touched}
        placeholder="Enter project description..."
        maxLength={MAX_DESCRIPTION_LENGTH}
        showCharCount
        rows={6}
        hint="Describe the project, your role, and any notable achievements."
      />
      {isNearLimit && charCount > 0 && (
        <p className="project-description__warning">
          {MAX_DESCRIPTION_LENGTH - charCount} characters remaining
        </p>
      )}
    </div>
  )
}

export default ProjectDescription
