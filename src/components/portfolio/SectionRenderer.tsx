'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import { ImageCard } from './ImageCard'
import { Lightbox } from './Lightbox'
import { EmptyState } from './EmptyState'
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
  
  return (
    <section className="section section-image">
      <figure className="image-figure">
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <Image 
            src={section.imageUrl} 
            alt={section.altText || ''} 
            className="section-image-img"
            fill
            unoptimized
            style={{ objectFit: 'cover' }}
          />
        </div>
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
              <Image
                src={image.imageUrl || ''}
                alt={image.altText || 'Gallery image'}
                className="gallery-item-img"
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
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
