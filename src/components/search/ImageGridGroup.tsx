'use client';

import Link from 'next/link';
import type { EnhancedProjectResult } from '@/lib/search/groupSearchResults';
import { SearchImageCard } from './SearchImageCard';

interface ImageGridGroupProps {
  project: EnhancedProjectResult;
  query: string;
}

export function ImageGridGroup({ project, query }: ImageGridGroupProps) {
  const projectUrl = `/${project.categorySlug}/${project.slug}`;
  const showingAllImages = project.showAllImages || false;
  
  console.log('[ImageGridGroup] Rendering:', {
    projectTitle: project.title,
    matchedImagesCount: project.matchedImages?.length || 0,
    matchedImages: project.matchedImages,
  });
  
  return (
    <div className="search-image-group search-results-section">
      {/* Small, subtle project header */}
      <Link 
        href={projectUrl}
        className="search-image-group-header search-project-header"
      >
        <span className="search-image-group-title">{project.title}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>•</span>
        <span className="search-image-group-meta">
          {project.categoryName} • {project.year}
          {showingAllImages && (
            <span className="search-image-group-badge">
              All images from project
            </span>
          )}
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>→</span>
      </Link>
      
      {/* Image grid - always visible, no expand/collapse */}
      <div className="search-image-grid">
        {project.matchedImages.map((image: any, idx: number) => (
          <SearchImageCard
            key={image.id || idx}
            image={image}
            query={query}
            projectUrl={projectUrl}
          />
        ))}
      </div>
    </div>
  );
}
