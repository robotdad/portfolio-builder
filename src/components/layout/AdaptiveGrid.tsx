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
  // Derive initial column count from item count to minimize layout shift.
  // This matches the item-count cap logic in calculateLayout without needing
  // container width (unknown at SSR time). The useEffect refines it post-hydration
  // when actual container width is available.
  const getItemCap = (count: number): number => {
    if (count === 1) return 1   // Full-width single image
    if (count === 2) return 2
    if (count === 3) return 3
    if (count <= 4) return 2    // 2x2 grid, generous sizing
    if (count <= 9) return 3    // 3-col gallery
    return 4                     // Large galleries max at 4-col
  }
  const [maxColumns, setMaxColumns] = useState<number>(() => getItemCap(items.length))
  
  useEffect(() => {
    const calculateLayout = () => {
      if (!gridRef.current) return
      
      const containerWidth = gridRef.current.offsetWidth
      const itemCount = items.length
      
      // Natural columns based on container width and ideal card width
      const naturalCols = Math.floor(containerWidth / idealCardWidth)
      
      // Item-count-based cap to prevent over-subdivision
      // Portfolio-optimized: favor larger images over more columns
      let itemCap: number
      if (itemCount === 1) itemCap = 1         // Full-width single image
      else if (itemCount === 2) itemCap = 2    // Two items: 2-column
      else if (itemCount === 3) itemCap = 3    // Three items: 3-column
      else if (itemCount <= 4) itemCap = 2     // 2x2 grid, generous sizing
      else if (itemCount <= 9) itemCap = 3     // 3-col gallery
      else itemCap = 4                          // Large galleries max at 4-col
      
      // Final column count: min of all constraints
      const finalColumns = Math.min(naturalCols, itemCap, 6)
      const columns = Math.max(1, finalColumns) // Ensure at least 1 column
      
      setMaxColumns(columns)
    }
    
    calculateLayout()
    
    // Use ResizeObserver on the grid container instead of window resize.
    // More precise (fires on container size change, not every window event)
    // and avoids unnecessary recalculations during mobile scroll (URL bar collapse).
    const observer = new ResizeObserver(calculateLayout)
    if (gridRef.current) {
      observer.observe(gridRef.current)
    }
    return () => observer.disconnect()
  }, [items.length, idealCardWidth])
  
  // Initial column count is derived from item count (SSR-safe, no container width needed).
  // Post-hydration, the ResizeObserver refines this based on actual container width.
  const gridTemplateColumns = `repeat(${maxColumns}, minmax(0, ${maxCardWidth}px))`
  
  return (
    <div 
      ref={gridRef}
      className={`adaptive-grid ${className}`}
      style={{
        '--min-card-width': `${minCardWidth}px`,
        '--ideal-card-width': `${idealCardWidth}px`,
        '--max-card-width': `${maxCardWidth}px`,
        '--max-columns': maxColumns,
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
