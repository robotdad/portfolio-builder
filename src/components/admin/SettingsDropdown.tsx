'use client'

import { useEffect, useState } from 'react'
import { DesktopDropdown } from './settings/DesktopDropdown'
import { MobileSheet } from './settings/MobileSheet'
import type { SettingsDropdownProps } from './settings/types'

/**
 * Responsive settings dropdown that shows a popover on desktop
 * and a bottom sheet on mobile devices.
 */
export function SettingsDropdown({
  isOpen,
  onClose,
  triggerRef,
  name,
  theme,
  template,
  portfolioId,
  bio,
  profilePhotoUrl,
  profilePhotoId,
  onNameChange,
  onThemeChange,
  onTemplateChange,
  onBioChange,
  onProfilePhotoChange,
  onFieldBlur,
  isSaving = false,
  hasHeroSection = false,
}: SettingsDropdownProps) {
  // Initialize isMobile with SSR-safe default and subscribe to changes
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 767px)').matches
  })

  // Subscribe to media query changes only
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const formProps = {
    name,
    theme,
    template,
    portfolioId,
    bio,
    profilePhotoUrl,
    profilePhotoId,
    onNameChange,
    onThemeChange,
    onTemplateChange,
    onBioChange,
    onProfilePhotoChange,
    onFieldBlur,
    isSaving,
    hasHeroSection,
  }

  if (isMobile) {
    return (
      <MobileSheet
        isOpen={isOpen}
        onClose={onClose}
        {...formProps}
      />
    )
  }

  return (
    <DesktopDropdown
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      {...formProps}
    />
  )
}

export type { SettingsDropdownProps }
