# Design Specifications

**Status:** Complete - Ready for Tech Integration  
**Purpose:** Visual design specifications that guide implementation  
**Created:** 2025-12-28 (Design Spike)

---

## What's Here

Complete design specifications based on customer feedback and reference portfolio sites.

**Key insight:** We're building a portfolio BUILDER with swappable templates (page structures) and themes (visual styles), not a static site.

---

## Start Here

### For Stakeholders

**Read in this order:**
1. **[AESTHETIC-GUIDE.md](AESTHETIC-GUIDE.md)** - Visual principles from customer feedback
   - What makes portfolios feel professional vs amateur
   - Preferred patterns (featured work, hover overlays, organization)
   - Reference sites analyzed

2. **[CONTENT-MODEL.md](CONTENT-MODEL.md)** - How content is organized
   - Categories → Projects → Images (user-defined hierarchy)
   - Featured work selection
   - Upload workflows

3. **[TEMPLATE-SYSTEM.md](TEMPLATE-SYSTEM.md)** - How templates and themes work together
   - Templates = page structure (swappable)
   - Themes = visual styling (swappable)
   - How they combine

---

### For Developers (Next Tech Session)

**Start here:**
1. **[HANDOFF-TO-TECH.md](HANDOFF-TO-TECH.md)** - Integration guide
   - How to update slice specifications
   - Design decisions made
   - Implementation priorities
   - Open questions for tech session

**Then review:**
2. **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** - Foundation tokens and specifications
3. **templates/** - Template specifications
4. **themes/** - Theme specifications
5. **components/** - Component specifications

---

## Directory Structure

```
plans/design/
├── README.md (you are here)
│
├── AESTHETIC-GUIDE.md          ✅ Visual principles
├── CONTENT-MODEL.md            ✅ Content structure
├── TEMPLATE-SYSTEM.md          ✅ Architecture
├── DESIGN-SYSTEM.md            ✅ Foundation tokens
├── DESIGN-REQUIREMENTS.md      ✅ Open questions (mostly answered)
├── HANDOFF-TO-TECH.md          ✅ Tech integration guide
│
├── templates/
│   ├── featured-grid-landing.md   ✅ Phase 1 (primary template)
│   └── clean-minimal.md           ✅ Phase 2 (customer's favorite landing)
│
├── themes/
│   ├── modern-minimal.md          ✅ Default (neutral, clean)
│   ├── classic-elegant.md         ✅ Warm, sophisticated
│   └── bold-editorial.md          ✅ Dark, contemporary
│
└── components/
    ├── image-card-hover-overlay.md  ✅ Key component
    ├── gallery-grid.md              ✅ Organized galleries
    └── navigation.md                ✅ Dynamic nav
```

---

## Key Design Decisions

### 1. Templates (Page Structure)

**Phase 1:** Featured Grid Landing
- Name + Resume + Grid of 4-6 featured project cards
- Reference: nmhartistry.com (meticulous organization)

**Phase 2:** Clean Minimal
- Minimal landing, work-focused
- Reference: maddievare.com (customer's favorite)

**User can swap templates** - Same content, different structure

---

### 2. Themes (Visual Styling)

**Phase 1:** All 3 themes implemented

- **Modern Minimal** (default) - Neutral white/blue, professional
- **Classic Elegant** - Warm cream/terracotta, larger typography
- **Bold Editorial** - Dark/pink, sans-serif fonts, contemporary

**User can swap themes** - Same structure, different appearance

---

### 3. Content Organization

**User-defined categories:**
- NOT preset as "Theatre/Film/Opera"
- User creates: Whatever makes sense for their work
- Navigation adapts dynamically

**Featured work:**
- User marks projects as featured
- Featured projects appear on landing page
- Critical for visibility (customer insight)

---

### 4. Image Card Pattern

**Desktop:** Clean image, hover reveals text overlay  
**Mobile:** Image with title/metadata below (no hover)

**Customer feedback:** "Liked text overlay on hover"

---

### 5. Gallery Organization

**NOT endless scroll** (feels amateur)  
**Grid organized by project** (professional)  
**Pagination** after 20 images

---

## Customer Feedback Summary

**What we learned:**

**Preferences:**
- Approachable and clean (not overwhelming)
- Photos are the star (work speaks for itself)
- Featured work prominent (recent projects visible)
- Organized by project (not endless scroll)
- Hover text overlays (context without clutter)
- Downloadable resume (not inline)
- Meticulous organization (nmhartistry.com)
- Clean landing page (maddievare.com)

**Anti-patterns to avoid:**
- Cluttered layouts
- Generic templates (Adobe Portfolio problem)
- Typography that changes randomly
- Too much empty space with no control
- All images in long scroll

---

## Working Demo

**Location:** `spikes/design/`

Live Next.js app demonstrating:
- Design system tokens implemented
- All 3 themes working and swappable
- Component examples (buttons, cards, gallery)
- Real portfolio images from test-assets
- Responsive behavior

**To view:**
```bash
cd spikes/design
npm run dev
# → http://localhost:3000
```

**Purpose:** Visual reference for developers, validation that design specs are implementable

---

## Next Steps

### 1. Review Design Specs (You)
- Read through documents in this directory
- Run demo to visualize
- Note any questions or concerns

### 2. Tech Integration Session (New Session)
- Load HANDOFF-TO-TECH.md as starting context
- Update slice specifications in plans/slices/
- Integrate template/theme system architecture
- Update acceptance criteria with design requirements
- Validate timeline still realistic

### 3. Begin Implementation (After Plans Updated)
- Slice 1: Design system + themes
- Slices 2-4: Base components
- Slices 5-6: Featured Grid template
- Slices 7-8: Navigation + publishing

---

## Questions?

**Unclear about design decisions?** → See AESTHETIC-GUIDE.md  
**Unclear about content structure?** → See CONTENT-MODEL.md  
**Unclear about templates vs themes?** → See TEMPLATE-SYSTEM.md  
**Ready for tech integration?** → See HANDOFF-TO-TECH.md

---

**Design spike complete. Ready for technical integration.**
