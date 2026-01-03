'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'

interface GalleryImage {
  id: string
  url: string
  thumbnailUrl?: string
  altText?: string
  caption?: string
}

interface ProjectGalleryProps {
  images: GalleryImage[]
  className?: string
}

/**
 * ProjectGallery Component
 * 
 * Displays project images in a responsive grid with lightbox support:
 * - Desktop: 2-column layout for larger visual impact
 * - Mobile: Single column for scrolling
 * - Click image opens lightbox with keyboard navigation
 * - 3:2 aspect ratio for gallery images
 */
export function ProjectGallery({ images, className = '' }: ProjectGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Filter to valid images only
  const validImages = images.filter(img => img.url)
  
  if (validImages.length === 0) return null
  
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
    imageUrl: img.url,
    altText: img.altText,
    caption: img.caption,
  }))
  
  return (
    <>
      <div className={`project-gallery ${className}`}>
        {validImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => handleImageClick(index)}
            className="project-gallery-item"
            aria-label={`View ${image.altText || 'gallery image'} in full screen`}
          >
            <Image
              src={image.url}
              alt={image.altText || 'Gallery image'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="project-gallery-image"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      
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
