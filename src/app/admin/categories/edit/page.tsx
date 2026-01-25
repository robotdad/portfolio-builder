'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminEditorToolbar } from '@/components/admin/AdminEditorToolbar'
import { type DraftStatus } from '@/components/admin/DraftIndicator'
import { useAutoSave } from '@/hooks/useAutoSave'
import { type Section, isHeroSection } from '@/lib/content-schema'
import { serializeSections, deserializeSections } from '@/lib/serialization'

interface Portfolio {
  id: string
  slug: string
  categoryPageDraftContent: string | null
  categoryPagePublishedContent: string | null
  categoryPageLastPublishedAt: string | null
}

export default function CategoryListEditorPage() {
  // Portfolio data
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Section state
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  const [publishedSections, setPublishedSections] = useState<Section[]>([])

  // Fetch portfolio category page content on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/portfolio/category-page')
        if (!res.ok) {
          throw new Error('Failed to load category page content')
        }
        const { data } = await res.json()
        setPortfolio(data)

        // Parse draft and published sections
        const draftSections = deserializeSections(data.categoryPageDraftContent)
        const pubSections = deserializeSections(data.categoryPagePublishedContent)

        setSections(draftSections)
        setInitialSections(draftSections)
        setPublishedSections(pubSections)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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
    if (!portfolio) return false

    try {
      const res = await fetch('/api/admin/portfolio/category-page', {
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
  }, [portfolio, sections])

  // Auto-save hook
  const autoSave = useAutoSave({
    data: { sections },
    onSave: saveDraft,
    interval: 30000, // 30 seconds
    enabled: !!portfolio && isDirty,
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
    if (!portfolio) return false

    try {
      // Save draft first to ensure we publish latest changes
      await saveDraft()

      const res = await fetch('/api/admin/portfolio/category-page/publish', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to publish')
      }

      // Update local state
      setPublishedSections(sections)
      setPortfolio(prev =>
        prev ? { ...prev, categoryPageLastPublishedAt: new Date().toISOString() } : null
      )

      return true
    } catch (err) {
      console.error('Failed to publish:', err)
      return false
    }
  }, [portfolio, saveDraft, sections])

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
          <span>Loading category page...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--admin-error)' }}>{error || 'Failed to load category page'}</p>
          <Link
            href="/admin/categories"
            className="hover:underline"
            style={{ color: 'var(--admin-primary)' }}
          >
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  // Construct URLs for ViewLinksGroup
  const draftUrl = '/preview/categories'
  const liveUrl = '/categories'

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-secondary)' }}>
      {/* Header - Clean navigation only */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Categories', href: '/admin/categories' },
            { label: 'Edit Category List Page' }
          ]
        }}
        title="Category List Page"
      />

      {/* Editor Toolbar - Dedicated editing controls */}
      <AdminEditorToolbar
        viewLinks={{
          draftUrl,
          liveUrl,
          hasPublishedVersion: !!portfolio.categoryPageLastPublishedAt,
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
              portfolioId={portfolio.id}
              onChange={handleSectionsChange}
              onSaveRequest={handleSaveRequest}
            />
          )}

          <div className="mt-6 flex justify-center">
            <AddSectionButton
              onAdd={handleAddSection}
              hasHeroSection={hasHeroSection}
              portfolioId={portfolio.id}
            />
          </div>
        </div>

        {/* Last Published */}
        {portfolio.categoryPageLastPublishedAt && (
          <div className="mt-4 rounded-lg shadow-sm p-4" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-muted)' }}>
              Last published:{' '}
              {new Date(portfolio.categoryPageLastPublishedAt).toLocaleDateString(undefined, {
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
