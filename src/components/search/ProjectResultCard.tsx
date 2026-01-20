'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SearchHighlight } from './SearchHighlight';

interface ProjectResultCardProps {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  year: string | null;
  venue: string | null;
  role: string | null;
  featuredImageUrl: string | null;
  excerpt: string;
  query: string;
}

export function ProjectResultCard({
  title,
  slug,
  categoryName,
  categorySlug,
  year,
  featuredImageUrl,
  query,
}: ProjectResultCardProps) {
  const projectUrl = `/${categorySlug}/${slug}`;
  
  return (
    <Link
      href={projectUrl}
      className="flex items-center gap-2 px-2.5 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
    >
      {/* Compact thumbnail */}
      {featuredImageUrl && (
        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded overflow-hidden">
          <Image
            src={featuredImageUrl}
            alt={title}
            width={24}
            height={24}
            className="object-cover w-full h-full"
            sizes="24px"
          />
        </div>
      )}
      
      {/* Content - single line with inline metadata */}
      <div className="flex-1 min-w-0 flex items-center">
        <span className="text-sm text-gray-900 truncate leading-none">
          <span className="font-medium"><SearchHighlight text={title} query={query} /></span>{' '}
          <span className="text-xs text-gray-500 ml-2">
            <SearchHighlight text={categoryName} query={query} />
            {year && <> • {year}</>}
          </span>
        </span>
      </div>
    </Link>
  );
}
