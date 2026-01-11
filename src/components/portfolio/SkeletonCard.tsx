'use client'

import { SkeletonCard as BaseSkeletonCard, type SkeletonCardProps } from '@/components/ui'

/**
 * Skeleton placeholder for portfolio project cards.
 * Re-exports the unified SkeletonCard with portfolio-specific defaults.
 */
export function SkeletonCard(props: Partial<SkeletonCardProps>) {
  return (
    <BaseSkeletonCard
      aspectRatio="16/9"
      showText
      textLines={2}
      {...props}
    />
  )
}

export default SkeletonCard
