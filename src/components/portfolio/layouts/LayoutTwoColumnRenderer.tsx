'use client'

import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import { FeaturedCarouselDisplay } from '../FeaturedCarouselDisplay'
import type { 
  LayoutTwoColumnSection, 
  ContentSection,
  TextSection,
  ImageSection,
  GallerySection,
  FeaturedCarouselSection,
  ProjectCardSection,
  ProjectListSection,
} from '@/lib/content-schema'
import { ProjectCardRenderer } from '../ProjectCardRenderer'
import { ProjectListRenderer } from '../ProjectListRenderer'

// Type for projects with featured image (passed through from parent)
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

interface LayoutTwoColumnRendererProps {
  section: LayoutTwoColumnSection
  portfolioSlug: string
  categorySlug?: string
  projects?: ProjectWithImage[]
}

export function LayoutTwoColumnRenderer({ section, portfolioSlug, categorySlug, projects }: LayoutTwoColumnRendererProps) {
  return (
    <section className="section section-layout">
      <div 
        className="layout-two-column"
        data-ratio={section.ratio}
        data-gap={section.gap}
        data-mobile-stack={section.mobileStackOrder}
      >
        <div className="layout-column-content">
          {section.leftColumn.map((item) => (
            <ContentSectionView key={item.id} section={item} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
          ))}
        </div>
        <div className="layout-column-content">
          {section.rightColumn.map((item) => (
            <ContentSectionView key={item.id} section={item} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Inline content section renderer for layout columns
function ContentSectionView({ section, portfolioSlug, categorySlug, projects }: { section: ContentSection; portfolioSlug: string; categorySlug?: string; projects?: ProjectWithImage[] }) {
  switch (section.type) {
    case 'text':
      return <TextContentView section={section as TextSection} />
    case 'image':
      return <ImageContentView section={section as ImageSection} />
    case 'gallery':
      return <GalleryContentView section={section as GallerySection} />
    case 'featured-carousel':
      return <FeaturedCarouselDisplay section={section as FeaturedCarouselSection} portfolioSlug={portfolioSlug} />
    case 'project-card':
      return <ProjectCardRenderer section={section as ProjectCardSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
    case 'project-list':
      return <ProjectListRenderer section={section as ProjectListSection} portfolioSlug={portfolioSlug} categorySlug={categorySlug} projects={projects} />
    default:
      return null
  }
}

function TextContentView({ section }: { section: TextSection }) {
  if (!section.content) return null
  return (
    <div 
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
    />
  )
}

function ImageContentView({ section }: { section: ImageSection }) {
  if (!section.imageUrl) return null
  return (
    <figure className="image-figure">
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
        <Image 
          src={section.imageUrl} 
          alt={section.altText || ''} 
          fill
          unoptimized
          style={{ objectFit: 'cover' }}
        />
      </div>
      {section.caption && (
        <figcaption className="image-caption">{section.caption}</figcaption>
      )}
    </figure>
  )
}

function GalleryContentView({ section }: { section: GallerySection }) {
  const validImages = section.images.filter((img) => Boolean(img.imageUrl))
  if (validImages.length === 0) return null
  
  return (
    <div className="gallery-grid gallery-grid-compact">
      {validImages.slice(0, 6).map((image) => (
        <figure key={image.id} className="gallery-item">
          <Image
            src={image.imageUrl || ''}
            alt={image.altText || 'Gallery image'}
            fill
            unoptimized
            style={{ objectFit: 'cover' }}
          />
        </figure>
      ))}
    </div>
  )
}
