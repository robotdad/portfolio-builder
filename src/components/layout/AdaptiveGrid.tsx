'use client'

import { useEffect, useRef, useState, CSSProperties } from 'react'

interface AdaptiveGridProps {
  items: unknown[]
  children: React.ReactNode
  minCardWidth?: number
  idealCardWidth?: number
  maxCardWidth?: number
  className?: string
}

/**
 * AdaptiveGrid Component
 * 
 * Smart grid that adjusts columns based on BOTH viewport width AND item count.
 * Prevents tiny cards when there are few items on ultra-wide displays.
 * 
 * Uses auto row heights so cards with different aspect ratios (portrait,
 * landscape, square) can coexist without forcing a single row height.
 * Dense packing fills gaps when portrait (tall) and landscape (short) items
 * create holes in the grid.
 * 
 * SSR-safe: Uses CSS auto-fill for the initial render to prevent overflow
 * at any viewport width. After hydration, switches to JS-calculated explicit
 * column counts with item-count-aware capping.
 * 
 * Algorithm (post-hydration):
 * 1. Calculate natural columns from container width / idealCardWidth
 * 2. Apply item-count-based cap to prevent over-subdivision
 * 3. Respect global max of 6 columns
 * 
 * Example scenarios @ 3832px viewport, 450px ideal:
 * - 2 items → 2 columns (large cards, ~1916px each)
 * - 5 items → 4 columns (medium cards, ~958px each)
 * - 15 items → 6 columns (smaller cards, ~638px each)
 */
export function AdaptiveGrid({ 
  items, 
  children,
  minCardWidth = 320,
  idealCardWidth = 450,
  maxCardWidth = 600,
  className = ''
}: AdaptiveGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  // null = SSR/pre-hydration state, uses CSS auto-fill fallback
  const [maxColumns, setMaxColumns] = useState<number | null>(null)
  
  useEffect(() => {
    const calculateLayout = () => {
      if (!gridRef.current) return
      
      const containerWidth = gridRef.current.offsetWidth
      const itemCount = items.length
      
      // Natural columns based on container width and ideal card width
      const naturalCols = Math.floor(containerWidth / idealCardWidth)
      
      // Item-count-based cap to prevent over-subdivision
      // Special case: single items use 3-column layout to avoid oversized cards
      let itemCap: number
      if (itemCount === 1) itemCap = 3         // Single item: size as if 3-column grid
      else if (itemCount === 2) itemCap = 2    // Two items: 2-column
      else if (itemCount === 3) itemCap = 3    // Three items: 3-column
      else if (itemCount <= 6) itemCap = 4
      else if (itemCount <= 12) itemCap = 5
      else itemCap = 6
      
      // Final column count: min of all constraints
      const finalColumns = Math.min(naturalCols, itemCap, 6)
      const columns = Math.max(1, finalColumns) // Ensure at least 1 column
      
      setMaxColumns(columns)
    }
    
    calculateLayout()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateLayout)
    return () => window.removeEventListener('resize', calculateLayout)
  }, [items.length, idealCardWidth])
  
  // SSR-safe: auto-fill before JS hydration prevents overflow at any viewport.
  // Uses idealCardWidth as the track minimum to approximate the JS-calculated
  // column count, minimizing layout shift on hydration. min() with 100% ensures
  // single-column layout on viewports narrower than idealCardWidth.
  // After hydration: explicit column count with maxCardWidth cap.
  const gridTemplateColumns = maxColumns !== null
    ? `repeat(${maxColumns}, minmax(0, ${maxCardWidth}px))`
    : `repeat(auto-fill, minmax(min(${idealCardWidth}px, 100%), 1fr))`
  
  return (
    <div 
      ref={gridRef}
      className={`adaptive-grid ${className}`}
      style={{
        '--min-card-width': `${minCardWidth}px`,
        '--ideal-card-width': `${idealCardWidth}px`,
        '--max-card-width': `${maxCardWidth}px`,
        '--max-columns': maxColumns ?? 'auto',
        display: 'grid',
        gap: 'var(--space-6, 24px)',
        gridTemplateColumns,
        gridAutoRows: 'auto',
        gridAutoFlow: 'dense',
        alignItems: 'start',
        justifyContent: 'center',
      } as CSSProperties}
    >
      {children}
    </div>
  )
}
