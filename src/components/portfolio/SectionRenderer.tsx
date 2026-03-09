'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import { getAspectRatioClass } from '@/lib/image-helpers'
import { ImageCard } from './ImageCard'
import { Lightbox } from './Lightbox'
import { EmptyState } from './EmptyState'
import { AdaptiveGrid } from '@/components/layout/AdaptiveGrid'
import type { 
  Section, 
  TextSection, 
  ImageSection, 
  HeroSection, 
  FeaturedGridSection,
  GallerySection,
  GalleryImage,
  LayoutTwoColumnSection,
  LayoutThreeColumnSection,
  LayoutSidebarSection,
  ProjectListSection,
} from '@/lib/content-schema'
import { FeaturedCarouselDisplay } from './FeaturedCarouselDisplay'
import { CategoryGridRenderer } from './CategoryGridRenderer'
import { ProjectGridRenderer } from './ProjectGridRenderer'
import { ProjectListRenderer } from './ProjectListRenderer'
import { LayoutTwoColumnRenderer } from './layouts/LayoutTwoColumnRenderer'
import { LayoutThreeColumnRenderer } from './layouts/LayoutThreeColumnRenderer'
import { LayoutSidebarRenderer } from './layouts/LayoutSidebarRenderer'

// Type for categories with project count
interface CategoryWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string
    width?: number
    height?: number
  } | null
  _count: {
    projects: number
  }
}

// Type for projects with featured image
interface ProjectWithImage {
  id: string
  title: string
  slug: string
  year: string | null
  venue: string | null
  role: string | null
  order: number
  featuredImage: {
    id: string
    url: string
    thumbnailUrl: string
    altText: string
    width?: number
    height?: number
  } | null
}

interface SectionRendererProps {
  sections: Section[]
  portfolioSlug: string
  categories?: CategoryWithCount[]
  categorySlug?: string
  projects?: ProjectWithImage[]
}

/**
 * Renders an array of sections on the public portfolio page
 */
export function SectionRenderer({ sections, portfolioSlug, categories, categorySlug, projects }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionComponent 
          key={section.id} 
          section={section} 
          portfolioSlug={portfolioSlug}
          categories={categories}
          categorySlug={categorySlug}
          projects={projects}
        />
      ))}
    </>
  )
}

interface SectionComponentProps {
  section: Section
  portfolioSlug: string
  categories?: CategoryWithCount[]
  categorySlug?: string
  projects?: ProjectWithImage[]
}

function SectionComponent({ section, portfolioSlug, categories, categorySlug, projects }: SectionComponentProps) {
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
    case 'category-grid':
      if (!categories) {
        console.warn('CategoryGridSection requires categories prop')
        return null
      }
      return <CategoryGridRenderer section={section} categories={categories} portfolioSlug={portfolioSlug} />
    case 'project-grid':
      if (!projects || !categorySlug) {
        console.warn('ProjectGridSection requires projects and categorySlug props')
        return null
      }
      return <ProjectGridRenderer section={section} projects={projects} categorySlug={categorySlug} portfolioSlug={portfolioSlug} />
    case 'project-list':
      return <ProjectListRenderer section={section as ProjectListSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
    case 'layout-two-column':
      return <LayoutTwoColumnRenderer section={section as LayoutTwoColumnSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
    case 'layout-three-column':
      return <LayoutThreeColumnRenderer section={section as LayoutThreeColumnSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
    case 'layout-sidebar':
      return <LayoutSidebarRenderer section={section as LayoutSidebarSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
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
  
  // Use natural aspect ratio when image dimensions are available in the section,
  // otherwise fall back to 3/2 (a moderate default that works for both orientations)
  const sectionWithDims = section as ImageSection & { width?: number; height?: number }
  const hasNaturalDims = !!(sectionWithDims.width && sectionWithDims.height)
  const aspectRatio = hasNaturalDims
    ? `${sectionWithDims.width} / ${sectionWithDims.height}`
    : '3 / 2'
  
  // Portrait images need a fundamentally different container strategy:
  // constrain by height (85vh) and let width be natural, centered.
  // Landscape/square images use full-width containers with natural aspect ratio.
  const orientation = hasNaturalDims
    ? getAspectRatioClass(sectionWithDims.width!, sectionWithDims.height!)
    : 'landscape'
  const isPortrait = orientation === 'portrait'
  
  return (
    <section className={`section section-image section-image--${orientation}`}>
      <figure className="image-figure">
        {isPortrait && hasNaturalDims ? (
          // Portrait: constrain height to viewport, let width follow aspect ratio, center
          <div className="image-portrait-container">
            <Image 
              src={section.imageUrl} 
              alt={section.altText || ''} 
              className="section-image-img section-image-img--portrait"
              width={sectionWithDims.width!}
              height={sectionWithDims.height!}
              unoptimized
            />
          </div>
        ) : (
          // Landscape/square: full width with natural aspect ratio
          <div style={{ position: 'relative', width: '100%', aspectRatio }}>
            <Image 
              src={section.imageUrl} 
              alt={section.altText || ''} 
              className="section-image-img"
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
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
          <div className="hero-profile-image" style={{ position: 'relative', width: 150, height: 150 }}>
            <Image
              src={section.profileImageUrl}
              alt={`${section.name}'s profile photo`}
              fill
              unoptimized
              style={{ objectFit: 'cover', borderRadius: '50%' }}
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

// Featured Grid Section View with Empty State
function FeaturedGridView({ section }: { section: FeaturedGridSection }) {
  // Show empty state if no items (instead of returning null)
  if (section.items.length === 0) {
    return (
      <section className="section section-featured-grid">
        {section.heading && (
          <h2 className="featured-grid-heading">{section.heading}</h2>
        )}
        <EmptyState
          icon="grid"
          title="No featured projects yet"
          message="Mark projects as featured in the admin panel to showcase them here."
        />
      </section>
    )
  }
  
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
            width={item.width}
            height={item.height}
          />
        ))}
      </div>
    </section>
  )
}

// Gallery Section View with pagination
const IMAGES_PER_PAGE = 20

function GallerySectionView({ section }: { section: GallerySection }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  
  // Filter and map to ensure imageUrl is definitely a string for Lightbox
  const validImages = section.images
    .filter((img): img is GalleryImage & { imageUrl: string } => Boolean(img.imageUrl))

  const [displayCount, setDisplayCount] = useState(IMAGES_PER_PAGE)
  
  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + IMAGES_PER_PAGE, validImages.length))
  }, [validImages.length])

  // Deep-link: handle #image-{id} hash on mount to open lightbox at specific image.
  // Uses queueMicrotask to batch pagination expansion + lightbox open into the next
  // microtask, avoiding the "synchronous setState in effect" lint warning.
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (deepLinkHandled.current) return
    const hash = window.location.hash
    if (!hash.startsWith('#image-')) return

    const imageId = hash.replace('#image-', '')
    const index = validImages.findIndex(img => img.imageId === imageId)
    if (index === -1) return

    deepLinkHandled.current = true
    // Expand pagination if needed, then open lightbox on next microtask
    // so the DOM renders with the target image visible first.
    queueMicrotask(() => {
      if (index >= displayCount) {
        setDisplayCount(index + IMAGES_PER_PAGE)
      }
      // Wait one more frame for pagination expansion to render
      requestAnimationFrame(() => setLightboxIndex(index))
    })
  }, [validImages, displayCount])

  // Scroll-to-load: IntersectionObserver watches a sentinel element
  // and loads more images before the user reaches the bottom
  useEffect(() => {
    if (!sentinelRef.current || displayCount >= validImages.length) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [displayCount, validImages.length, loadMore])

  // Show empty state for gallery sections with no images
  if (validImages.length === 0) {
    return (
      <section className="section section-gallery">
        {section.heading && (
          <h2 className="gallery-heading">{section.heading}</h2>
        )}
        <EmptyState
          icon="image"
          title="No gallery images yet"
          message="Add images to this gallery to showcase your work."
        />
      </section>
    )
  }
  
  const visibleImages = validImages.slice(0, displayCount)
  const hasMore = displayCount < validImages.length
  const remainingCount = validImages.length - displayCount

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
      
      <AdaptiveGrid
        items={visibleImages}
        minCardWidth={300}
        idealCardWidth={500}
        maxCardWidth={700}
      >
        {visibleImages.map((image, index) => {
          // When altText is shown as a visible caption, use generic alt to avoid
          // screen readers announcing the same text twice
          const showingAltAsCaption = !image.caption && !!image.altText
          const effectiveAlt = showingAltAsCaption
            ? 'Gallery image'
            : (image.altText || 'Gallery image')
          return (
          <figure key={image.id} id={image.imageId ? `image-${image.imageId}` : undefined} className="gallery-item">
            <button
              type="button"
              onClick={() => handleImageClick(index)}
              className="project-gallery-item"
              style={image.width && image.height ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}
              aria-label={`View ${image.altText || 'image'} in lightbox`}
            >
              <Image
                src={image.imageUrl || ''}
                alt={effectiveAlt}
                className="project-gallery-image"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </button>
            {(image.caption || image.altText) && (
              <figcaption className="gallery-item-caption">
                {image.caption || image.altText}
              </figcaption>
            )}
          </figure>
          )
        })}
      </AdaptiveGrid>
      
      {hasMore && (
        <>
          <div ref={sentinelRef} className="gallery-load-sentinel" aria-hidden="true" />
          <div className="gallery-loading-hint">
            <span>{remainingCount} more</span>
          </div>
        </>
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
