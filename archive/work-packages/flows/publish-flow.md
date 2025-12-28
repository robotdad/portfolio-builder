# Flow: Publish Flow

A self-contained work package for implementing the complete draft-to-published workflow including preview, publish confirmation, and public site viewing.

## Overview

Implement the end-to-end publishing experience from draft preview through publish confirmation to public site rendering. Focus on clear state communication, safe publishing with preview, and fast public site delivery.

## Prerequisites

- `capabilities/draft-publish.md` - Auto-save, publish hooks, revert functionality
- `foundation/data-models.md` - Draft/published content fields
- `foundation/api-contracts.md` - Publish endpoints
- All component capabilities (text, gallery, etc.) for rendering

## Deliverables

1. Preview mode with banner
2. Publish confirmation dialog
3. Publish progress feedback
4. Post-publish success state
5. Public site rendering
6. Public page routes
7. SEO metadata
8. Revert to published functionality
9. Publish history tracking

---

## 1. Route Structure

```
/preview/[siteId]/[pageSlug]    # Authenticated preview of draft
/[siteSlug]                      # Public homepage
/[siteSlug]/[pageSlug]          # Public page
```

---

## 2. Preview Mode

### Preview Page

Create `src/app/preview/[siteId]/[pageSlug]/page.tsx`:

```typescript
import { notFound, redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page/PageRenderer';
import { PortfolioThemeProvider } from '@/hooks/usePortfolioTheme';
import { PreviewBanner } from '@/components/preview/PreviewBanner';

interface PreviewPageProps {
  params: {
    siteId: string;
    pageSlug: string;
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { siteId, pageSlug } = params;

  // Must be authenticated to preview
  const { user } = await validateSession();
  if (!user) {
    redirect(`/login?redirect=/preview/${siteId}/${pageSlug}`);
  }

  // Verify ownership
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
  });

  if (!site) {
    notFound();
  }

  // Find page by slug (or homepage if slug is empty/home)
  let page;
  if (!pageSlug || pageSlug === 'home') {
    page = await prisma.page.findFirst({
      where: { siteId, isHomepage: true },
    });
  } else {
    page = await prisma.page.findFirst({
      where: { siteId, slug: pageSlug },
    });
  }

  if (!page) {
    notFound();
  }

  // Parse DRAFT content (not published)
  const content = JSON.parse(page.draftContent);

  // Check if there are unpublished changes
  const hasUnpublishedChanges =
    !page.publishedContent ||
    page.draftContent !== page.publishedContent;

  return (
    <PortfolioThemeProvider themeId={site.themeId}>
      <div className="min-h-screen">
        {/* Preview banner */}
        <PreviewBanner
          siteId={siteId}
          pageId={page.id}
          hasUnpublishedChanges={hasUnpublishedChanges}
          publishedAt={page.publishedAt}
        />

        {/* Page content */}
        <main className="bg-portfolio-background text-portfolio-text">
          <PageRenderer content={content} isPreview />
        </main>
      </div>
    </PortfolioThemeProvider>
  );
}
```

### Preview Banner

Create `src/components/preview/PreviewBanner.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublish } from '@/hooks/usePublish';
import { Button } from '@/components/ui/button';
import { PublishConfirmDialog } from './PublishConfirmDialog';
import { cn } from '@/lib/utils';
import { Eye, Edit, ExternalLink, X } from 'lucide-react';

interface PreviewBannerProps {
  siteId: string;
  pageId: string;
  hasUnpublishedChanges: boolean;
  publishedAt: Date | null;
}

export function PreviewBanner({
  siteId,
  pageId,
  hasUnpublishedChanges,
  publishedAt,
}: PreviewBannerProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isPublishing, publishPage } = usePublish({ siteId, pageId });

  const handlePublish = async () => {
    try {
      await publishPage();
      setShowPublishDialog(false);
      // Optionally redirect to published page or show success
      window.location.reload(); // Refresh to show updated state
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed top-4 right-4 z-50 bg-warning text-warning-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Preview Mode
      </button>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-warning text-warning-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Preview Mode</span>
            </div>

            <span className="text-sm opacity-80 hidden sm:inline">
              This is how your page will look when published
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit link */}
            <Link href={`/editor/${siteId}/${pageId}`}>
              <Button size="sm" variant="secondary" className="gap-1">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>

            {/* View live (if published) */}
            {publishedAt && (
              <Link href={`/site/${siteId}`} target="_blank">
                <Button size="sm" variant="secondary" className="gap-1">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View Live</span>
                </Button>
              </Link>
            )}

            {/* Publish button */}
            {hasUnpublishedChanges && (
              <Button
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            )}

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-warning-hover rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Publish confirmation dialog */}
      {showPublishDialog && (
        <PublishConfirmDialog
          onConfirm={handlePublish}
          onCancel={() => setShowPublishDialog(false)}
          isPublishing={isPublishing}
          hasBeenPublished={!!publishedAt}
        />
      )}
    </>
  );
}
```

---

## 3. Publish Confirmation Dialog

Create `src/components/preview/PublishConfirmDialog.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Globe, AlertCircle } from 'lucide-react';

interface PublishConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isPublishing: boolean;
  hasBeenPublished: boolean;
}

export function PublishConfirmDialog({
  onConfirm,
  onCancel,
  isPublishing,
  hasBeenPublished,
}: PublishConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative bg-surface rounded-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {hasBeenPublished ? 'Publish Changes?' : 'Publish Your Portfolio?'}
            </h2>

            <p className="text-text-muted mt-2">
              {hasBeenPublished
                ? 'Your changes will be visible to anyone who visits your portfolio.'
                : "Your portfolio will be live and visible to the public. You can always make changes and publish again."}
            </p>

            {!hasBeenPublished && (
              <div className="mt-4 p-3 bg-info/10 text-info rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Make sure you've added alt text to all images for accessibility.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Publishing...
              </>
            ) : (
              'Publish Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Publish Success Toast

Create `src/components/preview/PublishSuccessToast.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink, X } from 'lucide-react';

interface PublishSuccessToastProps {
  siteUrl: string;
  onClose: () => void;
}

export function PublishSuccessToast({
  siteUrl,
  onClose,
}: PublishSuccessToastProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-success text-success-foreground rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <p className="font-semibold">Published successfully!</p>
          <p className="text-sm opacity-90 mt-1">
            Your portfolio is now live at:
          </p>
          <code className="text-xs bg-black/20 px-2 py-1 rounded mt-2 block truncate">
            {siteUrl}
          </code>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="bg-white/20 hover:bg-white/30"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              asChild
              className="bg-white/20 hover:bg-white/30"
            >
              <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Site
              </a>
            </Button>
          </div>
        </div>

        <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## 5. Public Site Routes

### Public Homepage

Create `src/app/[siteSlug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page/PageRenderer';
import { PortfolioThemeProvider } from '@/hooks/usePortfolioTheme';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';

interface PublicSiteProps {
  params: { siteSlug: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PublicSiteProps): Promise<Metadata> {
  const site = await prisma.site.findFirst({
    where: { slug: params.siteSlug, publishedAt: { not: null } },
  });

  if (!site) {
    return { title: 'Not Found' };
  }

  return {
    title: site.title,
    description: site.tagline || `Portfolio by ${site.title}`,
    openGraph: {
      title: site.title,
      description: site.tagline || undefined,
      type: 'website',
    },
  };
}

export default async function PublicSitePage({ params }: PublicSiteProps) {
  const { siteSlug } = params;

  // Find published site
  const site = await prisma.site.findFirst({
    where: {
      slug: siteSlug,
      publishedAt: { not: null },
    },
    include: {
      pages: {
        where: { publishedAt: { not: null } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  // Find homepage
  const homepage = site.pages.find((p) => p.isHomepage);
  if (!homepage || !homepage.publishedContent) {
    notFound();
  }

  // Parse PUBLISHED content
  const content = JSON.parse(homepage.publishedContent);

  // Navigation pages (visible in nav)
  const navPages = site.pages.filter((p) => p.showInNavigation);

  return (
    <PortfolioThemeProvider themeId={site.themeId}>
      <div className="min-h-screen bg-portfolio-background text-portfolio-text">
        <SiteHeader
          siteTitle={site.title}
          pages={navPages}
          currentPageId={homepage.id}
        />

        <main>
          <PageRenderer content={content} />
        </main>

        <SiteFooter siteTitle={site.title} />
      </div>
    </PortfolioThemeProvider>
  );
}
```

### Public Subpage

Create `src/app/[siteSlug]/[pageSlug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageRenderer } from '@/components/page/PageRenderer';
import { PortfolioThemeProvider } from '@/hooks/usePortfolioTheme';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';

interface PublicPageProps {
  params: {
    siteSlug: string;
    pageSlug: string;
  };
}

export async function generateMetadata({
  params,
}: PublicPageProps): Promise<Metadata> {
  const site = await prisma.site.findFirst({
    where: { slug: params.siteSlug, publishedAt: { not: null } },
  });

  if (!site) {
    return { title: 'Not Found' };
  }

  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      slug: params.pageSlug,
      publishedAt: { not: null },
    },
  });

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: `${page.title} | ${site.title}`,
    description: page.metaDescription || site.tagline,
    openGraph: {
      title: `${page.title} | ${site.title}`,
      description: page.metaDescription || undefined,
      type: 'website',
    },
  };
}

export default async function PublicPagePage({ params }: PublicPageProps) {
  const { siteSlug, pageSlug } = params;

  // Find published site
  const site = await prisma.site.findFirst({
    where: {
      slug: siteSlug,
      publishedAt: { not: null },
    },
    include: {
      pages: {
        where: { publishedAt: { not: null } },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  // Find the specific page
  const page = site.pages.find((p) => p.slug === pageSlug);
  if (!page || !page.publishedContent) {
    notFound();
  }

  // Parse PUBLISHED content
  const content = JSON.parse(page.publishedContent);

  // Navigation pages
  const navPages = site.pages.filter((p) => p.showInNavigation);

  return (
    <PortfolioThemeProvider themeId={site.themeId}>
      <div className="min-h-screen bg-portfolio-background text-portfolio-text">
        <SiteHeader
          siteTitle={site.title}
          pages={navPages}
          currentPageId={page.id}
        />

        <main>
          <PageRenderer content={content} />
        </main>

        <SiteFooter siteTitle={site.title} />
      </div>
    </PortfolioThemeProvider>
  );
}
```

---

## 6. Site Header Component

Create `src/components/public/SiteHeader.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

interface SiteHeaderProps {
  siteTitle: string;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    isHomepage: boolean;
  }>;
  currentPageId: string;
}

export function SiteHeader({
  siteTitle,
  pages,
  currentPageId,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Find homepage for logo link
  const homepage = pages.find((p) => p.isHomepage);
  const homeHref = homepage ? `/${homepage.slug}` : '/';

  return (
    <header className="sticky top-0 z-40 bg-portfolio-background/95 backdrop-blur border-b border-portfolio-border">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link
            href={homeHref}
            className="font-portfolio-heading text-xl font-semibold text-portfolio-text"
          >
            {siteTitle}
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center gap-6">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  href={page.isHomepage ? homeHref : `/${page.slug}`}
                  className={cn(
                    'text-sm transition-colors',
                    page.id === currentPageId
                      ? 'text-portfolio-primary font-medium'
                      : 'text-portfolio-text-muted hover:text-portfolio-text'
                  )}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-portfolio-text"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-portfolio-border py-4">
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={page.isHomepage ? homeHref : `/${page.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block py-2 px-4 rounded-lg transition-colors',
                      page.id === currentPageId
                        ? 'bg-portfolio-primary/10 text-portfolio-primary'
                        : 'text-portfolio-text hover:bg-portfolio-surface'
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
```

---

## 7. Site Footer Component

Create `src/components/public/SiteFooter.tsx`:

```typescript
export function SiteFooter({ siteTitle }: { siteTitle: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-portfolio-border py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-portfolio-text-muted text-sm">
        <p>
          &copy; {currentYear} {siteTitle}. All rights reserved.
        </p>
        <p className="mt-2 text-xs opacity-75">
          Built with Portfolio Builder
        </p>
      </div>
    </footer>
  );
}
```

---

## 8. Page Renderer

Create `src/components/page/PageRenderer.tsx`:

```typescript
'use client';

import { PageContent } from '@/types';
import { ComponentRenderer } from '@/components/editor/ComponentRenderer';

interface PageRendererProps {
  content: PageContent;
  isPreview?: boolean;
}

export function PageRenderer({ content, isPreview = false }: PageRendererProps) {
  // Render each section
  const sectionIds = Object.keys(content.sections);

  return (
    <div className="container mx-auto px-4 py-8">
      {sectionIds.map((sectionId) => {
        const section = content.sections[sectionId];

        return (
          <section key={sectionId} className="space-y-8">
            {section.componentIds.map((componentId) => {
              const component = content.components[componentId];
              if (!component) return null;

              return (
                <div key={componentId}>
                  <ComponentRenderer
                    component={component}
                    isEditing={false}
                    isSelected={false}
                    onUpdate={() => {}}
                    onStartEdit={() => {}}
                    onEndEdit={() => {}}
                  />
                </div>
              );
            })}
          </section>
        );
      })}

      {/* Empty state for preview */}
      {isPreview && sectionIds.length === 0 && (
        <div className="text-center py-16 text-portfolio-text-muted">
          <p className="text-lg">This page has no content yet.</p>
          <p className="text-sm mt-2">
            Add components in the editor to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Revert Confirmation Dialog

Create `src/components/editor/RevertConfirmDialog.tsx`:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface RevertConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isReverting: boolean;
}

export function RevertConfirmDialog({
  onConfirm,
  onCancel,
  isReverting,
}: RevertConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative bg-surface rounded-lg max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">Revert to Published?</h2>

            <p className="text-text-muted mt-2">
              This will discard all unpublished changes and restore your page to
              the last published version.
            </p>

            <p className="text-error text-sm mt-3">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} disabled={isReverting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isReverting}
          >
            {isReverting ? 'Reverting...' : 'Revert Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. Enhanced Publish Button

Update `src/components/editor/PublishButton.tsx`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePublish } from '@/hooks/usePublish';
import { useRevert } from '@/hooks/useRevert';
import { useEditor } from './EditorProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { PublishConfirmDialog } from '@/components/preview/PublishConfirmDialog';
import { RevertConfirmDialog } from './RevertConfirmDialog';
import { PublishSuccessToast } from '@/components/preview/PublishSuccessToast';
import { ChevronDown, Globe, Eye, RotateCcw, ExternalLink } from 'lucide-react';

interface PublishButtonProps {
  siteId: string;
  pageId: string;
}

export function PublishButton({ siteId, pageId }: PublishButtonProps) {
  const router = useRouter();
  const { state } = useEditor();

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');

  const { isPublishing, publishPage, publishSite } = usePublish({
    siteId,
    pageId,
  });

  const { isReverting, revertToPublished } = useRevert({
    siteId,
    pageId,
    onRevert: (content) => {
      // Update editor state with reverted content
      // This should be handled by the EditorProvider
    },
  });

  // Determine if there are unpublished changes
  // This should come from comparing draft vs published content
  const hasUnpublishedChanges = true; // Simplified - should check actual state
  const hasBeenPublished = true; // Simplified - should check publishedAt

  const handlePublish = useCallback(async () => {
    try {
      const result = await publishPage();
      setShowPublishDialog(false);

      // Show success toast with URL
      // URL construction depends on your domain setup
      const url = `${window.location.origin}/site/${siteId}`;
      setPublishedUrl(url);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Publish failed:', error);
    }
  }, [publishPage, siteId]);

  const handlePublishSite = useCallback(async () => {
    try {
      await publishSite();
      setShowPublishDialog(false);

      const url = `${window.location.origin}/site/${siteId}`;
      setPublishedUrl(url);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Publish all failed:', error);
    }
  }, [publishSite, siteId]);

  const handleRevert = useCallback(async () => {
    try {
      await revertToPublished();
      setShowRevertDialog(false);
    } catch (error) {
      console.error('Revert failed:', error);
    }
  }, [revertToPublished]);

  const handlePreview = () => {
    window.open(`/preview/${siteId}/${pageId}`, '_blank');
  };

  const handleViewLive = () => {
    window.open(`/site/${siteId}`, '_blank');
  };

  return (
    <>
      <div className="flex items-center">
        <Button
          onClick={() => setShowPublishDialog(true)}
          disabled={isPublishing || !hasUnpublishedChanges}
          className="rounded-r-none"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className="rounded-l-none border-l border-primary-foreground/20 px-2"
              disabled={isPublishing}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setShowPublishDialog(true)}
              disabled={!hasUnpublishedChanges}
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish this page
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handlePublishSite}>
              <Globe className="w-4 h-4 mr-2" />
              Publish entire site
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>

            {hasBeenPublished && (
              <DropdownMenuItem onClick={handleViewLive}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View live site
              </DropdownMenuItem>
            )}

            {hasBeenPublished && hasUnpublishedChanges && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowRevertDialog(true)}
                  className="text-error focus:text-error"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Revert to published
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialogs */}
      {showPublishDialog && (
        <PublishConfirmDialog
          onConfirm={handlePublish}
          onCancel={() => setShowPublishDialog(false)}
          isPublishing={isPublishing}
          hasBeenPublished={hasBeenPublished}
        />
      )}

      {showRevertDialog && (
        <RevertConfirmDialog
          onConfirm={handleRevert}
          onCancel={() => setShowRevertDialog(false)}
          isReverting={isReverting}
        />
      )}

      {/* Success toast */}
      {showSuccessToast && (
        <PublishSuccessToast
          siteUrl={publishedUrl}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </>
  );
}
```

---

## 11. Static Generation for Public Sites

Add to `src/app/[siteSlug]/page.tsx` for better performance:

```typescript
// Enable static generation for published sites
export async function generateStaticParams() {
  const sites = await prisma.site.findMany({
    where: { publishedAt: { not: null } },
    select: { slug: true },
  });

  return sites.map((site) => ({
    siteSlug: site.slug,
  }));
}

// Revalidate every hour (or on publish via API)
export const revalidate = 3600;
```

---

## File Structure

```
src/
├── app/
│   ├── preview/
│   │   └── [siteId]/
│   │       └── [pageSlug]/
│   │           └── page.tsx
│   └── [siteSlug]/
│       ├── page.tsx              # Public homepage
│       └── [pageSlug]/
│           └── page.tsx          # Public subpage
├── components/
│   ├── preview/
│   │   ├── PreviewBanner.tsx
│   │   ├── PublishConfirmDialog.tsx
│   │   └── PublishSuccessToast.tsx
│   ├── public/
│   │   ├── SiteHeader.tsx
│   │   └── SiteFooter.tsx
│   ├── page/
│   │   └── PageRenderer.tsx
│   └── editor/
│       ├── PublishButton.tsx
│       └── RevertConfirmDialog.tsx
└── hooks/
    ├── usePublish.ts
    └── useRevert.ts
```

---

## State Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        DRAFT STATE                            │
│  (editing in /editor/[siteId]/[pageId])                      │
│                                                               │
│  Auto-save → draftContent updated                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ User clicks "Preview"
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                       PREVIEW STATE                           │
│  (/preview/[siteId]/[pageSlug])                              │
│                                                               │
│  Shows draftContent with preview banner                      │
│  Can publish or return to editor                             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ User clicks "Publish"
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     PUBLISH ACTION                            │
│                                                               │
│  1. Confirm dialog                                           │
│  2. API: Copy draftContent → publishedContent                │
│  3. Set publishedAt timestamp                                │
│  4. Success toast with live URL                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ Content is live
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      PUBLISHED STATE                          │
│  (/[siteSlug] or /[siteSlug]/[pageSlug])                     │
│                                                               │
│  Shows publishedContent to public                            │
│  Fast, static rendering                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Deliverables Checklist

- [ ] Preview page with draft content
- [ ] Preview banner with edit/publish actions
- [ ] Publish confirmation dialog
- [ ] Publish progress feedback
- [ ] Publish success toast with URL copy
- [ ] Public homepage route
- [ ] Public subpage routes
- [ ] Site header with navigation
- [ ] Site footer
- [ ] PageRenderer for both preview and public
- [ ] SEO metadata generation
- [ ] Revert confirmation dialog
- [ ] Revert to published functionality
- [ ] Static generation for public sites
- [ ] Mobile-responsive public site

---

## Testing Checklist

1. **Preview** - Shows draft content, banner visible
2. **Publish dialog** - Opens on button click, shows warning
3. **Publish action** - Copies draft to published, updates timestamp
4. **Success toast** - Shows URL, copy button works
5. **Public homepage** - Renders published content
6. **Public subpage** - Correct content, navigation works
7. **Navigation** - Header shows all published pages
8. **SEO** - Title, description in head tags
9. **Revert** - Confirms, restores published content to draft
10. **Unpublished site** - Returns 404
11. **Mobile public** - Responsive header, touch navigation
12. **Performance** - Static generation working

---

## Success Criteria

From user-success-scenarios.md:

- **Marcus**: Previews how it will look to visitors, publishes and shares link
- **Sarah**: Publishes update immediately, texts link to director
- **Confidence**: Preview gives confidence before publishing
- **Professional result**: Published site loads fast, looks professional
