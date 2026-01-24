'use client';

/**
 * Lightbox Component
 * 
 * Full-screen image viewer with navigation
 * - Displays single image at large size
 * - Previous/Next navigation
 * - Close on ESC or click outside
 * - Keyboard navigation (arrow keys)
 */

import React, { useEffect } from 'react';
import { Image } from '@/data/types';

interface LightboxProps {
  images: Image[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'hsla(0, 0%, 0%, 0.95)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-4)',
  };

  const imageContainerStyles: React.CSSProperties = {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageStyles: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
    display: 'block',
  };

  const closeButtonStyles: React.CSSProperties = {
    position: 'fixed',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    background: 'hsla(0, 0%, 100%, 0.1)',
    border: '1px solid hsla(0, 0%, 100%, 0.2)',
    color: 'white',
    fontSize: 'var(--font-size-h3)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 200ms var(--ease-smooth)',
  };

  const navButtonStyles = (disabled: boolean): React.CSSProperties => ({
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'hsla(0, 0%, 100%, 0.1)',
    border: '1px solid hsla(0, 0%, 100%, 0.2)',
    color: 'white',
    fontSize: 'var(--font-size-h2)',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.3 : 1,
    transition: 'background 200ms var(--ease-smooth)',
  });

  const captionStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--space-6)',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: 'var(--font-size-body)',
    maxWidth: '800px',
    textAlign: 'center',
    padding: 'var(--space-3) var(--space-5)',
    background: 'hsla(0, 0%, 0%, 0.6)',
    borderRadius: '8px',
  };

  const counterStyles: React.CSSProperties = {
    position: 'fixed',
    top: 'var(--space-4)',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: 'var(--font-size-small)',
    padding: 'var(--space-2) var(--space-4)',
    background: 'hsla(0, 0%, 0%, 0.6)',
    borderRadius: '20px',
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      {/* Close button */}
      <button
        style={closeButtonStyles}
        onClick={onClose}
        aria-label="Close lightbox"
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.2)';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.1)';
        }}
      >
        ×
      </button>

      {/* Image counter */}
      <div style={counterStyles}>
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          style={{ ...navButtonStyles(false), left: 'var(--space-4)' }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          aria-label="Previous image"
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.1)';
          }}
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {currentIndex < images.length - 1 && (
        <button
          style={{ ...navButtonStyles(false), right: 'var(--space-4)' }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          aria-label="Next image"
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.2)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = 'hsla(0, 0%, 100%, 0.1)';
          }}
        >
          ›
        </button>
      )}

      {/* Image */}
      <div style={imageContainerStyles} onClick={(e) => e.stopPropagation()}>
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          style={imageStyles}
        />
      </div>

      {/* Caption */}
      {(currentImage.caption || currentImage.alt) && (
        <div style={captionStyles}>
          {currentImage.caption || currentImage.alt}
        </div>
      )}
    </div>
  );
}
