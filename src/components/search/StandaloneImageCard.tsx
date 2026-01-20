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
      className="search-standalone-image-card flex gap-4 p-3 mb-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
    >
      {/* Image Thumbnail - 150px */}
      <div className="flex-shrink-0">
        <div className="search-standalone-image relative overflow-hidden rounded-md bg-gray-100">
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
        <h3 className="font-medium text-gray-900 mb-1 truncate">
          <SearchHighlight text={image.caption || image.altText || 'Gallery Image'} query={query} />
        </h3>
        {image.categoryName && (
          <p className="text-sm text-gray-600">
            <SearchHighlight text={image.categoryName} query={query} />
          </p>
        )}
        {image.projectTitle && (
          <p className="text-xs text-gray-500">
            From: <SearchHighlight text={image.projectTitle} query={query} />
          </p>
        )}
      </div>
    </Link>
  );
}
