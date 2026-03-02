'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'
import { EmptyState } from './EmptyState'
import { AdaptiveGrid } from '@/components/layout/AdaptiveGrid'

interface GalleryImage {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  altText?: string
  caption?: string
  width?: number
  height?: number
}

interface ProjectGalleryProps {
  images: GalleryImage[]
  className?: string
  showEmptyState?: boolean
}

/**
 * ProjectGallery Component
 * 
 * Displays project images in a responsive grid with lightbox support:
 * - Desktop: 2-column layout for larger visual impact
 * - Mobile: Single column for scrolling
 * - Click image opens lightbox with keyboard navigation
 * - Orientation-aware: images display at their natural aspect ratio
 *   when dimensions are available, falls back to 3:2
 * - Professional empty state when no images
 */
export function ProjectGallery({ 
  images, 
  className = '',
  showEmptyState = true 
}: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Filter to valid images only
  const validImages = images.filter(img => img.imageUrl)
  
  // Deep linking: handle #image-{id} hash on mount
  // Use ref to avoid setState-in-effect lint warning - we read the hash
  // once on mount and schedule the lightbox open via microtask
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (deepLinkHandled.current) return
    deepLinkHandled.current = true
    
    const hash = window.location.hash;
    if (!hash.startsWith('#image-')) return;
    
    const imageId = hash.replace('#image-', '');
    const index = validImages.findIndex(img => img.id === imageId);
    
    if (index !== -1) {
      // Open lightbox to the targeted image after initial render
      queueMicrotask(() => setLightboxIndex(index));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validImages.length])
  
  // Show empty state if enabled and no valid images
  if (validImages.length === 0) {
    if (showEmptyState) {
      return (
        <EmptyState
          icon="image"
          title="No gallery images yet"
          message="Images will appear here once they're added to this project."
        />
      )
    }
    return null
  }
  
  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
  }
  
  const handleCloseLightbox = () => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setLightboxIndex(null)
  }
  
  const handleNavigate = (index: number) => {
    setLightboxIndex(index)
  }
  
  // Convert to lightbox format
  const lightboxImages = validImages.map(img => ({
    imageUrl: img.imageUrl,
    altText: img.altText,
    caption: img.caption,
  }))
  
  return (
    <>
      <AdaptiveGrid
        items={validImages}
        minCardWidth={300}
        idealCardWidth={500}
        maxCardWidth={700}
        className={className}
      >
        {validImages.map((image, index) => {
          // Use natural aspect ratio when dimensions are available
          const imageAspect = image.width && image.height
            ? image.width / image.height
            : undefined
          return (
            <button
              key={image.id}
              id={`gallery-image-${image.id}`}
              type="button"
              onClick={() => handleImageClick(index)}
              className="project-gallery-item"
              style={imageAspect ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}
              aria-label={`View ${image.altText || 'gallery image'} in full screen`}
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || 'Gallery image'}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="project-gallery-image"
                loading="lazy"
              />
            </button>
          )
        })}
      </AdaptiveGrid>
      
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}
