# Capability: Draft & Publish System

A self-contained work package for implementing draft storage, preview, and publish workflow.

## Overview

Implement a content workflow where changes are saved to a draft state automatically, with explicit publish actions to make content live. Supports preview mode, revert to published, and status indicators.

## Prerequisites

- Foundation artifacts complete (data-models, api-contracts)
- Auth system implemented
- Page content structure from data-models.md

## Deliverables

1. Auto-save functionality
2. Draft vs published content handling
3. Preview mode
4. Publish workflow (page and site)
5. Revert to published
6. Status indicators and UI
7. Optimistic updates

---

## 1. Content State Model

From data-models.md, pages have two content fields:

```prisma
model Page {
  // ...
  draftContent     String  @default("{}")  // Current editing state
  publishedContent String? // Live content (null if never published)
  // ...
  publishedAt      DateTime?
}
```

**States:**
- **Never published**: `publishedContent = null`, `publishedAt = null`
- **Published, no changes**: `draftContent === publishedContent`
- **Published with draft changes**: `draftContent !== publishedContent`

---

## 2. Auto-Save Hook

Create `src/hooks/useAutoSave.ts`:

```typescript
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageContent } from '@/types';

interface UseAutoSaveOptions {
  pageId: string;
  siteId: string;
  content: PageContent;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export function useAutoSave({
  pageId,
  siteId,
  content,
  debounceMs = 2000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const contentRef = useRef(content);
  const lastSavedContentRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track content changes
  useEffect(() => {
    const currentJson = JSON.stringify(content);
    const hasChanges = currentJson !== lastSavedContentRef.current;

    contentRef.current = content;
    setState((prev) => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, [content]);

  // Debounced save
  useEffect(() => {
    const currentJson = JSON.stringify(content);

    // Skip if no changes from last save
    if (currentJson === lastSavedContentRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, isSaving: true, error: null }));
      onSaveStart?.();

      try {
        const response = await fetch(
          `/api/sites/${siteId}/pages/${pageId}/content`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: contentRef.current }),
            credentials: 'include',
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Save failed');
        }

        lastSavedContentRef.current = JSON.stringify(contentRef.current);

        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        }));

        onSaveSuccess?.();
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return; // Ignore aborted requests
        }

        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: (error as Error).message,
        }));

        onSaveError?.(error as Error);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, pageId, siteId, debounceMs, onSaveStart, onSaveSuccess, onSaveError]);

  // Manual save function (immediate)
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await fetch(
        `/api/sites/${siteId}/pages/${pageId}/content`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentRef.current }),
          credentials: 'include',
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Save failed');
      }

      lastSavedContentRef.current = JSON.stringify(contentRef.current);

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: (error as Error).message,
        }));
        throw error;
      }
    }
  }, [pageId, siteId]);

  // Initialize lastSavedContent on mount
  useEffect(() => {
    lastSavedContentRef.current = JSON.stringify(content);
  }, []); // Only on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    saveNow,
  };
}
```

---

## 3. Publish Hook

Create `src/hooks/usePublish.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';

interface UsePublishOptions {
  siteId: string;
  pageId?: string; // If provided, publish single page
}

interface PublishState {
  isPublishing: boolean;
  error: string | null;
}

export function usePublish({ siteId, pageId }: UsePublishOptions) {
  const [state, setState] = useState<PublishState>({
    isPublishing: false,
    error: null,
  });

  // Publish single page
  const publishPage = useCallback(async (targetPageId?: string) => {
    const id = targetPageId || pageId;
    if (!id) {
      throw new Error('Page ID required');
    }

    setState({ isPublishing: true, error: null });

    try {
      const response = await fetch(
        `/api/sites/${siteId}/pages/${id}/publish`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Publish failed');
      }

      const data = await response.json();
      setState({ isPublishing: false, error: null });
      return data.data;
    } catch (error) {
      setState({
        isPublishing: false,
        error: (error as Error).message,
      });
      throw error;
    }
  }, [siteId, pageId]);

  // Publish entire site (all pages)
  const publishSite = useCallback(async () => {
    setState({ isPublishing: true, error: null });

    try {
      const response = await fetch(`/api/sites/${siteId}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Publish failed');
      }

      const data = await response.json();
      setState({ isPublishing: false, error: null });
      return data.data;
    } catch (error) {
      setState({
        isPublishing: false,
        error: (error as Error).message,
      });
      throw error;
    }
  }, [siteId]);

  return {
    ...state,
    publishPage,
    publishSite,
  };
}
```

---

## 4. Revert Hook

Create `src/hooks/useRevert.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { PageContent } from '@/types';

interface UseRevertOptions {
  siteId: string;
  pageId: string;
  onRevert: (content: PageContent) => void;
}

export function useRevert({ siteId, pageId, onRevert }: UseRevertOptions) {
  const [isReverting, setIsReverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revertToPublished = useCallback(async () => {
    setIsReverting(true);
    setError(null);

    try {
      // Fetch the page to get published content
      const response = await fetch(
        `/api/sites/${siteId}/pages/${pageId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to fetch page');
      }

      const data = await response.json();
      const { publishedContent } = data.data;

      if (!publishedContent) {
        throw new Error('Page has never been published');
      }

      // Update draft to match published
      const saveResponse = await fetch(
        `/api/sites/${siteId}/pages/${pageId}/content`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: publishedContent }),
          credentials: 'include',
        }
      );

      if (!saveResponse.ok) {
        const saveData = await saveResponse.json();
        throw new Error(saveData.error?.message || 'Failed to revert');
      }

      // Update local state
      onRevert(publishedContent);
      setIsReverting(false);
    } catch (err) {
      setError((err as Error).message);
      setIsReverting(false);
      throw err;
    }
  }, [siteId, pageId, onRevert]);

  return {
    isReverting,
    error,
    revertToPublished,
  };
}
```

---

## 5. API Routes

### PUT /api/sites/:siteId/pages/:pageId/content

Create `src/app/api/sites/[siteId]/pages/[pageId]/content/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errors } from '@/lib/api/response';
import { validatePageContent } from '@/lib/validation';

export async function PUT(
  request: NextRequest,
  { params }: { params: { siteId: string; pageId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId, pageId } = params;

    // Verify ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, siteId },
    });

    if (!page) {
      return errors.notFound('Page');
    }

    const body = await request.json();
    const { content } = body;

    // Validate content structure
    const validation = validatePageContent(content);
    if (!validation.valid) {
      return errors.validation({ content: validation.errors });
    }

    // Update draft content
    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        draftContent: JSON.stringify(content),
        updatedAt: new Date(),
      },
    });

    return successResponse({
      id: updated.id,
      draftContent: JSON.parse(updated.draftContent),
      updatedAt: updated.updatedAt.toISOString(),
    });
  });
}
```

### POST /api/sites/:siteId/pages/:pageId/publish

Create `src/app/api/sites/[siteId]/pages/[pageId]/publish/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string; pageId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId, pageId } = params;

    // Verify ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const page = await prisma.page.findFirst({
      where: { id: pageId, siteId },
    });

    if (!page) {
      return errors.notFound('Page');
    }

    const now = new Date();

    // Copy draft to published
    const updated = await prisma.page.update({
      where: { id: pageId },
      data: {
        publishedContent: page.draftContent,
        publishedAt: now,
      },
    });

    // Also update site publishedAt if this is first publish
    if (!site.publishedAt) {
      await prisma.site.update({
        where: { id: siteId },
        data: { publishedAt: now },
      });
    }

    return successResponse({
      id: updated.id,
      publishedContent: JSON.parse(updated.publishedContent!),
      publishedAt: updated.publishedAt!.toISOString(),
    });
  });
}
```

### POST /api/sites/:siteId/publish

Create `src/app/api/sites/[siteId]/publish/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  return withAuth(request, async (userId) => {
    const { siteId } = params;

    // Verify ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
      include: { pages: true },
    });

    if (!site) {
      return errors.notFound('Site');
    }

    const now = new Date();

    // Publish all pages
    const publishPromises = site.pages.map((page) =>
      prisma.page.update({
        where: { id: page.id },
        data: {
          publishedContent: page.draftContent,
          publishedAt: now,
        },
      })
    );

    await Promise.all(publishPromises);

    // Update site publishedAt
    await prisma.site.update({
      where: { id: siteId },
      data: { publishedAt: now },
    });

    return successResponse({
      publishedAt: now.toISOString(),
      publishedPages: site.pages.length,
    });
  });
}
```

---

## 6. Content Validation

Create `src/lib/validation.ts`:

```typescript
import { PageContent, ComponentType } from '@/types';

const VALID_COMPONENT_TYPES: ComponentType[] = [
  'text',
  'image',
  'gallery',
  'spacer',
  'button',
  'video',
  'contact-form',
];

export function validatePageContent(content: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content || typeof content !== 'object') {
    return { valid: false, errors: ['Content must be an object'] };
  }

  const c = content as PageContent;

  // Check version
  if (c.version !== '1.0') {
    errors.push('Invalid or missing content version');
  }

  // Check sections
  if (!c.sections || typeof c.sections !== 'object') {
    errors.push('Sections must be an object');
  } else {
    for (const [sectionId, section] of Object.entries(c.sections)) {
      if (!section.id || section.id !== sectionId) {
        errors.push(`Section ${sectionId} has mismatched id`);
      }
      if (!Array.isArray(section.componentIds)) {
        errors.push(`Section ${sectionId} componentIds must be an array`);
      }
    }
  }

  // Check components
  if (!c.components || typeof c.components !== 'object') {
    errors.push('Components must be an object');
  } else {
    for (const [componentId, component] of Object.entries(c.components)) {
      if (!component.id || component.id !== componentId) {
        errors.push(`Component ${componentId} has mismatched id`);
      }
      if (!VALID_COMPONENT_TYPES.includes(component.type)) {
        errors.push(`Component ${componentId} has invalid type: ${component.type}`);
      }
      if (!component.props || typeof component.props !== 'object') {
        errors.push(`Component ${componentId} must have props object`);
      }
    }
  }

  // Verify all referenced components exist
  if (c.sections && c.components) {
    for (const section of Object.values(c.sections)) {
      for (const componentId of section.componentIds) {
        if (!c.components[componentId]) {
          errors.push(`Section ${section.id} references missing component ${componentId}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 7. Status Indicator Component

Create `src/components/editor/SaveStatus.tsx`:

```typescript
'use client';

import { cn } from '@/lib/utils';
import { Check, AlertCircle, Loader2, Cloud } from 'lucide-react';

interface SaveStatusProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function SaveStatus({
  isSaving,
  hasUnsavedChanges,
  lastSaved,
  error,
}: SaveStatusProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-error text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Save failed</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <Cloud className="w-4 h-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-success text-sm">
        <Check className="w-4 h-4" />
        <span>Saved {formatRelativeTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return date.toLocaleDateString();
}
```

---

## 8. Publish Status Component

Create `src/components/editor/PublishStatus.tsx`:

```typescript
'use client';

import { cn } from '@/lib/utils';
import { Globe, FileWarning, FilePlus } from 'lucide-react';

interface PublishStatusProps {
  publishedAt: Date | null;
  hasUnpublishedChanges: boolean;
}

export function PublishStatus({
  publishedAt,
  hasUnpublishedChanges,
}: PublishStatusProps) {
  if (!publishedAt) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm">
        <FilePlus className="w-4 h-4" />
        <span>Never published</span>
      </div>
    );
  }

  if (hasUnpublishedChanges) {
    return (
      <div className="flex items-center gap-2 text-warning text-sm">
        <FileWarning className="w-4 h-4" />
        <span>Unpublished changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-success text-sm">
      <Globe className="w-4 h-4" />
      <span>Published {formatDate(publishedAt)}</span>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
```

---

## 9. Publish Button Component

Create `src/components/editor/PublishButton.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe, RotateCcw, Eye } from 'lucide-react';

interface PublishButtonProps {
  isPublishing: boolean;
  hasUnpublishedChanges: boolean;
  canRevert: boolean;
  onPublishPage: () => void;
  onPublishSite: () => void;
  onRevert: () => void;
  onPreview: () => void;
}

export function PublishButton({
  isPublishing,
  hasUnpublishedChanges,
  canRevert,
  onPublishPage,
  onPublishSite,
  onRevert,
  onPreview,
}: PublishButtonProps) {
  return (
    <div className="flex items-center">
      <Button
        onClick={onPublishPage}
        disabled={isPublishing || !hasUnpublishedChanges}
        className="rounded-r-none"
      >
        {isPublishing ? 'Publishing...' : 'Publish'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="rounded-l-none border-l border-primary-hover px-2"
            disabled={isPublishing}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPublishPage} disabled={!hasUnpublishedChanges}>
            <Globe className="w-4 h-4 mr-2" />
            Publish this page
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onPublishSite}>
            <Globe className="w-4 h-4 mr-2" />
            Publish entire site
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onPreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </DropdownMenuItem>

          {canRevert && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRevert} className="text-error">
                <RotateCcw className="w-4 h-4 mr-2" />
                Revert to published
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

---

## 10. Preview Mode

Create `src/app/preview/[siteId]/[pageSlug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth/session';
import { PageRenderer } from '@/components/page/PageRenderer';
import { PortfolioThemeProvider } from '@/hooks/usePortfolioTheme';

interface PreviewPageProps {
  params: {
    siteId: string;
    pageSlug: string;
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { siteId, pageSlug } = params;

  // Verify authentication
  const { user } = await validateSession();
  if (!user) {
    notFound();
  }

  // Get site and page
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
  });

  if (!site) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { siteId, slug: pageSlug },
  });

  if (!page) {
    notFound();
  }

  // Parse draft content (not published)
  const content = JSON.parse(page.draftContent);

  return (
    <PortfolioThemeProvider themeId={site.themeId}>
      <div className="min-h-screen bg-portfolio-background">
        {/* Preview banner */}
        <div className="sticky top-0 z-50 bg-warning text-warning-foreground px-4 py-2 text-center text-sm">
          Preview Mode - This is how your page will look when published
          <a
            href={`/editor/${siteId}/${page.id}`}
            className="ml-4 underline"
          >
            Back to Editor
          </a>
        </div>

        {/* Page content */}
        <PageRenderer content={content} />
      </div>
    </PortfolioThemeProvider>
  );
}
```

---

## 11. Editor Integration Example

Show how to wire everything together:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { PageContent } from '@/types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePublish } from '@/hooks/usePublish';
import { useRevert } from '@/hooks/useRevert';
import { SaveStatus } from '@/components/editor/SaveStatus';
import { PublishStatus } from '@/components/editor/PublishStatus';
import { PublishButton } from '@/components/editor/PublishButton';
import { EditorCanvas } from '@/components/editor/Canvas';

interface PageEditorProps {
  siteId: string;
  pageId: string;
  initialContent: PageContent;
  publishedContent: PageContent | null;
  publishedAt: Date | null;
}

export function PageEditor({
  siteId,
  pageId,
  initialContent,
  publishedContent,
  publishedAt,
}: PageEditorProps) {
  const [content, setContent] = useState<PageContent>(initialContent);
  const [currentPublishedAt, setCurrentPublishedAt] = useState(publishedAt);

  // Auto-save
  const autoSave = useAutoSave({
    siteId,
    pageId,
    content,
  });

  // Publish
  const { isPublishing, publishPage, publishSite } = usePublish({
    siteId,
    pageId,
  });

  // Revert
  const { revertToPublished } = useRevert({
    siteId,
    pageId,
    onRevert: setContent,
  });

  // Calculate if there are unpublished changes
  const hasUnpublishedChanges =
    !publishedContent ||
    JSON.stringify(content) !== JSON.stringify(publishedContent);

  // Handlers
  const handlePublishPage = useCallback(async () => {
    await autoSave.saveNow(); // Ensure latest changes are saved
    const result = await publishPage();
    setCurrentPublishedAt(new Date(result.publishedAt));
  }, [autoSave, publishPage]);

  const handlePublishSite = useCallback(async () => {
    await autoSave.saveNow();
    await publishSite();
    setCurrentPublishedAt(new Date());
  }, [autoSave, publishSite]);

  const handlePreview = useCallback(() => {
    // Open preview in new tab
    window.open(`/preview/${siteId}/${pageId}`, '_blank');
  }, [siteId, pageId]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-4">
          <SaveStatus {...autoSave} />
          <PublishStatus
            publishedAt={currentPublishedAt}
            hasUnpublishedChanges={hasUnpublishedChanges}
          />
        </div>

        <PublishButton
          isPublishing={isPublishing}
          hasUnpublishedChanges={hasUnpublishedChanges}
          canRevert={!!publishedContent}
          onPublishPage={handlePublishPage}
          onPublishSite={handlePublishSite}
          onRevert={revertToPublished}
          onPreview={handlePreview}
        />
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-auto">
        <EditorCanvas content={content} onChange={setContent} />
      </main>
    </div>
  );
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── sites/
│   │       └── [siteId]/
│   │           ├── publish/route.ts
│   │           └── pages/
│   │               └── [pageId]/
│   │                   ├── content/route.ts
│   │                   └── publish/route.ts
│   └── preview/
│       └── [siteId]/
│           └── [pageSlug]/page.tsx
├── hooks/
│   ├── useAutoSave.ts
│   ├── usePublish.ts
│   └── useRevert.ts
├── components/
│   └── editor/
│       ├── SaveStatus.tsx
│       ├── PublishStatus.tsx
│       └── PublishButton.tsx
└── lib/
    └── validation.ts
```

---

## Deliverables Checklist

- [ ] Auto-save hook with debouncing (2s default)
- [ ] Manual save function for immediate saves
- [ ] Publish page API endpoint
- [ ] Publish site API endpoint (all pages)
- [ ] Content validation function
- [ ] Revert to published functionality
- [ ] SaveStatus component (saving/saved/error states)
- [ ] PublishStatus component (never/published/changes)
- [ ] PublishButton with dropdown menu
- [ ] Preview mode page
- [ ] Unsaved changes tracking
- [ ] Optimistic UI updates

---

## Testing Checklist

1. **Auto-save** - Edit content, wait 2s, verify saved
2. **Manual save** - Click save, verify immediate save
3. **Publish page** - Publish, verify publishedContent matches draft
4. **Publish site** - Publish all pages at once
5. **Revert** - Make changes, revert, verify draft matches published
6. **Preview** - Opens new tab with draft content
7. **Status indicators** - Correct states shown during workflow
8. **Validation** - Invalid content rejected with errors
9. **Offline handling** - Save fails gracefully, shows error
10. **Concurrent edits** - Latest save wins, no data loss
11. **Leave page warning** - Prompt if unsaved changes
