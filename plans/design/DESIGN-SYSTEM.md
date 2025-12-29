# Design System Foundation

**Purpose:** Core design tokens and specifications for all templates and themes  
**Status:** Finalized based on customer feedback  
**Last Updated:** 2025-12-28

---

## Design Principles

Based on customer interview and reference sites:

1. **Photos are the star** - Design frames work, never competes
2. **Approachable and clean** - Not overwhelming, clear hierarchy
3. **Meticulous typography** - Consistent, intentional, never arbitrary
4. **Organized, not scrolling** - Strategic grouping, not endless scroll
5. **Mobile-first** - Touch-friendly, fast, reliable

**Reference sites analyzed:**
- maddievare.com (customer's favorite landing page)
- nmhartistry.com (meticulous organization)
- mackenzie-hues.com (clean, scrolling images)

---

## Typography System

### Type Scale (Base: 1.25 Ratio - Major Third)

**Used by:** Modern Minimal and Bold Editorial themes

```css
--font-size-display: 3rem;      /* 48px - Hero names, big statements */
--font-size-h1: 2.375rem;       /* 38px - Page titles */
--font-size-h2: 1.875rem;       /* 30px - Section headers */
--font-size-h3: 1.5rem;         /* 24px - Card titles, subsections */
--font-size-h4: 1.1875rem;      /* 19px - Metadata labels */
--font-size-body: 1rem;         /* 16px - Base text */
--font-size-small: 0.8125rem;   /* 13px - Captions, fine print */
--font-size-tiny: 0.625rem;     /* 10px - Labels (use sparingly) */
```

**Rationale:** Balanced hierarchy without dramatic jumps. Professional, readable, contemporary.

### Font Families

**Editorial Pairing (Default):**
- Heading: `Playfair Display` (serif, elegant, editorial)
- Body: `Inter` (sans-serif, readable, modern)
- Use: Modern Minimal, Classic Elegant themes

**Contemporary Pairing:**
- Heading: `Sora` (sans-serif, geometric, warm)
- Body: `Geist Sans` (sans-serif, clean, technical)
- Use: Bold Editorial theme

**Implementation:**
```css
/* Next.js font loading */
import { Inter, Playfair_Display, Sora, Geist } from 'next/font/google';

/* CSS variables */
--font-heading: var(--font-playfair), serif;
--font-body: var(--font-inter), sans-serif;
```

### Line Heights

```css
--line-height-display: 1.1;   /* Tight for impact */
--line-height-heading: 1.2;   /* Comfortable for headlines */
--line-height-body: 1.5;      /* Optimal reading */
--line-height-small: 1.4;     /* Metadata, captions */
```

### Font Weights

```css
--font-weight-light: 300;     /* Rarely used */
--font-weight-regular: 400;   /* Body text default */
--font-weight-medium: 500;    /* UI labels, emphasis */
--font-weight-semibold: 600;  /* Buttons, strong emphasis */
--font-weight-bold: 700;      /* Headings */
```

**Constraint:** Never use weights <400 on mobile (readability).

---

## Color System

### Semantic Roles (All Themes Provide)

```css
/* Backgrounds */
--color-background      /* Main page background */
--color-surface         /* Cards, elevated surfaces */

/* Text */
--color-text-primary    /* Main content (≥4.5:1 contrast) */
--color-text-secondary  /* Supporting text (≥4.5:1 contrast) */
--color-text-tertiary   /* De-emphasized (≥4.5:1 contrast) */

/* Interactive */
--color-accent          /* Primary interactive color */
--color-accent-hover    /* Hover/active state */
--color-accent-hsl      /* For hsla() with opacity */

/* Structure */
--color-border          /* Subtle dividers */
--color-border-strong   /* Emphasized dividers */
```

### Theme Palettes

**Modern Minimal (Default):**
- Cool neutrals (white, gray, blue)
- Professional, approachable, safe
- See: themes/modern-minimal.md

**Classic Elegant:**
- Warm neutrals (cream, brown, terracotta)
- Sophisticated, traditional, established
- See: themes/classic-elegant.md

**Bold Editorial:**
- High contrast (black, white, hot pink)
- Dramatic, contemporary, fashion-forward
- See: themes/bold-editorial.md

---

## Spacing System

### 8px Base Grid

```css
--space-1: 0.25rem;   /* 4px  - Tight grouping */
--space-2: 0.5rem;    /* 8px  - Related elements */
--space-3: 0.75rem;   /* 12px - Component padding */
--space-4: 1rem;      /* 16px - Small gaps, grid gaps */
--space-5: 1.5rem;    /* 24px - Medium gaps */
--space-6: 2rem;      /* 32px - Large gaps */
--space-8: 3rem;      /* 48px - Section spacing */
--space-10: 4rem;     /* 64px - Major sections */
--space-12: 6rem;     /* 96px - Hero spacing */
--space-16: 8rem;     /* 128px - Dramatic spacing (rare) */
```

**Usage:**
- Component padding: space-3, space-4
- Grid gaps: space-4, space-5
- Section margins: space-8, space-10
- Hero sections: space-12

**Theme overrides:**
- Modern/Bold: Use base values
- Classic: Increases space-5 through space-10 (more generous)

### Layout Constraints

```css
--max-content-width: 1200px;   /* Prevents ultra-wide layouts */
--max-text-width: 65ch;        /* Optimal reading line length */
--mobile-padding: 16px;        /* Screen edge padding mobile */
--desktop-padding: 24px;       /* Screen edge padding desktop */
```

### Touch Targets

```css
--touch-min: 44px;        /* Apple HIG minimum */
--touch-comfortable: 48px; /* Android Material standard */
```

**Rule:** ALL interactive elements ≥ 44px in smallest dimension on mobile.

---

## Motion & Animation

### Timing Functions (Easing Curves)

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);      /* General transitions */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful (use sparingly) */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Exits, dismissals */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Entrances, reveals */
```

### Duration Guidelines

```css
--duration-instant: 100ms;     /* Hover feedback */
--duration-quick: 150ms;       /* Button press */
--duration-standard: 250ms;    /* Card hover, transitions */
--duration-deliberate: 400ms;  /* Modal open, page transitions */
```

**Usage:**
- Hover states: 100-150ms (instant feedback)
- Overlays: 200-250ms (smooth, noticeable)
- Modals/lightbox: 300-400ms (deliberate)
- Page transitions: 400ms max (don't delay user)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Accessibility requirement:** Respect user preferences.

---

## Component Specifications

### Button

**Sizes:**
- Default: min-height 44px, padding 12px 24px
- Small: min-height 36px, padding 8px 16px

**Variants:**
- Primary: Accent background, white text
- Secondary: Transparent bg, accent border + text
- Ghost: Transparent bg, text color only

**States:** Default, Hover, Active, Focus, Disabled  
**Full spec:** components/button.md (to be created)

---

### Image Card (Hover Overlay)

**Key component for featured work and galleries**

**Desktop:** Clean image, hover reveals title/metadata overlay  
**Mobile:** Image with title below (no hover)

**Full spec:** components/image-card-hover-overlay.md ✅

---

### Gallery Grid

**Responsive grid (4/3/2 columns)**

**Organized, not scrolling** (customer feedback)  
**Pagination after 20 images**

**Full spec:** components/gallery-grid.md ✅

---

### Navigation

**Dynamic, adapts to user's categories**

**Desktop:** Sticky header with category links  
**Mobile:** Hamburger menu, slide-in panel

**Full spec:** components/navigation.md ✅

---

## Responsive Breakpoints

```css
/* Mobile-first approach */
Mobile:       < 640px   (1-2 columns, touch-optimized)
Tablet:       640-1024px (2-3 columns, hybrid)
Desktop:      > 1024px   (3-4 columns, hover states)
Large Desktop: > 1440px  (max-width constraints apply)
```

**Content adaptation:**
- Mobile: Single column, titles below images, larger touch targets
- Tablet: 2-3 columns, hybrid hover/touch
- Desktop: 3-4 columns, hover overlays, generous spacing

---

## Accessibility Requirements

### Contrast Ratios

**Text:**
- Normal text: ≥ 4.5:1 (WCAG AA)
- Large text (≥18px): ≥ 3:1
- Target: 7:1 for AAA when possible

**UI Components:**
- Interactive elements: ≥ 3:1
- Focus indicators: ≥ 3:1
- Borders (meaningful): ≥ 3:1

### Touch Targets

```
Minimum: 44px × 44px (smallest dimension)
Comfortable: 48px × 48px (preferred)
Spacing: 8px minimum between adjacent targets
```

### Keyboard Navigation

- All interactive elements focusable
- Tab order logical (left-to-right, top-to-bottom)
- Enter/Space activate buttons and links
- Escape closes modals/overlays
- Arrow keys navigate carousels/galleries

### Screen Reader

- Semantic HTML (header, nav, main, footer, article, section)
- Alt text for all images (required, not optional)
- ARIA labels for icon buttons
- State changes announced (aria-live regions)

---

## Performance Targets

**Landing page (critical first impression):**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

**Image optimization:**
- WebP format with JPEG fallback
- Responsive images (srcset)
- Sizes generated:
  - Display: 1920px max width
  - Thumbnail: 400x300px
  - Placeholder: 40px blur hash
- Target: 60-80% size reduction

**Bundle sizes:**
- JavaScript: < 200KB (gzipped)
- CSS: < 50KB (gzipped)
- Total page weight: < 1MB with images

---

## Implementation Checklist

After implementing any component, validate:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Follows spacing system (8px grid multiples)
- [ ] Typography from type scale
- [ ] Colors from theme palette
- [ ] Contrast ratios meet WCAG AA
- [ ] Touch targets ≥ 44px on mobile
- [ ] Focus indicators visible
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Respects reduced motion
- [ ] Tested on real iPhone/Android
- [ ] Works with all themes (Modern, Classic, Bold)

---

## Template System Integration

**Design system provides:**
- Base tokens (colors, typography, spacing)
- Component specifications
- Responsive patterns
- Accessibility requirements

**Templates use design system for:**
- Layout structure (spacing values)
- Component assembly (buttons, cards, grids)
- Responsive behavior (breakpoints, patterns)

**Themes override design system:**
- Color palettes
- Typography scale (Classic has larger)
- Spacing values (Classic has more generous)
- Font families (Bold uses sans-serif)

**Flow:**
```
Design System (foundation)
    ↓
Templates (structure using design system)
    ↓
Themes (visual styling overrides)
    ↓
User Content (fills template slots)
    ↓
Published Site
```

---

## File References

**Core specifications:**
- CONTENT-MODEL.md - How content is structured
- TEMPLATE-SYSTEM.md - How templates and themes combine
- AESTHETIC-GUIDE.md - Visual principles from customer feedback

**Templates:**
- templates/featured-grid-landing.md - Grid of featured work (Phase 1)
- templates/clean-minimal.md - Minimal landing (Phase 2)

**Themes:**
- themes/modern-minimal.md - Default (neutral, professional)
- themes/classic-elegant.md - Warm, sophisticated, larger scale
- themes/bold-editorial.md - Dark, contemporary, sans-serif

**Components:**
- components/image-card-hover-overlay.md - Key component
- components/gallery-grid.md - Project galleries
- components/navigation.md - Dynamic category nav

---

## For Developers

**This design system is:**
- ✅ Complete (all tokens defined)
- ✅ Validated (contrast ratios checked)
- ✅ Responsive (mobile-first approach)
- ✅ Accessible (WCAG AA compliant)
- ✅ Performance-optimized (< 2.5s LCP target)

**Implementation approach:**
1. Implement design tokens in globals.css (Slice 1)
2. Build base components using tokens (Slices 2-4)
3. Implement Featured Grid template (Slices 5-6)
4. Add theme swapping UI (Slice 7)
5. Phase 2: Additional templates (Clean Minimal, Hero Carousel)

**Questions during implementation:**
- Reference component specs for exact styling
- Check template specs for layout structure
- Validate against accessibility checklist
- Test with all themes (Modern, Classic, Bold)

---

**See HANDOFF-TO-TECH.md for integration with slice plans.**
