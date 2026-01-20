'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ImageResult } from '@/types/search';
import { SearchHighlight } from '@/components/search/SearchHighlight';

interface SearchImageCardProps {
  image: ImageResult;
  query: string;
  projectUrl: string;
}

export function SearchImageCard({ image, query, projectUrl }: SearchImageCardProps) {
  // Deep link to specific image in project
  const imageDeepLink = image.id ? `${projectUrl}#image-${image.id}` : projectUrl;
  
  // Determine if this image matched the search
  const lowerQuery = query.toLowerCase();
  const isMatched = 
    (image.caption?.toLowerCase().includes(lowerQuery)) ||
    (image.altText?.toLowerCase().includes(lowerQuery)) ||
    false;
  
  console.log('[SearchImageCard] Rendering:', {
    imageId: image.id,
    url: image.url,
    thumbnailUrl: image.thumbnailUrl,
    caption: image.caption,
  });
  
  return (
    <Link 
      href={imageDeepLink}
      className="search-image-card-link"
    >
      {/* Image - 150-180px responsive */}
      <div className="search-image-card-container">
        <Image
          src={image.thumbnailUrl || image.url}
          alt={image.altText || image.caption || 'Gallery image'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        
        {/* Match indicator badge */}
        {isMatched && (
          <div className="search-image-match-badge">
            ✓
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="search-image-card-overlay" />
      </div>
      
      {/* Caption - truncated, highlighted */}
      <p className="search-image-caption">
        <SearchHighlight text={image.caption || image.altText || 'Image'} query={query} />
      </p>
    </Link>
  );
}
