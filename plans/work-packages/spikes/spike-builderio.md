# Spike: Page Builder with Builder.io SDK

## Purpose

Evaluate Builder.io's SDK and approach for building a portfolio editor. Builder.io offers a different paradigm than Craft.js or dnd-kit—it's designed as a visual CMS with both hosted and SDK options. This spike explores whether we can leverage their SDK for a self-contained editing experience.

**Important Context**: Builder.io's primary product is their hosted visual editor. Their SDK is designed to work with their platform but can also be used for custom implementations. This spike evaluates the SDK's flexibility for our self-hosted use case.

## Constraints

- **Port**: Use port 4003 for the dev server
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Time**: This is a focused spike, not a complete application
- **No Builder.io Account Required**: Use SDK in local/self-hosted mode only

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

### Builder.io SDK Setup
```bash
npm install @builder.io/sdk-react @builder.io/react
```

### Approach Options

Builder.io can be used in several ways. Evaluate which approach works best:

**Option A: Builder.io Visual Editor (Requires Account)**
- Use Builder.io's hosted visual editor
- Render with SDK in your app
- Pros: Full-featured editor out of the box
- Cons: Requires account, data stored externally

**Option B: Builder.io SDK with Custom Data**
- Use Builder.io's rendering SDK
- Build your own simple editor UI
- Store data locally in Builder.io's JSON format
- Pros: Self-contained, no account needed
- Cons: Editor UI is your responsibility

**Option C: Hybrid with Local Preview**
- Use Builder.io's components and patterns
- Build minimal editing capabilities locally
- Pros: Leverage their component model
- Cons: May not get full editing features

**Recommended for this spike**: Try Option B first. If blocked, document why and try Option A to at least evaluate their editing UX.

### Custom Components Registration
```typescript
import { Builder } from '@builder.io/react';

// Register custom components
Builder.registerComponent(TextBlock, {
  name: 'TextBlock',
  inputs: [
    { name: 'content', type: 'richText', defaultValue: 'Enter text...' },
  ],
});

Builder.registerComponent(ImagePlaceholder, {
  name: 'ImagePlaceholder',
  inputs: [
    { name: 'aspectRatio', type: 'string', defaultValue: '16:9' },
  ],
});
```

### File Structure
```
src/
├── app/
│   └── page.tsx                # Main editor page
├── components/
│   ├── editor/
│   │   ├── BuilderEditor.tsx   # Main editor wrapper
│   │   ├── Canvas.tsx          # Builder content renderer
│   │   ├── Toolbar.tsx         # Component palette (custom)
│   │   └── SettingsPanel.tsx   # Component settings
│   ├── builder-blocks/         # Builder-registered components
│   │   ├── TextBlock.tsx
│   │   ├── ImagePlaceholder.tsx
│   │   └── index.ts            # Registration
│   └── ui/                     # Basic UI components
├── lib/
│   ├── theme.ts                # Theme token definitions
│   ├── builder-config.ts       # Builder.io configuration
│   └── serialization.ts        # JSON utilities
└── types/
    └── index.ts                # TypeScript interfaces
```

## Key Questions to Answer

Since Builder.io is a different paradigm, document answers to:

1. **Can we build a self-contained editor without a Builder.io account?**
   - What features are available vs. require their platform?

2. **How does Builder.io's data format compare to a custom schema?**
   - Is it portable? Can we migrate away if needed?

3. **What's the bundle size impact?**
   - Builder.io SDKs can be heavy; measure this carefully

4. **How customizable is the editing experience?**
   - Can we match our UX requirements?

5. **What's the mobile editing story?**
   - Is their SDK touch-friendly?

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

**Note**: Builder.io SDKs can be larger. Document the size and whether tree-shaking helps.

### 3. Serialization Sample
Export a sample JSON showing the serialized state with:
- One text component with formatted text
- One image placeholder
- Components in specific order

Document whether this is Builder.io's native format or a custom schema:
```json
{
  // Document the format you ended up using
}
```

### 4. Mobile Touch Assessment
Document your findings:
- Does drag-from-toolbar work on touch? (Yes/No/Partial/Not Applicable)
- Does reorder-in-canvas work on touch? (Yes/No/Partial/Not Applicable)
- Any workarounds required?
- Touch responsiveness (immediate / slight delay / laggy / not tested)

### 5. Pain Points
List any difficulties encountered:
- Account/API key requirements
- Documentation gaps for self-hosted use
- Bundle size concerns
- Feature limitations without their platform
- Mobile-specific problems

### 6. Theme Integration Notes
- How easy was it to pass theme tokens to registered components?
- Any limitations on dynamic theming?

### 7. Paradigm Assessment (Builder.io Specific)
Document your assessment:
- Is Builder.io suitable for a fully self-hosted solution?
- What would we gain vs. lose compared to Craft.js or custom dnd-kit?
- Would you recommend this approach? Why or why not?

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
   npm run dev -- -H 0.0.0.0 -p 4003
   ```
   The `-H 0.0.0.0` flag allows external connections.

2. On your iPhone, open Safari and navigate to:
   ```
   http://192.168.1.100:4003
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
- [ ] Self-hosted viability is assessed

**If you cannot achieve all criteria**: Document what blocked you and why. A "this approach doesn't fit our needs" conclusion with clear reasoning is a valid and valuable outcome.

## Notes

- Builder.io is designed for a different use case (visual CMS)
- It's okay if this spike concludes "not a good fit"—that's valuable information
- Focus on understanding what's possible without their hosted platform
- If you need an account to proceed, note this as a dependency
- Compare the developer experience to what Craft.js or dnd-kit would require
