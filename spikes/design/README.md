# Portfolio Design System Spike

**Purpose:** Visual exploration of the design system defined in `plans/design/DESIGN-SYSTEM.md`

This is a live, interactive mockup where you can see and interact with:
- Typography scales across all three themes
- Color palettes and contrast ratios
- Component variants (buttons, cards, galleries)
- Responsive behavior (resize browser to see mobile vs desktop)
- Theme switching (compare Modern Minimal, Classic Elegant, Bold Editorial)

---

## Quick Start

```bash
# Install dependencies
cd spikes/design
npm install

# Run development server
npm run dev

# Open in browser
# → http://localhost:3000
```

**Then:**
1. View the design system in action
2. Click theme buttons to compare all three themes
3. Resize browser to see responsive behavior
4. Test on your phone at `http://[your-ip]:3000`

---

## What You'll See

### Typography Scale
- Display through Body text with actual font pairings
- See how Playfair Display + Inter (Editorial) vs Sora + Geist Sans (Contemporary) look

### Color Palettes
- Visual swatches showing all semantic colors
- See how themes differ (neutral, warm, high-contrast)

### Components
- **Buttons:** Primary, Secondary, Ghost variants with hover states
- **Cards:** Project cards with images, metadata, descriptions
- **Gallery:** Grid layout with hover effects and responsive columns
- **Navigation:** Sticky header with mobile hamburger menu

### Theme Comparison
Click the theme switcher at the top to instantly compare:
- **Modern Minimal:** Neutral, clean, professional (default)
- **Classic Elegant:** Warm neutrals, sophisticated, established
- **Bold Editorial:** High contrast, dramatic, fashion-forward

---

## Testing on Mobile

**Option 1: Browser DevTools**
1. Open browser DevTools (F12)
2. Click device toolbar (Cmd+Shift+M on Mac)
3. Select iPhone or Android device
4. Interact with components

**Option 2: Real Device (Recommended)**
1. Find your local IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. On your phone, visit: `http://[your-ip]:3000`
3. Test touch interactions, scrolling, responsive layout

---

## What to Look For

### Typography
- **Do the sizes feel right?** Is the scale too aggressive or too conservative?
- **Do the font pairings work?** Playfair + Inter vs Sora + Geist Sans
- **Is hierarchy clear?** Can you distinguish headings from body text easily?

### Colors
- **Do the themes feel distinct?** Modern vs Classic vs Bold
- **Is contrast comfortable to read?** Check text on backgrounds
- **Do colors support content?** Design should frame work, not compete with it

### Components
- **Do buttons feel interactive?** Hover and click them
- **Do cards showcase projects well?** Image + text hierarchy
- **Does gallery work for portfolio images?** Grid layout, hover effects

### Responsive
- **Does mobile layout work?** Resize to phone width
- **Are touch targets big enough?** Try tapping on phone
- **Does navigation make sense?** Desktop links vs mobile hamburger

### Overall
- **Does this feel professional enough for costume designers?**
- **Would Sarah/Marcus/Emma trust this with their reputation?**
- **What feels generic vs polished?**

---

## Next Steps After Review

**Once you've reviewed this spike:**

1. **Give feedback:** What works? What doesn't? What's missing?
2. **Refine design system:** Adjust typography, colors, spacing based on your input
3. **Define complete themes:** Flesh out the 3 theme concepts
4. **Specify editor affordances:** How editing UI integrates
5. **Document mobile patterns:** Touch interactions, gestures

Then we'll update `plans/design/DESIGN-SYSTEM.md` with the refined specs and move to implementation.

---

## File Structure

```
spikes/design/
├── app/
│   ├── layout.tsx          # Font loading, HTML structure
│   ├── globals.css         # Design system CSS variables
│   └── page.tsx            # Component showcase page
├── components/
│   ├── Button.tsx          # Button component with variants
│   ├── Card.tsx            # Project card component
│   ├── Gallery.tsx         # Image gallery grid
│   └── Navigation.tsx      # Header navigation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
└── README.md (this file)
```

---

## Questions While Reviewing?

As you explore, consider:

1. **Typography:** Too big? Too small? Font pairings feel right?
2. **Colors:** Do themes have enough personality? Too bold? Too subtle?
3. **Spacing:** Layout feels cramped or too loose?
4. **Components:** What components are we missing for portfolios?
5. **Motion:** Hover effects too subtle or too aggressive?
6. **Mobile:** Does it feel like a real app or a shrunk-down website?

Take notes and we'll iterate together to refine the design system.
