# Design to Tech Handoff

**Purpose:** Integrate design specifications into technical implementation plans  
**For:** Next tech-focused session to update slice specifications  
**Status:** Ready for review and integration  
**Date:** 2025-12-28

---

## What We Created (Design Spike Outcomes)

### Core Design Specifications

**Location:** `plans/design/`

| Document | Purpose | Status |
|----------|---------|--------|
| **CONTENT-MODEL.md** | Content hierarchy (categories → projects → images) | ✅ Complete |
| **TEMPLATE-SYSTEM.md** | How templates and themes combine | ✅ Complete |
| **AESTHETIC-GUIDE.md** | Visual principles from customer feedback | ✅ Complete |
| **DESIGN-SYSTEM.md** | Foundation tokens, component specs | ✅ Complete |
| **DESIGN-REQUIREMENTS.md** | Open questions (mostly answered) | ✅ Complete |

### Template Specifications

| Template | Description | Phase | Spec |
|----------|-------------|-------|------|
| **Featured Grid Landing** | Grid of 4-6 featured project cards | Phase 1 | templates/featured-grid-landing.md ✅ |
| **Clean Minimal** | Minimal landing, work-focused | Phase 2 | templates/clean-minimal.md ✅ |
| **Hero Carousel** | Rotating featured work | Phase 2 | Not yet created |

### Theme Specifications

| Theme | Description | Phase | Spec |
|-------|-------------|-------|------|
| **Modern Minimal** | Neutral, clean, professional (default) | Phase 1 | themes/modern-minimal.md ✅ |
| **Classic Elegant** | Warm, larger scale, sophisticated | Phase 1 | themes/classic-elegant.md ✅ |
| **Bold Editorial** | Dark, contemporary, sans-serif | Phase 1 | themes/bold-editorial.md ✅ |

### Component Specifications

| Component | Description | Spec |
|-----------|-------------|------|
| **Image Card Hover Overlay** | Featured cards with context on hover | components/image-card-hover-overlay.md ✅ |
| **Gallery Grid** | Organized image grid (not scroll) | components/gallery-grid.md ✅ |
| **Navigation** | Dynamic category-based navigation | components/navigation.md ✅ |
| **Project Hero** | Featured image + metadata | Not yet created (minor) |
| **Resume Download** | PDF download link/button | Not yet created (minor) |
| **Carousel** | Rotating images | Not yet created (Phase 2) |

### Working Demo

**Location:** `spikes/design/`

- Next.js app showing design system in action
- All 3 themes implemented and swappable
- Components demonstrated with real portfolio images
- **Purpose:** Visual reference for developers, validation of design decisions

---

## Critical Architectural Clarification

### Templates vs Themes (Important!)

The user clarified a critical point:

**We are NOT building:**
- ❌ Static site with preset layouts
- ❌ Pure visual theming (colors/fonts only)

**We ARE building:**
- ✅ Portfolio BUILDER with swappable templates
- ✅ Templates = Page structure + content organization patterns
- ✅ Themes = Visual styling (colors, fonts, spacing)
- ✅ User uploads content → Template structures it → Theme styles it → User tweaks with editor

**Implications for implementation:**
1. **Templates are swappable** - User can try different layouts with same content
2. **Categories are user-defined** - NOT preset as "Theatre/Film/Opera"
3. **Content model is flexible** - User creates their own organization
4. **Templates = React component sets** - Different page structure implementations
5. **Themes = CSS variable overrides** - Visual styling layer

---

## Content Model (Database Schema Impact)

**User-defined hierarchy:**
```
Portfolio
├── Settings
│   ├── Selected template ("featured-grid-landing")
│   ├── Selected theme ("modern-minimal")
│   └── Resume PDF (optional)
├── Categories (user creates: "Theatre", "Film", whatever)
│   └── Projects (user creates: "Hamlet 2024", etc.)
│       └── Images (user uploads)
│           └── Metadata (optional: captions, alt text)
```

**Key implementation points:**
- Categories: User-defined names, not hardcoded
- Featured selection: User marks projects as featured
- Display order: User controls (drag-and-drop)
- Metadata: ALL optional (works with just images)

**Database schema needed:**
- `categories` table (user_id, name, description, display_order)
- `projects` table (category_id, title, featured, featured_image_id, metadata, display_order)
- `images` table (project_id, file_url, alt_text, caption, display_order)
- `portfolio_settings` table (user_id, template, theme, resume_pdf_url)

**See:** CONTENT-MODEL.md for complete specification

---

## How This Integrates Into Slices

### Slice 1: Static Page Foundation (2-3 weeks)

**BEFORE design spike:**
- Build basic Next.js structure
- Generic components

**AFTER design spike (UPDATE NEEDED):**
- ✅ Implement design system tokens in globals.css
- ✅ Implement all 3 themes (Modern, Classic, Bold)
- ✅ Base components (Button, Card - design system specs)
- ✅ Typography and spacing following DESIGN-SYSTEM.md

**New acceptance criteria:**
- [ ] Design tokens match DESIGN-SYSTEM.md exactly
- [ ] All 3 themes render correctly
- [ ] Typography scales verified (1.25 for Modern, 1.333 for Classic)
- [ ] Contrast ratios validated (WCAG AA)

**Deliverable:** Design system foundation + theme switching working

---

### Slice 2: Rich Text Editing (2-3 weeks)

**BEFORE design spike:**
- Tiptap integration
- Text editing UI

**AFTER design spike (UPDATE NEEDED):**
- ✅ Text styles follow design system typography
- ✅ Editor toolbar uses design system buttons
- ✅ Matches theme colors (accent, backgrounds)

**New acceptance criteria:**
- [ ] Edited text matches published typography exactly
- [ ] Toolbar styled per design system
- [ ] Works with all themes

---

### Slice 3: Single Image Upload (2-3 weeks)

**BEFORE design spike:**
- Basic image upload
- Sharp.js optimization

**AFTER design spike (UPDATE NEEDED):**
- ✅ Generates 3 sizes per DESIGN-SYSTEM.md (display 1920px, thumb 400x300, blur 40px)
- ✅ WebP format with fallback
- ✅ 60-80% size reduction target

**New acceptance criteria:**
- [ ] Optimization meets performance targets
- [ ] Images render in design system components correctly

---

### Slice 4: Mobile Editing Basics (1-2 weeks)

**BEFORE design spike:**
- Touch interactions
- Mobile UI

**AFTER design spike (UPDATE NEEDED):**
- ✅ Touch targets ≥ 44px (per DESIGN-SYSTEM.md)
- ✅ Mobile-specific image card pattern (title below, not hover)
- ✅ Navigation mobile menu per navigation.md spec

**CRITICAL MILESTONE:** Validate design system works on real iPhone

**New acceptance criteria:**
- [ ] All components meet 44px touch target requirement
- [ ] Image cards show title below (not hover) on mobile
- [ ] Tested on real iPhone Safari
- [ ] Themes work on mobile (no layout breaks)

---

### Slice 5: Component System & Sections (2-3 weeks)

**BEFORE design spike:**
- Generic section components
- Basic layouts

**AFTER design spike (MAJOR CHANGES):**
- ✅ Implement **Featured Grid Landing template**
- ✅ Image Card with Hover Overlay component
- ✅ Hero section (name + resume + featured work)
- ✅ Handles user-defined categories

**New components to build:**
- ImageCardHoverOverlay (desktop hover, mobile title-below)
- FeaturedWorkGrid (responsive 3/2/1 columns)
- HeroSection (centered name + resume)

**New acceptance criteria:**
- [ ] Featured Grid template fully implemented
- [ ] Image cards match hover overlay spec exactly
- [ ] Hover overlays on desktop, title below on mobile
- [ ] Works with 0, 1, 6, or 12 featured projects (graceful)
- [ ] Works with all 3 themes
- [ ] Performance: Landing loads <2.5s with 6 images

**Deliverable:** First complete template working

---

### Slice 6: Image Gallery Component (2-3 weeks)

**BEFORE design spike:**
- Basic image gallery
- Grid layout

**AFTER design spike (UPDATE NEEDED):**
- ✅ Gallery Grid component per gallery-grid.md spec
- ✅ Responsive (4/3/2 columns desktop/tablet/mobile)
- ✅ Lightbox on click
- ✅ Pagination after 20 images

**New acceptance criteria:**
- [ ] Grid matches gallery-grid.md specification
- [ ] 4 columns desktop, 3 tablet, 2 mobile
- [ ] Click image → Lightbox with prev/next
- [ ] Keyboard navigation (arrows, escape)
- [ ] Pagination for >20 images
- [ ] Performance: Lazy-load below fold

**Deliverable:** Project detail pages with organized galleries

---

### Slice 7: Multiple Pages & Navigation (2-3 weeks)

**BEFORE design spike:**
- Basic multi-page navigation
- Page routing

**AFTER design spike (UPDATE NEEDED):**
- ✅ Dynamic navigation per navigation.md spec
- ✅ Adapts to user's categories (not hardcoded)
- ✅ Direct links (≤5 categories) or dropdown (>5 categories)
- ✅ Mobile hamburger menu

**New acceptance criteria:**
- [ ] Navigation adapts to 2-10 user-defined categories
- [ ] Category names are user-defined (not preset)
- [ ] Mobile menu matches navigation.md spec
- [ ] Breadcrumbs on project pages
- [ ] Resume download link (if provided)

**Deliverable:** Complete navigation system working with user-defined categories

---

### Slice 8: Draft/Publish Workflow (2-3 weeks)

**BEFORE design spike:**
- Draft/publish state management
- Preview mode

**AFTER design spike (NEW REQUIREMENT):**
- ✅ Template swapping in draft mode
- ✅ Theme swapping in draft mode
- ✅ Preview shows exact published appearance

**New acceptance criteria:**
- [ ] User can change template in draft (Featured Grid ↔ Clean Minimal)
- [ ] User can change theme in draft (Modern ↔ Classic ↔ Bold)
- [ ] Preview shows template + theme + content combination
- [ ] Publish locks current template + theme selection
- [ ] Published site renders identically to preview (DOM parity)

---

## New Slice Acceptance Criteria Updates Needed

### Across All Slices:

**Add to every slice's success criteria:**
- [ ] Uses design system tokens (no hardcoded colors/sizes)
- [ ] Works with all 3 themes (test by swapping)
- [ ] Matches component specifications exactly
- [ ] Touch targets ≥ 44px on mobile
- [ ] Contrast ratios validated (WCAG AA)
- [ ] Tested on real iPhone

**Remove from slices:**
- ❌ "Build theme system" (moved to Slice 1 - already defined)
- ❌ Vague "professional appearance" (now have specific specs)

---

## Template Implementation Strategy

### Phase 1: Featured Grid Template

**Build order:**
1. **Slice 1:** Design system + themes (foundation)
2. **Slices 2-4:** Base components
3. **Slice 5:** Featured Grid Landing page
4. **Slice 6:** Gallery Grid + Project Detail page
5. **Slice 7:** Category pages + Navigation
6. **Slice 8:** Template swapping UI

**Result after Phase 1:**
- Users have ONE complete template (Featured Grid)
- Users can choose from 3 themes (Modern, Classic, Bold)
- Users can upload content, organize by categories/projects
- Fully functional portfolio builder

### Phase 2: Additional Templates

**After design validation:**
1. Clean Minimal template (maddievare.com style)
2. Hero Carousel template (mackenzie-hues.com style)
3. Template preview/comparison UI
4. Template marketplace (future: community templates)

---

## Open Questions for Tech Session

### Implementation Questions

**1. Template swapping mechanism:**
- Store template choice in database or local storage?
- How to preview multiple templates side-by-side?
- Can user swap template without losing edits?

**2. Featured project limits:**
- Hard cap (max 12 featured) or soft recommendation?
- What happens if user marks 20 projects as featured?

**3. Category limits:**
- Max categories before navigation breaks?
- Dropdown threshold (>5 categories) or different number?

**4. Image count limits:**
- Max images per project (50? 100? unlimited)?
- Performance implications with 100-image galleries

**5. Carousel implementation (Phase 2):**
- Auto-rotate or manual only?
- If auto-rotate, what timing? (5s per image?)
- Pause on hover behavior?

### Database Schema Questions

**6. Template/theme storage:**
```sql
-- Store as enum or string?
template_choice ENUM('featured-grid-landing', 'clean-minimal', 'hero-carousel')
theme_choice ENUM('modern-minimal', 'classic-elegant', 'bold-editorial')
```

**7. Featured project selection:**
```sql
-- Boolean on project OR separate featured_projects join table?
projects.featured BOOLEAN  -- Simpler
-- OR
featured_projects (portfolio_id, project_id, display_order)  -- More flexible
```

**8. Display ordering:**
```sql
-- Integer order field OR fractional (for easy reordering)?
display_order INTEGER  -- Simple, requires updates on reorder
display_order DECIMAL  -- Fractional indexing, fewer updates
```

---

## Integration Priorities

### High Priority (Phase 1)

**Must integrate into slices:**
1. Design system tokens (Slice 1) - CRITICAL
2. Featured Grid template (Slices 5-6) - CRITICAL
3. Image Card Hover component (Slice 5) - CRITICAL
4. Gallery Grid component (Slice 6) - CRITICAL
5. Dynamic navigation (Slice 7) - CRITICAL
6. User-defined categories (Slice 7) - CRITICAL

### Medium Priority (Phase 1)

**Should integrate:**
1. Theme swapping UI (Slice 8)
2. Template swapping UI (Slice 8)
3. All 3 themes implemented (Slice 1)

### Low Priority (Phase 2)

**Can defer:**
1. Clean Minimal template
2. Hero Carousel template
3. Additional components (carousel, lightbox enhancements)

---

## Slice Update Checklist

**For tech session, update each slice with:**

### Slice 1: Static Page Foundation
- [ ] Add: Implement design system from DESIGN-SYSTEM.md
- [ ] Add: Implement all 3 themes (modern-minimal.md, classic-elegant.md, bold-editorial.md)
- [ ] Add: Theme swapping functionality
- [ ] Remove: Generic "build theme system" (too vague)
- [ ] Update: Acceptance criteria with design token validation

### Slice 5: Component System & Sections
- [ ] Add: Implement Featured Grid Landing template (featured-grid-landing.md)
- [ ] Add: Implement Image Card Hover Overlay (image-card-hover-overlay.md)
- [ ] Add: Hero section specifications
- [ ] Update: Content model to support user-defined categories
- [ ] Update: Acceptance criteria with template validation

### Slice 6: Image Gallery Component
- [ ] Add: Implement Gallery Grid per gallery-grid.md
- [ ] Add: Lightbox functionality
- [ ] Add: Pagination for >20 images
- [ ] Update: Performance targets (<2.5s with images)

### Slice 7: Multiple Pages & Navigation
- [ ] Add: Dynamic navigation per navigation.md
- [ ] Add: User-defined category support
- [ ] Add: Category pages (same grid as featured work)
- [ ] Add: Breadcrumb navigation
- [ ] Remove: Hardcoded category assumptions

### Slice 8: Draft/Publish Workflow
- [ ] Add: Template swapping in draft mode
- [ ] Add: Theme swapping in draft mode
- [ ] Add: Preview template + theme combinations
- [ ] Update: DOM parity includes template + theme

---

## Key Design Decisions Made

**Document these in slice updates:**

### 1. Landing Page Pattern
**Decision:** Featured Grid (4-6 cards) for Phase 1  
**Rationale:** Simpler implementation, better mobile UX, all work visible at once  
**Alternative:** Hero Carousel in Phase 2

### 2. Mobile Hover Alternative
**Decision:** Title below image on mobile (not tap-to-toggle)  
**Rationale:** Standard mobile pattern, no hidden information, better UX  
**Implementation:** Media query `(hover: none)` shows title below

### 3. Default Theme
**Decision:** Modern Minimal  
**Rationale:** Clean, neutral, approachable (customer feedback), safe for broad appeal  
**Alternatives:** Classic Elegant (sophisticated), Bold Editorial (fashion-forward)

### 4. Typography Scale
**Decision:** 1.25 ratio (moderate) for Modern/Bold, 1.333 ratio (larger) for Classic  
**Rationale:** Approachable feel, not overwhelming, Classic offers dramatic alternative

### 5. Categories
**Decision:** User-defined, not preset  
**Rationale:** Flexibility (theatre, film, opera, sketches, crafts, personal, etc.)  
**Implementation:** Dynamic navigation adapts to user's category structure

### 6. Featured Work
**Decision:** User marks projects as featured (boolean flag)  
**Rationale:** Recent work visibility (customer got job because recent project was visible)  
**Implementation:** Featured projects query for landing page

---

## Customer Feedback Summary

**From interview 2025-12-28:**

**What makes portfolios feel amateur:**
- ❌ Cluttered layouts
- ❌ Generic templates (lack of control)
- ❌ Typography that changes randomly
- ❌ All images in long scroll (no organization)
- ❌ Too much empty space (Adobe Portfolio problem)

**What makes portfolios feel professional:**
- ✅ Clean, approachable
- ✅ Photos are the star (work speaks for itself)
- ✅ Meticulous organization (by project/production)
- ✅ Featured work prominent (recent work visible)
- ✅ Hover text overlays (context without clutter)
- ✅ Downloadable resume (not inline)
- ✅ Carousels for featured work rotation (appreciated)

**Favorite references:**
- **maddievare.com** - "Loved the landing page" (clean, work-focused)
- **nmhartistry.com** - Meticulous organization, sections
- **mackenzie-hues.com** - Scrolling images, clean

**Current site (dislikes):**
- **sashagoodner.com** - Too much empty space, Adobe Portfolio lacks control

---

## Technical Implications

### Component Architecture

**Shared components** (used by all templates):
- ImageCard (hover overlay or title-below)
- GalleryGrid (4/3/2 columns responsive)
- Navigation (dynamic category-based)
- Button (design system styled)
- ProjectHero (featured image + metadata)

**Template-specific components:**
- FeaturedGrid (Featured Grid template)
- HeroCarousel (Hero Carousel template - Phase 2)
- CenteredHero (Clean Minimal template - Phase 2)

**Implementation pattern:**
```typescript
// Template selection
const template = portfolioSettings.template;

// Render appropriate template with shared components
{template === 'featured-grid-landing' && (
  <FeaturedGridLanding 
    theme={portfolioSettings.theme}
    featuredProjects={projects.filter(p => p.featured)}
  />
)}
```

### Theme Implementation

**CSS cascade approach:**
```css
/* Base (Modern Minimal in :root) */
:root {
  --color-accent: hsl(220, 90%, 56%);
  --font-size-display: 3rem;
}

/* Theme override */
[data-theme="classic-elegant"] {
  --color-accent: hsl(25, 60%, 45%);
  --font-size-display: 4.2rem;  /* Larger */
}

/* Apply via data attribute */
<html data-theme="classic-elegant">
```

**User changes theme:**
- Update `data-theme` attribute
- CSS cascade applies new values
- Instant visual change (no page reload)

---

## Performance Considerations

**Templates must meet:**
- Landing page LCP: < 2.5s
- Navigation: Sticky without jank
- Image lazy-loading: Below-fold images
- Theme switching: Instant (CSS-only)

**Image optimization critical:**
- Sharp.js processing on upload
- WebP with JPEG fallback
- Responsive images (srcset)
- Blur placeholder while loading

---

## Accessibility Requirements

**All templates and themes must:**
- WCAG AA contrast: ≥ 4.5:1 text, ≥ 3:1 UI
- Keyboard navigable: Tab, Enter, Escape, Arrows
- Screen reader: Semantic HTML, ARIA labels
- Touch targets: ≥ 44px on mobile
- Reduced motion: Respect user preferences

**Validation:**
- Run Lighthouse accessibility audit
- Test with keyboard only
- Test with VoiceOver/NVDA
- Verify contrast ratios

---

## What's NOT in Design Specs (Implementation Decisions)

**These are for tech session:**

1. **WYSIWYG editing integration** - How editing affordances work with templates
2. **Drag-and-drop image reordering** - Implementation approach (dnd-kit)
3. **Featured project selection UI** - Where/how user marks projects as featured
4. **Category creation UI** - Forms, validation, management
5. **Template preview UI** - How user compares templates before choosing
6. **Theme preview UI** - How user compares themes (already in demo)
7. **Image upload flow** - Batch upload, progress indicators
8. **Lightbox implementation** - Libraries vs custom

**Design specs define WHAT, tech session defines HOW.**

---

## Validation Approach

**Design validation (this session):**
- ✅ Customer feedback incorporated
- ✅ Visual references analyzed
- ✅ Aesthetic principles documented
- ✅ Component specs created
- ✅ Template patterns defined
- ✅ Themes specified
- ✅ Working demo created

**Tech validation (next session):**
- Update slice specifications
- Map design specs to implementation tasks
- Estimate effort with design constraints
- Identify new components needed
- Plan template/theme system architecture
- Update acceptance criteria
- Update timeline

---

## Next Session Prompt

**Suggested prompt for tech-focused session:**

```
I've completed a design spike for the portfolio builder project. 

Design specifications are in plans/design/:
- DESIGN-SYSTEM.md (foundation)
- AESTHETIC-GUIDE.md (customer feedback)
- CONTENT-MODEL.md (content structure)
- TEMPLATE-SYSTEM.md (architecture)
- templates/ (3 template specs)
- themes/ (3 theme specs)
- components/ (key component specs)

We need to integrate these into the existing slice plans (plans/slices/).

Key changes:
1. Templates are swappable page structures (not just visual themes)
2. Categories are user-defined (not preset as Theatre/Film/Opera)
3. Featured work selection is critical (user controls landing page)
4. Image Card Hover Overlay is a key new component
5. Gallery Grid has specific organization requirements (not scroll)

Please review the design specs and update each slice specification with:
- Design system integration tasks
- New components to build
- Updated acceptance criteria
- Validation against design specs

Focus on Phase 1 slices (1-8). We'll tackle Phase 2 templates later.
```

---

## Files to Review Before Tech Session

**Essential reading:**
1. plans/design/DESIGN-SYSTEM.md (foundation)
2. plans/design/CONTENT-MODEL.md (data structure)
3. plans/design/TEMPLATE-SYSTEM.md (architecture)
4. plans/design/templates/featured-grid-landing.md (Phase 1 template)
5. plans/design/AESTHETIC-GUIDE.md (principles)

**Reference as needed:**
- Component specs (hover overlay, gallery grid, navigation)
- Theme specs (Modern, Classic, Bold)
- Working demo (spikes/design/)

---

## Success Metrics

**Design spike is successful if:**
- ✅ Specifications are complete (developers can implement)
- ✅ Based on real customer feedback (not assumptions)
- ✅ Durable (won't need major revision)
- ✅ Integrated into tech plans (next session)
- ✅ Demo validates design decisions (working spike)

**Implementation will be successful if:**
- Built portfolio matches design specifications
- Customer feedback incorporated (clean, organized, photos-first)
- Templates and themes work as specified
- User can create professional portfolio in <30 minutes
- Sarah can update from iPhone in <5 minutes

---

## Recommended Next Steps

**1. Review design specifications** (you)
- Read through plans/design/ documents
- Run spikes/design/ demo to visualize
- Note any questions or concerns

**2. Start tech-focused session** (new session)
- Load design specs as context
- Update slice specifications
- Integrate template/theme system
- Update acceptance criteria
- Revise effort estimates if needed

**3. Validate updated plans** (you + tech session)
- Do slices now build toward design specs?
- Are acceptance criteria measurable?
- Is timeline still realistic?
- Any new risks or dependencies?

**4. Begin Slice 1 implementation** (after plans updated)
- Build design system foundation
- Implement all 3 themes
- Validate with demo comparison

---

## Critical Success Factors

**For design specs to be useful:**
- ✅ Complete (no guessing needed)
- ✅ Specific (exact values, behaviors)
- ✅ Validated (customer feedback, references)
- ✅ Flexible (templates/themes swappable)
- ✅ Accessible (WCAG AA throughout)
- ✅ Mobile-first (Sarah's critical need)

**For tech integration to succeed:**
- Update ALL slice specs (not just Slice 1)
- Map design components to implementation tasks
- Validate timeline still realistic with design requirements
- Ensure DOM parity principle maintained (WYSIWYG)
- Plan for template swapping architecture

---

## Phase 2 Addition: Custom Theme System

**User request:** Allow theme customization with quality guardrails

**Approach:**
- Start from preset theme (Modern, Classic, or Bold)
- Customize colors (primary color input → generated palette)
- Customize fonts (from curated library of 6-8 options each)
- System validates accessibility (WCAG AA enforced)
- User saves custom theme, can create multiple

**Complete specification:** CUSTOM-THEME-SYSTEM.md

**Key features:**
- Algorithmic palette generation from 1 primary color
- Automatic contrast validation and adjustment
- Curated font library (no Comic Sans disasters)
- Preview with user's actual content
- Multiple custom themes per user

**Implementation estimate:** 1-1.5 weeks after Phase 1

**Priority:** Medium (Phase 2, after preset themes validated)

**Benefits:**
- Brand color integration (Marcus's logo color)
- Personal expression (Sarah's style preferences)
- Professional quality maintained (validation enforced)

**See:** CUSTOM-THEME-SYSTEM.md for:
- Color generation algorithm
- Font library specifications
- Validation rules
- UI mockups
- Database schema
- Implementation details

---

**Design spike complete. Ready for tech integration session.**
