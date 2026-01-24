'use client';

/**
 * AboutSection Component
 * 
 * Optional about section with image and bio
 * - Image left (400px), text right on desktop
 * - Stacked on mobile
 * - Only renders if enabled in portfolio data
 */

import React from 'react';
import { AboutSection as AboutSectionType } from '@/data/types';

interface AboutSectionProps {
  about?: AboutSectionType;
  showAbout: boolean;
}

export default function AboutSection({ about, showAbout }: AboutSectionProps) {
  if (!about || !showAbout) return null;

  const sectionStyles: React.CSSProperties = {
    padding: 'var(--space-10) var(--mobile-padding)',
    background: 'var(--color-surface)',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: 'var(--max-content-width)',
    margin: '0 auto',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    aspectRatio: '1/1',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 12px hsla(0, 0%, 0%, 0.1)',
  };

  const bioTextStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h4)',
    lineHeight: 'var(--line-height-body)',
    color: 'var(--color-text-primary)',
  };

  return (
    <section style={sectionStyles} aria-label="About">
      <div style={containerStyles}>
        <div className="about-layout" style={{ display: 'grid', gap: 'var(--space-8)', alignItems: 'center' }}>
          {/* Image */}
          <div>
            <img
              src={about.image}
              alt={about.imageAlt}
              style={imageStyles}
              loading="lazy"
            />
          </div>

          {/* Bio */}
          <div>
            <p style={bioTextStyles}>{about.bio}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Desktop: Image left (400px), text right */
        @media (min-width: 768px) {
          .about-layout {
            grid-template-columns: 400px 1fr;
          }
        }

        /* Mobile: Stack vertically */
        @media (max-width: 767px) {
          .about-layout {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
