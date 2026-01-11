'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/onboarding/StepLayout'
import { ThemeCard, type Theme } from '@/components/onboarding/ThemeCard'
import { useOnboardingState } from '@/hooks/useOnboardingState'

const THEMES: Theme[] = [
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

type ThemeId = 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

export default function ThemeSelectionPage() {
  const router = useRouter()
  const { state, updateState, completeStep } = useOnboardingState()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('modern-minimal')

  // Portfolio existence check - redirect if already onboarded
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio')
        const result = await res.json()
        // API returns { success: true, data: portfolio } - unwrap it
        if (result.success && result.data?.id) {
          router.push('/admin')
          return
        }
      } catch (error) {
        // If check fails, allow onboarding to proceed
      }
      setIsChecking(false)
    }
    checkPortfolio()
  }, [router])

  // Initialize from persisted state once loaded
  useEffect(() => {
    if (state.selectedTheme) {
      setSelectedTheme(state.selectedTheme)
    }
  }, [state.selectedTheme])

  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedTheme(themeId)
  }

  const handleContinue = () => {
    updateState({ selectedTheme, currentStep: 3 })
    completeStep(2)
    router.push('/welcome/first-project')
  }

  // Show loading state while checking for existing portfolio
  if (isChecking) {
    return (
      <div className="loading-container">
        <span>Loading...</span>
        <style jsx>{`
          .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: var(--color-text-muted, #6b7280);
          }
        `}</style>
      </div>
    )
  }

  return (
    <StepLayout
      title="Choose Your Style"
      subtitle="Pick a theme that matches your aesthetic. You can change it later."
      currentStep={2}
    >
      <div className="theme-selection">
        <div className="theme-grid" role="listbox" aria-label="Theme options">
          {THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={selectedTheme === theme.id}
              onSelect={() => handleThemeSelect(theme.id as ThemeId)}
            />
          ))}
        </div>

        <div className="actions">
          <button
            type="button"
            className="continue-button"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        .theme-selection {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .theme-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .theme-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .actions {
          margin-top: auto;
          padding-top: 32px;
        }

        .continue-button {
          width: 100%;
          min-height: 44px;
          padding: 12px 24px;
          font-size: var(--font-size-base, 16px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-text-on-accent, #ffffff);
          background-color: var(--color-accent, #3b82f6);
          border: none;
          border-radius: var(--radius-md, 6px);
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .continue-button:hover {
          background-color: var(--color-accent-hover, #2563eb);
        }

        .continue-button:focus-visible {
          outline: 2px solid var(--color-accent, #3b82f6);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .continue-button {
            transition: none;
          }
        }
      `}</style>
    </StepLayout>
  )
}
