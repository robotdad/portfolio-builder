'use client'

import { useState } from 'react'
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
 * - 3:2 aspect ratio for gallery images
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
        minCardWidth={250}
        idealCardWidth={400}
        maxCardWidth={550}
        className={className}
      >
        {validImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => handleImageClick(index)}
            className="project-gallery-item"
            aria-label={`View ${image.altText || 'gallery image'} in full screen`}
          >
            <Image
              src={image.imageUrl}
              alt={image.altText || 'Gallery image'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="project-gallery-image"
              loading="lazy"
            />
          </button>
        ))}
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
