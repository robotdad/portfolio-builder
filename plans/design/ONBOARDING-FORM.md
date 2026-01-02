# Onboarding Form: Category + Project Creation

**Purpose**: Help new users create their first category and project with clear guidance and validation.

**Context**: First-time onboarding flow after portfolio signup.

---

## Component Interface

```typescript
export interface OnboardingFormProps {
  /** Called when form is submitted with valid data */
  onSubmit: (data: { category: string; project: string }) => Promise<void>
  /** Called when user cancels */
  onCancel?: () => void
  /** Whether form is currently submitting */
  isSubmitting: boolean
}
```

---

## Visual Design

### Layout Structure

```
┌────────────────────────────────────────────┐
│  Step 1 of 2: Create Your First Category  │ ← Context header
├────────────────────────────────────────────┤
│                                            │
│  Category Name *                           │ ← Label + required
│  ┌──────────────────────────────────────┐ │
│  │ e.g., Theatre, Film, Commercial      │ │ ← Placeholder
│  └──────────────────────────────────────┘ │
│  Choose a category to organize your work  │ ← Helper text
│                                            │
│  First Project Name *                     │
│  ┌──────────────────────────────────────┐ │
│  │ e.g., My Recent Work, Spring 2024    │ │
│  └──────────────────────────────────────┘ │
│  Give your first project a name           │
│                                            │
│  ┌──────────┐  ┌──────────────────────┐  │
│  │  Cancel  │  │  Continue →          │  │ ← Actions
│  └──────────┘  └──────────────────────┘  │
└────────────────────────────────────────────┘
```

---

## Interaction States

### 1. Initial State (Pristine)
- Both fields empty
- Placeholder text visible (gray)
- Helper text visible (muted)
- No error messages
- Continue button enabled

### 2. Field Focus
- Border changes to accent color
- Placeholder remains until typing starts
- Helper text remains visible

### 3. Typing
- Placeholder disappears
- User's text appears (black)
- Helper text remains
- No validation yet

### 4. Blur (Empty Field)
- Field marked as "touched"
- If empty: Show error message
- Border turns red
- Error replaces helper text
- `aria-invalid="true"` set

### 5. Blur (Filled Field)
- No error shown
- Helper text remains
- Field returns to default border

### 6. Submit Attempt (Empty Fields)
- All fields validated
- Empty fields show errors
- First error field receives focus
- Submit blocked

### 7. Submit Success
- Both fields valid
- Continue button shows loading state
- Form disabled
- Success callback fired

---

## Validation Rules

### Category Name
```typescript
const validateCategory = (value: string): string | undefined => {
  if (!value.trim()) {
    return 'Category name is required'
  }
  if (value.trim().length < 2) {
    return 'Category name must be at least 2 characters'
  }
  if (value.length > 50) {
    return 'Category name must be 50 characters or less'
  }
  return undefined
}
```

### Project Name
```typescript
const validateProject = (value: string): string | undefined => {
  if (!value.trim()) {
    return 'Project name is required'
  }
  if (value.trim().length < 2) {
    return 'Project name must be at least 2 characters'
  }
  if (value.length > 100) {
    return 'Project name must be 100 characters or less'
  }
  return undefined
}
```

### Validation Timing
- **On blur**: Validate individual field (only if touched)
- **On change**: Clear error if now valid (only if already touched)
- **On submit**: Validate all fields

---

## Accessibility

### ARIA Attributes
```typescript
// Category field
<input
  aria-required="true"
  aria-invalid={errors.category ? 'true' : 'false'}
  aria-describedby={errors.category ? 'category-error' : 'category-hint'}
/>

// Error message
<p id="category-error" role="alert">
  Category name is required
</p>

// Helper text
<p id="category-hint">
  Choose a category to organize your work
</p>
```

### Keyboard Navigation
- **Tab**: Move between fields
- **Enter**: 
  - In category field → Focus project field
  - In project field → Submit form
- **Escape**: Cancel (if onCancel provided)

### Screen Reader Support
- Labels properly associated with inputs (htmlFor/id)
- Required fields announced
- Errors announced via `role="alert"`
- Helper text linked via `aria-describedby`

---

## Mobile Optimizations

### Touch Targets
```css
.form-input {
  min-height: 48px;      /* Android minimum */
  padding: 12px 16px;
  font-size: 16px;       /* Prevents iOS zoom */
}

.btn {
  min-height: 48px;
  padding: 12px 24px;
}
```

### Responsive Layout
```css
@media (max-width: 767px) {
  .form-actions {
    flex-direction: column-reverse;
    gap: var(--space-3);
  }
  
  .btn {
    width: 100%;
  }
  
  /* Sticky submit on mobile (optional) */
  .mobile-footer {
    position: sticky;
    bottom: 0;
    background: var(--color-background);
    padding: var(--space-4);
    border-top: 1px solid var(--color-border);
  }
}
```

### Virtual Keyboard
- `autocomplete="off"` (prevent suggestions)
- `autocorrect="off"` (don't fix category/project names)
- `spellcheck="false"` (proper nouns)

---

## Styling Specifications

### Colors
```css
/* Required indicator */
.required {
  color: var(--admin-error, #dc2626);
}

/* Error state */
.form-input-error {
  border-color: var(--admin-error, #dc2626);
}

.form-input-error:focus {
  border-color: var(--admin-error, #dc2626);
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.1);
}

.form-error {
  color: var(--admin-error, #dc2626);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

/* Helper text */
.form-hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
}

/* Placeholder text */
.form-input::placeholder {
  color: var(--color-text-placeholder, #9ca3af);
  opacity: 1; /* Firefox fix */
}
```

### Spacing
```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.form-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
```

### Animation
```css
/* Error message fade in */
.form-error {
  animation: error-fade-in 150ms ease-out;
}

@keyframes error-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading state */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .form-error,
  .btn-spinner {
    animation: none;
  }
}
```

---

## Example Values

### Category Examples
- "Theatre"
- "Film"
- "Commercial"
- "Opera"
- "Television"
- "Music Video"

### Project Examples
- "My Recent Work"
- "Spring 2024"
- "Featured Projects"
- "Best Work"
- "Portfolio Highlights"

**Guidance**: Use "e.g., [Example 1], [Example 2], [Example 3]" format in placeholder to show variety without prescribing.

---

## Error Messages

### Category Errors
- Empty: "Category name is required"
- Too short: "Category name must be at least 2 characters"
- Too long: "Category name must be 50 characters or less"

### Project Errors
- Empty: "Project name is required"
- Too short: "Project name must be at least 2 characters"
- Too long: "Project name must be 100 characters or less"

**Tone**: Direct and helpful, not blaming.

---

## Success Criteria

### Functional
- ✅ Both fields are filled before submission
- ✅ Validation errors appear only after interaction
- ✅ Placeholder text disappears when typing
- ✅ Form submits on Enter key in project field
- ✅ Loading state shows during submission

### Usability
- ✅ Users understand what to enter (<5 seconds)
- ✅ Examples guide without prescribing
- ✅ No friction from deleting pre-filled text
- ✅ Clear what's required (asterisk + validation)
- ✅ Fast completion on mobile (<2 min)

### Accessibility
- ✅ WCAG AA contrast (4.5:1 text, 3:1 UI)
- ✅ Keyboard navigation works
- ✅ Screen reader announces errors
- ✅ Touch targets 48x48px minimum
- ✅ Focus states visible

---

## Implementation Notes

### Existing Pattern Match
This component follows the same pattern as `CategoryForm.tsx`:
- HTML placeholder attribute (not pre-filled values)
- Required asterisk in label
- Inline error messages below field
- Progressive validation (blur → submit)
- Accessible ARIA attributes

### Key Differences
- **Context**: Onboarding (first-time) vs. admin (repeated)
- **Copy**: More encouraging, less technical
- **Examples**: More varied to inspire different approaches

### Future Enhancements
- Quick-fill chips: Click example to populate field
- Category suggestions: Based on common patterns
- Project template options: Different starting structures
- Skip option: "I'll add these later" (if appropriate)

---

## Related Components
- `CategoryForm.tsx` - Admin category creation (similar validation)
- `ProjectForm.tsx` - Project creation (to be designed)
- `OnboardingWizard.tsx` - Multi-step onboarding container

---

**Status**: Specification complete, ready for implementation
**Last Updated**: 2026-01-02
