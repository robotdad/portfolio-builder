'use client';

/**
 * GalleryGrid Component
 * 
 * Displays multiple images in organized responsive grid
 * - Desktop: 4 columns (thumbnail) or 2 columns (large)
 * - Tablet: 3 columns (thumbnail) or 2 columns (large)
 * - Mobile: 2 columns (thumbnail) or 1 column (large)
 * - Lightbox on click
 */

import React, { useState } from 'react';
import { Image } from '@/data/types';
import Lightbox from './Lightbox';

interface GalleryGridProps {
  images: Image[];
  variant?: 'thumbnail' | 'large'; // thumbnail = 4-col small, large = 2-col with captions
  onImageClick?: (image: Image, index: number) => void;
}

export default function GalleryGrid({ images, variant = 'thumbnail', onImageClick }: GalleryGridProps) {
  const isLarge = variant === 'large';
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: isLarge ? 'var(--space-6)' : 'var(--space-4)',
    width: '100%',
  };

  const itemStyles: React.CSSProperties = {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: onImageClick ? 'pointer' : 'default',
    background: 'var(--color-surface)',
  };

  const imageContainerStyles: React.CSSProperties = isLarge ? {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
  } : {
    position: 'relative',
    aspectRatio: '3/2',
    overflow: 'hidden',
    borderRadius: '8px',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: isLarge ? 'auto' : '100%',
    objectFit: isLarge ? 'contain' : 'cover',
    display: 'block',
    backgroundColor: isLarge ? 'transparent' : 'var(--color-surface)',
    transition: 'transform 200ms var(--ease-smooth)',
  };

  const captionStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-primary)',
    marginTop: 'var(--space-3)',
    lineHeight: 'var(--line-height-body)',
  };

  const handleClick = (image: Image, index: number) => {
    setLightboxIndex(index);
    if (onImageClick) {
      onImageClick(image, index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, image: Image, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(image, index);
    }
  };

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Gallery Grid */}
      <div 
        style={gridStyles}
        className={`gallery-grid gallery-${variant}`}
        role="list"
        aria-label="Project image gallery"
      >
        {images.map((image, index) => (
          <figure
            key={image.id}
            style={itemStyles}
            className="gallery-item"
            role="listitem"
          >
            <div
              style={imageContainerStyles}
              onClick={() => handleClick(image, index)}
              onKeyDown={(e) => handleKeyDown(e, image, index)}
              tabIndex={onImageClick ? 0 : undefined}
              aria-label={`View image ${index + 1} of ${images.length}: ${image.alt}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                style={imageStyles}
                loading={index < 8 ? 'eager' : 'lazy'}
              />
            </div>
            {isLarge && (image.caption || image.alt) && (
              <figcaption style={captionStyles}>
                {image.caption || image.alt}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <style jsx>{`
        /* Large variant: 2 columns on desktop, 1 on mobile */
        .gallery-large {
          grid-template-columns: 1fr;
        }
        
        @media (min-width: 768px) {
          .gallery-large {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Thumbnail variant: 4/3/2 columns */
        @media (min-width: 1024px) {
          .gallery-thumbnail {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .gallery-thumbnail {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 639px) {
          .gallery-thumbnail {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Hover effect on desktop */
        @media (hover: hover) and (pointer: fine) {
          .gallery-item:hover img {
            transform: scale(1.05);
          }
        }

        /* Focus state for keyboard navigation */
        .gallery-item div:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}
