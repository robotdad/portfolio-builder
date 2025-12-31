# Admin Layout Architecture

> Design specification for the portfolio admin interface layout system.
> This document defines the structural patterns, components, and responsive
> behavior for the admin experience.

---

## Overview

### Purpose

The admin layout provides a consistent, accessible structure for managing portfolio content. It prioritizes:

1. **Efficient navigation** - Quick access to all content management functions
2. **Content focus** - Maximum space for editing and previewing content
3. **Responsive experience** - Usable across desktop, tablet, and mobile devices
4. **Accessibility** - Full keyboard navigation and screen reader support

### Design Goals

- **Familiar patterns** - Leverage standard admin interface conventions
- **Minimal chrome** - Keep navigation compact to maximize content area
- **Clear hierarchy** - Primary actions always visible, secondary actions discoverable
- **Smooth transitions** - Responsive breakpoints feel intentional, not broken

---

## Layout Patterns

### Desktop Layout (≥1024px)

Fixed sidebar with persistent navigation alongside main content area.

```
┌─────────────────────────────────────────────────────────────────┐
│ AdminHeader                                         [⚙] [👤]   │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│ AdminSidebar │ Main Content Area                                │
│              │                                                  │
│ [Dashboard]  │ ┌────────────────────────────────────────────┐   │
│ [Portfolio]  │ │                                            │   │
│ [Categories] │ │ Page-specific content                      │   │
│ [Projects]   │ │                                            │   │
│              │ │                                            │   │
│              │ └────────────────────────────────────────────┘   │
│              │                                                  │
│   240px      │           Flexible (min: 600px)                  │
└──────────────┴──────────────────────────────────────────────────┘
```

**Characteristics:**
- Sidebar: Fixed 240px width
- Main content: Fluid, stretches to fill available space
- Header: Spans full width above both sidebar and content
- Sidebar scrolls independently if content overflows

### Tablet Layout (768px - 1023px)

Collapsible drawer navigation triggered by hamburger menu.

```
┌─────────────────────────────────────────────────────────────────┐
│ [≡] Admin Title                                     [⚙] [👤]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Main Content Area                                               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │ Full-width page content                                     │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

         ┌─── Drawer (overlay) ───┐
         │                        │
         │ [Dashboard]            │
         │ [Portfolio]            │
         │ [Categories]           │
         │ [Projects]             │
         │                        │
         │        280px           │
         └────────────────────────┘
```

**Characteristics:**
- Hamburger icon replaces persistent sidebar
- Drawer slides in from left as overlay
- Backdrop dims main content when drawer open
- Main content uses full viewport width

### Mobile Layout (<768px)

Same drawer pattern as tablet with touch-optimized spacing.

**Characteristics:**
- Larger touch targets (minimum 44px)
- Simplified header (shorter title, icon-only actions)
- Drawer width: 280px or 85vw (whichever is smaller)
- Swipe-to-close gesture support (optional enhancement)

---

## Component Specifications

### AdminLayout

Root wrapper component that orchestrates the entire admin interface.

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminLayoutState {
  isSidebarOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;
}
```

**Responsibilities:**
- Manages sidebar open/closed state
- Provides layout context to children
- Handles responsive breakpoint detection
- Renders semantic HTML structure

**HTML Structure:**
```html
<div class="admin-layout" data-sidebar-open="true|false">
  <header class="admin-header">...</header>
  <aside class="admin-sidebar">...</aside>
  <main class="admin-main">
    <!-- children -->
  </main>
</div>
```

---

### AdminHeader

Top navigation bar with branding, menu toggle, and user actions.

```typescript
interface AdminHeaderProps {
  title?: string;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}
```

**Settings Dropdown:**
```typescript
interface SettingsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

const settingsItems = [
  { label: 'Site Settings', href: '/admin/settings' },
  { label: 'View Site', href: '/', external: true },
  { label: 'Sign Out', action: 'signOut' },
];
```

---

### AdminSidebar

Navigation component with primary admin sections.

```typescript
interface AdminSidebarProps {
  currentPath: string;
  onNavigate?: (path: string) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[]; // For nested navigation (future)
}
```

**Navigation Items:**
```typescript
const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { label: 'Portfolio', href: '/admin/portfolio', icon: <PortfolioIcon /> },
  { label: 'Categories', href: '/admin/categories', icon: <CategoryIcon /> },
  { label: 'Projects', href: '/admin/projects', icon: <ProjectIcon /> },
  { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon /> },
];
```

**Visual States:**
- Default: Neutral background, medium text
- Hover: Subtle background highlight
- Active (current page): Strong background, bold text, left border accent
- Focus: Visible focus ring (keyboard navigation)

---

### MobileDrawer

Overlay navigation drawer for tablet and mobile breakpoints.

```typescript
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**Behavior:**
- Slides in from left edge
- Backdrop overlay (semi-transparent black)
- Closes on: backdrop click, Escape key, navigation
- Traps focus when open
- Returns focus to trigger element on close

**Animation:**
```css
.mobile-drawer {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}

.mobile-drawer[data-open="true"] {
  transform: translateX(0);
}

.drawer-backdrop {
  opacity: 0;
  transition: opacity 200ms ease-out;
}

.drawer-backdrop[data-open="true"] {
  opacity: 1;
}
```

---

### InlineAddButton

Contextual button for adding items between existing content.

```typescript
interface InlineAddButtonProps {
  label: string;
  onClick: () => void;
  position?: 'between' | 'after';
  disabled?: boolean;
}
```

**Visual Design:**
```
            ─────────── [ + Add Project ] ───────────
```

**Characteristics:**
- Horizontally centered between content sections
- Dashed line extends to edges (subtle visual connector)
- Appears on hover/focus of container area (optional)
- Always visible on mobile (no hover state)

---

## Information Architecture

### Navigation Hierarchy

```
Admin (root)
├── Dashboard (/admin)
│   └── Overview metrics, quick actions
│
├── Portfolio (/admin/portfolio)
│   └── Edit portfolio metadata, settings
│
├── Categories (/admin/categories)
│   ├── Category List (index)
│   ├── Add Category (/admin/categories/new)
│   └── Edit Category (/admin/categories/[id])
│
├── Projects (/admin/projects)
│   ├── Project List (index)
│   ├── Add Project (/admin/projects/new)
│   └── Edit Project (/admin/projects/[id])
│       ├── Overview (default tab)
│       ├── Media
│       └── Settings
│
└── Settings (/admin/settings)
    └── Site configuration
```

### Content Relationships

```
Portfolio (1)
    │
    ├── has many ──→ Categories (N)
    │   │
    │   └── has many ──→ Projects (N)
    │
    └── Settings
         ├── Site metadata
         ├── Theme preferences
         └── SEO configuration
```

---

## Responsive Breakpoints

### Breakpoint Definitions

```typescript
const breakpoints = {
  mobile: 0,      // 0 - 767px
  tablet: 768,    // 768 - 1023px
  desktop: 1024,  // 1024px+
} as const;
```

### Behavior Matrix

| Feature           | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|-------------------|---------------|-------------------|-----------------|
| Sidebar           | Hidden        | Hidden            | Visible (fixed) |
| Menu Toggle       | Visible       | Visible           | Hidden          |
| Drawer Navigation | Yes           | Yes               | No              |
| Header Title      | Short         | Short             | Full            |
| Content Width     | Full          | Full              | Fluid           |
| Touch Targets     | 44px min      | 44px min          | 36px min        |

---

## CSS Custom Properties

### Layout Dimensions

```css
:root {
  --admin-sidebar-width: 240px;
  --admin-sidebar-width-mobile: min(280px, 85vw);
  --admin-header-height: 64px;
  --admin-header-height-mobile: 56px;
  --admin-content-max-width: 1200px;
  --admin-content-padding: var(--space-6);
  --admin-content-padding-mobile: var(--space-4);
}
```

### Z-Index Layers

```css
:root {
  --z-admin-sidebar: 100;
  --z-admin-header: 110;
  --z-admin-drawer-backdrop: 120;
  --z-admin-drawer: 130;
  --z-admin-dropdown: 140;
}
```

### Colors (Admin-Specific)

```css
:root {
  --admin-sidebar-bg: var(--color-neutral-50);
  --admin-sidebar-border: var(--color-neutral-200);
  --admin-header-bg: var(--color-white);
  --admin-header-border: var(--color-neutral-200);
  --admin-nav-item-hover: var(--color-neutral-100);
  --admin-nav-item-active: var(--color-primary-50);
  --admin-nav-item-active-border: var(--color-primary-500);
  --admin-drawer-backdrop: rgba(0, 0, 0, 0.5);
}
```

### Transitions

```css
:root {
  --admin-transition-fast: 150ms ease-out;
  --admin-transition-normal: 200ms ease-out;
  --admin-transition-drawer: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Accessibility Requirements

### Semantic Structure

```html
<div class="admin-layout">
  <header class="admin-header" role="banner">
    <nav aria-label="Admin actions">...</nav>
  </header>
  
  <nav class="admin-sidebar" aria-label="Admin navigation">
    <ul role="list">...</ul>
  </nav>
  
  <main class="admin-main" id="main-content">
    <!-- Skip link target -->
  </main>
</div>
```

### Skip Links

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

### Keyboard Navigation

| Key          | Action                                    |
|--------------|-------------------------------------------|
| Tab          | Move between interactive elements         |
| Shift+Tab    | Move backwards                            |
| Enter/Space  | Activate buttons, links                   |
| Escape       | Close drawer, dropdown, modal             |
| Arrow Keys   | Navigate within menus (optional)          |

### Focus Management

**Drawer Open:**
1. Move focus to first focusable element in drawer
2. Trap focus within drawer (Tab cycles within)
3. On close, return focus to trigger button

**Dropdown Open:**
1. Move focus to first menu item
2. Arrow keys navigate menu items
3. Escape closes and returns focus to trigger

### ARIA Attributes

**Drawer:**
```html
<button
  aria-expanded="false"
  aria-controls="admin-drawer"
  aria-label="Open navigation menu"
>
  <MenuIcon />
</button>

<aside
  id="admin-drawer"
  aria-hidden="true"
  aria-label="Navigation menu"
>
  ...
</aside>
```

**Navigation:**
```html
<nav aria-label="Admin navigation">
  <ul role="list">
    <li>
      <a
        href="/admin"
        aria-current="page"
      >
        Dashboard
      </a>
    </li>
  </ul>
</nav>
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  .mobile-drawer,
  .drawer-backdrop,
  .admin-dropdown {
    transition: none;
  }
}
```

---

## Implementation Notes

### React Component Structure

```
src/components/admin/
├── AdminLayout.tsx
├── AdminHeader.tsx
├── AdminSidebar.tsx
├── MobileDrawer.tsx
├── SettingsDropdown.tsx
├── InlineAddButton.tsx
├── SkipLink.tsx
└── index.ts
```

### State Management

```typescript
interface AdminLayoutContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayout');
  }
  return context;
}
```

### CSS Strategy

Use CSS Grid for the overall layout:

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
}
```

---

## References

- [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) - Design tokens and system foundations
- [CONTENT-MODEL.md](./CONTENT-MODEL.md) - Portfolio content structure
