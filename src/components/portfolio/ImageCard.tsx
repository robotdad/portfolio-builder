'use client'

import { useState } from 'react'
import Link from 'next/link'

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
          <img 
            src={imageUrl} 
            alt={altText || title || 'Portfolio work'} 
            className="image-card-image"
            loading="lazy"
          />
        ) : (
          <div className="image-card-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
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
