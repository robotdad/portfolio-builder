'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  /** Size - all sizes meet 44px touch target on mobile */
  size?: 'sm' | 'md' | 'lg'
  /** Show loading spinner and disable interactions */
  isLoading?: boolean
  /** Icon-only button (uses square aspect ratio) */
  iconOnly?: boolean
  /** Icon to show before children */
  leftIcon?: ReactNode
  /** Icon to show after children */
  rightIcon?: ReactNode
  /** Full width button */
  fullWidth?: boolean
}

/**
 * Unified Button component with consistent styling across the application.
 * 
 * @example
 * // Primary button
 * <Button variant="primary">Save changes</Button>
 * 
 * @example
 * // Icon button
 * <Button variant="ghost" iconOnly aria-label="Delete">
 *   <TrashIcon />
 * </Button>
 * 
 * @example
 * // Loading state
 * <Button variant="primary" isLoading>
 *   Saving...
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <>
        <button
          ref={ref}
          disabled={isDisabled}
          className={`
            btn
            btn--${variant}
            btn--${size}
            ${iconOnly ? 'btn--icon-only' : ''}
            ${fullWidth ? 'btn--full-width' : ''}
            ${isLoading ? 'btn--loading' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {isLoading && (
            <span className="btn__spinner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="spinner-icon">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
            </span>
          )}
          {!isLoading && leftIcon && (
            <span className="btn__icon btn__icon--left" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children && <span className="btn__text">{children}</span>}
          {!isLoading && rightIcon && (
            <span className="btn__icon btn__icon--right" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </button>

        <style jsx>{`
          .btn {
            /* Reset */
            appearance: none;
            border: none;
            background: none;
            font: inherit;
            cursor: pointer;
            
            /* Layout */
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2, 8px);
            
            /* Typography */
            font-family: var(--font-body);
            font-weight: 500;
            text-decoration: none;
            white-space: nowrap;
            
            /* Sizing - base */
            border-radius: var(--button-radius, 8px);
            
            /* Transitions */
            transition: 
              background-color var(--transition-fast, 150ms) ease,
              border-color var(--transition-fast, 150ms) ease,
              color var(--transition-fast, 150ms) ease,
              opacity var(--transition-fast, 150ms) ease,
              transform var(--transition-fast, 150ms) ease;
            
            /* Touch optimization */
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }

          /* Sizes */
          .btn--sm {
            min-height: 32px;
            padding: var(--space-1, 4px) var(--space-3, 12px);
            font-size: var(--font-size-sm, 0.875rem);
          }

          .btn--md {
            min-height: 40px;
            padding: var(--space-2, 8px) var(--space-4, 16px);
            font-size: var(--font-size-base, 1rem);
          }

          .btn--lg {
            min-height: 48px;
            padding: var(--space-3, 12px) var(--space-6, 24px);
            font-size: var(--font-size-base, 1rem);
          }

          /* Ensure touch targets on mobile */
          @media (pointer: coarse) {
            .btn--sm,
            .btn--md {
              min-height: 44px;
            }
          }

          /* Icon-only sizing */
          .btn--icon-only {
            padding: 0;
            aspect-ratio: 1;
          }

          .btn--icon-only.btn--sm {
            width: 32px;
          }

          .btn--icon-only.btn--md {
            width: 40px;
          }

          .btn--icon-only.btn--lg {
            width: 48px;
          }

          @media (pointer: coarse) {
            .btn--icon-only.btn--sm,
            .btn--icon-only.btn--md {
              width: 44px;
              min-height: 44px;
            }
          }

          /* Full width */
          .btn--full-width {
            width: 100%;
          }

          /* Variants */
          .btn--primary {
            background-color: var(--color-accent, hsl(220, 90%, 56%));
            color: var(--color-accent-contrast, white);
          }

          .btn--primary:hover:not(:disabled) {
            background-color: var(--color-accent-hover, hsl(220, 90%, 50%));
          }

          .btn--primary:active:not(:disabled) {
            transform: scale(0.98);
          }

          .btn--secondary {
            background-color: transparent;
            color: var(--color-text, hsl(0, 0%, 13%));
            border: 1px solid var(--color-border, hsl(0, 0%, 80%));
          }

          .btn--secondary:hover:not(:disabled) {
            background-color: var(--color-surface-hover, hsl(0, 0%, 96%));
            border-color: var(--color-border-hover, hsl(0, 0%, 70%));
          }

          .btn--secondary:active:not(:disabled) {
            transform: scale(0.98);
          }

          .btn--ghost {
            background-color: transparent;
            color: var(--color-text, hsl(0, 0%, 13%));
          }

          .btn--ghost:hover:not(:disabled) {
            background-color: var(--color-surface-hover, hsl(0, 0%, 96%));
          }

          .btn--ghost:active:not(:disabled) {
            background-color: var(--color-surface-active, hsl(0, 0%, 92%));
          }

          .btn--destructive {
            background-color: var(--color-error, hsl(0, 72%, 51%));
            color: white;
          }

          .btn--destructive:hover:not(:disabled) {
            background-color: var(--color-error-hover, hsl(0, 72%, 45%));
          }

          .btn--destructive:active:not(:disabled) {
            transform: scale(0.98);
          }

          /* Disabled state */
          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* Focus state */
          .btn:focus-visible {
            outline: 2px solid var(--color-accent, hsl(220, 90%, 56%));
            outline-offset: 2px;
          }

          /* Loading state */
          .btn--loading {
            position: relative;
            cursor: wait;
          }

          .btn__spinner {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .spinner-icon {
            width: 1em;
            height: 1em;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .spinner-icon {
              animation: none;
              opacity: 0.7;
            }
          }

          /* Icon styling */
          .btn__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .btn__icon :global(svg) {
            width: 1.25em;
            height: 1.25em;
          }

          .btn__text {
            flex-shrink: 0;
          }
        `}</style>
      </>
    )
  }
)

Button.displayName = 'Button'

export default Button
