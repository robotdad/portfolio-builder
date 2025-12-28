# Implementation Approach: Vertical Slices

## Overview

This project uses **vertical slice development** - each slice delivers complete end-to-end user value rather than building horizontal layers (database → API → UI).

**What this means:** Instead of building all database models, then all APIs, then all UI components, we build complete features one at a time. Each slice includes database, API, and UI for a specific user capability.

## Why Vertical Slices?

### Previous Attempt: Horizontal Layers

**Approach:** Foundation → Capabilities → Flows → Polish  
**Problem:** 
- No working software until 11+ artifacts complete
- Integration risk pushed to end
- No user feedback until late
- Context overload (2000+ line dependencies)
- Can't demo anything until most work is done

### New Approach: Vertical Slices

**Approach:** Complete user capabilities delivered incrementally  
**Benefits:**
- ✅ Working demo after each slice
- ✅ Continuous integration testing
- ✅ Early user feedback
- ✅ Truly self-contained work units (300-500 lines)
- ✅ Learn and adjust as we build

## Slice Principles

Each slice must:

- ✅ **Deliver complete end-to-end user value** - Not just database model or API, but working feature
- ✅ **Be truly self-contained** - 300-500 lines, no massive dependencies
- ✅ **Be demoable immediately** - User can try it in browser
- ✅ **Test integration continuously** - Don't defer integration to end
- ✅ **Build on previous slices incrementally** - Clean dependency chain

**Example:** Slice 2 (Rich Text Editing) includes:
- Database schema for formatted text
- API endpoint to save formatted content
- Tiptap editor integration in UI
- Demo: User can bold/format text and see it published

Not just: "Add Tiptap library" or "Create text field in database"

## Development Philosophy

### Validation-Driven Development

**Pattern:** Build slice → Test with personas → Validate success criteria → Next slice

**Not Waterfall:** Incremental validation allows course correction. Each slice validates assumptions before building on them.

**Risk-First:** Address highest-risk technical decisions early through spikes and validation slices.

- Slice 3 validates image pipeline (Sharp.js optimization)
- Slice 4 validates mobile experience (highest risk - CRITICAL CHECKPOINT)
- Slice 5 validates component architecture (dnd-kit patterns)

**Key Difference:** We're not afraid to stop and fix if validation fails. Slice 4 mobile validation is a GO/NO-GO decision point.

### Ruthless Simplicity

**DO:**
- ✅ Use the simplest solution that works
- ✅ Leverage existing libraries (don't reinvent)
- ✅ Hard-code values initially (refactor in later slices)
- ✅ Skip edge cases in early slices
- ✅ Focus on core user flow first

**DON'T:**
- ❌ Build for hypothetical future requirements
- ❌ Add configuration options "just in case"
- ❌ Create abstractions before you need them
- ❌ Optimize prematurely
- ❌ Handle every edge case in slice 1

**Example:**
- Slice 1: Hard-code single theme, single user
- Slice 8: Still hard-coded, but workflows proven
- Phase 2: Add theme selection after validating core experience

## Implementation Strategy

### Phase 1: Functional Prototype (8 Slices)

**Goal:** Validate core editing experience before adding auth/themes

**Slices:**
1. **Static Page Foundation** - Create/edit/save/publish simple text portfolio
2. **Rich Text Editing** - Professional formatting with Tiptap
3. **Single Image Upload** - Add and optimize images with Sharp.js
4. **Mobile Editing Basics** - Touch-friendly editing on iPhone (CRITICAL VALIDATION)
5. **Component System & Sections** - Multi-section pages with dnd-kit reordering
6. **Image Gallery Component** - Professional grid layouts
7. **Multiple Pages & Navigation** - Organize work into separate pages
8. **Draft/Publish Workflow** - Safe editing with preview before publishing

**Duration:** 7-11 weeks

**Success Criteria:**
- ✅ User can create professional portfolio
- ✅ Mobile editing works reliably on iPhone
- ✅ Draft/publish workflow feels polished
- ✅ Performance meets budgets (<2s page load)
- ✅ Ready for design spike with working prototype

**What's NOT in Phase 1:**
- ⏸️ Authentication (defer to Phase 2)
- ⏸️ Theme selection/customization (defer to Phase 2)
- ⏸️ Advanced accessibility features (defer to Phase 2)
- ⏸️ Production hardening (defer to Phase 2)

**Rationale:** Prove the core value proposition works before adding complexity. Use working prototype to inform design decisions.

### Phase 2: Production-Ready (Future)

After design spike and user feedback:

**Slices 9-15 (estimated):**
- Authentication & Security
- Theme System
- Advanced Gallery Layouts
- Accessibility Validation
- Performance Optimization
- Production Hardening
- Analytics Integration

**Duration:** 4-7 weeks

**Trigger:** Phase 1 complete + design spike complete + user feedback positive

### Build Order Rationale

**Slices 1-3: Foundation**
Establish basic patterns:
- Database, API, UI patterns
- Text editing flow
- Image processing pipeline

**Why this order?** Start simple, validate patterns work before complex features.

**Slice 4: Mobile Validation (CRITICAL)**
Test highest risk early:
- Validate touch interactions work on real iPhone
- Confirm mobile-first architecture is sound
- **MUST PASS before continuing to complex features**

**Why slice 4?** If mobile doesn't work, everything after is wasted effort. This is our highest risk.

**Critical Checkpoint:** Can Sarah update her portfolio from iPhone in <5 minutes?
- If **NO**: Stop and fix mobile experience before continuing
- If **YES**: Proceed with confidence to complex features

**Slices 5-6: Advanced Components**
Build on validated patterns:
- Multi-section pages
- Complex components (galleries)
- Drag-and-drop (already spike-validated)

**Why now?** Mobile is validated, patterns are established, ready for complexity.

**Slices 7-8: Complete Flows**
Finish end-to-end experience:
- Multi-page organization
- Publishing workflow

**Why last?** Need all components working before multi-page coordination and publishing.

## Testing Approach

### After Each Slice

**Manual Testing:**
- [ ] Desktop browsers (Chrome, Safari, Firefox)
- [ ] Mobile testing (actual iPhone via remote debugging or DevTools)
- [ ] No console errors or warnings
- [ ] Check database state (Prisma Studio)
- [ ] Test with realistic content (see test-data/)
- [ ] Verify performance (page load, interactions)

**Persona Validation:**
- **Can Marcus use this feature?** (first-time user perspective)
- **Can Sarah use this from her phone?** (mobile-first validation)
- **Does Emma's complex content work?** (power user stress test)

**Example (Slice 3):**
- Upload Emma's 10MB production photo
- Verify Sharp.js optimization works
- Check optimized file size (<1MB target)
- Test on slow WiFi (Chrome DevTools throttling)
- Verify preview shows correctly

### Integration Checkpoints

After Slices 3, 5, and 8:

**Full end-to-end test of all features:**
1. **Test Scenario 1:** Marcus creating first portfolio
   - Fresh start → select theme → add text → add images → publish
   - Target: <30 minutes, no confusion
2. **Test Scenario 2:** Sarah mobile update from backstage
   - iPhone Safari → add gallery → add captions → publish
   - Target: <5 minutes, smooth touch interactions
3. **Test Scenario 3:** Emma organizing complex content
   - Multiple pages → 50+ images → organization → navigation
   - Target: Efficient bulk operations, clear navigation

**Fix any integration issues before continuing to next phase.**

**Why these checkpoints?**
- After Slice 3: Basic patterns validated (text + images + publish)
- After Slice 5: Complex components validated (sections + reordering)
- After Slice 8: Complete system validated (ready for Phase 2)

## Architecture Principles Per Slice

### Data Flow (Every Slice)

```
User Action → React State → API Route → Prisma → Database
         ↓
    Auto-save (draft)
         ↓
    Manual Publish
         ↓
    Published Content → Public Route → Visitor
```

**Key Concept:** Draft and published content are separate. Changes don't go live until explicit publish action.

### Component Pattern (Slices 5+)

```typescript
// Section components implement this contract
interface Section {
  id: string;
  type: 'text' | 'image' | 'gallery';
  content: Record<string, any>;
}

// Editor component
<SectionEditor section={section} onChange={handleChange} />

// Published component  
<SectionDisplay section={section} />
```

**Key Concept:** Same components for editor and published site (DOM parity), toggled with `isEditing` prop.

### Mobile-First CSS (Slice 4+)

```css
/* Default: Mobile */
.button { font-size: 16px; padding: 12px; }

/* Desktop: Override */
@media (min-width: 768px) {
  .button { font-size: 14px; padding: 8px; }
}
```

**Key Concept:** Write mobile styles first, desktop as enhancements. Not the other way around.

### File Size Budgets (All Slices)

- Each slice adds max 50KB to bundle (gzipped)
- Total bundle after slice 8: <200KB
- Each page load: <1MB total (including images)

**Enforcement:** Check bundle size after each slice. If over budget, refactor before continuing.

## Risk Mitigation

### Known Technical Risks

| Risk | Slice | Mitigation |
|------|-------|-----------|
| Mobile touch unreliable | 4 | Already validated via dnd-kit spike, full validation in Slice 4 |
| Image optimization slow | 3 | Sharp.js is proven, will test early with realistic files |
| Publishing workflow complex | 8 | Explicit publish model, test incrementally through slices |
| Performance issues | All | Performance budgets from day 1, measure each slice |
| SSR Hydration Mismatch | 5 | dnd-kit components require `ssr: false` with dynamic imports |
| Mobile Network Conditions | 3+ | Upload queue with background sync, optimistic UI updates |
| Large Image Sets | 6 | Virtual scrolling for 50+ images, lazy loading |
| Theme Switching | Phase 2 | Content survives theme changes, incompatible components fallback |
| Session Expiry | 8 | Offline queue for drafts, clear recovery flow |

### Process Risks

| Risk | Mitigation |
|------|-----------|
| Scope creep | Strict slice boundaries, ruthless simplicity, explicit "NOT Included" sections in each slice spec |
| Integration failures | Vertical slices test integration continuously at checkpoints (slices 3, 5, 8) |
| Context overload for AI workers | 300-500 line slices, truly self-contained, clear dependencies |
| Late feedback | Demo after each slice, design spike with working prototype (not mockups first) |
| Building wrong features | Validate core UX in Phase 1 before polish in Phase 2 |
| Mobile validation failure | Slice 4 is explicit GO/NO-GO checkpoint, must pass before continuing |

## Definition of Done (Every Slice)

Before marking a slice complete:

### Code Quality

- [ ] Code implements all "Included" items from spec
- [ ] Code omits all "NOT Included" items (resist scope creep)
- [ ] Follows existing code style (Prettier/ESLint)
- [ ] No console.log statements (use proper logging)
- [ ] TypeScript types defined properly
- [ ] Comments explain "why" not "what"

### Functionality

- [ ] Demo script works end-to-end
- [ ] All success criteria met
- [ ] No console errors or warnings
- [ ] Works on desktop (Chrome, Safari)
- [ ] Works on iPhone (if slice 4+)
- [ ] Error states handled gracefully
- [ ] Loading states where appropriate

### Documentation

- [ ] Integration points documented for next slice
- [ ] Known limitations listed
- [ ] Any deviations from spec explained
- [ ] Test user validation notes recorded

### Quality

- [ ] Code is under line count estimate (or justified)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Performance meets budgets
- [ ] Bundle size checked and within limits

### Ready for Next Slice

- [ ] Committed to git with clear commit message
- [ ] Integration points tested
- [ ] No blocking issues for next implementer
- [ ] Demo recorded or documented

## Test User Setup

### Pre-Seeded Accounts

For realistic testing with persona data:

```
Sarah Chen: sarah.chen@test.costume.design / TheatrePro2024!
Profile: 8 theatre projects, 40+ images, experienced user

Marcus Williams: marcus.williams@test.costume.design / FirstPortfolio2024!
Profile: 1 project, 10 images, first-time user

Emma Rodriguez: emma.rodriguez@test.costume.design / FilmVeteran2024!
Profile: 25+ film projects, 150+ images, power user

Test User: test@costume.design / TestUser2024!
Profile: Empty, for onboarding flow testing
```

**Setup:**
```bash
# Seed test data (when auth is implemented in Phase 2)
npm run db:seed

# This creates:
# - Pre-configured user accounts
# - Sample portfolio content
# - Realistic test images
```

**Test Data Location:** See `plans/test-data/` for JSON profiles and images

**Phase 1 Note:** Since auth is deferred to Phase 2, initial slices will use dev/test access patterns. Pre-seeded accounts come into play in Phase 2.

## Working with AI Implementers

### For AI Workers Implementing Slices

**Before starting:**
1. Read `VISION.md` to understand the why
2. Read `USERS.md` to understand who you're building for
3. Read `ARCHITECTURE.md` for technical contracts
4. Read this document (`IMPLEMENTATION_APPROACH.md`) for methodology
5. Read `IMPLEMENTATION_GUIDE.md` for practical patterns
6. Read your specific slice spec in `slices/`

**During implementation:**
- Use realistic content for testing (not Lorem Ipsum)
- Demo against persona scenarios
- Validate against success criteria in slice spec
- Document integration points for next slice

**After implementation:**
- Run through Definition of Done checklist
- Test with persona scenarios
- Commit with clear message
- Note any issues for next slice

### Context Management

**Each slice specification includes:**
- What files to read for context
- What patterns to follow
- What to build on from previous slices
- What NOT to include (scope boundaries)

**Keep context focused:** Don't read entire codebase. Read what the slice spec tells you to read.

## Success Metrics

### After Slice 4 (Mobile Validation)

**Critical Checkpoint:** Can Sarah update her portfolio from iPhone in <5 minutes?

**Test on real iPhone:**
- [ ] Touch interactions feel native (not laggy)
- [ ] Photo upload works on slow WiFi
- [ ] Keyboard behavior doesn't break layout
- [ ] Can complete entire workflow without desktop

**If NO:** 🛑 Stop and fix mobile experience before continuing  
**If YES:** ✅ Proceed with confidence to complex features

### After Slice 8 (Phase 1 Complete)

**Functional Prototype Validation:**

**Can Marcus create professional portfolio in <30 minutes?**
- [ ] Completes without confusion
- [ ] Result looks professional
- [ ] Feels confident sharing with clients
- [ ] No technical frustration

**Can Sarah update from phone in <5 minutes?**
- [ ] Smooth camera-to-published workflow
- [ ] Touch interactions feel native
- [ ] Updates feel quick and effortless
- [ ] No need to wait for desktop

**Can Emma navigate 50+ projects efficiently?**
- [ ] Multi-page organization feels natural
- [ ] Bulk operations save time
- [ ] Navigation creation is straightforward
- [ ] Result feels comprehensive, not cluttered

**Does it feel polished despite limited features?**
- [ ] Core workflows are smooth
- [ ] Performance is excellent
- [ ] No obvious bugs or rough edges
- [ ] Users want to use it

**If YES to all:** Ready for design spike and Phase 2  
**If NO to any:** Address gaps before Phase 2

## Design Spike (After Slice 8)

**Purpose:** Use working prototype for high-fidelity design feedback

**Why after implementation?** Design decisions should be informed by real usage patterns, not assumptions. The working prototype reveals what actually matters.

**Activities:**
1. Use actual working prototype with test users
2. Gather feedback on flow, aesthetics, pain points
3. Create high-fidelity mockups based on real usage
4. User testing with target personas
5. Validate theme approach before building theme system
6. Identify Phase 2 priorities

**Duration:** 1-2 weeks

**Participants:**
- Designer (creates mockups from working prototype)
- Test users from target personas
- Product owner (prioritizes feedback)

**Outcome:** 
- Informed Phase 2 plan with user validation
- High-fidelity mockups for theme system
- Prioritized feature list for Phase 2
- Validated design direction

**Key Insight:** We build the prototype to learn what works, then design the polish. Not design first, then build.

## Phase Transition: Phase 1 → Phase 2

### Phase 1 Complete Checklist

Before starting Phase 2:

- [ ] All 8 slices complete and passing Definition of Done
- [ ] Integration checkpoint after Slice 8 passed
- [ ] All three personas validated (Marcus, Sarah, Emma)
- [ ] Performance budgets met
- [ ] No critical bugs or blocking issues
- [ ] Design spike completed
- [ ] Phase 2 priorities identified from user feedback

### Phase 2 Planning

**After Phase 1 validation:**
1. Review design spike outcomes
2. Prioritize Phase 2 features based on feedback
3. Create Phase 2 slice specifications
4. Estimate Phase 2 timeline (4-7 weeks)
5. Begin Phase 2 implementation

**Phase 2 Focus:**
- Authentication & Security
- Theme System (informed by design spike)
- Production Hardening
- Accessibility Validation
- Performance Optimization

## References

### Related Documents

- `VISION.md` - Product vision and principles
- `USERS.md` - Personas and scenarios  
- `ARCHITECTURE.md` - Technical architecture and patterns
- `IMPLEMENTATION_GUIDE.md` - Practical implementation patterns
- `SLICE_BREAKDOWN.md` - Overview of all 8 slices
- `slices/` - Individual slice specifications (01-08)

### Testing Resources

- `plans/test-data/` - Realistic test data for personas
- `plans/USERS.md` - Test scenarios and validation framework

### Original Planning (Archive)

- `orig-plans/` - Previous horizontal layer approach (superseded)

## Philosophy Summary

**Vertical slices over horizontal layers:** Build complete features, not complete layers.

**Validation over speculation:** Test assumptions early, adjust course as needed.

**Simplicity over abstraction:** Solve today's problems, not tomorrow's hypotheticals.

**Working software over documentation:** Demo after each slice, not at the end.

**User value over technical completeness:** Ship what users need, defer what they don't.

This approach trades upfront planning for continuous validation. We learn by building, not by theorizing.
