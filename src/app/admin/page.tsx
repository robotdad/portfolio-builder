'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SectionList } from '@/components/editor/SectionList'
import { AddSectionButton } from '@/components/editor/AddSectionButton'
import { SaveIndicator, SaveStatus } from '@/components/editor/SaveIndicator'
import { MobileSaveFooter } from '@/components/editor/MobileSaveFooter'
import { 
  type Section, 
  createHeroSection,
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
  content?: string | null
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
  
  // Section-based content
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
            
            // Load sections from content field, or migrate from legacy fields
            let loadedSections = deserializeSections(data.content)
            
            // If no sections but has legacy data, create a hero section from it
            if (loadedSections.length === 0 && (data.name || data.title || data.bio)) {
              const heroSection = createHeroSection(
                data.name || '',
                data.title || '',
                data.bio || ''
              )
              // If there's an asset, use it as profile image
              if (data.assets?.[0]) {
                heroSection.profileImageId = data.assets[0].id
                heroSection.profileImageUrl = data.assets[0].url
              }
              loadedSections = [heroSection]
            }
            
            setSections(loadedSections)
            setInitialSections(loadedSections)
          }
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPortfolio()
  }, [])

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
      
      const res = await fetch('/api/portfolio', {
        method: portfolio ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: portfolio?.id,
          name,
          slug: formData.slug,
          title,
          bio,
          theme: formData.theme,
          content: contentJson,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save portfolio')
      }

      const saved = await res.json()
      setPortfolio(saved)
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

  return (
    <div className="admin-layout">
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
                className="btn btn-primary desktop-header-save-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : portfolio ? 'Save' : 'Create'}
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

            {/* Content Sections */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Page Content</h2>
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
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%' }}
              >
                {saving ? (
                  <span className="loading">
                    <span className="loading-spinner"></span>
                    Saving...
                  </span>
                ) : portfolio ? (
                  'Save Changes'
                ) : (
                  'Create Portfolio'
                )}
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
    </div>
  )
}
