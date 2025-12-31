# Mobile Drawer Navigation

**Goal:** Tablet and mobile admin has hamburger menu with slide-out drawer for navigation.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/ADMIN-LAYOUT.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- MobileDrawer component with slide-in animation
- Hamburger toggle button in header (visible < 1024px)
- Backdrop overlay when drawer is open
- Focus trap within drawer when open
- Close triggers: backdrop click, Escape key, navigation
- Return focus to hamburger on close
- Same navigation items as desktop sidebar
- Touch-friendly sizing (44px minimum targets)
- Reduced motion support

**NOT Included**:
- Desktop layout changes (completed in Slice 18)
- Swipe-to-close gesture (optional enhancement, not MVP)
- Nested navigation items
- User profile in drawer
- Drawer from right side (always left)

## Tech Stack
- React Portal for drawer rendering
- CSS transforms for slide animation
- useFocusTrap hook for accessibility
- CSS custom properties for dimensions
- React Context (AdminLayoutContext from Slice 18)

## Key Files
```
src/components/admin/MobileDrawer.tsx          # Drawer component with animation
src/components/admin/DrawerBackdrop.tsx        # Semi-transparent overlay
src/components/admin/HamburgerButton.tsx       # Menu toggle button
src/hooks/useFocusTrap.ts                      # Focus trap for accessibility
src/components/admin/AdminHeader.tsx           # Update: add hamburger toggle
src/components/admin/AdminLayout.tsx           # Update: drawer state management
src/app/globals.css                            # Drawer animation CSS
```

## Layout Behavior

### Tablet/Mobile (< 1024px)

**Closed State:**
```
+------------------------------------------------------------------+
| [=] Admin Title                                     [Settings v]  |
+------------------------------------------------------------------+
|                                                                   |
| Main Content Area (full width)                                    |
|                                                                   |
+------------------------------------------------------------------+
```

**Open State:**
```
+------------------------------------------------------------------+
| [=] Admin Title                                     [Settings v]  |
+---------------+--------------------------------------------------+
|               |                                                   |
| MobileDrawer  |  Backdrop (semi-transparent)                      |
|   280px       |                                                   |
|               |                                                   |
| [Dashboard]   |                                                   |
| [Portfolio]   |                                                   |
| [Categories]  |                                                   |
| [Projects]    |                                                   |
| [Settings]    |                                                   |
|               |                                                   |
+---------------+--------------------------------------------------+
```

## Component Interfaces

```typescript
// MobileDrawer.tsx
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// DrawerBackdrop.tsx
interface DrawerBackdropProps {
  isOpen: boolean;
  onClick: () => void;
}

// HamburgerButton.tsx
interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaControls: string;
}
```

## CSS Custom Properties

```css
:root {
  --admin-sidebar-width-mobile: min(280px, 85vw);
  --admin-drawer-backdrop: rgba(0, 0, 0, 0.5);
  
  /* Z-index layers */
  --z-admin-drawer-backdrop: 120;
  --z-admin-drawer: 130;
  
  /* Transitions */
  --admin-transition-drawer: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Animation CSS

```css
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--admin-sidebar-width-mobile);
  background: var(--admin-sidebar-bg);
  transform: translateX(-100%);
  transition: transform var(--admin-transition-drawer);
  z-index: var(--z-admin-drawer);
}

.mobile-drawer[data-open="true"] {
  transform: translateX(0);
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: var(--admin-drawer-backdrop);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--admin-transition-drawer);
  z-index: var(--z-admin-drawer-backdrop);
}

.drawer-backdrop[data-open="true"] {
  opacity: 1;
  pointer-events: auto;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mobile-drawer,
  .drawer-backdrop {
    transition: none;
  }
}
```

## Focus Trap Implementation

```typescript
// useFocusTrap.ts
interface UseFocusTrapOptions {
  isActive: boolean;
  containerRef: RefObject<HTMLElement>;
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
}

function useFocusTrap(options: UseFocusTrapOptions): void {
  // When active:
  // 1. Store current activeElement
  // 2. Move focus to initialFocusRef or first focusable
  // 3. Trap Tab/Shift+Tab within container
  // 4. On deactivate, return focus to returnFocusRef or stored element
}
```

## Accessibility Requirements

### ARIA Attributes

```html
<!-- Hamburger button -->
<button
  aria-expanded="false"
  aria-controls="admin-drawer"
  aria-label="Open navigation menu"
>
  <MenuIcon />
</button>

<!-- Drawer -->
<aside
  id="admin-drawer"
  aria-hidden="true"
  aria-label="Navigation menu"
  role="dialog"
  aria-modal="true"
>
  <nav aria-label="Admin navigation">
    <ul role="list">...</ul>
  </nav>
</aside>
```

### Focus Management

1. **On open:** Focus moves to first nav item in drawer
2. **Tab cycles:** Focus stays within drawer (trapped)
3. **On close:** Focus returns to hamburger button
4. **Escape key:** Closes drawer

## Demo Script (30 seconds)
1. Open `/admin` at mobile width (< 1024px)
2. Sidebar not visible, hamburger icon in header
3. Click hamburger - drawer slides in from left
4. Backdrop dims the main content
5. Focus moves to first nav item ("Dashboard")
6. Tab through nav items - focus stays in drawer
7. Click "Categories" - drawer closes, navigates
8. Re-open drawer, click backdrop - drawer closes
9. Re-open drawer, press Escape - drawer closes
10. Focus returns to hamburger button
11. **Success**: Mobile admin has drawer navigation

## Success Criteria

### Functional Requirements
- [ ] Hamburger visible at viewport < 1024px
- [ ] Hamburger hidden at viewport >= 1024px
- [ ] Click hamburger opens drawer
- [ ] Drawer slides in from left edge
- [ ] Backdrop overlay appears behind drawer
- [ ] Click backdrop closes drawer
- [ ] Press Escape closes drawer
- [ ] Click nav item closes drawer and navigates
- [ ] Drawer shows same nav items as desktop sidebar
- [ ] Active nav item shows correct state

### Design Requirements
- [ ] Drawer width: min(280px, 85vw)
- [ ] Hamburger icon: 24px with 44px touch target
- [ ] Backdrop: 50% black opacity
- [ ] Slide animation: 250ms ease-out
- [ ] Nav items: 44px minimum height
- [ ] Proper spacing using design system tokens
- [ ] Smooth animation on open/close

### Accessibility Requirements
- [ ] Hamburger has aria-expanded state
- [ ] Hamburger has aria-controls pointing to drawer
- [ ] Drawer has role="dialog", aria-modal="true"
- [ ] Drawer has aria-hidden when closed
- [ ] Focus trapped in drawer when open
- [ ] Focus moves to drawer on open
- [ ] Focus returns to hamburger on close
- [ ] Escape key closes drawer
- [ ] Reduced motion respected

### Mobile Requirements
- [ ] Works on real iOS Safari
- [ ] Works on real Android Chrome
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll when drawer open
- [ ] Safe area padding for notched devices
- [ ] Drawer doesn't interfere with browser gestures

## Integration Points

These elements are designed to be extended:
- **MobileDrawer** - Can add swipe-to-close gesture later
- **useFocusTrap** - Reusable for modals, dialogs
- **DrawerBackdrop** - Reusable for other overlays
- **HamburgerButton** - Can animate to X icon

## Effort Estimate

**Total: 4-6 hours**
- MobileDrawer component: 1-2 hours
- DrawerBackdrop component: 30 minutes
- HamburgerButton component: 30 minutes
- useFocusTrap hook: 1-1.5 hours
- AdminHeader/Layout updates: 30 minutes
- Animation CSS: 30 minutes
- Testing on real devices: 1 hour

## Dependencies

- **Slice 18 required** - AdminLayout, AdminSidebar, AdminLayoutContext must exist
- **Nav items** - Shared between AdminSidebar and MobileDrawer

## Optional Enhancements (Post-MVP)

These are NOT required for slice completion but can be added later:

1. **Swipe-to-close gesture**
   - Touch start on drawer edge
   - Track horizontal movement
   - Close if swipe velocity/distance threshold met

2. **Animated hamburger icon**
   - Morph from hamburger to X when open
   - CSS transforms on the three bars

3. **Drawer header with close button**
   - Explicit close button for discoverability
   - Logo/branding in drawer header
