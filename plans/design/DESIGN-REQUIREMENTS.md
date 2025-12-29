# Design Requirements for Implementation

**Purpose:** Translate customer feedback into specific design specifications  
**Status:** Ready for refinement  
**Based on:** Customer interview 2025-12-28

---

## Critical Design Decisions We Must Make

Before Slice 1 implementation, we need specifications for:

### 1. Landing Page Pattern ⚠️ NEEDS DECISION

**Customer preference:** Clean with name + resume + featured images (maddievare.com style)

**Decisions needed:**
- [ ] **Featured work presentation:** Carousel (rotating) OR static grid of 4-6 images?
- [ ] **Name/title treatment:** Centered hero OR left-aligned header?
- [ ] **Resume placement:** Link in nav bar OR button on landing page?
- [ ] **About text:** None on landing OR minimal 1-2 sentence tagline?

**Customer feedback:**
- ✅ Clean, not overwhelming
- ✅ Photos immediately visible
- ✅ Downloadable resume (not inline)
- ❌ Avoid too much empty space (sashagoodner.com problem)
- ✅ Liked carousels with rotating featured images

---

### 2. Image Card Component ✅ CLEAR DIRECTION

**Pattern:** Hover text overlay (customer preference)

**Specification:**
```
Default State:
- Image fills card (4:3 or 3:2 aspect ratio)
- No text overlay (clean, lets image shine)
- Subtle border or shadow for definition

Hover State (Desktop):
- Semi-transparent dark overlay (30-40% opacity black)
- Text appears centered:
  - Project title (H3, white, bold)
  - Context metadata (year, venue - Small, white)
- Transition: 200-300ms smooth

Mobile/Touch:
- QUESTION: Tap to show overlay OR title always visible below?
- Touch doesn't support hover, need alternative
```

**Customer feedback:**
- ✅ Liked text overlay on hover
- ✅ Clean cards that showcase images
- Context should be available but not cluttering

---

### 3. Project Detail Page Pattern ⚠️ NEEDS REFINEMENT

**Customer preference:** Featured image/carousel + text nearby + full gallery

**Decisions needed:**
- [ ] **Hero layout:** Full-width image OR image left/text right OR carousel?
- [ ] **Text placement:** Adjacent to hero image OR below hero image?
- [ ] **Gallery layout:** Grid (3 columns desktop) OR masonry OR other?
- [ ] **Image interaction:** Click to lightbox OR click to expand inline?

**Must include:**
- Project title + metadata (production, year, venue)
- Featured image or carousel
- Project description (optional but available)
- Full image gallery (organized, not endless scroll)
- Credits (collaborators, cast, crew)

**Customer feedback:**
- ✅ "Text somewhere around the image" on project pages
- ✅ Gallery organized by project (not all images together)
- ❌ Avoid all images in long scroll (feels amateur)

---

### 4. Gallery Organization ✅ CLEAR DIRECTION

**Pattern:** Hierarchical by project/category (nmhartistry.com style)

**Structure:**
```
Portfolio
├── Theatre (category page)
│   ├── Romeo & Juliet (project page)
│   ├── Macbeth (project page)
│   └── Hamlet (project page)
├── Film (category page)
│   └── Period Drama (project page)
└── Opera (category page)
```

**Category Page:**
- Grid of project cards (featured image per project)
- Hover overlay with project title + year
- Click card → Project detail page

**Project Page:**
- Featured image/carousel at top
- Full gallery of all project images below
- Organized, finite (not infinite scroll)

**Customer feedback:**
- ✅ "Meticulous and well organized" (nmhartistry.com)
- ✅ Categories and projects clearly structured
- ❌ Avoid flat organization (all images equal)

---

### 5. Typography System ⚠️ NEEDS VALIDATION

**Current spec:** 1.25 ratio (moderate) for Modern, 1.333 ratio (larger) for Classic

**Decisions needed:**
- [ ] **Default theme type scale:** Is 1.25 ratio appropriate or too conservative?
- [ ] **Font pairing:** Serif headings (Playfair) + sans body (Inter)?
- [ ] **Body text size:** 16px standard OR 18px for readability?
- [ ] **Line height:** 1.5 for body is standard - adjust for costume portfolios?

**Customer feedback:**
- ✅ Typography should be consistent (not change arbitrarily)
- ✅ Should support content, not compete
- No specific preferences given (open to recommendation)

**Validation needed:**
- Does serif heading + sans body feel appropriate for costume designers?
- Should we consider all-sans for more contemporary feel?
- Is 16px body text too small for showcasing visual work?

---

### 6. Color Palette ⚠️ NEEDS VALIDATION

**Current themes:**
- Modern: Neutral (white/blue)
- Classic: Warm (cream/terracotta)
- Bold: Dark (black/pink)

**Principle from customer:** Colors should frame work, not compete

**Decisions needed:**
- [ ] **Default theme colors:** Should default be pure neutral (white/gray/blue)?
- [ ] **Accent color intensity:** Vibrant (current blue) OR more subtle?
- [ ] **Background:** Pure white OR slightly off-white for warmth?

**Customer feedback:**
- ✅ Clean backgrounds that don't distract
- ✅ Design frames work, doesn't compete
- Implies neutral is safer than bold

**Question:** Do costume portfolios benefit from personality in colors, or should colors always be neutral to let work shine?

---

### 7. Carousel Component ⚠️ NEW REQUIREMENT

**Customer preference:** "Appreciated carousels with rotating featured images"

**Must specify:**
- [ ] **Auto-rotate:** Yes with pause on hover OR manual only?
- [ ] **Transition style:** Fade OR slide OR other?
- [ ] **Navigation:** Dots/arrows OR swipe only (mobile)?
- [ ] **Timing:** How long per image if auto-rotating?

**Use cases:**
- Landing page: Featured work carousel
- Project page: Multiple hero images for one project

**Validation needed:**
- Carousels can feel dated if done poorly - what makes them feel modern?
- Mobile carousel UX (swipe gestures, touch-friendly controls)

---

## Open Questions for Discussion

### Landing Page Specifics

**Question 1:** Featured work presentation

**Option A: Carousel (Rotating)**
- Pros: Shows multiple featured projects, dynamic, space-efficient
- Cons: Users might miss work if they don't wait, requires interaction
- Example: mackenzie-hues.com

**Option B: Static Grid (4-6 Featured Cards)**
- Pros: All visible at once, no waiting, user controls pace
- Cons: Limited to what fits on screen
- Example: nmhartistry.com (category grids)

**Your preference?** Or hybrid (carousel on mobile, grid on desktop)?

---

**Question 2:** About text placement

Customer prefers clean landing page, but users might want SOME intro text.

**Option A: No About on Landing**
- Landing: Name + Resume + Featured Work
- About: Separate page accessed via navigation

**Option B: Minimal Tagline**
- 1-2 sentence tagline below name
- Example: "Theatre Costume Designer | Shakespeare to Contemporary"
- Full about on separate page

**Your preference?**

---

**Question 3:** Resume access pattern

**Option A: Nav Link (Direct Download)**
- "Resume" in navigation bar
- Click → PDF downloads immediately

**Option B: Resume Page (With Download)**
- "Resume" in navigation bar
- Click → Resume page with download button + preview

**Your preference?** Customer preferred downloadable, not inline.

---

### Component Specifications Needed

**Question 4:** Mobile hover alternative

Hover text overlays don't work on mobile. For touch devices:

**Option A: Tap to Toggle Overlay**
- Tap image → Overlay appears
- Tap again OR tap outside → Overlay disappears

**Option B: Title Always Visible Below**
- Desktop: Hover overlay
- Mobile: Title/metadata below image (no overlay)

**Your preference?**

---

**Question 5:** Image aspect ratios

**Should all images use consistent aspect ratio OR allow mixed?**

**Option A: Consistent Aspect (4:3 or 3:2)**
- Pros: Clean grid, professional
- Cons: Crops images to fit

**Option B: Mixed Aspects (Respect Original)**
- Pros: No cropping, preserves photographer's composition
- Cons: Irregular grid (masonry layout)

**Customer context:** Production photography often has varied compositions.

**Your preference?**

---

## What We'll Create After Decisions

Once you answer these questions, I'll create:

### Design Specifications (plans/design/):

1. **LANDING-PAGE-SPEC.md**
   - Exact layout (sections, hierarchy, spacing)
   - Component usage (carousel vs grid)
   - Typography treatment
   - Responsive behavior

2. **IMAGE-CARD-SPEC.md**
   - Default and hover states (exact CSS)
   - Mobile touch alternative
   - Typography and spacing
   - Aspect ratio handling

3. **PROJECT-PAGE-SPEC.md**
   - Hero image/carousel layout
   - Text placement options
   - Gallery grid specifications
   - Credits section

4. **CAROUSEL-SPEC.md**
   - Interaction model (auto vs manual)
   - Transition timing and easing
   - Mobile gesture support
   - Accessibility requirements

5. **NAVIGATION-SPEC.md**
   - Category organization pattern
   - Resume handling
   - Mobile menu behavior

### Updated Design System:

6. **DESIGN-SYSTEM.md** (refined)
   - Finalized typography scale
   - Validated color palette
   - Component specifications
   - Responsive patterns

---

## Let's Make These Decisions Together

**I'll ask you one decision at a time, we'll discuss, and I'll document the rationale.**

**Starting with the most important:**

### Decision 1: Landing Page Featured Work

The customer liked BOTH carousels (mackenzie-hues.com) AND organized grids (nmhartistry.com). 

For your portfolio builder's landing page, which pattern serves users better?

**Carousel (rotating featured images):**
- User picks 5-8 featured projects
- Landing page shows one at a time, auto-rotates or manual click
- Space-efficient, dynamic, draws attention

**Static Grid (4-6 featured cards):**
- User picks 4-6 featured projects
- All visible at once on landing page
- User controls what they look at first

**My recommendation:** Start with static grid (simpler to implement, no interaction required), add carousel as Phase 2 enhancement.

**But what makes sense for YOUR users?** Sarah needs mobile updates to be fast. Marcus needs strong first impression. Emma needs to highlight specific work strategically.

**Your call - which pattern and why?**