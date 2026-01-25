'use client'

import Image from 'next/image'
import { sanitizeHtml } from '@/lib/sanitize'
import { FeaturedCarouselDisplay } from '../FeaturedCarouselDisplay'
import type { 
  LayoutSidebarSection, 
  ContentSection,
  TextSection,
  ImageSection,
  GallerySection,
  FeaturedCarouselSection,
} from '@/lib/content-schema'

interface LayoutSidebarRendererProps {
  section: LayoutSidebarSection
  portfolioSlug: string
}

export function LayoutSidebarRenderer({ section, portfolioSlug }: LayoutSidebarRendererProps) {
  const sidebarContent = (
    <div className="layout-sidebar-content">
      {section.sidebar.map((item) => (
        <ContentSectionView key={item.id} section={item} portfolioSlug={portfolioSlug} />
      ))}
    </div>
  )

  const mainContent = (
    <div className="layout-main-content">
      {section.main.map((item) => (
        <ContentSectionView key={item.id} section={item} portfolioSlug={portfolioSlug} />
      ))}
    </div>
  )

  // Render sidebar first or second based on position
  const isLeftSidebar = section.sidebarPosition === 'left'

  return (
    <div 
      className="layout-sidebar"
      data-sidebar-position={section.sidebarPosition}
      data-sidebar-width={section.sidebarWidth}
      data-gap={section.gap}
      data-mobile-stack={section.mobileStackOrder}
    >
      {isLeftSidebar ? (
        <>
          {sidebarContent}
          {mainContent}
        </>
      ) : (
        <>
          {mainContent}
          {sidebarContent}
        </>
      )}
    </div>
  )
}

// Inline content section renderer for layout columns
function ContentSectionView({ section, portfolioSlug }: { section: ContentSection; portfolioSlug: string }) {
  switch (section.type) {
    case 'text':
      return <TextContentView section={section as TextSection} />
    case 'image':
      return <ImageContentView section={section as ImageSection} />
    case 'gallery':
      return <GalleryContentView section={section as GallerySection} />
    case 'featured-carousel':
      return <FeaturedCarouselDisplay section={section as FeaturedCarouselSection} portfolioSlug={portfolioSlug} />
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
