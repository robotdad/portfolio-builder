# Aesthetic Guide for Costume Designer Portfolios

**Purpose:** Visual principles and patterns extracted from user research and customer feedback  
**Status:** Based on customer interview 2025-12-28  
**Last Updated:** 2025-12-28

---

## Core Aesthetic Principles

### 1. Photos Are the Star

**Principle:** The work speaks for itself. Design frames the work, never competes with it.

**In Practice:**
- Large, prominent images
- Clean backgrounds that don't distract
- Minimal decorative elements
- Typography that supports, doesn't overpower
- White space that creates focus, not emptiness

**Anti-pattern:** Busy backgrounds, decorative elements, design that draws attention away from costume work

---

### 2. Approachable and Clean

**Principle:** Users should feel welcomed, not overwhelmed.

**In Practice:**
- Clear visual hierarchy (obvious what to look at first)
- Generous white space (breathing room, not clutter)
- Simple navigation (max 5 main sections)
- Obvious interactive elements (buttons, links, cards)
- Progressive disclosure (don't show everything at once)

**Anti-pattern:** Cluttered layouts, too many options, unclear navigation, overwhelming information density

---

### 3. Strategic Featured Work

**Principle:** Recent/best work should be prominent. Users need control over what's featured.

**Customer insight:** "I got a recent job because that project was visible. If I kept adding to the bottom, it would have been buried."

**In Practice:**
- Featured images on landing page (not chronological dump)
- User controls which projects are featured
- Carousel/rotation for multiple featured items
- Clear path: Landing featured images → Click → Project detail page

**Anti-pattern:** Chronological-only ordering, all work treated equally, no way to highlight best work

---

### 4. Organized, Not Scrolling

**Principle:** Long scrolling image dumps feel amateur. Organization signals professionalism.

**In Practice:**
- Gallery pages organized by project/production
- Featured image or carousel per project
- Click into project to see all related images
- Grouped by meaningful categories (film, theatre, opera, etc.)

**Anti-pattern:** Single page with all images in endless scroll, no grouping, no hierarchy

---

### 5. Meticulous Typography

**Principle:** Consistent typography signals professionalism. Changes should be intentional, not arbitrary.

**In Practice:**
- 1-2 font families maximum
- Consistent hierarchy (H1 = page title, H2 = section, etc.)
- Type changes serve purpose (emphasis, hierarchy, context)
- Never change fonts for decoration

**Anti-pattern:** Multiple font families with no logic, random size changes, inconsistent hierarchy

---

## Preferred Visual Patterns

### Landing Page Pattern (From maddievare.com)

**Structure:**
```
1. Name/Title (centered, prominent)
2. Downloadable Resume link (top navigation or hero)
3. Featured images (large, prominent)
   - Carousel OR grid of featured projects
   - Link directly to project pages
4. Minimal about text (optional, not required)
```

**What the customer said:** "I liked this one especially the landing page"

**Why it works:**
- Photos immediately visible (work speaks for itself)
- Clean, not overwhelming
- Resume accessible without inline text
- Featured work is prioritized

**What to avoid:**
- Long about text before images (sashagoodner.com problem)
- Too much empty space (Adobe Portfolio constraint)
- Generic template feel

---

### Image Card with Hover Overlay Pattern

**Customer preference:** "I liked pages where the image cards had details displayed as text overlay on hover"

**Specification:**
```
Image Card (Default State):
- Large image (4:3 or 3:2 aspect ratio)
- Clean, no text overlay
- Subtle border or shadow

Image Card (Hover State):
- Semi-transparent dark overlay (30-40% black)
- Text appears:
  - Project title (H3 size, white, bold)
  - Production/context (Small text, white, medium weight)
  - Optional: Year, venue
- Smooth transition (200-300ms)
```

**Why it works:**
- Clean default state showcases image
- Hover reveals context without cluttering
- Desktop-friendly (photographer/director reviewing on laptop)

**Mobile alternative:**
- Tap to reveal overlay OR
- Show title below image (no hover on touch devices)

---

### Project Detail Page Pattern

**Structure:**
```
1. Project title + metadata (production name, year, venue)
2. Featured image OR carousel (hero position)
3. Project description (optional, nearby image)
4. Full gallery (grid, organized)
   - Click image → Lightbox/full view
   - Grid maintains visual rhythm
5. Credits (collaborators, cast, crew)
```

**Customer preference:** "Text somewhere around the image particularly on the project page"

**Layout options:**
- **Option A:** Image left, text right (desktop), stacked (mobile)
- **Option B:** Full-width image, text below
- **Option C:** Carousel with text overlay or adjacent

---

### Organization Pattern (From nmhartistry.com)

**Customer said:** "This one has nice sections, it is meticulous and well organized"

**Hierarchical organization:**
```
Portfolio
├── Theatre
│   ├── Romeo & Juliet (2024)
│   ├── Macbeth (2023)
│   └── Hamlet (2023)
├── Film
│   ├── Historical Drama (2024)
│   └── Period Piece (2023)
└── Opera
    └── La Bohème (2024)
```

**Visual pattern:**
- Category pages show all projects in that category
- Each project represented by featured image card
- Click card → Project detail page with full gallery
- Clear navigation hierarchy (breadcrumbs helpful)

---

### Resume Handling Pattern

**Customer preference:** "Resume is downloadable, wasn't a fan of it being inline on the page"

**Implementation:**
```
Navigation:
- "Resume" link in header
- Click → Download PDF OR
- Click → Opens resume page with download button at top

NOT:
- Inline resume text on About page
- Forces reading in browser
```

**Why downloadable:**
- Clients want to save/print
- PDF is professional standard
- Takes up less portfolio space

---

## Visual Reference Analysis

### Sites Customer Liked

**nmhartistry.com:**
- ✅ Organized sections (Construction, Design, Rendering, Crafts)
- ✅ Resume link prominent
- ✅ Meticulous categorization
- Clean, systematic presentation

**mackenzie-hues.com:**
- ✅ Scrolling images (carousel/rotation)
- ✅ Downloadable resume
- Clean typography, good image prominence

**maddievare.com:**
- ✅ **LOVED the landing page**
- Hero with name + tagline
- Clean, approachable entry point
- Photos featured prominently

### Site Customer Doesn't Like

**sashagoodner.com (her current site):**
- ❌ Too much empty space on home page
- ❌ Adobe Portfolio doesn't give enough control
- ❌ Can't add carousels
- ❌ Can't organize featured work strategically

**Lesson:** Generic templates lack the control needed for strategic content prioritization.

---

## Design System Implications

Based on this feedback, our design system needs:

### Typography Requirements

**Hierarchy clarity:**
- H1: Name on landing page (48-67px, prominent)
- H2: Section headers ("Theatre", "Film", "Opera")
- H3: Project titles on cards
- Body: 16-18px, high readability

**Consistency:**
- 1-2 font families maximum
- Use for specific purposes (heading vs body)
- Never arbitrary changes

### Color Requirements

**Support photos, don't compete:**
- Neutral backgrounds (white, cream, light gray)
- Accent colors for interactive elements only
- Text colors with high contrast for readability
- Avoid: Bright backgrounds, colorful patterns, decorative elements

### Layout Requirements

**Featured work priority:**
- Landing page: Featured images prominent
- Category pages: Grid of project cards
- Project pages: Featured image + gallery

**Organization over scrolling:**
- Grouped by project/production
- Click into projects for details
- Avoid: Single endless scroll

### Component Requirements

**Must have:**
- Image card with hover text overlay
- Carousel for featured work rotation
- Gallery grid (not long scroll)
- Downloadable resume link
- Project detail layout (featured + text + gallery)

---

## Implementation Checklist

Before building any component, validate:

- [ ] Does this let photos be the star?
- [ ] Is this approachable (not overwhelming)?
- [ ] Does this support strategic featured work?
- [ ] Is this organized (not scrolling)?
- [ ] Is typography consistent and intentional?
- [ ] Does this frame work without competing?

---

## Next Steps

**Design Specifications to Create:**

1. **Landing Page Spec** - Name + Resume + Featured Work pattern
2. **Image Card Component** - Hover overlay specifications
3. **Project Detail Page** - Featured image + text + gallery layout
4. **Navigation Pattern** - Category organization, breadcrumbs
5. **Carousel Component** - Featured work rotation

**Questions to Resolve:**

1. **Landing page featured work:** Carousel (rotating) OR static grid? Customer liked both patterns.
2. **Project cards:** Show title on hover only OR title below image?
3. **About section:** Separate page OR minimal on landing? Customer preferred clean landing.
4. **Resume:** Download link in nav OR button on About page?

---

**This feedback changes everything. Let's update the demo to match these patterns.**
