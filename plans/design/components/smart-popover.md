# Component: Smart Popover

**Purpose:** Position-aware dropdown that adapts to available viewport space  
**Customer insight:** Add Section button at page bottom caused dropdown to render off-screen  
**Used in:** Add Section, settings dropdown, contextual menus, any dropdown trigger

---

## Problem Analysis

### Current Behavior (Broken)
```
┌──────────────────────────────────────┐
│                                      │
│          Page Content                │
│                                      │
│                                      │
│                                      │
│──────────────────────────────────────│ ← Viewport bottom
│      [Add Section]                   │
│      ┌─────────────┐                 │
│      │ Hero        │ ← Opens BELOW   │
│      │ Gallery     │   (off-screen)  │
│      │ Text        │                 │
│      │ Contact     │                 │
│      └─────────────┘                 │
└──────────────────────────────────────┘
```

### Smart Behavior (Fixed)
```
┌──────────────────────────────────────┐
│                                      │
│          Page Content                │
│                                      │
│      ┌─────────────┐                 │
│      │ Hero        │ ← Opens ABOVE   │
│      │ Gallery     │   (in viewport) │
│      │ Text        │                 │
│      │ Contact     │                 │
│      └─────────────┘                 │
│──────────────────────────────────────│ ← Viewport bottom
│      [Add Section]                   │
└──────────────────────────────────────┘
```

---

## Position Strategy

### Algorithm

```typescript
type PopoverPosition = 'above' | 'below';

const calculatePosition = (
  triggerRect: DOMRect,
  popoverHeight: number,
  viewportHeight: number,
  gap: number = 8
): PopoverPosition => {
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  
  // Prefer below if it fits
  if (spaceBelow >= popoverHeight + gap) {
    return 'below';
  }
  
  // Fall back to above if it fits
  if (spaceAbove >= popoverHeight + gap) {
    return 'above';
  }
  
  // Use whichever has more space
  return spaceAbove > spaceBelow ? 'above' : 'below';
};
```

### Horizontal Alignment

```typescript
type HorizontalAlign = 'start' | 'center' | 'end';

const calculateHorizontalPosition = (
  triggerRect: DOMRect,
  popoverWidth: number,
  viewportWidth: number,
  preferredAlign: HorizontalAlign = 'start'
): { align: HorizontalAlign; offsetX: number } => {
  const spaceRight = viewportWidth - triggerRect.left;
  const spaceLeft = triggerRect.right;
  
  // Check if preferred alignment fits
  if (preferredAlign === 'start' && spaceRight >= popoverWidth) {
    return { align: 'start', offsetX: 0 };
  }
  
  if (preferredAlign === 'end' && spaceLeft >= popoverWidth) {
    return { align: 'end', offsetX: 0 };
  }
  
  // Adjust if overflowing
  if (spaceRight < popoverWidth && spaceLeft >= popoverWidth) {
    return { align: 'end', offsetX: 0 };
  }
  
  // Center as fallback, with edge clamping
  const centerOffset = (triggerRect.width - popoverWidth) / 2;
  return { align: 'center', offsetX: centerOffset };
};
```

---

## Visual Specification

### Desktop Popover

```
Position: Above (when space below is limited)
┌─────────────────────┐
│ ○ Hero Section      │  ← Option with icon
│ ○ Image Gallery     │
│ ○ Text Block        │
│ ○ Contact Form      │
│─────────────────────│  ← Divider (optional)
│ ○ Custom Section    │
└─────────────────────┘
        △               ← Arrow pointing to trigger
  [Add Section ▾]       ← Trigger button
```

```
Position: Below (default when space available)
  [Add Section ▾]       ← Trigger button
        ▽               ← Arrow pointing to trigger
┌─────────────────────┐
│ ○ Hero Section      │
│ ○ Image Gallery     │
│ ○ Text Block        │
│ ○ Contact Form      │
│─────────────────────│
│ ○ Custom Section    │
└─────────────────────┘
```

**Styling:**
```css
.popover {
  position: absolute;
  min-width: 200px;
  max-width: 320px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px hsla(0, 0%, 0%, 0.12);
  z-index: 100;
  overflow: hidden;
  animation: popoverIn var(--duration-quick) var(--ease-out);
}

@keyframes popoverIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popover[data-position="above"] {
  transform-origin: bottom center;
  margin-bottom: 8px;
}

.popover[data-position="below"] {
  transform-origin: top center;
  margin-top: 8px;
}

/* Arrow indicator */
.popover-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transform: rotate(45deg);
}

.popover[data-position="above"] .popover-arrow {
  bottom: -7px;
  border-top: none;
  border-left: none;
}

.popover[data-position="below"] .popover-arrow {
  top: -7px;
  border-bottom: none;
  border-right: none;
}
```

---

### Popover Items

```css
.popover-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--duration-instant) var(--ease-smooth);
}

.popover-item:hover,
.popover-item:focus {
  background: hsla(var(--color-accent-hsl), 0.08);
  outline: none;
}

.popover-item:active {
  background: hsla(var(--color-accent-hsl), 0.12);
}

.popover-item-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.popover-item-label {
  flex: 1;
}

.popover-item-hint {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.popover-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-2) 0;
}
```

---

### Mobile: Bottom Sheet

On mobile (< 768px viewport width), popover transforms to bottom sheet:

```
┌──────────────────────────────────────┐
│                                      │
│          Page Content                │
│          (dimmed)                    │
│                                      │
├──────────────────────────────────────┤
│  ───────  ← Drag handle              │
│                                      │
│  Add Section                         │  ← Title
│                                      │
│  ○ Hero Section                      │
│  ○ Image Gallery                     │
│  ○ Text Block                        │
│  ○ Contact Form                      │
│  ○ Custom Section                    │
│                                      │
│  [Cancel]                            │  ← Close button
│                                      │
└──────────────────────────────────────┘
```

**Bottom sheet styling:**
```css
@media (max-width: 767px) {
  .popover {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: none;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
    animation: slideUp var(--duration-standard) var(--ease-out);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .popover-backdrop {
    position: fixed;
    inset: 0;
    background: hsla(0, 0%, 0%, 0.4);
    z-index: 99;
  }
  
  .popover-handle {
    width: 36px;
    height: 4px;
    background: var(--color-border-strong);
    border-radius: 2px;
    margin: var(--space-3) auto var(--space-4);
  }
  
  .popover-title {
    font-family: var(--font-heading);
    font-size: var(--font-size-h4);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    padding: 0 var(--space-4) var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }
  
  .popover-item {
    padding: var(--space-4);
    min-height: var(--touch-comfortable);  /* 48px */
  }
  
  .popover-cancel {
    display: block;
    width: calc(100% - var(--space-8));
    margin: var(--space-4) auto;
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
  }
}
```

---

## Component Interface

```typescript
interface PopoverProps {
  /** Controls open/closed state */
  isOpen: boolean;
  
  /** Called when popover should close */
  onClose: () => void;
  
  /** Reference to trigger element for positioning */
  triggerRef: React.RefObject<HTMLElement>;
  
  /** Popover content */
  children: React.ReactNode;
  
  /** Preferred horizontal alignment */
  align?: 'start' | 'center' | 'end';  // default: 'start'
  
  /** Gap between trigger and popover in pixels */
  gap?: number;  // default: 8
  
  /** Show arrow indicator pointing to trigger */
  showArrow?: boolean;  // default: true
  
  /** Title for mobile bottom sheet */
  title?: string;
  
  /** Additional class names */
  className?: string;
}

interface PopoverItemProps {
  /** Item label */
  label: string;
  
  /** Optional icon (React component) */
  icon?: React.ComponentType<{ className?: string }>;
  
  /** Optional keyboard shortcut hint */
  shortcut?: string;
  
  /** Called when item selected */
  onSelect: () => void;
  
  /** Disabled state */
  disabled?: boolean;
}
```

**Usage:**
```tsx
const [isOpen, setIsOpen] = useState(false);
const triggerRef = useRef<HTMLButtonElement>(null);

<button
  ref={triggerRef}
  onClick={() => setIsOpen(true)}
  aria-expanded={isOpen}
  aria-haspopup="menu"
>
  Add Section ▾
</button>

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerRef={triggerRef}
  title="Add Section"
>
  <PopoverItem
    icon={ImageIcon}
    label="Hero Section"
    onSelect={() => handleAddSection('hero')}
  />
  <PopoverItem
    icon={GridIcon}
    label="Image Gallery"
    onSelect={() => handleAddSection('gallery')}
  />
  <PopoverDivider />
  <PopoverItem
    icon={PlusIcon}
    label="Custom Section"
    onSelect={() => handleAddSection('custom')}
  />
</Popover>
```

---

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open popover (on trigger) |
| `↓` | Move focus to next item |
| `↑` | Move focus to previous item |
| `Home` | Move focus to first item |
| `End` | Move focus to last item |
| `Enter` / `Space` | Select focused item |
| `Escape` | Close popover |
| `Tab` | Close popover and move focus |

**Focus management:**
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const items = popoverRef.current?.querySelectorAll('[role="menuitem"]');
  if (!items?.length) return;
  
  const currentIndex = Array.from(items).indexOf(document.activeElement);
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      (items[nextIndex] as HTMLElement).focus();
      break;
      
    case 'ArrowUp':
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      (items[prevIndex] as HTMLElement).focus();
      break;
      
    case 'Home':
      e.preventDefault();
      (items[0] as HTMLElement).focus();
      break;
      
    case 'End':
      e.preventDefault();
      (items[items.length - 1] as HTMLElement).focus();
      break;
      
    case 'Escape':
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
      break;
  }
};
```

---

## Accessibility

**ARIA attributes:**
```html
<!-- Trigger -->
<button
  aria-expanded="true"
  aria-haspopup="menu"
  aria-controls="section-menu"
>
  Add Section
</button>

<!-- Popover -->
<div
  id="section-menu"
  role="menu"
  aria-label="Add section options"
>
  <button role="menuitem" tabindex="-1">
    Hero Section
  </button>
  <button role="menuitem" tabindex="-1">
    Image Gallery
  </button>
  <div role="separator"></div>
  <button role="menuitem" tabindex="-1">
    Custom Section
  </button>
</div>
```

**Focus behavior:**
- When opened, focus moves to first menu item
- When closed via Escape, focus returns to trigger
- When item selected, focus returns to trigger
- Focus trap within popover while open

**Screen reader:**
- Announces "menu expanded" when opened
- Announces item labels as user navigates
- Announces "menu collapsed" when closed

---

## Close Behaviors

Popover closes when:
1. User presses Escape key
2. User clicks outside popover (click-away)
3. User selects a menu item
4. User presses Tab (moves focus out)
5. Trigger loses focus and popover has no focus (blur)
6. Mobile: User taps backdrop or Cancel button

```typescript
// Click-away detection
useEffect(() => {
  if (!isOpen) return;
  
  const handleClickOutside = (e: MouseEvent) => {
    if (
      popoverRef.current?.contains(e.target as Node) ||
      triggerRef.current?.contains(e.target as Node)
    ) {
      return;
    }
    onClose();
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isOpen, onClose]);
```

---

## Position Updates

Reposition popover when:
- Window resizes
- Content scrolls
- Popover content changes height

```typescript
useEffect(() => {
  if (!isOpen) return;
  
  const updatePosition = () => {
    // Recalculate and apply position
    const newPosition = calculatePosition(...);
    setPosition(newPosition);
  };
  
  window.addEventListener('resize', updatePosition);
  window.addEventListener('scroll', updatePosition, true);
  
  // ResizeObserver for content changes
  const observer = new ResizeObserver(updatePosition);
  if (popoverRef.current) {
    observer.observe(popoverRef.current);
  }
  
  return () => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
    observer.disconnect();
  };
}, [isOpen]);
```

---

## Theme Integration

**Theme controls:**
- Surface color (popover background)
- Border color
- Text colors (primary, secondary, tertiary)
- Accent color (hover state)
- Shadow opacity

**Theme does NOT control:**
- Border radius (8px constant)
- Gap from trigger (8px constant)
- Animation timing (design system tokens)
- Mobile breakpoint (768px)

---

## Validation Checklist

- [ ] Opens below trigger when space available
- [ ] Opens above trigger when near viewport bottom
- [ ] Horizontal alignment adjusts to fit viewport
- [ ] Arrow points to trigger correctly
- [ ] Click outside closes popover
- [ ] Escape key closes popover
- [ ] Focus returns to trigger on close
- [ ] Arrow keys navigate between items
- [ ] Enter/Space selects item
- [ ] Item selection closes popover
- [ ] Mobile shows bottom sheet (< 768px)
- [ ] Bottom sheet has drag handle and Cancel
- [ ] Backdrop tap closes bottom sheet
- [ ] Safe area padding on notched devices
- [ ] Screen reader announces menu state
- [ ] Focus trap within popover
- [ ] Works with all themes (Modern, Classic, Bold)

---

## Implementation Notes

**Dependencies:**
- useClickAway hook or similar
- ResizeObserver polyfill (if needed)
- Portal for rendering (avoid z-index issues)

**Estimate:** 6-8 hours

**Shared components to extract:**
- `BottomSheet` for mobile (can reuse elsewhere)
- `usePopoverPosition` hook
- `useFocusTrap` hook

---

**Related:** navigation.md (uses dropdown pattern), image-picker.md (uses modal pattern)
