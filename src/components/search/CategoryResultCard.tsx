'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Folder } from 'lucide-react';
import { SearchHighlight } from './SearchHighlight';

interface CategoryResultCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  projectCount: number;
  featuredImageUrl: string | null;
  query: string;
}

export function CategoryResultCard({
  name,
  slug,
  projectCount,
  featuredImageUrl,
  query,
}: CategoryResultCardProps) {
  const categoryUrl = `/${slug}`;
  
  return (
    <Link
      href={categoryUrl}
      className="flex items-center gap-2 px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)] transition-colors duration-150"
    >
      {/* Compact icon or image */}
      {featuredImageUrl ? (
        <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-highlight-bg)] rounded overflow-hidden">
          <Image
            src={featuredImageUrl}
            alt={name}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 bg-[var(--color-highlight-bg)] rounded flex items-center justify-center">
          <Folder className="w-4 h-4 text-[var(--color-accent)]" />
        </div>
      )}
      
      {/* Content - single line with inline count */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] truncate leading-snug">
          <span className="font-medium"><SearchHighlight text={name} query={query} /></span>
          <span className="text-xs text-[var(--color-text-secondary)] ml-2">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </span>
        </p>
      </div>
    </Link>
  );
}
