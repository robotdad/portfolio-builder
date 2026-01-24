'use client';

/**
 * Category Page
 * 
 * Shows all projects within a user-defined category
 * - Category name + description
 * - Grid of project cards
 * - Breadcrumb navigation
 */

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio } from '@/context/PortfolioContext';
import { getCategoryBySlug, getProjectsByCategorySlug } from '@/data/mockData';
import Navigation from '@/components/shared/Navigation';
import ImageCard from '@/components/shared/ImageCard';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { portfolio } = usePortfolio();

  const category = getCategoryBySlug(slug);
  const projects = getProjectsByCategorySlug(slug);

  if (!category) {
    return (
      <>
        <Navigation />
        <main style={{ 
          padding: 'var(--space-10) var(--mobile-padding)',
          textAlign: 'center',
        }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Category Not Found</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            The category you're looking for doesn't exist.
          </p>
          <Link 
            href="/"
            style={{
              color: 'var(--color-accent)',
              textDecoration: 'none',
            }}
          >
            ← Back to Home
          </Link>
        </main>
      </>
    );
  }

  const breadcrumbStyles: React.CSSProperties = {
    padding: 'var(--space-4) var(--mobile-padding)',
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background)',
  };

  const breadcrumbLinkStyles: React.CSSProperties = {
    color: 'var(--color-accent)',
    textDecoration: 'none',
  };

  const headerStyles: React.CSSProperties = {
    padding: 'var(--space-8) var(--mobile-padding)',
    background: 'var(--color-background)',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: 'var(--max-content-width)',
    margin: '0 auto',
  };

  const categoryNameStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h1)',
    marginBottom: category.description ? 'var(--space-3)' : 0,
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const categoryDescStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h4)',
    color: 'var(--color-text-secondary)',
  };

  const gridSectionStyles: React.CSSProperties = {
    padding: 'var(--space-10) var(--mobile-padding)',
    background: 'var(--color-background)',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: 'var(--space-5)',
  };

  return (
    <>
      <Navigation />
      
      <main>
        {/* Breadcrumb */}
        <div style={breadcrumbStyles}>
          <div style={containerStyles}>
            <Link href="/" style={breadcrumbLinkStyles}>
              {portfolio.name}
            </Link>
            <span style={{ margin: '0 var(--space-2)', color: 'var(--color-text-tertiary)' }}>
              →
            </span>
            <span>{category.name}</span>
          </div>
        </div>

        {/* Category Header */}
        <section style={headerStyles}>
          <div style={containerStyles}>
            <h1 style={categoryNameStyles}>{category.name}</h1>
            {category.description && (
              <p style={categoryDescStyles}>{category.description}</p>
            )}
          </div>
        </section>

        {/* Projects Grid */}
        <section style={gridSectionStyles}>
          <div style={containerStyles}>
            {projects.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--space-12) 0',
                color: 'var(--color-text-secondary)',
              }}>
                <p style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--space-4)' }}>
                  No projects yet
                </p>
                <p>Projects in this category will appear here</p>
              </div>
            ) : (
              <div style={gridStyles} className="projects-grid">
                {projects.map(project => {
                  const metadata = [project.venue, project.year].filter(Boolean).join(', ');
                  
                  return (
                    <ImageCard
                      key={project.id}
                      image={project.featuredImage.src}
                      alt={project.featuredImage.alt}
                      title={project.title}
                      metadata={metadata}
                      href={`/project/${project.slug}`}
                      variant="grid"
                      loading={projects.indexOf(project) < 6 ? 'eager' : 'lazy'}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        /* Desktop: 3 columns */
        @media (min-width: 1024px) {
          .projects-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 640px) and (max-width: 1023px) {
          .projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 639px) {
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
