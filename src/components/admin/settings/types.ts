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
  onThemeChange: (theme: string) => void
  onTemplateChange: (template: string) => void
  onBioChange: (bio: string) => void
  onProfilePhotoChange: (photoId: string | null, photoUrl: string | null) => void
  onShowAboutChange: (show: boolean) => void
  onFieldBlur: () => void // Called when any field loses focus - triggers auto-save
  // State
  isSaving?: boolean
  hasHeroSection?: boolean // If true, hide name field (name comes from hero)
}

export interface SettingsFormProps {
  name: string
  theme: string
  template: string
  portfolioId: string
  bio: string
  profilePhotoUrl: string | null
  profilePhotoId: string | null
  showAboutSection: boolean
  onNameChange: (name: string) => void
  onThemeChange: (theme: string) => void
  onTemplateChange: (template: string) => void
  onBioChange: (bio: string) => void
  onProfilePhotoChange: (photoId: string | null, photoUrl: string | null) => void
  onShowAboutChange: (show: boolean) => void
  onFieldBlur: () => void
  isSaving?: boolean
  hasHeroSection?: boolean
  nameInputRef?: RefObject<HTMLInputElement | null>
}

// Re-export ChangeEvent for convenience
export type { ChangeEvent }
