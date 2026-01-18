'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardStatsCard } from './DashboardStatsCard'

export interface DashboardOverviewProps {
  portfolioId: string
}

interface PageData {
  id: string
  title: string
  slug: string
  lastPublishedAt: string | null
  draftContent: string | null
  publishedContent: string | null
}

interface CategoryData {
  id: string
  name: string
  slug: string
  _count: {
    projects: number
  }
  projects?: Array<{
    id: string
    title: string
    draftContent: string | null
    publishedContent: string | null
  }>
}

interface Stats {
  pages: {
    total: number
    published: number
    draft: number
  }
  categories: {
    total: number
    empty: number
  }
  projects: {
    total: number
  }
}

export function DashboardOverview({ portfolioId }: DashboardOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [isPublishingAll, setIsPublishingAll] = useState(false)
  const [publishAllError, setPublishAllError] = useState<string | null>(null)
  const [publishAllSuccess, setPublishAllSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch pages and categories in parallel
        const [pagesRes, categoriesRes] = await Promise.all([
          fetch(`/api/pages?portfolioId=${portfolioId}`),
          fetch(`/api/categories?portfolioId=${portfolioId}`)
        ])

        if (!pagesRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const pages: PageData[] = await pagesRes.json()
        const categoriesData = await categoriesRes.json()
        
        // Categories API returns { data: [...], success: true }
        const categories: CategoryData[] = categoriesData.data || categoriesData

        // Compute stats
        const computedStats: Stats = {
          pages: {
            total: pages.length,
            published: pages.filter(p => p.lastPublishedAt !== null).length,
            draft: pages.filter(p => p.lastPublishedAt === null).length
          },
          categories: {
            total: categories.length,
            empty: categories.filter(c => c._count.projects === 0).length
          },
          projects: {
            total: categories.reduce((sum, c) => sum + c._count.projects, 0)
          }
        }

        setStats(computedStats)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [portfolioId])

  // Handler to publish all pages and projects with unpublished changes
  const handlePublishAll = async () => {
    setIsPublishingAll(true)
    setPublishAllError(null)
    setPublishAllSuccess(false)

    try {
      // Fetch all pages and projects
      const [pagesRes, categoriesRes] = await Promise.all([
        fetch(`/api/pages?portfolioId=${portfolioId}`),
        fetch(`/api/categories?portfolioId=${portfolioId}&includeProjects=true`)
      ])

      if (!pagesRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch content for publishing')
      }

      const pages: PageData[] = await pagesRes.json()
      const categoriesData = await categoriesRes.json()
      const categories: CategoryData[] = categoriesData.data || categoriesData

      // Find pages with unpublished changes
      const pagesToPublish = pages.filter(p => 
        p.draftContent !== null && p.draftContent !== p.publishedContent
      )

      // Collect all projects from categories
      const allProjects: Array<{ id: string; draftContent: string | null; publishedContent: string | null }> = []
      categories.forEach(cat => {
        if (cat.projects) {
          cat.projects.forEach(proj => {
            allProjects.push(proj)
          })
        }
      })

      // Find projects with unpublished changes
      const projectsToPublish = allProjects.filter(p => 
        p.draftContent !== null && p.draftContent !== p.publishedContent
      )

      // Publish all pages
      const pagePublishPromises = pagesToPublish.map(page =>
        fetch(`/api/pages/${page.id}/publish`, { method: 'POST' })
      )

      // Publish all projects
      const projectPublishPromises = projectsToPublish.map(project =>
        fetch(`/api/projects/${project.id}/publish`, { method: 'POST' })
      )

      // Execute all publish operations
      const results = await Promise.allSettled([
        ...pagePublishPromises,
        ...projectPublishPromises
      ])

      // Check for failures
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        throw new Error(`Failed to publish ${failures.length} item(s)`)
      }

      // Success!
      setPublishAllSuccess(true)
      
      // Reload dashboard data to show updated stats
      window.location.reload()
    } catch (err) {
      console.error('Publish all failed:', err)
      setPublishAllError(err instanceof Error ? err.message : 'Failed to publish all content')
    } finally {
      setIsPublishingAll(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="dashboard-overview__loading">
          <span className="loading-spinner"></span>
          <span>Loading dashboard...</span>
        </div>

        <style jsx>{`
          .dashboard-overview {
            padding: var(--space-6, 24px);
          }

          .dashboard-overview__loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-4, 16px);
            padding: var(--space-12, 48px);
            color: var(--text-secondary, #6b7280);
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border-color, #e5e7eb);
            border-top-color: var(--color-primary, #3b82f6);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-overview">
        <div className="dashboard-overview__error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>

        <style jsx>{`
          .dashboard-overview {
            padding: var(--space-6, 24px);
          }

          .dashboard-overview__error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-4, 16px);
            padding: var(--space-12, 48px);
            color: var(--text-secondary, #6b7280);
            text-align: center;
          }

          .dashboard-overview__error svg {
            color: var(--color-error, #ef4444);
          }

          .dashboard-overview__error h2 {
            font-size: var(--text-xl, 20px);
            font-weight: 600;
            color: var(--text-primary, #111827);
            margin: 0;
          }

          .dashboard-overview__error p {
            font-size: var(--text-sm, 14px);
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  // Empty state (no stats)
  if (!stats) {
    return (
      <div className="dashboard-overview">
        <div className="dashboard-overview__empty">
          <p>No data available</p>
        </div>

        <style jsx>{`
          .dashboard-overview {
            padding: var(--space-6, 24px);
          }

          .dashboard-overview__empty {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-12, 48px);
            color: var(--text-secondary, #6b7280);
          }
        `}</style>
      </div>
    )
  }

  // Main dashboard content
  return (
    <div className="dashboard-overview">
      <div className="dashboard-overview__header">
        <h1 className="dashboard-overview__title">Dashboard</h1>
        <p className="dashboard-overview__subtitle">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-overview__stats">
        <DashboardStatsCard
          title="Pages"
          count={stats.pages.total}
          subtitle={`${stats.pages.published} published, ${stats.pages.draft} draft`}
          linkHref="/admin"
          linkText="Manage pages"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          variant={stats.pages.draft > 0 ? 'warning' : 'default'}
        />

        <DashboardStatsCard
          title="Categories"
          count={stats.categories.total}
          subtitle={stats.categories.empty > 0 
            ? `${stats.categories.empty} empty categor${stats.categories.empty === 1 ? 'y' : 'ies'}`
            : 'All categories have projects'
          }
          linkHref="/admin/categories"
          linkText="Manage categories"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          variant={stats.categories.empty > 0 ? 'warning' : 'success'}
        />

        <DashboardStatsCard
          title="Projects"
          count={stats.projects.total}
          subtitle={`Across ${stats.categories.total} categor${stats.categories.total === 1 ? 'y' : 'ies'}`}
          linkHref="/admin/categories"
          linkText="View all projects"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
        />
      </div>

      {/* Publish All Section */}
      {stats && (stats.pages.total > 0 || stats.projects.total > 0) && (
        <div className="dashboard-overview__publish-all">
          <div className="publish-all-content">
            <div>
              <h2 className="publish-all-title">Publish All Changes</h2>
              <p className="publish-all-description">
                Publish all pages and projects with unpublished changes in one action
              </p>
            </div>
            <button
              onClick={handlePublishAll}
              disabled={isPublishingAll}
              className="btn btn-primary"
              style={{ minWidth: '120px' }}
            >
              {isPublishingAll ? 'Publishing...' : 'Publish All'}
            </button>
          </div>
          {publishAllError && (
            <div className="publish-all-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {publishAllError}
            </div>
          )}
          {publishAllSuccess && (
            <div className="publish-all-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              All changes published successfully!
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-overview__actions">
        <h2 className="dashboard-overview__actions-title">Quick Actions</h2>
        <div className="dashboard-overview__actions-grid">
          <Link href="/admin" className="dashboard-action-card">
            <div className="dashboard-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="dashboard-action-card__content">
              <h3 className="dashboard-action-card__title">Edit Pages</h3>
              <p className="dashboard-action-card__description">
                Update page content and settings
              </p>
            </div>
          </Link>

          <Link href="/admin/categories" className="dashboard-action-card">
            <div className="dashboard-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className="dashboard-action-card__content">
              <h3 className="dashboard-action-card__title">Manage Categories</h3>
              <p className="dashboard-action-card__description">
                Organize your portfolio projects
              </p>
            </div>
          </Link>

          <a href="/preview" target="_blank" rel="noopener noreferrer" className="dashboard-action-card">
            <div className="dashboard-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="dashboard-action-card__content">
              <h3 className="dashboard-action-card__title">Preview Draft</h3>
              <p className="dashboard-action-card__description">
                See your draft changes before publishing
              </p>
            </div>
          </a>
        </div>
      </div>

      <style jsx>{`
        .dashboard-overview {
          padding: var(--space-6, 24px);
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-overview__header {
          margin-bottom: var(--space-8, 32px);
        }

        .dashboard-overview__title {
          font-size: var(--text-3xl, 30px);
          font-weight: 700;
          color: var(--text-primary, #111827);
          margin: 0 0 var(--space-2, 8px) 0;
        }

        .dashboard-overview__subtitle {
          font-size: var(--text-base, 16px);
          color: var(--text-secondary, #6b7280);
          margin: 0;
        }

        /* Stats Grid - 3 columns on desktop */
        .dashboard-overview__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6, 24px);
          margin-bottom: var(--space-8, 32px);
        }

        /* Quick Actions Section */
        .dashboard-overview__actions {
          margin-top: var(--space-8, 32px);
        }

        .dashboard-overview__actions-title {
          font-size: var(--text-xl, 20px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 var(--space-4, 16px) 0;
        }

        .dashboard-overview__actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-4, 16px);
        }

        .dashboard-action-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4, 16px);
          padding: var(--space-4, 16px);
          background: white;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dashboard-action-card:hover {
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
        }

        .dashboard-action-card__icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-primary-light, #eff6ff);
          border-radius: var(--radius-md, 8px);
          color: var(--color-primary, #3b82f6);
        }

        .dashboard-action-card__content {
          flex: 1;
        }

        .dashboard-action-card__title {
          font-size: var(--text-base, 16px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 var(--space-1, 4px) 0;
        }

        .dashboard-action-card__description {
          font-size: var(--text-sm, 14px);
          color: var(--text-secondary, #6b7280);
          margin: 0;
        }

        /* Tablet - 2 columns */
        @media (max-width: 1024px) {
          .dashboard-overview__stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Publish All Section */
        .dashboard-overview__publish-all {
          margin-top: var(--space-8, 32px);
          padding: var(--space-4, 16px);
          background: white;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: var(--radius-md, 8px);
        }

        .publish-all-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4, 16px);
        }

        .publish-all-title {
          font-size: var(--text-lg, 18px);
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 var(--space-1, 4px) 0;
        }

        .publish-all-description {
          font-size: var(--text-sm, 14px);
          color: var(--text-secondary, #6b7280);
          margin: 0;
        }

        .publish-all-error {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          margin-top: var(--space-3, 12px);
          padding: var(--space-3, 12px);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-sm, 6px);
          color: #991b1b;
          font-size: var(--text-sm, 14px);
        }

        .publish-all-error svg {
          flex-shrink: 0;
        }

        .publish-all-success {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
          margin-top: var(--space-3, 12px);
          padding: var(--space-3, 12px);
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: var(--radius-sm, 6px);
          color: #166534;
          font-size: var(--text-sm, 14px);
        }

        .publish-all-success svg {
          flex-shrink: 0;
        }

        /* Mobile - stack vertically */
        @media (max-width: 768px) {
          .dashboard-overview {
            padding: var(--space-4, 16px);
          }

          .dashboard-overview__header {
            margin-bottom: var(--space-6, 24px);
          }

          .dashboard-overview__title {
            font-size: var(--text-2xl, 24px);
          }

          .dashboard-overview__stats {
            grid-template-columns: 1fr;
            gap: var(--space-4, 16px);
          }

          .dashboard-overview__actions-grid {
            grid-template-columns: 1fr;
          }

          .publish-all-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
