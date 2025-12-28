# Portfolio Builder: Product Vision

**Status:** Immutable Strategic Reference  
**Purpose:** Durable product vision that guides implementation without prescribing details

---

## What We're Building

A **single-user portfolio builder** specifically designed for costume designers and creative professionals who need to showcase their work professionally online. The system enables users to select from professionally-designed themes, add and organize their work (text, images, galleries), and maintain their portfolio easily from any device—especially mobile.

This is **not** a generic website builder. It's a focused tool that prioritizes **speed of creation** and **ease of mobile updates** over complex customization options. Users work within well-designed theme constraints to ensure professional results without requiring design expertise.

---

## Why We're Building It

### User Pain Points Addressed

**Current solutions don't work well on mobile:**
- Existing portfolio builders have poor touch interfaces
- Photo uploads from phone are clumsy or unreliable
- Editing layouts on mobile is frustrating
- Creative professionals need to update from set, backstage, or on location

**Complex tools overwhelm non-technical creatives:**
- Too many options create decision paralysis
- Design-from-scratch builders require expertise users don't have
- Learning curves are steep when users just want to showcase work
- Technical barriers prevent users from maintaining their sites

**Need speed of creation AND professional results:**
- Can't afford hours to create initial portfolio
- Can't compromise on professional appearance
- Need quick updates without sacrificing quality
- Want confidence that the result will impress clients

---

## Success Looks Like

### User Success

- **Create professional portfolio in <30 minutes:** From selecting a theme to publishing first version with real content
- **Update from phone in <5 minutes:** Add production photos with captions while backstage or on set
- **"It just works" feedback:** Users feel delighted, not frustrated—the tool stays out of their way

### Technical Success

- **Page load <2s on 3G:** Real-world performance for visitors on slower connections
- **Mobile touch works reliably on iPhone/Android:** Tap, drag, long-press interactions feel native
- **Image optimization 60-80% size reduction:** Automatic optimization without quality loss
- **DOM parity: 100% match between editor and published:** WYSIWYG guarantee through shared components
- **Accessibility: WCAG AA compliance:** Professional portfolios are accessible to all visitors

### Business Success

- **User can publish complete professional portfolio:** All necessary features present to showcase work effectively
- **Users trust the publishing workflow:** Clear draft/preview/publish model prevents mistakes
- **Performance suitable for real-world use:** Fast enough and reliable enough for professional use

---

## Core Design Principles

### 1. Mobile-First Content Management

The editor must work **excellently** on iPhone, not just "okay." Creative professionals need to update portfolios from set, backstage, or on location. This means:

- Touch-friendly interfaces with 44px minimum targets
- Native-feeling gestures (long-press, swipe, pinch)
- Camera integration for quick photo uploads
- Keyboard-aware UI positioning
- Offline-capable with background sync

**Validation:** Test every feature on real iPhone before considering it complete.

### 2. Theme-Constrained Creativity

Users work within well-designed themes rather than building layouts from scratch. This ensures professional results without design expertise:

- Select from curated professional themes
- Customize colors and fonts within theme structure
- Layout decisions made by theme designer
- Component compatibility guaranteed by theme
- Focus user attention on content, not design decisions

**Why:** Removes decision paralysis and ensures quality outcomes.

### 3. WYSIWYG Editing

Direct manipulation where users see exactly what visitors will see. Editor and published site use the same React components:

- Click text to edit it inline
- See real fonts, colors, spacing during editing
- Preview is guaranteed accurate (same components)
- No surprises between editor and published site
- Build confidence through visual consistency

**Implementation:** Shared component library with `isEditing` prop, not separate preview renderer.

### 4. Explicit Publishing Model

Clear Draft → Preview → Publish workflow. Changes don't go live until explicitly published:

- **Draft State:** Auto-save every 30s, isolated from published site, visible only to editor
- **Preview:** Exact published appearance, shareable links with expiration, responsive testing
- **Publish:** Atomic operation, validation gates, rollback available, clear success confirmation
- **Critical:** Changes are NOT live until explicit publish action

**Why:** Prevents accidents, builds confidence, allows experimentation without risk.

### 5. Ruthless Simplicity

Use proven open-source libraries. Build only what's unique to our value proposition. Avoid over-engineering:

- Leverage existing solutions (Tiptap, dnd-kit, Sharp.js)
- Resist building custom versions of solved problems
- Question every feature: "Is this essential?"
- Remove features that don't serve core success criteria
- Trust emergence over premature abstraction

**Why:** Faster delivery, fewer bugs, easier maintenance, focused value.

---

## Architectural Principles

### DOM Parity Guarantee

**Requirement:** Editor canvas and published site must render identically using the same React components.

**Implementation:** 
- Same components used in editor and published site
- NOT separate preview renderer
- Use `isEditing` prop to toggle editing affordances
- Theme tokens applied identically in both contexts
- Responsive behavior identical

**Why:** Guarantees WYSIWYG without visual regression. Users see exactly what visitors will see.

**Validation:** 0% DOM difference between editor preview and published page.

### Publishing Model

Draft → Preview → Publish workflow with clear state management:

- **Draft State:** 
  - Auto-save every 30 seconds with visual indicator
  - All changes isolated from published site
  - Manual save button available for peace of mind
  - Drafts never visible to visitors

- **Preview:**
  - Exact published appearance (same rendering)
  - Responsive preview options (phone, tablet, desktop)
  - Shareable preview link with expiration
  - No draft indicators visible

- **Publish:**
  - Atomic operation (all or nothing)
  - Validation gates (accessibility, completeness checks)
  - Rollback to previous version available
  - Clear success confirmation with "View Site" link

- **Critical Requirement:** Changes are NOT live until explicit publish action. No auto-publishing, no "save means publish."

**Why:** Builds user confidence. Prevents mistakes. Enables safe experimentation.

---

## Scope Boundaries

### Phase 1: Functional Prototype (Slices 1-8)

**Core editing experience validation:**
- Text editing with professional formatting
- Image upload with optimization
- Gallery components
- Mobile editing validated on real devices
- Multi-page sites with navigation
- Draft/publish workflow

**User Value:** Can create and publish complete professional portfolio. Mobile editing proven to work.

**Intentionally deferred to Phase 2:**
- ⏸️ Authentication system (single-user focus, test with dev access first)
- ⏸️ Theme selection/customization (validate UX patterns with one theme first)

**Rationale:** Validate highest risk (mobile editing) and prove core value proposition before adding complexity. Get working prototype into users' hands for feedback.

### Phase 2: Production-Ready (After Phase 1 Validation)

**Will add:**
- Authentication with secure session management
- Theme selection and customization
- Accessibility audit and fixes
- Performance optimization and budgets
- Production deployment configuration

**Rationale:** After validating core experience works and users want it, add polish and security for production use.

### Not In Scope (Never Building)

These are **permanent exclusions**, not deferred features:

- ❌ **Team collaboration platform:** Single-user focused by design, occasional collaborator access only
- ❌ **Design-from-scratch page builder:** Theme-constrained by design to ensure quality
- ❌ **Complex customization options:** Intentionally limited to prevent decision paralysis
- ❌ **Social networking features:** Not a community platform
- ❌ **E-commerce capabilities:** Not a storefront builder
- ❌ **Multi-tenant SaaS platform:** Single-user installations

**Why exclude:** These would fundamentally change the product's focus and complicate the UX beyond our success criteria.

---

## Validation Framework

After each implementation slice and at project milestones, validate against our three primary personas:

### Marcus Williams - First Portfolio (New User)
**Question:** Can Marcus create his first professional portfolio in under 30 minutes without feeling overwhelmed?

**Success signals:**
- Completes setup without confusion
- Produces professional-looking result
- Feels confident sharing with potential clients
- No technical frustration

### Sarah Chen - Backstage Updates (Mobile Power User)
**Question:** Can Sarah add production photos and descriptions from her phone backstage in under 5 minutes?

**Success signals:**
- Camera-to-published workflow is smooth
- Touch interactions feel native
- No need to wait until she's at a computer
- Updates feel quick and effortless

### Emma Rodriguez - Extensive Work (Content Migration)
**Question:** Can Emma organize and showcase her 20+ years of work efficiently?

**Success signals:**
- Multi-page organization feels natural
- Bulk operations save time
- Navigation creation is straightforward
- Result feels comprehensive, not cluttered

### Validation Method

At each milestone:
1. Walk through user scenario as that persona
2. Note friction points and delights
3. Measure against time criteria (<30 min, <5 min)
4. Ask: "Would this person be delighted or frustrated?"

**Success means the answer is "yes" with delight, not grudging acceptance.**

---

## Design Philosophy Summary

This portfolio builder embodies a clear philosophy:

**For creative professionals** who need to showcase their work online,  
**Who are frustrated** by complex tools and poor mobile experiences,  
**Our product is** a focused portfolio builder  
**That provides** professional results through theme-constrained creativity and excellent mobile editing.

**Unlike** generic website builders and complex CMSs,  
**We prioritize** speed of creation and mobile-first updates over unlimited customization.

This philosophy guides every decision: when in doubt, choose simplicity, mobile excellence, and user confidence over features and flexibility.
