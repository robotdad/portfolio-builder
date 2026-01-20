'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SearchHighlight } from './SearchHighlight';

interface ImageResultCardProps {
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  projectTitle: string;
  projectSlug: string;
  categorySlug: string;
  query: string;
}

export function ImageResultCard({
  imageUrl,
  caption,
  altText,
  projectTitle,
  projectSlug,
  categorySlug,
  query,
}: ImageResultCardProps) {
  const projectUrl = `/${categorySlug}/${projectSlug}`;
  
  return (
    <Link
      href={projectUrl}
      className="flex items-center gap-2 px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
    >
      {/* Compact thumbnail */}
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded overflow-hidden">
        <Image
          src={imageUrl}
          alt={altText || caption || 'Gallery image'}
          width={32}
          height={32}
          className="object-cover w-full h-full"
          sizes="32px"
        />
      </div>
      
      {/* Content - single line with inline metadata */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate leading-snug">
          <span className="font-medium">{caption || altText || 'Gallery Image'}</span>{' '}
          <span className="text-xs text-gray-500 ml-2">
            from <SearchHighlight text={projectTitle} query={query} />
          </span>
        </p>
      </div>
    </Link>
  );
}
