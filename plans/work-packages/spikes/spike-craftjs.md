# Spike: Page Builder with Craft.js

> **Outcome: ACCEPTED (with caveats)**
>
> Craft.js provides a solid foundation for building a page editor with clean architecture and reliable serialization. Desktop functionality works well. However, mobile touch support requires significant workarounds due to HTML5 drag-and-drop limitations, and there's friction with React 19/Next.js App Router SSR. Best suited when desktop editing is primary and mobile editing is secondary or view-only.

---

## Spike Findings Summary

### Key Takeaways
1. **Purpose-built for page builders** - Clean `<Editor>`, `<Frame>`, `<Element>` architecture
2. **Serialization is excellent** - Human-readable JSON, deterministic output, easy to migrate
3. **Mobile touch requires workarounds** - HTML5 DnD has limited mobile support, needs `react-dnd-touch-backend` or custom handling
4. **SSR issues with Next.js App Router** - Requires `dynamic()` import with `ssr: false`
5. **Moderate bundle size** - Adds ~260-270KB (80-90KB gzipped)

### Bundle Size
```
Total .next/static: 956KB
Craft.js adds approximately:
- 154KB (Craft.js core)
- 110KB (Craft.js layers/additional)
Total Craft.js overhead: ~260-270KB (~80-90KB gzipped)
```

### Serialization Format
Clean, human-readable JSON with clear parent-child relationships:
```json
{
  "ROOT": {
    "type": { "resolvedName": "div" },
    "isCanvas": true,
    "nodes": ["header-section", "content-section"]
  },
  "header-section": {
    "type": { "resolvedName": "DroppableContainer" },
    "isCanvas": true,
    "props": { "label": "Header Section" },
    "parent": "ROOT",
    "nodes": ["text-1"]
  },
  "text-1": {
    "type": { "resolvedName": "TextBlock" },
    "props": { "text": "Welcome to my portfolio", "bold": true, "italic": false },
    "parent": "header-section"
  }
}
```

### Mobile Touch Assessment
| Feature | Desktop | Mobile |
|---------|---------|--------|
| Drag from toolbar to canvas | Yes | Partial (needs touch backend) |
| Reorder in canvas | Yes | Partial (needs touch backend) |
| Tap to select | Yes | Yes |
| Double-tap to edit | Yes | Yes |

**Workarounds Required:**
- `touch-action: none` on all draggable elements
- 44x44px minimum touch targets
- Consider `react-dnd-touch-backend` for production

### Pain Points Encountered
1. **Documentation gaps** - Limited Next.js App Router examples
2. **React 19 compatibility** - Internal `React.Children.only` calls cause SSR issues
3. **TypeScript** - Some hooks return `any`, requires manual casting
4. **Frame children** - Strict about children structure

### Theme Integration
- **Rating: Good** - Used React Context, works well with inline styles
- Theme toggle is instant, no flicker
- Limitation: Theme values not serialized with state (by design)

### Recommendation
**Use Craft.js when:**
- Desktop editing is the primary use case
- You need reliable serialization/deserialization
- You want a proven page builder architecture

**Consider alternatives when:**
- Full mobile editing parity is required
- Bundle size is critical
- You need maximum control over the DnD behavior

---

## Purpose

Evaluate Craft.js as the foundation for a portfolio builder's drag-and-drop page editor. This spike builds a minimal prototype to assess mobile touch support, serialization stability, and theme integration.

## Constraints

- **Port**: Use port 4001 for the dev server
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Time**: This is a focused spike, not a complete application

## What to Build

Create a single-page prototype with:

### 1. Editor Canvas
- A full-width canvas area where components can be arranged
- Two droppable zones: "Header Section" and "Content Section"
- Visual indication of drop targets when dragging

### 2. Text Component
- A draggable text block component
- Inline editing when clicked (contentEditable or similar)
- Support for bold, italic formatting via keyboard shortcuts (Cmd+B, Cmd+I)
- Applies a `textColor` from theme tokens

### 3. Image Placeholder Component
- A draggable image placeholder (no actual upload needed)
- Displays a gray box with "Image Placeholder" text
- Fixed aspect ratio (16:9)
- Applies a `borderRadius` from theme tokens

### 4. Component Toolbar
- A sidebar or top bar showing available components
- Drag from toolbar to canvas to add components
- Should work with both mouse and touch

### 5. Serialization
- "Save" button that serializes current state to JSON
- "Load" button that deserializes JSON back to editor state
- Display the JSON in a collapsible panel for inspection

### 6. Theme Token Integration
- Define a simple theme object:
```typescript
const theme = {
  colors: {
    primary: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff',
    surface: '#f9fafb',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  borderRadius: '8px',
};
```
- Components should read from this theme object
- Include a toggle to switch between two themes (light/dark or two color schemes)

## Technical Requirements

### Craft.js Setup
```bash
npm install @craftjs/core @craftjs/layers
```

Implement using Craft.js patterns:
- `<Editor>` wrapper with resolver
- `<Frame>` for the editable area
- `<Element>` for droppable containers
- `useNode()` hook for component editing
- `useEditor()` hook for serialization

### Mobile Touch Requirements
- Drag-and-drop MUST work on touch devices
- Test with actual finger interactions, not just mouse simulation
- Minimum touch target size: 44x44 pixels
- Consider long-press to initiate drag if needed

### File Structure
```
src/
├── app/
│   └── page.tsx              # Main editor page
├── components/
│   ├── editor/
│   │   ├── Editor.tsx        # Craft.js Editor wrapper
│   │   ├── Canvas.tsx        # Main canvas with Frame
│   │   ├── Toolbar.tsx       # Component palette
│   │   └── SettingsPanel.tsx # Selected component settings
│   ├── user/                 # Craft.js user components
│   │   ├── TextBlock.tsx
│   │   ├── ImagePlaceholder.tsx
│   │   └── Container.tsx
│   └── ui/                   # Basic UI components
├── lib/
│   ├── theme.ts              # Theme token definitions
│   └── craft-utils.ts        # Serialization helpers
└── types/
    └── index.ts              # TypeScript interfaces
```

## Deliverables

When complete, provide:

### 1. Working Code
All source files committed and runnable via `npm run dev`

### 2. Bundle Size Report
Run and report output:
```bash
npm run build
# Report the .next/static size, specifically JS chunks
```

### 3. Serialization Sample
Export a sample JSON showing the serialized state with:
- One text component with formatted text
- One image placeholder
- Components in specific order

Example format to document:
```json
{
  "ROOT": { ... },
  "node-1": { ... }
}
```

### 4. Mobile Touch Assessment
Document your findings:
- Does drag-from-toolbar work on touch? (Yes/No/Partial)
- Does reorder-in-canvas work on touch? (Yes/No/Partial)
- Any workarounds required?
- Touch responsiveness (immediate / slight delay / laggy)

### 5. Pain Points
List any difficulties encountered:
- Documentation gaps
- Unexpected behaviors
- TypeScript issues
- Mobile-specific problems

### 6. Theme Integration Notes
- How easy was it to pass theme tokens to components?
- Any limitations on dynamic theming?

## Testing on iPhone

To test on your physical iPhone without deploying:

### Setup (One-time)
1. Ensure your Mac and iPhone are on the same WiFi network
2. Find your Mac's local IP address:
   ```bash
   ipconfig getifaddr en0
   ```
   This returns something like `192.168.1.100`

3. Update `next.config.js` to allow external connections:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // Allow connections from local network
   };
   export default nextConfig;
   ```

### Running the Test
1. Start the dev server:
   ```bash
   npm run dev -- -H 0.0.0.0 -p 4001
   ```
   The `-H 0.0.0.0` flag allows external connections.

2. On your iPhone, open Safari and navigate to:
   ```
   http://192.168.1.100:4001
   ```
   (Replace with your actual Mac IP)

3. Test these interactions:
   - [ ] Tap and drag a component from toolbar to canvas
   - [ ] Tap a text component to edit it
   - [ ] Long-press and drag to reorder components
   - [ ] Tap the Save button and verify JSON appears
   - [ ] Switch themes and verify components update

### Debugging on iPhone
1. On iPhone: Settings > Safari > Advanced > Web Inspector (ON)
2. Connect iPhone to Mac via USB cable
3. On Mac: Open Safari > Develop menu > [Your iPhone] > [The page]
4. You can now see console logs and inspect elements

## Success Criteria

This spike is successful if you can demonstrate:

- [ ] Components can be dragged from toolbar to canvas (desktop)
- [ ] Components can be dragged from toolbar to canvas (iPhone touch)
- [ ] Components can be reordered within canvas (desktop)
- [ ] Components can be reordered within canvas (iPhone touch)
- [ ] Text component allows inline editing
- [ ] State serializes to clean JSON
- [ ] State deserializes back correctly
- [ ] Theme toggle changes component appearance
- [ ] Bundle size is documented

## Notes

- Focus on the core interactions, not polish
- If Craft.js requires workarounds for touch, document them clearly
- If you hit blockers, document what you tried and what failed
- The goal is evaluation, not perfection
