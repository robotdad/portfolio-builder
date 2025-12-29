# Theme: Modern Minimal

**Personality:** Clean, professional, neutral - lets work shine  
**Best for:** Broad appeal, contemporary work, mobile-first users  
**Phase:** Phase 1 (Default theme)

---

## Color Palette

```css
/* Backgrounds - Cool Gallery (Updated from mockup session) */
--color-background: hsl(210, 15%, 97%);    /* Subtle blue-gray (museum walls) */
--color-surface: hsl(210, 12%, 95%);       /* Slightly darker cool gray */

/* Text */
--color-text-primary: hsl(0, 0%, 10%);     /* Near black - 21:1 contrast */
--color-text-secondary: hsl(0, 0%, 40%);   /* Medium gray - 6.5:1 contrast */
--color-text-tertiary: hsl(0, 0%, 60%);    /* Light gray - 4.5:1 contrast */

/* Accent */
--color-accent: hsl(220, 90%, 56%);        /* Vibrant blue - 4.8:1 contrast */
--color-accent-hover: hsl(220, 90%, 48%);  /* Darker blue - 6.3:1 contrast */

/* Borders */
--color-border: hsl(0, 0%, 90%);           /* Light gray */
--color-border-strong: hsl(0, 0%, 70%);    /* Medium gray */
```

**Contrast ratios:** All meet WCAG AA (4.5:1 text, 3:1 UI)

---

## Typography

**Font families:**
```css
--font-heading: 'Playfair Display', serif;  /* Editorial, elegant */
--font-body: 'Inter', sans-serif;            /* Clean, readable */
```

**Type scale:** 1.25 ratio (Major Third)
```css
--font-size-display: 3rem;      /* 48px */
--font-size-h1: 2.375rem;       /* 38px */
--font-size-h2: 1.875rem;       /* 30px */
--font-size-h3: 1.5rem;         /* 24px */
--font-size-h4: 1.1875rem;      /* 19px */
--font-size-body: 1rem;         /* 16px */
--font-size-small: 0.8125rem;   /* 13px */
```

**Line heights:**
```css
--line-height-display: 1.1;
--line-height-heading: 1.2;
--line-height-body: 1.5;
```

---

## Spacing

**Uses base 8px grid (no overrides):**
```css
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
```

---

## Visual Characteristics

**Mood:** Neutral, professional, approachable  
**Personality:** Safe, clean, organized  
**Signals:** Contemporary without being trendy

**When to use:**
- Default choice (80% of users)
- Broad professional contexts
- When user wants work to speak for itself
- Mobile-first priority (Sarah's use case)

---

## Example Screenshots from Spike

**Landing page:** White background, blue accent buttons, serif headlines  
**Cards:** Clean images with blue-tinted hover overlays  
**Navigation:** Minimal, professional

---

**Implementation:** Already in globals.css as `:root` defaults
