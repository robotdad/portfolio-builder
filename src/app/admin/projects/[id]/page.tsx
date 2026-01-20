'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminEditorToolbar } from '@/components/admin/AdminEditorToolbar'
import { type DraftStatus } from '@/components/admin/DraftIndicator'
import { ProjectMetadataSidebar } from '@/components/admin/ProjectMetadataSidebar'
import { FeaturedImagePicker } from '@/components/admin/FeaturedImagePicker'
import { useAutoSave } from '@/hooks/useAutoSave'
import { type Section, isHeroSection } from '@/lib/content-schema'
import { serializeSections, deserializeSections } from '@/lib/serialization'

interface Project {
  id: string
  title: string
  slug: string
  categoryId: string
  category: { 
    id: string
    name: string
    slug: string
    portfolioId: string
    portfolio: {
      slug: string
    }
  }
  featuredImage: { id: string; url: string; thumbnailUrl: string; altText: string | null } | null
  draftContent: string | null
  publishedContent: string | null
  lastPublishedAt: string | null
  year: string | null
  venue: string | null
  role: string | null
  isFeatured: boolean
}

interface ProjectMetadata {
  year: string
  venue: string
  role: string
  isFeatured: boolean
  featuredImageId: string | null
}

export default function ProjectEditorPage() {
  const params = useParams()
  const projectId = params.id as string

  // Project data
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Section state
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  const [publishedSections, setPublishedSections] = useState<Section[]>([])

  // Metadata state
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    year: '',
    venue: '',
    role: '',
    isFeatured: false,
    featuredImageId: null,
  })
  const [initialMetadata, setInitialMetadata] = useState<ProjectMetadata>({
    year: '',
    venue: '',
    role: '',
    isFeatured: false,
    featuredImageId: null,
  })
  const [publishedMetadata, setPublishedMetadata] = useState<ProjectMetadata>({
    year: '',
    venue: '',
    role: '',
    isFeatured: false,
    featuredImageId: null,
  })

  // Fetch project on mount
  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Project not found')
          }
          throw new Error('Failed to load project')
        }
        const { data: project } = await res.json()
        setProject(project)

        // Parse draft and published sections
        const draftSections = deserializeSections(project.draftContent)
        const pubSections = deserializeSections(project.publishedContent)

        setSections(draftSections)
        setInitialSections(draftSections)
        setPublishedSections(pubSections)
        setPublishedMetadata({
          year: project.year || '',
          venue: project.venue || '',
          role: project.role || '',
          isFeatured: project.isFeatured,
          featuredImageId: project.featuredImage?.id || null,
        })

        // Set metadata
        const meta: ProjectMetadata = {
          year: project.year || '',
          venue: project.venue || '',
          role: project.role || '',
          isFeatured: project.isFeatured || false,
          featuredImageId: project.featuredImage?.id || null,
        }
        setMetadata(meta)
        setInitialMetadata(meta)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProject()
  }, [projectId])

  // Check if there's a hero section
  const hasHeroSection = useMemo(() => {
    return sections.some(isHeroSection)
  }, [sections])

  // Dirty detection - sections or metadata changed
  const isDirty = useMemo(() => {
    const sectionsDirty = JSON.stringify(sections) !== JSON.stringify(initialSections)
    const metadataDirty = JSON.stringify(metadata) !== JSON.stringify(initialMetadata)
    return sectionsDirty || metadataDirty
  }, [sections, initialSections, metadata, initialMetadata])

  // Unpublished changes detection
  const hasUnpublishedChanges = useMemo(() => {
    const sectionsDiff = JSON.stringify(sections) !== JSON.stringify(publishedSections)
    const metadataDiff = JSON.stringify(metadata) !== JSON.stringify(publishedMetadata)
    return sectionsDiff || metadataDiff
  }, [sections, publishedSections, metadata, publishedMetadata])

  // Save draft function
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!project) return false

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftContent: serializeSections(sections),
          year: metadata.year || null,
          venue: metadata.venue || null,
          role: metadata.role || null,
          isFeatured: metadata.isFeatured,
          featuredImageId: metadata.featuredImageId,
        }),
      })

      if (!res.ok) {
        console.error('Failed to save draft')
        return false
      }

      // Update initial state to clear dirty flag
      setInitialSections(sections)
      setInitialMetadata(metadata)
      return true
    } catch (err) {
      console.error('Failed to save draft:', err)
      return false
    }
  }, [project, projectId, sections, metadata])

  // Auto-save hook
  const autoSave = useAutoSave({
    data: { sections, metadata },
    onSave: saveDraft,
    interval: 30000, // 30 seconds
    enabled: !!project && isDirty,
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
    if (!project) return false

    try {
      // Save draft first to ensure we publish latest changes
      await saveDraft()

      const res = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to publish')
      }

      // Update local state
      setPublishedSections(sections)
      setPublishedMetadata(metadata)
      setProject(prev =>
        prev ? { ...prev, lastPublishedAt: new Date().toISOString() } : null
      )

      return true
    } catch (err) {
      console.error('Failed to publish:', err)
      return false
    }
  }, [project, projectId, saveDraft, sections, metadata])

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

  // Metadata change handler
  const handleMetadataChange = useCallback((updates: Partial<ProjectMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updates }))
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="flex items-center gap-3" style={{ color: 'var(--admin-text-muted)' }}>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Loading project...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--admin-bg-secondary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--admin-error)' }}>{error || 'Project not found'}</p>
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
  const categorySlug = project.category?.slug || 'category'
  const draftUrl = `/preview/${categorySlug}/${project.slug}`
  const liveUrl = `/${categorySlug}/${project.slug}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-secondary)' }}>
      {/* Header - Clean navigation only */}
      <AdminPageHeader
        navigation={{ 
          type: 'breadcrumb', 
          items: [
            { label: 'Dashboard', href: '/admin' },
            { label: 'Categories', href: '/admin/categories' },
            { label: project.category.name, href: `/admin/categories/${project.categoryId}/projects` },
            { label: project.title }
          ]
        }}
        title={project.title}
      />

      {/* Editor Toolbar - Dedicated editing controls */}
      <AdminEditorToolbar
        viewLinks={{
          draftUrl,
          liveUrl,
          hasPublishedVersion: !!project.lastPublishedAt,
        }}
        draftStatus={draftStatus}
        hasUnpublishedChanges={hasUnpublishedChanges}
        onSaveDraft={saveDraft}
        onPublish={handlePublish}
        isSaveDraftDisabled={!isDirty}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex gap-6">
          {/* Sidebar - Metadata */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-20">
              <ProjectMetadataSidebar
                metadata={metadata}
                onChange={handleMetadataChange}
                categoryId={project.categoryId}
                categoryName={project.category.name}
              />

              {/* Featured Image */}
              <div className="mt-4 rounded-lg shadow-sm p-4" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <h3 className="mb-3" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--admin-text-secondary)' }}>Featured Image</h3>
                <FeaturedImagePicker
                  portfolioId={project.category.portfolioId}
                  currentImage={project.featuredImage}
                  onImageSelect={async (image) => {
                    const newFeaturedImageId = image?.id || null
                    handleMetadataChange({ featuredImageId: newFeaturedImageId })
                    setProject(prev => prev ? { ...prev, featuredImage: image } : null)
                    // Wait for save to complete before returning
                    await saveDraft()
                  }}
                  onUpload={async (file) => {
                    // Upload the file to the portfolio's assets
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('portfolioId', project.category.portfolioId)
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    })
                    if (!response.ok) {
                      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
                      throw new Error(error.message || 'Upload failed')
                    }
                    const result = await response.json()
                    return {
                      id: result.id,
                      url: result.url,
                      thumbnailUrl: result.thumbnailUrl || result.url,
                      altText: result.altText || file.name,
                    }
                  }}
                />
              </div>
              
              {/* Last Published */}
              {project.lastPublishedAt && (
                <div className="mt-4 rounded-lg shadow-sm p-4" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-muted)' }}>
                    Last published:{' '}
                    {new Date(project.lastPublishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Editor - Main content area */}
          <div className="flex-1 min-w-0">
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
                  portfolioId={project.category.portfolioId}
                  projectId={projectId}
                  onChange={handleSectionsChange}
                  onSaveRequest={handleSaveRequest}
                />
              )}

              <div className="mt-6 flex justify-center">
                <AddSectionButton
                  onAdd={handleAddSection}
                  hasHeroSection={hasHeroSection}
                  portfolioId={project.category.portfolioId}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
