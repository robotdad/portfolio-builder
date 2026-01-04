'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageWithFallback, ImageFallback } from './ImageFallback'

interface ImageCardProps {
  imageUrl: string | null
  title: string
  category: string
  link?: string
  altText?: string
}

/**
 * ImageCard with Hover Overlay
 * 
 * Design spec implementation:
 * - Default: Clean image display with aspect ratio preserved
 * - Hover: Scale 1.05, overlay opacity 0.9, reveal title/category
 * - Transition: 200ms ease for smooth motion
 * - Mobile: Touch-friendly with tap to reveal overlay
 */
export function ImageCard({ 
  imageUrl, 
  title, 
  category, 
  link,
  altText,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTouched, setIsTouched] = useState(false)

  // For mobile: toggle overlay on touch
  const handleTouchStart = () => {
    setIsTouched(!isTouched)
  }

  const isActive = isHovered || isTouched

  const cardContent = (
    <div 
      className={`image-card ${isActive ? 'image-card-active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
    >
      <div className="image-card-image-wrapper">
        {imageUrl ? (
          <ImageWithFallback 
            src={imageUrl} 
            alt={altText || title || 'Portfolio work'} 
            className="image-card-image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallbackMessage="Image unavailable"
          />
        ) : (
          <ImageFallback 
            message="No image"
            className="image-card-placeholder"
          />
        )}
      </div>
      
      <div className={`image-card-overlay ${isActive ? 'image-card-overlay-visible' : ''}`}>
        <div className="image-card-content">
          {category && (
            <span className="image-card-category">{category}</span>
          )}
          {title && (
            <h3 className="image-card-title">{title}</h3>
          )}
        </div>
      </div>
    </div>
  )

  // If link is provided, wrap in Link component
  if (link) {
    // Check if it's an internal or external link
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
        </a>
      )
    }
    
    return (
      <Link href={link} className="image-card-link">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
