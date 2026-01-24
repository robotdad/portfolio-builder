'use client';

/**
 * ImageCard Component
 * 
 * Display project preview with clean image + context on interaction
 * 
 * Variants:
 * - 'grid': 4:3 aspect ratio for grid layouts (default)
 * - 'full-width': 16:9 aspect ratio for hero/featured layouts
 * 
 * Behavior:
 * - Desktop: Hover shows overlay with title/metadata
 * - Mobile: Title/metadata always visible below image
 */

import React, { useState } from 'react';
import Link from 'next/link';

interface ImageCardProps {
  image: string;
  alt: string;
  title: string;
  metadata?: string;
  href: string;
  variant?: 'grid' | 'full-width';
  loading?: 'eager' | 'lazy';
}

export default function ImageCard({
  image,
  alt,
  title,
  metadata,
  href,
  variant = 'grid',
  loading = 'lazy',
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const aspectRatio = variant === 'full-width' ? '16/9' : '3/2';
  const overlayTitleSize = variant === 'full-width' ? 'var(--font-size-h2)' : 'var(--font-size-h3)';

  const cardStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'var(--color-surface)',
    display: 'block',
    textDecoration: 'none',
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 200ms var(--ease-smooth)',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'hsla(0, 0%, 0%, 0.4)',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 250ms var(--ease-smooth)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--space-4)',
    textAlign: 'center',
  };

  const overlayTitleStyles: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: overlayTitleSize,
    fontWeight: 'var(--font-weight-bold)',
    color: 'white',
    marginBottom: metadata ? 'var(--space-2)' : 0,
    textShadow: '0 2px 4px hsla(0, 0%, 0%, 0.3)',
  };

  const overlayMetadataStyles: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'white',
    opacity: 0.95,
    textShadow: '0 1px 2px hsla(0, 0%, 0%, 0.3)',
  };

  // Mobile: info below image
  const mobileInfoStyles: React.CSSProperties = {
    padding: 'var(--space-3) 0',
  };

  const mobileInfoTitleStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-h4)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    marginBottom: metadata ? 'var(--space-1)' : 0,
  };

  const mobileInfoMetadataStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-secondary)',
  };

  return (
    <div>
      <Link
        href={href}
        style={cardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`View ${title}${metadata ? ` - ${metadata}` : ''}`}
      >
        <img
          src={image}
          alt={alt}
          style={imageStyles}
          loading={loading}
        />
        
        {/* Desktop: Overlay on hover */}
        <div 
          style={overlayStyles}
          className="image-card-overlay"
          aria-hidden="true"
        >
          <div style={overlayTitleStyles}>{title}</div>
          {metadata && (
            <div style={overlayMetadataStyles}>{metadata}</div>
          )}
        </div>
      </Link>

      {/* Mobile: Info below image */}
      <div 
        style={mobileInfoStyles}
        className="image-card-mobile-info"
      >
        <div style={mobileInfoTitleStyles}>{title}</div>
        {metadata && (
          <div style={mobileInfoMetadataStyles}>{metadata}</div>
        )}
      </div>

      <style jsx>{`
        /* Hide overlay on touch devices */
        @media (hover: none) and (pointer: coarse) {
          .image-card-overlay {
            display: none !important;
          }
          .image-card-mobile-info {
            display: block;
          }
        }

        /* Hide mobile info on hover-capable devices */
        @media (hover: hover) and (pointer: fine) {
          .image-card-mobile-info {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
