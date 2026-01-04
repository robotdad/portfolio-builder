# Admin Pattern Library

> **Purpose:** Document admin UI patterns for consistency and future development.
> **Last Updated:** January 2026

---

## Table of Contents

1. [Navigation Patterns](#navigation-patterns)
2. [Management Patterns](#management-patterns)
3. [Component Usage Guidelines](#component-usage-guidelines)
4. [Interaction Patterns](#interaction-patterns)
5. [CSS Architecture](#css-architecture)
6. [Accessibility Requirements](#accessibility-requirements)

---

## Navigation Patterns

### Hierarchical Tree Navigation

**Use for:** Categories → Projects, Folders, nested structures

**Component:** `CategoryNavSection`

**Pattern:**
- Expandable tree with chevrons
- Parent items show child count
- Active item highlighted with accent border
- Keyboard navigable (Enter/Space to expand)

```tsx
<CategoryNavSection
  categories={categories}
  currentCategoryId={currentId}
  onCategorySelect={handleSelect}
/>
```

### Flat List Navigation

**Use for:** Pages, settings, simple non-hierarchical lists

**Component:** `PageNavSection`

**Pattern:**
- Simple list with active states
- No nesting or expansion
- Direct click navigation

```tsx
<PageNavSection
  pages={pages}
  currentPageId={currentId}
/>
```

---

## Management Patterns

### List Items (CategoryListItem)

**Use when:**
- Items have children (categories with projects)
- Hierarchical management needed
- Reordering via drag-and-drop required

**Interaction:**
- Click row → Navigate to children
- Drag handle → Reorder
- Action buttons → Edit/Delete (stop propagation)

**Structure:**
```
[Drag Handle] [Thumbnail] [Title + Count] [Actions] [Chevron]
```

**Mobile adaptation:** Actions move to second row

### Cards (ProjectCard)

**Use when:**
- Visual preview is important
- Items are leaf nodes (no children)
- Grid layout preferred

**Interaction:**
- Click card → Edit item
- Hover → Show action overlay
- Supports selection state

**Structure:**
```
┌─────────────────┐
│   [Image]       │
│                 │
├─────────────────┤
│ Title           │
│ Metadata        │
└─────────────────┘
```

### Tabs

**Use when:**
- Small number of peer items (2-5)
- Frequent context switching expected
- Content types are similar

**Component:** Built into page-level navigation

**Pattern:**
- Horizontal tab bar
- Active tab underlined
- Content switches without page reload

---

## Component Usage Guidelines

### When to Use Each Pattern

| Scenario | Pattern | Reason |
|----------|---------|--------|
| Category management | List Items | Has children (projects), needs reorder |
| Project browsing | Cards | Visual content, leaf nodes |
| Page editing | Tabs | Few items, frequent switching |
| Settings | Flat List | Simple, no hierarchy |
| File browser | Tree | Deep nesting possible |

### Decision Tree

```
Does item have children?
├─ Yes → List Item with navigation
└─ No → Is visual preview important?
    ├─ Yes → Card
    └─ No → Is it one of few peers?
        ├─ Yes (2-5) → Tabs
        └─ No → Flat List
```

---

## Interaction Patterns

### Primary Actions

**Direct click:** Main action on the entire row/card
- List items: Navigate to children
- Cards: Open editor
- Always the most common user intent

### Secondary Actions

**Explicit buttons:** Edit, Delete, Settings
- Must call `e.stopPropagation()` to prevent primary action
- Minimum 44px touch target
- Grouped in action area

```tsx
const handleEdit = (e: React.MouseEvent) => {
  e.stopPropagation()  // Prevent row navigation
  onEdit(item)
}
```

### Drag and Drop

**Implementation:** dnd-kit with TouchSensor
- Delay: 150ms (prevents accidental drags)
- Tolerance: 8px (allows small movements)
- Visual feedback: Opacity change, shadow

```tsx
const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
  id: item.id
})
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between interactive elements |
| Enter/Space | Activate button or expand |
| Escape | Close modal/popover |
| Arrow keys | Navigate within list (where implemented) |

---

## CSS Architecture

### File Organization

```
src/components/admin/
├── ComponentName.tsx           # Component logic
├── ComponentName.module.css    # Component styles
└── index.ts                    # Barrel export
```

### CSS Module Naming Convention

**File naming:**
```
Component: ProjectMetadataSidebar.tsx
Module:    ProjectMetadataSidebar.module.css
```

**Class naming (camelCase for CSS modules):**
```css
/* Block */
.metadataSidebar { }

/* Elements (use descriptive names) */
.sidebarHeader { }
.sidebarContent { }
.fieldGroup { }
.fieldLabel { }
.fieldInput { }

/* State variants */
.fieldGroupFirst { }      /* First item styling */
.fieldGroupFeatured { }   /* Featured checkbox group */
.dropzoneDragOver { }     /* Drag state */
.categoryListItemDragging { }  /* Dragging state */
```

### Design Token Usage

**Always use tokens for:**
- Colors: `var(--admin-text)`, `var(--color-accent)`
- Spacing: `var(--space-2)`, `var(--space-4)`
- Typography: `var(--font-size-sm)`, `var(--font-weight-medium)`
- Borders: `var(--radius-md)`, `var(--admin-border)`
- Transitions: `var(--transition-fast)`, `var(--transition-base)`

**Documented exceptions:**
```css
font-size: var(--input-font-size, 16px);  /* iOS zoom prevention */
```

### When to Use Each Approach

| Approach | Use When |
|----------|----------|
| CSS Modules | Component-specific styles, scoped classes |
| Global CSS | Design tokens, utility classes, base styles |
| Inline styles | Truly dynamic values (transforms from JS) |

---

## Accessibility Requirements

### Touch Targets

- Minimum size: 44x44px (`var(--touch-target-min)`)
- Applies to all buttons, links, and interactive elements
- Mobile especially critical

### Focus States

- All interactive elements must have visible focus
- Use `focus-visible` to avoid focus ring on mouse click
- Consistent ring style: `outline: 2px solid var(--color-accent)`

```css
.button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

### ARIA Attributes

**Expandable sections:**
```tsx
<button
  aria-expanded={isExpanded}
  aria-controls="content-id"
>
```

**Interactive non-buttons:**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label="Descriptive label"
  onKeyDown={handleKeyDown}  // Enter/Space support
>
```

**Error states:**
```tsx
<input aria-describedby={error ? 'error-id' : undefined} />
{error && <p id="error-id" role="alert">{error}</p>}
```

### Reduced Motion

Always provide reduced motion alternatives:

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: none;
    animation: none;
  }
}
```

---

## Component Examples

### Sidebar Field Group

```tsx
// ProjectMetadataSidebar pattern
<div className={styles.fieldGroup}>
  <label htmlFor="field-id" className={styles.fieldLabel}>
    <IconComponent />
    <span>Label Text</span>
  </label>
  <input
    id="field-id"
    type="text"
    value={value}
    onChange={handleChange}
    placeholder="Placeholder"
    className={styles.fieldInput}
  />
</div>
```

### Image Dropzone

```tsx
// FeaturedImagePicker pattern
<div
  className={getDropzoneClass()}  // Dynamic based on state
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  aria-label="Add image"
>
  {/* Content based on upload state */}
</div>
```

### Sortable List Item

```tsx
// CategoryListItem pattern
<div
  ref={setNodeRef}
  style={style}  // Transform from dnd-kit
  className={isDragging ? styles.itemDragging : styles.item}
  onClick={handleNavigate}
  onKeyDown={handleKeyDown}
  role="button"
  tabIndex={0}
>
  <div className={styles.dragHandle} {...listeners} {...attributes}>
    <DragHandleIcon />
  </div>
  {/* Rest of content */}
</div>
```

---

## Migration Notes

### From styled-jsx to CSS Modules

1. Create `ComponentName.module.css` alongside component
2. Convert kebab-case to camelCase: `.field-group` → `.fieldGroup`
3. Import: `import styles from './ComponentName.module.css'`
4. Apply: `className={styles.fieldGroup}`
5. Remove `<style jsx>` block
6. For composed classes: Use `composes:` or template literals

### Hardcoded Values to Tokens

When you find a hardcoded value:
1. Check if a token exists in `globals.css`
2. If not, consider if it should be a token (used in multiple places?)
3. Add token with descriptive comment
4. Document any intentional exceptions (like iOS zoom prevention)

---

## Future Considerations

- [ ] Consider component library extraction if patterns stabilize
- [ ] Add Storybook documentation for visual testing
- [ ] Create automated accessibility testing
- [ ] Document animation timing specifications
