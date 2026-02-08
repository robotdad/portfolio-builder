'use client'

import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon element to render */
  icon: ReactNode
  /** Required accessible label - TypeScript enforced */
  'aria-label': string
  /** Visual style variant */
  variant?: 'ghost' | 'subtle' | 'outline'
  /** Size - all sizes meet 44px touch target on mobile */
  size?: 'sm' | 'md' | 'lg'
  /** Show loading spinner and disable interactions */
  isLoading?: boolean
}

/**
 * Icon-only button with enforced accessibility and theme-aware interactive states.
 *
 * Variants:
 * - `ghost` (default): Transparent background, themed hover color/bg
 * - `subtle`: Faint background always visible, themed hover
 * - `outline`: Border + transparent background, themed hover border
 *
 * Size mapping:
 * - sm: 32px container (44px touch on coarse), 16px icon
 * - md: 40px container (44px touch on coarse), 20px icon
 * - lg: 48px container, 24px icon
 *
 * @example
 * <IconButton icon={<Search />} aria-label="Search portfolio" />
 * <IconButton icon={<Mail />} aria-label="Send email" variant="subtle" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      title,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading
    const ariaLabel = props['aria-label']

    return (
      <>
        <button
          ref={ref}
          type="button"
          disabled={isDisabled}
          title={title ?? ariaLabel}
          className={`
            icon-btn
            icon-btn--${variant}
            icon-btn--${size}
            ${isLoading ? 'icon-btn--loading' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {isLoading ? (
            <span className="icon-btn__spinner" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="icon-btn__spinner-svg">
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
          ) : (
            <span className="icon-btn__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </button>

        <style jsx>{`
          .icon-btn {
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
            aspect-ratio: 1;
            flex-shrink: 0;

            /* Theme tokens */
            color: var(--icon-btn-color, var(--color-text-secondary));
            border-radius: var(--icon-btn-radius, var(--button-radius, 8px));

            /* Transitions */
            transition:
              background-color var(--icon-btn-transition, 150ms ease),
              border-color var(--icon-btn-transition, 150ms ease),
              color var(--icon-btn-transition, 150ms ease),
              transform var(--icon-btn-transition, 150ms ease);

            /* Touch optimization */
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }

          /* Sizes */
          .icon-btn--sm {
            width: 32px;
            min-height: 32px;
          }

          .icon-btn--md {
            width: 40px;
            min-height: 40px;
          }

          .icon-btn--lg {
            width: 48px;
            min-height: 48px;
          }

          /* Touch targets on coarse pointer */
          @media (pointer: coarse) {
            .icon-btn--sm,
            .icon-btn--md {
              width: 44px;
              min-height: 44px;
            }
          }

          /* Icon sizing per button size */
          .icon-btn--sm .icon-btn__icon :global(svg) {
            width: var(--icon-btn-icon-sm, 16px);
            height: var(--icon-btn-icon-sm, 16px);
          }

          .icon-btn--md .icon-btn__icon :global(svg) {
            width: var(--icon-btn-icon-md, 20px);
            height: var(--icon-btn-icon-md, 20px);
          }

          .icon-btn--lg .icon-btn__icon :global(svg) {
            width: var(--icon-btn-icon-lg, 24px);
            height: var(--icon-btn-icon-lg, 24px);
          }

          /* Ghost variant - transparent, themed hover */
          .icon-btn--ghost {
            background-color: var(--icon-btn-bg, transparent);
          }

          .icon-btn--ghost:hover:not(:disabled) {
            color: var(--icon-btn-hover-color, var(--color-text-primary));
            background-color: var(--icon-btn-hover-bg, hsla(0, 0%, 0%, 0.05));
          }

          .icon-btn--ghost:active:not(:disabled) {
            color: var(--icon-btn-active-color, var(--color-accent));
            background-color: var(--icon-btn-active-bg, hsla(0, 0%, 0%, 0.08));
          }

          /* Subtle variant - faint bg always visible */
          .icon-btn--subtle {
            background-color: var(--icon-btn-subtle-bg, hsla(0, 0%, 0%, 0.04));
          }

          .icon-btn--subtle:hover:not(:disabled) {
            color: var(--icon-btn-hover-color, var(--color-text-primary));
            background-color: var(--icon-btn-subtle-hover-bg, hsla(0, 0%, 0%, 0.08));
          }

          .icon-btn--subtle:active:not(:disabled) {
            color: var(--icon-btn-active-color, var(--color-accent));
            background-color: var(--icon-btn-active-bg, hsla(0, 0%, 0%, 0.12));
          }

          /* Outline variant - border + transparent bg */
          .icon-btn--outline {
            background-color: transparent;
            border: 1px solid var(--icon-btn-border, var(--color-border));
          }

          .icon-btn--outline:hover:not(:disabled) {
            color: var(--icon-btn-hover-color, var(--color-text-primary));
            border-color: var(--icon-btn-hover-border, var(--color-border-hover));
            background-color: var(--icon-btn-hover-bg, hsla(0, 0%, 0%, 0.05));
          }

          .icon-btn--outline:active:not(:disabled) {
            color: var(--icon-btn-active-color, var(--color-accent));
            background-color: var(--icon-btn-active-bg, hsla(0, 0%, 0%, 0.08));
          }

          /* Disabled state */
          .icon-btn:disabled {
            opacity: var(--disabled-opacity);
            cursor: not-allowed;
          }

          /* Focus state */
          .icon-btn:focus-visible {
            outline: 2px solid var(--color-accent, hsl(220, 90%, 56%));
            outline-offset: 2px;
          }

          /* Icon container */
          .icon-btn__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* Loading */
          .icon-btn--loading {
            cursor: wait;
          }

          .icon-btn__spinner {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .icon-btn__spinner-svg {
            width: 1em;
            height: 1em;
            animation: icon-btn-spin 1s linear infinite;
          }

          @keyframes icon-btn-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (prefers-reduced-motion: reduce) {
            .icon-btn {
              transition: none;
            }
            .icon-btn__spinner-svg {
              animation: none;
              opacity: 0.7;
            }
          }
        `}</style>
      </>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
