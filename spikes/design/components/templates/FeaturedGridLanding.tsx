'use client';

/**
 * Featured Grid Landing Template
 * 
 * Clean, organized landing page with grid of featured project cards.
 * Professional, approachable, lets work shine.
 * 
 * Layout:
 * - Hero: Name + title centered
 * - Featured Work: 3-column grid of image cards
 * - Footer: Minimal
 */

import React from 'react';
import { Portfolio } from '@/data/types';
import { getFeaturedProjects } from '@/data/mockData';
import { usePortfolio } from '@/context/PortfolioContext';
import ImageCard from '../shared/ImageCard';
import Button from '../Button';
import AboutSection from '../shared/AboutSection';

interface FeaturedGridLandingProps {
  portfolio: Portfolio;
}

export default function FeaturedGridLanding({ portfolio }: FeaturedGridLandingProps) {
  const featuredProjects = getFeaturedProjects();
  const { showAbout } = usePortfolio();

  const heroStyles: React.CSSProperties = {
    padding: 'var(--space-6) var(--mobile-padding) var(--space-5)',
    background: 'var(--color-background)',
    textAlign: 'center',
  };

  const heroContainerStyles: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
  };

  const nameStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-display)',
    lineHeight: 'var(--line-height-display)',
    marginBottom: 'var(--space-5)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h3)',
    color: 'var(--color-text-secondary)',
    marginBottom: portfolio.resumePdf ? 'var(--space-8)' : 0,
    maxWidth: 'var(--max-text-width)',
    margin: '0 auto',
  };

  const featuredSectionStyles: React.CSSProperties = {
    padding: '0 var(--mobile-padding) var(--space-10)',
    background: 'var(--color-background)',
  };

  const sectionContainerStyles: React.CSSProperties = {
    maxWidth: 'var(--max-content-width)',
    margin: '0 auto',
  };

  const sectionHeadingStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h2)',
    marginBottom: 'var(--space-8)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: 'var(--space-5)',
  };

  const footerStyles: React.CSSProperties = {
    padding: 'var(--space-8) var(--mobile-padding)',
    background: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center',
  };

  const footerTextStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-secondary)',
  };

  return (
    <main>
      {/* Hero Section */}
      <section style={heroStyles}>
        <div style={heroContainerStyles}>
          <h1 style={nameStyles}>{portfolio.name}</h1>
          {portfolio.title && (
            <p style={titleStyles}>{portfolio.title}</p>
          )}
          {portfolio.resumePdf && (
            <div style={{ marginTop: 'var(--space-8)' }}>
              <Button variant="primary">Download Resume</Button>
            </div>
          )}
        </div>
      </section>

      {/* About Section (optional) */}
      <AboutSection about={portfolio.about} showAbout={showAbout} />

      {/* Featured Work Grid */}
      <section style={featuredSectionStyles} aria-label="Featured portfolio projects">
        <div style={sectionContainerStyles}>
          {featuredProjects.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-12) 0',
              color: 'var(--color-text-secondary)',
            }}>
              <p style={{ fontSize: 'var(--font-size-h3)', marginBottom: 'var(--space-4)' }}>
                No featured projects yet
              </p>
              <p>Mark projects as featured to showcase your best work</p>
            </div>
          ) : (
            <div style={gridStyles} className="featured-grid">
              {featuredProjects.map(project => {
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
                    loading={featuredProjects.indexOf(project) < 6 ? 'eager' : 'lazy'}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyles}>
        <div style={footerTextStyles}>
          {portfolio.email && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <a 
                href={`mailto:${portfolio.email}`}
                style={{ 
                  color: 'var(--color-accent)', 
                  textDecoration: 'none',
                }}
              >
                {portfolio.email}
              </a>
            </div>
          )}
          <div>© {new Date().getFullYear()} {portfolio.name}</div>
        </div>
      </footer>

      <style jsx>{`
        /* Desktop: 3 columns */
        @media (min-width: 1024px) {
          .featured-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 640px) and (max-width: 1023px) {
          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 639px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
