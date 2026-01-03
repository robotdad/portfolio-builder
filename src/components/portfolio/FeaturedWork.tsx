'use client'

import { ProjectCard } from './ProjectCard'

interface FeaturedProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  featuredImageUrl: string | null
  featuredImageAlt?: string
  categorySlug: string
  categoryName: string
}

interface FeaturedWorkProps {
  portfolioSlug: string
  projects: FeaturedProject[]
  heading?: string
}

/**
 * FeaturedWork Component
 * 
 * Displays a grid of featured projects on the homepage:
 * - Maximum 6 projects displayed
 * - 3 columns on desktop, 2 on tablet, 1 on mobile
 * - Uses ProjectCard with hover overlay pattern
 * - Projects ordered by their `order` field
 */
export function FeaturedWork({ 
  portfolioSlug, 
  projects,
  heading = 'Featured Work'
}: FeaturedWorkProps) {
  // Limit to 6 featured projects
  const displayedProjects = projects.slice(0, 6)
  
  if (displayedProjects.length === 0) return null
  
  return (
    <section className="featured-work-section">
      <h2 className="featured-work-heading">{heading}</h2>
      
      <div className="featured-work-grid">
        {displayedProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={{
              slug: project.slug,
              title: project.title,
              venue: project.venue,
              year: project.year,
              featuredImageUrl: project.featuredImageUrl,
              featuredImageAlt: project.featuredImageAlt || project.title,
            }}
            categorySlug={project.categorySlug}
            portfolioSlug={portfolioSlug}
          />
        ))}
      </div>
    </section>
  )
}
