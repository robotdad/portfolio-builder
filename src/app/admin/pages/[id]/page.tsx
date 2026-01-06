'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DraftIndicator, type DraftStatus } from '@/components/admin/DraftIndicator'
import { PublishButton } from '@/components/admin/PublishButton'
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
      const res = await fetch(`/api/pages/${pageId}`, {
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

      const res = await fetch(`/api/pages/${pageId}/publish`, {
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-secondary)' }}>
      {/* Header */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Pages', href: '/admin' },
            { label: page.title }
          ]
        }}
        actions={
          <>
            <DraftIndicator
              status={draftStatus}
              hasUnpublishedChanges={hasUnpublishedChanges}
            />
            <button
              type="button"
              onClick={saveDraft}
              disabled={!isDirty}
              className="btn-ghost"
              style={{ opacity: isDirty ? 1 : 0.5 }}
            >
              Save Draft
            </button>
            <PublishButton
              hasChangesToPublish={hasUnpublishedChanges}
              onPublish={handlePublish}
            />
          </>
        }
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
    </div>
  )
}
