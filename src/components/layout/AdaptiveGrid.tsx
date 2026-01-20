'use client'

import { useEffect, useRef, useState, CSSProperties } from 'react'

interface AdaptiveGridProps {
  items: any[]
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
 * Algorithm:
 * 1. Calculate natural columns from viewport / idealCardWidth
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
  const [maxColumns, setMaxColumns] = useState<number>(6)
  
  useEffect(() => {
    const calculateColumns = () => {
      if (!gridRef.current) return
      
      const viewportWidth = gridRef.current.offsetWidth
      const itemCount = items.length
      
      // Natural columns based on viewport and ideal card width
      const naturalCols = Math.floor(viewportWidth / idealCardWidth)
      
      // Item-count-based cap to prevent over-subdivision
      let itemCap: number
      if (itemCount <= 3) itemCap = itemCount
      else if (itemCount <= 6) itemCap = 4
      else if (itemCount <= 12) itemCap = 5
      else itemCap = 6
      
      // Final column count: min of all constraints
      const finalColumns = Math.min(naturalCols, itemCap, 6)
      
      setMaxColumns(Math.max(1, finalColumns)) // Ensure at least 1 column
    }
    
    calculateColumns()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateColumns)
    return () => window.removeEventListener('resize', calculateColumns)
  }, [items.length, idealCardWidth])
  
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
        gridTemplateColumns: `repeat(${maxColumns}, 1fr)`
      } as CSSProperties}
    >
      {children}
    </div>
  )
}
