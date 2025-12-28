# Polish: Performance Audit

A self-contained work package for optimizing the portfolio builder's performance across bundle size, lazy loading, caching, and runtime efficiency.

## Overview

Audit and optimize performance across the entire application. Focus on achieving fast initial load times, smooth interactions, efficient asset delivery, and maintaining performance as the application scales. Target metrics: LCP < 2.5s, FID < 100ms, CLS < 0.1.

## Prerequisites

- `flows/onboarding-flow.md` - Registration, wizard flows
- `flows/editing-flow.md` - Editor with dnd-kit
- `flows/media-flow.md` - Image upload and processing
- `flows/publish-flow.md` - Public site rendering
- `foundation/tech-decisions.md` - Framework choices (Next.js, dnd-kit ~110KB)

## Deliverables

1. Bundle analysis and optimization
2. Code splitting strategy
3. Component lazy loading
4. Image optimization pipeline
5. Caching strategy (browser, API, static)
6. React performance optimization
7. Database query optimization
8. CDN and edge caching
9. Performance monitoring setup
10. Performance budget enforcement

---

## 1. Performance Targets

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Time to render largest content |
| FID (First Input Delay) | < 100ms | Time to first interaction |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| TTFB (Time to First Byte) | < 600ms | Server response time |
| TTI (Time to Interactive) | < 3.5s | Full interactivity |

### Bundle Size Budgets

| Bundle | Budget | Notes |
|--------|--------|-------|
| Initial JS | < 150KB gzip | Critical path only |
| Editor chunk | < 200KB gzip | Loaded on editor routes |
| Total JS | < 400KB gzip | All routes combined |
| CSS | < 50KB gzip | Including Tailwind purged |

### Page-Specific Targets

| Page | LCP Target | Bundle Target |
|------|------------|---------------|
| Landing | < 1.5s | < 80KB |
| Login/Register | < 2.0s | < 100KB |
| Dashboard | < 2.5s | < 120KB |
| Editor | < 3.0s | < 250KB |
| Public Portfolio | < 2.0s | < 100KB |

---

## 2. Bundle Analysis

### Setup Bundle Analyzer

```bash
npm install @next/bundle-analyzer
```

Update `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
};

module.exports = withBundleAnalyzer(nextConfig);
```

Add script to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "ANALYZE=true BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "ANALYZE=true BUNDLE_ANALYZE=browser npm run build"
  }
}
```

### Expected Heavy Dependencies

| Package | Size | Optimization Strategy |
|---------|------|----------------------|
| dnd-kit | ~110KB | Dynamic import, editor only |
| Tiptap | ~150KB | Dynamic import, editor only |
| Sharp | Server only | Already server-side |
| Prisma | Server only | Already server-side |
| React | ~45KB | Required, no reduction |
| Next.js | ~90KB | Required, minimal |

### Bundle Audit Checklist

```
- [ ] Run bundle analyzer
- [ ] Identify bundles > 50KB
- [ ] Check for duplicate dependencies
- [ ] Verify tree shaking working
- [ ] Check for unused exports
- [ ] Audit icon imports (lucide-react)
- [ ] Review lodash/date-fns imports
```

---

## 3. Code Splitting Strategy

### Route-Based Splitting (Automatic)

Next.js App Router automatically splits by route. Verify with:

```typescript
// Each folder in app/ creates a separate chunk
app/
├── page.tsx              // → landing chunk
├── login/page.tsx        // → login chunk
├── register/page.tsx     // → register chunk
├── dashboard/page.tsx    // → dashboard chunk
├── editor/[siteId]/[pageId]/page.tsx  // → editor chunk
└── [siteSlug]/page.tsx   // → public chunk
```

### Component-Based Splitting

Create `src/lib/dynamic.ts`:

```typescript
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading placeholder
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Heavy editor components - only load on editor routes
export const DynamicEditorProvider = dynamic(
  () => import('@/components/editor/EditorProvider').then(mod => mod.EditorProvider),
  { loading: LoadingSpinner, ssr: false }
);

export const DynamicPageEditor = dynamic(
  () => import('@/components/editor/PageEditor').then(mod => mod.PageEditor),
  { loading: LoadingSpinner, ssr: false }
);

export const DynamicComponentPicker = dynamic(
  () => import('@/components/editor/ComponentPicker').then(mod => mod.ComponentPicker),
  { loading: LoadingSpinner, ssr: false }
);

// Tiptap editor - heavy, only needed for text editing
export const DynamicTiptapEditor = dynamic(
  () => import('@/components/blocks/TextBlock/TiptapEditor').then(mod => mod.TiptapEditor),
  { loading: LoadingSpinner, ssr: false }
);

// Media library - load on demand
export const DynamicMediaLibrary = dynamic(
  () => import('@/components/media/MediaLibrary').then(mod => mod.MediaLibrary),
  { loading: LoadingSpinner }
);

// Theme preview - only in onboarding
export const DynamicThemePreview = dynamic(
  () => import('@/components/theme/ThemePreview').then(mod => mod.ThemePreview),
  { loading: LoadingSpinner }
);
```

### Lazy Load Heavy Libraries

```typescript
// Instead of static import
// import { DndContext } from '@dnd-kit/core';

// Use dynamic import
const loadDndKit = () => import('@dnd-kit/core');
const loadSortable = () => import('@dnd-kit/sortable');

// In component
useEffect(() => {
  // Preload dnd-kit when user hovers over editor link
  const preload = async () => {
    await Promise.all([loadDndKit(), loadSortable()]);
  };
  // ... attach to hover/focus events
}, []);
```

---

## 4. Component Lazy Loading

### Intersection Observer for Below-Fold Content

Create `src/hooks/useLazyLoad.ts`:

```typescript
'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useLazyLoad({
  rootMargin = '100px',
  threshold = 0,
  triggerOnce = true,
}: LazyLoadOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce]);

  return { ref, isVisible };
}
```

### Lazy Component Wrapper

Create `src/components/ui/LazyLoad.tsx`:

```typescript
'use client';

import { ReactNode, Suspense } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: number;
}

export function LazyLoad({
  children,
  fallback,
  rootMargin = '200px',
  minHeight = 100,
}: LazyLoadProps) {
  const { ref, isVisible } = useLazyLoad({ rootMargin });

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? (
        <Suspense fallback={fallback || <LoadingPlaceholder />}>
          {children}
        </Suspense>
      ) : (
        fallback || <LoadingPlaceholder />
      )}
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="animate-pulse bg-surface-hover rounded-lg h-32" />
  );
}
```

### Usage in Pages

```typescript
// In public portfolio page - lazy load gallery
import { LazyLoad } from '@/components/ui/LazyLoad';
import { DynamicGallery } from '@/lib/dynamic';

function PortfolioPage({ content }: { content: PageContent }) {
  return (
    <div>
      {/* Hero section - load immediately */}
      <HeroSection content={content.hero} />

      {/* Gallery - lazy load when approaching viewport */}
      <LazyLoad rootMargin="300px" minHeight={400}>
        <DynamicGallery images={content.gallery} />
      </LazyLoad>

      {/* Contact form - lazy load */}
      <LazyLoad rootMargin="200px">
        <ContactForm />
      </LazyLoad>
    </div>
  );
}
```

---

## 5. Image Optimization

### Next.js Image Configuration

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote patterns for user uploads
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.example.com', // Your storage domain
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com', // If using Cloudinary
      },
    ],

    // Device sizes for srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Image sizes for thumbnails
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Formats to generate
    formats: ['image/avif', 'image/webp'],

    // Minimize image processing in dev
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days

    // Disable blur placeholder in dev (faster)
    dangerouslyAllowSVG: false,
  },
};
```

### Optimized Image Component

Create `src/components/ui/OptimizedImage.tsx`:

```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  sizes = '100vw',
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          'bg-surface-hover flex items-center justify-center text-text-muted',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'duration-300 ease-in-out',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-surface-hover animate-pulse" />
      )}
    </div>
  );
}
```

### Image Srcset Strategy

```typescript
// Size hints for different contexts
export const IMAGE_SIZES = {
  // Gallery thumbnails
  thumbnail: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',

  // Single image in content
  content: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw',

  // Hero/full-width
  hero: '100vw',

  // Gallery lightbox
  lightbox: '(max-width: 1024px) 100vw, 80vw',
};

// Usage
<OptimizedImage
  src={image.url}
  alt={image.alt}
  fill
  sizes={IMAGE_SIZES.thumbnail}
  quality={75} // Lower for thumbnails
/>
```

### Blur Placeholder Generation

In image pipeline (server-side):

```typescript
import sharp from 'sharp';

async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const { data, info } = await sharp(buffer)
    .resize(10, 10, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const base64 = data.toString('base64');
  return `data:image/${info.format};base64,${base64}`;
}

// Store blurDataURL with asset metadata
```

---

## 6. Caching Strategy

### Browser Caching Headers

Create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Static assets - long cache
  if (request.nextUrl.pathname.match(/\.(js|css|woff2?|ttf|eot|ico|svg)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // Images - medium cache with revalidation
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800'
    );
  }

  // API responses - short cache
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'private, max-age=0, must-revalidate'
    );
  }

  // Public portfolio pages - cache with revalidation
  if (request.nextUrl.pathname.match(/^\/[^\/]+$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=3600'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### API Response Caching

Create `src/lib/cache.ts`:

```typescript
import { unstable_cache } from 'next/cache';

// Cache site data for public pages
export const getCachedSite = unstable_cache(
  async (slug: string) => {
    const site = await prisma.site.findFirst({
      where: { slug, publishedAt: { not: null } },
      include: {
        pages: {
          where: { publishedAt: { not: null } },
          orderBy: { order: 'asc' },
        },
      },
    });
    return site;
  },
  ['site'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['sites'],
  }
);

// Cache page content
export const getCachedPage = unstable_cache(
  async (siteId: string, pageSlug: string) => {
    const page = await prisma.page.findFirst({
      where: {
        siteId,
        slug: pageSlug,
        publishedAt: { not: null },
      },
    });
    return page;
  },
  ['page'],
  {
    revalidate: 60,
    tags: ['pages'],
  }
);

// Invalidate cache on publish
export async function invalidateSiteCache(siteId: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('sites');
  revalidateTag('pages');
  revalidateTag(`site-${siteId}`);
}
```

### Client-Side Data Caching

Create `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep in cache for 30 minutes
      cacheTime: 30 * 60 * 1000,

      // Don't refetch on window focus in editor
      refetchOnWindowFocus: false,

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

---

## 7. React Performance Optimization

### Memoization Patterns

```typescript
// Memoize expensive computations
import { useMemo, useCallback, memo } from 'react';

// Memoize component list rendering
const ComponentList = memo(function ComponentList({
  components,
  onSelect,
}: {
  components: Component[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {components.map((component) => (
        <ComponentItem
          key={component.id}
          component={component}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
});

// Memoize individual items
const ComponentItem = memo(function ComponentItem({
  component,
  onSelect,
}: {
  component: Component;
  onSelect: (id: string) => void;
}) {
  // Stable callback reference
  const handleSelect = useCallback(() => {
    onSelect(component.id);
  }, [component.id, onSelect]);

  return (
    <div onClick={handleSelect}>
      {component.type}
    </div>
  );
});
```

### Virtualization for Long Lists

```typescript
// For asset grids with 100+ items
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedAssetGrid({ assets }: { assets: Asset[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(assets.length / 4), // 4 columns
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated row height
    overscan: 2, // Render 2 extra rows
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * 4;
          const rowAssets = assets.slice(startIndex, startIndex + 4);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-4 gap-4"
            >
              {rowAssets.map((asset) => (
                <AssetGridItem key={asset.id} asset={asset} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### State Colocation

```typescript
// Bad - state at top level causes full re-render
function Editor() {
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null); // Causes re-render on hover!

  return (
    <Canvas selectedId={selectedId} hoveredId={hoveredId}>
      {/* All children re-render when hoveredId changes */}
    </Canvas>
  );
}

// Good - colocate hover state to component that needs it
function Editor() {
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  return (
    <Canvas selectedId={selectedId}>
      {/* Hover state managed inside each block */}
    </Canvas>
  );
}

function Block({ id }: { id: string }) {
  const [isHovered, setIsHovered] = useState(false);
  // Only this block re-renders on hover
}
```

### Debounce Expensive Operations

```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('');

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebouncedCallback(
    (query: string) => onSearch(query),
    300
  );

  return (
    <Input
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}

// For auto-save, use longer debounce
const debouncedSave = useDebouncedCallback(
  (content: PageContent) => saveContent(content),
  1000 // 1 second debounce
);
```

---

## 8. Database Query Optimization

### Efficient Prisma Queries

```typescript
// Bad - fetches all fields, no pagination
const sites = await prisma.site.findMany({
  where: { userId },
  include: { pages: true },
});

// Good - select only needed fields, paginate
const sites = await prisma.site.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    slug: true,
    publishedAt: true,
    updatedAt: true,
    pages: {
      where: { isHomepage: true },
      select: { id: true, slug: true },
      take: 1,
    },
  },
  take: 20,
  skip: page * 20,
  orderBy: { updatedAt: 'desc' },
});
```

### N+1 Query Prevention

```typescript
// Bad - N+1 queries
const pages = await prisma.page.findMany({ where: { siteId } });
for (const page of pages) {
  page.components = await prisma.component.findMany({
    where: { pageId: page.id },
  });
}

// Good - single query with include
const pages = await prisma.page.findMany({
  where: { siteId },
  include: {
    components: {
      orderBy: { order: 'asc' },
    },
  },
});
```

### Database Indexes

Add to Prisma schema:

```prisma
model Site {
  id          String    @id @default(cuid())
  slug        String    @unique
  userId      String
  publishedAt DateTime?

  // Composite index for common queries
  @@index([userId, updatedAt])
  @@index([slug, publishedAt])
}

model Page {
  id          String    @id @default(cuid())
  siteId      String
  slug        String
  publishedAt DateTime?

  @@index([siteId, slug])
  @@index([siteId, isHomepage])
}

model Asset {
  id        String   @id @default(cuid())
  siteId    String
  createdAt DateTime @default(now())

  @@index([siteId, createdAt])
}
```

---

## 9. Network Optimization

### Prefetching Critical Resources

```typescript
// In layout or page head
import { preload } from 'react-dom';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Preload critical fonts
  preload('/fonts/inter-var.woff2', { as: 'font', crossOrigin: 'anonymous' });

  return (
    <html>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://storage.example.com" />

        {/* Preconnect to API */}
        <link rel="preconnect" href="https://api.example.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Route Prefetching

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Next.js Link automatically prefetches on hover/viewport
<Link href="/editor" prefetch={true}>
  Edit Portfolio
</Link>

// Manual prefetch for anticipated navigation
function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch editor route when dashboard loads
    router.prefetch('/editor');
  }, [router]);

  return (/* ... */);
}
```

### Request Batching

```typescript
// Batch multiple API calls
async function fetchDashboardData(userId: string) {
  const [sites, recentActivity, stats] = await Promise.all([
    fetch(`/api/sites`).then(r => r.json()),
    fetch(`/api/activity`).then(r => r.json()),
    fetch(`/api/stats`).then(r => r.json()),
  ]);

  return { sites, recentActivity, stats };
}
```

---

## 10. Performance Monitoring

### Setup Web Vitals Tracking

Create `src/lib/analytics.ts`:

```typescript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

type MetricName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  console.log(`[Performance] ${metric.name}: ${metric.value} (${metric.rating})`);

  // Example: send to custom endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      JSON.stringify({
        type: 'web-vital',
        ...metric,
        url: window.location.href,
        timestamp: Date.now(),
      })
    );
  }
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getFCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### Performance Observer

```typescript
// Track long tasks
export function observeLongTasks() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) {
        console.warn(`[Long Task] ${entry.duration}ms`, entry);
      }
    }
  });

  observer.observe({ entryTypes: ['longtask'] });
}

// Track layout shifts
export function observeLayoutShifts() {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntry[]) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });

  // Report final CLS on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      console.log(`[CLS] Final value: ${clsValue}`);
    }
  });
}
```

### Performance Budget CI Check

Create `.github/workflows/performance.yml`:

```yaml
name: Performance Budget

on:
  pull_request:
    branches: [main]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          # Check main bundle size
          MAIN_SIZE=$(stat -f%z .next/static/chunks/main-*.js 2>/dev/null || stat -c%s .next/static/chunks/main-*.js)
          MAX_SIZE=153600 # 150KB

          if [ "$MAIN_SIZE" -gt "$MAX_SIZE" ]; then
            echo "Bundle size ($MAIN_SIZE bytes) exceeds budget ($MAX_SIZE bytes)"
            exit 1
          fi

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/login"],
      "startServerCommand": "npm run start",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

---

## File Structure

```
src/
├── lib/
│   ├── dynamic.ts              # Dynamic imports
│   ├── cache.ts                # Server-side caching
│   ├── queryClient.ts          # React Query config
│   └── analytics.ts            # Web vitals tracking
├── hooks/
│   └── useLazyLoad.ts          # Intersection observer
├── components/
│   └── ui/
│       ├── LazyLoad.tsx        # Lazy load wrapper
│       └── OptimizedImage.tsx  # Image optimization
├── middleware.ts               # Cache headers
├── next.config.js              # Image, bundle config
└── lighthouserc.json           # Performance budgets
```

---

## Deliverables Checklist

- [ ] Bundle analyzer configured and run
- [ ] Code splitting for editor components
- [ ] Dynamic imports for heavy libraries (dnd-kit, Tiptap)
- [ ] Lazy loading for below-fold content
- [ ] Next.js Image optimization configured
- [ ] Blur placeholders for images
- [ ] Browser cache headers configured
- [ ] API response caching implemented
- [ ] React Query caching configured
- [ ] Memoization for expensive renders
- [ ] Virtualization for long lists
- [ ] Database indexes added
- [ ] Prisma queries optimized
- [ ] Route prefetching implemented
- [ ] Web vitals tracking setup
- [ ] Performance budget CI checks
- [ ] Lighthouse CI configured

---

## Testing Checklist

### Bundle Size
1. Run `npm run analyze`
2. Verify no unexpected large chunks
3. Confirm editor bundle loads only on editor routes
4. Check for duplicate dependencies

### Loading Performance
1. Test landing page < 1.5s LCP
2. Test public portfolio < 2.0s LCP
3. Test editor < 3.0s LCP
4. Verify images lazy load correctly

### Runtime Performance
1. Test drag-and-drop at 60fps
2. Test text editing responsiveness
3. Test gallery scroll performance
4. Profile React DevTools for re-renders

### Caching
1. Verify static assets cached (check headers)
2. Test public pages cache and revalidate
3. Confirm cache invalidation on publish

### Monitoring
1. Web vitals reporting to analytics
2. Lighthouse CI passing on PRs
3. Long task observer catching issues

---

## Success Criteria

From user-success-scenarios.md:

- **Landing page**: First impression loads fast (< 1.5s)
- **Editor**: Responsive even with many components
- **Public portfolio**: Loads fast for potential clients viewing
- **Mobile**: Performance matches desktop on 4G connection
- **Images**: High-resolution images load progressively
