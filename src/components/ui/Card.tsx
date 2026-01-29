'use client'

import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react'
import Image from 'next/image'

/* =============================================================================
   Card Root
   ============================================================================= */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive'
  /** Selected state (for selectable cards like ThemeCard) */
  isSelected?: boolean
  /** Dragging state (for drag-and-drop) */
  isDragging?: boolean
  /** Make the entire card clickable */
  asButton?: boolean
}

/**
 * Card container component - the root of a composable card.
 * 
 * @example
 * <Card variant="interactive">
 *   <CardImage src="/image.jpg" alt="Project" />
 *   <CardBody>
 *     <CardTitle>Project Name</CardTitle>
 *     <CardDescription>Description here</CardDescription>
 *   </CardBody>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      isSelected = false,
      isDragging = false,
      asButton = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <div
          ref={ref}
          role={asButton ? 'button' : undefined}
          tabIndex={asButton ? 0 : undefined}
          className={`
            card
            card--${variant}
            ${isSelected ? 'card--selected' : ''}
            ${isDragging ? 'card--dragging' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        >
          {children}
        </div>

        <style jsx>{`
          .card {
            /* Layout */
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            
            /* Appearance */
            background-color: var(--color-surface, white);
            border-radius: var(--card-radius, 12px);
            
            /* Transitions */
            transition: 
              box-shadow var(--transition-fast, 150ms) ease,
              border-color var(--transition-fast, 150ms) ease,
              transform var(--transition-fast, 150ms) ease,
              opacity var(--transition-fast, 150ms) ease;
          }

          /* Variants */
          .card--default {
            border: 1px solid var(--color-border, hsl(0, 0%, 88%));
          }

          .card--elevated {
            box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
          }

          .card--outlined {
            border: 1px solid var(--color-border, hsl(0, 0%, 88%));
            background-color: transparent;
          }

          .card--interactive {
            border: 1px solid var(--color-border, hsl(0, 0%, 88%));
            cursor: pointer;
          }

          .card--interactive:hover {
            border-color: var(--color-border-hover, hsl(0, 0%, 70%));
            box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
          }

          .card--interactive:focus-visible {
            outline: 2px solid var(--color-accent, hsl(220, 90%, 56%));
            outline-offset: 2px;
          }

          /* States */
          .card--selected {
            border-color: var(--color-accent, hsl(220, 90%, 56%));
            border-width: 2px;
          }

          .card--dragging {
            opacity: 0.7;
            transform: scale(1.02);
            box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
          }
        `}</style>
      </>
    )
  }
)

Card.displayName = 'Card'

/* =============================================================================
   Card Image
   ============================================================================= */

export interface CardImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Image source - can be a URL string or Blob for optimistic previews */
  src?: string | Blob
  /** Aspect ratio - defaults to 16:9 (project standard) */
  aspectRatio?: '16/9' | '4/3' | '3/2' | '1/1' | '3/4'
  /** Show overlay on hover */
  hoverOverlay?: ReactNode
}

/**
 * Card image component with consistent aspect ratio handling.
 */
export const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  (
    {
      aspectRatio = '16/9',
      hoverOverlay,
      src,
      alt = '',
      className = '',
      ..._props
    },
    ref
  ) => {
    // Calculate padding percentage for aspect ratio
    const paddingMap = {
      '16/9': '56.25%',
      '4/3': '75%',
      '3/2': '66.67%',
      '1/1': '100%',
      '3/4': '133.33%', // Portrait: height is 1.33x width
    }

    return (
      <>
        <div ref={ref} className={`card-image ${className}`}>
          <div className="card-image__wrapper">
            {src ? (
              // Use regular <img> for Blob sources (optimistic previews), Next.js Image for URLs
              src instanceof Blob ? (
                // eslint-disable-next-line @next/next/no-img-element -- Blob URLs not supported by next/image
                <img src={URL.createObjectURL(src)} alt={alt} className="card-image__img" style={{ objectFit: 'cover' }} />
              ) : (
                <Image src={src} alt={alt} className="card-image__img" fill unoptimized style={{ objectFit: 'cover' }} />
              )
            ) : (
              <div className="card-image__placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
            {hoverOverlay && (
              <div className="card-image__overlay">
                {hoverOverlay}
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .card-image {
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
          }

          .card-image__wrapper {
            position: relative;
            padding-top: ${paddingMap[aspectRatio]};
            background-color: var(--color-surface-dim, hsl(0, 0%, 96%));
          }

          .card-image__img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* object-fit controlled by inline style for flexibility */
            transition: transform var(--transition-base, 200ms) ease;
          }

          .card--interactive:hover .card-image__img {
            transform: scale(1.02);
          }

          .card-image__placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-muted, hsl(0, 0%, 60%));
          }

          .card-image__placeholder svg {
            width: 48px;
            height: 48px;
          }

          .card-image__overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity var(--transition-fast, 150ms) ease;
          }

          .card--interactive:hover .card-image__overlay,
          .card-image:hover .card-image__overlay {
            opacity: 1;
          }

          @media (hover: none) {
            .card-image__overlay {
              opacity: 1;
              background-color: rgba(0, 0, 0, 0.3);
            }
          }
        `}</style>
      </>
    )
  }
)

CardImage.displayName = 'CardImage'

/* =============================================================================
   Card Header
   ============================================================================= */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Action buttons/icons to show on the right */
  actions?: ReactNode
}

/**
 * Card header with optional action buttons.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ actions, className = '', children, ...props }, ref) => {
    return (
      <>
        <div ref={ref} className={`card-header ${className}`} {...props}>
          <div className="card-header__content">{children}</div>
          {actions && <div className="card-header__actions">{actions}</div>}
        </div>

        <style jsx>{`
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-3, 12px);
            padding: var(--space-4, 16px);
            border-bottom: 1px solid var(--color-border-subtle, hsl(0, 0%, 92%));
          }

          .card-header__content {
            flex: 1;
            min-width: 0;
          }

          .card-header__actions {
            display: flex;
            align-items: center;
            gap: var(--space-2, 8px);
            flex-shrink: 0;
          }
        `}</style>
      </>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/* =============================================================================
   Card Body
   ============================================================================= */

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean
}

/**
 * Card body/content area.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ noPadding = false, className = '', children, ...props }, ref) => {
    return (
      <>
        <div
          ref={ref}
          className={`card-body ${noPadding ? 'card-body--no-padding' : ''} ${className}`}
          {...props}
        >
          {children}
        </div>

        <style jsx>{`
          .card-body {
            flex: 1;
            padding: var(--space-4, 16px);
          }

          .card-body--no-padding {
            padding: 0;
          }
        `}</style>
      </>
    )
  }
)

CardBody.displayName = 'CardBody'

/* =============================================================================
   Card Footer
   ============================================================================= */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Align content */
  align?: 'start' | 'center' | 'end' | 'between'
}

/**
 * Card footer, typically for actions.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'end', className = '', children, ...props }, ref) => {
    return (
      <>
        <div ref={ref} className={`card-footer card-footer--${align} ${className}`} {...props}>
          {children}
        </div>

        <style jsx>{`
          .card-footer {
            display: flex;
            align-items: center;
            gap: var(--space-3, 12px);
            padding: var(--space-4, 16px);
            border-top: 1px solid var(--color-border-subtle, hsl(0, 0%, 92%));
          }

          .card-footer--start {
            justify-content: flex-start;
          }

          .card-footer--center {
            justify-content: center;
          }

          .card-footer--end {
            justify-content: flex-end;
          }

          .card-footer--between {
            justify-content: space-between;
          }
        `}</style>
      </>
    )
  }
)

CardFooter.displayName = 'CardFooter'

/* =============================================================================
   Card Title & Description (convenience components)
   ============================================================================= */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Tag = 'h3', className = '', children, ...props }, ref) => {
    return (
      <>
        <Tag ref={ref} className={`card-title ${className}`} {...props}>
          {children}
        </Tag>

        <style jsx>{`
          .card-title {
            margin: 0;
            font-size: var(--font-size-lg, 1.125rem);
            font-weight: 600;
            line-height: 1.3;
            color: var(--color-text, hsl(0, 0%, 13%));
          }
        `}</style>
      </>
    )
  }
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <>
        <p ref={ref} className={`card-description ${className}`} {...props}>
          {children}
        </p>

        <style jsx>{`
          .card-description {
            margin: var(--space-2, 8px) 0 0;
            font-size: var(--font-size-sm, 0.875rem);
            line-height: 1.5;
            color: var(--color-text-muted, hsl(0, 0%, 45%));
          }
        `}</style>
      </>
    )
  }
)

CardDescription.displayName = 'CardDescription'

export default Card
