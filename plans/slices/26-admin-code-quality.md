# Admin Code Quality

**Goal:** Improve admin component maintainability by organizing CSS and establishing clear coding patterns.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Extract large CSS-in-JS blocks to CSS modules or global CSS
- Reduce component file sizes (target: <300 lines including CSS)
- Convert inline animation styles to CSS classes
- Add missing design tokens for hardcoded values
- Document admin design patterns
- Create component usage guidelines (cards vs lists vs tables)
- Standardize CSS approach (when to use Tailwind vs CSS modules)
- Establish pattern library documentation

**NOT Included**:
- Refactoring component logic or APIs
- Changing visual design or layouts
- Adding new features or functionality
- Performance optimizations
- Build system changes
- Migrating to different CSS framework

## Tech Stack
- CSS Modules (.module.css)
- Existing global CSS (src/app/globals.css)
- CSS custom properties (design tokens)
- TypeScript for type safety
- Existing component structure (no rewrites)

## Key Files
```
src/components/admin/ProjectMetadataSidebar.module.css  # New: extracted styles
src/components/admin/FeaturedImagePicker.module.css     # New: extracted styles
src/components/admin/CategoryListItem.module.css        # New: extracted styles
src/components/admin/ProjectMetadataSidebar.tsx         # Update: import module
src/components/admin/FeaturedImagePicker.tsx            # Update: import module
src/components/editor/AddSectionButton.tsx              # Update: convert inline styles
src/app/globals.css                                     # Update: add missing tokens
plans/design/ADMIN-PATTERN-LIBRARY.md                   # New: pattern documentation
```

## Current Issues

### Issue 1: CSS-in-JS Bloat

**Problem:** Component files are 60-70% CSS

**Examples:**
- ProjectMetadataSidebar.tsx: 154 lines of CSS (lines 279-432)
- FeaturedImagePicker.tsx: 279 lines of CSS (lines 370-648)
- Total component file sizes: 500-600 lines

**Impact:**
- Hard to scan code
- Difficult code reviews
- Reduced maintainability

**Solution:** Extract to CSS modules

---

### Issue 2: Hardcoded Values

**Problem:** Magic numbers without design token equivalents

**Examples:**
```css
font-size: 16px;          /* Prevents iOS zoom - justified but undocumented */
width: 18px; height: 18px;  /* Checkbox size */
margin-left: 30px;        /* Magic number */
rgba(59, 130, 246, 0.05)  /* Hardcoded color */
```

**Solution:** Add tokens or document why hardcoded

---

### Issue 3: Inline Animation Styles

**Problem:** Animations defined inline instead of CSS classes

**Example from AddSectionButton.tsx:88-91:**
```tsx
style={{
  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
  transition: 'transform 200ms ease',
}}
```

**Solution:** Use CSS classes with state attributes

---

## CSS Module Extraction

### Before (CSS-in-JS)

```tsx
// ProjectMetadataSidebar.tsx
export function ProjectMetadataSidebar() {
  return (
    <div className="metadata-sidebar">
      {/* Content */}
      
      <style jsx>{`
        .metadata-sidebar {
          /* 150+ lines of CSS */
        }
      `}</style>
    </div>
  )
}
```

### After (CSS Module)

```tsx
// ProjectMetadataSidebar.tsx
import styles from './ProjectMetadataSidebar.module.css'

export function ProjectMetadataSidebar() {
  return (
    <div className={styles.metadataSidebar}>
      {/* Content */}
    </div>
  )
}
```

```css
/* ProjectMetadataSidebar.module.css */
.metadataSidebar {
  /* Same CSS, now in separate file */
}
```

**Benefits:**
- Component file: ~150 lines (readable)
- CSS file: ~150 lines (maintainable)
- Clear separation of concerns

## Design Token Additions

### Add to globals.css

```css
:root {
  /* Input sizing */
  --input-height: 40px;
  --input-font-size: 16px; /* iOS zoom prevention */
  --checkbox-size: 18px;
  
  /* Spacing (if missing) */
  --space-7: 30px;
  --space-8: 36px;
  
  /* Colors (semantic) */
  --color-accent-alpha-5: rgba(59, 130, 246, 0.05);
  --color-overlay-dark: rgba(0, 0, 0, 0.6);
  
  /* Animation */
  --transition-rotate: transform 200ms ease;
  --transition-expand: max-height 300ms ease;
}
```

### Document iOS Zoom Prevention

```css
/* Add comment in design system */
--input-font-size: 16px; /* Minimum to prevent iOS zoom-in on focus */
```

## Animation Class Pattern

### Before (Inline)

```tsx
<div
  style={{
    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
    transition: 'transform 200ms ease',
  }}
>
  +
</div>
```

### After (CSS Classes)

```tsx
<div
  className={`add-icon ${isOpen ? 'add-icon--open' : ''}`}
>
  +
</div>
```

```css
.add-icon {
  transition: var(--transition-rotate);
}

.add-icon--open {
  transform: rotate(45deg);
}
```

## Admin Pattern Library

### Document Structure

Create `plans/design/ADMIN-PATTERN-LIBRARY.md`:

```markdown
# Admin Pattern Library

## Navigation Patterns

### Hierarchical Tree Navigation
Use for: Categories → Projects, Folders, nested structures
Component: CategoryNavSection
Pattern: Expandable tree with chevrons

### Flat List Navigation
Use for: Pages, settings, simple lists
Component: PageNavSection
Pattern: Simple list with active states

## Management Patterns

### List Items
Use for: Items with children, hierarchical management
Component: CategoryListItem
Interaction: Click row → Navigate to children

### Cards
Use for: Leaf nodes, visual preview important
Component: ProjectCard
Interaction: Click card → Edit item

### Tabs
Use for: Small number of peers, frequent switching
Component: PageList
Interaction: Click tab → Switch context

## Component Usage Guidelines

When to use lists vs cards vs tables vs tabs...
```

## Demo Script (30 seconds)
1. Open ProjectMetadataSidebar.tsx - See file is ~150 lines (not 450)
2. Check ProjectMetadataSidebar.module.css - Styles extracted cleanly
3. Open FeaturedImagePicker.tsx - See file is ~250 lines (not 650)
4. Check FeaturedImagePicker.module.css - Styles extracted cleanly
5. Open AddSectionButton.tsx - See CSS classes, no inline styles
6. Check globals.css - New design tokens added with documentation
7. Open ADMIN-PATTERN-LIBRARY.md - See usage guidelines documented
8. Review component files - All readable, <300 lines with CSS imports
9. Build project - No errors, all styles apply correctly
10. Test UI - Visual appearance unchanged, code is cleaner
11. **Success**: Clean, maintainable code without changing functionality

## Success Criteria

### Functional Requirements
- [ ] All admin components work exactly as before
- [ ] Visual appearance unchanged
- [ ] No regressions in functionality
- [ ] Build succeeds with no errors
- [ ] All styles apply correctly

### Code Quality Requirements
- [ ] ProjectMetadataSidebar: <200 lines (excluding imports)
- [ ] FeaturedImagePicker: <300 lines (excluding imports)
- [ ] CSS extracted to .module.css files
- [ ] No inline style objects for static styles
- [ ] Animation styles use CSS classes
- [ ] Hardcoded values documented or tokenized
- [ ] New design tokens added to globals.css
- [ ] Tokens documented with comments

### Documentation Requirements
- [ ] ADMIN-PATTERN-LIBRARY.md created
- [ ] Documents when to use cards vs lists vs tabs
- [ ] Includes code examples for each pattern
- [ ] Includes interaction guidelines
- [ ] Includes accessibility requirements
- [ ] Clear usage guidelines for future development

### Organization Requirements
- [ ] Each CSS module paired with component
- [ ] CSS modules use same naming as components
- [ ] Class names follow BEM or consistent convention
- [ ] Global CSS organized by section (tokens, layout, components)
- [ ] No duplicate styles across modules

## CSS Module Naming Convention

### File Naming
```
Component: ProjectMetadataSidebar.tsx
Module:    ProjectMetadataSidebar.module.css
```

### Class Naming (BEM)
```css
/* Block */
.metadataSidebar { }

/* Elements */
.metadataSidebar__header { }
.metadataSidebar__field { }
.metadataSidebar__label { }

/* Modifiers */
.metadataSidebar--collapsed { }
.metadataSidebar__field--error { }
```

### Import Pattern
```typescript
import styles from './ProjectMetadataSidebar.module.css'

<div className={styles.metadataSidebar}>
  <div className={styles.metadataSidebar__header}>
    <label className={styles.metadataSidebar__label}>
      Category
    </label>
  </div>
</div>
```

## Pattern Library Content

### Section 1: Navigation Patterns

Document:
- When to use hierarchical trees
- When to use flat lists
- Active state patterns
- Expandable/collapsible patterns

### Section 2: Management Patterns

Document:
- List items (for hierarchy)
- Cards (for visual content)
- Tabs (for context switching)
- Tables (for data grids - future)

### Section 3: Interaction Guidelines

Document:
- Direct click for primary actions
- Stop propagation for secondary actions
- Keyboard navigation requirements
- Touch interaction requirements

### Section 4: Component Examples

Include:
- Code snippets for each pattern
- When to use each pattern
- Accessibility requirements
- Mobile considerations

## Integration Points

These elements are designed to be extended:
- **CSS module pattern** - Apply to all future components
- **Design token additions** - Expand as needed
- **Pattern library** - Living document, update with new patterns
- **Naming conventions** - Follow for consistency

## Effort Estimate

**Total: 8-13 hours**
- Extract ProjectMetadataSidebar CSS: 1-2 hours
- Extract FeaturedImagePicker CSS: 1-2 hours
- Convert inline animations to classes: 1 hour
- Add design tokens to globals.css: 1-2 hours
- Create ADMIN-PATTERN-LIBRARY.md: 2-3 hours
- Update other components as needed: 1-2 hours
- Testing and verification: 1-2 hours
