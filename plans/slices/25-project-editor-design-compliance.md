# Project Editor Design System Compliance

**Goal:** Project editor uses design system tokens consistently for professional appearance and maintainability.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Replace hardcoded Tailwind classes with design system tokens
- Fix button spacing (gap-3 → gap-4 for 16px)
- Use `.btn`, `.btn-primary`, `.btn-secondary` classes consistently
- Replace hardcoded gray-* colors with semantic admin tokens
- Replace hardcoded text-* sizes with design system typography
- Fix spacing to use --space-* tokens consistently
- Ensure visual hierarchy follows design system
- Apply consistent border-radius using design tokens
- Use semantic color tokens (--admin-text, --admin-border, etc.)

**NOT Included**:
- Adding new features or functionality
- Changing layout structure (sidebar stays as-is)
- Refactoring component logic
- Performance optimizations
- Adding missing fields (title editing, gallery - separate slice)
- Mobile responsive design (separate concern)

## Tech Stack
- Existing design system CSS (globals.css)
- Design tokens (CSS custom properties)
- Replace inline Tailwind with semantic classes
- No new dependencies

## Key Files
```
src/app/admin/projects/[id]/page.tsx           # Fix hardcoded classes
src/components/admin/FeaturedImagePicker.tsx   # Fix button spacing
```

## Current Violations

### Issue 1: Button Spacing

**Location:** `src/app/admin/projects/[id]/page.tsx:302-318`

**Current (WRONG):**
```tsx
<div className="flex items-center gap-3">  {/* gap-3 = 12px */}
  <DraftIndicator status={saveStatus} />
  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg ...">
    Save Draft
  </button>
  <PublishButton ... />
</div>
```

**Should be:**
```tsx
<div className="flex items-center gap-4">  {/* gap-4 = 16px */}
  <DraftIndicator status={saveStatus} />
  <button className="btn btn-secondary">
    Save Draft
  </button>
  <PublishButton ... />
</div>
```

### Issue 2: Hardcoded Button Classes

**Current (WRONG):**
```tsx
className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
```

**Should be:**
```tsx
className="btn btn-secondary"
```

**Why:** Design system has `.btn` classes defined (globals.css lines 448-491)

### Issue 3: Hardcoded Colors

**Throughout page.tsx:**
- `bg-gray-50` → `style={{ background: 'var(--admin-bg-secondary)' }}`
- `border-gray-200` → `style={{ borderColor: 'var(--admin-border)' }}`
- `text-gray-600` → `style={{ color: 'var(--admin-text-secondary)' }}`
- `text-gray-700` → `style={{ color: 'var(--admin-text-secondary)' }}`
- `text-gray-900` → `style={{ color: 'var(--admin-text)' }}`

### Issue 4: Hardcoded Typography

**Line 297:**
```tsx
<h1 className="text-lg font-semibold text-gray-900">{project.title}</h1>
```

**Should be:**
```tsx
<h1 style={{
  fontSize: 'var(--font-size-xl)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--admin-text)'
}}>
  {project.title}
</h1>
```

### Issue 5: FeaturedImagePicker Button Spacing

**Location:** `FeaturedImagePicker.tsx:531-543`

**Current:**
```css
.action-buttons {
  gap: var(--space-3); /* 12px - WRONG */
}
```

**Should be:**
```css
.action-buttons {
  gap: var(--space-4); /* 16px - CORRECT */
}
```

## Design System Reference

### Button Classes Available

**From globals.css:**
```css
.btn { /* Base button styles */ }
.btn-primary { /* Accent background */ }
.btn-secondary { /* Outline style */ }
.btn-danger { /* Red for destructive */ }
```

### Admin Color Tokens Available

**From globals.css lines 126-138:**
```css
--admin-bg: hsl(0, 0%, 100%);
--admin-bg-secondary: hsl(210, 15%, 96%);
--admin-border: hsl(210, 10%, 85%);
--admin-text: hsl(210, 20%, 15%);
--admin-text-secondary: hsl(210, 10%, 40%);
--admin-text-muted: hsl(210, 10%, 55%);
--admin-primary: hsl(220, 90%, 56%);
```

### Spacing Tokens

```css
--space-2: 8px
--space-3: 12px  /* OLD - Don't use for button groups */
--space-4: 16px  /* CORRECT - Use for button groups */
--space-6: 24px  /* Larger gaps */
```

## Demo Script (30 seconds)
1. Open project editor at `/admin/projects/[id]`
2. Inspect Save Draft button - Uses `.btn btn-secondary` class
3. Check button spacing - 16px gap between buttons
4. Check heading - Uses `var(--font-size-xl)` token
5. Check sidebar headings - Use `var(--admin-text-secondary)`
6. Check borders - Use `var(--admin-border)` token
7. Inspect FeaturedImagePicker - Button gap is 16px
8. Compare to page editor - Visual consistency
9. Check responsive - Maintains design system on mobile
10. **Success**: All admin pages use design system consistently

## Success Criteria

### Design Token Usage
- [ ] All button groups use --space-4 (16px gap)
- [ ] All buttons use .btn classes (not inline Tailwind)
- [ ] Save Draft uses .btn .btn-secondary
- [ ] Publish uses .btn .btn-primary (if custom)
- [ ] All colors use --admin-* tokens
- [ ] All typography uses --font-size-* tokens
- [ ] All spacing uses --space-* tokens
- [ ] All border-radius uses design tokens
- [ ] No hardcoded gray-* colors
- [ ] No hardcoded text-* sizes
- [ ] No hardcoded mb-*, mt-* spacing

### Visual Consistency
- [ ] Project editor matches page editor visual language
- [ ] Buttons have proper breathing room
- [ ] Typography hierarchy clear
- [ ] Colors semantic and consistent
- [ ] Spacing rhythmic and intentional

### Maintainability
- [ ] Easy to update design system values
- [ ] No magic numbers in styles
- [ ] Semantic naming (not presentational)
- [ ] Consistent with rest of admin interface

## Pattern Reference

### ProjectMetadataSidebar (CORRECT Pattern)

This component ALREADY uses design tokens correctly:

```css
.sidebar-content {
  gap: var(--space-4, 16px); /* ✓ Correct */
  padding: var(--space-4, 16px); /* ✓ Correct */
  border-top: 1px solid var(--color-border); /* ✓ Correct */
}

.field-input {
  padding: var(--space-2) var(--space-3); /* ✓ Correct */
  color: var(--color-text); /* ✓ Correct */
  border: 1px solid var(--color-border); /* ✓ Correct */
  border-radius: var(--radius-md); /* ✓ Correct */
}
```

**Use this as the reference** - apply same pattern to page.tsx

### Button Class Pattern

```tsx
// WRONG - What's currently there
<button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
  Save Draft
</button>

// RIGHT - Use design system classes
<button className="btn btn-secondary">
  Save Draft
</button>
```

### Color Token Pattern

```tsx
// WRONG
<div className="bg-gray-50 border-gray-200">

// RIGHT
<div style={{
  background: 'var(--admin-bg-secondary)',
  borderColor: 'var(--admin-border)'
}}>
```

## Integration Points

These elements validate proper implementation:
- **Visual consistency** - Project editor should feel like rest of admin
- **Token usage** - All design decisions traceable to design system
- **Maintainability** - Changing design system updates all admin pages

## Effort Estimate

**Total: 2-3 hours**
- Fix button spacing and classes: 30 minutes
- Replace hardcoded colors with tokens: 1 hour
- Replace hardcoded typography: 30 minutes
- Replace hardcoded spacing: 30 minutes
- Testing and verification: 30 minutes
