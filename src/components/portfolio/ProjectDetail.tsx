'use client'

import { Breadcrumb } from './Breadcrumb'
import { ProjectGallery } from './ProjectGallery'
import { SectionRenderer } from './SectionRenderer'
import { deserializeSections } from '@/lib/serialization'

interface GalleryImage {
  id: string
  url: string
  thumbnailUrl?: string
  altText?: string
  caption?: string
}

interface Project {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  role: string | null
  publishedContent: string | null
  galleryImages: GalleryImage[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ProjectDetailProps {
  portfolio: {
    slug: string
    name: string
    publishedTheme: string
  }
  category: Category
  project: Project
}

/**
 * ProjectDetail Page Template
 * 
 * Displays a single project with:
 * - Breadcrumb navigation (Category > Project)
 * - Project metadata (title, year, venue, role)
 * - Content sections (from publishedContent)
 * - Gallery images in 2-column grid (1-column on mobile)
 * - Lightbox for full-screen image viewing
 */
export function ProjectDetail({ 
  portfolio, 
  category, 
  project
}: ProjectDetailProps) {
  // Parse content sections if available
  const sections = deserializeSections(project.publishedContent)
  
  return (
    <div className="container" data-testid="project-detail">
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        items={[
          { 
            label: category.name, 
            href: `/${category.slug}` 
          },
          { label: project.title }
        ]} 
      />
      
      {/* Project header with metadata */}
      <header className="project-header">
        <h1 className="project-title" data-testid="project-detail-title">{project.title}</h1>
        
        <div className="project-meta">
          {project.venue && (
            <p className="project-venue" data-testid="project-detail-venue">{project.venue}</p>
          )}
          {project.year && (
            <p className="project-year" data-testid="project-detail-year">{project.year}</p>
          )}
          {project.role && (
            <p className="project-role" data-testid="project-detail-role">{project.role}</p>
          )}
        </div>
      </header>
      
      {/* Content sections (description, etc.) */}
      {sections.length > 0 && (
        <div className="project-content">
          <SectionRenderer sections={sections} portfolioSlug="" />
        </div>
      )}
      
      {/* Gallery */}
      {project.galleryImages.length > 0 && (
        <section className="project-gallery-section">
          <h2 className="project-gallery-heading">Gallery</h2>
          <ProjectGallery images={project.galleryImages} />
        </section>
      )}
    </div>
  )
}
