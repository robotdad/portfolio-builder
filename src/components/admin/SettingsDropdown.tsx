'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { usePopoverPosition } from '@/hooks/usePopoverPosition'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { ThemeSelector } from '@/components/admin/ThemeSelector'

// ============================================================================
// Types
// ============================================================================

interface SettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  // Settings values
  name: string
  slug: string
  theme: string
  // Handlers
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onThemeChange: (theme: string) => void
  onFieldBlur: () => void // Called when any field loses focus - triggers auto-save
  // State
  isSaving?: boolean
  hasHeroSection?: boolean // If true, hide name field (name comes from hero)
}

// ============================================================================
// Slug validation
// ============================================================================

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isValidSlug(slug: string): boolean {
  if (!slug) return false
  return SLUG_PATTERN.test(slug)
}

// ============================================================================
// SettingsForm Component (shared between desktop and mobile)
// ============================================================================

interface SettingsFormProps {
  name: string
  slug: string
  theme: string
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onThemeChange: (theme: string) => void
  onFieldBlur: () => void
  isSaving?: boolean
  hasHeroSection?: boolean
  nameInputRef?: React.RefObject<HTMLInputElement | null>
  slugInputRef?: React.RefObject<HTMLInputElement | null>
}

function SettingsForm({
  name,
  slug,
  theme,
  onNameChange,
  onSlugChange,
  onThemeChange,
  onFieldBlur,
  isSaving = false,
  hasHeroSection = false,
  nameInputRef,
  slugInputRef,
}: SettingsFormProps) {
  const [slugError, setSlugError] = useState<string | null>(null)

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value)
  }

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    onSlugChange(value)
    
    // Clear error while typing
    if (slugError) setSlugError(null)
  }

  const handleSlugBlur = () => {
    // Validate slug on blur
    if (slug && !isValidSlug(slug)) {
      setSlugError('Use lowercase letters, numbers, and hyphens only')
    } else {
      setSlugError(null)
      onFieldBlur()
    }
  }

  const handleThemeChange = (themeId: string) => {
    onThemeChange(themeId)
    // Theme changes trigger immediate save via parent
  }

  return (
    <div className="settings-form">
      {/* Saving indicator */}
      {isSaving && (
        <div className="settings-saving" role="status" aria-live="polite">
          <span className="settings-saving__dot" aria-hidden="true" />
          Saving...
        </div>
      )}

      {/* Name field (only if no hero section) */}
      {!hasHeroSection && (
        <div className="settings-field">
          <label htmlFor="settings-name" className="settings-field__label">
            Portfolio Name
          </label>
          <input
            ref={nameInputRef}
            id="settings-name"
            type="text"
            className="settings-field__input"
            value={name}
            onChange={handleNameChange}
            onBlur={onFieldBlur}
            placeholder="My Portfolio"
            maxLength={100}
          />
        </div>
      )}

      {/* Slug field */}
      <div className="settings-field">
        <label htmlFor="settings-slug" className="settings-field__label">
          Portfolio URL
        </label>
        <div className="settings-field__input-wrapper">
          <span className="settings-field__prefix" aria-hidden="true">/</span>
          <input
            ref={hasHeroSection ? slugInputRef : undefined}
            id="settings-slug"
            type="text"
            className={`settings-field__input settings-field__input--with-prefix ${
              slugError ? 'settings-field__input--error' : ''
            }`}
            value={slug}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            placeholder="my-portfolio"
            maxLength={50}
            pattern="[a-z0-9-]+"
            aria-describedby={slugError ? 'slug-error' : undefined}
            aria-invalid={!!slugError}
          />
        </div>
        {slugError && (
          <span id="slug-error" className="settings-field__error" role="alert">
            {slugError}
          </span>
        )}
      </div>

      {/* Theme selector */}
      <div className="settings-field settings-field--theme">
        <ThemeSelector
          value={theme}
          onChange={handleThemeChange}
        />
      </div>

      <style jsx>{`
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-saving {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-surface-secondary, #f3f4f6);
          border-radius: 6px;
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
        }

        .settings-saving__dot {
          width: 6px;
          height: 6px;
          background: var(--color-accent, #3b82f6);
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-field--theme {
          padding-top: 4px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          margin-top: 4px;
        }

        .settings-field__label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted, #6b7280);
        }

        .settings-field__input-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .settings-field__prefix {
          position: absolute;
          left: 12px;
          font-size: 14px;
          color: var(--color-text-muted, #6b7280);
          pointer-events: none;
        }

        .settings-field__input {
          width: 100%;
          min-height: 40px;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--color-text, #1f2937);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .settings-field__input--with-prefix {
          padding-left: 24px;
        }

        .settings-field__input:hover {
          border-color: var(--color-border-strong, #cbd5e1);
        }

        .settings-field__input:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.15);
        }

        .settings-field__input--error {
          border-color: var(--color-error, #ef4444);
        }

        .settings-field__input--error:focus {
          border-color: var(--color-error, #ef4444);
          box-shadow: 0 0 0 3px hsla(0, 84%, 60%, 0.15);
        }

        .settings-field__input::placeholder {
          color: var(--color-text-placeholder, #9ca3af);
        }

        .settings-field__error {
          font-size: 12px;
          color: var(--color-error, #ef4444);
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Desktop Popover Content
// ============================================================================

interface DesktopDropdownProps extends SettingsFormProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

function DesktopDropdown({
  isOpen,
  onClose,
  triggerRef,
  ...formProps
}: DesktopDropdownProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const slugInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Use the positioning hook
  const { placement, style, arrowStyle } = usePopoverPosition({
    triggerRef,
    popoverRef,
    isOpen,
    gap: 8,
    align: 'end',
  })

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation and focus management when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Slight delay to allow portal to mount and position to calculate
      const showTimer = setTimeout(() => {
        setIsVisible(true)
      }, 10)

      // Focus first input after animation starts
      const focusTimer = setTimeout(() => {
        // Focus name input if visible, otherwise slug input
        if (!formProps.hasHeroSection && nameInputRef.current) {
          nameInputRef.current.focus()
        } else if (slugInputRef.current) {
          slugInputRef.current.focus()
        }
      }, 50)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(focusTimer)
      }
    } else {
      setIsVisible(false)
    }
  }, [isOpen, formProps.hasHeroSection])

  // Return focus to trigger when closing
  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      triggerRef.current?.focus()
    }, 0)
  }, [onClose, triggerRef])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const popover = popoverRef.current
      const trigger = triggerRef.current

      if (
        popover &&
        !popover.contains(target) &&
        trigger &&
        !trigger.contains(target)
      ) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose, triggerRef])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !popoverRef.current) return

    const popover = popoverRef.current

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = popover.querySelectorAll<HTMLElement>(
        'input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const popoverContent = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Portfolio Settings"
      aria-modal="true"
      data-position={placement}
      className={`settings-dropdown ${isVisible ? 'settings-dropdown--visible' : ''}`}
      style={{
        ...style,
        width: 300,
      }}
    >
      {/* Arrow indicator */}
      <div
        className={`settings-dropdown__arrow settings-dropdown__arrow--${placement}`}
        style={{ left: arrowStyle.left }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="settings-dropdown__content">
        <SettingsForm
          {...formProps}
          nameInputRef={nameInputRef}
          slugInputRef={slugInputRef}
        />
      </div>

      <style jsx>{`
        .settings-dropdown {
          position: absolute;
          z-index: 1000;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.12),
            0 2px 4px hsla(0, 0%, 0%, 0.08);
          overflow: hidden;

          /* Animation initial state */
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 150ms ease-out, transform 150ms ease-out;
        }

        /* Transform origin based on position */
        .settings-dropdown[data-position='below'] {
          transform-origin: top right;
        }

        .settings-dropdown[data-position='above'] {
          transform-origin: bottom right;
        }

        .settings-dropdown--visible {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .settings-dropdown {
            transition: none;
            transform: none;
          }
          .settings-dropdown--visible {
            transform: none;
          }
        }

        .settings-dropdown__content {
          padding: 16px;
        }

        /* Arrow styles */
        .settings-dropdown__arrow {
          position: absolute;
          width: 12px;
          height: 12px;
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          transform: translateX(-50%) rotate(45deg);
          pointer-events: none;
        }

        .settings-dropdown__arrow--below {
          top: -7px;
          border-right: none;
          border-bottom: none;
        }

        .settings-dropdown__arrow--above {
          bottom: -7px;
          border-left: none;
          border-top: none;
        }
      `}</style>
    </div>
  )

  return createPortal(popoverContent, document.body)
}

// ============================================================================
// Mobile BottomSheet Content
// ============================================================================

interface MobileSheetProps extends SettingsFormProps {
  isOpen: boolean
  onClose: () => void
}

function MobileSheet({
  isOpen,
  onClose,
  ...formProps
}: MobileSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Portfolio Settings"
    >
      <div className="mobile-settings-form">
        <SettingsForm {...formProps} />
        
        <style jsx>{`
          .mobile-settings-form {
            padding: 8px 8px 0;
          }
        `}</style>
      </div>
    </BottomSheet>
  )
}

// ============================================================================
// Main SettingsDropdown Component
// ============================================================================

export function SettingsDropdown({
  isOpen,
  onClose,
  triggerRef,
  name,
  slug,
  theme,
  onNameChange,
  onSlugChange,
  onThemeChange,
  onFieldBlur,
  isSaving = false,
  hasHeroSection = false,
}: SettingsDropdownProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    setIsMobile(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const formProps = {
    name,
    slug,
    theme,
    onNameChange,
    onSlugChange,
    onThemeChange,
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

// ============================================================================
// Exports
// ============================================================================

export type { SettingsDropdownProps }
