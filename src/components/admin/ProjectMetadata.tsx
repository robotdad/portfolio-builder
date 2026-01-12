'use client'

import { useId } from 'react'

// ============================================================================
// Types
// ============================================================================

interface ProjectMetadataProps {
  isFeatured: boolean
  onFeaturedChange: (isFeatured: boolean) => void
}

// ============================================================================
// Component
// ============================================================================

export function ProjectMetadata({
  isFeatured,
  onFeaturedChange,
}: ProjectMetadataProps) {
  const checkboxId = useId()

  return (
    <div className="project-metadata">
      <div className="form-group">
        <label className="checkbox-label" htmlFor={checkboxId}>
          <input
            type="checkbox"
            id={checkboxId}
            checked={isFeatured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            data-testid="project-form-featured-checkbox"
          />
          <span>Feature on homepage</span>
        </label>
        <p className="form-hint">
          Featured projects appear prominently on your portfolio homepage.
        </p>
      </div>
    </div>
  )
}

export default ProjectMetadata
