# Work Package Artifact Plan

This document captures the decomposition strategy and planned artifacts for the portfolio builder project. Use this to resume planning if context is lost.

## Context

The original planning documents in `plans/` contained ~1,200 lines across 4 files. Giving the entire plan to LLM workers produced lackluster results due to information overload and implicit dependencies.

**Solution**: Decompose into focused, self-contained artifacts that workers can execute without seeing the full scope.

## Completed Work

### Spikes (Complete)

Three parallel spikes evaluated page builder approaches:

| Spike | Location | Outcome |
|-------|----------|---------|
| Craft.js | `spikes/craftjs/` | Partial mobile touch, SSR issues, ~260KB |
| dnd-kit | `spikes/dndkit/` | **Winner** - Full mobile touch, ~110KB, 8/8 criteria |
| Builder.io | `spikes/builderio/` | Not viable - SDK is render-only, no self-hosted editing |

**Decision**: Use dnd-kit for the page builder foundation.

Spike artifacts are in `plans/work-packages/spikes/`.

## Tech Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page builder | dnd-kit (custom) | Only option with full mobile touch support, smaller bundle |
| Rich text | Tiptap | Batteries-included, good docs, sufficient for portfolio needs |
| Theme system | CSS custom properties + Tailwind | Full CSS support (pseudo-classes), clean integration |
| Framework | Next.js 14+ App Router | Already decided in original tech-strategy |
| Styling | Tailwind CSS | Already decided in original tech-strategy |
| UI components | shadcn/ui | Already decided in original tech-strategy |
| Image processing | Sharp.js | Industry standard, no alternatives worth evaluating |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma | Local-first, host-ready pattern from tech-strategy |
| Auth | Session-based with secure cookies | Standard approach from tech-strategy |

## Artifact Structure

### Tier 1: Foundation Artifacts (COMPLETE)

Establish contracts and patterns. No dependencies on each other.

| Artifact | Purpose | Status |
|----------|---------|--------|
| `foundation/tech-decisions.md` | Documents all tech choices and rationale | ✅ Complete |
| `foundation/theme-system.md` | CSS custom properties + Tailwind integration | ✅ Complete |
| `foundation/data-models.md` | Prisma schema, TypeScript interfaces | ✅ Complete |
| `foundation/component-contracts.md` | dnd-kit component patterns from spike | ✅ Complete |
| `foundation/api-contracts.md` | REST endpoints, request/response shapes | ✅ Complete |

### Tier 2: Capability Artifacts (COMPLETE)

Build isolated features. Each depends on specific foundation artifacts.

| Artifact | Dependencies | Status |
|----------|--------------|--------|
| `capabilities/auth-system.md` | data-models | ✅ Complete |
| `capabilities/text-component.md` | component-contracts, theme-system | ✅ Complete |
| `capabilities/image-pipeline.md` | api-contracts, data-models | ✅ Complete |
| `capabilities/gallery-component.md` | component-contracts, image-pipeline | ✅ Complete |
| `capabilities/draft-publish.md` | data-models, api-contracts | ✅ Complete |

### Tier 3: Flow Artifacts (COMPLETE)

Wire capabilities into user journeys.

| Artifact | Dependencies | Status |
|----------|--------------|--------|
| `flows/onboarding-flow.md` | auth-system, theme-system | ✅ Complete |
| `flows/editing-flow.md` | text-component, draft-publish | ✅ Complete |
| `flows/media-flow.md` | image-pipeline, gallery-component | ✅ Complete |
| `flows/publish-flow.md` | draft-publish, all components | ✅ Complete |

### Tier 4: Polish Artifacts (COMPLETE)

Optimization and refinement.

| Artifact | Dependencies | Status |
|----------|--------------|--------|
| `polish/mobile-optimization.md` | All flows | ✅ Complete |
| `polish/performance-audit.md` | All flows | ✅ Complete |
| `polish/accessibility-audit.md` | All flows | ✅ Complete |

## Directory Structure

```
plans/
├── portfolio-vision-ux.md          # Original spec (reference only)
├── portfolio-tech-strategy.md      # Original spec (reference only)
├── portfolio-implementation-plan.md # Original spec (reference only)
├── user-success-scenarios.md       # Original spec (reference only)
├── mockups/                        # Original mockups
└── work-packages/
    ├── artifact-plan.md            # THIS FILE
    ├── spikes/                     # COMPLETE
    │   ├── spike-craftjs.md
    │   ├── spike-dndkit.md
    │   ├── spike-builderio.md
    │   └── evaluation-rubric.md
    ├── foundation/                 # COMPLETE
    │   ├── tech-decisions.md
    │   ├── theme-system.md
    │   ├── data-models.md
    │   ├── component-contracts.md
    │   └── api-contracts.md
    ├── capabilities/               # COMPLETE
    │   ├── auth-system.md
    │   ├── text-component.md
    │   ├── image-pipeline.md
    │   ├── gallery-component.md
    │   └── draft-publish.md
    ├── flows/                      # COMPLETE
    │   ├── onboarding-flow.md
    │   ├── editing-flow.md
    │   ├── media-flow.md
    │   └── publish-flow.md
    └── polish/                     # TODO
        ├── mobile-optimization.md
        ├── performance-audit.md
        └── accessibility-audit.md
```

## Artifact Design Principles

Each artifact should be:

1. **Self-contained** - Worker can execute without other docs
2. **Clear boundaries** - Explicit inputs (prerequisites) and outputs (deliverables)
3. **Testable** - Concrete success criteria for this piece only
4. **Focused** - Single responsibility
5. **No global context** - Worker doesn't need to know "where this fits"

## Worker Prompt Template

For LLM workers executing artifacts:

```
Read the work package specification at:
plans/work-packages/<tier>/<artifact>.md

Create your implementation in:
<specified directory>

Execute the work package and provide all deliverables listed in the spec.
```

## Key Source Files

When creating artifacts, reference:

- `spikes/dndkit/` - Working dnd-kit patterns
- `spikes/dndkit/DELIVERABLES.md` - Serialization schema, touch config
- `plans/portfolio-tech-strategy.md` - Database schema, component contracts
- `plans/portfolio-vision-ux.md` - UX requirements, accessibility
- `plans/user-success-scenarios.md` - Test users and credentials

## Resume Instructions

If starting a new session:

1. Read this file first
2. Check which artifacts exist in `foundation/`, `capabilities/`, `flows/`, `polish/`
3. Continue with the next TODO artifact in order
4. Each tier must be complete before starting the next tier

### Current Status (Updated 2024-12-27)

- ✅ Spikes: Complete
- ✅ Tier 1 Foundation: Complete (5/5 artifacts)
- ✅ Tier 2 Capabilities: Complete (5/5 artifacts)
- ✅ Tier 3 Flows: Complete (4/4 artifacts)
- ✅ Tier 4 Polish: Complete (3/3 artifacts)

**All planning artifacts complete!**

Total: 17 work packages across 4 tiers, ready for implementation.
