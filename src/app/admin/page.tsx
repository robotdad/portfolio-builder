'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { SaveIndicator, SaveStatus } from '@/components/editor/SaveIndicator'
import { MobileSaveFooter } from '@/components/editor/MobileSaveFooter'
import { PageList, PageSettingsModal, DeletePageModal, type PageData } from '@/components/editor/PageList'
import { 
  type Section, 
  isHeroSection,
} from '@/lib/content-schema'
import { serializeSections, deserializeSections } from '@/lib/serialization'

interface Asset {
  id: string
  url: string
  thumbnailUrl: string
  altText: string
  caption?: string | null
}

interface Portfolio {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  theme: string
  assets: Asset[]
}

const themes = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, professional, neutral - lets work shine',
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    description: 'Sophisticated, established - signals experience',
  },
  {
    id: 'bold-editorial',
    name: 'Bold Editorial',
    description: 'Dramatic, contemporary - makes a statement',
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Multi-page state
  const [pages, setPages] = useState<PageData[]>([])
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [editingPage, setEditingPage] = useState<PageData | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingPage, setDeletingPage] = useState<PageData | null>(null)
  
  // Section-based content for current page
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    theme: 'modern-minimal',
  })
  
  // Track initial form data to detect dirty state
  const [initialFormData, setInitialFormData] = useState({
    name: '',
    slug: '',
    theme: 'modern-minimal',
  })

  // Get current page
  const currentPage = useMemo(() => {
    return pages.find(p => p.id === currentPageId) || null
  }, [pages, currentPageId])

  // Load pages for portfolio
  const loadPages = useCallback(async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/pages?portfolioId=${portfolioId}`)
      if (res.ok) {
        const loadedPages = await res.json()
        setPages(loadedPages)
        
        // Select homepage or first page by default
        if (loadedPages.length > 0) {
          const homepage = loadedPages.find((p: PageData) => p.isHomepage) || loadedPages[0]
          setCurrentPageId(homepage.id)
          
          // Load sections for this page
          const pageSections = deserializeSections(homepage.content)
          setSections(pageSections)
          setInitialSections(pageSections)
        }
      }
    } catch (error) {
      console.error('Failed to load pages:', error)
    }
  }, [])

  // Load existing portfolio on mount
  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true)
      try {
        const res = await fetch('/api/portfolio')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setPortfolio(data)
            const loadedData = {
              name: data.name || '',
              slug: data.slug || '',
              theme: data.theme || 'modern-minimal',
            }
            setFormData(loadedData)
            setInitialFormData(loadedData)
            
            // Load pages for this portfolio (homepage always exists)
            await loadPages(data.id)
          }
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPortfolio()
  }, [loadPages])

  // Compute dirty state - form has unsaved changes
  const isDirty = useMemo(() => {
    const formDirty = (
      formData.name !== initialFormData.name ||
      formData.slug !== initialFormData.slug ||
      formData.theme !== initialFormData.theme
    )
    
    // Check if sections changed (simple deep comparison)
    const sectionsDirty = JSON.stringify(sections) !== JSON.stringify(initialSections)
    
    return formDirty || sectionsDirty
  }, [formData, initialFormData, sections, initialSections])

  // Check if there's a hero section
  const hasHeroSection = useMemo(() => {
    return sections.some(isHeroSection)
  }, [sections])

  // Compute save button state for visual feedback
  const saveButtonState = useMemo(() => {
    if (saving) return 'saving'
    if (saveStatus === 'error') return 'error'
    if (saveStatus === 'saved') return 'saved'
    if (isDirty) return 'dirty'
    return 'clean'
  }, [saving, saveStatus, isDirty])

  // Get save button label based on state
  const getSaveButtonLabel = (isExisting: boolean) => {
    switch (saveButtonState) {
      case 'saving': return 'Saving...'
      case 'saved': return 'Saved!'
      case 'error': return 'Retry Save'
      case 'dirty': return isExisting ? 'Save Changes' : 'Create Portfolio'
      case 'clean': return 'Saved'
      default: return isExisting ? 'Save' : 'Create'
    }
  }

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      // Only auto-generate slug if it hasn't been manually edited
      slug: prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug,
    }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleThemeChange = (themeId: string) => {
    setFormData(prev => ({ ...prev, theme: themeId }))
  }

  const handleSectionsChange = useCallback((newSections: Section[]) => {
    setSections(newSections)
  }, [])

  const handleAddSection = useCallback((section: Section) => {
    setSections(prev => [...prev, section])
  }, [])

  // Handle page selection
  const handleSelectPage = useCallback(async (pageId: string) => {
    // Don't switch to the same page
    if (pageId === currentPageId) return
    
    // Save current page content first if we have content
    if (currentPageId && sections.length > 0) {
      const currentContent = serializeSections(sections)
      try {
        await fetch(`/api/pages/${currentPageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: currentContent }),
        })
        // Update local pages array with saved content
        setPages(prev => prev.map(p =>
          p.id === currentPageId
            ? { ...p, content: currentContent }
            : p
        ))
      } catch (error) {
        console.error('Failed to save current page before switching:', error)
      }
    }
    
    // Load the new page's sections
    const page = pages.find(p => p.id === pageId)
    if (page) {
      const pageSections = deserializeSections(page.content)
      setSections(pageSections)
      setInitialSections(pageSections)
      setCurrentPageId(pageId)
    }
  }, [currentPageId, pages, sections])

  // Handle page creation
  const handleCreatePage = () => {
    setEditingPage(null)
    setShowPageModal(true)
  }

  // Handle page settings save
  const handleSavePageSettings = async (data: { 
    title: string; 
    slug: string; 
    isHomepage: boolean; 
    showInNav: boolean 
  }) => {
    if (!portfolio) return

    try {
      if (editingPage) {
        // Update existing page
        const res = await fetch(`/api/pages/${editingPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message)
        }

        const updatedPage = await res.json()
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p))
      } else {
        // Create new page (homepage always exists, so this is always an additional page)
        
        // CRITICAL: Save current page's content BEFORE creating new page
        // This prevents content loss when switching pages
        if (currentPageId && sections.length > 0) {
          const currentContent = serializeSections(sections)
          await fetch(`/api/pages/${currentPageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: currentContent }),
          })
          // Update local pages array with saved content
          setPages(prev => prev.map(p =>
            p.id === currentPageId
              ? { ...p, content: currentContent }
              : p
          ))
        }
        
        const res = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: portfolio.id,
            ...data,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message)
        }

        const newPage = await res.json()
        setPages(prev => [...prev, newPage])
        setCurrentPageId(newPage.id)
        
        // Clear sections for new pages - they start empty
        setSections([])
        setInitialSections([])
      }

      setShowPageModal(false)
      setEditingPage(null)
    } catch (error) {
      console.error('Failed to save page:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save page',
      })
    }
  }

  // Handle page deletion
  const handleDeletePage = async () => {
    if (!deletingPage) return

    try {
      const res = await fetch(`/api/pages/${deletingPage.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete page')
      }

      setPages(prev => prev.filter(p => p.id !== deletingPage.id))
      
      // If deleting current page, switch to first available page
      if (currentPageId === deletingPage.id) {
        const remainingPages = pages.filter(p => p.id !== deletingPage.id)
        if (remainingPages.length > 0) {
          handleSelectPage(remainingPages[0].id)
        } else {
          setCurrentPageId(null)
          setSections([])
          setInitialSections([])
        }
      }

      setShowDeleteModal(false)
      setDeletingPage(null)
    } catch (error) {
      console.error('Failed to delete page:', error)
      setMessage({
        type: 'error',
        text: 'Failed to delete page',
      })
    }
  }

  // Handler for mobile save footer (submits the form programmatically)
  const handleMobileSave = useCallback(() => {
    const form = document.getElementById('portfolio-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
  }, [])

  // Handler for auto-save after image upload
  const handleSaveRequest = useCallback(() => {
    const form = document.getElementById('portfolio-form') as HTMLFormElement
    if (form) {
      form.requestSubmit()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveStatus('saving')
    setMessage(null)

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    try {
      // Serialize sections for storage
      const contentJson = serializeSections(sections)
      
      // Extract name and title from hero section if present
      const heroSection = sections.find(isHeroSection)
      const name = heroSection?.name || formData.name
      const title = heroSection?.title || ''
      const bio = heroSection?.bio || ''
      
      // Save portfolio settings only - content is saved via pages
      const portfolioRes = await fetch('/api/portfolio', {
        method: portfolio ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: portfolio?.id,
          name,
          slug: formData.slug,
          title,
          bio,
          theme: formData.theme,
        }),
      })

      if (!portfolioRes.ok) {
        const error = await portfolioRes.json()
        throw new Error(error.message || 'Failed to save portfolio')
      }

      const saved = await portfolioRes.json()
      setPortfolio(saved)
      
      // For new portfolios: set pages and currentPageId from response
      // This is CRITICAL - without this, content will never save!
      let pageIdToSave = currentPageId
      if (!portfolio && saved.pages?.length > 0) {
        setPages(saved.pages)
        const homepage = saved.pages.find((p: PageData) => p.isHomepage) || saved.pages[0]
        setCurrentPageId(homepage.id)
        pageIdToSave = homepage.id
        
        // Load default sections from the homepage
        if (homepage.content) {
          const defaultSections = deserializeSections(homepage.content)
          setSections(defaultSections)
          setInitialSections(defaultSections)
        }
      }
      
      // If we have a current page, save its content
      if (pageIdToSave) {
        // For new portfolios, get the page from the saved response
        const pageToSave = !portfolio && saved.pages?.length > 0
          ? saved.pages.find((p: PageData) => p.id === pageIdToSave)
          : currentPage
        
        const pageRes = await fetch(`/api/pages/${pageIdToSave}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pageToSave?.title,
            slug: pageToSave?.slug,
            isHomepage: pageToSave?.isHomepage,
            showInNav: pageToSave?.showInNav,
            content: contentJson,
          }),
        })

        if (!pageRes.ok) {
          const error = await pageRes.json()
          throw new Error(error.message || 'Failed to save page content')
        }

        const updatedPage = await pageRes.json()
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p))
      }
      
      setSaveStatus('saved')
      setMessage({ type: 'success', text: 'Portfolio saved successfully!' })
      
      // Sync formData with saved values to ensure View button uses correct slug
      const syncedFormData = {
        name: saved.name || '',
        slug: saved.slug || '',
        theme: saved.theme || 'modern-minimal',
      }
      setFormData(syncedFormData)
      
      // Update initial state to mark as clean
      setInitialFormData(syncedFormData)
      setInitialSections(sections)
      
      // Reset save status after delay
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
      
      // Refresh to show updated data
      router.refresh()
    } catch (error) {
      setSaveStatus('error')
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save portfolio',
      })
    } finally {
      setSaving(false)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="admin-layout">
        <header className="admin-header">
          <div className="container">
            <div className="admin-header-content">
              <span className="admin-logo">Portfolio Builder</span>
            </div>
          </div>
        </header>
        <main className="admin-main">
          <div className="container">
            <div className="loading">
              <span className="loading-spinner"></span>
              <span>Loading...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Get ARIA live announcement for screen readers
  const getAriaAnnouncement = () => {
    switch (saveButtonState) {
      case 'saving': return 'Saving changes...'
      case 'saved': return 'Changes saved successfully'
      case 'error': return 'Save failed. Please try again.'
      case 'dirty': return 'You have unsaved changes'
      default: return ''
    }
  }

  return (
    <div className="admin-layout">
      {/* Screen reader announcements for save status */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {getAriaAnnouncement()}
      </div>

      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <span className="admin-logo">Portfolio Builder</span>
            <div className="admin-header-actions">
              <SaveIndicator status={saveStatus} />
              {/* Desktop-only header save button */}
              <button
                type="submit"
                form="portfolio-form"
                className={`btn btn-primary desktop-header-save-btn save-btn save-btn--${saveButtonState}`}
                disabled={saving || saveButtonState === 'clean'}
                aria-disabled={saveButtonState === 'clean'}
              >
                {getSaveButtonLabel(!!portfolio)}
              </button>
              {portfolio && formData.slug && (
                <a 
                  href={`/${formData.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  View →
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container" style={{ maxWidth: '720px' }}>
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <form id="portfolio-form" onSubmit={handleSubmit}>
            {/* Portfolio Settings Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header">
                <h1 className="card-title">
                  {portfolio ? 'Portfolio Settings' : 'Create Your Portfolio'}
                </h1>
              </div>

              <div className="card-body">
                {/* Only show name input if no hero section */}
                {!hasHeroSection && (
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="form-input"
                      placeholder="Jane Smith"
                      required={!hasHeroSection}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="slug" className="form-label">
                    Portfolio URL *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="jane-smith"
                    pattern="[a-z0-9\-]+"
                    title="Only lowercase letters, numbers, and hyphens"
                    required
                  />
                  <p className="form-hint">
                    Your portfolio will be available at: /{formData.slug || 'your-name'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <div className="theme-selector">
                    {themes.map(theme => (
                      <label
                        key={theme.id}
                        className={`theme-option ${formData.theme === theme.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={theme.id}
                          checked={formData.theme === theme.id}
                          onChange={() => handleThemeChange(theme.id)}
                        />
                        <div className={`theme-preview theme-preview-${theme.id.split('-')[0]}`}>
                          <div className="theme-preview-text">
                            <div className="theme-preview-line"></div>
                            <div className="theme-preview-line"></div>
                          </div>
                        </div>
                        <div className="theme-info">
                          <div className="theme-name">{theme.name}</div>
                          <div className="theme-description">{theme.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Section - Only show if portfolio exists */}
            {portfolio && (
              <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header card-header-with-actions">
                  <h2 className="card-title">Pages</h2>
                  {currentPage && (
                    <div className="card-header-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingPage(currentPage)
                          setShowPageModal(true)
                        }}
                        aria-label="Page settings"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-danger-text"
                          onClick={() => {
                            setDeletingPage(currentPage)
                            setShowDeleteModal(true)
                          }}
                          aria-label="Delete page"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="card-body" style={{ paddingTop: 0, paddingBottom: 'var(--space-3)' }}>
                  <PageList
                    pages={pages}
                    currentPageId={currentPageId}
                    portfolioId={portfolio.id}
                    onSelectPage={handleSelectPage}
                    onPagesChange={setPages}
                    onCreatePage={handleCreatePage}
                  />
                </div>
              </div>
            )}

            {/* Content Sections */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  {currentPage ? `${currentPage.title} Content` : 'Page Content'}
                </h2>
              </div>

              <div className="card-body">
                {sections.length === 0 ? (
                  <div className="sections-empty">
                    <p>No sections yet. Add your first section to get started.</p>
                    <p className="form-hint">
                      Start with a Hero section to introduce yourself, or add text and images.
                    </p>
                  </div>
                ) : (
                  <SectionList
                    sections={sections}
                    portfolioId={portfolio?.id || ''}
                    onChange={handleSectionsChange}
                    onSaveRequest={handleSaveRequest}
                  />
                )}

                <AddSectionButton 
                  onAdd={handleAddSection}
                  hasHeroSection={hasHeroSection}
                />
              </div>
            </div>

            {/* Desktop-only save button (hidden on mobile via CSS) */}
            <div style={{ paddingTop: 'var(--space-6)' }} className="mobile-hide-save-btn">
              <button
                type="submit"
                className={`btn btn-primary save-btn save-btn--${saveButtonState}`}
                disabled={saving || saveButtonState === 'clean'}
                aria-disabled={saveButtonState === 'clean'}
                style={{ width: '100%' }}
              >
                {getSaveButtonLabel(!!portfolio)}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Mobile sticky save footer */}
      <MobileSaveFooter
        isDirty={isDirty}
        saveStatus={saveStatus}
        isSaving={saving}
        onSave={handleMobileSave}
        isExisting={!!portfolio}
        createLabel="Create Portfolio"
        updateLabel="Save Changes"
      />

      {/* Page Settings Modal */}
      <PageSettingsModal
        page={editingPage}
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false)
          setEditingPage(null)
        }}
        onSave={handleSavePageSettings}
        existingSlugs={pages.map(p => p.slug)}
      />

      {/* Delete Page Modal */}
      <DeletePageModal
        page={deletingPage}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingPage(null)
        }}
        onConfirm={handleDeletePage}
      />
    </div>
  )
}
