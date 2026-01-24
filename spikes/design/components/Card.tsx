import React from 'react';
import Image from 'next/image';

interface CardProps {
  title: string;
  metadata?: string;
  description: string;
  image?: string;
}

export default function Card({ title, metadata, description, image }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyles: React.CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: `1px solid ${isHovered ? 'var(--color-border-strong)' : 'var(--color-border)'}`,
    overflow: 'hidden',
    transition: 'all var(--duration-standard) var(--ease-smooth)',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 4px 12px hsla(0, 0%, 0%, 0.08)' 
      : '0 1px 3px hsla(0, 0%, 0%, 0.05)',
  };

  return (
    <div 
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {image && (
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: '4/3',
          background: 'var(--color-border)',
        }}>
          <img 
            src={image} 
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
      
      <div style={{ padding: 'var(--space-5)' }}>
        <h4 style={{ 
          fontSize: 'var(--font-size-h4)',
          marginBottom: 'var(--space-2)',
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </h4>
        
        {metadata && (
          <div style={{ 
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 'var(--line-height-small)',
          }}>
            {metadata}
          </div>
        )}
        
        <p style={{ 
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-body)',
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}
