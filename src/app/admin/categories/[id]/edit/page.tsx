'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminEditorToolbar } from '@/components/admin/AdminEditorToolbar'
import { type DraftStatus } from '@/components/admin/DraftIndicator'
import { useAutoSave } from '@/hooks/useAutoSave'
import { type Section, isHeroSection } from '@/lib/content-schema'
import { serializeSections, deserializeSections } from '@/lib/serialization'

interface Category {
  id: string
  name: string
  slug: string
  portfolioId: string
  portfolio: {
    slug: string
  }
  draftContent: string | null
  publishedContent: string | null
  lastPublishedAt: string | null
}

export default function CategoryLandingEditorPage() {
  const params = useParams()
  const categoryId = params.id as string

  // Category data
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Section state
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  const [publishedSections, setPublishedSections] = useState<Section[]>([])

  // Fetch category with content on mount
  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${categoryId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Category not found')
          }
          throw new Error('Failed to load category')
        }
        const { data } = await res.json()
        setCategory(data)

        // Parse draft and published sections
        const draftSections = deserializeSections(data.draftContent)
        const pubSections = deserializeSections(data.publishedContent)

        setSections(draftSections)
        setInitialSections(draftSections)
        setPublishedSections(pubSections)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategory()
  }, [categoryId])

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
    if (!category) return false

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
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
  }, [category, categoryId, sections])

  // Auto-save hook
  const autoSave = useAutoSave({
    data: { sections },
    onSave: saveDraft,
    interval: 30000, // 30 seconds
    enabled: !!category && isDirty,
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
    if (!category) return false

    try {
      // Save draft first to ensure we publish latest changes
      await saveDraft()

      const res = await fetch(`/api/categories/${categoryId}/publish`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to publish')
      }

      // Update local state
      setPublishedSections(sections)
      setCategory(prev =>
        prev ? { ...prev, lastPublishedAt: new Date().toISOString() } : null
      )

      return true
    } catch (err) {
      console.error('Failed to publish:', err)
      return false
    }
  }, [category, categoryId, saveDraft, sections])

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
          <span>Loading category...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--admin-error)' }}>{error || 'Category not found'}</p>
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
  const draftUrl = `/preview/${category.slug}`
  const liveUrl = `/${category.slug}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-secondary)' }}>
      {/* Header - Clean navigation only */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Categories', href: '/admin/categories' },
            { label: category.name, href: `/admin/categories/${categoryId}/projects` },
            { label: 'Edit Landing Page' }
          ]
        }}
        title={`${category.name} - Landing Page`}
      />

      {/* Editor Toolbar - Dedicated editing controls */}
      <AdminEditorToolbar
        viewLinks={{
          draftUrl,
          liveUrl,
          hasPublishedVersion: !!category.lastPublishedAt,
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
              portfolioId={category.portfolioId}
              categoryId={categoryId}
              onChange={handleSectionsChange}
              onSaveRequest={handleSaveRequest}
            />
          )}

          <div className="mt-6 flex justify-center">
            <AddSectionButton
              onAdd={handleAddSection}
              hasHeroSection={hasHeroSection}
              portfolioId={category.portfolioId}
            />
          </div>
        </div>

        {/* Last Published */}
        {category.lastPublishedAt && (
          <div className="mt-4 rounded-lg shadow-sm p-4" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-muted)' }}>
              Last published:{' '}
              {new Date(category.lastPublishedAt).toLocaleDateString(undefined, {
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
