interface Asset {
  id: string
  url: string
  thumbnailUrl: string
  placeholderUrl: string
  srcset400?: string | null
  srcset800?: string | null
  srcset1200?: string | null
  srcset1600?: string | null
  width: number
  height: number
  altText: string
  caption?: string | null
}

interface ImageDisplayProps {
  asset: Asset
  sizes?: string
  priority?: boolean
  className?: string
}

/**
 * Responsive image display component with blur-up placeholder
 * Uses native img with srcset for responsive loading
 */
export function ImageDisplay({
  asset,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  priority = false,
  className,
}: ImageDisplayProps) {
  // Build srcset string from available variants
  const srcsetParts: string[] = []
  if (asset.srcset400) srcsetParts.push(`${asset.srcset400} 400w`)
  if (asset.srcset800) srcsetParts.push(`${asset.srcset800} 800w`)
  if (asset.srcset1200) srcsetParts.push(`${asset.srcset1200} 1200w`)
  if (asset.srcset1600) srcsetParts.push(`${asset.srcset1600} 1600w`)
  
  const srcset = srcsetParts.length > 0 ? srcsetParts.join(', ') : undefined

  // Calculate aspect ratio for placeholder sizing
  const aspectRatio = asset.width / asset.height

  return (
    <figure className={`portfolio-image ${className || ''}`}>
      <div
        className="portfolio-image-container"
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
          backgroundColor: 'var(--color-surface)',
          // Blur placeholder as background
          backgroundImage: asset.placeholderUrl ? `url(${asset.placeholderUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img
          src={asset.url}
          srcSet={srcset}
          sizes={sizes}
          alt={asset.altText}
          width={asset.width}
          height={asset.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {asset.caption && (
        <figcaption className="portfolio-image-caption">
          {asset.caption}
        </figcaption>
      )}
    </figure>
  )
}
