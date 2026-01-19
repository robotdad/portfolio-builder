# Admin Header Visual Complexity Pattern

**Design System Proposal**  
*Date: 2026-01-18*  
*Problem: AdminPageHeader handling both minimal (2 elements) and complex (9+ elements) use cases creates jarring visual inconsistency*

---

## 1. Problem Analysis

### Current State
The `AdminPageHeader` component is being used across three complexity tiers without differentiation:

| Page Type | Elements | Components | Visual Impact |
|-----------|----------|------------|---------------|
| **Dashboard** | 2 | Logo + "View Live Site" link | ✅ Spacious, clean |
| **Categories** | 3-4 | Breadcrumb + Title + "New Category" button | ✅ Balanced |
| **Project Editor** | 9+ | Breadcrumb (4 levels) + ViewLinks (2) + Divider + DraftIndicator + SaveButton + PublishButton | ❌ **Cramped, overwhelming** |

### Specific Issues

1. **Visual Overload**: Editor header packs breadcrumbs + 2 view links + 1 status badge + 2 action buttons horizontally
2. **No Hierarchy**: All 9 elements compete for attention equally
3. **Mobile Breaking Point**: Header will collapse/overflow on screens <768px
4. **Inconsistent Grouping**: Manual `<div className="action-divider" />` doesn't follow a system
5. **Cognitive Load**: Users must parse 6 interactive elements before taking action

---

## 2. Design Solution: Tiered Header System

### Core Principle
**One component, three tiers** - The same `AdminPageHeader` handles complexity through composition patterns, not separate components.

### Tier Classification

```tsx
// ✅ TIER 1: Minimal (Dashboard, Settings)
<AdminPageHeader
  navigation={{ type: 'dashboard', title: 'Dashboard' }}
  actions={<SingleAction />}
/>

// ✅ TIER 2: Standard (Categories, Projects List)
<AdminPageHeader
  navigation={{ type: 'breadcrumb', items: [...] }}
  actions={<ActionGroup primary={<Button />} secondary={[...]} />}
/>

// ✅ TIER 3: Editor (Complex editing interfaces)
<AdminPageHeader
  navigation={{ type: 'breadcrumb', items: [...] }}
  toolbar={<EditorToolbar />}  // NEW: Separate toolbar for complex UIs
/>
```

---

## 3. Pattern 1: Action Groups (Tier 2)

### Problem
Current: All buttons rendered flat with manual spacing/dividers

### Solution
Introduce **visual grouping primitives** that handle spacing, dividers, and responsive behavior automatically.

### Component Design

```tsx
// New component: AdminHeaderActions
interface AdminHeaderActionsProps {
  primary?: React.ReactNode      // Primary CTA (right-most, emphasized)
  secondary?: React.ReactNode[]  // Secondary actions (left of primary)
  meta?: React.ReactNode[]       // Meta info (left-most: status badges, view links)
}

export function AdminHeaderActions({ primary, secondary, meta }: AdminHeaderActionsProps) {
  return (
    <div className="admin-header-actions">
      {/* Meta group (status, view links) */}
      {meta && meta.length > 0 && (
        <>
          <div className="actions-group actions-group--meta">
            {meta.map((item, i) => (
              <Fragment key={i}>{item}</Fragment>
            ))}
          </div>
          <div className="actions-divider" aria-hidden="true" />
        </>
      )}
      
      {/* Secondary actions */}
      {secondary && secondary.length > 0 && (
        <div className="actions-group actions-group--secondary">
          {secondary.map((item, i) => (
            <Fragment key={i}>{item}</Fragment>
          ))}
        </div>
      )}
      
      {/* Primary action */}
      {primary && (
        <div className="actions-group actions-group--primary">
          {primary}
        </div>
      )}
    </div>
  )
}
```

### CSS (Mobile-First)

```css
.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-divider {
  width: 1px;
  height: 24px;
  background: var(--admin-border);
  margin: 0 4px;
}

/* Hide meta info on mobile (<768px) */
@media (max-width: 767px) {
  .actions-group--meta {
    display: none;
  }
  
  .actions-divider {
    display: none;
  }
}

/* Show meta on tablet+ (≥768px) */
@media (min-width: 768px) {
  .actions-group--meta {
    display: flex;
  }
}
```

### Usage Example (Categories Page)

```tsx
// Before (manual composition)
<AdminPageHeader
  actions={
    <button className="btn btn-primary">
      + New Category
    </button>
  }
/>

// After (explicit grouping)
<AdminPageHeader
  actions={
    <AdminHeaderActions
      primary={
        <button className="btn btn-primary">
          + New Category
        </button>
      }
    />
  }
/>
```

---

## 4. Pattern 2: Editor Toolbar (Tier 3)

### Problem
Editor headers cram 9+ elements into horizontal space designed for 3-4 elements.

### Solution
**Separate toolbar row** below main header for editor-specific controls. Header handles navigation, toolbar handles editing state.

### Component Design

```tsx
// New component: AdminEditorToolbar
interface AdminEditorToolbarProps {
  // Left side: Context/status
  status?: React.ReactNode       // DraftIndicator, PublishStatus, etc.
  context?: React.ReactNode[]    // ViewLinks, breadcrumb metadata
  
  // Right side: Actions
  actions: React.ReactNode[]     // Save, Publish, etc.
  
  // Optional
  className?: string
}

export function AdminEditorToolbar({ status, context, actions, className }: AdminEditorToolbarProps) {
  return (
    <div className={`admin-editor-toolbar ${className || ''}`}>
      <div className="toolbar-left">
        {status && <div className="toolbar-status">{status}</div>}
        {context && context.length > 0 && (
          <div className="toolbar-context">
            {context.map((item, i) => (
              <Fragment key={i}>{item}</Fragment>
            ))}
          </div>
        )}
      </div>
      
      <div className="toolbar-actions">
        {actions.map((action, i) => (
          <Fragment key={i}>{action}</Fragment>
        ))}
      </div>
    </div>
  )
}
```

### CSS (Mobile-First with Stacking)

```css
.admin-editor-toolbar {
  position: sticky;
  top: 64px; /* Below AdminPageHeader */
  z-index: 9;
  background: var(--admin-bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--admin-border);
  padding: 12px 16px;
  
  display: flex;
  flex-direction: column; /* Stack on mobile */
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-status {
  /* Status badge styling */
}

.toolbar-context {
  display: none; /* Hide view links on mobile */
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Tablet: Show context, keep stacking */
@media (min-width: 768px) {
  .toolbar-context {
    display: flex;
    gap: 8px;
  }
}

/* Desktop: Horizontal layout */
@media (min-width: 1024px) {
  .admin-editor-toolbar {
    top: 64px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
  }
  
  .toolbar-actions {
    flex-wrap: nowrap;
  }
}
```

### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ AdminPageHeader                                         │
│ [≡] Dashboard › Categories › Architecture › Hero Story │
├─────────────────────────────────────────────────────────┤
│ AdminEditorToolbar                                      │
│ 🟡 Draft  [View Draft ↗] [View Live ↗]  [Save] [Publish]│
└─────────────────────────────────────────────────────────┘
```

### Usage Example (Project Editor)

```tsx
// Before (everything in header actions)
<AdminPageHeader
  navigation={{ type: 'breadcrumb', items: [...] }}
  actions={
    <>
      <ViewLinksGroup {...} />
      <div className="action-divider" />
      <DraftIndicator {...} />
      <button>Save Draft</button>
      <PublishButton {...} />
    </>
  }
/>

// After (toolbar separation)
<>
  <AdminPageHeader
    navigation={{ type: 'breadcrumb', items: [...] }}
  />
  
  <AdminEditorToolbar
    status={<DraftIndicator status={draftStatus} hasUnpublishedChanges={hasUnpublishedChanges} />}
    context={[
      <ViewLinksGroup
        draftUrl={draftUrl}
        liveUrl={liveUrl}
        hasPublishedVersion={!!project.lastPublishedAt}
      />
    ]}
    actions={[
      <button
        type="button"
        onClick={saveDraft}
        disabled={!isDirty}
        className="btn btn-secondary"
      >
        Save Draft
      </button>,
      <PublishButton
        hasChangesToPublish={hasUnpublishedChanges}
        onPublish={handlePublish}
      />
    ]}
  />
</>
```

---

## 5. Responsive Strategy

### Breakpoint Behavior

| Breakpoint | Layout Strategy | Hidden Elements |
|------------|----------------|-----------------|
| **Mobile** (<768px) | Stack toolbar, hide meta info | ViewLinks, status details |
| **Tablet** (768-1023px) | Show context, keep flexible wrap | None |
| **Desktop** (≥1024px) | Full horizontal layout | None |

### Progressive Disclosure

```tsx
// Example: Hide ViewLinks on mobile, show in overflow menu
function ResponsiveViewLinks({ draftUrl, liveUrl, hasPublishedVersion }: ViewLinksProps) {
  return (
    <>
      {/* Desktop: Inline links */}
      <div className="view-links-inline">
        <ViewLinksGroup {...} />
      </div>
      
      {/* Mobile: Overflow menu */}
      <div className="view-links-mobile">
        <OverflowMenu>
          <OverflowMenuItem href={draftUrl} icon={<EyeIcon />}>
            View Draft
          </OverflowMenuItem>
          {hasPublishedVersion && (
            <OverflowMenuItem href={liveUrl} icon={<EyeIcon />}>
              View Live
            </OverflowMenuItem>
          )}
        </OverflowMenu>
      </div>
    </>
  )
}
```

---

## 6. Implementation Guidance

### Phase 1: Foundation (Week 1)
1. ✅ Create `AdminHeaderActions` component with grouping primitives
2. ✅ Add CSS variables for spacing/dividers
3. ✅ Update documentation with tier guidelines

### Phase 2: Editor Toolbar (Week 2)
1. ✅ Create `AdminEditorToolbar` component
2. ✅ Refactor Project Editor page to use toolbar
3. ✅ Test responsive behavior on mobile/tablet/desktop

### Phase 3: Refinement (Week 3)
1. ✅ Migrate other complex pages (if any)
2. ✅ Add overflow menu component for future extensibility
3. ✅ Conduct user testing on mobile devices

### Migration Checklist

**For each admin page:**

- [ ] Identify complexity tier (1, 2, or 3)
- [ ] If Tier 1-2: Keep `AdminPageHeader`, wrap actions in `AdminHeaderActions`
- [ ] If Tier 3: Split into `AdminPageHeader` + `AdminEditorToolbar`
- [ ] Test on mobile (<768px), tablet (768-1023px), desktop (≥1024px)
- [ ] Verify keyboard navigation works
- [ ] Screen reader test: Ensure logical reading order

---

## 7. Design Tokens

### Spacing
```css
:root {
  --header-actions-gap: 8px;          /* Between action items */
  --header-actions-group-gap: 12px;   /* Between action groups */
  --toolbar-padding-mobile: 12px 16px;
  --toolbar-padding-desktop: 12px 24px;
}
```

### Z-Index Stack
```css
:root {
  --z-admin-header: 10;       /* AdminPageHeader */
  --z-admin-toolbar: 9;       /* AdminEditorToolbar (below header) */
}
```

### Colors
```css
:root {
  --toolbar-bg: var(--admin-bg-secondary, #f9fafb);
  --toolbar-border: var(--admin-border, #e5e7eb);
  --actions-divider-color: var(--admin-border, #e5e7eb);
}
```

---

## 8. Accessibility Requirements

### Keyboard Navigation
- ✅ Tab order: Breadcrumb → Toolbar Status → Toolbar Context → Toolbar Actions
- ✅ Escape key closes overflow menus
- ✅ Focus indicators visible on all interactive elements

### Screen Readers
- ✅ Dividers marked `aria-hidden="true"` (visual only)
- ✅ Toolbar marked with `role="toolbar"` and `aria-label="Editor actions"`
- ✅ Status indicators use `role="status"` and `aria-live="polite"`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .admin-editor-toolbar {
    transition: none;
  }
}
```

---

## 9. Comparison: Before vs. After

### Project Editor Header (Before)
```
┌────────────────────────────────────────────────────────────────────┐
│ [≡] Dashboard › Categories › Architecture › Hero Story            │
│     [View Draft ↗] [View Live ↗] | 🟡 Draft  [Save]  [Publish]   │ ← CRAMPED
└────────────────────────────────────────────────────────────────────┘
```

**Issues:**
- ❌ 9 elements compete for horizontal space
- ❌ Breaks on mobile (<768px)
- ❌ No visual hierarchy
- ❌ Manual divider management

### Project Editor Header (After)
```
┌────────────────────────────────────────────────────────────────────┐
│ AdminPageHeader (Navigation only)                                 │
│ [≡] Dashboard › Categories › Architecture › Hero Story            │
├────────────────────────────────────────────────────────────────────┤
│ AdminEditorToolbar (Editing context)                              │
│ 🟡 Draft  [View Draft ↗] [View Live ↗]             [Save] [Publish]│
└────────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Clear separation: Navigation vs. Editing
- ✅ Responsive: Stacks on mobile, horizontal on desktop
- ✅ Visual hierarchy: Status → Context → Actions (left to right)
- ✅ Consistent spacing via design system

---

## 10. Decision Framework

**When choosing which pattern to use:**

```
┌─────────────────────────────────────────────────────────┐
│ START: Designing admin page header                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ How many actions?     │
         └───────┬───────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    0-1 actions  2-3     4+
        │        │        │
        ▼        ▼        ▼
    ┌──────┐ ┌──────┐ ┌──────────┐
    │TIER 1│ │TIER 2│ │  TIER 3  │
    │Simple│ │Action│ │ Toolbar  │
    │      │ │Group │ │          │
    └──────┘ └──────┘ └──────────┘
        │        │        │
        ▼        ▼        ▼
    actions= actions=  toolbar=
    <Button> <Admin   <Admin
             Header    Editor
             Actions>  Toolbar>
```

**Examples by page type:**
- **Dashboard, Settings** → Tier 1 (Simple)
- **Categories List, Projects List** → Tier 2 (Action Groups)
- **Project Editor, Page Editor** → Tier 3 (Separate Toolbar)

---

## 11. File Structure

```
src/components/admin/
├── AdminPageHeader.tsx          # Existing (keep as-is)
├── AdminHeaderActions.tsx       # NEW: Tier 2 grouping
├── AdminEditorToolbar.tsx       # NEW: Tier 3 toolbar
├── AdminEditorToolbar.module.css
├── index.ts                     # Export new components
└── __tests__/
    ├── AdminHeaderActions.test.tsx
    └── AdminEditorToolbar.test.tsx
```

---

## 12. Success Metrics

**Visual Consistency:**
- ✅ All admin pages use tier system
- ✅ No manual `className="action-divider"` in page code
- ✅ Spacing follows design tokens

**Mobile Responsiveness:**
- ✅ No horizontal scroll on iPhone SE (375px)
- ✅ All actions accessible on mobile (inline or overflow)
- ✅ Touch targets ≥44px

**Developer Experience:**
- ✅ Clear documentation for when to use each tier
- ✅ TypeScript types prevent invalid compositions
- ✅ Consistent API across all header components

---

## 13. Future Enhancements

### Overflow Menu (Post-MVP)
For pages that need 5+ actions on mobile:

```tsx
<AdminHeaderActions
  primary={<PublishButton />}
  secondary={[<SaveButton />]}
  overflow={[
    { label: 'Export', icon: <ExportIcon />, onClick: handleExport },
    { label: 'Duplicate', icon: <CopyIcon />, onClick: handleDuplicate },
  ]}
/>
```

### Sticky Toolbar Variants
Different sticky behaviors for different editing contexts:

```tsx
<AdminEditorToolbar
  stickyBehavior="always" | "on-scroll" | "none"
  {...props}
/>
```

---

## 14. Conclusion

**Recommendation:** ✅ **Implement the Tiered Header System**

### Why This Approach?

1. **Backward Compatible**: Existing simple headers continue to work
2. **Progressive Enhancement**: Add complexity only where needed
3. **Mobile-First**: Designed for smallest screens, enhanced for desktop
4. **Maintainable**: Clear patterns reduce ad-hoc solutions
5. **Accessible**: Semantic HTML and ARIA from the start

### Next Steps

1. **Review** this proposal with the team
2. **Prototype** `AdminEditorToolbar` on Project Editor page
3. **Test** on real devices (iPhone, iPad, desktop)
4. **Iterate** based on user feedback
5. **Document** final patterns in Storybook

---

**Questions or feedback?** Please comment on this document or reach out to the design systems team.
