# Polish: Accessibility Audit

A self-contained work package for achieving WCAG 2.1 AA compliance across the portfolio builder application.

## Overview

Audit and enhance accessibility across all user flows. Focus on keyboard navigation, screen reader compatibility, color contrast, focus management, and ARIA patterns. Target: WCAG 2.1 AA compliance for both the builder interface and published portfolios.

## Prerequisites

- `flows/onboarding-flow.md` - Forms, theme selection
- `flows/editing-flow.md` - Drag-and-drop, component manipulation
- `flows/media-flow.md` - Image upload, alt text management
- `flows/publish-flow.md` - Public site rendering
- `polish/mobile-optimization.md` - Touch targets, focus indicators

## Deliverables

1. Keyboard navigation for all interactions
2. Screen reader announcements
3. Color contrast compliance
4. Focus management system
5. Form accessibility patterns
6. Alt text enforcement
7. ARIA implementation
8. Skip links and landmarks
9. Reduced motion support
10. Automated testing setup
11. Accessibility statement page

---

## 1. WCAG 2.1 AA Requirements Summary

### Perceivable

| Criterion | Requirement | Priority |
|-----------|-------------|----------|
| 1.1.1 Non-text Content | Alt text for images | High |
| 1.3.1 Info and Relationships | Semantic HTML, ARIA | High |
| 1.3.2 Meaningful Sequence | Logical DOM order | Medium |
| 1.4.1 Use of Color | Don't rely on color alone | High |
| 1.4.3 Contrast (Minimum) | 4.5:1 text, 3:1 large text | High |
| 1.4.4 Resize Text | 200% zoom without loss | Medium |
| 1.4.10 Reflow | No horizontal scroll at 320px | Medium |
| 1.4.11 Non-text Contrast | 3:1 for UI components | High |

### Operable

| Criterion | Requirement | Priority |
|-----------|-------------|----------|
| 2.1.1 Keyboard | All functionality via keyboard | High |
| 2.1.2 No Keyboard Trap | Can always escape | High |
| 2.4.1 Bypass Blocks | Skip links | Medium |
| 2.4.3 Focus Order | Logical tab sequence | High |
| 2.4.4 Link Purpose | Clear link text | Medium |
| 2.4.6 Headings and Labels | Descriptive headings | Medium |
| 2.4.7 Focus Visible | Visible focus indicator | High |
| 2.5.3 Label in Name | Visible label matches accessible name | Medium |

### Understandable

| Criterion | Requirement | Priority |
|-----------|-------------|----------|
| 3.1.1 Language of Page | `lang` attribute | High |
| 3.2.1 On Focus | No unexpected changes | High |
| 3.2.2 On Input | No unexpected changes | High |
| 3.3.1 Error Identification | Clear error messages | High |
| 3.3.2 Labels or Instructions | Form field labels | High |

### Robust

| Criterion | Requirement | Priority |
|-----------|-------------|----------|
| 4.1.1 Parsing | Valid HTML | Medium |
| 4.1.2 Name, Role, Value | Correct ARIA usage | High |

---

## 2. Keyboard Navigation

### Global Keyboard Shortcuts

Already defined in editing-flow.md, ensure documentation:

```typescript
// Create src/components/ui/KeyboardShortcutsDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['Ctrl/Cmd', 'Z'], action: 'Undo' },
  { keys: ['Ctrl/Cmd', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl/Cmd', 'D'], action: 'Duplicate component' },
  { keys: ['Ctrl/Cmd', 'C'], action: 'Copy component' },
  { keys: ['Ctrl/Cmd', 'V'], action: 'Paste component' },
  { keys: ['Delete'], action: 'Delete component' },
  { keys: ['Escape'], action: 'Deselect / close' },
  { keys: ['Enter'], action: 'Edit selected component' },
  { keys: ['Tab'], action: 'Move to next element' },
  { keys: ['Shift', 'Tab'], action: 'Move to previous element' },
  { keys: ['Arrow keys'], action: 'Navigate within component' },
  { keys: ['?'], action: 'Show keyboard shortcuts' },
];

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="shortcuts-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative bg-surface rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 id="shortcuts-title" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Keyboard Shortcuts
        </h2>

        <dl className="space-y-2">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <dt className="text-text-muted">{shortcut.action}</dt>
              <dd className="flex gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 bg-surface-hover rounded text-xs font-mono"
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <Button
          onClick={() => setIsOpen(false)}
          className="mt-4 w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );
}
```

### Keyboard-Accessible Drag and Drop

```typescript
// In SortableBlock.tsx - add keyboard reordering
function SortableBlock({ componentId, sectionId, index }: SortableBlockProps) {
  const { state, dispatch } = useEditor();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const section = state.content.sections[sectionId];
    const componentCount = section.componentIds.length;

    switch (e.key) {
      case 'ArrowUp':
        if (e.altKey && index > 0) {
          e.preventDefault();
          dispatch({
            type: 'MOVE_COMPONENT',
            componentId,
            toSectionId: sectionId,
            toIndex: index - 1,
          });
          announceToScreenReader(`Moved to position ${index}`);
        }
        break;

      case 'ArrowDown':
        if (e.altKey && index < componentCount - 1) {
          e.preventDefault();
          dispatch({
            type: 'MOVE_COMPONENT',
            componentId,
            toSectionId: sectionId,
            toIndex: index + 2, // +2 because of how move logic works
          });
          announceToScreenReader(`Moved to position ${index + 2}`);
        }
        break;
    }
  };

  return (
    <div
      role="listitem"
      aria-label={`${component.type} component, position ${index + 1} of ${componentCount}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ... */}
    </div>
  );
}
```

### Focus Trap for Modals

Create `src/hooks/useFocusTrap.ts`:

```typescript
'use client';

import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}
```

---

## 3. Screen Reader Support

### Live Announcements

Create `src/components/ui/ScreenReaderAnnouncer.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export function ScreenReaderAnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('');
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage('');
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Visually hidden live regions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnounce must be used within ScreenReaderAnnouncerProvider');
  }
  return context.announce;
}

// Utility function for direct use
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const region = document.querySelector(`[aria-live="${priority}"]`);
  if (region) {
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }
}
```

### Screen Reader CSS

Add to global styles:

```css
/* Screen reader only - visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Make visible on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Announce Actions

```typescript
// In EditorProvider - announce state changes
const addComponent = useCallback((sectionId: string, type: string, index?: number) => {
  // ... existing logic
  announce(`Added ${type} component`);
}, [announce]);

const deleteComponent = useCallback((componentId: string) => {
  const component = state.content.components[componentId];
  // ... existing logic
  announce(`Deleted ${component?.type || 'component'}`, 'assertive');
}, [state.content.components, announce]);

const moveComponent = useCallback((/* ... */) => {
  // ... existing logic
  announce(`Moved component to position ${newIndex + 1}`);
}, [announce]);
```

---

## 4. Color Contrast

### Contrast Requirements

| Element | Ratio Required | Check |
|---------|---------------|-------|
| Normal text (< 18pt) | 4.5:1 | All body text |
| Large text (>= 18pt bold, >= 24pt) | 3:1 | Headings |
| UI Components | 3:1 | Buttons, inputs, icons |
| Focus indicators | 3:1 | Focus rings |

### Theme Color Audit

Create `src/lib/contrast.ts`:

```typescript
// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

// Check if contrast meets WCAG requirements
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
```

### Theme Validation

```typescript
// In theme system - validate contrast on theme creation
interface ThemeValidation {
  isValid: boolean;
  issues: string[];
}

export function validateThemeContrast(theme: Theme): ThemeValidation {
  const issues: string[] = [];

  const { colorText, colorTextMuted, colorBackground, colorPrimary, colorSurface } = theme.tokens;

  // Text on background
  if (!meetsContrastRequirement(colorText, colorBackground)) {
    issues.push(`Text color has insufficient contrast with background (${getContrastRatio(colorText, colorBackground).toFixed(2)}:1)`);
  }

  // Muted text on background
  if (!meetsContrastRequirement(colorTextMuted, colorBackground)) {
    issues.push(`Muted text has insufficient contrast with background`);
  }

  // Primary on background (for buttons)
  if (!meetsContrastRequirement(colorPrimary, colorBackground, 'AA', false)) {
    issues.push(`Primary color has insufficient contrast for UI elements`);
  }

  // Text on surface (cards, modals)
  if (!meetsContrastRequirement(colorText, colorSurface)) {
    issues.push(`Text has insufficient contrast on surface color`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
```

### High Contrast Mode Support

```css
/* Support Windows High Contrast Mode */
@media (forced-colors: active) {
  /* Ensure borders are visible */
  .border {
    border-color: CanvasText;
  }

  /* Ensure focus is visible */
  :focus {
    outline: 2px solid Highlight;
  }

  /* Buttons should use system colors */
  button {
    background-color: ButtonFace;
    color: ButtonText;
    border: 1px solid ButtonText;
  }

  button:hover {
    background-color: Highlight;
    color: HighlightText;
  }
}
```

---

## 5. Focus Management

### Visible Focus Indicators

```css
/* Global focus styles */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Custom focus ring component */
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}

/* Focus within for parent containers */
.focus-within-ring:focus-within {
  @apply ring-2 ring-primary ring-offset-2;
}
```

### Focus Management Hook

Create `src/hooks/useFocusManagement.ts`:

```typescript
'use client';

import { useCallback, useRef } from 'react';

export function useFocusManagement() {
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Save current focus
  const saveFocus = useCallback(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement;
  }, []);

  // Restore saved focus
  const restoreFocus = useCallback(() => {
    lastFocusedRef.current?.focus();
  }, []);

  // Focus first focusable element in container
  const focusFirst = useCallback((container: HTMLElement | null) => {
    if (!container) return;

    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, []);

  // Focus by ID
  const focusById = useCallback((id: string) => {
    document.getElementById(id)?.focus();
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusById,
  };
}
```

### Route Change Focus

```typescript
// In app layout - announce route changes
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAnnounce } from '@/components/ui/ScreenReaderAnnouncer';

export function RouteAnnouncer() {
  const pathname = usePathname();
  const announce = useAnnounce();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Announce page change
    const pageTitle = document.title || 'Page';
    announce(`Navigated to ${pageTitle}`);

    // Focus main content
    const main = document.querySelector('main');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      main.removeAttribute('tabindex');
    }
  }, [pathname, announce]);

  return null;
}
```

---

## 6. Form Accessibility

### Accessible Form Pattern

```typescript
// Create src/components/ui/FormField.tsx
'use client';

import { forwardRef, ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ id, label, type = 'text', error, description, required, className, children, ...props }, ref) => {
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={id}>
          {label}
          {required && (
            <span className="text-error ml-1" aria-hidden="true">*</span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </Label>

        {description && (
          <p id={descriptionId} className="text-sm text-text-muted">
            {description}
          </p>
        )}

        {children || (
          <Input
            ref={ref}
            id={id}
            type={type}
            aria-describedby={cn(descriptionId, errorId).trim() || undefined}
            aria-invalid={error ? 'true' : undefined}
            aria-required={required}
            className={cn(error && 'border-error')}
            {...props}
          />
        )}

        {error && (
          <p id={errorId} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
```

### Error Summary

```typescript
// Create src/components/ui/ErrorSummary.tsx
interface ErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
}

export function ErrorSummary({
  errors,
  title = 'Please fix the following errors:',
}: ErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, value]) => value);

  if (errorEntries.length === 0) return null;

  return (
    <div
      role="alert"
      aria-labelledby="error-summary-title"
      className="bg-error/10 border border-error rounded-lg p-4 mb-6"
    >
      <h2 id="error-summary-title" className="font-semibold text-error mb-2">
        {title}
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#${field}`}
              className="text-error underline hover:no-underline"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 7. Alt Text Enforcement

### Alt Text Indicator Component

```typescript
// In AssetGridItem - show alt text status
function AltTextStatus({ asset }: { asset: Asset }) {
  const hasAltText = Boolean(asset.altText);
  const isDecorative = asset.altText === '';

  if (isDecorative) {
    return (
      <span
        className="absolute top-2 right-2 bg-info text-white text-xs px-2 py-1 rounded"
        title="Marked as decorative"
      >
        Decorative
      </span>
    );
  }

  if (!hasAltText) {
    return (
      <span
        className="absolute top-2 right-2 bg-warning text-white text-xs px-2 py-1 rounded flex items-center gap-1"
        role="status"
        aria-label="Missing alt text"
      >
        <AlertCircle className="w-3 h-3" />
        No alt text
      </span>
    );
  }

  return null;
}
```

### Publish-Time Alt Text Validation

```typescript
// In publish flow - check for missing alt text
async function validateBeforePublish(pageContent: PageContent): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // Find all image components
  const imageComponents = Object.values(pageContent.components).filter(
    (c) => c.type === 'image' || c.type === 'gallery'
  );

  for (const component of imageComponents) {
    if (component.type === 'image') {
      const asset = await getAsset(component.props.assetId);
      if (asset && !asset.altText && asset.altText !== '') {
        issues.push({
          type: 'warning',
          message: `Image "${asset.filename}" is missing alt text`,
          componentId: component.id,
          action: 'Add alt text or mark as decorative',
        });
      }
    }

    if (component.type === 'gallery') {
      for (const assetId of component.props.assetIds) {
        const asset = await getAsset(assetId);
        if (asset && !asset.altText && asset.altText !== '') {
          issues.push({
            type: 'warning',
            message: `Gallery image "${asset.filename}" is missing alt text`,
            componentId: component.id,
          });
        }
      }
    }
  }

  return {
    canPublish: !issues.some((i) => i.type === 'error'),
    issues,
  };
}
```

---

## 8. Skip Links and Landmarks

### Skip Link Component

Create `src/components/ui/SkipLink.tsx`:

```typescript
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>
  );
}
```

### Landmark Structure

```typescript
// In app layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />

        <header role="banner">
          <nav aria-label="Main navigation">
            {/* ... */}
          </nav>
        </header>

        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>

        <footer role="contentinfo">
          {/* ... */}
        </footer>
      </body>
    </html>
  );
}
```

### Editor Landmarks

```typescript
// In PageEditor
<div className="h-screen flex flex-col">
  <header role="banner" aria-label="Editor toolbar">
    <EditorHeader />
  </header>

  <div className="flex-1 flex">
    <main id="main-content" role="main" aria-label="Page canvas">
      <EditorCanvas />
    </main>

    <aside role="complementary" aria-label="Component settings">
      <SettingsPanel />
    </aside>
  </div>

  <nav aria-label="Component picker">
    <ComponentPicker />
  </nav>
</div>
```

---

## 9. ARIA Patterns

### Drag and Drop ARIA

```typescript
// BlockWrapper with complete ARIA
<div
  role="listitem"
  aria-label={`${component.type} component`}
  aria-describedby={`${componentId}-instructions`}
  aria-grabbed={isDragging}
  tabIndex={0}
>
  {/* Hidden instructions */}
  <span id={`${componentId}-instructions`} className="sr-only">
    Press Space to start dragging. Use arrow keys to move. Press Space again to drop.
    Press Escape to cancel.
  </span>

  {/* Drag handle */}
  <button
    aria-label={`Drag ${component.type} to reorder`}
    aria-describedby={`${componentId}-drag-instructions`}
    {...dragHandleProps}
  >
    <GripVertical />
  </button>

  <span id={`${componentId}-drag-instructions`} className="sr-only">
    Use Alt + Arrow Up/Down to reorder without dragging
  </span>
</div>
```

### Modal Dialog Pattern

```typescript
// Proper modal ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Publish Portfolio</h2>
  <p id="modal-description">
    Your changes will be visible to everyone.
  </p>

  {/* Close button */}
  <button
    aria-label="Close dialog"
    onClick={onClose}
  >
    <X />
  </button>
</div>
```

### Dropdown Menu Pattern

```typescript
// Accessible dropdown
<div>
  <button
    id="menu-button"
    aria-haspopup="menu"
    aria-expanded={isOpen}
    aria-controls="menu-items"
    onClick={toggle}
  >
    Options
  </button>

  {isOpen && (
    <ul
      id="menu-items"
      role="menu"
      aria-labelledby="menu-button"
    >
      <li role="menuitem" tabIndex={-1}>
        <button onClick={handleEdit}>Edit</button>
      </li>
      <li role="menuitem" tabIndex={-1}>
        <button onClick={handleDelete}>Delete</button>
      </li>
    </ul>
  )}
</div>
```

---

## 10. Testing Setup

### Automated Testing with axe-core

```typescript
// Create src/lib/a11y-testing.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

export const axe = configureAxe({
  rules: {
    // Disable rules that don't apply
    'region': { enabled: false }, // We use landmarks manually
  },
});

// Usage in tests
import { render } from '@testing-library/react';
import { axe } from '@/lib/a11y-testing';

test('LoginPage has no accessibility violations', async () => {
  const { container } = render(<LoginPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Playwright Accessibility Tests

Create `e2e/accessibility.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES_TO_TEST = [
  { name: 'Landing', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Dashboard', path: '/dashboard' },
];

for (const page of PAGES_TO_TEST) {
  test(`${page.name} page should have no accessibility violations`, async ({ page: pwPage }) => {
    await pwPage.goto(page.path);

    const results = await new AxeBuilder({ page: pwPage })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

// Test keyboard navigation
test('can navigate with keyboard only', async ({ page }) => {
  await page.goto('/login');

  // Tab to email input
  await page.keyboard.press('Tab');
  await expect(page.locator('#email')).toBeFocused();

  // Tab to password input
  await page.keyboard.press('Tab');
  await expect(page.locator('#password')).toBeFocused();

  // Tab to submit button
  await page.keyboard.press('Tab');
  await expect(page.locator('button[type="submit"]')).toBeFocused();
});
```

### CI Integration

Add to `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Tests

on:
  pull_request:
    branches: [main]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run Playwright a11y tests
        run: npx playwright test e2e/accessibility.spec.ts
```

---

## 11. Accessibility Statement

Create `src/app/accessibility/page.tsx`:

```typescript
export const metadata = {
  title: 'Accessibility Statement | Portfolio Builder',
};

export default function AccessibilityPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>

      <section className="prose prose-neutral max-w-none">
        <p>
          Portfolio Builder is committed to ensuring digital accessibility for
          people with disabilities. We are continually improving the user
          experience for everyone and applying the relevant accessibility
          standards.
        </p>

        <h2>Conformance Status</h2>
        <p>
          We aim to conform to the Web Content Accessibility Guidelines (WCAG)
          2.1 at Level AA. These guidelines explain how to make web content
          more accessible for people with disabilities.
        </p>

        <h2>Accessibility Features</h2>
        <ul>
          <li>Full keyboard navigation support</li>
          <li>Screen reader compatibility</li>
          <li>Clear focus indicators</li>
          <li>Sufficient color contrast</li>
          <li>Resizable text up to 200%</li>
          <li>Alternative text for images</li>
          <li>Skip navigation links</li>
          <li>Consistent navigation</li>
          <li>Clear error messages</li>
          <li>Reduced motion support</li>
        </ul>

        <h2>Known Limitations</h2>
        <ul>
          <li>
            Drag and drop in the editor requires mouse interaction, but keyboard
            alternatives are available (Alt + Arrow keys)
          </li>
          <li>
            Some third-party embedded content may not be fully accessible
          </li>
        </ul>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of Portfolio Builder.
          Please let us know if you encounter accessibility barriers:
        </p>
        <ul>
          <li>Email: accessibility@example.com</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>
          Accessibility of Portfolio Builder relies on the following
          technologies:
        </p>
        <ul>
          <li>HTML</li>
          <li>WAI-ARIA</li>
          <li>CSS</li>
          <li>JavaScript</li>
        </ul>

        <p className="text-sm text-text-muted mt-8">
          This statement was last updated on {new Date().toLocaleDateString()}.
        </p>
      </section>
    </main>
  );
}
```

---

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── SkipLink.tsx
│       ├── ScreenReaderAnnouncer.tsx
│       ├── KeyboardShortcutsDialog.tsx
│       ├── FormField.tsx
│       └── ErrorSummary.tsx
├── hooks/
│   ├── useFocusTrap.ts
│   ├── useFocusManagement.ts
│   └── useAnnounce.ts
├── lib/
│   ├── contrast.ts
│   └── a11y-testing.ts
├── app/
│   └── accessibility/
│       └── page.tsx
└── e2e/
    └── accessibility.spec.ts
```

---

## Deliverables Checklist

- [ ] Keyboard navigation for all interactions
- [ ] Keyboard shortcuts documentation
- [ ] Screen reader announcer for dynamic content
- [ ] Focus trap for modals
- [ ] Route change announcements
- [ ] Color contrast validation for themes
- [ ] High contrast mode support
- [ ] Visible focus indicators
- [ ] Skip link to main content
- [ ] Proper landmark structure
- [ ] Accessible form components
- [ ] Error summary with links
- [ ] Alt text enforcement on publish
- [ ] ARIA patterns for drag-and-drop
- [ ] ARIA patterns for modals/menus
- [ ] axe-core integration in tests
- [ ] Playwright a11y tests
- [ ] CI accessibility checks
- [ ] Accessibility statement page

---

## Testing Checklist

### Keyboard Navigation
1. Tab through all interactive elements
2. Enter activates buttons/links
3. Escape closes modals
4. Arrow keys navigate menus
5. No keyboard traps

### Screen Reader
1. Page title announced on navigation
2. Form labels read correctly
3. Error messages announced
4. Dynamic content changes announced
5. Images have descriptive alt text

### Visual
1. 4.5:1 contrast for normal text
2. 3:1 contrast for large text
3. 3:1 contrast for UI components
4. Focus visible on all elements
5. No information conveyed by color alone

### Automated
1. axe-core passes on all pages
2. Lighthouse accessibility > 90
3. WAVE shows no errors
4. HTML validates

---

## Success Criteria

From user-success-scenarios.md:

- **Screen reader users**: Can navigate and use editor with VoiceOver/NVDA
- **Keyboard users**: Complete all tasks without mouse
- **Low vision users**: Can zoom to 200% without horizontal scroll
- **Color blind users**: Can distinguish all UI elements
- **Published portfolios**: Accessible to all visitors
