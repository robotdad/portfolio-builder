'use client'

import { useRef } from 'react'
import type { ImagePickerControlsProps } from '@/lib/types/image-picker'

/**
 * Search and filter controls for the image picker.
 * 
 * Features:
 * - Search input with icon and clear button
 * - Page/category filter dropdown
 * - Clear all filters button when filters active
 */
export function ImagePickerControls({
  searchQuery,
  onSearchChange,
  pageFilter,
  onPageFilterChange,
  pages,
  onClearFilters,
}: ImagePickerControlsProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const hasActiveFilters = searchQuery.trim() !== '' || pageFilter !== null

  const handleClearSearch = () => {
    onSearchChange('')
    searchInputRef.current?.focus()
  }

  return (
    <div className="image-picker-controls">
      {/* Search Input */}
      <div className="search-container">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search images by filename, alt text, or page"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Page Filter Dropdown */}
      <div className="filter-container">
        <select
          className="page-filter"
          value={pageFilter || ''}
          onChange={(e) => onPageFilterChange(e.target.value || null)}
          aria-label="Filter by page or category"
        >
          <option value="">All Pages</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title} ({page.imageCount})
            </option>
          ))}
        </select>
        <svg
          className="select-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          className="clear-filters-btn"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      )}

      <style jsx>{`
        .image-picker-controls {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted, #6b7280);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 40px;
          padding: 0 40px 0 40px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          font-size: 14px;
          background: var(--color-bg, #ffffff);
          color: var(--color-text, #111827);
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px var(--color-accent-light, rgba(59, 130, 246, 0.1));
        }

        .search-input::placeholder {
          color: var(--color-text-muted, #9ca3af);
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }

        .clear-search-btn:hover {
          background: var(--color-bg-hover, #f3f4f6);
          color: var(--color-text, #111827);
        }

        .filter-container {
          position: relative;
          min-width: 160px;
        }

        .page-filter {
          width: 100%;
          height: 40px;
          padding: 0 32px 0 12px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          font-size: 14px;
          background: var(--color-bg, #ffffff);
          color: var(--color-text, #111827);
          cursor: pointer;
          appearance: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .page-filter:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px var(--color-accent-light, rgba(59, 130, 246, 0.1));
        }

        .select-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted, #6b7280);
          pointer-events: none;
        }

        .clear-filters-btn {
          height: 40px;
          padding: 0 16px;
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 8px;
          font-size: 14px;
          background: transparent;
          color: var(--color-text-muted, #6b7280);
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.15s, color 0.15s, border-color 0.15s;
        }

        .clear-filters-btn:hover {
          background: var(--color-bg-hover, #f3f4f6);
          color: var(--color-text, #111827);
          border-color: var(--color-text-muted, #9ca3af);
        }

        @media (max-width: 640px) {
          .image-picker-controls {
            padding: 12px;
            gap: 8px;
          }

          .search-container {
            flex: 1 1 100%;
            min-width: unset;
          }

          .filter-container {
            flex: 1;
            min-width: 120px;
          }

          .clear-filters-btn {
            flex: 0 0 auto;
          }
        }
      `}</style>
    </div>
  )
}
