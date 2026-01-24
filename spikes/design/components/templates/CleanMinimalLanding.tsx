'use client';

/**
 * Clean Minimal Landing Template
 * 
 * Ultra-clean landing page with centered hero and minimal chrome.
 * Maximum focus on the work.
 * 
 * Layout:
 * - Hero: Full-screen centered (name + tagline + subtitle)
 * - Featured Work: Stacked full-width image cards
 * - Footer: Minimal
 */

import React from 'react';
import { Portfolio } from '@/data/types';
import { getFeaturedProjects } from '@/data/mockData';
import { usePortfolio } from '@/context/PortfolioContext';
import ImageCard from '../shared/ImageCard';
import Button from '../Button';
import AboutSection from '../shared/AboutSection';

interface CleanMinimalLandingProps {
  portfolio: Portfolio;
}

export default function CleanMinimalLanding({ portfolio }: CleanMinimalLandingProps) {
  const featuredProjects = getFeaturedProjects();
  const { showAbout } = usePortfolio();

  const heroStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--space-8) var(--mobile-padding) var(--space-6)',
    background: 'var(--color-background)',
    textAlign: 'center',
  };

  const heroContentStyles: React.CSSProperties = {
    maxWidth: '800px',
  };

  const nameStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-display)',
    lineHeight: 'var(--line-height-display)',
    marginBottom: 'var(--space-5)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const taglineStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h3)',
    color: 'var(--color-text-secondary)',
    marginBottom: portfolio.title ? 'var(--space-3)' : 'var(--space-8)',
    fontStyle: 'italic',
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h4)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-8)',
  };

  const featuredSectionStyles: React.CSSProperties = {
    padding: '0 var(--mobile-padding) var(--space-10)',
    background: 'var(--color-background)',
  };

  const sectionContainerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const cardStackStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)',
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
      {/* Centered Hero */}
      <section style={heroStyles}>
        <div style={heroContentStyles}>
          <h1 style={nameStyles}>{portfolio.name}</h1>
          
          {portfolio.tagline && (
            <p style={taglineStyles}>{portfolio.tagline}</p>
          )}
          
          {portfolio.title && (
            <p style={subtitleStyles}>{portfolio.title}</p>
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

      {/* Featured Work - Stacked Full-Width Cards */}
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
            <div style={cardStackStyles}>
              {featuredProjects.slice(0, 6).map((project, index) => {
                const metadata = [project.venue, project.year].filter(Boolean).join(', ');
                
                return (
                  <ImageCard
                    key={project.id}
                    image={project.featuredImage.src}
                    alt={project.featuredImage.alt}
                    title={project.title}
                    metadata={metadata}
                    href={`/project/${project.slug}`}
                    variant="full-width"
                    loading={index < 3 ? 'eager' : 'lazy'}
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
    </main>
  );
}
