'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ImageResult } from '@/types/search';
import { SearchHighlight } from '@/components/search/SearchHighlight';

interface NestedImageCardProps {
  image: ImageResult;
  query: string;
  projectUrl: string;
}

export function NestedImageCard({ image, query, projectUrl }: NestedImageCardProps) {
  // Deep link to specific image in project
  // Format: /category/project#image-{id}
  const imageDeepLink = image.id ? `${projectUrl}#image-${image.id}` : projectUrl;
  
  // Determine if this image matched the search
  const lowerQuery = query.toLowerCase();
  const isMatched = 
    (image.caption?.toLowerCase().includes(lowerQuery)) ||
    (image.altText?.toLowerCase().includes(lowerQuery)) ||
    false;
  
  return (
    <Link 
      href={imageDeepLink}
      className="search-nested-image-card relative group block"
      data-matched={isMatched}
    >
      {/* Image Thumbnail - 80-100px responsive */}
      <div className="search-nested-image relative overflow-hidden rounded bg-[var(--color-surface)] hover:ring-2 hover:ring-[var(--color-accent)] transition-all">
        <Image
          src={image.thumbnailUrl || image.imageUrl || image.url}
          alt={image.altText || image.caption || 'Gallery image'}
          fill
          sizes="(max-width: 640px) 80px, (max-width: 768px) 90px, (max-width: 1024px) 95px, 100px"
          className="object-cover"
        />
        
        {/* Match indicator badge */}
        {isMatched && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-[var(--color-accent)] text-[var(--color-accent-contrast,white)] rounded-full flex items-center justify-center text-xs font-bold">
            ✓
          </div>
        )}
      </div>
      
      {/* Image Caption */}
      <p className="text-xs text-[var(--color-text-secondary)] mt-1 truncate group-hover:text-[var(--color-accent)] transition-colors">
        <SearchHighlight text={image.caption || image.altText || 'Image'} query={query} />
      </p>
    </Link>
  );
}
