/**
 * Shared types and utilities for Settings components.
 */

import type { RefObject, ChangeEvent } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface SettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  // Settings values
  name: string
  slug: string
  theme: string
  template: string
  // About section values
  portfolioId: string
  bio: string
  profilePhotoUrl: string | null
  profilePhotoId: string | null
  showAboutSection: boolean
  // Handlers
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onThemeChange: (theme: string) => void
  onTemplateChange: (template: string) => void
  onBioChange: (bio: string) => void
  onProfilePhotoChange: (photoId: string | null, photoUrl: string | null) => void
  onShowAboutChange: (show: boolean) => void
  onFieldBlur: () => void // Called when any field loses focus - triggers auto-save
  // State
  isSaving?: boolean
  hasHeroSection?: boolean // If true, hide name field (name comes from hero)
  portfolioSlug: string // Needed for template preview URL
}

export interface SettingsFormProps {
  name: string
  slug: string
  theme: string
  template: string
  portfolioId: string
  bio: string
  profilePhotoUrl: string | null
  profilePhotoId: string | null
  showAboutSection: boolean
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onThemeChange: (theme: string) => void
  onTemplateChange: (template: string) => void
  onBioChange: (bio: string) => void
  onProfilePhotoChange: (photoId: string | null, photoUrl: string | null) => void
  onShowAboutChange: (show: boolean) => void
  onFieldBlur: () => void
  isSaving?: boolean
  hasHeroSection?: boolean
  portfolioSlug: string
  nameInputRef?: RefObject<HTMLInputElement | null>
  slugInputRef?: RefObject<HTMLInputElement | null>
}

// ============================================================================
// Slug validation
// ============================================================================

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  if (!slug) return false
  return SLUG_PATTERN.test(slug)
}

// Re-export ChangeEvent for convenience
export type { ChangeEvent }
