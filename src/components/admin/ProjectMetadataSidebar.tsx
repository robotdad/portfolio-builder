'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './ProjectMetadataSidebar.module.css'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  StarIcon,
  FolderIcon,
} from '@/components/shared/icons'

// ============================================================================
// Types
// ============================================================================

interface ProjectMetadataSidebarProps {
  metadata: {
    year: string
    venue: string
    role: string
    isFeatured: boolean
  }
  onChange: (updates: Partial<ProjectMetadataSidebarProps['metadata']>) => void
  categoryId: string
  categoryName: string
}

// ============================================================================
// Component
// ============================================================================

export function ProjectMetadataSidebar({
  metadata,
  onChange,
  categoryId,
  categoryName,
}: ProjectMetadataSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleTextChange = (field: 'year' | 'venue' | 'role', value: string) => {
    onChange({ [field]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    onChange({ isFeatured: checked })
  }

  return (
    <div className={styles.metadataSidebar}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.sidebarHeader}
        aria-expanded={isExpanded}
        aria-controls="metadata-content"
      >
        <span className={styles.sidebarTitle}>Project Details</span>
        <span className={styles.sidebarChevron}>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div id="metadata-content" className={styles.sidebarContent}>
          {/* Category (display only) */}
          <div className={styles.fieldGroupFirst}>
            <label className={styles.fieldLabel}>
              <FolderIcon />
              <span>Category</span>
            </label>
            <Link
              href={`/admin/categories/${categoryId}/projects`}
              className={styles.categoryLink}
            >
              {categoryName}
            </Link>
          </div>

          {/* Year */}
          <div className={styles.fieldGroup}>
            <label htmlFor="metadata-year" className={styles.fieldLabel}>
              <CalendarIcon />
              <span>Year</span>
            </label>
            <input
              id="metadata-year"
              type="text"
              value={metadata.year}
              onChange={(e) => handleTextChange('year', e.target.value)}
              placeholder="e.g., 2024"
              className={styles.fieldInput}
            />
          </div>

          {/* Venue */}
          <div className={styles.fieldGroup}>
            <label htmlFor="metadata-venue" className={styles.fieldLabel}>
              <MapPinIcon />
              <span>Venue</span>
            </label>
            <input
              id="metadata-venue"
              type="text"
              value={metadata.venue}
              onChange={(e) => handleTextChange('venue', e.target.value)}
              placeholder="e.g., Gallery Name"
              className={styles.fieldInput}
            />
          </div>

          {/* Role */}
          <div className={styles.fieldGroup}>
            <label htmlFor="metadata-role" className={styles.fieldLabel}>
              <UserIcon />
              <span>Role</span>
            </label>
            <input
              id="metadata-role"
              type="text"
              value={metadata.role}
              onChange={(e) => handleTextChange('role', e.target.value)}
              placeholder="e.g., Lead Designer"
              className={styles.fieldInput}
            />
          </div>

          {/* Featured */}
          <div className={styles.fieldGroupFeatured}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={metadata.isFeatured}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxContent}>
                <StarIcon />
                <span>Feature on homepage</span>
              </span>
            </label>
            <p className={styles.fieldHint}>
              Featured projects appear in the portfolio highlights
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
