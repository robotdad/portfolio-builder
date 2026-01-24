'use client';

/**
 * Project Detail Page
 * 
 * Shows full gallery and details for one project
 * - Breadcrumb navigation
 * - Hero image (large, featured image)
 * - Metadata section (year, venue, description)
 * - Gallery grid of all images
 * - Credits (optional)
 */

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePortfolio } from '@/context/PortfolioContext';
import { getProjectBySlug, getCategoryForProject } from '@/data/mockData';
import Navigation from '@/components/shared/Navigation';
import GalleryGrid from '@/components/shared/GalleryGrid';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { portfolio } = usePortfolio();

  const project = getProjectBySlug(slug);
  const category = project ? getCategoryForProject(project.id) : undefined;

  if (!project) {
    return (
      <>
        <Navigation />
        <main style={{ 
          padding: 'var(--space-10) var(--mobile-padding)',
          textAlign: 'center',
        }}>
          <h1 style={{ marginBottom: 'var(--space-4)' }}>Project Not Found</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            The project you're looking for doesn't exist.
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

  const heroSectionStyles: React.CSSProperties = {
    padding: 'var(--space-6) var(--mobile-padding) var(--space-8)',
    background: 'var(--color-background)',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: 'var(--max-content-width)',
    margin: '0 auto',
  };

  const projectTitleStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h1)',
    marginBottom: 'var(--space-2)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const metadataStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h4)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-4)',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-body)',
    lineHeight: 'var(--line-height-body)',
    color: 'var(--color-text-primary)',
    maxWidth: 'var(--max-text-width)',
    marginBottom: project.credits && project.credits.length > 0 ? 'var(--space-6)' : 0,
  };

  const creditsStyles: React.CSSProperties = {
    marginTop: 'var(--space-6)',
  };

  const creditsHeadingStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h3)',
    marginBottom: 'var(--space-3)',
    fontFamily: 'var(--font-heading)',
    fontWeight: 'var(--font-heading-weight)',
  };

  const creditItemStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
  };

  const gallerySectionStyles: React.CSSProperties = {
    padding: '0 var(--mobile-padding) var(--space-10)',
    background: 'var(--color-background)',
  };

  const metadata = [project.venue, project.year].filter(Boolean).join(', ');

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
            {category && (
              <>
                <span style={{ margin: '0 var(--space-2)', color: 'var(--color-text-tertiary)' }}>
                  →
                </span>
                <Link href={`/category/${category.slug}`} style={breadcrumbLinkStyles}>
                  {category.name}
                </Link>
              </>
            )}
            <span style={{ margin: '0 var(--space-2)', color: 'var(--color-text-tertiary)' }}>
              →
            </span>
            <span>{project.title}</span>
          </div>
        </div>

        {/* Hero Section - Compact */}
        <section style={heroSectionStyles}>
          <div style={containerStyles}>
            <h1 style={projectTitleStyles}>{project.title}</h1>
            {metadata && (
              <div style={metadataStyles}>{metadata}</div>
            )}

            {/* Description */}
            {project.description && (
              <p style={descriptionStyles}>{project.description}</p>
            )}
          </div>
        </section>

        {/* Gallery - Large Images with Captions */}
        <section style={gallerySectionStyles} aria-label="Project image gallery">
          <div style={containerStyles}>
            <GalleryGrid 
              images={project.images}
              variant="large"
              onImageClick={(image, index) => {
                // Phase 2: Open lightbox for full resolution
                console.log('Open lightbox for image:', image, 'at index:', index);
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}
