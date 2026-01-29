/**
 * Image Helper Utilities
 * 
 * Utilities for working with image dimensions and aspect ratios
 * in the portfolio system.
 */

/**
 * Aspect ratio classification for portfolio images
 */
export type AspectRatioClass = 'portrait' | 'landscape' | 'square'

/**
 * Classify an image's aspect ratio into portrait, landscape, or square
 * 
 * Uses 10% threshold to avoid misclassifying nearly-square images:
 * - landscape: ratio >= 1.1 (10% wider than tall)
 * - portrait: ratio <= 0.9 (10% taller than wide)
 * - square: ratio between 0.9 and 1.1
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Classification as 'portrait', 'landscape', or 'square'
 * 
 * @example
 * ```typescript
 * getAspectRatioClass(1920, 1080) // 'landscape' (16:9)
 * getAspectRatioClass(1080, 1920) // 'portrait' (9:16)
 * getAspectRatioClass(1000, 1000) // 'square' (1:1)
 * getAspectRatioClass(1000, 1050) // 'square' (close enough)
 * ```
 */
export function getAspectRatioClass(width: number, height: number): AspectRatioClass {
  const ratio = width / height
  
  if (ratio >= 1.1) return 'landscape'
  if (ratio <= 0.9) return 'portrait'
  return 'square'
}
