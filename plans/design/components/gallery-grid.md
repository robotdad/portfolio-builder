# Component: Gallery Grid

**Purpose:** Display multiple images in organized grid (not endless scroll)  
**Customer feedback:** "Pages with all images in long scroll felt amateur"  
**Used in:** Project detail pages, category pages

---

## Visual Specification

### Grid Layout

```
Desktop (>1024px):
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ 4  │  ← 4 columns
└────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 5  │ │ 6  │ │ 7  │ │ 8  │
└────┘ └────┘ └────┘ └────┘

Tablet (640-1024px):
┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │  ← 3 columns
└────┘ └────┘ └────┘

Mobile (<640px):
┌────┐ ┌────┐
│ 1  │ │ 2  │  ← 2 columns
└────┘ └────┘
```

**Grid specifications:**
```css
.gallery-grid {
  display: grid;
  gap: var(--space-4);  /* 16px */
  width: 100%;
}

/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Tablet: 3 columns */
@media (min-width: 640px) and (max-width: 1023px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile: 2 columns */
@media (max-width: 639px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Grid Items

### Default State

```css
.gallery-item {
  position: relative;
  aspect-ratio: 3/2;  /* Consistent across all images */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-surface);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 200ms var(--ease-smooth);
}
```

### Hover State (Desktop)

```css
.gallery-item:hover img {
  transform: scale(1.08);
}

.gallery-item:hover .expand-icon {
  opacity: 1;
}

/* Expand icon (optional) */
.expand-icon {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 32px;
  height: 32px;
  background: hsla(0, 0%, 100%, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 200ms var(--ease-smooth);
}
```

**Caption display (optional):**
- If image has caption, show on hover (bottom overlay)
- OR show in lightbox only
- Customer did not specify preference (decide in implementation)

---

## Click Behavior: Lightbox

**When user clicks image:**
1. Lightbox opens (full-screen overlay)
2. Image shown at maximum size (maintains aspect ratio)
3. Caption visible (if provided)
4. Previous/Next navigation
5. Close button (X icon + Escape key)

**Lightbox structure:**
```
┌──────────────────────────────────────┐
│  [X]                                 │  ← Close button
│                                      │
│        ┌─────────────────────┐       │
│        │                     │       │
│        │   Image (large)     │       │  ← Centered
│        │                     │       │
│        └─────────────────────┘       │
│                                      │
│   Caption text here (optional)       │  ← Below image
│                                      │
│        [← Prev]    [Next →]          │  ← Navigation
└──────────────────────────────────────┘
```

**Lightbox specifications:**
```css
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
}

.lightbox-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
}

.lightbox-caption {
  color: white;
  font-size: var(--font-size-body);
  margin-top: var(--space-4);
  max-width: 600px;
  text-align: center;
}

.lightbox-nav {
  position: absolute;
  bottom: var(--space-6);
  display: flex;
  gap: var(--space-4);
}
```

**Keyboard controls:**
- Escape: Close lightbox
- Arrow Left: Previous image
- Arrow Right: Next image
- Tab: Navigate to Prev/Next/Close buttons

---

## Pagination

**When gallery has >20 images:**

```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ 4  │
└────┘ └────┘ └────┘ └────┘
  ... (16 more images)
┌────┐ ┌────┐ ┌────┐ ┌────┐
│17  │ │18  │ │19  │ │20  │
└────┘ └────┘ └────┘ └────┘

    [Load More]  ← Button loads next 20
```

**Pagination strategy:**
- Initial load: First 20 images
- "Load More" button: Next 20 images
- Append to grid (preserve scroll position)
- Infinite scroll alternative (Phase 2)

**Why paginate:**
- Performance (loading 100 images at once is slow)
- Mobile data usage (theatre WiFi is poor)
- Perceived performance (fast initial render)

---

## Empty States

**No images in gallery:**
```
┌──────────────────────────────┐
│                              │
│          📸                   │  ← Icon
│   No images yet              │  ← H3
│   Upload photos to showcase  │  ← Body text
│   your work                  │
│                              │
│   [Upload Images]            │  ← CTA button
└──────────────────────────────┘
```

---

## Content Flexibility

**Works with:**
- 1 image: Grid with one item (not broken)
- 2-3 images: Partial row (not awkward)
- 4-20 images: Complete grid (no pagination)
- 21-100 images: Paginated grid
- Mixed aspect ratios: Crops to 3:2 for grid consistency

**Handles optional metadata:**
- Images with captions: Show in lightbox
- Images without captions: Lightbox shows image only
- Mix of both: Some have captions, some don't (graceful)

---

## Mobile Considerations

**Touch interactions:**
- Tap image → Open lightbox (no hover needed)
- Swipe in lightbox → Next/previous image
- Pinch-to-zoom in lightbox → Zoom image
- Tap outside lightbox → Close

**Performance:**
- Smaller images on mobile (600px width max)
- Lazy-load more aggressively (only load visible rows)
- Intersection Observer for visibility detection

---

## Accessibility

**Screen reader:**
```html
<div class="gallery-grid" role="list" aria-label="Project image gallery">
  <button 
    role="listitem"
    aria-label="View image 1 of 8: Elizabethan court costumes"
    onClick={openLightbox}
  >
    <img src="..." alt="Elizabethan court costumes for Hamlet" />
  </button>
</div>
```

**Lightbox accessibility:**
- Focus trap (can't tab outside lightbox while open)
- Focus returns to trigger image when closed
- Escape key closes (standard behavior)
- Announce to screen reader: "Viewing image 3 of 8"

---

## Theme Integration

**Theme controls:**
- Border color (if borders shown)
- Loading state background color
- Empty state text colors

**Theme does NOT control:**
- Grid columns (responsive layout constant)
- Aspect ratio (3:2 for consistency)
- Spacing between items (design system token)
- Lightbox overlay opacity (constant for readability)

---

## Implementation Notes

**For Slice 6 (Image Gallery Component):**

This component needs:
- Responsive grid CSS (media queries)
- Lightbox component (overlay, navigation, keyboard)
- Lazy loading (Intersection Observer)
- Pagination logic (if >20 images)
- Image optimization (Sharp.js processing)

**Dependencies:**
- Image optimization pipeline (Slice 3)
- Responsive design patterns (Slice 4)
- Navigation state management (Slice 7)

**Estimate:** ~400 lines (grid + lightbox + pagination)

---

**Next: Navigation component...**
