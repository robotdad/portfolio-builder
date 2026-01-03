'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { DraftIndicator, type DraftStatus } from '@/components/admin/DraftIndicator'
import { PublishButton } from '@/components/admin/PublishButton'
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
  category: { id: string; name: string; slug: string; portfolioId: string }
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
  }, [project, projectId, saveDraft, sections])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Project not found'}</p>
          <Link
            href="/admin/categories"
            className="text-blue-600 hover:underline"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side: Back button and breadcrumb */}
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/categories/${project.categoryId}/projects`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to projects"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <nav className="text-sm text-gray-500 mb-0.5">
                  <Link href="/admin/categories" className="hover:text-gray-700 hover:underline">
                    Categories
                  </Link>
                  {' / '}
                  <Link
                    href={`/admin/categories/${project.categoryId}/projects`}
                    className="hover:text-gray-700 hover:underline"
                  >
                    {project.category.name}
                  </Link>
                </nav>
                <h1 className="text-lg font-semibold text-gray-900">{project.title}</h1>
              </div>
            </div>

            {/* Right side: Status and actions */}
            <div className="flex items-center gap-3">
              <DraftIndicator
                status={draftStatus}
                hasUnpublishedChanges={hasUnpublishedChanges}
              />
              <button
                type="button"
                onClick={saveDraft}
                disabled={!isDirty}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Draft
              </button>
              <PublishButton
                hasChangesToPublish={hasUnpublishedChanges}
                onPublish={handlePublish}
              />
            </div>
          </div>
        </div>
      </header>

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
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Featured Image</h3>
                <FeaturedImagePicker
                  portfolioId={project.category.portfolioId}
                  currentImage={project.featuredImage}
                  onImageSelect={(image) => {
                    const newFeaturedImageId = image?.id || null
                    handleMetadataChange({ featuredImageId: newFeaturedImageId })
                    setProject(prev => prev ? { ...prev, featuredImage: image } : null)
                    // Trigger save after state update
                    setTimeout(() => {
                      saveDraft()
                    }, 0)
                  }}
                  onUpload={async (file) => {
                    // Upload the file to the portfolio's assets
                    const formData = new FormData()
                    formData.append('file', file)
                    const response = await fetch(`/api/portfolios/${project.category.portfolioId}/assets`, {
                      method: 'POST',
                      body: formData,
                    })
                    if (!response.ok) throw new Error('Upload failed')
                    const result = await response.json()
                    return {
                      id: result.data.id,
                      url: result.data.url,
                      thumbnailUrl: result.data.thumbnailUrl,
                      altText: result.data.altText || '',
                    }
                  }}
                />
              </div>
              
              {/* Last Published */}
              {project.lastPublishedAt && (
                <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Content</h2>
              
              {sections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">No content yet.</p>
                  <p className="text-sm">Add your first section to get started.</p>
                </div>
              ) : (
                <SectionList
                  sections={sections}
                  portfolioId={project.category.portfolioId}
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
          </div>
        </div>
      </main>
    </div>
  )
}
