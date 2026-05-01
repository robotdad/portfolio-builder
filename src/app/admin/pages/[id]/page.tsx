'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminEditorToolbar } from '@/components/admin/AdminEditorToolbar'
import { RenameModal } from '@/components/admin/RenameModal'
import { type DraftStatus } from '@/components/admin/DraftIndicator'
import { useAutoSave } from '@/hooks/useAutoSave'
import { type Section, isHeroSection } from '@/lib/content-schema'
import { serializeSections, deserializeSections } from '@/lib/serialization'

interface Page {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  showInNav: boolean
  portfolioId: string
  portfolio: {
    slug: string
  }
  draftContent: string | null
  publishedContent: string | null
  lastPublishedAt: string | null
}

export default function PageEditorPage() {
  const params = useParams()
  const pageId = params.id as string

  // Page data
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Section state
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  const [publishedSections, setPublishedSections] = useState<Section[]>([])

  // Rename modal state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)

  // Fetch page on mount
  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/pages/${pageId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Page not found')
          }
          throw new Error('Failed to load page')
        }
        const pageData = await res.json()
        setPage(pageData)

        // Parse draft and published sections
        const draftSections = deserializeSections(pageData.draftContent)
        const pubSections = deserializeSections(pageData.publishedContent)

        setSections(draftSections)
        setInitialSections(draftSections)
        setPublishedSections(pubSections)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPage()
  }, [pageId])

  // Check if there's a hero section
  const hasHeroSection = useMemo(() => {
    return sections.some(isHeroSection)
  }, [sections])

  // Dirty detection - sections changed
  const isDirty = useMemo(() => {
    return JSON.stringify(sections) !== JSON.stringify(initialSections)
  }, [sections, initialSections])

  // Unpublished changes detection
  const hasUnpublishedChanges = useMemo(() => {
    return JSON.stringify(sections) !== JSON.stringify(publishedSections)
  }, [sections, publishedSections])

  // Save draft function
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!page) return false

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftContent: serializeSections(sections),
        }),
      })

      if (!res.ok) {
        console.error('Failed to save draft')
        return false
      }

      // Update initial state to clear dirty flag
      setInitialSections(sections)

      // Sync Hero section profile photo to Portfolio record
      const heroSection = sections.find(isHeroSection)
      if (heroSection && page) {
        const heroPhotoId = heroSection.profileImageId || null
        
        // Update Portfolio.profilePhotoId to match Hero section
        try {
          await fetch('/api/admin/portfolio', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: page.portfolioId,
              profilePhotoId: heroPhotoId
            })
          })
        } catch (err) {
          console.error('Failed to sync profile photo to portfolio:', err)
          // Non-critical - don't fail the save
        }
      }

      return true
    } catch (err) {
      console.error('Failed to save draft:', err)
      return false
    }
  }, [page, pageId, sections])

  // Auto-save hook
  const autoSave = useAutoSave({
    data: { sections },
    onSave: saveDraft,
    interval: 30000, // 30 seconds
    enabled: !!page && isDirty,
  })

  // Compute draft status for indicator
  const draftStatus = useMemo((): DraftStatus => {
    if (autoSave.status === 'saving') return 'saving'
    if (autoSave.status === 'saved') return 'saved'
    if (autoSave.status === 'error') return 'error'
    return hasUnpublishedChanges ? 'draft' : 'published'
  }, [autoSave.status, hasUnpublishedChanges])

  // Publish handler
  const handlePublish = useCallback(async (): Promise<boolean> => {
    if (!page) return false

    try {
      // Save draft first to ensure we publish latest changes
      await saveDraft()

      const res = await fetch(`/api/admin/pages/${pageId}/publish`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to publish')
      }

      // Update local state
      setPublishedSections(sections)
      setPage(prev =>
        prev ? { ...prev, lastPublishedAt: new Date().toISOString() } : null
      )

      return true
    } catch (err) {
      console.error('Failed to publish:', err)
      return false
    }
  }, [page, pageId, saveDraft, sections])

  // Rename handlers — PUT title to /api/admin/pages/{id}
  const handleRenameOpen = useCallback(() => {
    setRenameError(null)
    setIsRenameModalOpen(true)
  }, [])

  const handleRenameClose = useCallback(() => {
    if (!isRenaming) {
      setIsRenameModalOpen(false)
      setRenameError(null)
    }
  }, [isRenaming])

  const handleRenameSave = useCallback(async (newTitle: string) => {
    if (!page) return
    setIsRenaming(true)
    setRenameError(null)
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to rename page')
      }
      const result = await res.json()
      const updated = result.data ?? result
      // Keep the locally-cached page in sync so breadcrumb + title re-render
      setPage((prev) => (prev ? { ...prev, title: updated.title } : null))
      setIsRenameModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename page'
      console.error('Rename page error:', err)
      setRenameError(message)
    } finally {
      setIsRenaming(false)
    }
  }, [page, pageId])

  // Section handlers
  const handleSectionsChange = useCallback((newSections: Section[]) => {
    setSections(newSections)
  }, [])

  const handleAddSection = useCallback((section: Section) => {
    setSections(prev => [...prev, section])
  }, [])

  // Save request handler for image uploads
  const handleSaveRequest = useCallback(() => {
    saveDraft()
  }, [saveDraft])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--admin-text-muted)' }}>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Loading page...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--admin-error)' }}>{error || 'Page not found'}</p>
          <Link
            href="/admin"
            className="hover:underline"
            style={{ color: 'var(--admin-primary)' }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Construct URLs for ViewLinksGroup
  const isHomepage = page.slug === 'home' || page.isHomepage
  const draftUrl = isHomepage 
    ? '/preview' 
    : `/preview/${page.slug}`
  const liveUrl = isHomepage 
    ? '/' 
    : `/${page.slug}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-secondary)' }}>
      {/* Header - Clean navigation only */}
      <AdminPageHeader
        navigation={{
          type: 'breadcrumb',
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Pages', href: '/admin/pages' },
            { label: page.title },
          ],
        }}
        title={
          <span className="page-title-with-rename">
            <span>{page.title}</span>
            <button
              type="button"
              onClick={handleRenameOpen}
              className="rename-page-btn"
              aria-label={`Rename ${page.title}`}
              data-testid="page-editor-rename-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </span>
        }
      />

      {/* Editor Toolbar - Dedicated editing controls */}
      <AdminEditorToolbar
        viewLinks={{
          draftUrl,
          liveUrl,
          hasPublishedVersion: !!page.lastPublishedAt,
        }}
        draftStatus={draftStatus}
        hasUnpublishedChanges={hasUnpublishedChanges}
        onSaveDraft={saveDraft}
        onPublish={handlePublish}
        isSaveDraftDisabled={!isDirty}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4">
        <div className="rounded-lg shadow-sm p-6" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
          <h2 className="mb-4" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--admin-text)' }}>Content</h2>
          
          {sections.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--admin-text-muted)' }}>
              <p className="mb-2">No content yet.</p>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Add your first section to get started.</p>
            </div>
          ) : (
            <SectionList
              sections={sections}
              portfolioId={page.portfolioId}
              onChange={handleSectionsChange}
              onSaveRequest={handleSaveRequest}
            />
          )}

          <div className="mt-6 flex justify-center">
            <AddSectionButton
              onAdd={handleAddSection}
              hasHeroSection={hasHeroSection}
              portfolioId={page.portfolioId}
            />
          </div>
        </div>

        {/* Last Published */}
        {page.lastPublishedAt && (
          <div className="mt-4 rounded-lg shadow-sm p-4" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-muted)' }}>
              Last published:{' '}
              {new Date(page.lastPublishedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </main>

      <RenameModal
        isOpen={isRenameModalOpen}
        title="Rename Page"
        label="Page Title"
        currentName={page.title}
        onSave={handleRenameSave}
        onClose={handleRenameClose}
        isSubmitting={isRenaming}
      />
      {renameError && (
        <div className="rename-error-toast" role="alert">
          {renameError}
        </div>
      )}

      <style jsx>{`
        .page-title-with-rename {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .rename-page-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--admin-text-muted, #6b7280);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }
        .rename-page-btn:hover {
          background: var(--admin-bg-secondary, #f3f4f6);
          color: var(--admin-text, #111827);
        }
        .rename-page-btn:focus-visible {
          outline: 2px solid var(--admin-primary, #3b82f6);
          outline-offset: 2px;
        }
        .rename-error-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 16px;
          background: var(--admin-error-bg, #fef2f2);
          color: var(--admin-error, #dc2626);
          border: 1px solid var(--admin-error-border, #fecaca);
          border-radius: 8px;
          font-size: 14px;
          z-index: 100;
        }
      `}</style>
    </div>
  )
}
