# Mobile Editing Basics

**Slice:** 4 of 8  
**Phase:** 1 (Functional Prototype)  
**Estimated Duration:** 400 lines total  
**Previous Slice:** Single Image Upload  
**Next Slice:** Component System & Sections

**Prerequisites:**
- Read: `plans/VISION.md` - Product vision and design principles
- Read: `plans/USERS.md` - User personas and scenarios
- Read: `plans/ARCHITECTURE.md` - Technical architecture
- Read: `plans/IMPLEMENTATION_APPROACH.md` - Development methodology
- Read: `plans/IMPLEMENTATION_GUIDE.md` - Implementation patterns
- Previous slice deliverables: Static Page Foundation, Rich Text Editing, Single Image Upload

---

**User Value**: Sarah can update her portfolio from iPhone backstage in <5 minutes.

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

## Size Estimate
400 lines total:
- Responsive layout wrapper: 80 lines
- Mobile toolbar component: 100 lines
- Touch-optimized buttons: 60 lines
- Mobile file input handling: 80 lines
- Viewport meta tags and CSS: 40 lines
- Mobile testing utilities: 40 lines

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
- **Mobile layout patterns** → Will be used for all mobile features
- **Touch targets** → Standard for all interactive elements
- **Responsive patterns** → Foundation for galleries, pages, etc.
