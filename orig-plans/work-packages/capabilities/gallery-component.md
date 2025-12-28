# Capability: Gallery Component

A self-contained work package for implementing image gallery layouts with grid, carousel, and masonry options.

## Overview

Implement a gallery component supporting three layout modes: grid, carousel, and masonry. Integrates with the asset system for image selection and uses blur placeholders for progressive loading.

## Prerequisites

- Foundation artifacts complete (component-contracts, theme-system)
- Image pipeline implemented (assets, blur placeholders)
- Component registry pattern from component-contracts.md

## Deliverables

1. Gallery renderer component
2. Grid layout
3. Carousel layout with touch gestures
4. Masonry layout
5. Image picker modal
6. Lightbox viewer
7. Gallery settings panel
8. Component registration

---

## 1. TypeScript Types

From `src/types/components.ts`:

```typescript
export interface GalleryProps {
  assetIds: string[];
  layout: 'grid' | 'carousel' | 'masonry';
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'tight' | 'normal' | 'loose';

  // Carousel-specific
  autoplay?: boolean;
  autoplayInterval?: number; // seconds
  showIndicators?: boolean;
  showArrows?: boolean;
}
```

---

## 2. Gallery Renderer

Create `src/components/blocks/GalleryBlock/GalleryBlockRenderer.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { GalleryProps } from '@/types/components';
import { GridLayout } from './layouts/GridLayout';
import { CarouselLayout } from './layouts/CarouselLayout';
import { MasonryLayout } from './layouts/MasonryLayout';
import { Lightbox } from './Lightbox';
import { ImagePickerButton } from './ImagePickerButton';
import { useAssetsByIds } from '@/hooks/useAssets';

interface GalleryBlockRendererProps {
  props: GalleryProps;
  isEditing: boolean;
  isSelected: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onUpdate: (props: Partial<GalleryProps>) => void;
  siteId: string;
}

export function GalleryBlockRenderer({
  props,
  isEditing,
  isSelected,
  onUpdate,
  siteId,
}: GalleryBlockRendererProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { assets, isLoading } = useAssetsByIds(siteId, props.assetIds);

  const handleImageClick = (index: number) => {
    if (!isEditing) {
      setLightboxIndex(index);
    }
  };

  const handleRemoveImage = (assetId: string) => {
    onUpdate({
      assetIds: props.assetIds.filter((id) => id !== assetId),
    });
  };

  const handleReorderImages = (newOrder: string[]) => {
    onUpdate({ assetIds: newOrder });
  };

  const handleAddImages = (newAssetIds: string[]) => {
    onUpdate({
      assetIds: [...props.assetIds, ...newAssetIds],
    });
  };

  // Render appropriate layout
  const layoutProps = {
    assets,
    isLoading,
    isEditing,
    columns: props.columns || 3,
    gap: props.gap || 'normal',
    onImageClick: handleImageClick,
    onRemoveImage: handleRemoveImage,
    onReorderImages: handleReorderImages,
  };

  return (
    <div className="relative">
      {/* Empty state */}
      {props.assetIds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-surface rounded-lg border-2 border-dashed border-border">
          <p className="text-text-muted mb-4">No images in gallery</p>
          {isEditing && (
            <ImagePickerButton
              siteId={siteId}
              onSelect={handleAddImages}
              multiple
            />
          )}
        </div>
      )}

      {/* Gallery layout */}
      {props.assetIds.length > 0 && (
        <>
          {props.layout === 'grid' && <GridLayout {...layoutProps} />}
          {props.layout === 'carousel' && (
            <CarouselLayout
              {...layoutProps}
              autoplay={props.autoplay}
              autoplayInterval={props.autoplayInterval}
              showIndicators={props.showIndicators}
              showArrows={props.showArrows}
            />
          )}
          {props.layout === 'masonry' && <MasonryLayout {...layoutProps} />}
        </>
      )}

      {/* Add more images button (editing mode) */}
      {isEditing && props.assetIds.length > 0 && (
        <div className="mt-4 flex justify-center">
          <ImagePickerButton
            siteId={siteId}
            onSelect={handleAddImages}
            multiple
          />
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          assets={assets}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
```

---

## 3. Grid Layout

Create `src/components/blocks/GalleryBlock/layouts/GridLayout.tsx`:

```typescript
'use client';

import { Asset } from '@/types';
import { GalleryImage } from '../GalleryImage';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GridLayoutProps {
  assets: Asset[];
  isLoading: boolean;
  isEditing: boolean;
  columns: 2 | 3 | 4 | 5 | 6;
  gap: 'tight' | 'normal' | 'loose';
  onImageClick: (index: number) => void;
  onRemoveImage: (assetId: string) => void;
  onReorderImages: (newOrder: string[]) => void;
}

const gapClasses = {
  tight: 'gap-1',
  normal: 'gap-4',
  loose: 'gap-8',
};

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
};

export function GridLayout({
  assets,
  isLoading,
  isEditing,
  columns,
  gap,
  onImageClick,
  onRemoveImage,
  onReorderImages,
}: GridLayoutProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = assets.findIndex((a) => a.id === active.id);
    const newIndex = assets.findIndex((a) => a.id === over.id);

    const newOrder = [...assets.map((a) => a.id)];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);

    onReorderImages(newOrder);
  };

  if (isLoading) {
    return (
      <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-surface animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  const content = (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
      {assets.map((asset, index) => (
        <SortableGridItem
          key={asset.id}
          asset={asset}
          index={index}
          isEditing={isEditing}
          onImageClick={onImageClick}
          onRemove={onRemoveImage}
        />
      ))}
    </div>
  );

  if (isEditing) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={assets.map((a) => a.id)}
          strategy={rectSortingStrategy}
        >
          {content}
        </SortableContext>
      </DndContext>
    );
  }

  return content;
}

function SortableGridItem({
  asset,
  index,
  isEditing,
  onImageClick,
  onRemove,
}: {
  asset: Asset;
  index: number;
  isEditing: boolean;
  onImageClick: (index: number) => void;
  onRemove: (assetId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GalleryImage
        asset={asset}
        onClick={() => onImageClick(index)}
        onRemove={isEditing ? () => onRemove(asset.id) : undefined}
        aspectRatio="square"
      />
    </div>
  );
}
```

---

## 4. Carousel Layout

Create `src/components/blocks/GalleryBlock/layouts/CarouselLayout.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Asset } from '@/types';
import { GalleryImage } from '../GalleryImage';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselLayoutProps {
  assets: Asset[];
  isLoading: boolean;
  isEditing: boolean;
  onImageClick: (index: number) => void;
  onRemoveImage: (assetId: string) => void;
  autoplay?: boolean;
  autoplayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
}

export function CarouselLayout({
  assets,
  isLoading,
  isEditing,
  onImageClick,
  onRemoveImage,
  autoplay = false,
  autoplayInterval = 5,
  showIndicators = true,
  showArrows = true,
}: CarouselLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Autoplay
  useEffect(() => {
    if (!autoplay || isEditing || isHovering || assets.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % assets.length);
    }, autoplayInterval * 1000);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, isEditing, isHovering, assets.length]);

  // Navigation
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % assets.length);
  }, [assets.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
  }, [assets.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (isLoading) {
    return (
      <div className="aspect-video bg-surface animate-pulse rounded-lg" />
    );
  }

  if (assets.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
      aria-roledescription="carousel"
    >
      {/* Main image */}
      <div className="relative aspect-video overflow-hidden rounded-lg">
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${assets.length}`}
            aria-hidden={index !== currentIndex}
          >
            <GalleryImage
              asset={asset}
              onClick={() => onImageClick(index)}
              onRemove={isEditing ? () => onRemoveImage(asset.id) : undefined}
              aspectRatio="video"
              priority={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {/* Arrow buttons */}
      {showArrows && assets.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2',
              'w-10 h-10 rounded-full bg-black/50 text-white',
              'flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white'
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'w-10 h-10 rounded-full bg-black/50 text-white',
              'flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:bg-black/70 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white'
            )}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && assets.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {assets.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Masonry Layout

Create `src/components/blocks/GalleryBlock/layouts/MasonryLayout.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { Asset } from '@/types';
import { GalleryImage } from '../GalleryImage';
import { cn } from '@/lib/utils';

interface MasonryLayoutProps {
  assets: Asset[];
  isLoading: boolean;
  isEditing: boolean;
  columns: 2 | 3 | 4 | 5 | 6;
  gap: 'tight' | 'normal' | 'loose';
  onImageClick: (index: number) => void;
  onRemoveImage: (assetId: string) => void;
}

const gapValues = {
  tight: 4,
  normal: 16,
  loose: 32,
};

const gapClasses = {
  tight: 'gap-1',
  normal: 'gap-4',
  loose: 'gap-8',
};

export function MasonryLayout({
  assets,
  isLoading,
  isEditing,
  columns,
  gap,
  onImageClick,
  onRemoveImage,
}: MasonryLayoutProps) {
  // Distribute images across columns based on aspect ratio
  const columnArrays = useMemo(() => {
    const cols: Asset[][] = Array.from({ length: columns }, () => []);
    const heights: number[] = Array(columns).fill(0);

    assets.forEach((asset) => {
      // Find shortest column
      const shortestIndex = heights.indexOf(Math.min(...heights));
      cols[shortestIndex].push(asset);

      // Add estimated height (based on aspect ratio)
      const aspectRatio = asset.width / asset.height;
      heights[shortestIndex] += 1 / aspectRatio;
    });

    return cols;
  }, [assets, columns]);

  if (isLoading) {
    return (
      <div className={cn('flex', gapClasses[gap])}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className={cn('flex-1 flex flex-col', gapClasses[gap])}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface animate-pulse rounded-lg"
                style={{ aspectRatio: `1 / ${1 + Math.random()}` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Track global index for lightbox
  let globalIndex = 0;

  return (
    <div className={cn('flex', gapClasses[gap])}>
      {columnArrays.map((columnAssets, colIndex) => (
        <div
          key={colIndex}
          className={cn('flex-1 flex flex-col', gapClasses[gap])}
        >
          {columnAssets.map((asset) => {
            const currentIndex = globalIndex++;
            return (
              <GalleryImage
                key={asset.id}
                asset={asset}
                onClick={() => onImageClick(currentIndex)}
                onRemove={isEditing ? () => onRemoveImage(asset.id) : undefined}
                aspectRatio="original"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Gallery Image Component

Create `src/components/blocks/GalleryBlock/GalleryImage.tsx`:

```typescript
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { Asset } from '@/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GalleryImageProps {
  asset: Asset;
  onClick: () => void;
  onRemove?: () => void;
  aspectRatio: 'square' | 'video' | 'original';
  priority?: boolean;
}

export function GalleryImage({
  asset,
  onClick,
  onRemove,
  aspectRatio,
  priority = false,
}: GalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    original: '',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg group cursor-pointer',
        aspectStyles[aspectRatio]
      )}
      style={
        aspectRatio === 'original'
          ? { aspectRatio: `${asset.width} / ${asset.height}` }
          : undefined
      }
    >
      {/* Blur placeholder */}
      {!isLoaded && asset.placeholder && (
        <img
          src={asset.placeholder}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}

      {/* Main image */}
      <NextImage
        src={asset.displayUrl}
        alt={asset.altText || ''}
        width={asset.width}
        height={asset.height}
        priority={priority}
        className={cn(
          'w-full h-full object-cover transition-all duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          'group-hover:scale-105'
        )}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
      />

      {/* Remove button (edit mode) */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            'absolute top-2 right-2',
            'w-8 h-8 rounded-full bg-black/50 text-white',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-error focus:opacity-100'
          )}
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

---

## 7. Lightbox

Create `src/components/blocks/GalleryBlock/Lightbox.tsx`:

```typescript
'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { Asset } from '@/types';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import NextImage from 'next/image';

interface LightboxProps {
  assets: Asset[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ assets, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const currentAsset = assets[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % assets.length);
  }, [assets.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
  }, [assets.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNext, goToPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      role="dialog"
      aria-label="Image lightbox"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/75 text-sm">
        {currentIndex + 1} / {assets.length}
      </div>

      {/* Image */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-16">
        <NextImage
          src={currentAsset.displayUrl}
          alt={currentAsset.altText || ''}
          width={currentAsset.width}
          height={currentAsset.height}
          className="max-w-full max-h-full object-contain"
          priority
        />
      </div>

      {/* Caption */}
      {currentAsset.caption && (
        <div className="absolute bottom-20 left-0 right-0 text-center text-white/75 text-sm px-4">
          {currentAsset.caption}
        </div>
      )}

      {/* Navigation */}
      {assets.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
        {assets.map((asset, index) => (
          <button
            key={asset.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-16 h-12 rounded overflow-hidden flex-shrink-0',
              'ring-2 transition-all',
              index === currentIndex
                ? 'ring-white'
                : 'ring-transparent opacity-50 hover:opacity-75'
            )}
          >
            <img
              src={asset.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Image Picker

Create `src/components/blocks/GalleryBlock/ImagePickerButton.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAssets } from '@/hooks/useAssets';
import { cn } from '@/lib/utils';
import { Plus, Upload, Check } from 'lucide-react';

interface ImagePickerButtonProps {
  siteId: string;
  onSelect: (assetIds: string[]) => void;
  multiple?: boolean;
}

export function ImagePickerButton({
  siteId,
  onSelect,
  multiple = false,
}: ImagePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { assets, isLoading, fetchAssets, uploadAsset, uploadProgress } =
    useAssets({ siteId });

  // Fetch on open
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchAssets();
      setSelected(new Set());
    }
  };

  const toggleSelect = (assetId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(assetId);
    }
    setSelected(newSelected);
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    setOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const asset = await uploadAsset(file);
      if (asset) {
        setSelected((prev) => new Set(prev).add(asset.id));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Images
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Images</DialogTitle>
        </DialogHeader>

        {/* Upload button */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploadProgress !== null
                  ? `Uploading... ${uploadProgress}%`
                  : 'Upload New'}
              </span>
            </Button>
          </label>

          {selected.size > 0 && (
            <span className="text-sm text-text-muted">
              {selected.size} selected
            </span>
          )}
        </div>

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-surface animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No images uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => toggleSelect(asset.id)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden',
                    'ring-2 transition-all',
                    selected.has(asset.id)
                      ? 'ring-primary'
                      : 'ring-transparent hover:ring-border'
                  )}
                >
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.altText || ''}
                    className="w-full h-full object-cover"
                  />
                  {selected.has(asset.id) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            Add {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 9. Gallery Settings Panel

Create `src/components/blocks/GalleryBlock/GalleryBlockSettings.tsx`:

```typescript
'use client';

import { GalleryProps } from '@/types/components';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface GalleryBlockSettingsProps {
  props: GalleryProps;
  onUpdate: (props: Partial<GalleryProps>) => void;
}

export function GalleryBlockSettings({
  props,
  onUpdate,
}: GalleryBlockSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Layout */}
      <div>
        <Label htmlFor="layout">Layout</Label>
        <Select
          value={props.layout}
          onValueChange={(value) =>
            onUpdate({ layout: value as GalleryProps['layout'] })
          }
        >
          <SelectTrigger id="layout">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid/Masonry options */}
      {(props.layout === 'grid' || props.layout === 'masonry') && (
        <>
          <div>
            <Label htmlFor="columns">Columns</Label>
            <Select
              value={String(props.columns || 3)}
              onValueChange={(value) =>
                onUpdate({ columns: Number(value) as GalleryProps['columns'] })
              }
            >
              <SelectTrigger id="columns">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="6">6</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gap">Spacing</Label>
            <Select
              value={props.gap || 'normal'}
              onValueChange={(value) =>
                onUpdate({ gap: value as GalleryProps['gap'] })
              }
            >
              <SelectTrigger id="gap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Carousel options */}
      {props.layout === 'carousel' && (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="showArrows">Show Arrows</Label>
            <Switch
              id="showArrows"
              checked={props.showArrows ?? true}
              onCheckedChange={(checked) => onUpdate({ showArrows: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showIndicators">Show Indicators</Label>
            <Switch
              id="showIndicators"
              checked={props.showIndicators ?? true}
              onCheckedChange={(checked) => onUpdate({ showIndicators: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay">Autoplay</Label>
            <Switch
              id="autoplay"
              checked={props.autoplay ?? false}
              onCheckedChange={(checked) => onUpdate({ autoplay: checked })}
            />
          </div>

          {props.autoplay && (
            <div>
              <Label htmlFor="autoplayInterval">Interval (seconds)</Label>
              <Input
                id="autoplayInterval"
                type="number"
                min={1}
                max={30}
                value={props.autoplayInterval || 5}
                onChange={(e) =>
                  onUpdate({ autoplayInterval: Number(e.target.value) })
                }
              />
            </div>
          )}
        </>
      )}

      {/* Image count */}
      <div className="pt-4 border-t text-sm text-text-muted">
        {props.assetIds.length} image{props.assetIds.length !== 1 ? 's' : ''} in gallery
      </div>
    </div>
  );
}
```

---

## 10. Component Registration

Create `src/components/blocks/GalleryBlock/index.ts`:

```typescript
import { registerComponent } from '@/lib/component-registry';
import { GalleryBlockRenderer } from './GalleryBlockRenderer';
import { GalleryBlockSettings } from './GalleryBlockSettings';
import { Grid3X3 } from 'lucide-react';

registerComponent({
  type: 'gallery',
  name: 'Gallery',
  icon: Grid3X3,
  defaultProps: {
    assetIds: [],
    layout: 'grid',
    columns: 3,
    gap: 'normal',
    showArrows: true,
    showIndicators: true,
    autoplay: false,
    autoplayInterval: 5,
  },
  component: GalleryBlockRenderer,
  settingsPanel: GalleryBlockSettings,
});

export { GalleryBlockRenderer } from './GalleryBlockRenderer';
export { GalleryBlockSettings } from './GalleryBlockSettings';
```

---

## 11. Asset Hook Extension

Add to `src/hooks/useAssets.ts`:

```typescript
// Fetch specific assets by IDs
export function useAssetsByIds(siteId: string, assetIds: string[]) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (assetIds.length === 0) {
      setAssets([]);
      return;
    }

    setIsLoading(true);

    Promise.all(
      assetIds.map((id) =>
        fetch(`/api/sites/${siteId}/assets/${id}`, {
          credentials: 'include',
        }).then((res) => (res.ok ? res.json() : null))
      )
    )
      .then((results) => {
        const validAssets = results
          .filter((r) => r?.data)
          .map((r) => r.data);

        // Maintain order from assetIds
        const ordered = assetIds
          .map((id) => validAssets.find((a) => a.id === id))
          .filter(Boolean) as Asset[];

        setAssets(ordered);
      })
      .finally(() => setIsLoading(false));
  }, [siteId, assetIds.join(',')]);

  return { assets, isLoading };
}
```

---

## File Structure

```
src/
├── components/
│   └── blocks/
│       └── GalleryBlock/
│           ├── index.ts
│           ├── GalleryBlockRenderer.tsx
│           ├── GalleryBlockSettings.tsx
│           ├── GalleryImage.tsx
│           ├── ImagePickerButton.tsx
│           ├── Lightbox.tsx
│           └── layouts/
│               ├── GridLayout.tsx
│               ├── CarouselLayout.tsx
│               └── MasonryLayout.tsx
├── hooks/
│   └── useAssets.ts  (extended)
└── types/
    └── components.ts (GalleryProps)
```

---

## Deliverables Checklist

- [ ] GalleryBlockRenderer with layout switching
- [ ] GridLayout with dnd-kit reordering
- [ ] CarouselLayout with touch gestures
- [ ] MasonryLayout with column balancing
- [ ] GalleryImage with blur placeholder
- [ ] Lightbox with keyboard/touch navigation
- [ ] ImagePickerButton with upload support
- [ ] GalleryBlockSettings panel
- [ ] Component registered in registry
- [ ] useAssetsByIds hook for fetching
- [ ] Responsive column counts
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## Testing Checklist

1. **Grid layout** - Images display in grid, responsive columns
2. **Grid reorder** - Drag to reorder in edit mode
3. **Carousel** - Swipe/click to navigate
4. **Carousel autoplay** - Advances automatically, pauses on hover
5. **Masonry** - Images maintain aspect ratio, columns balanced
6. **Lightbox** - Opens on click, keyboard navigation works
7. **Image picker** - Select existing, upload new
8. **Remove image** - X button removes from gallery
9. **Empty state** - Shows prompt to add images
10. **Blur placeholders** - Images fade in as they load
11. **Mobile touch** - Carousel swipe works on phone
12. **Settings** - All options persist correctly
