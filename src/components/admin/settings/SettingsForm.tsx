/**
 * Shared settings form component used by both desktop and mobile views.
 * Contains all portfolio settings fields: name, theme, template, and about section.
 */
'use client'

import { useState, type ChangeEvent } from 'react'
import { ThemeSelector } from '@/components/admin/ThemeSelector'
import { TemplateSelector } from '@/components/admin/TemplateSelector'
import { TemplatePreviewModal } from '@/components/admin/TemplatePreviewModal'
import { AboutSettings } from '@/components/admin/AboutSettings'
import type { SettingsFormProps } from './types'

export function SettingsForm({
  name,
  theme,
  template,
  portfolioId,
  bio,
  profilePhotoUrl,
  profilePhotoId,
  showAboutSection,
  onNameChange,
  onThemeChange,
  onTemplateChange,
  onBioChange,
  onProfilePhotoChange,
  onShowAboutChange,
  onFieldBlur,
  isSaving = false,
  hasHeroSection = false,
  nameInputRef,
}: SettingsFormProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [aboutExpanded, setAboutExpanded] = useState(false)

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNameChange(e.target.value)
  }

  const handleThemeChange = (themeId: string) => {
    onThemeChange(themeId)
    // Theme changes trigger immediate save via parent
  }

  const handleTemplateChange = (templateId: string) => {
    onTemplateChange(templateId)
    // Template changes trigger immediate save via parent
  }

  return (
    <div className="settings-form">
      {/* Saving indicator */}
      {isSaving && (
        <div className="settings-saving" role="status" aria-live="polite">
          <span className="settings-saving__dot" aria-hidden="true" />
          Saving...
        </div>
      )}

      {/* Name field (only if no hero section) */}
      {!hasHeroSection && (
        <div className="settings-field">
          <label htmlFor="settings-name" className="settings-field__label">
            Portfolio Name
          </label>
          <input
            ref={nameInputRef}
            id="settings-name"
            type="text"
            className="settings-field__input"
            value={name}
            onChange={handleNameChange}
            onBlur={onFieldBlur}
            placeholder="My Portfolio"
            maxLength={100}
            data-testid="settings-name-input"
          />
        </div>
      )}

      {/* Theme selector */}
      <div className="settings-field settings-field--theme" data-testid="settings-theme-selector">
        <ThemeSelector
          value={theme}
          onChange={handleThemeChange}
        />
      </div>

      {/* Template selector */}
      <div className="settings-field settings-field--template" data-testid="settings-template-selector">
        <TemplateSelector
          value={template}
          onChange={handleTemplateChange}
          onPreview={setPreviewTemplate}
        />
      </div>

      {/* About Section Settings (collapsible) */}
      <div className="settings-field settings-field--about">
        <button
          type="button"
          className="settings-collapsible-trigger"
          onClick={() => setAboutExpanded(!aboutExpanded)}
          aria-expanded={aboutExpanded}
        >
          <span>About Section</span>
          <svg
            className={`settings-collapsible-chevron ${aboutExpanded ? 'settings-collapsible-chevron--open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {aboutExpanded && (
          <div className="settings-collapsible-content">
            <AboutSettings
              portfolioId={portfolioId}
              bio={bio}
              profilePhotoUrl={profilePhotoUrl}
              profilePhotoId={profilePhotoId}
              showAboutSection={showAboutSection}
              onBioChange={onBioChange}
              onProfilePhotoChange={onProfilePhotoChange}
              onShowAboutChange={onShowAboutChange}
              onFieldBlur={onFieldBlur}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>

      {/* Template preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          templateId={previewTemplate}
          portfolioSlug=""
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            handleTemplateChange(previewTemplate)
            setPreviewTemplate(null)
          }}
        />
      )}

      <style jsx>{`
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .settings-saving {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-surface-secondary, #f3f4f6);
          border-radius: 6px;
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
        }

        .settings-saving__dot {
          width: 6px;
          height: 6px;
          background: var(--color-accent, #3b82f6);
          border-radius: 50%;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-field--theme {
          padding-top: 4px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          margin-top: 4px;
        }

        .settings-field--template {
          padding-top: 4px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          margin-top: 4px;
        }

        .settings-field--about {
          padding-top: 8px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          margin-top: 4px;
        }

        .settings-field__label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-muted, #6b7280);
        }

        .settings-field__input-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .settings-field__prefix {
          position: absolute;
          left: 12px;
          font-size: 14px;
          color: var(--color-text-muted, #6b7280);
          pointer-events: none;
        }

        .settings-field__input {
          width: 100%;
          min-height: 40px;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--color-text, #1f2937);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 6px;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .settings-field__input--with-prefix {
          padding-left: 24px;
        }

        .settings-field__input:hover {
          border-color: var(--color-border-strong, #cbd5e1);
        }

        .settings-field__input:focus {
          outline: none;
          border-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px hsla(217, 91%, 60%, 0.15);
        }

        .settings-field__input--error {
          border-color: var(--color-error, #ef4444);
        }

        .settings-field__input--error:focus {
          border-color: var(--color-error, #ef4444);
          box-shadow: 0 0 0 3px hsla(0, 84%, 60%, 0.15);
        }

        .settings-field__input::placeholder {
          color: var(--color-text-placeholder, #9ca3af);
        }

        .settings-field__error {
          font-size: 12px;
          color: var(--color-error, #ef4444);
        }

        /* Collapsible About Section */
        .settings-collapsible-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #111827);
          text-align: left;
        }

        .settings-collapsible-trigger:hover {
          color: var(--color-accent, #3b82f6);
        }

        .settings-collapsible-chevron {
          color: var(--color-text-muted, #6b7280);
          transition: transform 150ms ease;
        }

        .settings-collapsible-chevron--open {
          transform: rotate(180deg);
        }

        .settings-collapsible-content {
          padding-top: 8px;
        }
      `}</style>
    </div>
  )
}
