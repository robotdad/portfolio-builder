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
  const [rowHeight, setRowHeight] = useState<number>(240) // Default fallback
  
  useEffect(() => {
    const calculateLayout = () => {
      if (!gridRef.current) return
      
      const containerWidth = gridRef.current.offsetWidth
      const itemCount = items.length
      
      // Natural columns based on viewport and ideal card width
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
      
      // Calculate responsive row height based on column width
      // Cards use 3:4 aspect ratio (width:height), portrait spans 2 rows
      // Row height = column width × (2/3) ensures portrait cards maintain 3:4 ratio
      // Cap at 400px to prevent excessively tall cards in single-column layouts
      const gap = 24 // var(--space-6)
      const columnWidth = (containerWidth - (gap * (columns - 1))) / columns
      const calculatedRowHeight = Math.round(columnWidth * (2 / 3))
      const cappedRowHeight = Math.min(calculatedRowHeight, 400) // Cap at 400px max
      
      setRowHeight(cappedRowHeight)
    }
    
    calculateLayout()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateLayout)
    return () => window.removeEventListener('resize', calculateLayout)
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
        gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
        gridAutoRows: `${rowHeight}px`
      } as CSSProperties}
    >
      {children}
    </div>
  )
}
