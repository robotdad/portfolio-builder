# Portfolio Builder Planning

This directory contains the complete planning and specifications for the portfolio builder project.

---

## For Stakeholders & Reviewers

**Start here to understand the project:**

1. **[VISION.md](VISION.md)** - What we're building and why
   - Product vision and design philosophy
   - Success criteria (user, technical, business)
   - Core design principles
   - Scope boundaries

2. **[USERS.md](USERS.md)** - Who we're building for
   - User personas (Sarah, Marcus, Emma)
   - Success scenarios and journeys
   - Validation framework

---

## For Implementation Sessions (LLM)

**Context for each slice session:**

1. **[PRINCIPLES.md](PRINCIPLES.md)** - Core design principles (1 page)
2. **[TECH_STACK.md](TECH_STACK.md)** - Technology choices and constraints (1 page)
3. **[slices/0N-*.md](slices/)** - Your specific slice specification

**That's it.** These 3 files provide focused context without pollution from other slices.

---

## For Orchestrators (Running Sessions)

**Guide for running implementation sessions:**

1. **[ORCHESTRATOR_GUIDE.md](ORCHESTRATOR_GUIDE.md)** - How to run each slice session
   - Session setup templates
   - Validation checklists
   - Critical checkpoints
   - Common issues

2. **[slices/README.md](slices/README.md)** - Slice index and dependencies
   - Build order
   - Duration estimates
   - Critical milestones

---

## Directory Structure

```
plans/
├── README.md (you are here)
├── VISION.md (for humans - what & why)
├── USERS.md (for humans - user research)
├── PRINCIPLES.md (for LLM sessions - design principles)
├── TECH_STACK.md (for LLM sessions - tech constraints)
├── ORCHESTRATOR_GUIDE.md (for you - running sessions)
└── slices/
    ├── README.md (slice index)
    ├── 01-static-page-foundation.md
    ├── 02-rich-text-editing.md
    ├── 03-single-image-upload.md
    ├── 04-mobile-editing-basics.md
    ├── 05-component-system-sections.md
    ├── 06-image-gallery-component.md
    ├── 07-multiple-pages-navigation.md
    └── 08-draft-publish-workflow.md
```

---

## Reading Order

### If you're a stakeholder
Read: VISION.md → USERS.md

### If you're orchestrating implementation
Read: ORCHESTRATOR_GUIDE.md → slices/README.md → individual slice specs

### If you're an LLM implementing a slice
Read: PRINCIPLES.md → TECH_STACK.md → your slice spec → existing codebase

### If you're validating progress
Read: VISION.md (success criteria) → USERS.md (scenarios) → test against personas

---

## Working Documents

See `../ai_working/` for:
- STATUS.md - Current progress
- DECISIONS_LOG.md - Implementation decisions
- TIMELINE.md - Time tracking
- NOTES.md - Temporary ideas

---

## Questions?

- **Unclear about vision?** → VISION.md
- **Who are the users?** → USERS.md
- **How to run sessions?** → ORCHESTRATOR_GUIDE.md
- **What's the tech stack?** → TECH_STACK.md
- **What are the slices?** → slices/README.md
