'use client'

import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ThemeSelector } from '@/components/admin/ThemeSelector'
import { TemplateSelector } from '@/components/admin/TemplateSelector'
import { AboutSettings } from '@/components/admin/AboutSettings'
import { TemplatePreviewModal } from '@/components/admin/TemplatePreviewModal'
import { DraftIndicator, PublishButton, ViewLinksGroup } from '@/components/admin'
import type { DraftStatus } from '@/components/admin'

// ============================================================================
// Types
// ============================================================================

interface Portfolio {
  id: string
  name: string
  draftTheme: string
  draftTemplate: string
  publishedTheme: string
  publishedTemplate: string
  lastPublishedAt: string | null
  bio: string
  showAboutSection: boolean
  profilePhotoId: string | null
  profilePhoto: {
    id: string
    url: string
    thumbnailUrl: string | null
    altText: string | null
  } | null
}

// ============================================================================
// Settings Page Component
// ============================================================================

/**
 * Settings Page - Dedicated page for portfolio settings
 * 
 * Provides controls for:
 * - Portfolio name and URL
 * - Theme and template selection
 * - About section configuration
 */
export default function SettingsPage() {
  // Portfolio data
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('')
  const [template, setTemplate] = useState('')
  const [bio, setBio] = useState('')
  const [showAboutSection, setShowAboutSection] = useState(true)
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load portfolio data
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch('/api/portfolio')
        if (!res.ok) {
          throw new Error('Failed to load portfolio')
        }
        const result = await res.json()
        
        // API returns { success: true, data: portfolio } - unwrap it
        if (!result.success || !result.data) {
          setError('No portfolio found. Please create a portfolio first.')
          return
        }

        const data = result.data
        setPortfolio(data)
        setName(data.name || '')
        setTheme(data.draftTheme || 'modern-minimal')
        setTemplate(data.draftTemplate || 'featured-grid')
        setBio(data.bio || '')
        setShowAboutSection(data.showAboutSection ?? true)
        setProfilePhotoId(data.profilePhotoId || null)
        setProfilePhotoUrl(data.profilePhoto?.url || null)
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        setError('Failed to load portfolio settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadPortfolio()
  }, [])

  // Compute hasUnpublishedChanges
  const hasUnpublishedChanges = useMemo(() => {
    if (!portfolio) return false
    return (
      theme !== portfolio.publishedTheme ||
      template !== portfolio.publishedTemplate
    )
  }, [theme, template, portfolio])

  // Compute draftStatus
  const draftStatus: DraftStatus = useMemo(() => {
    if (isSaving) return 'saving'
    if (saveSuccess) return 'saved'
    if (saveError) return 'error'
    return hasUnpublishedChanges ? 'draft' : 'published'
  }, [isSaving, saveSuccess, saveError, hasUnpublishedChanges])

  // Save portfolio settings (draft)
  const saveSettings = useCallback(async () => {
    if (!portfolio) return

    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(false)

    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: portfolio.id,
          name,
          theme,
          template,
          bio,
          showAboutSection,
          profilePhotoId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save settings')
      }

      const updatedPortfolio = await res.json()
      setPortfolio(updatedPortfolio)
      setHasUnsavedChanges(false)
      setSaveSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      setSaveError(true)
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null)
        setSaveError(false)
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }, [portfolio, name, theme, template, bio, showAboutSection, profilePhotoId])

  // Publish settings
  const handlePublish = useCallback(async (): Promise<boolean> => {
    if (!portfolio) return false

    try {
      // First save draft if there are unsaved changes
      if (hasUnsavedChanges) {
        await saveSettings()
      }
      
      // Then publish: copy draft → published
      const response = await fetch('/api/portfolio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: portfolio.id })
      })
      
      if (!response.ok) {
        throw new Error('Failed to publish')
      }
      
      // Update local state
      const updated = await response.json()
      setPortfolio(updated)
      
      return true
    } catch (error) {
      console.error('Publish error:', error)
      return false
    }
  }, [portfolio, hasUnsavedChanges, saveSettings])

  // Handle field changes
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setHasUnsavedChanges(true)
  }

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId)
    setHasUnsavedChanges(true)
  }

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId)
    setHasUnsavedChanges(true)
  }

  const handleBioChange = (newBio: string) => {
    setBio(newBio)
    setHasUnsavedChanges(true)
  }

  const handleProfilePhotoChange = (photoId: string | null, photoUrl: string | null) => {
    setProfilePhotoId(photoId)
    setProfilePhotoUrl(photoUrl)
    setHasUnsavedChanges(true)
  }

  const handleShowAboutChange = (show: boolean) => {
    setShowAboutSection(show)
    setHasUnsavedChanges(true)
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings()
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <AdminPageHeader
          navigation={{
            type: 'breadcrumb',
            items: [
              { label: 'Dashboard', href: '/admin' },
              { label: 'Settings' },
            ],
          }}
          title="Portfolio Settings"
        />
        <main className="settings-page">
          <div className="settings-loading">Loading settings...</div>
        </main>
      </>
    )
  }

  // Error state
  if (error && !portfolio) {
    return (
      <>
        <AdminPageHeader
          navigation={{
            type: 'breadcrumb',
            items: [
              { label: 'Dashboard', href: '/admin' },
              { label: 'Settings' },
            ],
          }}
          title="Portfolio Settings"
        />
        <main className="settings-page">
          <div className="settings-error">{error}</div>
        </main>
      </>
    )
  }

  return (
    <>
      <AdminPageHeader
        navigation={{
          type: 'breadcrumb',
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Settings' },
          ],
        }}
        title="Portfolio Settings"
        actions={
          portfolio ? (
            <>
              <ViewLinksGroup
                draftUrl="/preview"
                liveUrl="/"
                hasPublishedVersion={!!portfolio.lastPublishedAt}
              />
              <div className="action-divider" />
              <DraftIndicator status={draftStatus} hasUnpublishedChanges={hasUnpublishedChanges} />
              <button 
                onClick={saveSettings} 
                disabled={!hasUnsavedChanges || isSaving}
                className="settings-button settings-button--primary"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <PublishButton hasChangesToPublish={hasUnpublishedChanges} onPublish={handlePublish} />
            </>
          ) : undefined
        }
      />

      <main className="settings-page">
        <div className="settings-container">
          <form onSubmit={handleSubmit} className="settings-form">
            {/* Status messages */}
            {error && (
              <div className="settings-message settings-message--error" role="alert">
                {error}
              </div>
            )}
            {saveSuccess && (
              <div className="settings-message settings-message--success" role="status">
                Settings saved successfully!
              </div>
            )}

            {/* Portfolio Information Section */}
            <section className="settings-section settings-section--compact">
              <h2 className="settings-section__title">Portfolio Information</h2>
              <p className="settings-section__description">
                Basic information about your portfolio
              </p>

              <div className="settings-fields">
                <div className="settings-field">
                  <label htmlFor="name" className="settings-field__label">
                    Portfolio Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="settings-field__input"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="My Portfolio"
                    maxLength={100}
                  />
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section className="settings-section">
              <h2 className="settings-section__title">Appearance</h2>
              <p className="settings-section__description">
                Customize the look and feel of your portfolio
              </p>

              <div className="settings-fields">
                <div className="settings-field">
                  <ThemeSelector value={theme} onChange={handleThemeChange} />
                </div>

                <div className="settings-field">
                  <TemplateSelector
                    value={template}
                    onChange={handleTemplateChange}
                    onPreview={setPreviewTemplate}
                  />
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="settings-section">
              <h2 className="settings-section__title">About Section</h2>
              <p className="settings-section__description">
                Add a personal bio and profile photo to your homepage
              </p>

              <div className="settings-fields">
                {portfolio && (
                  <AboutSettings
                    portfolioId={portfolio.id}
                    bio={bio}
                    profilePhotoUrl={profilePhotoUrl}
                    profilePhotoId={profilePhotoId}
                    showAboutSection={showAboutSection}
                    onBioChange={handleBioChange}
                    onProfilePhotoChange={handleProfilePhotoChange}
                    onShowAboutChange={handleShowAboutChange}
                    onFieldBlur={() => {}} // No auto-save on blur for full page
                    isSaving={isSaving}
                  />
                )}
              </div>
            </section>

            {/* Actions - removed as they're now in the header */}
          </form>
        </div>
      </main>

      {/* Template preview modal */}
      {previewTemplate && portfolio && (
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
        .settings-page {
          flex: 1;
          overflow-y: auto;
          background: var(--color-surface-secondary, #f9fafb);
        }

        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-6, 24px) var(--space-4, 16px);
        }

        @media (min-width: 768px) {
          .settings-container {
            padding: var(--space-8, 32px) var(--space-6, 24px);
          }
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-8, 32px);
        }

        .settings-loading,
        .settings-error {
          text-align: center;
          padding: var(--space-8, 32px);
          color: var(--color-text-muted, #6b7280);
        }

        .settings-error {
          color: var(--color-error, #ef4444);
        }

        .settings-message {
          padding: var(--space-4, 16px);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .settings-message--error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .settings-message--success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .settings-section {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
          padding: var(--space-6, 24px);
        }

        .settings-section__title {
          margin: 0 0 var(--space-2, 8px) 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text, #111827);
        }

        .settings-section__description {
          margin: 0 0 var(--space-6, 24px) 0;
          font-size: 14px;
          color: var(--color-text-muted, #6b7280);
        }

        .settings-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-5, 20px);
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2, 8px);
        }

        .settings-field__label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text, #374151);
        }

        .settings-field__input {
          width: 100%;
          min-height: 44px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--color-text, #1f2937);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #d1d5db);
          border-radius: 8px;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .settings-field__input:hover {
          border-color: var(--color-border-strong, #9ca3af);
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
          font-size: 13px;
          color: var(--color-error, #ef4444);
        }

        .settings-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4, 16px);
          padding: var(--space-6, 24px);
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 12px;
        }

        .settings-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 150ms ease;
          border: none;
        }

        .settings-button--primary {
          background: var(--color-accent, #3b82f6);
          color: white;
        }

        .settings-button--primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px hsla(217, 91%, 60%, 0.25);
        }

        .settings-button--primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .settings-button--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .settings-unsaved-indicator {
          font-size: 13px;
          color: var(--color-text-muted, #6b7280);
          font-style: italic;
        }
      `}</style>
    </>
  )
}
