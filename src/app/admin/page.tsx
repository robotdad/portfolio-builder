'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Portfolio {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  theme: string
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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    bio: '',
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
            setFormData({
              name: data.name || '',
              slug: data.slug || '',
              title: data.title || '',
              bio: data.bio || '',
              theme: data.theme || 'modern-minimal',
            })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/portfolio', {
        method: portfolio ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: portfolio?.id,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to save portfolio')
      }

      const saved = await res.json()
      setPortfolio(saved)
      setMessage({ type: 'success', text: 'Portfolio saved successfully!' })
      
      // Refresh to show updated data
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save portfolio',
      })
    } finally {
      setSaving(false)
    }
  }

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
            {portfolio && (
              <a 
                href={`/${portfolio.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View Portfolio →
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container" style={{ maxWidth: '640px' }}>
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h1 className="card-title">
                {portfolio ? 'Edit Your Portfolio' : 'Create Your Portfolio'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="card-body">
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
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens"
                  required
                />
                <p className="form-hint">
                  Your portfolio will be available at: /{formData.slug || 'your-name'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Professional Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Product Designer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio *
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Tell visitors about yourself, your experience, and what you do..."
                  rows={5}
                  required
                />
                <p className="form-hint">
                  A brief introduction about yourself and your work.
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

              <div style={{ paddingTop: 'var(--space-4)' }}>
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
        </div>
      </main>
    </div>
  )
}
