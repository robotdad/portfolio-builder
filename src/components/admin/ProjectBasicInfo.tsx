'use client'

import { useCallback } from 'react'
import { FormField } from '@/components/shared/FormField'

// ============================================================================
// Constants
// ============================================================================

export const MAX_TITLE_LENGTH = 200
const MAX_YEAR_LENGTH = 20
const MAX_VENUE_LENGTH = 200
const MAX_ROLE_LENGTH = 200

// ============================================================================
// Validation
// ============================================================================

export function validateTitle(value: string): string | undefined {
  if (!value.trim()) {
    return 'Title is required'
  }
  if (value.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`
  }
  return undefined
}

export function validateYear(value: string): string | undefined {
  if (value.length > MAX_YEAR_LENGTH) {
    return `Year must be ${MAX_YEAR_LENGTH} characters or less`
  }
  return undefined
}

export function validateVenue(value: string): string | undefined {
  if (value.length > MAX_VENUE_LENGTH) {
    return `Venue must be ${MAX_VENUE_LENGTH} characters or less`
  }
  return undefined
}

export function validateRole(value: string): string | undefined {
  if (value.length > MAX_ROLE_LENGTH) {
    return `Role must be ${MAX_ROLE_LENGTH} characters or less`
  }
  return undefined
}

// ============================================================================
// Types
// ============================================================================

export interface BasicInfoValues {
  title: string
  year: string
  venue: string
  role: string
}

export interface BasicInfoErrors {
  title?: string
  year?: string
  venue?: string
  role?: string
}

export interface BasicInfoTouched {
  title: boolean
  year: boolean
  venue: boolean
  role: boolean
}

interface ProjectBasicInfoProps {
  values: BasicInfoValues
  errors: BasicInfoErrors
  touched: BasicInfoTouched
  onChange: (field: keyof BasicInfoValues, value: string) => void
  onBlur: (field: keyof BasicInfoValues) => void
  /** Whether to show only the title field (for quick-add mode) */
  titleOnly?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function ProjectBasicInfo({
  values,
  errors,
  touched,
  onChange,
  onBlur,
  titleOnly = false,
}: ProjectBasicInfoProps) {
  // Memoized handlers to prevent unnecessary re-renders
  const handleTitleChange = useCallback(
    (value: string) => onChange('title', value),
    [onChange]
  )
  const handleTitleBlur = useCallback(() => onBlur('title'), [onBlur])

  const handleYearChange = useCallback(
    (value: string) => onChange('year', value),
    [onChange]
  )
  const handleYearBlur = useCallback(() => onBlur('year'), [onBlur])

  const handleVenueChange = useCallback(
    (value: string) => onChange('venue', value),
    [onChange]
  )
  const handleVenueBlur = useCallback(() => onBlur('venue'), [onBlur])

  const handleRoleChange = useCallback(
    (value: string) => onChange('role', value),
    [onChange]
  )
  const handleRoleBlur = useCallback(() => onBlur('role'), [onBlur])

  return (
    <div className="project-basic-info">
      <FormField
        type="text"
        label="Title"
        value={values.title}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        error={errors.title}
        touched={touched.title}
        placeholder="Enter project title"
        maxLength={MAX_TITLE_LENGTH}
        showCharCount
        required
      />

      {!titleOnly && (
        <>
          <FormField
            type="text"
            label="Year"
            value={values.year}
            onChange={handleYearChange}
            onBlur={handleYearBlur}
            error={errors.year}
            touched={touched.year}
            placeholder="e.g., 2024"
            maxLength={MAX_YEAR_LENGTH}
          />

          <FormField
            type="text"
            label="Venue"
            value={values.venue}
            onChange={handleVenueChange}
            onBlur={handleVenueBlur}
            error={errors.venue}
            touched={touched.venue}
            placeholder="e.g., National Theatre"
            maxLength={MAX_VENUE_LENGTH}
          />

          <FormField
            type="text"
            label="Role"
            value={values.role}
            onChange={handleRoleChange}
            onBlur={handleRoleBlur}
            error={errors.role}
            touched={touched.role}
            placeholder="e.g., Director, Lead Designer"
            maxLength={MAX_ROLE_LENGTH}
          />
        </>
      )}
    </div>
  )
}

export default ProjectBasicInfo
