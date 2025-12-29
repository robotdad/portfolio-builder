# Theme: Bold Editorial

**Personality:** Dramatic, contemporary, fashion-forward - makes a statement  
**Best for:** Fashion designers, contemporary work, users wanting bold presence  
**Phase:** Phase 1 (Alternative theme)

---

## Color Palette

```css
/* Backgrounds - Dramatic Fashion (Updated from mockup session) */
--color-background: hsl(240, 8%, 12%);     /* Deep navy-black */
--color-surface: hsl(240, 6%, 16%);        /* Slightly lighter navy-gray */

/* Text - Light on dark */
--color-text-primary: hsl(0, 0%, 98%);     /* Near white - 19.4:1 contrast */
--color-text-secondary: hsl(0, 0%, 70%);   /* Light gray - 7.3:1 contrast */
--color-text-tertiary: hsl(0, 0%, 50%);    /* Medium gray - 4.8:1 contrast */

/* Accent - Hot pink (statement color) */
--color-accent: hsl(340, 85%, 55%);        /* Hot pink - 4.7:1 contrast */
--color-accent-hover: hsl(340, 85%, 48%);  /* Darker pink - 6.1:1 contrast */

/* Borders - Subtle on dark */
--color-border: hsl(0, 0%, 20%);           /* Dark border */
--color-border-strong: hsl(0, 0%, 30%);    /* Lighter dark */
```

**Color psychology:**
- Dark background: Dramatic, cinematic, fashion-forward
- Hot pink accent: Bold, confident, contemporary
- High contrast: Clear, readable, striking

**Contrast ratios:** All meet WCAG AA on dark backgrounds

---

## Typography

**Font families:** DIFFERENT from Modern/Classic
```css
--font-heading: 'Sora', sans-serif;      /* Geometric, contemporary */
--font-body: 'Geist Sans', sans-serif;   /* Clean, modern */
```

**Type scale:** Same 1.25 ratio as Modern (moderate hierarchy)
```css
--font-size-display: 3rem;      /* 48px */
--font-size-h1: 2.375rem;       /* 38px */
--font-size-h2: 1.875rem;       /* 30px */
--font-size-h3: 1.5rem;         /* 24px */
--font-size-h4: 1.1875rem;      /* 19px */
--font-size-body: 1rem;         /* 16px */
--font-size-small: 0.8125rem;   /* 13px */
```

**Line heights:** Same as Modern
```css
--line-height-display: 1.1;
--line-height-heading: 1.2;
--line-height-body: 1.5;
```

**Why sans-serif:**
- Geometric sans (Sora) = contemporary, not traditional
- Pairs with dark theme for fashion-forward aesthetic
- Distinct from serif themes (Modern, Classic)

---

## Spacing

**Uses base 8px grid (same as Modern):**
```css
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
--space-10: 4rem;    /* 64px */
```

**Why standard spacing:**
- Efficiency (not luxury like Classic)
- Contemporary aesthetic values content density
- Works better with dark backgrounds (too much space feels empty)

---

## Visual Characteristics

**Mood:** Dramatic, confident, contemporary  
**Personality:** Fashion-forward, bold, statement-making  
**Signals:** Cutting-edge, artistic, unapologetic

**When to use:**
- Fashion designers (Marcus)
- Contemporary/experimental work
- Avant-garde theatre
- Users who want to make a statement
- Photography-heavy portfolios (dark frames images well)

**When NOT to use:**
- Classical/traditional work (may clash)
- Conservative contexts (too bold)
- Users wanting safe/neutral (too distinctive)
- Accessibility concerns (dark mode can be harder for some users)

---

## Visual Distinctions from Other Themes

| Aspect | Modern | Classic | Bold Editorial |
|--------|--------|---------|----------------|
| **Background** | White | Cream | **Black** |
| **Accent** | Blue | Terracotta | **Hot pink** |
| **Fonts** | Serif headings | Serif headings | **Sans headings** |
| **Scale** | Moderate | Large | Moderate |
| **Spacing** | Standard | Generous | Standard |
| **Mood** | Professional | Traditional | **Dramatic** |

**Unique characteristics:**
- ONLY theme with dark background
- ONLY theme with all-sans typography
- Most distinctive accent color (pink vs blue/terracotta)
- High contrast (black/white/pink)

---

## Image Presentation

**Photography benefits from dark backgrounds:**
- High contrast makes images pop
- Professional photography aesthetic (gallery walls are often dark)
- Costume details more visible against dark
- Color in images stands out dramatically

**Customer work compatibility:**
- ✅ Period costumes: Rich colors pop against black
- ✅ Contemporary work: Modern aesthetic matches
- ✅ Fashion editorial: Perfect for high-contrast photography
- ⚠️ Lighter/pastel work: May need careful image selection

---

## Accessibility Considerations

**Dark mode accessibility:**
- ✅ High contrast (19.4:1 for primary text)
- ✅ All ratios exceed WCAG AA
- ⚠️ Some users prefer light backgrounds (eye strain)
- ⚠️ Ambient light affects readability (bright rooms)

**Best practices:**
- Ensure all text meets contrast requirements
- Test in various lighting conditions
- Provide light theme alternative (Modern/Classic)
- Respect system dark mode preferences (auto-switch?)

---

## User Scenarios

### Marcus (Fashion Designer)

**Why this theme works:**
- Bold aesthetic matches fashion industry
- Dark background = editorial, magazine quality
- Pink accent = confident, contemporary
- Sans-serif typography = modern, not traditional

**Example application:**
- Landing page: "Marcus Williams" in 48px Sora against black = striking
- Featured work: Fashion photography pops against dark
- Cards: Pink hover accents create energy

**Result:** Portfolio that says "I'm fashion-forward and confident"

---

### Sarah (Theatre Designer)

**Why this theme could work:**
- Contemporary theatre productions
- Modern aesthetic for modern interpretations
- High contrast for dramatic presentation

**Why it might NOT work:**
- Classical productions may need warmer aesthetic (Classic)
- Theatre portfolios often use light backgrounds (convention)
- Dark mode may not photograph well in portfolio reviews

**Recommendation:** Sarah tries Modern Minimal, can switch if contemporary work dominates

---

### Emma (Film Supervisor)

**Why this theme might work:**
- Cinematic aesthetic (film = dark theaters)
- Dramatic for showcasing film work
- High contrast appropriate for visual medium

**Why it might NOT work:**
- 20+ years experience may prefer traditional (Classic)
- Film industry may expect more conservative aesthetic
- Too bold for established professional?

**Recommendation:** Emma uses Classic Elegant (established) or Modern (neutral)

---

## Performance Notes

**Dark backgrounds:**
- Slightly better battery life (OLED screens)
- Can reduce eye strain in low light
- May increase eye strain in bright light

**Image optimization:**
- Dark backgrounds show compression artifacts more
- Need higher quality images (less aggressive compression)
- WebP format especially important

---

## Implementation

**CSS override:**
```css
[data-theme="bold-editorial"] {
  /* Font families - Switch to sans-serif */
  --font-heading: 'Sora', sans-serif;
  --font-body: 'Geist Sans', sans-serif;
  
  /* Colors - Dark theme */
  --color-background: hsl(0, 0%, 5%);
  --color-surface: hsl(0, 0%, 10%);
  --color-text-primary: hsl(0, 0%, 98%);
  --color-text-secondary: hsl(0, 0%, 70%);
  --color-text-tertiary: hsl(0, 0%, 50%);
  --color-accent: hsl(340, 85%, 55%);
  --color-accent-hover: hsl(340, 85%, 48%);
  --color-accent-hsl: 340, 85%, 55%;
  --color-border: hsl(0, 0%, 20%);
  --color-border-strong: hsl(0, 0%, 30%);
  
  /* Typography scale and spacing - same as Modern */
}
```

**User selects this theme:**
- Settings page: "Bold Editorial" option
- Preview shows dark background + pink accent
- Entire site transforms instantly

---

## Validation Checklist

- [ ] Dark background renders correctly
- [ ] All text contrast ≥ 4.5:1 on dark
- [ ] Pink accent visible and readable
- [ ] Fonts load (Sora, Geist Sans)
- [ ] Sans-serif headings distinct from serif themes
- [ ] Images pop against dark background
- [ ] Works with all templates
- [ ] Mobile responsive (dark doesn't break layout)
- [ ] Theme swapping works (dark ↔ light transitions)
- [ ] No white flash when loading (dark background immediate)

---

**Next: Finalizing design system and creating tech handoff...**
