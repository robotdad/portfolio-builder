'use client'

import React from 'react'
import Link from 'next/link'

export interface DashboardStatsCardProps {
  title: string
  count: number
  subtitle: string
  linkHref: string
  linkText: string
  icon?: React.ReactNode
  variant?: 'default' | 'warning' | 'success'
}

export function DashboardStatsCard({
  title,
  count,
  subtitle,
  linkHref,
  linkText,
  icon,
  variant = 'default',
}: DashboardStatsCardProps) {
  return (
    <div className={`dashboard-stats-card dashboard-stats-card--${variant}`}>
      <div className="dashboard-stats-card__header">
        <h3 className="dashboard-stats-card__title">{title}</h3>
        {icon && <div className="dashboard-stats-card__icon">{icon}</div>}
      </div>
      
      <div className="dashboard-stats-card__body">
        <div className="dashboard-stats-card__count">{count}</div>
        <p className="dashboard-stats-card__subtitle">{subtitle}</p>
      </div>
      
      <div className="dashboard-stats-card__footer">
        <Link href={linkHref} className="dashboard-stats-card__link">
          {linkText} →
        </Link>
      </div>

      <style jsx>{`
        .dashboard-stats-card {
          background: white;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: var(--radius-md, 8px);
          padding: var(--space-6, 24px);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: var(--space-4, 16px);
        }

        .dashboard-stats-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .dashboard-stats-card--warning {
          border-color: var(--color-warning, #f59e0b);
          background: var(--color-warning-light, #fffbeb);
        }

        .dashboard-stats-card--success {
          border-color: var(--color-success, #10b981);
          background: var(--color-success-light, #f0fdf4);
        }

        .dashboard-stats-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2, 8px);
        }

        .dashboard-stats-card__title {
          font-size: var(--text-sm, 14px);
          font-weight: 600;
          color: var(--text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .dashboard-stats-card__icon {
          color: var(--text-secondary, #6b7280);
          display: flex;
          align-items: center;
        }

        .dashboard-stats-card__body {
          display: flex;
          flex-direction: column;
          gap: var(--space-1, 4px);
        }

        .dashboard-stats-card__count {
          font-size: var(--text-4xl, 36px);
          font-weight: 700;
          color: var(--text-primary, #111827);
          line-height: 1;
        }

        .dashboard-stats-card__subtitle {
          font-size: var(--text-sm, 14px);
          color: var(--text-secondary, #6b7280);
          margin: 0;
        }

        .dashboard-stats-card__footer {
          margin-top: auto;
          padding-top: var(--space-2, 8px);
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .dashboard-stats-card__link {
          font-size: var(--text-sm, 14px);
          font-weight: 500;
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .dashboard-stats-card__link:hover {
          color: var(--color-primary-dark, #2563eb);
          text-decoration: underline;
        }

        /* Mobile responsive - compact padding */
        @media (max-width: 768px) {
          .dashboard-stats-card {
            padding: var(--space-4, 16px);
            gap: var(--space-3, 12px);
          }

          .dashboard-stats-card__count {
            font-size: var(--text-3xl, 30px);
          }
        }
      `}</style>
    </div>
  )
}
