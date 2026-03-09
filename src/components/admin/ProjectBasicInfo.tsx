'use client'

import { useCallback } from 'react'
import { FormField } from '@/components/shared/FormField'

// ============================================================================
// Constants
// ============================================================================

export const MAX_TITLE_LENGTH = 200
const MAX_YEAR_LENGTH = 20
const MAX_VENUE_LENGTH = 200
const MAX_ORGANIZATION_LENGTH = 200
const MAX_LOCATION_LENGTH = 200
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

export function validateOrganization(value: string): string | undefined {
  if (value.length > MAX_ORGANIZATION_LENGTH) {
    return `Organization must be ${MAX_ORGANIZATION_LENGTH} characters or less`
  }
  return undefined
}

export function validateLocation(value: string): string | undefined {
  if (value.length > MAX_LOCATION_LENGTH) {
    return `Location must be ${MAX_LOCATION_LENGTH} characters or less`
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
  organization: string
  location: string
  role: string
}

export interface BasicInfoErrors {
  title?: string
  year?: string
  venue?: string
  organization?: string
  location?: string
  role?: string
}

export interface BasicInfoTouched {
  title?: boolean
  year?: boolean
  venue?: boolean
  organization?: boolean
  location?: boolean
  role?: boolean
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

  const handleOrganizationChange = useCallback(
    (value: string) => onChange('organization', value),
    [onChange]
  )
  const handleOrganizationBlur = useCallback(() => onBlur('organization'), [onBlur])

  const handleLocationChange = useCallback(
    (value: string) => onChange('location', value),
    [onChange]
  )
  const handleLocationBlur = useCallback(() => onBlur('location'), [onBlur])

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
        touched={touched.title ?? false}
        placeholder=""
        maxLength={MAX_TITLE_LENGTH}
        showCharCount
        required
        inputProps={{ 'data-testid': 'project-form-title-input' }}
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
            touched={touched.year ?? false}
            placeholder=""
            maxLength={MAX_YEAR_LENGTH}
            inputProps={{ 'data-testid': 'project-form-year-input' }}
          />

          <FormField
            type="text"
            label="Venue"
            value={values.venue}
            onChange={handleVenueChange}
            onBlur={handleVenueBlur}
            error={errors.venue}
            touched={touched.venue ?? false}
            placeholder=""
            maxLength={MAX_VENUE_LENGTH}
            inputProps={{ 'data-testid': 'project-form-venue-input' }}
          />

          <FormField
            type="text"
            label="Organization"
            value={values.organization}
            onChange={handleOrganizationChange}
            onBlur={handleOrganizationBlur}
            error={errors.organization}
            touched={touched.organization ?? false}
            placeholder=""
            maxLength={MAX_ORGANIZATION_LENGTH}
            inputProps={{ 'data-testid': 'project-form-organization-input' }}
          />

          <FormField
            type="text"
            label="Location"
            value={values.location}
            onChange={handleLocationChange}
            onBlur={handleLocationBlur}
            error={errors.location}
            touched={touched.location ?? false}
            placeholder=""
            maxLength={MAX_LOCATION_LENGTH}
            inputProps={{ 'data-testid': 'project-form-location-input' }}
          />

          <FormField
            type="text"
            label="Role"
            value={values.role}
            onChange={handleRoleChange}
            onBlur={handleRoleBlur}
            error={errors.role}
            touched={touched.role ?? false}
            placeholder=""
            maxLength={MAX_ROLE_LENGTH}
            inputProps={{ 'data-testid': 'project-form-role-input' }}
          />
        </>
      )}
    </div>
  )
}

export default ProjectBasicInfo
