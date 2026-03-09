'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ImageResult } from '@/types/search';
import { SearchHighlight } from '@/components/search/SearchHighlight';

interface StandaloneImageCardProps {
  image: ImageResult;
  query: string;
}

export function StandaloneImageCard({ image, query }: StandaloneImageCardProps) {
  // For standalone images, link directly to the image or category page
  const imageUrl = image.categorySlug 
    ? `/${image.categorySlug}#image-${image.id}`
    : `/gallery#image-${image.id}`;
  
  return (
    <Link 
      href={imageUrl}
      className="search-standalone-image-card flex gap-4 p-3 mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-shadow"
    >
      {/* Image Thumbnail - 150px */}
      <div className="flex-shrink-0">
        <div className="search-standalone-image relative overflow-hidden rounded-md bg-[var(--color-surface)]">
          <Image
            src={image.thumbnailUrl || image.imageUrl || image.url}
            alt={image.altText || image.caption || 'Gallery image'}
            fill
            sizes="150px"
            className="object-cover"
          />
        </div>
      </div>
      
      {/* Image Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-[var(--color-text-primary)] mb-1 truncate">
          <SearchHighlight text={image.caption || image.altText || 'Gallery Image'} query={query} />
        </h3>
        {image.categoryName && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            <SearchHighlight text={image.categoryName} query={query} />
          </p>
        )}
        {image.projectTitle && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            From: <SearchHighlight text={image.projectTitle} query={query} />
          </p>
        )}
      </div>
    </Link>
  );
}
