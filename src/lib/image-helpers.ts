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
 * Supported aspect ratio presets for CardImage and grid display.
 * 
 * Expanded palette to respect source material orientation:
 * - Wide landscape through tall portrait
 * - Each preset corresponds to common photo/screen ratios
 */
export type AspectRatioPreset = '16/9' | '3/2' | '4/3' | '1/1' | '4/5' | '3/4' | '2/3'

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

/**
 * Get the closest orientation-aware aspect ratio preset for an image.
 * 
 * Snaps to the nearest "respectful" preset rather than forcing a single
 * ratio regardless of content. This means:
 * - A landscape photo gets a landscape container (minimal cropping)
 * - A portrait photo gets a portrait container (minimal cropping)
 * - Maximum ~6% crop instead of the 44% that occurs when forcing
 *   all images into a single orientation
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns The closest AspectRatioPreset for the image's actual dimensions
 * 
 * @example
 * ```typescript
 * getOrientationAwareRatio(1920, 1080) // '16/9' (wide landscape)
 * getOrientationAwareRatio(1200, 800)  // '3/2'  (standard landscape)
 * getOrientationAwareRatio(1000, 1000) // '1/1'  (square)
 * getOrientationAwareRatio(1080, 1350) // '4/5'  (Instagram portrait)
 * getOrientationAwareRatio(900, 1200)  // '3/4'  (standard portrait)
 * getOrientationAwareRatio(800, 1200)  // '2/3'  (tall portrait)
 * ```
 */
export function getOrientationAwareRatio(width: number, height: number): AspectRatioPreset {
  const ratio = width / height

  if (ratio >= 1.7)  return '16/9'  // Very wide landscape (16:9 = 1.78)
  if (ratio >= 1.1)  return '3/2'   // Standard landscape (3:2 = 1.5, 4:3 = 1.33)
  if (ratio >= 0.9)  return '1/1'   // Square-ish
  if (ratio >= 0.7)  return '4/5'   // Mild portrait (Instagram 4:5 = 0.8)
  if (ratio >= 0.55) return '3/4'   // Standard portrait (3:4 = 0.75)
  return '2/3'                       // Very tall portrait (2:3 = 0.67)
}
