'use client'

import { useState, useCallback } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageFallbackProps {
  aspectRatio?: string
  message?: string
  className?: string
}

/**
 * ImageFallback Component
 * 
 * Placeholder shown when an image fails to load.
 * Maintains aspect ratio and provides subtle visual feedback.
 */
export function ImageFallback({
  aspectRatio = '16/9',
  message = 'Image unavailable',
  className = ''
}: ImageFallbackProps) {
  return (
    <div 
      className={`image-fallback ${className}`} 
      style={{ aspectRatio }}
      role="img"
      aria-label={message}
    >
      <svg
        className="image-fallback-icon"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
      </svg>
      <p className="image-fallback-message">{message}</p>
    </div>
  )
}

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackMessage?: string
  aspectRatio?: string
}

/**
 * ImageWithFallback Component
 * 
 * Next.js Image wrapper with automatic fallback on error.
 * Supports blur-up placeholder for progressive loading.
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackMessage = 'Image unavailable',
  aspectRatio = '16/9',
  className = '',
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (hasError) {
    return (
      <ImageFallback 
        aspectRatio={aspectRatio}
        message={fallbackMessage}
        className={className}
      />
    )
  }

  return (
    <div className={`image-with-fallback ${isLoading ? 'image-with-fallback--loading' : ''}`}>
      <Image
        src={src}
        alt={alt}
        unoptimized
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {isLoading && (
        <div className="image-loading-overlay">
          <div className="skeleton-image" style={{ aspectRatio }} />
        </div>
      )}
    </div>
  )
}

interface BlurUpImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  blurDataURL?: string
  fallbackMessage?: string
  aspectRatio?: string
}

/**
 * BlurUpImage Component
 * 
 * Image with blur-up loading technique.
 * Shows blurred placeholder while full image loads.
 */
export function BlurUpImage({
  src,
  alt,
  blurDataURL,
  fallbackMessage = 'Image unavailable',
  aspectRatio = '16/9',
  className = '',
  ...props
}: BlurUpImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <ImageFallback 
        aspectRatio={aspectRatio}
        message={fallbackMessage}
        className={className}
      />
    )
  }

  // Generate a simple blur placeholder if none provided
  const placeholder = blurDataURL ? 'blur' : 'empty'

  return (
    <Image
      src={src}
      alt={alt}
      className={`blur-up-image ${className}`}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}
