# Settings to Header

**Goal:** Move portfolio settings from main content area to header dropdown for cleaner editing focus.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/ADMIN-LAYOUT.md

## Scope

**Included**:
- Settings dropdown/popover in admin header
- Move portfolio name editing to header dropdown
- Move tagline editing to header dropdown
- Move theme selection to header dropdown
- Remove settings section from main content area
- Gear icon trigger with clear affordance

**NOT Included**:
- Full admin layout refactor
- Sidebar navigation
- Advanced settings (SEO, analytics, custom domain)
- Settings pages (single dropdown only)
- Nested settings categories

## Tech Stack
- Popover component (from smart-add-section or shared)
- Form controls within dropdown
- Auto-save on field blur
- React state for dropdown open/close

## Key Files
```
src/components/admin/SettingsDropdown.tsx     # Header settings popover
src/components/admin/AdminHeader.tsx          # Add settings trigger
src/components/editor/PortfolioEditor.tsx     # Remove inline settings
src/app/api/portfolio/settings/route.ts      # Settings update endpoint
```

## Demo Script (30 seconds)
1. Open `/admin` editor
2. Notice main content area is focused on sections (no settings form)
3. Click gear icon in admin header
4. Settings dropdown appears with:
   - Portfolio name field
   - Tagline field
   - Theme selector
5. Edit portfolio name → Field auto-saves on blur
6. Change theme → Immediately previews in editor behind dropdown
7. Click outside dropdown → Closes, changes persisted
8. Refresh → All settings retained
9. **Success**: Settings accessible but out of primary content flow

## Success Criteria

### Functional Requirements
- [ ] Gear icon in admin header opens settings dropdown
- [ ] Dropdown contains portfolio name, tagline, theme selector
- [ ] Fields auto-save on blur (no explicit save button needed)
- [ ] Theme change previews immediately in editor
- [ ] Dropdown closes on click outside
- [ ] Dropdown closes on Escape key
- [ ] Settings section removed from main content area
- [ ] Main content area now starts with first section

### Design Requirements
- [ ] Gear icon has clear hover/active states
- [ ] Dropdown positioned below trigger with 8px gap
- [ ] Dropdown width: 280-320px
- [ ] Form fields use consistent styling from design system
- [ ] Labels clearly identify each setting
- [ ] Saving indicator shows briefly after auto-save
- [ ] Mobile: Dropdown may convert to bottom sheet if needed
- [ ] Focus moves to first field when dropdown opens

## Integration Points

These elements are designed to be extended:
- **SettingsDropdown** - Can add more settings fields in future
- **Auto-save pattern** - Reusable for inline editing elsewhere
- **Header action area** - Pattern for additional header actions
