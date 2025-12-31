# Theme Selection UI

**Goal:** User can select and preview themes for their portfolio.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/themes/modern-minimal.md
@plans/design/themes/classic-elegant.md
@plans/design/themes/bold-editorial.md

## Scope

**Included**:
- Theme selector component in admin header/settings
- Live preview of theme changes in editor
- Three theme options (Modern Minimal, Classic Elegant, Bold Editorial)
- Persist theme choice to portfolio settings
- Immediate visual feedback when switching themes

**NOT Included**:
- Custom theme creation
- Per-page themes (portfolio-wide only)
- Theme customization (color tweaks, font overrides)
- Theme preview thumbnails
- Import/export themes

## Tech Stack
- CSS custom properties for theme switching
- React state for theme selection
- Prisma update for portfolio settings
- Next.js API route for persisting theme

## Key Files
```
src/components/admin/ThemeSelector.tsx       # Theme picker dropdown/cards
src/lib/themes.ts                            # Theme definitions and tokens
src/app/globals.css                          # Theme CSS custom properties
src/app/api/portfolio/settings/route.ts     # Save theme preference
prisma/schema.prisma                         # Add theme field to Portfolio
```

## Demo Script (30 seconds)
1. Open `/admin` editor with portfolio content visible
2. Locate theme selector (in header or settings area)
3. Current theme highlighted: "Modern Minimal"
4. Click "Classic Elegant" → Page immediately updates with warm colors, serif headings
5. Click "Bold Editorial" → Page updates with dark background, high contrast
6. Click "Modern Minimal" → Returns to cool neutrals
7. Refresh page → Selected theme persists
8. View published site → Theme applied consistently
9. **Success**: Theme switching works with instant preview and persistence

## Success Criteria

### Functional Requirements
- [ ] Can select from three available themes
- [ ] Theme change applies immediately in editor (no refresh)
- [ ] Theme choice persists to database
- [ ] Published site renders with selected theme
- [ ] Theme applies to all pages in portfolio
- [ ] Default theme is Modern Minimal for new portfolios

### Design Requirements
- [ ] Theme selector clearly shows current selection
- [ ] Theme options display theme name and brief description
- [ ] Transition between themes uses 200ms ease-out animation
- [ ] All three themes pass WCAG AA contrast requirements
- [ ] Theme switch does not cause layout shift (CLS = 0)
- [ ] Touch target for theme options is ≥44px on mobile

## Integration Points

These elements are designed to be extended:
- **Theme system** - Foundation for future custom themes or theme customization
- **CSS custom properties** - Can be extended with additional tokens
- **Settings persistence** - Pattern reusable for other portfolio-wide settings
