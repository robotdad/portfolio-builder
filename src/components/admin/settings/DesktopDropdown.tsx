/**
 * Desktop popover dropdown for portfolio settings.
 * Handles positioning, focus management, animations, and keyboard navigation.
 */
'use client'

import { useEffect, useRef, useCallback, useSyncExternalStore, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopoverPosition } from '@/hooks/usePopoverPosition'
import { SettingsForm } from './SettingsForm'
import type { SettingsFormProps } from './types'

// Subscription for useSyncExternalStore (no-op since we only need client detection)
const emptySubscribe = () => () => {}

export interface DesktopDropdownProps extends SettingsFormProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function DesktopDropdown({
  isOpen,
  onClose,
  triggerRef,
  ...formProps
}: DesktopDropdownProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  
  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  
  // Track closing state for exit animation
  const [isClosing, setIsClosing] = useState(false)

  // Use the positioning hook
  const { placement, style, arrowStyle } = usePopoverPosition({
    triggerRef,
    popoverRef,
    isOpen,
    gap: 8,
    align: 'end',
  })

  // Focus management when opening
  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus()
        }
      }, 50)

      return () => clearTimeout(focusTimer)
    }
  }, [isOpen])

  // Return focus to trigger when closing
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
      triggerRef.current?.focus()
    }, 200)
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
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
      className={`settings-dropdown ${isClosing ? 'settings-dropdown--closing' : 'settings-dropdown--entering'}`}
      data-testid="settings-dropdown"
      style={{
        ...style,
        width: 320,
        maxHeight: '80vh',
        overflowY: 'auto',
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
        }

        /* Transform origin based on position */
        .settings-dropdown[data-position='below'] {
          transform-origin: top right;
        }

        .settings-dropdown[data-position='above'] {
          transform-origin: bottom right;
        }

        .settings-dropdown--entering {
          animation: dropdownEnter 150ms ease-out forwards;
        }

        .settings-dropdown--closing {
          animation: dropdownExit 150ms ease-out forwards;
        }

        @keyframes dropdownEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dropdownExit {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .settings-dropdown--entering,
          .settings-dropdown--closing {
            animation: none;
            opacity: 1;
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
