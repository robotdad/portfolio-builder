'use client'

import { RichTextEditor } from './RichTextEditor'
import type { TextSection as TextSectionType } from '@/lib/content-schema'

interface TextSectionProps {
  section: TextSectionType
  onChange: (section: TextSectionType) => void
  onDelete: () => void
}

export function TextSection({ section, onChange, onDelete }: TextSectionProps) {
  const handleContentChange = (html: string) => {
    onChange({
      ...section,
      content: html,
    })
  }

  return (
    <div className="section-editor section-editor-text">
      <div className="section-editor-header">
        <span className="section-type-label">Text</span>
        <button
          type="button"
          onClick={onDelete}
          className="section-delete-btn"
          aria-label="Delete section"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
      <div className="section-editor-content">
        <RichTextEditor
          value={section.content}
          onChange={handleContentChange}
          placeholder="Start typing your content..."
        />
      </div>
    </div>
  )
}
