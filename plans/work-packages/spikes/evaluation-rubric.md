# Page Builder Spike Evaluation Rubric

Use this rubric to evaluate and compare the three spike implementations. Complete this after all spikes are finished.

## Evaluation Date: ___________

## Quick Reference

| Spike | Port | Library |
|-------|------|---------|
| Craft.js | 4001 | @craftjs/core |
| dnd-kit | 4002 | @dnd-kit/core (custom) |
| Builder.io | 4003 | @builder.io/sdk-react |

---

## Section 1: Mobile Touch Support (Weight: HIGH)

This is critical—the portfolio builder must work well on iPhone.

### Test Protocol
1. Open each spike on iPhone via local network
2. Test each interaction 3 times to assess consistency
3. Note any workarounds or special gestures required

### Scoring

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| **Drag from toolbar to canvas** | | | |
| Works on first try | /5 | /5 | /5 |
| Consistent behavior | /5 | /5 | /5 |
| **Reorder within canvas** | | | |
| Works on first try | /5 | /5 | /5 |
| Consistent behavior | /5 | /5 | /5 |
| **Touch response time** | | | |
| Immediate (<100ms) = 5, Slight delay = 3, Laggy = 1 | /5 | /5 | /5 |
| **Gesture naturalness** | | | |
| Intuitive = 5, Needs learning = 3, Awkward = 1 | /5 | /5 | /5 |

**Section 1 Total** (max 40 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /40 | /40 | /40 |

### Notes on Mobile Behavior

**Craft.js:**
```
[ Notes on touch behavior, workarounds needed, etc. ]
```

**dnd-kit:**
```
[ Notes on touch behavior, sensor configuration that worked, etc. ]
```

**Builder.io:**
```
[ Notes on touch behavior, or "not applicable" if self-hosted editing wasn't possible ]
```

---

## Section 2: Serialization Quality (Weight: HIGH)

The JSON format affects data portability, versioning, and debugging.

### Evaluation Criteria

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| **Readability** | | | |
| Human-readable JSON = 5, Cryptic = 1 | /5 | /5 | /5 |
| **Stability** | | | |
| Same content = same JSON = 5, Non-deterministic = 1 | /5 | /5 | /5 |
| **Portability** | | | |
| Easy to migrate/transform = 5, Locked-in = 1 | /5 | /5 | /5 |
| **Versioning support** | | | |
| Clear version field, migration path = 5, None = 1 | /5 | /5 | /5 |
| **Size efficiency** | | | |
| Minimal overhead = 5, Bloated = 1 | /5 | /5 | /5 |

**Section 2 Total** (max 25 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /25 | /25 | /25 |

### Sample JSON Comparison

Paste a representative sample from each (abbreviated if needed):

**Craft.js format:**
```json

```

**dnd-kit format:**
```json

```

**Builder.io format:**
```json

```

---

## Section 3: Bundle Size (Weight: MEDIUM)

Target: Page builder portion should be <100KB gzipped.

### Measurements

| Metric | Craft.js | dnd-kit | Builder.io |
|--------|----------|---------|------------|
| Total JS bundle (gzip) | KB | KB | KB |
| Page builder specific chunks | KB | KB | KB |
| First Load JS | KB | KB | KB |

### Scoring

| Size Range | Score |
|------------|-------|
| < 50KB | 5 |
| 50-75KB | 4 |
| 75-100KB | 3 |
| 100-150KB | 2 |
| > 150KB | 1 |

**Section 3 Total** (max 5 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /5 | /5 | /5 |

---

## Section 4: Theme Integration (Weight: MEDIUM)

How easily can theme tokens flow through to components?

### Evaluation Criteria

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| **Token passthrough** | | | |
| Simple, works naturally = 5, Hacky = 1 | /5 | /5 | /5 |
| **Dynamic theme switching** | | | |
| Instant, no issues = 5, Requires reload = 1 | /5 | /5 | /5 |
| **CSS variable support** | | | |
| Full support = 5, Limited = 3, None = 1 | /5 | /5 | /5 |

**Section 4 Total** (max 15 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /15 | /15 | /15 |

---

## Section 5: Developer Experience (Weight: MEDIUM)

How pleasant was it to build with this approach?

### Evaluation Criteria

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| **Documentation quality** | | | |
| Comprehensive, clear = 5, Sparse/confusing = 1 | /5 | /5 | /5 |
| **TypeScript support** | | | |
| Excellent types = 5, Missing/wrong types = 1 | /5 | /5 | /5 |
| **Debugging ease** | | | |
| Easy to debug = 5, Black box = 1 | /5 | /5 | /5 |
| **Boilerplate required** | | | |
| Minimal = 5, Excessive = 1 | /5 | /5 | /5 |
| **Learning curve** | | | |
| Quick to productive = 5, Steep = 1 | /5 | /5 | /5 |

**Section 5 Total** (max 25 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /25 | /25 | /25 |

### Developer Experience Notes

**Craft.js:**
```
[ Pain points, surprises, things that worked well ]
```

**dnd-kit:**
```
[ Pain points, surprises, things that worked well ]
```

**Builder.io:**
```
[ Pain points, surprises, things that worked well ]
```

---

## Section 6: Maintenance & Risk (Weight: LOW)

Long-term viability of the choice.

### Research Data

| Factor | Craft.js | dnd-kit | Builder.io |
|--------|----------|---------|------------|
| Last release date | | | |
| GitHub stars | | | |
| Open issues | | | |
| Monthly npm downloads | | | |
| Active maintainers | | | |

### Scoring

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| **Active maintenance** | | | |
| Regular releases = 5, Stale = 1 | /5 | /5 | /5 |
| **Community size** | | | |
| Large, active = 5, Small = 1 | /5 | /5 | /5 |
| **Vendor lock-in risk** | | | |
| Low/none = 5, High = 1 | /5 | /5 | /5 |

**Section 6 Total** (max 15 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /15 | /15 | /15 |

---

## Section 7: Feature Completeness (Weight: LOW)

Did the spike achieve all success criteria?

### Checklist

| Criterion | Craft.js | dnd-kit | Builder.io |
|-----------|----------|---------|------------|
| Drag toolbar → canvas (desktop) | [ ] | [ ] | [ ] |
| Drag toolbar → canvas (mobile) | [ ] | [ ] | [ ] |
| Reorder in canvas (desktop) | [ ] | [ ] | [ ] |
| Reorder in canvas (mobile) | [ ] | [ ] | [ ] |
| Inline text editing | [ ] | [ ] | [ ] |
| Serialize to JSON | [ ] | [ ] | [ ] |
| Deserialize from JSON | [ ] | [ ] | [ ] |
| Theme toggle works | [ ] | [ ] | [ ] |

**Criteria met:** /8 for each

**Section 7 Total** (max 8 each):

| Craft.js | dnd-kit | Builder.io |
|----------|---------|------------|
| /8 | /8 | /8 |

---

## Final Scoring

### Weighted Totals

| Section | Weight | Max Points | Craft.js | dnd-kit | Builder.io |
|---------|--------|------------|----------|---------|------------|
| 1. Mobile Touch | 3x | 40 | ×3= | ×3= | ×3= |
| 2. Serialization | 3x | 25 | ×3= | ×3= | ×3= |
| 3. Bundle Size | 2x | 5 | ×2= | ×2= | ×2= |
| 4. Theme Integration | 2x | 15 | ×2= | ×2= | ×2= |
| 5. Developer Experience | 2x | 25 | ×2= | ×2= | ×2= |
| 6. Maintenance | 1x | 15 | ×1= | ×1= | ×1= |
| 7. Feature Complete | 1x | 8 | ×1= | ×1= | ×1= |
| **TOTAL** | | **288** | | | |

### Final Scores

| Spike | Score | Percentage |
|-------|-------|------------|
| Craft.js | /288 | % |
| dnd-kit | /288 | % |
| Builder.io | /288 | % |

---

## Qualitative Assessment

### Strongest Candidate

**Winner:** _______________

**Primary reasons:**
1.
2.
3.

### Concerns with Winner

1.
2.

### Mitigation Plan

How will you address the concerns noted above?

```

```

---

## Decision

### Selected Approach: _______________

### Rationale Summary

```
[ 2-3 paragraph summary of why this choice was made,
  what tradeoffs were accepted, and what the decision
  enables for the rest of the project ]
```

### Next Steps

After this decision, create:

1. `foundation/tech-decisions.md` - Document this decision and rationale
2. `foundation/page-builder-setup.md` - Exact setup instructions for chosen approach
3. `foundation/component-template.md` - How to create new components

---

## Appendix: Raw Notes

### Craft.js Session Notes
```
[ Paste any raw notes, error messages, or observations from the Craft.js spike ]
```

### dnd-kit Session Notes
```
[ Paste any raw notes, error messages, or observations from the dnd-kit spike ]
```

### Builder.io Session Notes
```
[ Paste any raw notes, error messages, or observations from the Builder.io spike ]
```
