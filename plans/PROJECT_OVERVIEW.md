# Portfolio Builder: Strategic Overview

**Last Updated:** 2025-12-28  
**Status:** Planning Phase - Vertical Slice Approach (Option A: Simpler MVP)

---

## Executive Summary

A **single-user portfolio builder** for costume designers and creative professionals to create, manage, and publish professional portfolio websites. Built to prioritize **speed of creation** and **mobile-first editing** over complex customization.

### Core Success Criteria

A costume designer can:
1. **Create** a professional portfolio in under 30 minutes
2. **Update** from their phone in under 5 minutes (backstage/on-set)
3. **Publish** with confidence that it looks professional and loads fast

---

## Project Vision

### What We're Building

A web application that enables creative professionals to:
- Select from professionally-designed themes
- Add and organize their work (text, images, galleries)
- Edit directly on their phone with excellent touch support
- Publish fast-loading, SEO-optimized portfolio sites
- Update content easily without technical knowledge

### What We're NOT Building (Initially)

**Phase 1 MVP (Slices 1-8) intentionally defers:**
- ⏸️ Authentication system (coming in Phase 2)
- ⏸️ Theme selection/customization (coming in Phase 2)

**Not in project scope:**
- ❌ Team collaboration platform (single-user focused)
- ❌ Design-from-scratch page builder (theme-constrained)
- ❌ Complex customization options (intentionally limited)
- ❌ Social networking features
- ❌ E-commerce capabilities

---

## Key Design Principles

### 1. Mobile-First Content Management
The editor must work **excellently** on iPhone, not just "okay." Creative professionals need to update portfolios from set, backstage, or on location.

### 2. Theme-Constrained Creativity
Users work within well-designed themes rather than building layouts from scratch. This ensures professional results without design expertise.

### 3. WYSIWYG Editing
Direct manipulation where users see exactly what visitors will see. Editor and published site use the same React components.

### 4. Explicit Publishing Model
Clear Draft → Preview → Publish workflow. Changes don't go live until explicitly published.

### 5. Ruthless Simplicity
Use proven open-source libraries. Build only what's unique to our value proposition. Avoid over-engineering.

---

## Target Users

### Primary: Sarah Chen - Theatre Costume Designer
- **Needs:** Showcase work to directors and producers
- **Workflow:** Often updates from backstage or on set
- **Pain Points:** Current solutions don't work well on mobile
- **Success Metric:** Can add production photos from phone in <5 minutes

### Secondary: Marcus Williams - Freelance Fashion Designer
- **Needs:** First professional web presence
- **Workflow:** Updates after each photoshoot
- **Pain Points:** Not technically savvy, overwhelmed by complex tools
- **Success Metric:** Creates first portfolio in <30 minutes

### Tertiary: Emma Rodriguez - Film Costume Supervisor
- **Needs:** Organize 20+ years of work
- **Workflow:** Password-protects unreleased work
- **Pain Points:** Existing site is outdated and hard to manage
- **Success Metric:** Migrates extensive portfolio efficiently

Full user scenarios: See `orig-plans/user-success-scenarios.md`

---

## Technical Architecture

### Tech Stack (Validated)

| Layer | Technology | Rationale |
|-------|-----------|-----------||
| **Framework** | Next.js 14+ App Router | SSR for performance, built-in optimization |
| **Styling** | Tailwind CSS + CSS Variables | Theme flexibility + performance |
| **UI Components** | shadcn/ui (Radix + Tailwind) | Accessible primitives, full control |
| **Page Builder** | dnd-kit (custom) | Only option with full mobile touch support |
| **Rich Text** | Tiptap | ProseMirror foundation, mobile-friendly |
| **Images** | Sharp.js | Industry standard optimization |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Local-first, host-ready |
| **Auth** | Session-based (custom) | Simple, secure, single-user focused _(Phase 2)_ |

**Key Decision:** After spike evaluation, dnd-kit was selected over Craft.js and Builder.io for reliable mobile touch support.

Full tech decisions: See `orig-plans/work-packages/foundation/tech-decisions.md`

---

## Development Approach: Vertical Slices

### Why Vertical Slices?

**Previous Attempt:** Horizontal layers (Foundation → Capabilities → Flows → Polish)  
**Problem:** No working software until 11+ artifacts complete. Integration risk pushed to end.

**New Approach:** Vertical slices delivering complete user value  
**Benefit:** Working demo after each slice. Continuous integration testing. Early feedback.

### Slice Principles

Each slice must:
- ✅ Deliver complete end-to-end user value
- ✅ Be truly self-contained (300-500 lines)
- ✅ Be demoable immediately
- ✅ Test integration continuously
- ✅ Build on previous slices incrementally

### Phase 1 MVP: Vertical Slice Sequence

Detailed slice breakdown: See `plans/SLICE_BREAKDOWN.md`

**Phase 1 Slices (Functional Prototype - No Auth/Themes):**

1. **Static Page Foundation** - Create/edit/save/publish simple text portfolio
2. **Rich Text Editing** - Professional formatting with Tiptap (headings, bold, links)
3. **Single Image Upload** - Add and optimize images with Sharp.js
4. **Mobile Editing Basics** - Touch-friendly editing on iPhone (critical validation)
5. **Component System & Sections** - Multi-section pages with dnd-kit reordering
6. **Image Gallery Component** - Professional grid layouts with multiple images
7. **Multiple Pages & Navigation** - Organize work into separate pages
8. **Draft/Publish Workflow** - Safe editing with preview before publishing

### Phase 1 vs Phase 2: Strategic Scope Decision

**Why defer Auth & Themes to Phase 2?**

Following the **ruthless simplicity** principle, we're prioritizing validation of the **core editing experience** before adding polish and security layers.

**Phase 1 Rationale:**
- **Validate highest risk first:** Mobile editing is our biggest technical risk (Slice 4)
- **Prove core value:** Can users create and update portfolios quickly? (Success criteria)
- **Test with real content:** Use functional prototype for user feedback and design iteration
- **Avoid premature design:** Theme system decisions should be informed by real usage patterns

**Phase 1 Outcome:**
A working portfolio builder that demonstrates complete user flows, validates mobile touch interactions, and provides a **functional prototype** for gathering user feedback and creating high-fidelity mockups.

**Phase 2 Additions:**
After validating the core experience, we'll add:
- **Authentication:** Secure single-user login with session management
- **Theme System:** Professional design themes with color/font customization
- **Polish:** Accessibility validation, performance optimization, production hardening

**Timeline Strategy:**
1. **Phase 1:** Build functional prototype (7-11 weeks)
2. **Design Spike:** Create mockups and gather user feedback with working prototype (1-2 weeks)
3. **Phase 2:** Add auth, themes, and production polish (4-6 weeks)

This approach ensures we're building the *right* thing before we build it *right*.

---

## Success Metrics

### User Success
- **Time to first portfolio:** <30 minutes
- **Mobile update time:** <5 minutes
- **User satisfaction:** "It just works" feedback

### Technical Success
- **Page load:** <2s on 3G
- **Mobile touch:** Works reliably on iPhone/Android
- **Image optimization:** 60-80% size reduction
- **DOM parity:** 100% match between editor and published
- **Accessibility:** WCAG AA compliance

### Business Success
- **Completeness:** User can publish professional portfolio
- **Confidence:** Users trust the publishing workflow
- **Performance:** Fast enough for real-world use

---

## Current Status

### Phase: Planning & Slice Design

**Completed:**
- ✅ User research and scenarios
- ✅ Tech stack evaluation (spikes)
- ✅ Core tech decisions validated
- ✅ Initial architecture defined
- ✅ Vertical slice breakdown (Option A: 8 slices approved)

**In Progress:**
- → Finalizing individual slice specification files

**Next Steps:**
1. Complete slice specification files in plans/slices/
2. Implement Slice 1: Static Page Foundation
3. Demo and validate approach
4. Continue through slices 2-8

---

## Project Timeline (Estimated)

### Phase 1: Functional Prototype (Slices 1-8)

**Slices 1-3: Foundation**
**Duration:** 2-3 weeks  
**Deliverable:** Text + image portfolio with basic publishing

**Slice 4: Mobile Validation (CRITICAL)**
**Duration:** 1-2 weeks  
**Deliverable:** Confirmed mobile editing works on real iPhone

**Slices 5-6: Advanced Components**
**Duration:** 2-3 weeks  
**Deliverable:** Multi-section pages with galleries

**Slices 7-8: Multi-Page & Publishing**
**Duration:** 2-3 weeks  
**Deliverable:** Complete portfolio builder with draft/publish workflow

**Phase 1 Total:** 7-11 weeks to functional prototype

### Design Spike: Mockups & User Testing

**Duration:** 1-2 weeks  
**Deliverable:** High-fidelity mockups informed by working prototype, user feedback sessions

### Phase 2: Auth, Themes & Polish

**Authentication & Security**
**Duration:** 1-2 weeks  
**Deliverable:** Secure single-user login

**Theme System**
**Duration:** 2-3 weeks  
**Deliverable:** Professional themes with customization

**Production Hardening**
**Duration:** 1-2 weeks  
**Deliverable:** Accessibility, performance, deployment-ready

**Phase 2 Total:** 4-7 weeks

**Complete Project Timeline:** 13-20 weeks from start to production-ready

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------||
| Mobile touch unreliable | Already validated via dnd-kit spike, full validation in Slice 4 |
| Image optimization slow | Sharp.js is proven, will test early in Slice 3 |
| Publishing workflow complex | Explicit publish model, test in Slice 8 |
| Performance issues | Performance budgets from day 1 |
| Auth complexity | Deferred to Phase 2 after core validation |
| Theme system over-engineering | Deferred to Phase 2, informed by user feedback |

### Process Risks

| Risk | Mitigation |
|------|-----------||
| Scope creep | Strict slice boundaries, ruthless simplicity, deferred auth/themes |
| Integration failures | Vertical slices test integration continuously |
| Context overload for LLMs | 300-500 line slices, truly self-contained |
| Late feedback | Demo after each slice, design spike with working prototype |
| Building wrong features | Validate core UX in Phase 1 before polish in Phase 2 |

---

## Reference Documents

### Original Planning (Archive)
- `orig-plans/portfolio-vision-ux.md` - Detailed UX requirements
- `orig-plans/portfolio-tech-strategy.md` - Technical architecture deep-dive
- `orig-plans/portfolio-implementation-plan.md` - Original 5-phase approach
- `orig-plans/user-success-scenarios.md` - User personas and journeys
- `orig-plans/work-packages/` - Horizontal layer approach (superseded)

### Current Planning (Active)
- `plans/PROJECT_OVERVIEW.md` - This document
- `plans/SLICE_SESSION_GUIDE.md` - Guide for implementing each slice
- `plans/SLICE_BREAKDOWN.md` - Detailed vertical slice specifications (8 slices, Option A)
- `plans/slices/` - Individual slice specification files (01-08)

### Test Assets
- `test-assets/user-profiles/` - Realistic test data for Sarah, Marcus, Emma
- `test-assets/basic-testing/` - Generic test scenarios

---

## Questions & Decisions Log

### Open Questions
- When to schedule design spike? (After Slice 4? After Slice 8?)
- What tooling for mockups/clickthroughs? (HTML/CSS, Figma, other?)
- How much client feedback before Phase 2?

### Key Decisions
- **2025-12-28:** **Approved Option A (8 slices)** - Defer auth/themes to Phase 2, validate core experience first
- **2025-12-28:** Switched from horizontal layers to vertical slices
- **2025-12-27:** Selected dnd-kit for page builder after spike evaluation
- **2025-12-27:** Decided on Tiptap for rich text editing
- **2025-12-27:** Chose CSS custom properties + Tailwind for theming

---

## Getting Started

**For implementers:** Read `plans/SLICE_SESSION_GUIDE.md` for session setup and validation criteria.

**For reviewers:** This overview provides strategic context. Dive into `orig-plans/` for detailed UX and technical requirements.

**For stakeholders:** Focus on "Target Users" and "Success Metrics" sections above. Note the Phase 1 (functional prototype) vs Phase 2 (production-ready) strategic split.
