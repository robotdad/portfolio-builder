# Smart Add Section Button

**Goal:** Add section button that positions options within viewport, never rendering off-screen.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

**Design Context:**
@plans/design/DESIGN-SYSTEM.md
@plans/design/components/smart-popover.md

## Scope

**Included**:
- Position-aware popover (opens above if near viewport bottom)
- Mobile: Bottom sheet instead of popover
- Inline add buttons between sections
- Keyboard navigation within menu (arrow keys, Enter, Escape)
- Focus management (trap focus, return on close)

**NOT Included**:
- Command palette / search
- Drag to insert
- Section templates/presets
- Recently used sections
- Nested section categories

## Tech Stack
- Custom Popover component with position calculation
- BottomSheet component for mobile
- ResizeObserver for dynamic repositioning
- React Portal for z-index management

## Key Files
```
src/components/shared/Popover.tsx             # Smart positioning popover
src/components/shared/BottomSheet.tsx         # Mobile sheet variant
src/components/editor/AddSectionButton.tsx    # Updated with smart popover
src/components/editor/InlineAddButton.tsx     # Between-section add button
src/hooks/usePopoverPosition.ts               # Position calculation logic
```

## Demo Script (30 seconds)
1. Open `/admin` editor with multiple sections
2. Scroll to bottom of page
3. Click "Add Section" button near page bottom
4. Popover opens ABOVE button (not clipped by viewport)
5. Use arrow keys to navigate options → Focus moves correctly
6. Press Escape → Popover closes, focus returns to button
7. On mobile: Tap "Add Section"
8. Bottom sheet slides up with section options
9. Tap backdrop → Sheet closes
10. Click inline "+" between sections → Same smart positioning
11. **Success**: Add section never renders options off-screen

## Success Criteria

### Functional Requirements
- [ ] Popover opens below trigger when space available
- [ ] Popover opens above trigger when near viewport bottom
- [ ] Horizontal alignment adjusts to stay within viewport
- [ ] Mobile (<768px) shows bottom sheet instead of popover
- [ ] Keyboard navigation works (arrows, Enter, Escape)
- [ ] Click outside closes popover
- [ ] Focus trapped within popover while open
- [ ] Focus returns to trigger on close
- [ ] Inline add buttons appear between existing sections

### Design Requirements
- [ ] Popover uses 8px gap from trigger
- [ ] Arrow indicator points to trigger element
- [ ] Open animation: scale 0.95→1, opacity 0→1, 150ms ease-out
- [ ] Bottom sheet slides up with 250ms ease-out
- [ ] Bottom sheet has drag handle and Cancel button
- [ ] Touch targets ≥48px on mobile (comfortable size)
- [ ] Backdrop dims content (40% black opacity)
- [ ] Safe area padding on notched devices

## Integration Points

These elements are designed to be extended:
- **Popover component** - Reusable for settings dropdowns, context menus
- **BottomSheet component** - Reusable for any mobile-first selection UI
- **usePopoverPosition hook** - Encapsulates viewport-aware positioning
