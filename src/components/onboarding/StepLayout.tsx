'use client'

import { type ReactNode } from 'react'
import { ProgressDots } from './ProgressDots'

interface StepLayoutProps {
  /** Step title displayed as h1 */
  title: string
  /** Optional subtitle with additional context */
  subtitle?: string
  /** Current step for progress indicator */
  currentStep: 1 | 2 | 3
  /** Step content */
  children: ReactNode
}

/**
 * Wrapper component providing consistent layout for all onboarding wizard steps.
 * Centers content with max-width, includes progress indicator, and handles spacing.
 */
export function StepLayout({
  title,
  subtitle,
  currentStep,
  children,
}: StepLayoutProps) {
  return (
    <div className="step-layout">
      <div className="step-layout__container">
        <header className="step-layout__header">
          <ProgressDots currentStep={currentStep} />
          <h1 className="step-layout__title">{title}</h1>
          {subtitle && (
            <p className="step-layout__subtitle">{subtitle}</p>
          )}
        </header>

        <main className="step-layout__content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .step-layout {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-background, #ffffff);
        }

        .step-layout__container {
          flex: 1;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 640px) {
          .step-layout__container {
            padding: 32px;
          }
        }

        .step-layout__header {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .step-layout__title {
          font-size: var(--font-size-2xl, 24px);
          font-weight: var(--font-weight-bold, 700);
          color: var(--color-text-primary, #1f2937);
          margin: 0;
          text-align: center;
          line-height: var(--leading-tight, 1.25);
        }

        @media (min-width: 640px) {
          .step-layout__title {
            font-size: var(--font-size-3xl, 30px);
          }
        }

        .step-layout__subtitle {
          font-size: var(--font-size-base, 16px);
          color: var(--color-text-muted, #6b7280);
          margin: 0;
          text-align: center;
          line-height: var(--leading-relaxed, 1.625);
        }

        .step-layout__content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  )
}
