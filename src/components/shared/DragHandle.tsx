/**
 * DragHandle Component
 * 
 * Reusable drag handle icon for sortable lists/cards.
 * Displays a 6-dot grid (2×3) pattern that indicates draggable content.
 * 
 * Usage:
 * ```tsx
 * <DragHandle 
 *   {...listeners} 
 *   {...attributes}
 *   onClick={(e) => e.stopPropagation()}
 *   aria-label="Drag to reorder"
 * />
 * ```
 */

interface DragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function DragHandle({ className = '', ...props }: DragHandleProps) {
  return (
    <div className={`drag-handle ${className}`.trim()} {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="6" cy="4" r="1" fill="currentColor" />
        <circle cx="10" cy="4" r="1" fill="currentColor" />
        <circle cx="6" cy="8" r="1" fill="currentColor" />
        <circle cx="10" cy="8" r="1" fill="currentColor" />
        <circle cx="6" cy="12" r="1" fill="currentColor" />
        <circle cx="10" cy="12" r="1" fill="currentColor" />
      </svg>

      <style jsx>{`
        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted, #6b7280);
          cursor: grab;
          touch-action: none;
          user-select: none;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        @media (prefers-reduced-motion: reduce) {
          .drag-handle {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

export type { DragHandleProps }
