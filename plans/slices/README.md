# Vertical Slice Specifications

## Overview

This directory contains 8 self-contained slice specifications for Phase 1 (Functional Prototype). Each slice delivers complete end-to-end user value and can be implemented independently.

## Phase 1: Functional Prototype

### Build Order

| # | Slice | Duration | Status |
|---|-------|----------|--------|
| 1 | [Static Page Foundation](01-static-page-foundation.md) | 2-3 weeks | Not Started |
| 2 | [Rich Text Editing](02-rich-text-editing.md) | 2-3 weeks | Not Started |
| 3 | [Single Image Upload](03-single-image-upload.md) | 2-3 weeks | Not Started |
| 4 | [Mobile Editing Basics](04-mobile-editing-basics.md) | 1-2 weeks | Not Started |
| 5 | [Component System & Sections](05-component-system-sections.md) | 2-3 weeks | Not Started |
| 6 | [Image Gallery Component](06-image-gallery-component.md) | 2-3 weeks | Not Started |
| 7 | [Multiple Pages & Navigation](07-multiple-pages-navigation.md) | 2-3 weeks | Not Started |
| 8 | [Draft/Publish Workflow](08-draft-publish-workflow.md) | 2-3 weeks | Not Started |

**Total Estimate:** 7-11 weeks for functional prototype

### Critical Milestone: Slice 4 🎯

**Slice 4 (Mobile Editing Basics) is a GO/NO-GO checkpoint.**

Before proceeding to slices 5-8, validate:
- ✅ Can Sarah update her portfolio from iPhone in <5 minutes?
- ✅ Touch interactions work reliably on real device
- ✅ Mobile editing feels excellent, not just "okay"

If NO to any: Fix mobile experience before continuing  
If YES to all: Proceed with confidence to complex features

### Integration Checkpoints

**After Slice 3:** Test Marcus creating first portfolio  
**After Slice 5:** Test Sarah mobile update + Marcus first portfolio  
**After Slice 8:** Full validation of all scenarios

## Reading Order for Implementers

### Before Starting Any Slice

1. **[VISION.md](../VISION.md)** - Understand the "why" and success criteria
2. **[USERS.md](../USERS.md)** - Understand who you're building for
3. **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Technical decisions and patterns
4. **[IMPLEMENTATION_APPROACH.md](../IMPLEMENTATION_APPROACH.md)** - Vertical slice methodology
5. **[IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Practical implementation patterns

### When Starting a Specific Slice

1. Read your slice spec (e.g., `01-static-page-foundation.md`)
2. Review previous slice README if this is slice 2+
3. Check previous slice integration points
4. Set up test data from `../test-data/`
5. Begin implementation

## Slice Dependencies

```
Slice 1 (Foundation)
  ↓
Slice 2 (Rich Text) - Builds on Slice 1
  ↓
Slice 3 (Images) - Builds on Slices 1-2
  ↓
Slice 4 (Mobile) - CRITICAL VALIDATION - Builds on Slices 1-3
  ↓
Slice 5 (Sections) - Builds on Slices 1-4
  ↓
Slice 6 (Gallery) - Builds on Slices 1-5
  ↓
Slice 7 (Multi-Page) - Builds on Slices 1-6
  ↓
Slice 8 (Publishing) - Builds on Slices 1-7
```

## Slice Structure

Each slice specification includes:

- **Header** - Slice number, phase, duration, previous/next slices
- **User Value** - What the user can do after this slice
- **Scope** - What's included and explicitly NOT included
- **Size Estimate** - Line count breakdown
- **Tech Stack** - Technologies used in this slice
- **Key Files** - Files created/modified
- **Demo Script** - 30-second test scenario
- **Success Criteria** - Measurable checkboxes
- **Integration Points** - What next slice builds on

## After Slice 8: Design Spike

**Purpose:** Use working prototype for high-fidelity design validation

**Activities:**
1. Create mockups using actual prototype
2. User testing with Sarah, Marcus, Emma
3. Validate theme approach before building theme system
4. Gather feedback on aesthetics and flow
5. Prioritize Phase 2 features

**Duration:** 1-2 weeks

**Outcome:** Informed Phase 2 plan with real user validation

## Phase 2: Production-Ready (Future)

After design spike, add:
- Authentication & Security (1-2 weeks)
- Theme System (2-3 weeks)
- Production Hardening (1-2 weeks)

See `IMPLEMENTATION_APPROACH.md` for Phase 2 details.

## References

- **[../VISION.md](../VISION.md)** - Product vision and design principles
- **[../USERS.md](../USERS.md)** - User personas and success scenarios
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - Technical architecture and decisions
- **[../IMPLEMENTATION_APPROACH.md](../IMPLEMENTATION_APPROACH.md)** - Development methodology
- **[../IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Practical implementation guide
- **[../test-data/](../test-data/)** - Test user profiles and sample data

## Questions?

If slice specs are unclear or contradictory, refer to the core documents above or flag issues before starting implementation.
