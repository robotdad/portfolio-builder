'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { SaveIndicator, SaveStatus } from '@/components/editor/SaveIndicator'
import { MobileSaveFooter } from '@/components/editor/MobileSaveFooter'
import { PageList, PageSettingsModal, DeletePageModal, type PageData } from '@/components/editor/PageList'
import { DraftIndicator, type DraftStatus } from '@/components/admin/DraftIndicator'
import { PublishButton } from '@/components/admin/PublishButton'
import { ThemeSelector } from '@/components/admin/ThemeSelector'
import { SettingsDropdown } from '@/components/admin/SettingsDropdown'
import { HamburgerButton } from '@/components/admin/HamburgerButton'
import { useAdminLayout } from '@/components/admin/AdminLayout'
import { useAutoSave } from '@/hooks/useAutoSave'
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
  draftTheme: string
  publishedTheme: string
  assets: Asset[]
}

// Extended PageData with draft/publish fields
interface ExtendedPageData extends PageData {
  draftContent?: string | null
  publishedContent?: string | null
  lastPublishedAt?: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Settings dropdown state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  
  // Mobile drawer state
  const { isSidebarOpen, toggleSidebar, breakpoint, isTouchDevice } = useAdminLayout()
  const showMenuButton = isTouchDevice || breakpoint !== 'desktop'
  
  // Multi-page state
  const [pages, setPages] = useState<ExtendedPageData[]>([])
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [showPageModal, setShowPageModal] = useState(false)
  const [editingPage, setEditingPage] = useState<ExtendedPageData | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingPage, setDeletingPage] = useState<ExtendedPageData | null>(null)
  
  // Section-based content for current page
  const [sections, setSections] = useState<Section[]>([])
  const [initialSections, setInitialSections] = useState<Section[]>([])
  
  // Draft/Publish state
  const [publishedSections, setPublishedSections] = useState<Section[]>([])
  const [lastPublishedAt, setLastPublishedAt] = useState<Date | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    draftTheme: 'modern-minimal',
  })
  
  // Track initial form data to detect dirty state
  const [initialFormData, setInitialFormData] = useState({
    name: '',
    slug: '',
    draftTheme: 'modern-minimal',
  })

  // Get current page
  const currentPage = useMemo(() => {
    return pages.find(p => p.id === currentPageId) || null
  }, [pages, currentPageId])

  // Check if there are unpublished changes
  const hasUnpublishedChanges = useMemo(() => {
    const contentChanged = JSON.stringify(sections) !== JSON.stringify(publishedSections)
    const themeChanged = portfolio ? formData.draftTheme !== portfolio.publishedTheme : false
    return contentChanged || themeChanged
  }, [sections, publishedSections, formData.draftTheme, portfolio])

  // Compute draft status for indicator
  const draftStatus = useMemo((): DraftStatus => {
    if (saveStatus === 'saving') return 'saving'
    if (saveStatus === 'saved') return 'saved'
    if (saveStatus === 'error') return 'error'
    return hasUnpublishedChanges ? 'draft' : 'published'
  }, [saveStatus, hasUnpublishedChanges])

  // Load pages for portfolio
  const loadPages = useCallback(async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/pages?portfolioId=${portfolioId}`)
      if (res.ok) {
        const loadedPages = await res.json()
        setPages(loadedPages)
        
        // Select homepage or first page by default
        if (loadedPages.length > 0) {
          const homepage = loadedPages.find((p: ExtendedPageData) => p.isHomepage) || loadedPages[0]
          setCurrentPageId(homepage.id)
          
          // Load sections from draftContent (for editing)
          const pageSections = deserializeSections(homepage.draftContent)
          setSections(pageSections)
          setInitialSections(pageSections)
          
          // Load published sections (for comparison)
          const pubSections = deserializeSections(homepage.publishedContent)
          setPublishedSections(pubSections)
          
          // Set last published timestamp
          if (homepage.lastPublishedAt) {
            setLastPublishedAt(new Date(homepage.lastPublishedAt))
          }
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
              draftTheme: data.draftTheme || 'modern-minimal',
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
      formData.draftTheme !== initialFormData.draftTheme
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
      case 'dirty': return isExisting ? 'Save Draft' : 'Create Portfolio'
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
    setFormData(prev => ({ ...prev, draftTheme: themeId }))
  }

  // Auto-save settings when field loses focus
  const handleSettingsBlur = useCallback(async () => {
    if (!portfolio) return
    
    try {
      setSaveStatus('saving')
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: portfolio.id,
          name: formData.name,
          slug: formData.slug,
          title: portfolio.title,
          bio: portfolio.bio,
          theme: formData.draftTheme,
        }),
      })
      
      if (res.ok) {
        const saved = await res.json()
        setPortfolio(saved)
        setInitialFormData({...formData})
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Failed to auto-save settings:', error)
      setSaveStatus('error')
    }
  }, [portfolio, formData])

  const handleSectionsChange = useCallback((newSections: Section[]) => {
    setSections(newSections)
  }, [])

  const handleAddSection = useCallback((section: Section) => {
    setSections(prev => [...prev, section])
  }, [])

  // Save draft content function (used by auto-save and manual save)
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!portfolio || !currentPageId) return false
    
    try {
      const contentJson = serializeSections(sections)
      
      const res = await fetch(`/api/pages/${currentPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: contentJson }),
      })
      
      if (!res.ok) {
        console.error('Failed to save draft')
        return false
      }
      
      // Update local pages array
      setPages(prev => prev.map(p =>
        p.id === currentPageId
          ? { ...p, draftContent: contentJson }
          : p
      ))
      
      setInitialSections(sections)
      return true
    } catch (error) {
      console.error('Failed to save draft:', error)
      return false
    }
  }, [portfolio, currentPageId, sections])

  // Auto-save hook - saves draft every 30 seconds
  const autoSave = useAutoSave({
    data: sections,
    onSave: saveDraft,
    interval: 30000, // 30 seconds
    enabled: !!portfolio && !!currentPageId && isDirty,
  })

  // Map auto-save status to SaveStatus
  useEffect(() => {
    if (autoSave.status === 'saving') {
      setSaveStatus('saving')
    } else if (autoSave.status === 'saved') {
      setSaveStatus('saved')
    } else if (autoSave.status === 'error') {
      setSaveStatus('error')
    }
  }, [autoSave.status])

  // Handle page selection
  const handleSelectPage = useCallback(async (pageId: string) => {
    // Don't switch to the same page
    if (pageId === currentPageId) return
    
    // Save current page draft content first if we have changes
    if (currentPageId && isDirty) {
      await saveDraft()
    }
    
    // Load the new page's sections
    const page = pages.find(p => p.id === pageId) as ExtendedPageData | undefined
    if (page) {
      const pageSections = deserializeSections(page.draftContent)
      setSections(pageSections)
      setInitialSections(pageSections)
      
      const pubSections = deserializeSections(page.publishedContent)
      setPublishedSections(pubSections)
      
      if (page.lastPublishedAt) {
        setLastPublishedAt(new Date(page.lastPublishedAt))
      } else {
        setLastPublishedAt(null)
      }
      
      setCurrentPageId(pageId)
    }
  }, [currentPageId, pages, isDirty, saveDraft])

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
        // Create new page
        // Save current page's content BEFORE creating new page
        if (currentPageId && isDirty) {
          await saveDraft()
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
        setPublishedSections([])
        setLastPublishedAt(null)
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
          setPublishedSections([])
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

  // Publish current page
  const handlePublish = useCallback(async (): Promise<boolean> => {
    if (!currentPageId) return false
    
    try {
      // Save portfolio settings first (includes theme)
      if (portfolio && isDirty) {
        const portfolioRes = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: portfolio.id,
            name: formData.name,
            slug: formData.slug,
            title: portfolio.title,
            bio: portfolio.bio,
            theme: formData.draftTheme,
          }),
        })
        
        if (!portfolioRes.ok) {
          throw new Error('Failed to save portfolio settings')
        }
        
        // Sync initial state to clear dirty flag
        setInitialFormData({...formData})
        
        // Update portfolio state with new publishedTheme (it will be published next)
        setPortfolio(prev => prev ? {...prev, draftTheme: formData.draftTheme} : null)
      }

      // Save draft first to ensure we publish latest changes
      await saveDraft()
      
      // Sync initial sections to clear dirty flag
      setInitialSections([...sections])
      
      const res = await fetch(`/api/pages/${currentPageId}/publish`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to publish')
      }
      
      const result = await res.json()
      
      // Update local state
      setPublishedSections(sections)
      setLastPublishedAt(new Date())
      
      // Update portfolio's publishedTheme in local state
      setPortfolio(prev => prev ? {...prev, publishedTheme: formData.draftTheme} : null)
      
      // Update pages array
      setPages(prev => prev.map(p =>
        p.id === currentPageId
          ? { ...p, publishedContent: result.page.publishedContent, lastPublishedAt: result.page.lastPublishedAt }
          : p
      ))
      
      setMessage({ type: 'success', text: 'Page published successfully!' })
      return true
    } catch (error) {
      console.error('Failed to publish:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish',
      })
      return false
    }
  }, [currentPageId, saveDraft, sections, portfolio, isDirty, formData])

  // Open preview in new tab
  const handlePreview = useCallback(() => {
    if (!portfolio) return
    const previewUrl = `/preview/${portfolio.slug}${currentPage?.slug ? `/${currentPage.slug}` : ''}`
    window.open(previewUrl, '_blank')
  }, [portfolio, currentPage])

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
          theme: formData.draftTheme,
        }),
      })

      if (!portfolioRes.ok) {
        const error = await portfolioRes.json()
        throw new Error(error.message || 'Failed to save portfolio')
      }

      const saved = await portfolioRes.json()
      setPortfolio(saved)
      
      // For new portfolios: set pages and currentPageId from response
      let pageIdToSave = currentPageId
      if (!portfolio && saved.pages?.length > 0) {
        setPages(saved.pages)
        const homepage = saved.pages.find((p: ExtendedPageData) => p.isHomepage) || saved.pages[0]
        setCurrentPageId(homepage.id)
        pageIdToSave = homepage.id
        
        // Load sections from the homepage
        if (homepage.draftContent) {
          const defaultSections = deserializeSections(homepage.draftContent)
          setSections(defaultSections)
          setInitialSections(defaultSections)
        }
        if (homepage.publishedContent) {
          const pubSections = deserializeSections(homepage.publishedContent)
          setPublishedSections(pubSections)
        }
        if (homepage.lastPublishedAt) {
          setLastPublishedAt(new Date(homepage.lastPublishedAt))
        }
      }
      
      // If we have a current page, save its draft content
      if (pageIdToSave) {
        const pageToSave = !portfolio && saved.pages?.length > 0
          ? saved.pages.find((p: ExtendedPageData) => p.id === pageIdToSave)
          : currentPage

        const pageRes = await fetch(`/api/pages/${pageIdToSave}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: pageToSave?.title,
            slug: pageToSave?.slug,
            isHomepage: pageToSave?.isHomepage,
            showInNav: pageToSave?.showInNav,
            draftContent: contentJson,
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
      setMessage({ type: 'success', text: 'Draft saved successfully!' })
      
      // Sync formData with saved values
      const syncedFormData = {
        name: saved.name || '',
        slug: saved.slug || '',
        draftTheme: saved.draftTheme || 'modern-minimal',
      }
      setFormData(syncedFormData)
      setInitialFormData(syncedFormData)
      setInitialSections(sections)
      
      // Reset save status after delay
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
      
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
            {showMenuButton && (
              <HamburgerButton
                isOpen={isSidebarOpen}
                onClick={toggleSidebar}
              />
            )}
            <span className="admin-logo">Portfolio Builder</span>

            <nav className="admin-nav">
              <Link href="/admin/categories" className="admin-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Categories</span>
              </Link>
            </nav>

            <div className="admin-header-actions">
              {/* Settings Dropdown Trigger */}
              {portfolio && (
                <button
                  ref={settingsButtonRef}
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="btn btn-ghost settings-trigger"
                  aria-label="Portfolio settings"
                  aria-expanded={settingsOpen}
                  aria-haspopup="dialog"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              )}

              {/* Settings Dropdown */}
              <SettingsDropdown
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                triggerRef={settingsButtonRef}
                name={formData.name}
                slug={formData.slug}
                theme={formData.draftTheme}
                onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
                onSlugChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                onThemeChange={handleThemeChange}
                onFieldBlur={handleSettingsBlur}
                isSaving={saveStatus === 'saving'}
                hasHeroSection={hasHeroSection}
              />

              {/* Draft/Publish Status Indicator */}
              {portfolio && (
                <DraftIndicator 
                  status={draftStatus}
                  hasUnpublishedChanges={hasUnpublishedChanges}
                />
              )}
              
              {/* Preview Button */}
              {portfolio && (
                <button
                  type="button"
                  onClick={handlePreview}
                  className="btn btn-ghost"
                  title="Preview draft in new tab"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
              )}
              
              {/* Desktop-only header save button */}
              <button
                type="submit"
                form="portfolio-form"
                className={`btn btn-secondary desktop-header-save-btn save-btn save-btn--${saveButtonState}`}
                disabled={saving || saveButtonState === 'clean'}
                aria-disabled={saveButtonState === 'clean'}
              >
                {getSaveButtonLabel(!!portfolio)}
              </button>
              
              {/* Publish Button */}
              {portfolio && (
                <PublishButton
                  hasChangesToPublish={hasUnpublishedChanges}
                  onPublish={handlePublish}
                  className="desktop-header-save-btn"
                />
              )}
              
              {portfolio && formData.slug && (
                <a
                  href={`/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost desktop-header-save-btn"
                  title="View published site"
                >
                  View Live →
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
            {/* Show creation form if no portfolio exists */}
            {!portfolio && (
              <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header">
                  <h1 className="card-title">Create Your Portfolio</h1>
                </div>

                <div className="card-body">
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
                      required
                    />
                  </div>

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
                    <ThemeSelector
                      value={formData.draftTheme}
                      onChange={handleThemeChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}

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
                          setEditingPage(currentPage as ExtendedPageData)
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
                            setDeletingPage(currentPage as ExtendedPageData)
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

            {/* Content Sections - Only show if portfolio and page exist */}
            {portfolio && currentPage && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">
                    {currentPage ? `${currentPage.title} Content` : 'Page Content'}
                  </h2>
                  {lastPublishedAt && (
                    <p className="card-subtitle">
                      Last published: {lastPublishedAt.toLocaleString()}
                    </p>
                  )}
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
            )}

            {/* Desktop-only save button (hidden on mobile via CSS) */}
            <div style={{ paddingTop: 'var(--space-6)' }} className="mobile-hide-save-btn">
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  type="submit"
                  className={`btn btn-secondary save-btn save-btn--${saveButtonState}`}
                  disabled={saving || saveButtonState === 'clean'}
                  aria-disabled={saveButtonState === 'clean'}
                  style={{ flex: 1 }}
                >
                  {getSaveButtonLabel(!!portfolio)}
                </button>
                {portfolio && (
                  <PublishButton
                    hasChangesToPublish={hasUnpublishedChanges}
                    onPublish={handlePublish}
                  />
                )}
              </div>
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
        updateLabel="Save Draft"
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

      <style jsx>{`
        .admin-nav {
          display: flex;
          gap: 8px;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-muted, #6b7280);
          text-decoration: none;
          transition: background-color 0.15s, color 0.15s;
        }

        .admin-nav-link:hover {
          background: var(--color-bg-hover, #f3f4f6);
          color: var(--color-text, #111827);
        }

        .admin-nav-link svg {
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .admin-nav-link span {
            display: none;
          }
          
          .admin-nav-link {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}
