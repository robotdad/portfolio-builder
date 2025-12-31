# Admin Sidebar Navigation

**Goal:** Desktop admin has persistent sidebar navigation for quick access to all content areas.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/ADMIN-LAYOUT.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- AdminLayout wrapper component with CSS Grid structure
- AdminSidebar component with navigation items
- AdminHeader component (simplified, no hamburger on desktop)
- Responsive behavior: sidebar visible at >=1024px, hidden below
- Navigation items: Dashboard, Portfolio, Categories, Projects, Settings
- Active state indication for current page (aria-current, visual styling)
- AdminLayoutContext for state management
- Skip link for accessibility
- Semantic HTML structure (nav, header, main, aside)

**NOT Included**:
- Mobile drawer navigation (Slice 19)
- Hamburger menu toggle (Slice 19)
- Dashboard page content (future slice)
- Nested navigation items
- Collapsible sidebar
- User profile/avatar in sidebar

## Tech Stack
- React components with TypeScript
- CSS Grid for layout structure
- CSS custom properties for dimensions
- React Context for layout state
- Next.js usePathname for active state detection

## Key Files
```
src/components/admin/AdminLayout.tsx           # Root layout wrapper
src/components/admin/AdminSidebar.tsx          # Sidebar navigation component
src/components/admin/AdminHeader.tsx           # Header with actions
src/components/admin/AdminNavItem.tsx          # Individual nav item
src/components/admin/SkipLink.tsx              # Skip to main content link
src/components/admin/index.ts                  # Barrel exports
src/app/admin/layout.tsx                       # Apply AdminLayout to admin routes
src/app/globals.css                            # Admin layout CSS custom properties
```

## Layout Structure

### Desktop (>=1024px)

```
+------------------------------------------------------------------+
| AdminHeader                                         [Settings v]  |
+---------------+--------------------------------------------------+
|               |                                                   |
| AdminSidebar  | Main Content Area                                 |
|   240px       |   (flex)                                          |
|               |                                                   |
| [Dashboard]   | +-----------------------------------------------+ |
| [Portfolio]   | |                                               | |
| [Categories]  | | Page-specific content                         | |
| [Projects]    | |                                               | |
| [Settings]    | |                                               | |
|               | +-----------------------------------------------+ |
|               |                                                   |
+---------------+--------------------------------------------------+
```

### Below 1024px (handled by Slice 19)

```
+------------------------------------------------------------------+
| [=] Admin Title                                     [Settings v]  |
+------------------------------------------------------------------+
|                                                                   |
| Main Content Area (full width)                                    |
|                                                                   |
+------------------------------------------------------------------+
```

## Component Interfaces

```typescript
// AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminLayoutContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

// AdminSidebar.tsx
interface AdminSidebarProps {
  currentPath: string;
}

// AdminNavItem.tsx
interface AdminNavItemProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
}

// AdminHeader.tsx
interface AdminHeaderProps {
  title?: string;
  onMenuToggle?: () => void;  // Used by Slice 19
  showMenuButton?: boolean;   // false on desktop
}
```

## Navigation Items

```typescript
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Portfolio', href: '/admin/portfolio', icon: 'Briefcase' },
  { label: 'Categories', href: '/admin/categories', icon: 'Folder' },
  { label: 'Projects', href: '/admin/projects', icon: 'FileImage' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
];
```

## CSS Custom Properties

```css
:root {
  --admin-sidebar-width: 240px;
  --admin-header-height: 64px;
  --admin-header-height-mobile: 56px;
  --admin-content-max-width: 1200px;
  --admin-content-padding: var(--space-6);
  --admin-content-padding-mobile: var(--space-4);
  
  /* Z-index layers */
  --z-admin-sidebar: 100;
  --z-admin-header: 110;
  
  /* Colors */
  --admin-sidebar-bg: var(--color-neutral-50);
  --admin-sidebar-border: var(--color-neutral-200);
  --admin-header-bg: var(--color-white);
  --admin-header-border: var(--color-neutral-200);
  --admin-nav-item-hover: var(--color-neutral-100);
  --admin-nav-item-active: var(--color-primary-50);
  --admin-nav-item-active-border: var(--color-primary-500);
}
```

## CSS Grid Layout

```css
.admin-layout {
  display: grid;
  grid-template-rows: var(--admin-header-height) 1fr;
  grid-template-columns: 1fr;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .admin-layout {
    grid-template-columns: var(--admin-sidebar-width) 1fr;
    grid-template-areas:
      "header header"
      "sidebar main";
  }
  
  .admin-header { grid-area: header; }
  .admin-sidebar { grid-area: sidebar; }
  .admin-main { grid-area: main; }
}
```

## Demo Script (30 seconds)
1. Open `/admin` at desktop width (>=1024px)
2. See sidebar on left with navigation items
3. "Dashboard" shows active state (highlighted, left border)
4. Click "Categories" - navigates to `/admin/categories`
5. "Categories" now shows active state
6. Resize browser below 1024px - sidebar disappears
7. Main content expands to full width
8. Header still visible with title
9. Tab through navigation - focus states visible
10. Press Tab from header - skip link appears
11. Click skip link - focus moves to main content
12. **Success**: Desktop admin has sidebar navigation

## Success Criteria

### Functional Requirements
- [ ] AdminLayout wraps all /admin/* routes
- [ ] Sidebar visible at viewport >= 1024px
- [ ] Sidebar hidden at viewport < 1024px
- [ ] Navigation items link to correct routes
- [ ] Active item detected from current URL path
- [ ] Active item shows visual distinction
- [ ] Header spans full width above sidebar and content
- [ ] Main content area scrolls independently
- [ ] Sidebar scrolls if content overflows

### Design Requirements
- [ ] Sidebar width: 240px fixed
- [ ] Header height: 64px
- [ ] Nav items have 44px minimum height (touch target)
- [ ] Active item: primary background, left border accent
- [ ] Hover state: subtle background change
- [ ] Icons aligned with 16px size
- [ ] Proper spacing using design system tokens
- [ ] Smooth transition when crossing breakpoint

### Accessibility Requirements
- [ ] Skip link as first focusable element
- [ ] Skip link targets main content area
- [ ] Navigation uses semantic `<nav>` element
- [ ] Navigation has aria-label="Admin navigation"
- [ ] Active item has aria-current="page"
- [ ] All items keyboard focusable
- [ ] Visible focus indicators
- [ ] Color contrast meets WCAG AA

### Code Quality
- [ ] AdminLayoutContext provides state to children
- [ ] useAdminLayout hook for consuming context
- [ ] Components exported from barrel file
- [ ] TypeScript interfaces for all props
- [ ] No inline styles (use CSS classes/custom properties)

## Integration Points

These elements are designed to be extended:
- **AdminLayout** - Slice 19 adds mobile drawer
- **AdminHeader** - Slice 19 adds hamburger toggle
- **AdminSidebar** - Content reused in MobileDrawer
- **AdminLayoutContext** - Manages drawer open state
- **Nav items array** - Add/modify items as features grow

## Effort Estimate

**Total: 8-12 hours**
- AdminLayout component + context: 2-3 hours
- AdminSidebar component: 2-3 hours
- AdminHeader component: 1-2 hours
- AdminNavItem component: 1 hour
- CSS Grid layout + responsive: 1-2 hours
- Skip link + accessibility: 1 hour
- Testing and polish: 1-2 hours

## Dependencies

- **Phase 2 complete** - Categories and Projects routes should exist
- **Slice 12** - Settings dropdown pattern may be reused in header
