# Flow: Media Flow

A self-contained work package for implementing the complete media upload, management, and gallery workflow.

## Overview

Implement the end-to-end media experience from uploading images (including directly from mobile camera roll), through image processing, to displaying them in galleries and single image components. Focus on progressive loading, mobile-first upload experience, and efficient asset management.

## Prerequisites

- `capabilities/image-pipeline.md` - Sharp.js processing, storage providers
- `capabilities/gallery-component.md` - Grid/carousel/masonry layouts
- `foundation/api-contracts.md` - Asset endpoints
- `foundation/data-models.md` - Asset model

## Deliverables

1. Media library page/modal
2. Upload experience (desktop + mobile)
3. Drag-and-drop upload zone
4. Upload progress with batch handling
5. Asset management (edit, delete)
6. Image picker for components
7. Focal point selector
8. Alt text enforcement
9. Bulk operations

---

## 1. Route Structure

```
/editor/[siteId]/media          # Full-page media library
Components:
- MediaLibraryModal             # Modal version for image picker
- UploadZone                    # Drag-drop area
- AssetGrid                     # Thumbnail grid
- AssetDetailModal              # Edit single asset
```

---

## 2. Media Library Page

Create `src/app/editor/[siteId]/media/page.tsx`:

```typescript
import { redirect, notFound } from 'next/navigation';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { AdminThemeProvider } from '@/hooks/useAdminTheme';

interface MediaPageProps {
  params: { siteId: string };
}

export default async function MediaPage({ params }: MediaPageProps) {
  const { siteId } = params;

  const { user } = await validateSession();
  if (!user) {
    redirect(`/login?redirect=/editor/${siteId}/media`);
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
  });

  if (!site) {
    notFound();
  }

  return (
    <AdminThemeProvider>
      <MediaLibrary siteId={siteId} siteName={site.title} />
    </AdminThemeProvider>
  );
}
```

---

## 3. Media Library Component

Create `src/components/media/MediaLibrary.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAssets } from '@/hooks/useAssets';
import { UploadZone } from './UploadZone';
import { AssetGrid } from './AssetGrid';
import { AssetDetailModal } from './AssetDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Grid, List, Trash2, ChevronLeft } from 'lucide-react';

interface MediaLibraryProps {
  siteId: string;
  siteName: string;
  // For modal mode
  mode?: 'page' | 'modal';
  onSelect?: (assetIds: string[]) => void;
  multiple?: boolean;
  onClose?: () => void;
}

export function MediaLibrary({
  siteId,
  siteName,
  mode = 'page',
  onSelect,
  multiple = false,
  onClose,
}: MediaLibraryProps) {
  const {
    assets,
    isLoading,
    error,
    uploadProgress,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    updateAsset,
  } = useAssets({ siteId });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch on mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Filter assets by search
  const filteredAssets = assets.filter((asset) =>
    asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.altText?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection
  const handleToggleSelect = useCallback((assetId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(assetId);
      }
      return next;
    });
  }, [multiple]);

  // Handle upload
  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      try {
        await uploadAsset(file);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setIsUploading(false);
  }, [uploadAsset]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.size} image${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`
    );

    if (!confirmed) return;

    for (const assetId of selectedIds) {
      await deleteAsset(assetId);
    }

    setSelectedIds(new Set());
  }, [selectedIds, deleteAsset]);

  // Handle selection confirm (modal mode)
  const handleConfirmSelection = useCallback(() => {
    if (onSelect) {
      onSelect(Array.from(selectedIds));
    }
    onClose?.();
  }, [selectedIds, onSelect, onClose]);

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-4">
          {mode === 'page' && (
            <Link
              href={`/dashboard`}
              className="text-text-muted hover:text-text"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="font-semibold">
            {mode === 'modal' ? 'Select Images' : `Media Library - ${siteName}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-l-lg',
                viewMode === 'grid' && 'bg-primary text-text-inverted'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-r-lg',
                viewMode === 'list' && 'bg-primary text-text-inverted'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {mode === 'modal' && onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-border bg-surface-alt flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            className="pl-10"
          />
        </div>

        {/* Selection actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <span className="text-sm text-text-muted">
                {selectedIds.size} selected
              </span>

              {mode === 'page' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-error hover:bg-error hover:text-error-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}

              {mode === 'modal' && (
                <Button size="sm" onClick={handleConfirmSelection}>
                  Add Selected ({selectedIds.size})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload zone + grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Upload zone */}
        <UploadZone
          onUpload={handleUpload}
          isUploading={isUploading}
          progress={uploadProgress}
        />

        {/* Asset grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-surface animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            {searchQuery
              ? 'No images match your search'
              : 'No images uploaded yet. Drag and drop or click above to upload.'}
          </div>
        ) : (
          <AssetGrid
            assets={filteredAssets}
            selectedIds={selectedIds}
            viewMode={viewMode}
            onToggleSelect={handleToggleSelect}
            onEdit={setEditingAsset}
            selectable
          />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-error text-error-foreground px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Asset detail modal */}
      {editingAsset && (
        <AssetDetailModal
          siteId={siteId}
          assetId={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdate={updateAsset}
          onDelete={deleteAsset}
        />
      )}
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <div className="relative bg-background rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {content}
    </div>
  );
}
```

---

## 4. Upload Zone Component

Create `src/components/media/UploadZone.tsx`:

```typescript
'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  progress: number | null;
  accept?: string;
  maxSize?: number; // bytes
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadZone({
  onUpload,
  isUploading,
  progress,
  accept = 'image/*',
  maxSize = MAX_FILE_SIZE,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type`);
        continue;
      }

      if (file.size > maxSize) {
        newErrors.push(`${file.name}: File too large (max ${maxSize / 1024 / 1024}MB)`);
        continue;
      }

      validFiles.push(file);
    }

    setErrors(newErrors);
    return validFiles;
  }, [maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  }, [validateFiles, onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }

    // Reset input
    e.target.value = '';
  }, [validateFiles, onUpload]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all',
          'flex flex-col items-center justify-center text-center',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          // Upload progress
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-text-muted">
              Uploading... {progress !== null && `${progress}%`}
            </p>
            {progress !== null && (
              <div className="w-48 h-2 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-text-muted mb-4" />

            <p className="text-lg font-medium mb-2">
              {isDragging ? 'Drop images here' : 'Drag and drop images'}
            </p>

            <p className="text-text-muted text-sm mb-4">
              or use the buttons below
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
              >
                <Image className="w-4 h-4 mr-2" />
                Browse Files
              </Button>

              {/* Camera button - only show on mobile/devices with camera */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraClick}
                className="md:hidden"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>

            <p className="text-xs text-text-muted mt-4">
              JPEG, PNG, WebP, GIF up to {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-error/10 text-error rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              {errors.map((error, i) => (
                <p key={i} className="text-sm">
                  {error}
                </p>
              ))}
            </div>
            <button
              onClick={() => setErrors([])}
              className="text-error hover:text-error/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Asset Grid Component

Create `src/components/media/AssetGrid.tsx`:

```typescript
'use client';

import { Asset } from '@/types';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Pencil } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/format';

interface AssetGridProps {
  assets: Asset[];
  selectedIds: Set<string>;
  viewMode: 'grid' | 'list';
  onToggleSelect: (assetId: string) => void;
  onEdit: (assetId: string) => void;
  selectable?: boolean;
}

export function AssetGrid({
  assets,
  selectedIds,
  viewMode,
  onToggleSelect,
  onEdit,
  selectable = false,
}: AssetGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="mt-4 divide-y divide-border rounded-lg border border-border overflow-hidden">
        {assets.map((asset) => (
          <AssetListItem
            key={asset.id}
            asset={asset}
            isSelected={selectedIds.has(asset.id)}
            onToggleSelect={() => onToggleSelect(asset.id)}
            onEdit={() => onEdit(asset.id)}
            selectable={selectable}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {assets.map((asset) => (
        <AssetGridItem
          key={asset.id}
          asset={asset}
          isSelected={selectedIds.has(asset.id)}
          onToggleSelect={() => onToggleSelect(asset.id)}
          onEdit={() => onEdit(asset.id)}
          selectable={selectable}
        />
      ))}
    </div>
  );
}

function AssetGridItem({
  asset,
  isSelected,
  onToggleSelect,
  onEdit,
  selectable,
}: {
  asset: Asset;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  selectable: boolean;
}) {
  const hasAltText = Boolean(asset.altText);

  return (
    <div
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden group cursor-pointer',
        'ring-2 transition-all',
        isSelected ? 'ring-primary' : 'ring-transparent hover:ring-border'
      )}
      onClick={onToggleSelect}
    >
      {/* Thumbnail */}
      <img
        src={asset.thumbnailUrl}
        alt={asset.altText || asset.filename}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Selection indicator */}
      {selectable && (
        <div
          className={cn(
            'absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all',
            'flex items-center justify-center',
            isSelected
              ? 'bg-primary border-primary'
              : 'bg-black/30 border-white/50'
          )}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>
      )}

      {/* Alt text warning */}
      {!hasAltText && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center"
          title="Missing alt text"
        >
          <AlertCircle className="w-4 h-4" />
        </div>
      )}

      {/* Hover overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
          'flex items-center justify-center'
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 bg-white rounded-full hover:bg-white/90"
        >
          <Pencil className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Filename */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs truncate">{asset.filename}</p>
      </div>
    </div>
  );
}

function AssetListItem({
  asset,
  isSelected,
  onToggleSelect,
  onEdit,
  selectable,
}: {
  asset: Asset;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  selectable: boolean;
}) {
  const hasAltText = Boolean(asset.altText);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 bg-surface hover:bg-surface-hover cursor-pointer',
        isSelected && 'bg-primary/10'
      )}
      onClick={onToggleSelect}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div
          className={cn(
            'w-5 h-5 rounded border-2 transition-all flex items-center justify-center',
            isSelected ? 'bg-primary border-primary' : 'border-border'
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}

      {/* Thumbnail */}
      <img
        src={asset.thumbnailUrl}
        alt={asset.altText || asset.filename}
        className="w-12 h-12 rounded object-cover"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{asset.filename}</p>
        <p className="text-sm text-text-muted">
          {asset.width} × {asset.height} · {formatFileSize(asset.size)}
        </p>
      </div>

      {/* Alt text status */}
      {!hasAltText && (
        <div className="text-warning" title="Missing alt text">
          <AlertCircle className="w-5 h-5" />
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 hover:bg-surface rounded"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## 6. Asset Detail Modal

Create `src/components/media/AssetDetailModal.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FocalPointSelector } from './FocalPointSelector';
import { cn } from '@/lib/utils';
import { X, Trash2, Download } from 'lucide-react';

interface AssetDetailModalProps {
  siteId: string;
  assetId: string;
  onClose: () => void;
  onUpdate: (assetId: string, updates: { altText?: string; caption?: string }) => Promise<boolean>;
  onDelete: (assetId: string) => Promise<boolean>;
}

export function AssetDetailModal({
  siteId,
  assetId,
  onClose,
  onUpdate,
  onDelete,
}: AssetDetailModalProps) {
  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isDecorative, setIsDecorative] = useState(false);
  const [focalPoint, setFocalPoint] = useState({ x: 0.5, y: 0.5 });

  // Fetch asset details
  useEffect(() => {
    fetch(`/api/sites/${siteId}/assets/${assetId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const a = data.data;
          setAsset(a);
          setAltText(a.altText || '');
          setCaption(a.caption || '');
          setIsDecorative(a.altText === '');
          if (a.metadata?.focalPoint) {
            setFocalPoint(a.metadata.focalPoint);
          }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [siteId, assetId]);

  const handleSave = async () => {
    setIsSaving(true);

    await onUpdate(assetId, {
      altText: isDecorative ? '' : altText,
      caption,
    });

    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this image? This cannot be undone and may break components using this image.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    await onDelete(assetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Image Details</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : !asset ? (
          <div className="p-8 text-center text-error">Image not found</div>
        ) : (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image preview */}
                <div className="space-y-4">
                  <FocalPointSelector
                    src={asset.displayUrl}
                    focalPoint={focalPoint}
                    onChange={setFocalPoint}
                  />

                  <div className="text-sm text-text-muted space-y-1">
                    <p>
                      <strong>Filename:</strong> {asset.filename}
                    </p>
                    <p>
                      <strong>Dimensions:</strong> {asset.width} × {asset.height}
                    </p>
                    <p>
                      <strong>Size:</strong>{' '}
                      {(asset.size / 1024).toFixed(1)} KB
                    </p>
                    <p>
                      <strong>Uploaded:</strong>{' '}
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Alt text */}
                  <div>
                    <Label htmlFor="altText">
                      Alt Text{' '}
                      <span className="text-error">*</span>
                    </Label>
                    <Textarea
                      id="altText"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe this image for screen readers..."
                      rows={3}
                      disabled={isDecorative}
                      className={cn(
                        isDecorative && 'opacity-50'
                      )}
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Describe the image content for accessibility
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="decorative"
                        checked={isDecorative}
                        onCheckedChange={(checked) => {
                          setIsDecorative(!!checked);
                          if (checked) setAltText('');
                        }}
                      />
                      <Label
                        htmlFor="decorative"
                        className="text-sm font-normal"
                      >
                        Mark as decorative (no alt text needed)
                      </Label>
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a visible caption..."
                      rows={2}
                    />
                  </div>

                  {/* URLs */}
                  <div className="space-y-2">
                    <Label>Image URLs</Label>
                    <div className="text-sm space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="text-text-muted">Display:</span>
                        <code className="text-xs bg-surface-hover px-2 py-1 rounded truncate flex-1">
                          {asset.displayUrl}
                        </code>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-text-muted">Thumbnail:</span>
                        <code className="text-xs bg-surface-hover px-2 py-1 rounded truncate flex-1">
                          {asset.thumbnailUrl}
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-alt">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-error hover:bg-error hover:text-error-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <a href={asset.displayUrl} download={asset.filename}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Focal Point Selector

Create `src/components/media/FocalPointSelector.tsx`:

```typescript
'use client';

import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FocalPointSelectorProps {
  src: string;
  focalPoint: { x: number; y: number };
  onChange: (point: { x: number; y: number }) => void;
}

export function FocalPointSelector({
  src,
  focalPoint,
  onChange,
}: FocalPointSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      onChange({ x, y });
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Focal Point</p>
      <p className="text-xs text-text-muted">
        Click or drag to set the focus point for cropped views
      </p>

      <div
        ref={containerRef}
        className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Focal point indicator */}
        <div
          className={cn(
            'absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2',
            'rounded-full border-2 border-white shadow-lg',
            'flex items-center justify-center',
            isDragging && 'scale-125'
          )}
          style={{
            left: `${focalPoint.x * 100}%`,
            top: `${focalPoint.y * 100}%`,
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>

        {/* Crosshairs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, transparent ${focalPoint.x * 100 - 0.5}%, rgba(255,255,255,0.3) ${focalPoint.x * 100}%, transparent ${focalPoint.x * 100 + 0.5}%),
              linear-gradient(to bottom, transparent ${focalPoint.y * 100 - 0.5}%, rgba(255,255,255,0.3) ${focalPoint.y * 100}%, transparent ${focalPoint.y * 100 + 0.5}%)
            `,
          }}
        />
      </div>
    </div>
  );
}
```

---

## 8. Image Picker for Components

Create `src/components/media/ImagePicker.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { MediaLibrary } from './MediaLibrary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Image, Plus, X } from 'lucide-react';

interface ImagePickerProps {
  siteId: string;
  value: string | null; // assetId or null
  onChange: (assetId: string | null) => void;
  currentAsset?: {
    thumbnailUrl: string;
    altText: string;
  };
}

export function ImagePicker({
  siteId,
  value,
  onChange,
  currentAsset,
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (assetIds: string[]) => {
    if (assetIds.length > 0) {
      onChange(assetIds[0]);
    }
    setIsOpen(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {value && currentAsset ? (
        // Show selected image
        <div className="relative group">
          <img
            src={currentAsset.thumbnailUrl}
            alt={currentAsset.altText || 'Selected image'}
            className="w-full aspect-video object-cover rounded-lg"
          />

          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsOpen(true)}
            >
              Change
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Empty state
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'w-full aspect-video rounded-lg border-2 border-dashed border-border',
            'flex flex-col items-center justify-center gap-2',
            'text-text-muted hover:text-text hover:border-primary/50 transition-colors'
          )}
        >
          <Image className="w-8 h-8" />
          <span className="text-sm">Select Image</span>
        </button>
      )}

      {/* Media library modal */}
      {isOpen && (
        <MediaLibrary
          siteId={siteId}
          siteName=""
          mode="modal"
          onSelect={handleSelect}
          multiple={false}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Multi-image version for galleries
interface MultiImagePickerProps {
  siteId: string;
  value: string[];
  onChange: (assetIds: string[]) => void;
}

export function MultiImagePicker({
  siteId,
  value,
  onChange,
}: MultiImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (assetIds: string[]) => {
    onChange([...value, ...assetIds]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <p className="text-sm text-text-muted">
          {value.length} image{value.length !== 1 ? 's' : ''} selected
        </p>
      )}

      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Images
      </Button>

      {isOpen && (
        <MediaLibrary
          siteId={siteId}
          siteName=""
          mode="modal"
          onSelect={handleSelect}
          multiple
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
```

---

## 9. Format Utilities

Create `src/lib/format.ts`:

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
```

---

## File Structure

```
src/
├── app/
│   └── editor/
│       └── [siteId]/
│           └── media/
│               └── page.tsx
├── components/
│   └── media/
│       ├── MediaLibrary.tsx
│       ├── UploadZone.tsx
│       ├── AssetGrid.tsx
│       ├── AssetDetailModal.tsx
│       ├── FocalPointSelector.tsx
│       └── ImagePicker.tsx
├── hooks/
│   └── useAssets.ts
└── lib/
    └── format.ts
```

---

## Mobile-Specific Features

| Feature | Implementation |
|---------|----------------|
| Camera access | `capture="environment"` input attribute |
| Touch upload | Full touch support in UploadZone |
| Photo library | Native file picker on iOS/Android |
| Progress feedback | Large progress indicator |
| Grid sizing | Responsive 2-5 columns |

---

## Deliverables Checklist

- [ ] Media library page with full-screen layout
- [ ] Media library modal for image picker use
- [ ] Drag-and-drop upload zone
- [ ] Mobile camera access button
- [ ] Upload progress with batch handling
- [ ] Asset grid with thumbnails
- [ ] Asset list view option
- [ ] Search/filter assets
- [ ] Asset detail modal with edit form
- [ ] Focal point selector
- [ ] Alt text field with decorative option
- [ ] Bulk selection and delete
- [ ] ImagePicker component for single select
- [ ] MultiImagePicker for galleries
- [ ] Missing alt text indicators

---

## Testing Checklist

1. **Desktop upload** - Drag files onto drop zone
2. **Mobile upload** - Camera capture works, photo library works
3. **Batch upload** - Multiple files, progress shows for each
4. **File validation** - Invalid types/sizes rejected with message
5. **Asset grid** - Thumbnails load, selection works
6. **Search** - Filters by filename and alt text
7. **Detail modal** - Edit alt text, caption, focal point
8. **Focal point** - Drag to position, updates on move
9. **Delete** - Confirmation, removes from grid
10. **Image picker** - Opens modal, returns selection
11. **Alt text warning** - Shows indicator for missing
12. **Error handling** - Network errors shown, recoverable

---

## Success Criteria

From user-success-scenarios.md:

- **Sarah (mobile update)**: Uploads photos directly from camera roll while on set
- **Marcus (first portfolio)**: Uploads 10 photos from recent shoot
- **Photo upload**: Handles high-resolution images gracefully
- **Mobile WiFi**: Works smoothly even on slower theatre WiFi
