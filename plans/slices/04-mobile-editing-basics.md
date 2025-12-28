# Mobile Editing Basics

**Goal:** Sarah can update her portfolio from iPhone backstage in <5 minutes.

**Context:** Read `plans/PRINCIPLES.md` and `plans/TECH_STACK.md` before starting.

## Scope

**Included**:
- Responsive editor layout (stacked, not sidebar)
- Touch-friendly buttons (44px minimum)
- Mobile text editing (toolbar above keyboard)
- Mobile image upload (from photo library)
- Quick save indicator
- Test on actual iPhone

**NOT Included**:
- Mobile camera capture (library only for now)
- Touch drag-and-drop
- Offline editing
- Progressive Web App features
- Mobile-specific gestures (pinch, swipe)

## Tech Stack
- Tailwind responsive utilities (`md:`, `lg:`)
- CSS `touch-action` properties
- Mobile viewport meta tags
- No additional libraries

## Key Files
```
src/components/editor/MobileLayout.tsx       # Mobile-first layout
src/components/editor/MobileToolbar.tsx      # Toolbar above keyboard
src/components/editor/TouchButton.tsx        # 44px touch targets
src/components/editor/MobileImageUpload.tsx  # Mobile file picker
src/app/admin/layout.tsx                     # Responsive wrapper
```

## Demo Script (30 seconds)
**On iPhone**:
1. Navigate to `/admin` on iPhone
2. Tap into text editor → Keyboard appears with toolbar above
3. Select text, tap "B" button → Text becomes bold
4. Tap "Add Image" → iOS photo picker opens
5. Select photo from library → Upload starts
6. Enter alt text using mobile keyboard
7. Tap "Publish" → Success message
8. View published page on phone → Looks professional
9. **Success**: Complete edit flow works on mobile

## Success Criteria
- [ ] Editor layout works on iPhone (tested on real device)
- [ ] All buttons are 44px minimum (touch target size)
- [ ] Text editing works with mobile keyboard
- [ ] Toolbar doesn't get hidden by keyboard
- [ ] Image upload works from photo library
- [ ] No horizontal scrolling on mobile
- [ ] Load time < 3 seconds on 3G
- [ ] Complete edit → publish flow under 5 minutes

## Integration Points

These elements are designed to be extended:
- **Mobile layout patterns** - Designed to be reusable for all mobile features
- **Touch targets** - Standard for all interactive elements
- **Responsive patterns** - Foundation for galleries, pages, and other features
