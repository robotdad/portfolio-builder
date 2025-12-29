# Component: Navigation

**Purpose:** Site-wide navigation adapting to user's category structure  
**Customer insight:** Categories are user-defined (Theatre, Film, Opera, etc. - NOT preset)  
**Used in:** All templates, all pages

---

## Desktop Navigation

### Structure

```
┌──────────────────────────────────────────────────────────┐
│ Sarah Chen    Work ▼  About  Contact  Resume  [Themes]  │
└──────────────────────────────────────────────────────────┘
```

**Layout:**
```css
nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  height: 64px;
}

.nav-container {
  max-width: var(--max-content-width);
  margin: 0 auto;
  padding: 0 var(--desktop-padding);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

### Logo/Name

```css
.nav-logo {
  font-family: var(--font-heading);
  font-size: var(--font-size-h4);
  font-weight: var(--font-heading-weight);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-smooth);
}

.nav-logo:hover {
  color: var(--color-accent);
}
```

**Links to:** Landing page (always)

---

### Navigation Links

**Pattern 1: Direct Category Links (≤5 categories)**

```
Sarah Chen    Theatre  Film  Opera  About  Contact  Resume
```

When user has 5 or fewer categories, show all as top-level links.

**Pattern 2: Dropdown Menu (>5 categories)**

```
Sarah Chen    Work ▼  About  Contact  Resume
              ↓
          ┌────────────────┐
          │ Theatre        │
          │ Film           │
          │ Opera          │
          │ Crafts         │
          │ Sketches       │
          │ Personal       │
          │ ───────────    │
          │ View All Work  │
          └────────────────┘
```

When user has >5 categories, collapse under "Work" dropdown.

**Link styling:**
```css
.nav-link {
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  transition: color var(--duration-quick) var(--ease-smooth);
}

.nav-link:hover {
  color: var(--color-text-primary);
}

.nav-link.active {
  color: var(--color-accent);
}
```

---

### Theme Switcher (Desktop)

```
[Modern] [Classic] [Bold]
```

**Position:** Far right of navigation bar  
**Separator:** Subtle border-left from nav links

**Styling:**
- Small ghost buttons (size="small")
- Active theme: Primary variant
- Inactive themes: Ghost variant
- Gap: `--space-2` between buttons

**Behavior:**
- Click → Theme changes immediately (preview mode)
- Only in editor view (not on published site)
- Can be hidden if user doesn't want it

---

## Mobile Navigation

### Hamburger Menu

```
┌────────────────────────────────┐
│ Sarah Chen               ☰     │  ← Hamburger icon (right)
└────────────────────────────────┘
```

**Hamburger button:**
```css
.hamburger {
  width: var(--touch-min);  /* 44px */
  height: var(--touch-min);
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hamburger svg {
  width: 24px;
  height: 24px;
  stroke: var(--color-text-primary);
}
```

---

### Mobile Menu Panel

**Slide-in from right:**

```
                    ┌─────────────────┐
                    │ [X]             │  ← Close button
                    │                 │
                    │ Theatre         │
                    │ Film            │
                    │ Opera           │
                    │ ─────────       │
                    │ About           │
                    │ Contact         │
                    │ Resume          │
                    │                 │
                    │ [Themes]        │  ← Bottom
                    └─────────────────┘
```

**Panel specifications:**
```css
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: var(--color-background);
  box-shadow: -4px 0 12px hsla(0, 0%, 0%, 0.1);
  padding: var(--space-5);
  z-index: 999;
  animation: slideIn 250ms var(--ease-out);
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.mobile-menu-backdrop {
  position: fixed;
  inset: 0;
  background: hsla(0, 0%, 0%, 0.4);
  z-index: 998;
}
```

**Menu items:**
```css
.mobile-nav-link {
  font-family: var(--font-heading);
  font-size: var(--font-size-h4);
  color: var(--color-text-primary);
  text-decoration: none;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
  display: block;
  line-height: 2.5;  /* Generous tap target */
}
```

**Touch targets:**
- Each link: 44px minimum height
- Adequate spacing (separator lines help)
- Tap anywhere in row → Navigate

---

## Dynamic Category Handling

**System adapts to user's categories:**

**Example: 2 categories**
```
Nav: Home | Theatre | Film | About | Resume
```

**Example: 8 categories**
```
Nav: Home | Work ▼ | About | Resume
     Work dropdown shows:
     - Theatre
     - Film  
     - Opera
     - Crafts
     - Sketches
     - Personal
     - Commercial
     - Educational
```

**Implementation:**
```typescript
// Pseudocode
const categories = user.categories; // From database

if (categories.length <= 5) {
  // Show all as top-level links
  return categories.map(cat => <NavLink href={cat.slug}>{cat.name}</NavLink>);
} else {
  // Collapse under "Work" dropdown
  return (
    <Dropdown label="Work">
      {categories.map(cat => <DropdownItem href={cat.slug}>{cat.name}</DropdownItem>)}
    </Dropdown>
  );
}
```

---

## Resume Handling

**Pattern 1: Direct Download Link**
```
Nav link: "Resume" 
Click → PDF downloads immediately
```

**Pattern 2: Resume Page**
```
Nav link: "Resume"
Click → /resume page with:
  - Download button (top)
  - Optional preview (iframe or image)
  - Print-friendly layout
```

**Customer preference:** Downloadable, not inline

**My recommendation:** Pattern 1 (direct download) for simplicity. Add Pattern 2 in Phase 2 if users request preview.

**Implementation:**
```tsx
{user.resume_pdf && (
  <a 
    href={user.resume_pdf} 
    download
    className="nav-link"
  >
    Resume
  </a>
)}
```

---

## Breadcrumb Navigation (Project Pages)

**Shows context and navigation path:**

```
Theatre Work > Hamlet 2024
```

**Styling:**
```css
.breadcrumbs {
  padding: var(--space-4) var(--mobile-padding);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.breadcrumb-link {
  color: var(--color-accent);
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 var(--space-2);
  color: var(--color-text-tertiary);
}
```

**Structure:**
```
Category Name > Project Name
     ↓                ↓
  Link back      Current page (no link)
```

---

## Accessibility

**Keyboard navigation:**
- Tab through nav links left-to-right
- Enter activates link
- Escape closes dropdown/mobile menu
- Focus visible (2px outline)

**Screen reader:**
```html
<nav aria-label="Main navigation">
  <a href="/" aria-label="Home - Sarah Chen">Sarah Chen</a>
  <a href="/theatre" aria-current="page">Theatre</a>
  <a href="/film">Film</a>
  ...
</nav>
```

**Mobile menu:**
```html
<button 
  aria-label="Open navigation menu"
  aria-expanded="false"
  onClick={toggleMenu}
>
  ☰
</button>
```

---

## Theme Integration

**Theme controls:**
- Navigation background (usually matches page background)
- Text colors (primary, secondary, accent)
- Border color
- Active state color

**Consistent across themes:**
- Height (64px)
- Spacing between links
- Touch targets (44px minimum)
- Transition timing

---

## Validation Checklist

- [ ] Adapts to 2-10 user-defined categories
- [ ] Direct links when ≤5 categories
- [ ] Dropdown when >5 categories
- [ ] Mobile hamburger menu works
- [ ] Mobile menu slides in smoothly (250ms)
- [ ] Backdrop closes menu on tap
- [ ] Resume link downloads PDF (if provided)
- [ ] Breadcrumbs show on project pages
- [ ] Breadcrumbs link back to category
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Screen reader announces structure
- [ ] Focus indicators visible
- [ ] Works on iPhone Safari (sticky positioning)
- [ ] Works with all themes

---

**Next: Project Hero and Resume Download components, then theme specs...**
