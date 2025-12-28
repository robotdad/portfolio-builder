# ⚠️ ARCHIVE - DO NOT USE ⚠️

## WARNING

**This directory contains OBSOLETE planning documents.**

**DO NOT read or reference files in this directory during implementation.**

---

## Why This Exists

This is the original planning from the horizontal layer approach that was restructured into vertical slices. It's preserved temporarily for historical reference only.

## What's Wrong With These Files

1. **Outdated approach** - Horizontal layers instead of vertical slices
2. **Context rot risk** - Information may contradict current plans/
3. **Agent confusion** - Reading these files will introduce incorrect context
4. **Superseded** - All essential content has been extracted to plans/

## What You Should Use Instead

**All current planning is in `plans/` directory:**

- **plans/VISION.md** - Product vision and design principles
- **plans/USERS.md** - User personas and scenarios
- **plans/ARCHITECTURE.md** - Technical architecture and decisions
- **plans/IMPLEMENTATION_APPROACH.md** - Development methodology
- **plans/IMPLEMENTATION_GUIDE.md** - Implementation patterns
- **plans/slices/** - Individual slice specifications (01-08)

## Extraction Status

All essential content from archive/ has been extracted and incorporated into the new plans/ structure:

✅ User personas and scenarios → USERS.md
✅ Technical decisions and rationale → ARCHITECTURE.md
✅ Tech stack and spike outcomes → ARCHITECTURE.md
✅ UX principles and success criteria → VISION.md
✅ Development methodology → IMPLEMENTATION_APPROACH.md
✅ Performance budgets → ARCHITECTURE.md
✅ Security requirements → ARCHITECTURE.md
✅ Component patterns → ARCHITECTURE.md

## When to Delete This

**This directory should be deleted when:**
- Phase 1 implementation is complete (after Slice 8)
- All planning questions have been resolved
- No active references to archive/ exist

**Expected deletion:** After Phase 1 (approximately 2-3 months)

---

## If You're Reading This

**Stop.** Close this file. Go to `plans/` instead.

If you need something from archive/, ask first - it probably exists in the new structure already.

**Reading files in archive/ will cause context rot and incorrect implementation decisions.**

---

Last updated: 2024-12-28
