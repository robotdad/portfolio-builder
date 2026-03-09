'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { groupSearchResults } from '@/lib/search/groupSearchResults';
import { ImageGridGroup } from './ImageGridGroup';
import { SearchImageCard } from './SearchImageCard';
import { PageResultCard } from './PageResultCard';
import { CategoryResultCard } from './CategoryResultCard';
import { ProjectResultCard } from './ProjectResultCard';
import { SearchEmptyState } from './SearchEmptyState';
import type { SearchResult } from '@/types/search';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'modern-minimal' | 'classic-elegant' | 'bold-editorial';
}

export function SearchOverlay({ isOpen, onClose, theme }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure portal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setQuery('');
        setResults([]);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Group results into hierarchical structure
  const groupedResults = useMemo(() => {
    if (!results || results.length === 0) return null;
    return groupSearchResults(results, query);
  }, [results, query]);

  // Calculate total results from grouped structure
  const totalImageResults = groupedResults
    ? groupedResults.projects.reduce((acc: number, p: any) => acc + p.imageMatchCount, 0) +
      groupedResults.standaloneImages.length
    : 0;

  const totalResults = groupedResults 
    ? totalImageResults +
      groupedResults.projectsWithoutImages.length +
      groupedResults.pages.length + 
      groupedResults.categories.length
    : 0;

  const handleResultClick = useCallback(() => {
    onClose();
    setQuery('');
    setResults([]);
  }, [onClose]);

  // Clear search when closing
  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Check if we're in browser (for portal)
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="search-overlay-backdrop"
        data-theme={theme}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Overlay Panel */}
      <div
        ref={overlayRef}
        className={`search-overlay search-overlay--${theme}`}
        data-theme={theme}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Header */}
        <div className="search-overlay-header">
          <div className="search-overlay-input-wrapper">
            <Search className="search-overlay-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, images, and pages..."
              className="search-overlay-input"
              aria-label="Search"
            />
            <button
              type="button"
              onClick={handleClose}
              className="search-overlay-close"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="search-overlay-results">
          {/* Loading */}
          {loading && (
            <div className="search-overlay-loading">
              <Loader2 className="w-8 h-8 text-[var(--color-text-muted)] animate-spin" />
              <span className="ml-3 text-[var(--color-text-secondary)]">Searching...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="search-overlay-error">
              <p>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && query && results.length === 0 && !error && (
            <div className="search-overlay-empty">
              <SearchEmptyState query={query} />
            </div>
          )}

          {/* Zero-query state */}
          {!loading && !query && (
            <div className="search-overlay-zero-state">
              <Search className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
                What are you looking for?
              </h2>
              <p className="text-[var(--color-text-secondary)]">
                Start typing to search projects, images, and pages
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="search-overlay-results-content">
              {/* Results header */}
              <div className="mb-6">
                <p className="text-[var(--color-text-secondary)]">
                  Found <span className="font-semibold">{totalResults}</span>{' '}
                  {totalResults === 1 ? 'result' : 'results'}
                </p>
              </div>

              {/* IMAGES from Projects - Image-First Display */}
              {groupedResults?.projects && groupedResults.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
                    IMAGES ({totalImageResults})
                  </h3>
                  <div className="space-y-6">
                    {groupedResults.projects.map((project: any, idx: number) => (
                      <ImageGridGroup key={project.id || idx} project={project} query={query} />
                    ))}
                  </div>
                </div>
              )}

              {/* IMAGES Section - Standalone images (no project context) */}
              {groupedResults?.standaloneImages && groupedResults.standaloneImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
                    STANDALONE IMAGES ({groupedResults.standaloneImages.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupedResults.standaloneImages.map((image: any, idx: number) => (
                      <SearchImageCard
                        key={image.id || idx}
                        image={image}
                        query={query}
                        projectUrl={image.categorySlug ? `/${image.categorySlug}` : '/gallery'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTS Section - Projects that matched but have no matching images */}
              {groupedResults?.projectsWithoutImages && groupedResults.projectsWithoutImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                    PROJECTS ({groupedResults.projectsWithoutImages.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedResults.projectsWithoutImages.map((project: any) => (
                      <ProjectResultCard
                        key={project.id}
                        {...project}
                        query={query}
                        onClick={handleResultClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pages */}
              {groupedResults?.pages && groupedResults.pages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                    PAGES ({groupedResults.pages.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedResults.pages.map((result: any) => (
                      <PageResultCard
                        key={result.id}
                        {...result}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {groupedResults?.categories && groupedResults.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
                    CATEGORIES ({groupedResults.categories.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedResults.categories.map((result: any) => (
                      <CategoryResultCard
                        key={result.id}
                        {...result}
                        query={query}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
