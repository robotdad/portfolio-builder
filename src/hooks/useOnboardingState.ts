'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// Increment version when state shape changes to handle migration
const STORAGE_KEY = 'portfolio-onboarding-state-v2'
const LEGACY_STORAGE_KEY = 'portfolio-onboarding-state'

export interface OnboardingState {
  // Step 1: Portfolio
  portfolioName: string
  portfolioSlug: string
  portfolioTitle: string        // Professional title (optional), max 100 chars
  portfolioBio: string          // Short bio (optional), max 500 chars
  profilePhotoFile: File | null // Profile photo file (not persisted to sessionStorage)
  profilePhotoPreview: string   // Data URL for preview (persisted to sessionStorage)

  // Step 2: Theme
  selectedTheme: 'modern-minimal' | 'classic-elegant' | 'bold-editorial'

  // Step 3: Category + Project
  categoryName: string
  projectTitle: string

  // Tracking
  currentStep: 1 | 2 | 3
  completedSteps: number[]
}

// Fields that can be serialized to sessionStorage (excludes File objects)
type SerializableState = Omit<OnboardingState, 'profilePhotoFile'>

const DEFAULT_STATE: OnboardingState = {
  portfolioName: '',
  portfolioSlug: '',
  portfolioTitle: '',
  portfolioBio: '',
  profilePhotoFile: null,
  profilePhotoPreview: '',
  selectedTheme: 'modern-minimal',
  categoryName: '',
  projectTitle: '',
  currentStep: 1,
  completedSteps: [],
}

interface UseOnboardingStateReturn {
  /** Current onboarding state */
  state: OnboardingState
  /** Update any fields in the state */
  updateState: (partial: Partial<OnboardingState>) => void
  /** Mark a step as completed */
  completeStep: (step: number) => void
  /** Navigate to a specific step */
  goToStep: (step: 1 | 2 | 3) => void
  /** Clear all state and sessionStorage */
  reset: () => void
  /** Get current state (useful for callbacks) */
  getState: () => OnboardingState
}

/**
 * Hook for managing onboarding wizard state with sessionStorage persistence
 *
 * Features:
 * - Persists state to sessionStorage across page navigations
 * - SSR-safe (checks for window before accessing sessionStorage)
 * - Provides step tracking and completion status
 * - Auto-saves on any state change
 * - Handles File objects specially (not persisted, lost on refresh)
 *
 * @example
 * ```tsx
 * const { state, updateState, completeStep, goToStep, reset } = useOnboardingState();
 *
 * // Update portfolio name
 * updateState({ portfolioName: 'My Portfolio', portfolioSlug: 'my-portfolio' });
 *
 * // Update bio fields
 * updateState({ 
 *   portfolioTitle: 'Senior Designer',
 *   portfolioBio: 'I create beautiful digital experiences...'
 * });
 *
 * // Handle profile photo (File stored in memory, preview URL persisted)
 * const handlePhotoChange = (file: File) => {
 *   const previewUrl = URL.createObjectURL(file);
 *   updateState({ profilePhotoFile: file, profilePhotoPreview: previewUrl });
 * };
 *
 * // Complete step 1 and move to step 2
 * completeStep(1);
 * goToStep(2);
 *
 * // On final submit success
 * reset();
 * ```
 */
// Helper to load state from sessionStorage (handles migration)
function loadStateFromStorage(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE

  try {
    // Try to load from new storage key first
    let stored = sessionStorage.getItem(STORAGE_KEY)
    
    // Migrate from legacy key if new key doesn't exist
    if (!stored) {
      const legacyStored = sessionStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacyStored) {
        // Migrate legacy data - add new fields with defaults
        const legacyParsed = JSON.parse(legacyStored)
        const migrated: SerializableState = {
          ...DEFAULT_STATE,
          ...legacyParsed,
          // Ensure new fields have defaults if missing
          portfolioTitle: legacyParsed.portfolioTitle ?? '',
          portfolioBio: legacyParsed.portfolioBio ?? '',
          profilePhotoPreview: legacyParsed.profilePhotoPreview ?? '',
        }
        // Save migrated data to new key
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        // Remove legacy key
        sessionStorage.removeItem(LEGACY_STORAGE_KEY)
        stored = JSON.stringify(migrated)
      }
    }

    if (stored) {
      const parsed = JSON.parse(stored) as SerializableState
      // Merge with defaults to ensure all fields exist, add non-serializable fields
      return {
        ...DEFAULT_STATE,
        ...parsed,
        profilePhotoFile: null, // File objects can't be restored from storage
      }
    }
  } catch (error) {
    console.error('Failed to load onboarding state from sessionStorage:', error)
  }
  
  return DEFAULT_STATE
}

export function useOnboardingState(): UseOnboardingStateReturn {
  // Initialize state with lazy initialization from sessionStorage
  // This avoids setState in useEffect for hydration
  const [state, setState] = useState<OnboardingState>(() => loadStateFromStorage())

  // Ref to always have access to current state (for getState callback)
  const stateRef = useRef<OnboardingState>(state)
  
  // Track initialization to avoid saving on first render
  const isInitializedRef = useRef(false)

  // Keep ref in sync with state (must be in useEffect, not during render)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Mark as initialized after mount to enable sessionStorage saves
  useEffect(() => {
    isInitializedRef.current = true
  }, [])

  // Save to sessionStorage whenever state changes (after initialization)
  useEffect(() => {
    if (!isInitializedRef.current) return
    if (typeof window === 'undefined') return

    try {
      // Create serializable version of state (exclude File object)
      const serializableState: SerializableState = {
        portfolioName: state.portfolioName,
        portfolioSlug: state.portfolioSlug,
        portfolioTitle: state.portfolioTitle,
        portfolioBio: state.portfolioBio,
        profilePhotoPreview: state.profilePhotoPreview,
        selectedTheme: state.selectedTheme,
        categoryName: state.categoryName,
        projectTitle: state.projectTitle,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState))
    } catch (error) {
      console.error('Failed to save onboarding state to sessionStorage:', error)
    }
  }, [state])

  // Update any fields in the state
  const updateState = useCallback((partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  // Mark a step as completed
  const completeStep = useCallback((step: number) => {
    setState((prev) => {
      if (prev.completedSteps.includes(step)) {
        return prev
      }
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, step].sort((a, b) => a - b),
      }
    })
  }, [])

  // Navigate to a specific step
  const goToStep = useCallback((step: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }, [])

  // Clear all state and sessionStorage
  const reset = useCallback(() => {
    // Revoke any object URL to prevent memory leaks
    if (state.profilePhotoPreview && state.profilePhotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(state.profilePhotoPreview)
    }

    setState(DEFAULT_STATE)

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(LEGACY_STORAGE_KEY) // Clean up legacy key too
      } catch (error) {
        console.error('Failed to clear onboarding state from sessionStorage:', error)
      }
    }
  }, [state.profilePhotoPreview])

  // Get current state (useful for callbacks that need fresh state)
  const getState = useCallback(() => {
    return stateRef.current
  }, [])

  return {
    state,
    updateState,
    completeStep,
    goToStep,
    reset,
    getState,
  }
}
