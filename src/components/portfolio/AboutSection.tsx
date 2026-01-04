'use client'

import { ImageWithFallback } from './ImageFallback'

interface AboutSectionProps {
  bio: string
  profilePhoto?: {
    url: string
    thumbnailUrl?: string
    altText?: string
  } | null
  name: string
  className?: string
}

/**
 * AboutSection - Displays portfolio owner's bio and profile photo
 * 
 * Layout:
 * - Desktop: Side-by-side (photo left, bio right)
 * - Mobile: Stacked (photo top, bio bottom)
 * 
 * Only renders if bio exists (checked by parent)
 */
export function AboutSection({
  bio,
  profilePhoto,
  name,
  className = '',
}: AboutSectionProps) {
  // Don't render if no bio content
  if (!bio || bio.trim() === '') {
    return null
  }

  return (
    <section className={`about-section ${className}`}>
      <h2 className="about-section__heading">About</h2>
      
      <div className="about-section__content">
        {profilePhoto?.url && (
          <div className="about-section__photo">
            <ImageWithFallback
              src={profilePhoto.url}
              alt={profilePhoto.altText || `Photo of ${name}`}
              fill
              sizes="(max-width: 768px) 300px, 400px"
              className="about-section__photo-image"
            />
          </div>
        )}
        
        <div className="about-section__bio">
          {/* Render bio as plain text with paragraph breaks - SAFE from XSS */}
          <div className="about-section__bio-text">
            {bio.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          margin-top: var(--space-12, 48px);
          padding-top: var(--space-8, 32px);
          border-top: 1px solid var(--color-border, #e5e7eb);
        }

        .about-section__heading {
          font-size: var(--font-size-2xl, 1.5rem);
          font-weight: var(--font-weight-semibold, 600);
          font-family: var(--font-family-primary, inherit);
          color: var(--color-text-primary, #111827);
          text-align: center;
          margin: 0 0 var(--space-8, 32px) 0;
        }

        .about-section__content {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: var(--space-8, 32px);
          max-width: 1000px;
          margin: 0 auto;
          align-items: start;
        }

        .about-section__photo {
          position: relative;
          width: 400px;
          height: 400px;
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          background: var(--color-surface, #f9fafb);
          flex-shrink: 0;
        }

        .about-section__photo :global(.about-section__photo-image) {
          object-fit: cover;
        }

        .about-section__bio {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 200px;
        }

        .about-section__bio-text {
          font-size: var(--font-size-lg, 1.125rem);
          line-height: var(--leading-relaxed, 1.75);
          color: var(--color-text, #374151);
          max-width: 600px;
        }

        .about-section__bio-text p {
          margin: 0 0 1em 0;
        }

        .about-section__bio-text p:last-child {
          margin-bottom: 0;
        }

        /* Content without photo - center the bio */
        .about-section__content:not(:has(.about-section__photo)) {
          grid-template-columns: 1fr;
          justify-items: center;
          text-align: center;
        }

        /* Mobile layout */
        @media (max-width: 768px) {
          .about-section {
            margin-top: var(--space-8, 32px);
            padding-top: var(--space-6, 24px);
          }

          .about-section__heading {
            font-size: var(--font-size-xl, 1.25rem);
            margin-bottom: var(--space-6, 24px);
          }

          .about-section__content {
            grid-template-columns: 1fr;
            gap: var(--space-6, 24px);
            text-align: center;
          }

          .about-section__photo {
            width: 300px;
            height: 300px;
            margin: 0 auto;
          }

          .about-section__bio {
            min-height: auto;
          }

          .about-section__bio-text {
            font-size: var(--font-size-base, 1rem);
            margin: 0 auto;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .about-section__content {
            grid-template-columns: 320px 1fr;
          }

          .about-section__photo {
            width: 320px;
            height: 320px;
          }
        }
      `}</style>
    </section>
  )
}

export type { AboutSectionProps }
