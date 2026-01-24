import React from 'react';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export default function Gallery({ images }: GalleryProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 'var(--space-5)',
    }}>
      {images.map((image) => (
        <GalleryItem key={image.id} {...image} />
      ))}
    </div>
  );
}

function GalleryItem({ src, alt, title }: GalleryImage) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '4/3',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform var(--duration-standard) var(--ease-smooth)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      {/* Hover Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'hsla(0, 0%, 0%, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity var(--duration-standard) var(--ease-smooth)',
      }}>
        <div style={{
          color: 'white',
          fontSize: 'var(--font-size-h4)',
          fontWeight: 'var(--font-weight-semibold)',
          textAlign: 'center',
          padding: 'var(--space-4)',
        }}>
          {title}
        </div>
      </div>
    </div>
  );
}
