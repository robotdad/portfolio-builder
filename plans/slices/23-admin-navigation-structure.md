# Admin Navigation Structure

**Goal:** Users can navigate to any portfolio content (pages, categories, projects) through a coherent navigation system.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/ADMIN-LAYOUT.md
@plans/design/DESIGN-SYSTEM.md

## Scope

**Included**:
- Populated drawer navigation with hierarchical structure
- Pages section showing all pages with homepage indicator
- Categories section showing expandable tree with project counts
- Breadcrumb navigation component
- Active state indication for current page/category/project
- Unify sidebar (desktop) and drawer (mobile) content
- Click category → Navigate to projects
- Click page → Navigate to page editor
- Remove references to non-existent routes
- Settings link in drawer

**NOT Included**:
- Search functionality
- Recent items section
- Favorites or bookmarks
- Nested category hierarchy (categories within categories)
- Project count live updating (static count on load)
- Dashboard page content
- User profile in drawer

## Tech Stack
- React components with TypeScript
- Existing AdminSidebar and MobileDrawer components
- React Router usePathname for active state
- Existing PageList and CategoryList data structures
- CSS Grid for layout

## Key Files
```
src/components/admin/NavigationTree.tsx         # Hierarchical nav component
src/components/admin/PageNavSection.tsx         # Pages section in nav
src/components/admin/CategoryNavSection.tsx     # Categories section with tree
src/components/admin/Breadcrumb.tsx             # Breadcrumb component
src/components/admin/AdminSidebar.tsx           # Update: render NavigationTree
src/components/admin/MobileDrawer.tsx           # Update: render NavigationTree
src/app/admin/categories/[id]/projects/page.tsx # Add breadcrumb
src/app/admin/projects/[id]/page.tsx           # Add breadcrumb
src/hooks/useNavigationData.ts                 # Fetch pages/categories for nav
```

## UI Design

### Desktop Sidebar Navigation

```
┌─ Portfolio Builder ─────────────┐
│                                  │
│ Dashboard                        │
│                                  │
│ Pages ▾                          │
│   Home ★                         │
│   About                          │
│   Contact                        │
│                                  │
│ Portfolio Work ▾                 │
│   Categories                     │
│   ▸ Theatre (3)                  │
│   ▸ Film (5)                     │
│   ▾ Opera (2)  ← Expanded        │
│     • Tosca                      │
│     • Carmen                     │
│                                  │
└──────────────────────────────────┘
```

### Mobile Drawer Navigation

```
┌─ Portfolio Builder ─────────────┐
│ [←]                              │
├──────────────────────────────────┤
│                                  │
│ Dashboard                        │
│                                  │
│ Pages ▾                          │
│   Home ★                         │
│   About                          │
│   Contact                        │
│                                  │
│ Portfolio Work ▾                 │
│   Categories                     │
│   ▸ Theatre (3 projects)         │
│   ▸ Film (5 projects)            │
│   ▸ Opera (2 projects)           │
│                                  │
└──────────────────────────────────┘
```

### Breadcrumb Navigation

```
┌──────────────────────────────────────────────┐
│ Categories > Theatre > Projects              │
├──────────────────────────────────────────────┤
│                                              │
│ [Project list content]                       │
└──────────────────────────────────────────────┘
```

### Collapsed Category Tree

```
Portfolio Work ▾
  Categories
  ▸ Theatre (3)    ← Click chevron to expand
  ▸ Film (5)       ← Or click name to navigate
  ▸ Opera (2)
```

### Expanded Category Tree

```
Portfolio Work ▾
  Categories
  ▾ Theatre (3)    ← Expanded
    • Hamlet 2024
    • Macbeth 2023
    • Romeo & Juliet
  ▸ Film (5)
  ▸ Opera (2)
```

## Component Structure

### NavigationTree Component

```typescript
interface NavigationTreeProps {
  // No props needed - fetches data internally
}

function NavigationTree() {
  const { pages, categories } = useNavigationData()
  const pathname = usePathname()
  
  return (
    <nav className="navigation-tree" aria-label="Main navigation">
      <NavSection title="Dashboard" href="/admin" />
      
      <PageNavSection 
        pages={pages}
        currentPath={pathname}
      />
      
      <CategoryNavSection
        categories={categories}
        currentPath={pathname}
      />
      
      <NavLink href="/admin/settings" icon="Settings">
        Settings
      </NavLink>
    </nav>
  )
}
```

### PageNavSection Component

```typescript
interface PageNavSectionProps {
  pages: Page[]
  currentPath: string
}

function PageNavSection({ pages, currentPath }: PageNavSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  return (
    <div className="nav-section">
      <button 
        className="nav-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <ChevronIcon direction={isExpanded ? 'down' : 'right'} />
        Pages
      </button>
      
      {isExpanded && (
        <ul className="nav-items">
          {pages.map(page => (
            <li key={page.id}>
              <Link
                href={`/admin?pageId=${page.id}`}
                className={currentPath === '/admin' ? 'active' : ''}
              >
                {page.title}
                {page.isHomepage && <span className="home-badge">★</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### CategoryNavSection Component

```typescript
interface CategoryNavSectionProps {
  categories: CategoryWithProjects[]
  currentPath: string
}

function CategoryNavSection({ categories, currentPath }: CategoryNavSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  
  return (
    <div className="nav-section">
      <div className="nav-section-header">
        Portfolio Work
      </div>
      
      <Link href="/admin/categories" className="nav-subsection-link">
        Categories
      </Link>
      
      <ul className="nav-tree">
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.id)
          const hasProjects = category._count?.projects > 0
          
          return (
            <li key={category.id} className="nav-tree-item">
              {/* Category row */}
              <div className="nav-tree-row">
                {hasProjects && (
                  <button
                    className="expand-btn"
                    onClick={() => toggleCategory(category.id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <ChevronIcon direction={isExpanded ? 'down' : 'right'} />
                  </button>
                )}
                
                <Link
                  href={`/admin/categories/${category.id}/projects`}
                  className="nav-tree-link"
                >
                  {category.name}
                  <span className="count">({category._count?.projects || 0})</span>
                </Link>
              </div>
              
              {/* Projects (when expanded) */}
              {isExpanded && hasProjects && (
                <ul className="nav-tree-children">
                  {category.projects?.map(project => (
                    <li key={project.id}>
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="nav-tree-child-link"
                      >
                        • {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

### Breadcrumb Component

```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.href ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

## Data Fetching

### useNavigationData Hook

```typescript
interface NavigationData {
  pages: Page[]
  categories: CategoryWithProjects[]
  isLoading: boolean
  error: Error | null
}

function useNavigationData(): NavigationData {
  const [data, setData] = useState<NavigationData>({
    pages: [],
    categories: [],
    isLoading: true,
    error: null,
  })
  
  useEffect(() => {
    Promise.all([
      fetch('/api/pages').then(r => r.json()),
      fetch('/api/categories?include=projects').then(r => r.json()),
    ])
      .then(([pagesRes, categoriesRes]) => {
        setData({
          pages: pagesRes.pages || [],
          categories: categoriesRes.categories || [],
          isLoading: false,
          error: null,
        })
      })
      .catch(error => {
        setData(prev => ({ ...prev, isLoading: false, error }))
      })
  }, [])
  
  return data
}
```

## Navigation Patterns

### Active State Detection

```typescript
function isActive(itemPath: string, currentPath: string): boolean {
  // Exact match for dashboard
  if (itemPath === '/admin' && currentPath === '/admin') {
    return true
  }
  
  // Prefix match for nested routes
  if (itemPath !== '/admin' && currentPath.startsWith(itemPath)) {
    return true
  }
  
  // Query param match for pages (e.g., /admin?pageId=123)
  if (itemPath.includes('pageId=') && currentPath === '/admin') {
    const urlParams = new URLSearchParams(itemPath.split('?')[1])
    const currentParams = new URLSearchParams(window.location.search)
    return urlParams.get('pageId') === currentParams.get('pageId')
  }
  
  return false
}
```

### Collapsible Sections Pattern

```typescript
const [expandedSections, setExpandedSections] = useState({
  pages: true,
  categories: true,
})

const toggleSection = (section: string) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section],
  }))
}

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('nav-expanded', JSON.stringify(expandedSections))
}, [expandedSections])
```

## Demo Script (30 seconds)
1. Open `/admin` on desktop - Sidebar visible on left
2. See "Pages" section with Home★, About, Contact
3. See "Portfolio Work" section with Categories
4. Click "Theatre" in sidebar - Navigate to `/admin/categories/{id}/projects`
5. Breadcrumb shows: "Categories > Theatre > Projects"
6. Sidebar shows "Theatre" as active/highlighted
7. Click chevron next to "Film" - Expands to show Film's projects
8. Click project name in tree - Navigate to project editor
9. Breadcrumb updates: "Categories > Film > Hamlet 2024"
10. Click "Pages" in sidebar - Navigate back to `/admin`
11. Resize to mobile - Sidebar becomes drawer
12. Click hamburger - Drawer slides in with same navigation
13. Click "Opera" - Navigate to Opera projects
14. Drawer auto-closes after navigation
15. **Success**: Complete navigation system for all content

## Success Criteria

### Functional Requirements
- [ ] NavigationTree component renders in both sidebar and drawer
- [ ] Pages section lists all pages
- [ ] Homepage indicated with star (★) badge
- [ ] Click page → Navigate to page editor (via pageId query param or tab switching)
- [ ] Categories section shows all categories
- [ ] Category shows project count: "Theatre (3)"
- [ ] Click category → Navigate to `/admin/categories/{id}/projects`
- [ ] Chevron button expands/collapses category
- [ ] Expanded category shows project list (bullet points)
- [ ] Click project in tree → Navigate to `/admin/projects/{id}`
- [ ] Breadcrumb component renders on project list pages
- [ ] Breadcrumb component renders on project editor pages
- [ ] Breadcrumb shows clickable path back through hierarchy
- [ ] Current item in breadcrumb not clickable (aria-current)
- [ ] Active navigation item highlighted
- [ ] Expanded/collapsed state persists in localStorage
- [ ] Settings link navigates to settings (or shows dropdown)

### Design Requirements
- [ ] Navigation tree uses consistent spacing (8px gaps)
- [ ] Indentation shows hierarchy (16px per level)
- [ ] Active item: accent background with left border
- [ ] Hover state: subtle background change
- [ ] Chevron icons: 16px, aligned properly
- [ ] Count badges: muted text color
- [ ] Star badge for homepage: accent color
- [ ] Breadcrumb separator: › character
- [ ] Breadcrumb links: hover underline
- [ ] Typography: regular weight for items, semibold for current
- [ ] Collapsible sections have smooth transition (200ms)

### Accessibility Requirements
- [ ] Navigation has semantic structure (nav, ul, li)
- [ ] Navigation has aria-label="Main navigation"
- [ ] Expandable items have aria-expanded state
- [ ] Chevron buttons have aria-label
- [ ] Active items have aria-current="page"
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Focus indicators visible (2px outline)
- [ ] Breadcrumb has aria-label="Breadcrumb"
- [ ] Screen reader announces navigation structure
- [ ] Color contrast meets WCAG AA

### Mobile Requirements
- [ ] Drawer receives NavigationTree content
- [ ] Drawer auto-closes after navigation
- [ ] Touch targets ≥ 44px
- [ ] Chevron buttons work on touch
- [ ] Collapsed/expanded state maintained on resize
- [ ] Safe area padding on notched devices

## Pattern Reference

### Existing Drawer Component

The MobileDrawer component exists at `src/components/admin/MobileDrawer.tsx`:

```typescript
// Current implementation (simple container)
export function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  return createPortal(
    <div className="drawer-container">
      {children}  // Navigation content goes here
    </div>,
    document.body
  )
}
```

This slice provides the `children` content (NavigationTree).

### Collapsible Tree Pattern

```typescript
// Manage expanded state
const [expanded, setExpanded] = useState<Set<string>>(new Set())

// Toggle category expansion
const handleToggle = (id: string) => {
  setExpanded(prev => {
    const next = new Set(prev)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    return next
  })
}

// Render with conditional children
<li>
  <button onClick={() => handleToggle(category.id)}>
    <ChevronIcon direction={expanded.has(category.id) ? 'down' : 'right'} />
  </button>
  <Link href={`/admin/categories/${category.id}/projects`}>
    {category.name}
  </Link>
  
  {expanded.has(category.id) && (
    <ul>
      {category.projects.map(project => (
        <li><Link href={`/admin/projects/${project.id}`}>{project.title}</Link></li>
      ))}
    </ul>
  )}
</li>
```

### Active State Styling

```css
.nav-item {
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 150ms ease;
}

.nav-item:hover {
  background: var(--color-neutral-100);
}

.nav-item.active {
  background: var(--color-primary-50);
  border-left: 4px solid var(--color-primary-500);
  padding-left: 8px; /* Compensate for border */
}
```

## Breadcrumb Usage Examples

### Project List Page

```tsx
// src/app/admin/categories/[id]/projects/page.tsx
<Breadcrumb items={[
  { label: 'Categories', href: '/admin/categories' },
  { label: category.name, href: `/admin/categories/${category.id}/projects` },
  { label: 'Projects' }
]} />
```

### Project Editor Page

```tsx
// src/app/admin/projects/[id]/page.tsx
<Breadcrumb items={[
  { label: 'Categories', href: '/admin/categories' },
  { label: category.name, href: `/admin/categories/${category.id}/projects` },
  { label: project.title }
]} />
```

## CSS Custom Properties

```css
:root {
  /* Navigation tree */
  --nav-tree-indent: 16px;
  --nav-item-height: 36px;
  --nav-item-padding: 8px 12px;
  --nav-item-gap: 4px;
  
  /* Breadcrumb */
  --breadcrumb-padding: 12px 0;
  --breadcrumb-separator-color: var(--color-text-muted);
  
  /* Active states */
  --nav-active-bg: var(--color-primary-50);
  --nav-active-border: var(--color-primary-500);
  --nav-hover-bg: var(--color-neutral-100);
}
```

## Integration Points

These elements are designed to be extended:
- **NavigationTree** - Can add search, recent items, favorites
- **PageNavSection** - Can add page type icons, draft indicators
- **CategoryNavSection** - Can add category icons, status indicators
- **Breadcrumb** - Reusable for any hierarchical navigation
- **useNavigationData** - Can add caching, real-time updates

## Effort Estimate

**Total: 14-22 hours**
- NavigationTree component: 2-3 hours
- PageNavSection component: 2-3 hours
- CategoryNavSection component: 3-4 hours
- Breadcrumb component: 1-2 hours
- useNavigationData hook: 1-2 hours
- Integration with sidebar/drawer: 2-3 hours
- Active state logic: 1-2 hours
- Breadcrumb placement in pages: 1-2 hours
- Testing and polish: 2-3 hours
