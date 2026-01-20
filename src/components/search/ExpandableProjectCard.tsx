'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { EnhancedProjectResult } from '@/lib/search/groupSearchResults';
import { SearchHighlight } from '@/components/search/SearchHighlight';
import { NestedImageCard } from './NestedImageCard';

interface ExpandableProjectCardProps {
  project: EnhancedProjectResult;
  query: string;
}

export function ExpandableProjectCard({ project, query }: ExpandableProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const projectUrl = `/${project.categorySlug}/${project.slug}`;
  const hasImages = project.imageMatchCount > 0;
  
  return (
    <div 
      className={`
        search-project-card relative mb-3 rounded-lg border bg-white transition-shadow hover:shadow-md
        ${project.matchType === 'title' ? 'border-l-4 border-l-blue-500' : ''}
        ${project.matchType === 'content' ? 'border-l-2 border-l-gray-400' : ''}
      `}
      data-match-type={project.matchType}
    >
      <Link href={projectUrl} className="flex gap-4 p-4">
        {/* Project Thumbnail - 150-180px responsive */}
        <div className="flex-shrink-0">
          <div className="search-project-thumbnail relative overflow-hidden rounded-md bg-gray-100">
            <Image
              src={project.featuredImageUrl || project.thumbnailUrl || '/placeholder-project.jpg'}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 768px) 150px, (max-width: 1024px) 160px, 180px"
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            <SearchHighlight text={project.title} query={query} />
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            <SearchHighlight text={project.categoryName} query={query} />
            {project.year && (
              <>
                {' • '}
                {project.year}
              </>
            )}
          </p>
          
          {/* Image Count Badge */}
          {hasImages && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              aria-label={isExpanded ? 'Collapse images' : 'Expand images'}
              aria-expanded={isExpanded}
            >
              <span>📸 {project.imageMatchCount} {project.imageMatchCount === 1 ? 'image' : 'images'}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </Link>
      
      {/* Nested Images (Collapsible) */}
      {hasImages && isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 mt-2">
            Images in this project
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {project.matchedImages.map((image, idx) => (
              <NestedImageCard
                key={image.id || idx}
                image={image}
                query={query}
                projectUrl={projectUrl}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
