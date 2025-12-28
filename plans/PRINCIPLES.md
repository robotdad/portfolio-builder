# Core Design Principles

**Purpose:** Essential principles for LLM implementation sessions. Keep these in mind for every decision.

---

## What We're Building

A **portfolio builder for costume designers** that prioritizes:
- **Speed of creation** - Professional portfolio in <30 minutes
- **Mobile-first editing** - Update from phone in <5 minutes
- **Professional results** - Theme-constrained creativity ensures quality

---

## The Five Principles

### 1. Mobile-First Content Management
The editor must work **excellently** on iPhone, not just "okay."
- 44px minimum touch targets
- Native-feeling gestures
- Test every feature on real iPhone

### 2. Theme-Constrained Creativity
Users work within well-designed themes, not building from scratch.
- Ensures professional results without design expertise
- Removes decision paralysis

### 3. WYSIWYG Editing
Users see exactly what visitors will see.
- **Same React components** in editor and published site
- Use `isEditing` prop, NOT separate renderer
- **DOM parity guarantee:** 0% difference

### 4. Explicit Publishing Model
Changes are NOT live until explicit publish action.
- Draft → Preview → Publish workflow
- Auto-save drafts every 30s
- Publish is atomic with validation gates

### 5. Ruthless Simplicity
Use proven libraries. Build only what's unique.
- Trust emergence over premature abstraction
- Question every feature: "Is this essential?"
- Resist over-engineering

---

## Success Criteria

After your implementation:
- Can Marcus (first-time user) create portfolio in <30 min?
- Can Sarah (mobile user) update from iPhone in <5 min?
- Page loads in <2s on 3G?
- Works reliably on iPhone touch?

If NO to any: Fix it before moving forward.
