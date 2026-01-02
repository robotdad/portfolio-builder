# Onboarding Flow: Layout Architecture Specification

**Date:** 2026-01-02  
**Status:** Proposal - Options for Review  
**Target:** <5 min onboarding, <30 min to professional portfolio

---

## User's Spark (Preserved)

> "It would be nice if we could bring in category + 1st project to the onboarding if possible, so that would need to be minimal to be successful I think."

**Current Reality:**
- Homepage → /admin directly (no wizard)
- Inline creation: name, slug, theme dropdown
- Single portfolio per install (no auth)
- Theme selector: text dropdown only
- Target: Get to first content quickly

**Design Constraints:**
- KEEP IT SIMPLE (archived spec "broke multiple times")
- No authentication for MVP
- Mobile-first workflow
- Must result in: Portfolio + Theme + 1 Category + 1 Project
- User ready to work immediately after

---

## OPTION 1: Progressive 3-Step Flow ⭐ RECOMMENDED

**Time estimate:** 3-5 minutes  
**Structure:** Separate steps, clear progression

### Information Architecture

```
Homepage (/)
  ↓ "Get Started"
  ↓
Step 1: Portfolio Details (/welcome/portfolio)
  - Name (required)
  - URL slug (auto-generated, editable)
  - 44px touch targets, mobile keyboard optimized
  ↓ "Choose Theme →"
  ↓
Step 2: Theme Selection (/welcome/theme)
  - Visual cards with color swatches
  - 3 themes: Modern Minimal, Classic Elegant, Bold Editorial
  - Preview on tap (mobile), hover (desktop)
  ↓ "Create First Project →"
  ↓
Step 3: First Content (/welcome/first-project)
  - Category name (with smart default: "My Work")
  - Project title (required)
  - Featured image (optional, can skip)
  - Big CTA: "Start Building →"
  ↓
Admin Editor (/admin)
  - Portfolio created ✓
  - Theme applied ✓
  - 1 Category created ✓
  - 1 Project created ✓
  - User can add more content immediately
```

### Layout Structure: Step 1 (Portfolio Details)

**Grid:** Single column, centered, max-width 480px

```
┌─────────────────────────────────────┐
│  [Progress: ● ○ ○]                 │  ← Sticky header, 64px
│                                     │
│  Create Your Portfolio              │  ← H1, 32px bold
│  Let's get you set up quickly       │  ← Subtitle, muted
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Your Name *                   │ │  ← Label, 14px
│  │ ┌───────────────────────────┐ │ │
│  │ │ Jane Smith               │ │ │  ← Input, 44px min height
│  │ └───────────────────────────┘ │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Portfolio URL *               │ │
│  │ ┌───────────────────────────┐ │ │
│  │ │ jane-smith               │ │ │  ← Auto-generated
│  │ └───────────────────────────┘ │ │
│  │ yoursite.com/jane-smith       │ │  ← Preview hint
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Choose Theme →            │   │  ← Primary CTA, 56px
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Rationale:**
- F-pattern: Important fields top-left
- Vertical rhythm: 24px between form groups
- Clear progression: Can't miss the next step
- Mobile-optimized: 44px inputs, large CTA

---

### Layout Structure: Step 2 (Theme Selection)

**Grid:** 1 column mobile, 2 columns desktop (768px+)

```
┌─────────────────────────────────────┐
│  [Progress: ● ● ○]                 │  ← Sticky header
│                                     │
│  Choose Your Theme                  │  ← H1
│  Pick a style that feels like you   │  ← Subtitle
│                                     │
│  ┌───────────────┐ ┌──────────────┐│
│  │ [Color Grid] │ │ [Color Grid]││  ← Theme cards
│  │ Modern Minimal│ │ Classic      ││  ← 2 cols desktop
│  │ Clean & pro...│ │ Elegant...   ││  ← 1 col mobile
│  └───────────────┘ └──────────────┘│
│                                     │
│  ┌───────────────┐                 │
│  │ [Color Grid] │                 │
│  │ Bold Editorial│                 │
│  │ Make a...     │                 │
│  └───────────────┘                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Create First Project →    │   │  ← Primary CTA
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Theme Card Structure:**

```
┌─────────────────────────────┐
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │  ← Selected: 2px primary border
│                             │
│   [Color Gradient Preview]  │  ← 16:9 aspect ratio
│   ●●●●                      │  ← Color swatches (4 colors)
│                             │
│   Modern Minimal    [✓]     │  ← Name + selected badge
│   Clean, professional...    │  ← Description, 14px
│                             │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │
└─────────────────────────────┘
```

**Rationale:**
- Visual confidence: See theme colors immediately
- No modal complexity: Cards are the preview
- Mobile: Stack vertically, tap to select
- Desktop: Side-by-side comparison

---

### Layout Structure: Step 3 (First Content)

**Grid:** Single column, max-width 480px

```
┌─────────────────────────────────────┐
│  [Progress: ● ● ●]                 │  ← All dots filled!
│                                     │
│  Create Your First Project          │  ← H1
│  Add one project to get started     │  ← Subtitle
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Category Name                 │ │  ← Pre-filled
│  │ ┌───────────────────────────┐ │ │
│  │ │ My Work                  │ │ │  ← Smart default
│  │ └───────────────────────────┘ │ │
│  │ e.g., Theatre, Film, Personal  │ │  ← Hint text
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Project Title *               │ │
│  │ ┌───────────────────────────┐ │ │
│  │ │                          │ │ │  ← Empty, user fills
│  │ └───────────────────────────┘ │ │
│  │ e.g., "Hamlet Costume Design"  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Featured Image (optional)     │ │
│  │ ┌───────────────────────────┐ │ │
│  │ │  [+]                     │ │ │  ← Upload zone
│  │ │  Add an image            │ │ │  ← Or tap to skip
│  │ └───────────────────────────┘ │ │
│  │ You can add more images later  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🎉 Start Building →       │   │  ← Exciting CTA!
│  └─────────────────────────────┘   │
│                                     │
│  Skip this step →                   │  ← Option to skip
│                                     │
└─────────────────────────────────────┘
```

**Rationale:**
- Smart defaults: "My Work" category pre-filled
- Minimal friction: Only project title required
- Progressive: Can skip image, add later
- Celebration: User just created something!

---

## OPTION 2: Compressed 2-Step Flow

**Time estimate:** 2-3 minutes  
**Trade-off:** Faster but less visual theme selection

### Structure

```
Step 1: Portfolio + Theme (/welcome/setup)
  - Name + Slug (same as Option 1)
  - Theme selection (inline, less visual)
  ↓
Step 2: First Project (/welcome/first-project)
  - Same as Option 1 Step 3
  ↓
Admin Editor
```

**Layout: Step 1 (Combined)**

```
┌─────────────────────────────────────┐
│  [Progress: ● ○]                   │
│                                     │
│  Create Your Portfolio              │
│                                     │
│  [Name input - same as Option 1]    │
│  [Slug input - same as Option 1]    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Choose Theme                  │ │
│  │                               │ │
│  │  ◉ Modern Minimal            │ │  ← Radio buttons
│  │     ●●●● Clean & professional│ │  ← Color dots inline
│  │                               │ │
│  │  ○ Classic Elegant           │ │
│  │     ●●●● Sophisticated...    │ │
│  │                               │ │
│  │  ○ Bold Editorial            │ │
│  │     ●●●● Make a statement    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Create First Project →    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Pros:**
- Faster completion (2 steps vs 3)
- Less navigation between screens
- Good for desktop workflow

**Cons:**
- Less visual confidence in theme
- Mobile feels cramped
- Harder to compare themes

---

## OPTION 3: Modal Wizard (Over /admin)

**Time estimate:** 3-4 minutes  
**Trade-off:** Stays on /admin, but wizard overlay

### Structure

```
Homepage (/)
  ↓ "Get Started"
  ↓
/admin (with modal overlay)
  ┌─────────────────────────────┐
  │  Step 1: Portfolio Details  │  ← Modal centered
  │  [Name + Slug]              │  ← Over blurred /admin
  │  [Next →]                   │
  └─────────────────────────────┘
    ↓
  ┌─────────────────────────────┐
  │  Step 2: Theme Selection    │
  │  [Visual cards]             │
  │  [Next →]                   │
  └─────────────────────────────┘
    ↓
  ┌─────────────────────────────┐
  │  Step 3: First Project      │
  │  [Category + Project]       │
  │  [Start Building →]         │
  └─────────────────────────────┘
    ↓
/admin (modal dismissed, portfolio ready)
```

**Layout: Modal Structure**

```
┌─────────────────────────────────────┐
│ [Blurred /admin background]         │
│                                     │
│   ┌───────────────────────────┐   │
│   │ [X Close]    Step 1 of 3  │   │  ← Modal header
│   ├───────────────────────────┤   │
│   │                           │   │
│   │  Portfolio Details        │   │  ← Step content
│   │  [Form fields]            │   │  ← 480px max width
│   │                           │   │
│   ├───────────────────────────┤   │
│   │         [Next →]          │   │  ← Modal footer
│   └───────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- User sees /admin page in background (preview)
- Can dismiss and return to /admin anytime
- Familiar modal pattern

**Cons:**
- Modal complexity (escape key, focus trap)
- Mobile modals are awkward
- User might accidentally dismiss

---

## OPTION 4: Inline Progressive Disclosure (Minimal)

**Time estimate:** 2-3 minutes  
**Trade-off:** No navigation, everything on /admin

### Structure

```
/admin (portfolio creation expanded by default)
  ↓
[Portfolio Details Card]
  - Expanded on first visit
  - Name + Slug + Theme (radio buttons inline)
  [Create Portfolio]
  ↓
[First Project Card] (appears after portfolio created)
  - Category (pre-filled "My Work")
  - Project Title
  - Featured Image (optional)
  [Create Project]
  ↓
/admin (normal editor, can add more content)
```

**Layout: Progressive Cards**

```
┌─────────────────────────────────────┐
│  Portfolio Builder                  │  ← Admin header
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📝 Create Your Portfolio       │ │  ← Card 1 (expanded)
│  │                                │ │
│  │ [Name input]                   │ │
│  │ [Slug input]                   │ │
│  │ [Theme radio buttons]          │ │
│  │                                │ │
│  │ [Create Portfolio →]           │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │  ← Card 2 (hidden until
│  │ 🎨 Create Your First Project   │ │    portfolio created)
│  │                                │ │
│  │ [Category input]               │ │  ← Pre-filled "My Work"
│  │ [Project title input]          │ │
│  │ [Image upload optional]        │ │
│  │                                │ │
│  │ [Create Project →]             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │  ← Card 3 (hidden until
│  │ ✨ Add More Content            │ │    project created)
│  │                                │ │
│  │ [Section list]                 │ │  ← Normal editor
│  │ [Add section +]                │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Pros:**
- NO separate onboarding routes!
- Feels like natural workflow
- Easy to implement (already on /admin)
- User sees editor context immediately

**Cons:**
- Less visual theme selection (space constrained)
- No clear "onboarding complete" moment
- Might feel cluttered on mobile

---

## Theme Selection: Visual Upgrade Options

### Current State (Text Dropdown)
```
[Theme ▼]
  Modern Minimal
  Classic Elegant
  Bold Editorial
```

### OPTION A: Visual Cards with Color Swatches ⭐ RECOMMENDED

```
┌─────────────────────────────┐
│  Modern Minimal      [✓]    │  ← Selected: primary border
│  ●●●●                       │  ← 4 color dots from theme
│  Clean, professional, neutral│  ← Description
└─────────────────────────────┘
```

**Implementation:**
- Extract 4 key colors from each theme (primary, bg, text, accent)
- Show as color dots: 12px diameter, 4px gap
- Card: 44px min height (touch target)
- Selected state: 2px border, checkmark badge

**Pros:**
- Visual confidence without complexity
- No modal needed
- Fast to scan
- Mobile-friendly tap targets

**Cons:**
- Less preview than full mockup
- User trusts color palette more than layout

---

### OPTION B: Expandable Preview (Accordion)

```
┌─────────────────────────────┐
│  Modern Minimal      [>]    │  ← Collapsed
│  ●●●● Clean & professional  │
└─────────────────────────────┘
  ↓ Tap to expand
┌─────────────────────────────┐
│  Modern Minimal      [v]    │  ← Expanded
│  ●●●● Clean & professional  │
│                             │
│  ┌─────────────────────┐   │  ← Mini preview
│  │ [Sample layout]     │   │  ← 200px height
│  │  Name               │   │  ← Shows theme fonts/colors
│  │  Professional Title │   │
│  └─────────────────────┘   │
│                             │
│  [Select This Theme →]      │
└─────────────────────────────┘
```

**Pros:**
- More visual than Option A
- No modal complexity
- Mobile accordion pattern familiar

**Cons:**
- More vertical space
- Expand/collapse interactions
- Slower than cards

---

### OPTION C: Full-Screen Preview Modal

```
[Theme card tapped]
  ↓
Full-screen modal
┌─────────────────────────────────────┐
│  [X Close]  Modern Minimal Preview  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  [Full theme preview]         │ │  ← Full sample page
│  │  Shows real fonts, colors,    │ │  ← Scrollable
│  │  layout with sample content   │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Use This Theme →]                 │
└─────────────────────────────────────┘
```

**Pros:**
- Maximum visual confidence
- Closest to archived spec
- User sees real result

**Cons:**
- Complex modal implementation
- Slower workflow (open/close)
- Mobile full-screen can be jarring
- THIS IS WHAT BROKE BEFORE!

---

## Category + Project Creation: Speed Options

### OPTION A: Single Combined Form ⭐ RECOMMENDED

```
┌─────────────────────────────┐
│  Create Your First Project  │
│                             │
│  Category: [My Work____]    │  ← Pre-filled, editable
│  Project:  [____________]   │  ← Required
│  Image:    [+ Add image]    │  ← Optional
│                             │
│  [Start Building →]         │
└─────────────────────────────┘
```

**Time:** ~30 seconds  
**Result:** 1 category + 1 project created atomically

**Pros:**
- Fastest option
- Single submit
- Clear relationship (project IN category)
- Atomic creation (no orphaned data)

**Cons:**
- Less flexible (what if user wants different category name?)
- Assumes "My Work" is good default

---

### OPTION B: Smart Defaults (Auto-Create Category)

```
┌─────────────────────────────┐
│  Create Your First Project  │
│                             │
│  We'll add this to your     │
│  "My Work" category         │  ← Not editable
│                             │
│  Project Title: [_______]   │  ← Just one field!
│  Image: [+ Add image]       │  ← Optional
│                             │
│  [Start Building →]         │
│                             │
│  (You can create more       │
│   categories later)         │  ← Hint
└─────────────────────────────┘
```

**Time:** ~20 seconds  
**Result:** "My Work" category auto-created, 1 project in it

**Pros:**
- FASTEST option (one field only!)
- Zero decision fatigue
- User can rename category later in /admin/categories

**Cons:**
- Less agency (category name chosen for them)
- Assumes English-speaking user ("My Work")
- User might not realize category was created

---

### OPTION C: Two Sequential Forms

```
Step 3a: Category
┌─────────────────────────────┐
│  Create a Category          │
│                             │
│  Name: [My Work_____]       │  ← Pre-filled
│                             │
│  [Next →]                   │
└─────────────────────────────┘

Step 3b: Project
┌─────────────────────────────┐
│  Add Your First Project     │
│  to "My Work"               │
│                             │
│  Title: [____________]      │
│  Image: [+ Add image]       │
│                             │
│  [Start Building →]         │
└─────────────────────────────┘
```

**Time:** ~60-90 seconds  
**Result:** 1 category + 1 project, explicit creation

**Pros:**
- Clear separation of concerns
- User understands data model
- Matches existing /admin/categories flow

**Cons:**
- SLOWEST option
- Extra navigation
- Over-engineering for onboarding

---

## Integration: Where Does Onboarding Live?

### OPTION A: Separate Routes (/welcome/*) ⭐ RECOMMENDED

```
Routes:
  /                      → Homepage (Get Started button)
  /welcome/portfolio     → Step 1: Portfolio details
  /welcome/theme         → Step 2: Theme selection
  /welcome/first-project → Step 3: Category + project
  /admin                 → Editor (destination)
```

**Detection Logic:**
```typescript
// On /admin mount:
useEffect(() => {
  const hasPortfolio = await fetch('/api/portfolio')
  if (!hasPortfolio.data) {
    router.push('/welcome/portfolio')
  }
}, [])
```

**Pros:**
- Clean separation (onboarding vs editor)
- Easy to skip/revisit steps
- Can bookmark mid-flow
- Clear mental model (wizard flow)

**Cons:**
- More routes to maintain
- Need redirect logic
- Page transitions (loading states)

---

### OPTION B: Query Params (/admin?onboarding=true)

```
Routes:
  /                    → Homepage
  /admin?step=1        → Portfolio details (modal over /admin)
  /admin?step=2        → Theme selection (modal)
  /admin?step=3        → First project (modal)
  /admin               → Editor (no query params)
```

**Pros:**
- Single route
- Browser back works naturally
- Easy to test states

**Cons:**
- Modal complexity
- Shared state between modal and page
- User sees blurred /admin (confusing?)

---

### OPTION C: Inline Progressive Disclosure (Option 4 layout)

```
Route:
  /admin               → Everything happens here
    - Portfolio card (expanded if no portfolio)
    - First project card (appears after portfolio)
    - Editor (appears after project)
```

**Pros:**
- SIMPLEST implementation
- No routing needed
- Immediate context

**Cons:**
- Less clear "onboarding" boundary
- Harder to make theme selection visual
- Mobile feels cramped

---

## Responsive Strategy (Mobile-First)

### Mobile Layout (320px - 767px)

**All options must adapt:**

1. **Single column**: No side-by-side theme cards
2. **Full-width forms**: 100% width with 16px padding
3. **Sticky CTAs**: Bottom sticky bar on long forms
4. **44px touch targets**: All inputs and buttons
5. **Mobile keyboard**: `inputmode="text"` for name/slug

**Theme cards stack vertically:**
```
┌─────────────────┐
│  Modern Minimal │  ← Full width
│  ●●●●          │
└─────────────────┘
┌─────────────────┐
│  Classic        │
│  ●●●●          │
└─────────────────┘
```

### Desktop Layout (768px+)

**Enhancements:**

1. **Theme cards**: 2-column grid
2. **Centered layout**: Max-width 480px (Step 1,3), 720px (Step 2)
3. **Hover states**: Theme cards show subtle hover
4. **Keyboard nav**: Tab through fields smoothly

---

## Accessibility Requirements

All options must meet:

### Keyboard Navigation
- Tab order: Form fields → CTA → Skip link
- Focus visible: 2px outline on all interactive elements
- Escape key: Dismiss modals (if used)

### Screen Readers
```html
<form aria-labelledby="onboarding-title">
  <h1 id="onboarding-title">Create Your Portfolio</h1>
  
  <div role="group" aria-labelledby="name-label">
    <label id="name-label" for="name">Your Name</label>
    <input id="name" aria-required="true" />
  </div>
  
  <!-- Progress indicator -->
  <nav aria-label="Onboarding progress">
    <ol>
      <li aria-current="step">Portfolio Details</li>
      <li>Theme Selection</li>
      <li>First Project</li>
    </ol>
  </nav>
</form>
```

### ARIA Live Regions
```html
<div role="status" aria-live="polite">
  <!-- Announces: "Portfolio created successfully" -->
</div>
```

---

## Recommendations Summary

### 🏆 RECOMMENDED APPROACH: Option 1 + Option A (Theme) + Option A (Project)

**Structure:**
- 3 separate steps (/welcome/*)
- Visual theme cards with color swatches (no modal)
- Single combined form for category + project

**Why this combination:**
- **Proven pattern**: Multi-step wizards are familiar
- **Visual confidence**: Theme cards give enough preview without modal complexity
- **Speed**: 3-5 minute completion (meets <5 min target)
- **Mobile-first**: All components work well on phone
- **Simple to build**: No modal focus traps, no auth, no complex state
- **Avoids past problems**: Simpler than archived spec (no modal previews, no auth)

**Implementation Effort:**
- LOW: 3 routes, basic forms, existing components
- Theme cards: 2 hours
- Forms: 2 hours
- Integration: 1 hour
- **Total: ~5 hours**

---

### Alternative for Fastest Implementation: Option 4 + Option B (Smart Defaults)

**Structure:**
- Inline on /admin (no new routes)
- Radio button themes (minimal visual)
- Auto-create "My Work" category, just ask for project title

**Why consider:**
- **Fastest to build**: 2-3 hours total
- **No routing**: Everything on /admin
- **Speed**: <2 min completion
- **Works now**: Extends existing /admin form

**Trade-offs:**
- Less visual theme confidence
- No clear "onboarding complete" moment
- Mobile layout more cramped

---

## Success Criteria

Onboarding succeeds when:

✅ User completes flow in **<5 minutes** on mobile
✅ User **recognizes their vision** in theme selection (visual confidence)
✅ Portfolio + Theme + Category + Project created **atomically** (no partial state)
✅ User lands in /admin **ready to add more content** immediately
✅ **No authentication complexity** (preserves single-portfolio model)
✅ Mobile workflow feels **natural** (44px targets, clear CTAs)
✅ **Simpler than archived spec** (no breaking, fighting to keep it)

---

## Next Steps

**Decision needed:**
1. Which onboarding structure? (1, 2, 3, or 4)
2. Which theme selection? (A, B, or C)
3. Which category/project creation? (A, B, or C)

**After decision:**
1. Create route structure (if separate routes)
2. Design theme card component
3. Wire up API calls (portfolio → theme → category → project)
4. Test on mobile (iPhone)
5. Measure completion time

**Questions for you:**
- How important is visual theme preview vs speed?
- Would users trust color swatches, or need full preview?
- Is "My Work" a good default category name for your audience?
- Should users be able to skip project creation entirely?

---

## Files to Create/Modify

### If Option 1 (Recommended):

**New files:**
```
src/app/welcome/
  ├── portfolio/page.tsx      # Step 1: Portfolio details
  ├── theme/page.tsx          # Step 2: Theme selection
  └── first-project/page.tsx  # Step 3: Category + project

src/components/onboarding/
  ├── ThemeCard.tsx           # Visual theme card component
  ├── ProgressIndicator.tsx   # Step progress dots
  └── OnboardingLayout.tsx    # Shared layout wrapper
```

**Modified files:**
```
src/app/page.tsx               # Add redirect to /welcome if no portfolio
src/app/admin/page.tsx         # Add redirect to /welcome if no portfolio
src/components/admin/ThemeSelector.tsx  # Extract theme data for reuse
```

### If Option 4 (Inline):

**Modified files:**
```
src/app/admin/page.tsx         # Add progressive disclosure cards
src/components/admin/ThemeSelector.tsx  # Convert to radio buttons
```

**New files:**
```
src/components/admin/FirstProjectCard.tsx  # Project creation card
```

---

**End goal:** User says "I created my portfolio in 3 minutes and felt confident about my theme choice."
