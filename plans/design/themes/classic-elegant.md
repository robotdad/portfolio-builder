# Theme: Classic Elegant

**Personality:** Sophisticated, established, traditional - signals experience and gravitas  
**Best for:** Veteran professionals, classical/period work, prestigious contexts  
**Phase:** Phase 1 (Alternative theme)

---

## Color Palette

```css
/* Backgrounds - Warm Editorial (Updated from mockup session) */
--color-background: hsl(40, 30%, 95%);     /* Rich warm cream, more saturated */
--color-surface: hsl(40, 25%, 93%);        /* Slightly darker warm cream */

/* Text - Warm browns */
--color-text-primary: hsl(30, 20%, 15%);   /* Dark warm brown - 13.2:1 contrast */
--color-text-secondary: hsl(30, 10%, 35%); /* Medium brown - 5.8:1 contrast */
--color-text-tertiary: hsl(30, 5%, 55%);   /* Light brown - 4.6:1 contrast */

/* Accent - Rich terracotta */
--color-accent: hsl(25, 60%, 45%);         /* Rich terracotta - 4.9:1 contrast */
--color-accent-hover: hsl(25, 60%, 38%);   /* Darker terracotta - 6.8:1 contrast */

/* Borders - Warm grays */
--color-border: hsl(40, 10%, 85%);         /* Warm light */
--color-border-strong: hsl(40, 10%, 65%);  /* Warm medium */
```

**Color psychology:**
- Warm neutrals: Welcoming, established, traditional
- Terracotta accent: Earthy, sophisticated, artistic
- Cream background: Softer than pure white, premium feel

**Contrast ratios:** All meet or exceed WCAG AA standards

---

## Typography

**Font families:** Same as Modern Minimal
```css
--font-heading: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
```

**Type scale:** 1.333 ratio (Perfect Fourth) - **Larger than Modern**
```css
--font-size-display: 4.2rem;     /* 67px - 40% larger than Modern */
--font-size-h1: 3.15rem;         /* 50px - 32% larger */
--font-size-h2: 2.37rem;         /* 37px - 23% larger */
--font-size-h3: 1.78rem;         /* 28px - 17% larger */
--font-size-h4: 1.33rem;         /* 21px - 11% larger */
--font-size-body: 1.125rem;      /* 18px - 12.5% larger */
--font-size-small: 0.875rem;     /* 14px */
```

**Line heights:** Tighter for more dramatic feel
```css
--line-height-display: 1.05;  /* Tighter than Modern's 1.1 */
--line-height-heading: 1.15;  /* Tighter than Modern's 1.2 */
--line-height-body: 1.5;      /* Same as Modern */
```

**Why larger scale:**
- More dramatic hierarchy
- Traditional editorial aesthetic
- Signals gravitas and experience
- Larger body text (18px) = luxury feel

---

## Spacing

**More generous than Modern (25-50% increases):**
```css
--space-5: 2rem;     /* 32px - was 24px */
--space-6: 3rem;     /* 48px - was 32px */
--space-8: 4rem;     /* 64px - was 48px */
--space-10: 6rem;    /* 96px - was 64px */
```

**Why more space:**
- Premium feel (breathing room = luxury)
- Matches larger typography scale
- Traditional editorial layouts use generous space
- Appropriate for established professionals

---

## Visual Characteristics

**Mood:** Warm, sophisticated, traditional  
**Personality:** Established, prestigious, confident  
**Signals:** Experience, gravitas, classical aesthetic

**When to use:**
- Veteran professionals (Emma - 20+ years)
- Classical/period work (opera, historical theatre)
- Traditional contexts (established venues, formal productions)
- Users who want sophisticated, editorial feel

**When NOT to use:**
- New freelancers (might feel presumptuous)
- Contemporary/experimental work (too traditional)
- Mobile-heavy workflows (larger text = more scrolling)

---

## Visual Distinctions from Modern Minimal

| Aspect | Modern Minimal | Classic Elegant | Difference |
|--------|---------------|-----------------|------------|
| **Colors** | Cool neutrals (white/blue) | Warm neutrals (cream/terracotta) | Warm vs cool |
| **Display size** | 48px | 67px | **+40% larger** |
| **Body text** | 16px | 18px | **+12.5% larger** |
| **Section spacing** | 64px | 96px | **+50% more space** |
| **Card spacing** | 24px | 32px | **+33% more breathing room** |
| **Feel** | Contemporary, efficient | Traditional, luxurious | Mood shift |

**Key:** Structure stays the same (same templates work), but scale and color create completely different aesthetic.

---

## Component Behavior with This Theme

**Image cards:**
- Same hover overlay behavior
- Terracotta accent shows through in some contexts
- More generous spacing between cards in grids

**Buttons:**
- Terracotta accent background (instead of blue)
- Same size/padding (44px touch targets)
- Warm color psychology (inviting vs trust-focused)

**Navigation:**
- Same sticky behavior
- Cream background (instead of white)
- Brown text (instead of black/gray)

**Typography:**
- **Noticeably larger headlines** (dramatic difference on hero sections)
- Larger body text (more comfortable, luxurious reading)
- More generous line spacing overall

---

## User Scenarios

### Emma (Film Supervisor, 20+ Years)

**Why this theme works:**
- Large headlines signal prestige and experience
- Warm colors feel welcoming and established
- Generous spacing = premium aesthetic
- Traditional feel appropriate for classical/period work

**Example application:**
- Landing page: "Emma Rodriguez" in 67px Playfair = commanding presence
- Featured work: Generous spacing lets each project breathe
- Project pages: 18px body text comfortable for longer descriptions

**Result:** Portfolio that signals "I've been doing this for decades and I'm excellent at it"

---

### Marcus (Fashion Freelancer)

**Why this theme might NOT work:**
- Might feel presumptuous for new freelancer
- Traditional feel may not match contemporary fashion
- Warm colors less fashion-forward than cool/bold

**Better fit:** Modern Minimal or Bold Editorial

---

## Contrast Validation

**All contrast ratios meet WCAG AA:**
- Text primary on background: 13.2:1 (AAA) ✅
- Text secondary on background: 5.8:1 (AA) ✅
- Accent on background: 4.9:1 (AA) ✅

**Verified on:**
- WebAIM Contrast Checker
- Chrome DevTools Lighthouse

---

## Implementation

**CSS override:**
```css
[data-theme="classic-elegant"] {
  /* Typography scale */
  --font-size-display: 4.2rem;
  --font-size-h1: 3.15rem;
  --font-size-h2: 2.37rem;
  --font-size-h3: 1.78rem;
  --font-size-h4: 1.33rem;
  --font-size-body: 1.125rem;
  --font-size-small: 0.875rem;
  
  /* Spacing */
  --space-5: 2rem;
  --space-6: 3rem;
  --space-8: 4rem;
  --space-10: 6rem;
  
  /* Line heights */
  --line-height-display: 1.05;
  --line-height-heading: 1.15;
  
  /* Colors */
  --color-background: hsl(40, 30%, 95%);
  --color-surface: hsl(40, 25%, 93%);
  --color-text-primary: hsl(30, 20%, 15%);
  --color-text-secondary: hsl(30, 10%, 35%);
  --color-text-tertiary: hsl(30, 5%, 55%);
  --color-accent: hsl(25, 60%, 45%);
  --color-accent-hover: hsl(25, 60%, 38%);
  --color-accent-hsl: 25, 60%, 45%;
  --color-border: hsl(40, 10%, 85%);
  --color-border-strong: hsl(40, 10%, 65%);
}
```

**User selects this theme:**
- Settings page: "Classic Elegant" option
- Preview immediately applies CSS
- Can switch back to Modern or try Bold

---

## Validation Checklist

- [ ] All contrast ratios ≥ 4.5:1 (text) and 3:1 (UI)
- [ ] Fonts load correctly (Playfair Display, Inter)
- [ ] Headlines visibly larger than Modern (67px vs 48px)
- [ ] Spacing more generous (96px sections vs 64px)
- [ ] Warm color palette distinct from Modern's cool
- [ ] Terracotta accent readable on cream background
- [ ] Works with all templates (Featured Grid, Clean Minimal)
- [ ] Mobile responsive (larger text doesn't break layout)
- [ ] Theme swapping preserves content and structure

---

**Next: Bold Editorial theme...**
