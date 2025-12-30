'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in an active/selected state */
  isActive?: boolean
  /** Variant style */
  variant?: 'default' | 'icon'
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string
}

/**
 * TouchButton - A touch-friendly button with 44px minimum touch target
 * 
 * Designed for mobile editing with:
 * - 44px minimum touch target (Apple HIG)
 * - Fast visual feedback (<150ms)
 * - Proper touch-action handling
 * - Accessibility support
 */
export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  function TouchButton(
    { 
      children, 
      isActive = false, 
      variant = 'default',
      className = '',
      disabled,
      ...props 
    },
    ref
  ) {
    const baseClass = variant === 'icon' ? 'touch-btn touch-btn-icon' : 'touch-btn'
    const activeClass = isActive ? 'active' : ''
    
    return (
      <button
        ref={ref}
        type="button"
        className={`${baseClass} ${activeClass} ${className}`.trim()}
        disabled={disabled}
        aria-pressed={isActive}
        {...props}
      >
        {children}
      </button>
    )
  }
)
