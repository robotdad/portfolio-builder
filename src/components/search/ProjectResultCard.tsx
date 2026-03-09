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
  onClick?: () => void;
}

export function ProjectResultCard({
  title,
  slug,
  categoryName,
  categorySlug,
  year,
  featuredImageUrl,
  query,
  onClick,
}: ProjectResultCardProps) {
  const projectUrl = `/${categorySlug}/${slug}`;
  
  return (
    <Link
      href={projectUrl}
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] transition-colors duration-150"
    >
      {/* Compact thumbnail */}
      {featuredImageUrl && (
        <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-surface)] rounded overflow-hidden">
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
        <span className="text-sm text-[var(--color-text-primary)] truncate leading-none">
          <span className="font-medium"><SearchHighlight text={title} query={query} /></span>{' '}
          <span className="text-xs text-[var(--color-text-secondary)] ml-2">
            <SearchHighlight text={categoryName} query={query} />
            {year && <> • {year}</>}
          </span>
        </span>
      </div>
    </Link>
  );
}
