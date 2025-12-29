# Landing Page Anti-Patterns

**Purpose**: Document design failures to avoid repeating mistakes

**Context**: Lessons learned from mockup session 462f5482-4519-4821-99b9-a488c457cf5d

---

## Anti-Pattern #1: Excessive Hero Whitespace (The "sashagoodner.com Problem")

**The Problem**: Full-screen hero sections that push all content below the fold

### What We Did Wrong (Original Specs)

**Featured Grid Template:**
- Hero with `minHeight: 100vh` 
- Padding: `--space-12` (96px) top/bottom
- Result: Massive whitespace around persona name with NO featured work visible without scrolling

**Clean Minimal Template:**
- Hero with `minHeight: 100vh` (explicitly full-screen)
- Padding: `--space-16` (128px) top/bottom
- Result: Even worse - user sees ONLY the name on initial viewport

### Why This Violated Customer Feedback

**Direct customer quote from research**: "I liked the sashagoodner.com layout BUT the landing page had too much whitespace and you had to scroll to see any work"

**What we ignored**: Customer explicitly said excessive whitespace was a pain point

**What we prioritized instead**: Aesthetic differentiation (templates feeling "different") over user needs (seeing work immediately)

### The Fix

**Featured Grid:**
- Removed `minHeight: 100vh`
- Reduced padding from `--space-12` to `--space-6` (96px → 32px)
- **Result**: First row of featured work visible in initial viewport

**Clean Minimal:**
- Removed `minHeight: 100vh` 
- Reduced padding from `--space-16` to `--space-8` (128px → 48px)
- **Result**: First featured image visible without scrolling

### The Principle

**"Photos Immediately Visible"** - First featured image MUST appear in initial viewport on landing pages

**Rationale**:
- Portfolio = visual work, not text about visual work
- Users arrive to see costumes/designs, not read about the designer
- If work is hidden, users may bounce before scrolling
- Content visibility > aesthetic differentiation

### When Full-Screen Heroes ARE Appropriate

**Legitimate use cases**:
- About page (text-focused, story-telling)
- Contact page (form-focused, no visual work)
- Project detail pages (context before gallery)

**NOT appropriate**:
- Landing pages (work should be immediately visible)
- Category pages (grid of work should start high)
- Any page where images are the primary content

---

## Anti-Pattern #2: Redundant Hero Images on Project Pages

**The Problem**: Showing the same image twice in different contexts

### What We Did Wrong

**Original spec**:
- Project detail page had a "featured image" as hero
- Followed by "Full Gallery" with grid of all images
- **Problem**: Featured image was also the first gallery image = duplication

### Why This Was Wrong

**User experience issues**:
- Visual redundancy (same image twice on one page)
- Extra scrolling required to reach gallery
- Confused information hierarchy (is the hero special or just first?)

**Design principle violated**: Don't show the same content twice unless there's a compelling reason

### The Fix

**Restructured project detail page**:
- Removed separate "featured image" hero
- First gallery image serves as the visual anchor
- Gallery starts immediately after description
- **Result**: No duplication, more efficient layout

### The Principle

**"Every Element Earns Its Place"** - If content appears twice, one instance should be removed

---

## Anti-Pattern #3: Credits Section on Portfolio Pages

**The Problem**: Listing collaborators on every project page

### What We Did Wrong

**Original spec**:
- Project detail pages included "Credits" section
- Listed Director, Production Designer, etc.
- **Problem**: Portfolio is about the DESIGNER'S work, not the team

### Why This Was Wrong

**Context misunderstanding**:
- Theatre/film work is collaborative, BUT...
- Portfolio purpose = showcase THIS person's work
- Listing others dilutes focus on the designer
- Credits belong in program notes, not portfolio

**User feedback**: Client explicitly didn't want credits

### The Fix

**Removed Credits section entirely**:
- Focus stays on designer's work
- Images and descriptions tell the story
- No distraction from the designer's contribution

### The Principle

**"Portfolio = Personal Work"** - Keep focus on the person, not the team

**When credits ARE appropriate**:
- Resume/CV (different context)
- Collaborative projects where team is the product
- Academic/research portfolios (co-authors expected)

---

## Anti-Pattern #4: Amateurish Theme Colors

**The Problem**: Generic, uninteresting background colors that feel default

### What We Did Wrong

**Original theme colors**:
- Modern Minimal: Pure white `hsl(0, 0%, 100%)`
- Classic Elegant: White `hsl(0, 0%, 98%)`
- Bold Editorial: Black `hsl(0, 0%, 5%)`

**Problem**: Two whites and one black - felt like defaults, not intentional choices

### Why This Was Wrong

**Design feedback**: "These feel amateurish - not distinctive enough"

**Issue**: Colors didn't establish mood or personality, just filled space

### The Fix

**Finalized colors with intentional character**:

**Modern Minimal - Cool Gallery:**
```css
--color-background: hsl(210, 15%, 97%);  /* Subtle blue-gray (museum walls) */
```

**Classic Elegant - Warm Editorial:**
```css
--color-background: hsl(40, 30%, 95%);   /* Rich warm cream, more saturated */
```

**Bold Editorial - Dramatic Fashion:**
```css
--color-background: hsl(240, 8%, 12%);   /* Deep navy-black */
```

### The Principle

**"Colors Establish Context"** - Every color choice should communicate mood and personality

**Each theme now signals**:
- Modern = Gallery space (cool, professional)
- Classic = Heritage craft (warm, established)
- Bold = Contemporary fashion (dramatic, navy-black vs pure black)

---

## Anti-Pattern #5: Template Elements That Feel Template-y

**The Problem**: Generic labels and sections that scream "this is a template"

### What We Did Wrong

**Original specs included**:
- "Featured Work" heading on landing pages
- "Full Gallery" heading on project pages
- Generic, obvious labels that felt prefabricated

### Why This Was Wrong

**User perception**: These headings made the portfolio feel like a fill-in-the-blank template, not a custom design

**Better approach**: Let content speak for itself without labeling everything

### The Fix

**Removed template labels**:
- No "Featured Work" heading (work is obviously featured)
- No "Full Gallery" heading (it's clearly a gallery)
- Let visual hierarchy and content organization do the work

### The Principle

**"Let Design Organize, Not Labels"** - If a heading states the obvious, remove it

**When labels ARE needed**:
- Categories (user-defined, not obvious)
- Sections with multiple types (About, Credits if included)
- Navigation (necessary for wayfinding)

---

## Design Review Checklist

Before finalizing any design, verify:

- [ ] **Hero sections**: First featured content visible without scrolling?
- [ ] **Redundancy check**: Any content shown twice on same page?
- [ ] **Focus check**: Does every element keep focus on the designer's work?
- [ ] **Color intention**: Do colors establish mood/personality, not just fill space?
- [ ] **Template smell**: Any generic labels that could be removed?

---

## Process Lesson

**What went wrong**: Original specs violated documented customer feedback (excessive whitespace)

**Why it happened**: Prioritized aesthetic differentiation (templates feeling "different") over user needs (seeing work immediately)

**How we caught it**: Mockup session with client review revealed the issues

**How to prevent**: 
1. Design agent consultation BEFORE finalizing specs
2. Five Pillars validation for all decisions
3. Customer feedback takes priority over aesthetic preferences
4. Build mockups early to catch issues before implementation

---

**Last Updated**: 2025-12-29 (from mockup session 462f5482-4519-4821-99b9-a488c457cf5d)
