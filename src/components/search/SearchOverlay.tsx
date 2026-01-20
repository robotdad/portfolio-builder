'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { groupSearchResults } from '@/lib/search/groupSearchResults';
import { ExpandableProjectCard } from './ExpandableProjectCard';
import { StandaloneImageCard } from './StandaloneImageCard';
import { PageResultCard } from './PageResultCard';
import { CategoryResultCard } from './CategoryResultCard';
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
  const totalResults = groupedResults 
    ? groupedResults.projects.length + 
      groupedResults.standaloneImages.length + 
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
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Overlay Panel */}
      <div
        ref={overlayRef}
        className={`search-overlay search-overlay--${theme}`}
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
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-gray-600">Searching...</span>
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
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What are you looking for?
              </h2>
              <p className="text-gray-600">
                Start typing to search projects, images, and pages
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="search-overlay-results-content">
              {/* Results header */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Found <span className="font-semibold">{totalResults}</span>{' '}
                  {totalResults === 1 ? 'result' : 'results'}
                </p>
              </div>

              {/* PROJECTS Section - Hierarchical */}
              {groupedResults?.projects && groupedResults.projects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    PROJECTS ({groupedResults.projects.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedResults.projects.map((project) => (
                      <ExpandableProjectCard key={project.id} project={project} query={query} />
                    ))}
                  </div>
                </div>
              )}

              {/* IMAGES Section - Standalone only */}
              {groupedResults?.standaloneImages && groupedResults.standaloneImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    IMAGES ({groupedResults.standaloneImages.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedResults.standaloneImages.map((image) => (
                      <StandaloneImageCard key={image.id} image={image} query={query} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pages */}
              {groupedResults?.pages && groupedResults.pages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    PAGES ({groupedResults.pages.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedResults.pages.map((result) => (
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
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    CATEGORIES ({groupedResults.categories.length})
                  </h3>
                  <div className="space-y-3">
                    {groupedResults.categories.map((result) => (
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
