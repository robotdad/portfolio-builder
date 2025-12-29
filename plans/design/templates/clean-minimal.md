# Template: Clean Minimal

**Reference:** maddievare.com (customer: "I liked this one especially the landing page")  
**Phase:** Phase 2 (Alternative template)  
**Status:** Specification ready for implementation

---

## Overview

Ultra-clean landing page with centered hero and minimal chrome. Maximum focus on the work.

**Best for:**
- Users who want work to speak for itself
- Minimal about text (let images tell the story)
- Strong visual work that needs no explanation
- Fashion designers, contemporary work

**User value:**
- Immediate visual impact (photos front and center)
- No clutter or distraction
- Professional without being formal
- Quick to create (minimal required text)

---

## Landing Page Structure

### Section 1: Centered Hero (Minimal)

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          Maddie Vare            │  ← Name (Display size, centered)
│    Sewing Fantasy Into Reality  │  ← Tagline (H3, optional, poetic)
│      A Costume Design Portfolio │  ← Subtitle (H4, optional)
│                                 │
│      [Download Resume]          │  ← Resume (if provided)
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Content slots:**
- `name` (required)
- `tagline` (optional): 1 short sentence (poetic/personal)
- `subtitle` (optional): Professional context
- `resume_pdf` (optional)

**Distinguishing features vs Featured Grid:**
- More vertical space (generous top/bottom padding)
- NO immediate featured images (scroll required)
- Emphasis on name/identity first
- Poetic tagline option (personality)

**Styling:**
- Background: `--color-background`
- Centered: horizontally and vertically
- Padding: `--space-8` (compact top/bottom)
- **Design Decision**: Reduced from `--space-16`, removed `minHeight: 100vh` to ensure first featured images visible without scrolling (see anti-patterns doc)

---

### Section 2: Featured Work (Full-Width)

```
┌─────────────────────────────────┐
│  ┌───────────────────────────┐  │
│  │  Featured Image 1         │  │  ← Full-width featured cards
│  │  Project Title on Hover   │  │     (One per row)
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Featured Image 2         │  │
│  │  Project Title on Hover   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Featured Image 3         │  │
│  │  Project Title on Hover   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Content slots:**
- `featured_projects[]`: 3-6 projects marked as featured

**Image card specifications:**
- Width: Full-width (max 1200px container)
- Aspect ratio: 16:9 (landscape, cinematic)
- Gap between cards: `--space-8` (generous)
- Hover: Text overlay (project title only, large)
- Mobile: Title below image

**Why different from Featured Grid:**
- One column (more dramatic, editorial)
- Larger images (full attention per image)
- Fewer featured projects (3-6 vs 6-12)
- More scroll (intentional browsing vs quick scan)

**Responsive:**
- Desktop: Full-width cards, stacked
- Mobile: Same structure, less padding

---

### Section 3: Footer (Minimal)

Same as Featured Grid template.

---

## Category Page Structure

**Same as Featured Grid template** - Grid of project cards

**Rationale:** Category pages need organization/scanning. Grid pattern works better than stacked full-width.

---

## Project Detail Page Structure

**Same as Featured Grid template** - Hero image + description + gallery grid

---

## Navigation Pattern

**Simplified compared to Featured Grid:**

```
Desktop Header:
┌──────────────────────────────────────────┐
│ Maddie Vare                    About     │
│                          Contact  Resume │
└──────────────────────────────────────────┘
```

**Navigation items:**
- Logo/Name (left, links to landing)
- Minimal links: About, Contact, Resume
- NO category links in main nav (accessed via "View All Work" button on landing)

**Why different:**
- Cleaner header (less visual weight)
- Emphasis on landing page as entry point
- Categories accessed via landing CTA

**Alternative:** Keep category nav like Featured Grid (user can choose)

---

## Distinguishing Characteristics

**vs Featured Grid Landing:**

| Aspect | Featured Grid | Clean Minimal |
|--------|--------------|---------------|
| Hero | Compact (name + resume) | Expansive (full-screen, centered) |
| Featured layout | 3-column grid | 1-column stacked |
| Images per view | 6 visible at once | 1-2 visible (scroll) |
| Feel | Organized, systematic | Editorial, browsable |
| Navigation | Category links in nav | Minimal nav, categories via landing |
| Best for | Organized professionals (Emma) | Visual storytellers (Marcus) |

---

## User Scenarios

### Scenario: Marcus (Fashion Designer)

**Why this template:**
- Fashion work benefits from large, dramatic presentation
- 16:9 landscape shows editorial shots well
- Poetic tagline option ("Crafting Wearable Art")
- Minimal text emphasizes visual work

**Content:**
- Name: "Marcus Williams"
- Tagline: "Contemporary Fashion Design"
- 4 featured projects (fashion editorials)
- Images: Full-width, cinematic presentation

**Result:** Bold, confident, lets work make the statement

---

### Scenario: Sarah (Theatre Designer)

**Why this template might NOT fit:**
- Sarah needs quick mobile updates
- Full-width stacked layout = lots of scroll on mobile
- Grid pattern (Featured Grid template) better for mobile scanning

**Recommendation:** Sarah uses Featured Grid, Marcus uses Clean Minimal

---

## Implementation Priority

**Phase 2** (after Featured Grid template proven)

**Why later:**
- More complex hero layout (centering, full-screen)
- Full-width images need more responsive work
- Featured Grid validates core patterns first

**Estimate:** 2-3 days after Featured Grid complete

---

## Content Requirements

**Minimum viable:**
- Name only
- 1 featured project with 1 image
- Result: Clean landing with one full-width image

**Recommended:**
- Name + tagline
- Resume
- 3-6 featured projects
- Result: Professional, editorial feel

---

## Interaction Specifications

**Same as Featured Grid except:**

**Image card (full-width variant):**
```css
.full-width-card {
  max-width: 1200px;
  margin: 0 auto var(--space-8);
  aspect-ratio: 16/9;  /* Cinematic */
}

.full-width-card .overlay-title {
  font-size: var(--font-size-h2);  /* Larger for full-width */
}
```

---

**Next: Creating component specifications...**
