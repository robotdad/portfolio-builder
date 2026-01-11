'use client'

import { forwardRef, type HTMLAttributes } from 'react'

/* =============================================================================
   Skeleton Base
   ============================================================================= */

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width - can be any CSS value */
  width?: string | number
  /** Height - can be any CSS value */
  height?: string | number
  /** Border radius variant */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Animation style */
  animation?: 'shimmer' | 'pulse' | 'none'
}

/**
 * Base skeleton component for loading states.
 * 
 * @example
 * <Skeleton width={200} height={20} />
 * <Skeleton width="100%" height={40} radius="md" />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width,
      height,
      radius = 'md',
      animation = 'shimmer',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const radiusMap = {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    }

    return (
      <>
        <div
          ref={ref}
          className={`skeleton skeleton--${animation} ${className}`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: radiusMap[radius],
            ...style,
          }}
          aria-hidden="true"
          {...props}
        />

        <style jsx>{`
          .skeleton {
            background-color: var(--color-skeleton, hsl(0, 0%, 90%));
            position: relative;
            overflow: hidden;
          }

          .skeleton--shimmer::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              var(--color-skeleton-highlight, hsl(0, 0%, 96%)) 50%,
              transparent 100%
            );
            transform: translateX(-100%);
            animation: shimmer 1.5s infinite;
          }

          .skeleton--pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }

          .skeleton--none {
            /* No animation */
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .skeleton--shimmer::after {
              animation: none;
            }
            .skeleton--pulse {
              animation: none;
            }
          }
        `}</style>
      </>
    )
  }
)

Skeleton.displayName = 'Skeleton'

/* =============================================================================
   Skeleton Text
   ============================================================================= */

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of text lines to show */
  lines?: number
  /** Width of the last line (percentage or CSS value) */
  lastLineWidth?: string
  /** Line height */
  lineHeight?: string | number
  /** Gap between lines */
  gap?: string | number
}

/**
 * Skeleton for text content with multiple lines.
 * 
 * @example
 * <SkeletonText lines={3} lastLineWidth="60%" />
 */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  (
    {
      lines = 3,
      lastLineWidth = '70%',
      lineHeight = 16,
      gap = 8,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <>
        <div ref={ref} className={`skeleton-text ${className}`} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              width={i === lines - 1 ? lastLineWidth : '100%'}
              height={lineHeight}
              radius="sm"
            />
          ))}
        </div>

        <style jsx>{`
          .skeleton-text {
            display: flex;
            flex-direction: column;
            gap: ${typeof gap === 'number' ? `${gap}px` : gap};
          }
        `}</style>
      </>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'

/* =============================================================================
   Skeleton Card
   ============================================================================= */

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio for the image area */
  aspectRatio?: '16/9' | '4/3' | '3/2' | '1/1'
  /** Show text skeleton below image */
  showText?: boolean
  /** Number of text lines */
  textLines?: number
}

/**
 * Pre-composed skeleton for card layouts.
 * 
 * @example
 * <SkeletonCard aspectRatio="16/9" showText textLines={2} />
 */
export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    {
      aspectRatio = '16/9',
      showText = true,
      textLines = 2,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingMap = {
      '16/9': '56.25%',
      '4/3': '75%',
      '3/2': '66.67%',
      '1/1': '100%',
    }

    return (
      <>
        <div ref={ref} className={`skeleton-card ${className}`} {...props}>
          <div className="skeleton-card__image">
            <Skeleton width="100%" height="100%" radius="none" />
          </div>
          {showText && (
            <div className="skeleton-card__content">
              <Skeleton width="70%" height={20} radius="sm" />
              {textLines > 1 && (
                <SkeletonText lines={textLines - 1} lineHeight={14} gap={6} />
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          .skeleton-card {
            border-radius: var(--card-radius, 12px);
            overflow: hidden;
            background-color: var(--color-surface, white);
            border: 1px solid var(--color-border, hsl(0, 0%, 88%));
          }

          .skeleton-card__image {
            position: relative;
            padding-top: ${paddingMap[aspectRatio]};
          }

          .skeleton-card__image :global(.skeleton) {
            position: absolute;
            top: 0;
            left: 0;
          }

          .skeleton-card__content {
            padding: var(--space-4, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--space-3, 12px);
          }
        `}</style>
      </>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'

/* =============================================================================
   Skeleton Grid
   ============================================================================= */

export interface SkeletonGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton cards to show */
  count?: number
  /** Grid columns (responsive) */
  columns?: { mobile?: number; tablet?: number; desktop?: number }
  /** Card aspect ratio */
  aspectRatio?: '16/9' | '4/3' | '3/2' | '1/1'
  /** Show text on cards */
  showText?: boolean
}

/**
 * Grid of skeleton cards for list loading states.
 * 
 * @example
 * <SkeletonGrid count={6} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
 */
export const SkeletonGrid = forwardRef<HTMLDivElement, SkeletonGridProps>(
  (
    {
      count = 6,
      columns = { mobile: 1, tablet: 2, desktop: 3 },
      aspectRatio = '16/9',
      showText = true,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <>
        <div ref={ref} className={`skeleton-grid ${className}`} {...props}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} aspectRatio={aspectRatio} showText={showText} />
          ))}
        </div>

        <style jsx>{`
          .skeleton-grid {
            display: grid;
            gap: var(--space-6, 24px);
            grid-template-columns: repeat(${columns.mobile || 1}, 1fr);
          }

          @media (min-width: 768px) {
            .skeleton-grid {
              grid-template-columns: repeat(${columns.tablet || 2}, 1fr);
            }
          }

          @media (min-width: 1024px) {
            .skeleton-grid {
              grid-template-columns: repeat(${columns.desktop || 3}, 1fr);
            }
          }
        `}</style>
      </>
    )
  }
)

SkeletonGrid.displayName = 'SkeletonGrid'

/* =============================================================================
   Skeleton Avatar
   ============================================================================= */

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | number
}

/**
 * Circular skeleton for avatars/profile images.
 */
export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className = '', ...props }, ref) => {
    const sizeMap = {
      sm: 32,
      md: 48,
      lg: 80,
    }
    const pixels = typeof size === 'number' ? size : sizeMap[size]

    return (
      <Skeleton
        ref={ref}
        width={pixels}
        height={pixels}
        radius="full"
        className={className}
        {...props}
      />
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

export default Skeleton
