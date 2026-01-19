'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui'

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
    <>
      <Link href={linkHref} className="dashboard-stats-card-link">
        <Card
          variant="interactive"
          className={`dashboard-stats-card dashboard-stats-card--${variant}`}
        >
          <CardHeader
            actions={icon && <span className="dashboard-stats-card__icon">{icon}</span>}
          >
            <h3 className="dashboard-stats-card__title">{title}</h3>
          </CardHeader>

          <CardBody>
            <div className="dashboard-stats-card__count">{count}</div>
            <p className="dashboard-stats-card__subtitle">{subtitle}</p>
          </CardBody>

          <CardFooter align="start">
            <span className="dashboard-stats-card__link">
              {linkText} →
            </span>
          </CardFooter>
        </Card>
      </Link>

      <style jsx>{`
        /* Wrapper link styles - makes entire card clickable */
        :global(.dashboard-stats-card-link) {
          text-decoration: none;
          display: block;
          color: inherit;
        }

        :global(.dashboard-stats-card-link:focus) {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
          border-radius: var(--radius-md, 8px);
        }

        :global(.dashboard-stats-card-link:focus-visible) {
          outline: 2px solid var(--color-primary, #3b82f6);
          outline-offset: 2px;
        }

        /* Variant colors - Card handles base styling */
        :global(.dashboard-stats-card--warning) {
          border-color: var(--color-warning, #f59e0b) !important;
          background: var(--color-warning-light, #fffbeb) !important;
        }

        :global(.dashboard-stats-card--success) {
          border-color: var(--color-success, #10b981) !important;
          background: var(--color-success-light, #f0fdf4) !important;
        }

        /* Hover lift effect */
        :global(.dashboard-stats-card:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
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

        .dashboard-stats-card__count {
          font-size: var(--text-4xl, 36px);
          font-weight: 700;
          color: var(--text-primary, #111827);
          line-height: 1;
        }

        .dashboard-stats-card__subtitle {
          font-size: var(--text-sm, 14px);
          color: var(--text-secondary, #6b7280);
          margin: var(--space-1, 4px) 0 0;
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

        /* Mobile responsive */
        @media (max-width: 768px) {
          .dashboard-stats-card__count {
            font-size: var(--text-3xl, 30px);
          }
        }
      `}</style>
    </>
  )
}
