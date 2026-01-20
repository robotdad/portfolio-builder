'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { SearchHighlight } from './SearchHighlight';

interface PageResultCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  lastUpdated: string;
  query: string;
}

export function PageResultCard({
  title,
  slug,
  excerpt,
  query,
}: PageResultCardProps) {
  const pageUrl = `/${slug}`;
  
  return (
    <Link
      href={pageUrl}
      className="flex items-center gap-2 px-2.5 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
    >
      {/* Compact icon */}
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
        <FileText className="w-4 h-4 text-indigo-600" />
      </div>
      
      {/* Content - single line with inline excerpt */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate leading-snug">
          <span className="font-medium"><SearchHighlight text={title} query={query} /></span>
          <span className="text-xs text-gray-500 ml-2">
            <SearchHighlight text={excerpt} query={query} />
          </span>
        </p>
      </div>
    </Link>
  );
}
