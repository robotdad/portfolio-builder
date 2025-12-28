# Orchestrator Guide: Running Slice Sessions

**Purpose:** Guide for the human orchestrating LLM implementation sessions.

---

## How to Run a Slice Session

### 1. Session Setup

**Start new LLM session with this context:**

```
You are implementing Slice N: [Name] for a portfolio builder.

Read these files to understand your goal:
- plans/slices/0N-[name].md (your slice specification)
- plans/PRINCIPLES.md (design principles)
- plans/TECH_STACK.md (technology constraints)

Your goal: Implement the slice specification completely.

Important:
- Read the existing codebase to understand what's there
- Build incrementally on previous work
- Follow the demo script as your acceptance test
- Meet all success criteria before finishing
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Ask clarifying questions if the spec is unclear

When done, confirm:
1. Demo script works end-to-end
2. All success criteria met
3. Tested on desktop and mobile (if slice 4+)
4. Ready for next slice (integration points clear)
```

### 2. During Session

**Let the LLM work autonomously:**
- Answer clarifying questions
- Provide feedback if going off track
- Test the demo as implementation progresses

**Watch for:**
- ⚠️ Implementing "NOT Included" items (scope creep)
- ⚠️ Over-engineering (premature abstraction)
- ⚠️ Skipping success criteria
- ⚠️ Breaking previous slice functionality

### 3. Session Validation

**Before accepting the slice as complete:**

Run through this checklist:

**Functional:**
- [ ] Demo script works exactly as described
- [ ] All success criteria checked off
- [ ] No console errors or warnings
- [ ] Works on desktop (Chrome, Safari)
- [ ] Works on mobile (if slice 4+)

**Code Quality:**
- [ ] Code is simple and clear
- [ ] No over-engineering or premature abstraction
- [ ] Follows tech stack (no surprise dependencies)
- [ ] Within estimated line count (+/- 20% is fine)

**Integration:**
- [ ] Previous slice functionality still works
- [ ] Integration points documented for next slice
- [ ] Database migrations clean (if any)
- [ ] No breaking changes to existing patterns

**Ready for Next:**
- [ ] Can proceed to next slice without blockers
- [ ] Any deviations from spec are documented
- [ ] Known limitations listed

### 4. Move to Next Slice

**Update ai_working/STATUS.md:**
```markdown
### Completed ✅
- ✅ Slice N: [Name] (actual time: X days)

### In Progress →
- → Slice N+1: [Next Name]
```

**Update ai_working/TIMELINE.md** with actual time taken.

**Commit the work** with clear message describing what was implemented.

---

## Special Checkpoints

### After Slice 3
**Integration Checkpoint:** Full end-to-end test
- Can Marcus create a basic text + image portfolio?
- Does the flow feel smooth?
- Any integration issues between slices 1-3?

**Decision:** Proceed to Slice 4 or fix issues?

### After Slice 4 (CRITICAL)
**Mobile Validation Checkpoint - GO/NO-GO**
- Test on REAL iPhone (not just DevTools)
- Can Sarah update from her phone in <5 minutes?
- Do touch interactions feel native?

**If NO:** Stop and fix mobile experience
**If YES:** Proceed with confidence to slices 5-8

### After Slice 8
**Phase 1 Complete:**
- Functional prototype ready for design spike
- All success scenarios work
- Ready for user feedback

---

## Common Issues

### Issue: LLM implements "NOT Included" items
**Fix:** Stop and remind it to follow slice spec exactly. Revert scope creep.

### Issue: Code is over-engineered
**Fix:** Ask "Is this the simplest solution?" Apply ruthless simplicity principle.

### Issue: Breaking previous slice
**Fix:** Test previous demo scripts. Fix regressions before proceeding.

### Issue: Success criteria ambiguous
**Fix:** Clarify the criteria before accepting. Update slice spec if needed.

---

## Session Templates

### Starting First Implementation (Static Page Foundation)
```
You are building the foundation for a portfolio builder.

Read:
- plans/slices/01-static-page-foundation.md
- plans/PRINCIPLES.md
- plans/TECH_STACK.md

This is the first implementation. No previous work exists.

Goal: User can create a page with text, publish it, and view it live.

Follow the demo script as your acceptance test. Meet all success criteria.
```

### Starting Subsequent Implementations
```
You are implementing [Feature Name] for the portfolio builder.

Read:
- plans/slices/[XX-feature-name].md
- plans/PRINCIPLES.md
- plans/TECH_STACK.md

Read the codebase to understand what exists. Build on it incrementally.

Goal: [User value from spec]

Important:
- Build on existing work, don't replace it
- Follow the demo script as your acceptance test
- Meet all success criteria before finishing
- Stay within the "Included" scope - do NOT implement "NOT Included" items
- Do NOT break existing functionality

When done, confirm all success criteria are met.
```

---

## Validation Reference

See plans/USERS.md for:
- User personas (Marcus, Sarah, Emma)
- Success scenarios to validate against
- Validation questions

See plans/VISION.md for:
- Overall success criteria
- Design principles explained in detail
- What we're building and why

---

## After Phase 1 (All 8 Slices)

1. **Design Spike:** Use working prototype for mockups and user testing
2. **Review:** Evaluate what worked, what needs refinement
3. **Plan Phase 2:** Auth, themes, polish based on learnings
