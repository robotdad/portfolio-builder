'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardImage } from '@/components/ui'
import { getAspectRatioClass, getOrientationAwareRatio } from '@/lib/image-helpers'

interface ImageCardProps {
  imageUrl: string | null
  title: string
  category: string
  link?: string
  altText?: string
  width?: number
  height?: number
}

/**
 * ImageCard with Hover Overlay
 * 
 * Migrated to use Card primitives:
 * - Card variant="interactive" for hover states
 * - CardImage with hoverOverlay for title/category reveal
 * - Preserves touch toggle behavior for mobile
 */
export function ImageCard({ 
  imageUrl, 
  title, 
  category, 
  link,
  altText,
  width,
  height,
}: ImageCardProps) {
  const [showInfo, setShowInfo] = useState(false)

  // Calculate aspect ratio class for grid layout
  const aspectClass = width && height
    ? getAspectRatioClass(width, height)
    : 'square' // Default to square if dimensions unknown

  // Pick the closest aspect ratio preset based on actual image dimensions
  const displayRatio = width && height
    ? getOrientationAwareRatio(width, height)
    : '4/3' // Safe default when dimensions unknown

  // Toggle overlay on touch for mobile
  const handleTouchStart = () => {
    setShowInfo(prev => !prev)
  }

  const overlayContent = (
    <div className="image-card-overlay-content">
      {category && (
        <span className="image-card-category">{category}</span>
      )}
      {title && (
        <h3 className="image-card-title">{title}</h3>
      )}

      <style jsx>{`
        .image-card-overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-4, 16px);
          color: white;
        }

        .image-card-category {
          font-size: var(--font-size-xs, 0.75rem);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.9;
          margin-bottom: var(--space-2, 8px);
        }

        .image-card-title {
          margin: 0;
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: 600;
          line-height: 1.3;
        }
      `}</style>
    </div>
  )

  const cardContent = (
    <Card 
      variant="interactive"
      className={`image-card image-card--${aspectClass} ${showInfo ? 'image-card--show-info' : ''}`}
      onTouchStart={handleTouchStart}
    >
      <CardImage
        src={imageUrl || undefined}
        alt={altText || title || 'Portfolio work'}
        aspectRatio={displayRatio}
        hoverOverlay={overlayContent}
      />

      <style jsx global>{`
        /* Touch toggle: hide overlay by default on touch devices, show when toggled */
        @media (hover: none) {
          .image-card--show-info .card-image__overlay {
            opacity: 1 !important;
          }
          
          .card:not(.image-card--show-info) .card-image__overlay {
            opacity: 0 !important;
          }
        }
      `}</style>
    </Card>
  )

  // Handle linking
  if (link) {
    const isExternal = link.startsWith('http') || link.startsWith('//')
    
    if (isExternal) {
      return (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="image-card-link"
        >
          {cardContent}
          <style jsx>{`
            .image-card-link {
              display: block;
              text-decoration: none;
              color: inherit;
            }
          `}</style>
        </a>
      )
    }
    
    return (
      <Link href={link} className="image-card-link">
        {cardContent}
        <style jsx>{`
          .image-card-link {
            display: block;
            text-decoration: none;
            color: inherit;
          }
        `}</style>
      </Link>
    )
  }

  return cardContent
}
