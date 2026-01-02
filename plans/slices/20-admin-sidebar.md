# Admin Sidebar Navigation

**Goal:** Desktop admin has persistent sidebar navigation for quick access to portfolio content areas.

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
- Navigation items: Dashboard, Categories
- Active state indication for current page (aria-current, visual styling)
- AdminLayoutContext for state management
- Skip link for accessibility
- Semantic HTML structure (nav, header, main, aside)

**NOT Included**:
- Mobile drawer navigation (separate future slice)
- Hamburger menu toggle (separate future slice)
- Nested navigation items (categories contain projects)
- Collapsible sidebar
- User profile/avatar in sidebar
- Settings page

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
| [Categories]  | |                                               | |
|               | | Page-specific content                         | |
|               | |                                               | |
|               | +-----------------------------------------------+ |
|               |                                                   |
+---------------+--------------------------------------------------+
```

### Below 1024px (handled by mobile drawer slice)

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
  onMenuToggle?: () => void;  // Used by mobile drawer
  showMenuButton?: boolean;   // false on desktop
}
```

## Navigation Items

```typescript
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Categories', href: '/admin/categories', icon: 'Folder' },
];
```

**Navigation pattern:**
- Dashboard (`/admin`) - Portfolio homepage editor
- Categories (`/admin/categories`) - Category management
  - Click category → Navigate to `/admin/categories/[id]/projects`
  - Projects accessed through category context, not top-level nav

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

## Active State Detection

```typescript
'use client'

import { usePathname } from 'next/navigation'

function AdminSidebar() {
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin'
    }
    
    // Prefix match for other sections
    return pathname.startsWith(href)
  }
  
  return (
    <nav aria-label="Admin navigation">
      <ul>
        {navItems.map(item => (
          <AdminNavItem
            key={item.href}
            {...item}
            isActive={isActive(item.href)}
          />
        ))}
      </ul>
    </nav>
  )
}
```

## Demo Script (30 seconds)
1. Open `/admin` at desktop width (>=1024px)
2. See sidebar on left with "Dashboard" and "Categories" items
3. "Dashboard" shows active state (highlighted, left border accent)
4. Click "Categories" - navigates to `/admin/categories`
5. "Categories" now shows active state
6. Sidebar shows "Dashboard" without active state
7. Resize browser below 1024px - sidebar disappears smoothly
8. Main content expands to full width
9. Header still visible with settings dropdown
10. Tab through navigation - focus states visible
11. Press Tab from header - skip link appears
12. Click skip link - focus moves to main content
13. **Success**: Desktop admin has clean sidebar navigation

## Success Criteria

### Functional Requirements
- [ ] AdminLayout wraps all /admin/* routes
- [ ] Sidebar visible at viewport >= 1024px
- [ ] Sidebar hidden at viewport < 1024px
- [ ] Navigation items link to correct routes
- [ ] Active item detected from current URL path
- [ ] Dashboard active only on exact `/admin` match
- [ ] Categories active on `/admin/categories` and child routes
- [ ] Active item shows visual distinction
- [ ] Header spans full width above sidebar and content
- [ ] Main content area scrolls independently
- [ ] Sidebar scrolls if content overflows

### Design Requirements
- [ ] Sidebar width: 240px fixed
- [ ] Header height: 64px
- [ ] Nav items have 44px minimum height (touch target)
- [ ] Active item: primary-50 background with primary-500 left border (4px)
- [ ] Hover state: neutral-100 background
- [ ] Icons: 16px size, aligned left with 12px gap
- [ ] Proper spacing using design system tokens (space-4 padding)
- [ ] Smooth transition when crossing 1024px breakpoint
- [ ] Typography: font-medium for labels

### Accessibility Requirements
- [ ] Skip link as first focusable element
- [ ] Skip link targets main content area with id="main-content"
- [ ] Skip link visible on keyboard focus
- [ ] Navigation uses semantic `<nav>` element
- [ ] Navigation has aria-label="Admin navigation"
- [ ] Active item has aria-current="page"
- [ ] All nav items keyboard focusable
- [ ] Visible focus indicators (2px outline, accent color)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus order: Skip link → Header → Sidebar → Main content

### Code Quality
- [ ] AdminLayoutContext provides state to children
- [ ] useAdminLayout hook for consuming context
- [ ] Components exported from barrel file (index.ts)
- [ ] TypeScript interfaces for all props
- [ ] No inline styles (use CSS classes/custom properties)
- [ ] PropTypes validation for runtime safety
- [ ] Component testing with realistic routing

## Integration Points

These elements are designed to be extended:
- **AdminLayout** - Mobile drawer slice will add drawer management
- **AdminHeader** - Mobile drawer slice will add hamburger toggle
- **AdminSidebar** - Content reused in mobile drawer component
- **AdminLayoutContext** - Will manage drawer open state for mobile
- **Nav items array** - Can be extended with additional sections as features grow

## Pattern Reference

### Layout Context Pattern

```typescript
// Existing pattern from React Context
import { createContext, useContext, useState } from 'react'

interface AdminLayoutContextValue {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | undefined>(undefined)

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  // Detect breakpoint changes
  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth < 768) setBreakpoint('mobile')
      else if (window.innerWidth < 1024) setBreakpoint('tablet')
      else setBreakpoint('desktop')
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return (
    <AdminLayoutContext.Provider value={{
      isSidebarOpen,
      toggleSidebar: () => setIsSidebarOpen(prev => !prev),
      closeSidebar: () => setIsSidebarOpen(false),
      breakpoint,
    }}>
      {children}
    </AdminLayoutContext.Provider>
  )
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext)
  if (!context) throw new Error('useAdminLayout must be used within AdminLayoutProvider')
  return context
}
```

### Skip Link Pattern

```typescript
// Accessibility best practice
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      // Only visible on keyboard focus
    >
      Skip to main content
    </a>
  )
}

// CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 0;
}
```

## Mobile Considerations

### Responsive Behavior
- **Desktop (>=1024px):** Sidebar always visible, 240px width
- **Tablet/Mobile (<1024px):** Sidebar hidden, main content full width
- **Transition:** 200ms ease-in-out when crossing breakpoint

### Header Behavior
- **Desktop:** No hamburger menu, settings dropdown on right
- **Mobile:** Hamburger menu appears (added by mobile drawer slice)

### Current Implementation Note
The existing AdminHeader already has settings dropdown. This slice adds the sidebar layout but preserves the header functionality.

## Effort Estimate

**Total: 8-12 hours**
- AdminLayout component + context: 2-3 hours
- AdminSidebar component: 2-3 hours
- AdminHeader updates: 1-2 hours
- AdminNavItem component: 1 hour
- CSS Grid layout + responsive: 1-2 hours
- Skip link + accessibility: 1 hour
- Testing and polish: 1-2 hours
