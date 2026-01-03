# Public Site Polish

**Goal:** Published portfolio has professional empty states, loading states, and error handling for launch readiness.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/AESTHETIC-GUIDE.md

## Scope

**Included**:
- Empty state for homepage with no featured projects
- Empty state for category with no projects
- Empty state for project with no gallery images
- Loading states (skeleton screens) for all pages
- Error handling for missing images (fallback placeholder)
- 404 page for invalid portfolio/category/project slugs
- Helpful messaging for all empty states
- Mobile-optimized empty states
- Proper spacing and visual hierarchy in empty states
- Blur-up image loading technique
- Progressive enhancement for slow connections

**NOT Included**:
- Admin empty states (separate concern)
- Contact forms or error reporting
- Analytics or monitoring
- A/B testing infrastructure
- Performance monitoring beyond basic metrics
- Custom error pages beyond 404

## Tech Stack
- React components for empty states
- Next.js Image component with blur placeholders
- CSS skeleton screens
- next/image error handling
- Custom 404 page component
- Suspense boundaries for loading states

## Key Files
```
src/components/portfolio/EmptyState.tsx          # Reusable empty state component
src/components/portfolio/SkeletonCard.tsx        # Skeleton loading card
src/components/portfolio/SkeletonGrid.tsx        # Skeleton grid layout
src/components/portfolio/ImageFallback.tsx       # Broken image placeholder
src/app/not-found.tsx                            # 404 page
src/app/[slug]/not-found.tsx                     # Portfolio not found
src/app/[slug]/[categorySlug]/not-found.tsx      # Category not found
src/app/globals.css                              # Skeleton animation styles
```

## UI Design

### Empty State: No Featured Projects (Homepage)

```
┌──────────────────────────────────────────────┐
│                                              │
│  Sarah Chen                                  │
│  Theatre Costume Designer                    │
│  [Download Resume]                           │
│                                              │
│  Featured Work                               │
│                                              │
│         📂                                   │
│                                              │
│    No featured projects yet                  │
│                                              │
│    Mark projects as featured in the          │
│    admin panel to showcase them here         │
│                                              │
└──────────────────────────────────────────────┘
```

**Characteristics:**
- Centered icon (folder or image icon)
- Clear message (what's missing)
- Helpful guidance (how to fix)
- Muted colors (doesn't dominate)
- Proper spacing (maintains page rhythm)

### Empty State: Category With No Projects

```
┌──────────────────────────────────────────────┐
│  Theatre                                     │
│                                              │
│         📁                                   │
│                                              │
│    No projects in Theatre yet                │
│                                              │
│    Add projects in the admin panel           │
│    to showcase your Theatre work             │
│                                              │
└──────────────────────────────────────────────┘
```

### Empty State: Project With No Gallery Images

```
┌──────────────────────────────────────────────┐
│  Hamlet 2024                                 │
│  Royal Shakespeare Theatre · 2024            │
│                                              │
│  [Description text if provided]              │
│                                              │
│  Gallery                                     │
│                                              │
│         🖼️                                   │
│                                              │
│    No images in this gallery yet             │
│                                              │
└──────────────────────────────────────────────┘
```

### Loading State: Featured Work Grid

```
┌──────────────────────────────────────────────┐
│  Featured Work                               │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│        │
│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│        │
│  │▒▒▒▒▒▒  │  │▒▒▒▒    │  │▒▒▒▒▒▒  │        │
│  └────────┘  └────────┘  └────────┘        │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│  │▒▒▒▒▒▒▒▒│        │
│  │▒▒▒▒▒▒  │  │▒▒▒▒▒   │  │▒▒▒▒    │        │
│  └────────┘  └────────┘  └────────┘        │
└──────────────────────────────────────────────┘

Shimmer animation (left to right)
Maintains grid layout (prevents layout shift)
Shows 6 skeleton cards
```

### Image Error: Fallback Placeholder

```
┌────────────────────┐
│                    │
│    [Broken Icon]   │
│                    │
│  Image unavailable │
│                    │
└────────────────────┘

Maintains aspect ratio
Subtle border
Muted background
Small icon + text
```

### 404 Page: Portfolio Not Found

```
┌──────────────────────────────────────────────┐
│                                              │
│                  404                         │
│                                              │
│         Portfolio Not Found                  │
│                                              │
│    The portfolio you're looking for          │
│    doesn't exist or has been removed         │
│                                              │
│         [Return to Home]                     │
│                                              │
└──────────────────────────────────────────────┘
```

## Component Interfaces

### EmptyState Component

```typescript
interface EmptyStateProps {
  icon: 'folder' | 'image' | 'grid' | 'camera'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className || ''}`}>
      <EmptyStateIcon type={icon} />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <Link href={action.href} className="empty-state-action">
          {action.label}
        </Link>
      )}
    </div>
  )
}
```

### SkeletonCard Component

```typescript
interface SkeletonCardProps {
  aspectRatio?: '16/9' | '4/3' | '3/2'
  showText?: boolean
  className?: string
}

export function SkeletonCard({
  aspectRatio = '16/9',
  showText = true,
  className
}: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className || ''}`}>
      <div 
        className="skeleton-image"
        style={{ aspectRatio }}
      />
      {showText && (
        <>
          <div className="skeleton-text skeleton-text--title" />
          <div className="skeleton-text skeleton-text--subtitle" />
        </>
      )}
    </div>
  )
}
```

### ImageFallback Component

```typescript
interface ImageFallbackProps {
  aspectRatio?: string
  message?: string
}

export function ImageFallback({
  aspectRatio = '16/9',
  message = 'Image unavailable'
}: ImageFallbackProps) {
  return (
    <div className="image-fallback" style={{ aspectRatio }}>
      <svg className="fallback-icon" width="48" height="48">
        <path d="M21 15v4M21 9h.01M3 3h18v18H3z" />
      </svg>
      <p className="fallback-message">{message}</p>
    </div>
  )
}
```

## Empty State Messages

### Homepage - No Featured Projects

```tsx
<EmptyState
  icon="grid"
  title="No featured projects yet"
  message="Mark projects as featured in the admin panel to showcase them here"
/>
```

### Category - No Projects

```tsx
<EmptyState
  icon="folder"
  title={`No projects in ${category.name} yet`}
  message="Add projects in the admin panel to showcase your work in this category"
/>
```

### Project - No Gallery Images

```tsx
<EmptyState
  icon="image"
  title="No gallery images yet"
  message="Add images to showcase this project"
/>
```

### Project - No Description

```typescript
// Just omit the description section, don't show empty state
{project.description && (
  <div className="project-description">
    {project.description}
  </div>
)}
```

## Skeleton Screen Pattern

### Featured Work Skeleton

```tsx
export function FeaturedWorkSkeleton() {
  return (
    <section className="featured-work">
      <h2 className="skeleton-text skeleton-text--heading" />
      
      <div className="featured-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} aspectRatio="16/9" />
        ))}
      </div>
    </section>
  )
}

// Usage with Suspense
<Suspense fallback={<FeaturedWorkSkeleton />}>
  <FeaturedWork projects={featuredProjects} />
</Suspense>
```

### Category Grid Skeleton

```tsx
export function CategoryGridSkeleton() {
  return (
    <div className="project-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} aspectRatio="16/9" />
      ))}
    </div>
  )
}
```

## Image Error Handling

### Next.js Image with Fallback

```tsx
<Image
  src={imageUrl}
  alt={altText}
  fill
  className="project-image"
  onError={(e) => {
    // Replace with fallback
    e.currentTarget.src = '/images/fallback-placeholder.png'
  }}
/>

// Or use custom component
<ImageWithFallback
  src={imageUrl}
  alt={altText}
  fallback={<ImageFallback aspectRatio="16/9" />}
/>
```

## Skeleton Animation CSS

```css
/* Shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-image,
.skeleton-text {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: var(--radius-md);
}

.skeleton-image {
  width: 100%;
}

.skeleton-text {
  height: 1em;
  margin-bottom: var(--space-2);
}

.skeleton-text--title {
  width: 70%;
  height: 1.5em;
}

.skeleton-text--subtitle {
  width: 50%;
  height: 1em;
}

.skeleton-text--heading {
  width: 40%;
  height: 2em;
  margin-bottom: var(--space-6);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton-image,
  .skeleton-text {
    animation: none;
    background: var(--color-surface);
  }
}
```

## 404 Page Implementation

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Portfolio Not Found</h2>
        <p className="not-found-message">
          The portfolio you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/" className="not-found-action">
          Return to Home
        </Link>
      </div>
    </div>
  )
}

// src/app/[slug]/not-found.tsx (portfolio-specific)
export default function PortfolioNotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">Portfolio Not Found</h1>
        <p className="not-found-message">
          This portfolio doesn't exist or is no longer available.
        </p>
        <Link href="/" className="not-found-action">
          Browse Other Portfolios
        </Link>
      </div>
    </div>
  )
}
```

## Progressive Image Loading

### Blur-Up Technique

```tsx
<Image
  src={image.url}
  alt={image.altText}
  fill
  placeholder="blur"
  blurDataURL={image.placeholderUrl} // Generated during upload
  className="project-image"
/>
```

**Flow:**
1. Placeholder shown immediately (blur hash, ~20 bytes)
2. Small thumbnail loads (~5KB, fast)
3. Full image loads progressively
4. Smooth transition from blur to sharp

## Demo Script (30 seconds)
1. Visit homepage with NO featured projects - See empty state with helpful message
2. Add featured project in admin - Refresh homepage - Skeleton appears briefly
3. Featured work loads with shimmer animation
4. Visit category with no projects - See empty state
5. Visit project with no gallery - See gallery empty state (or omit section)
6. Delete an image from server - Broken image shows fallback placeholder
7. Visit invalid URL `/jane-doe/fake-category` - See 404 page
8. Resize to mobile - Empty states responsive
9. Enable slow 3G throttling - See skeleton screens during load
10. Disable JavaScript - Content still accessible (progressive enhancement)
11. Enable prefers-reduced-motion - Skeleton animation disabled
12. **Success**: Professional polish for all edge cases

## Success Criteria

### Empty States
- [ ] Homepage shows empty state when no featured projects
- [ ] Category pages show empty state when no projects
- [ ] Empty states have helpful icon (folder, image, grid)
- [ ] Empty states have clear title
- [ ] Empty states have guidance message
- [ ] Empty states maintain page layout (no layout shift)
- [ ] Empty states responsive on mobile
- [ ] Empty states use muted colors (not dominant)

### Loading States
- [ ] Featured work shows skeleton while loading
- [ ] Category grids show skeleton while loading
- [ ] Project galleries show skeleton while loading
- [ ] Skeleton cards maintain aspect ratios
- [ ] Skeleton animation smooth (shimmer effect)
- [ ] Skeleton count matches expected content (6 for featured, 12 for categories)
- [ ] No layout shift when content loads
- [ ] Reduced motion disables shimmer animation

### Error Handling
- [ ] Broken images show fallback placeholder
- [ ] Fallback maintains aspect ratio
- [ ] Fallback has subtle border and icon
- [ ] Missing portfolio shows 404 page
- [ ] Missing category shows 404 page
- [ ] Missing project shows 404 page
- [ ] 404 pages have helpful messaging
- [ ] 404 pages offer navigation back
- [ ] Image loading errors don't crash page

### Design Requirements
- [ ] Empty states centered vertically and horizontally
- [ ] Icons 48px, muted color
- [ ] Title uses h3, semibold
- [ ] Message uses body text, muted color
- [ ] Spacing maintains rhythm (--space-6, --space-8)
- [ ] Skeleton cards match real card dimensions
- [ ] Shimmer animation subtle (not distracting)
- [ ] Fallback background muted (--color-surface)
- [ ] 404 page visually distinct from content pages

### Accessibility Requirements
- [ ] Empty state messages announced to screen readers
- [ ] Skeleton screens have aria-label="Loading"
- [ ] Loading states have role="status"
- [ ] Error messages have role="alert"
- [ ] 404 page has proper heading hierarchy
- [ ] Focus management on error pages
- [ ] Reduced motion respected for animations

### Mobile Requirements
- [ ] Empty states stack vertically on mobile
- [ ] Icons scale appropriately
- [ ] Messages readable (16px minimum)
- [ ] Touch targets for action links (44px)
- [ ] Skeleton screens responsive
- [ ] No horizontal scroll on any empty state

### Performance Requirements
- [ ] Skeleton screens render instantly (<100ms)
- [ ] Blur-up placeholders < 1KB
- [ ] Fallback images optimized and cached
- [ ] Empty states don't require network requests
- [ ] 404 pages lightweight (<10KB)

## Pattern Reference

### Empty State Pattern

```typescript
// Existing pattern from admin
// CategoryList has empty state at lines 609-625

<div className="empty-state">
  <svg className="empty-state-icon" width="48" height="48">
    <path d="..." />
  </svg>
  <h3 className="empty-state-title">No categories yet</h3>
  <p className="empty-state-message">
    Create categories to organize your projects
  </p>
  <button onClick={onCreateClick}>
    Create First Category
  </button>
</div>
```

Adapt this pattern for public site (remove admin-specific buttons).

### Loading Pattern

```typescript
// Show skeleton during data fetch
{isLoading ? (
  <FeaturedWorkSkeleton />
) : (
  <FeaturedWork projects={projects} />
)}

// Or use Suspense
<Suspense fallback={<FeaturedWorkSkeleton />}>
  <AsyncFeaturedWork />
</Suspense>
```

## CSS Patterns

### Empty State Styling

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
  min-height: 400px;
  text-align: center;
}

.empty-state-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
  color: var(--color-text-muted);
  opacity: 0.6;
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-3) 0;
}

.empty-state-message {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  max-width: 480px;
  margin: 0;
  line-height: var(--leading-relaxed);
}
```

### Skeleton Styling

```css
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-image {
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--card-radius);
}

.skeleton-text {
  height: 1em;
  background: var(--color-surface);
  border-radius: 4px;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Image Fallback Styling

```css
.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--card-radius);
  padding: var(--space-6);
}

.fallback-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-muted);
  opacity: 0.4;
  margin-bottom: var(--space-2);
}

.fallback-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}
```

## Integration Points

These elements are designed to be extended:
- **EmptyState** - Reusable for admin and public empty states
- **SkeletonCard** - Adaptable aspect ratios and text patterns
- **ImageFallback** - Reusable anywhere images might break
- **Shimmer animation** - Reusable for other loading states

## Effort Estimate

**Total: 8-12 hours**
- EmptyState component: 1-2 hours
- SkeletonCard component: 1-2 hours
- ImageFallback component: 1 hour
- 404 pages (3 variants): 2-3 hours
- Integration with existing pages: 2-3 hours
- CSS animations and styling: 1-2 hours
- Testing and polish: 1-2 hours
