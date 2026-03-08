'use client'

import Link from 'next/link'
import { SectionRenderer } from '../SectionRenderer'
import { ImageWithFallback } from '../ImageFallback'
import type { TemplateProps } from './index'

export function CleanMinimalTemplate({
  sections,
  featuredProjects,
  categories,
}: TemplateProps) {
  // Clean minimal shows 3-6 projects in a stacked layout
  const displayProjects = featuredProjects.slice(0, 6)

  return (
    <>
        {/* Hero and other sections with expansive styling */}
        <div className="clean-minimal-hero-wrapper">
          <SectionRenderer sections={sections} portfolioSlug="" categories={categories} />
        </div>

        {/* Stacked featured projects */}
        {displayProjects.length > 0 && (
          <section className="clean-minimal-featured">
            <div className="clean-minimal-stack">
              {displayProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${project.categorySlug}/${project.slug}`}
                  className="clean-minimal-stack-item"
                >
                  <div className="clean-minimal-stack-image-wrapper">
                    {project.featuredImageUrl ? (
                      <ImageWithFallback
                        src={project.featuredImageUrl}
                        alt={project.featuredImageAlt || project.title}
                        fill
                        sizes="100vw"
                        className="clean-minimal-stack-image"
                      />
                    ) : (
                      <div className="clean-minimal-stack-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="clean-minimal-stack-overlay">
                    <h3 className="clean-minimal-stack-title">{project.title}</h3>
                    {(project.venue || project.year) && (
                      <p className="clean-minimal-stack-meta">
                        {[project.venue, project.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
    </>
  )
}
