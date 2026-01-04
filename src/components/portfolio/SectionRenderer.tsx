'use client'

import { useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'
import { ImageCard } from './ImageCard'
import { Lightbox } from './Lightbox'
import type { 
  Section, 
  TextSection, 
  ImageSection, 
  HeroSection, 
  FeaturedGridSection,
  FeaturedCarouselSection,
  GallerySection,
  GalleryImage,
} from '@/lib/content-schema'
import { FeaturedCarouselDisplay } from './FeaturedCarouselDisplay'

interface SectionRendererProps {
  sections: Section[]
  portfolioSlug: string
}

/**
 * Renders an array of sections on the public portfolio page
 */
export function SectionRenderer({ sections, portfolioSlug }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionComponent key={section.id} section={section} portfolioSlug={portfolioSlug} />
      ))}
    </>
  )
}

interface SectionComponentProps {
  section: Section
  portfolioSlug: string
}

function SectionComponent({ section, portfolioSlug }: SectionComponentProps) {
  switch (section.type) {
    case 'text':
      return <TextSectionView section={section} />
    case 'image':
      return <ImageSectionView section={section} />
    case 'hero':
      return <HeroSectionView section={section} />
    case 'featured-grid':
      return <FeaturedGridView section={section} />
    case 'featured-carousel':
      return <FeaturedCarouselDisplay section={section} portfolioSlug={portfolioSlug} />
    case 'gallery':
      return <GallerySectionView section={section} />
    default:
      return null
  }
}

// Text Section View
function TextSectionView({ section }: { section: TextSection }) {
  if (!section.content) return null
  
  return (
    <section className="section section-text">
      <div 
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
      />
    </section>
  )
}

// Image Section View
function ImageSectionView({ section }: { section: ImageSection }) {
  if (!section.imageUrl) return null
  
  return (
    <section className="section section-image">
      <figure className="image-figure">
        <img 
          src={section.imageUrl} 
          alt={section.altText || ''} 
          className="section-image-img"
          loading="lazy"
        />
        {section.caption && (
          <figcaption className="image-caption">
            {section.caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}

// Hero Section View
function HeroSectionView({ section }: { section: HeroSection }) {
  return (
    <section className="section section-hero">
      <div className="hero-content">
        {section.profileImageUrl && (
          <div className="hero-profile-image">
            <img
              src={section.profileImageUrl}
              alt={`${section.name}'s profile photo`}
              width={150}
              height={150}
            />
          </div>
        )}
        
        {section.name && (
          <h1 className="hero-name">{section.name}</h1>
        )}
        
        {section.title && (
          <p className="hero-title">{section.title}</p>
        )}
        
        {section.bio && (
          <div
            className="hero-bio prose-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.bio) }}
          />
        )}
        
        {section.showResumeLink && section.resumeUrl && (
          <a 
            href={section.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-resume-link btn btn-secondary"
          >
            View Resume →
          </a>
        )}
      </div>
    </section>
  )
}

// Featured Grid Section View
function FeaturedGridView({ section }: { section: FeaturedGridSection }) {
  if (section.items.length === 0) return null
  
  return (
    <section className="section section-featured-grid">
      {section.heading && (
        <h2 className="featured-grid-heading">{section.heading}</h2>
      )}
      
      <div className="featured-grid">
        {section.items.map((item) => (
          <ImageCard
            key={item.id}
            imageUrl={item.imageUrl}
            title={item.title}
            category={item.category}
            link={item.link}
            altText={item.title}
          />
        ))}
      </div>
    </section>
  )
}

// Gallery Section View with pagination
const IMAGES_PER_PAGE = 20

function GallerySectionView({ section }: { section: GallerySection }) {
  const [displayCount, setDisplayCount] = useState(IMAGES_PER_PAGE)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Filter and map to ensure imageUrl is definitely a string for Lightbox
  const validImages = section.images
    .filter((img): img is GalleryImage & { imageUrl: string } => Boolean(img.imageUrl))
  
  if (validImages.length === 0) return null
  
  const visibleImages = validImages.slice(0, displayCount)
  const hasMore = displayCount < validImages.length
  const remainingCount = validImages.length - displayCount
  
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + IMAGES_PER_PAGE)
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
  
  return (
    <section className="section section-gallery">
      {section.heading && (
        <h2 className="gallery-heading">{section.heading}</h2>
      )}
      
      <div className="gallery-grid">
        {visibleImages.map((image, index) => (
          <figure key={image.id} className="gallery-item">
            <button
              type="button"
              onClick={() => handleImageClick(index)}
              className="gallery-item-btn"
              aria-label={`View ${image.altText || 'image'} in lightbox`}
            >
              <img
                src={image.imageUrl || ''}
                alt={image.altText || 'Gallery image'}
                loading="lazy"
                className="gallery-item-img"
              />
            </button>
            {image.caption && (
              <figcaption className="gallery-item-caption">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      
      {hasMore && (
        <div className="gallery-load-more">
          <button
            type="button"
            onClick={handleLoadMore}
            className="btn btn-secondary"
          >
            Load More ({remainingCount} remaining)
          </button>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={validImages}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigate}
        />
      )}
    </section>
  )
}
