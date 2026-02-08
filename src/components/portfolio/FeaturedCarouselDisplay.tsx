'use client'

import { FeaturedCarouselSection } from '@/lib/content-schema'
import { FeaturedCarousel } from './FeaturedCarousel'

interface Props {
  section: FeaturedCarouselSection
  portfolioSlug: string
}

export function FeaturedCarouselDisplay({ section, portfolioSlug }: Props) {
  // Transform section.items to the FeaturedProject[] format expected by FeaturedCarousel
  const projects = section.items.map(item => ({
    id: item.id,
    slug: item.link?.split('/').filter(Boolean).pop() || item.id, // Extract project slug from link
    title: item.title,
    venue: null,
    year: null,
    featuredImageUrl: item.imageUrl || null,
    featuredImageAlt: item.title,
    featuredImageWidth: item.width,
    featuredImageHeight: item.height,
    categorySlug: item.category || 'work',
    categoryName: item.category || 'Work',
  }))

  if (projects.length === 0) {
    return null
  }

  return (
    <FeaturedCarousel
      portfolioSlug={portfolioSlug}
      projects={projects}
      heading={section.heading}
      autoRotate={section.autoRotate}
      autoRotateInterval={section.autoRotateInterval}
    />
  )
}
