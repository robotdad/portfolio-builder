# Component: Image Card with Hover Overlay

**Purpose:** Display project preview with clean image + context on interaction  
**Customer feedback:** "I liked pages where image cards had details displayed as text overlay on hover"  
**Used in:** All templates (Featured Grid, Clean Minimal, Hero Carousel)

---

## Visual Specification

### Default State (Desktop & Mobile)

```
┌──────────────────────┐
│                      │
│                      │
│      Image           │  ← Clean, no overlay
│    (4:3 ratio)       │
│                      │
│                      │
└──────────────────────┘
```

**Styling:**
```css
.image-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-surface);  /* Placeholder while loading */
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 200ms var(--ease-smooth);
}
```

---

### Hover State (Desktop Only)

```
┌──────────────────────┐
│    ▒▒▒▒▒▒▒▒▒▒▒▒     │  ← Dark overlay (40% opacity)
│    ▒▒▒▒▒▒▒▒▒▒▒▒     │
│    ▒ Hamlet 2024 ▒   │  ← Project title (white, H3)
│    ▒ Shakespeare  ▒   │  ← Metadata (white, small)
│    ▒ Theatre      ▒   │
│    ▒▒▒▒▒▒▒▒▒▒▒▒     │
└──────────────────────┘
         ↑ Image scales slightly (1.05x)
```

**Hover behavior:**
```css
.image-card:hover img {
  transform: scale(1.05);
}

.image-card:hover .overlay {
  opacity: 1;
}

.overlay {
  position: absolute;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.4);
  opacity: 0;
  transition: opacity 250ms var(--ease-smooth);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  text-align: center;
}

.overlay-title {
  font-family: var(--font-heading);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: white;
  margin-bottom: var(--space-2);
  text-shadow: 0 2px 4px hsla(0, 0%, 0%, 0.3);  /* Ensure readability */
}

.overlay-metadata {
  font-family: var(--font-body);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: white;
  opacity: 0.95;
  text-shadow: 0 1px 2px hsla(0, 0%, 0%, 0.3);
}
```

**Metadata format:**
- If year + venue: "Shakespeare Theatre, 2024"
- If year only: "2024"
- If venue only: "Shakespeare Theatre"
- If neither: Omit metadata line

---

### Mobile/Touch Alternative

**Desktop uses hover, mobile shows title below:**

```
┌──────────────────────┐
│                      │
│      Image           │  ← Clean image (no overlay)
│    (4:3 ratio)       │
│                      │
└──────────────────────┘
  Hamlet 2024          ← Title (H4, below)
  Shakespeare Theatre  ← Metadata (small, secondary color)
```

**Mobile styling:**
```css
@media (hover: none) and (pointer: coarse) {
  /* Hide overlay on touch devices */
  .overlay {
    display: none;
  }
  
  /* Show info below image */
  .card-info {
    display: block;
    padding: var(--space-3) 0;
  }
  
  .card-info-title {
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-1);
  }
  
  .card-info-metadata {
    font-size: var(--font-size-small);
    color: var(--color-text-secondary);
  }
}
```

**Why different by device:**
- Touch doesn't support hover (no alternative interaction)
- Title below is standard mobile pattern (familiar)
- Always-visible title helps mobile users scan quickly

---

## Variants

### Grid Card (Featured Grid template)

**Size:**
- Desktop: 33% width (3 columns), aspect 4:3
- Tablet: 50% width (2 columns), aspect 4:3
- Mobile: 100% width (1 column), aspect 4:3

**Usage:**
```tsx
<ImageCard
  variant="grid"
  image="/portfolio/hamlet.jpg"
  alt="Hamlet production costumes"
  title="Hamlet 2024"
  metadata="Shakespeare Theatre"
  onClick={() => navigate('/projects/hamlet-2024')}
/>
```

---

### Full-Width Card (Clean Minimal template)

**Size:**
- All screens: Full container width (max 1200px)
- Aspect ratio: 16:9 (cinematic)
- Larger overlay text (H2 instead of H3)

**Usage:**
```tsx
<ImageCard
  variant="full-width"
  image="/portfolio/hamlet.jpg"
  alt="Hamlet production costumes"
  title="Hamlet 2024"
  metadata="Shakespeare Theatre"
  onClick={() => navigate('/projects/hamlet-2024')}
/>
```

---

### Carousel Slide (Hero Carousel template - Phase 2)

**Size:**
- Full viewport width/height option
- Aspect ratio: User's image aspect (preserve original)
- Larger overlay text (H1)

---

## Content Requirements

**Required:**
- `image`: Image URL (optimized)
- `alt`: Alt text (accessibility)
- `title`: Project title
- `onClick`: Navigation handler

**Optional:**
- `metadata`: Year, venue, or other context (omit if not provided)
- `caption`: For lightbox view (not shown on card)

**Works with minimal content:**
- Just image + title: Overlay shows title only
- No metadata: Overlay shows title centered, no subtitle

---

## Accessibility

**Keyboard navigation:**
```html
<button 
  class="image-card"
  role="link"
  aria-label="View Hamlet 2024 project details"
  onClick={handleClick}
>
  <img src="..." alt="Elizabethan court costumes" />
  <div class="overlay">...</div>
</button>
```

**Screen reader:**
- Card is semantic button or link
- Alt text describes image content
- Aria-label provides navigation context
- Overlay text is aria-hidden (redundant with aria-label)

**Focus state:**
- Visible focus ring (2px solid accent color)
- Focus shows overlay (same as hover)
- Keyboard activation (Enter/Space)

---

## Performance

**Image optimization:**
- Eager load: Above fold cards (first 6)
- Lazy load: Below fold cards
- Responsive images: srcset for different screen sizes
  - Mobile: 600px width
  - Tablet: 800px width
  - Desktop: 1200px width

**Loading states:**
```css
.image-card.loading {
  background: var(--color-border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

**Error state:**
```
┌──────────────────────┐
│         ⚠️           │
│  Image unavailable   │  ← Fallback UI
│   [Project Title]    │
└──────────────────────┘
```

---

## Interaction Details

**Hover timing:**
- Delay: 0ms (immediate feedback)
- Transition: 250ms (smooth but noticeable)
- Image scale: 1.05x (subtle zoom)
- Overlay fade: 0 → 1 opacity

**Click behavior:**
- Prevent default (if link)
- Navigate to project detail page
- Preserve scroll position for back navigation
- Loading state while navigating

**Touch behavior (mobile):**
- No hover effects
- Tap entire card area → Navigate
- Min touch target: 44px height (ensured by card min-height)

---

## Theme Integration

**Theme controls:**
- Overlay background: Always `hsla(0, 0%, 0%, 0.4)` (neutral, doesn't compete)
- Title color: Always white (readable on dark overlay)
- Metadata color: Always white with slight transparency

**Theme does NOT control:**
- Overlay opacity (design system constant)
- Text shadow (ensures readability)
- Hover transition timing (design system constant)

**Why:** Overlay needs high contrast regardless of theme. Theme controls page background/text, not overlay appearance.

---

## Validation Checklist

- [ ] Hover overlay appears on desktop
- [ ] Title + metadata visible below image on mobile
- [ ] Image scales subtly on hover (1.05x)
- [ ] Transition smooth (250ms)
- [ ] Works with just title (no metadata)
- [ ] Works with title + year only
- [ ] Works with title + venue only
- [ ] Works with title + year + venue
- [ ] Click navigates to project page
- [ ] Focus state visible (keyboard)
- [ ] Screen reader announces correctly
- [ ] Touch target ≥ 44px on mobile
- [ ] Lazy-loads images below fold
- [ ] Loading state shows during image load
- [ ] Error state handles missing images
- [ ] Works with all 3 themes (Modern, Classic, Bold)

---

**Next: Gallery Grid component...**
