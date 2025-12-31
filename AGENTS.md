# Agent Guidance

## Implementation Workflow

For each implementation task, follow this agent delegation pattern:

### 1. Understand (If building on existing work)
Use **foundation:explorer** to map the existing codebase:
- What patterns are already established?
- What components/modules exist?
- How does the current architecture work?

### 2. Design
Use **foundation:zen-architect** in ARCHITECT mode to design the approach:
- Break down the problem
- Design the architecture
- Create implementation specifications
- Identify what needs to be built

### 3. Implement
Use **foundation:modular-builder** to build from the design:
- Implement following the specifications from zen-architect
- Build self-contained, regeneratable modules
- Follow the "bricks and studs" philosophy

### 4. Review
Use **foundation:zen-architect** in REVIEW mode for philosophy compliance:
- Does it follow ruthless simplicity?
- Is it over-engineered?
- Are there unnecessary abstractions?
- Does it align with design principles?

### 5. Debug (If issues arise)
Use **foundation:bug-hunter** for systematic debugging:
- Hypothesis-driven debugging
- Root cause analysis
- Fix without adding unnecessary complexity

**Why this workflow:** Systematic approach ensures quality, maintainability, and alignment with project philosophy.
