'use client'

interface ProgressDotsProps {
  /** Current step (1-indexed) */
  currentStep: 1 | 2 | 3
  /** Total number of steps (default: 3) */
  totalSteps?: number
}

/**
 * Progress indicator showing wizard steps as dots.
 * Displays completed steps (filled), current step (filled + ring), 
 * and upcoming steps (outline only).
 */
export function ProgressDots({ currentStep, totalSteps = 3 }: ProgressDotsProps) {
  return (
    <nav
      className="progress-dots"
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      <ol className="progress-dots__list">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          const isUpcoming = step > currentStep

          return (
            <li
              key={step}
              className={`progress-dots__dot ${
                isCompleted ? 'progress-dots__dot--completed' : ''
              } ${isCurrent ? 'progress-dots__dot--current' : ''} ${
                isUpcoming ? 'progress-dots__dot--upcoming' : ''
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="visually-hidden">
                {isCompleted && `Step ${step}, completed`}
                {isCurrent && `Step ${step}, current`}
                {isUpcoming && `Step ${step}, upcoming`}
              </span>
            </li>
          )
        })}
      </ol>

      <style jsx>{`
        .progress-dots {
          display: flex;
          justify-content: center;
        }

        .progress-dots__list {
          display: flex;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .progress-dots__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 150ms ease;
        }

        .progress-dots__dot--completed {
          background-color: var(--color-accent, #3b82f6);
        }

        .progress-dots__dot--current {
          background-color: var(--color-accent, #3b82f6);
          box-shadow: 0 0 0 3px var(--color-background, #ffffff),
                      0 0 0 5px var(--color-accent, #3b82f6);
        }

        .progress-dots__dot--upcoming {
          background-color: transparent;
          border: 2px solid var(--color-border, #e5e7eb);
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .progress-dots__dot {
            transition: none;
          }
        }
      `}</style>
    </nav>
  )
}
