import { sanitizeHtml } from '@/lib/sanitize'
import { ImageCard } from './ImageCard'
import type { 
  Section, 
  TextSection, 
  ImageSection, 
  HeroSection, 
  FeaturedGridSection 
} from '@/lib/content-schema'

interface SectionRendererProps {
  sections: Section[]
}

/**
 * Renders an array of sections on the public portfolio page
 */
export function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionComponent key={section.id} section={section} />
      ))}
    </>
  )
}

interface SectionComponentProps {
  section: Section
}

function SectionComponent({ section }: SectionComponentProps) {
  switch (section.type) {
    case 'text':
      return <TextSectionView section={section} />
    case 'image':
      return <ImageSectionView section={section} />
    case 'hero':
      return <HeroSectionView section={section} />
    case 'featured-grid':
      return <FeaturedGridView section={section} />
    default:
      return null
  }
}

// Text Section View
function TextSectionView({ section }: { section: TextSection }) {
  if (!section.content) return null
  
  return (
    <section className="section section-text">
      <div 
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
      />
    </section>
  )
}

// Image Section View
function ImageSectionView({ section }: { section: ImageSection }) {
  if (!section.imageUrl) return null
  
  return (
    <section className="section section-image">
      <figure className="image-figure">
        <img 
          src={section.imageUrl} 
          alt={section.altText || ''} 
          className="section-image-img"
          loading="lazy"
        />
        {section.caption && (
          <figcaption className="image-caption">
            {section.caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}

// Hero Section View
function HeroSectionView({ section }: { section: HeroSection }) {
  return (
    <section className="section section-hero">
      <div className="hero-content">
        {section.profileImageUrl && (
          <div className="hero-profile-image">
            <img
              src={section.profileImageUrl}
              alt={`${section.name}'s profile photo`}
              width={150}
              height={150}
            />
          </div>
        )}
        
        {section.name && (
          <h1 className="hero-name">{section.name}</h1>
        )}
        
        {section.title && (
          <p className="hero-title">{section.title}</p>
        )}
        
        {section.bio && (
          <div
            className="hero-bio prose-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.bio) }}
          />
        )}
        
        {section.showResumeLink && section.resumeUrl && (
          <a 
            href={section.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-resume-link btn btn-secondary"
          >
            View Resume →
          </a>
        )}
      </div>
    </section>
  )
}

// Featured Grid Section View
function FeaturedGridView({ section }: { section: FeaturedGridSection }) {
  if (section.items.length === 0) return null
  
  return (
    <section className="section section-featured-grid">
      {section.heading && (
        <h2 className="featured-grid-heading">{section.heading}</h2>
      )}
      
      <div className="featured-grid">
        {section.items.map((item) => (
          <ImageCard
            key={item.id}
            imageUrl={item.imageUrl}
            title={item.title}
            category={item.category}
            link={item.link}
            altText={item.title}
          />
        ))}
      </div>
    </section>
  )
}
