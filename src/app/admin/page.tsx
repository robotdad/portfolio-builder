'use client'

import { useState, useEffect } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DashboardOverview } from '@/components/admin/DashboardOverview'

interface Portfolio {
  id: string
  slug: string
  name: string
}

export default function AdminDashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load portfolio on mount
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch('/api/portfolio')
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setPortfolio(data)
          } else {
            setError('No portfolio found. Please create a portfolio first.')
          }
        } else {
          setError('Failed to load portfolio')
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        setError('Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }
    loadPortfolio()
  }, [])

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminPageHeader
          navigation={{ type: 'dashboard', title: 'Portfolio Builder' }}
        />
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

  if (error || !portfolio) {
    return (
      <div className="admin-layout">
        <AdminPageHeader
          navigation={{ type: 'dashboard', title: 'Portfolio Builder' }}
        />
        <main className="admin-main">
          <div className="container">
            <div className="error-state">
              <p>{error || 'Portfolio not found'}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
        
        <style jsx>{`
          .error-state {
            text-align: center;
            padding: 48px 24px;
          }
          
          .error-state p {
            margin-bottom: 16px;
            color: var(--admin-error, #dc2626);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <AdminPageHeader
        navigation={{ type: 'dashboard', title: 'Dashboard' }}
        actions={
          <a
            href={`/${portfolio.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            title="View published site"
          >
            View Live Site →
          </a>
        }
      />
      
      <main className="admin-main">
        <div className="container" style={{ maxWidth: '1200px' }}>
          <DashboardOverview
            portfolioId={portfolio.id}
            portfolioSlug={portfolio.slug}
          />
        </div>
      </main>
    </div>
  )
}
