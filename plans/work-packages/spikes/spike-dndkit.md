# Spike: Page Builder with dnd-kit (Custom Solution)

## Purpose

Evaluate building a custom page builder using dnd-kit as the drag-and-drop foundation. This spike builds a minimal prototype to assess mobile touch support, serialization stability, and theme integration when rolling your own solution.

## Constraints

- **Port**: Use port 4002 for the dev server
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Time**: This is a focused spike, not a complete application

## What to Build

Create a single-page prototype with:

### 1. Editor Canvas
- A full-width canvas area where components can be arranged
- Two droppable zones: "Header Section" and "Content Section"
- Visual indication of drop targets when dragging (use dnd-kit's DragOverlay)

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

### dnd-kit Setup
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Key dnd-kit concepts to implement:
- `DndContext` wrapper with sensors
- `useSensor` with `PointerSensor` and `TouchSensor`
- `useDraggable` for toolbar items
- `useDroppable` for canvas zones
- `SortableContext` + `useSortable` for reordering within zones
- `DragOverlay` for smooth drag visualization

### Touch Sensor Configuration
```typescript
import {
  DndContext,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Prevents accidental drags
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,        // Long-press to start drag
      tolerance: 5,      // Movement tolerance during delay
    },
  })
);
```

### Custom State Management
Since dnd-kit doesn't manage your component state, you'll build:
```typescript
interface EditorState {
  sections: {
    [sectionId: string]: {
      id: string;
      title: string;
      componentIds: string[];
    };
  };
  components: {
    [componentId: string]: {
      id: string;
      type: 'text' | 'image';
      props: Record<string, any>;
    };
  };
}
```

### File Structure
```
src/
├── app/
│   └── page.tsx              # Main editor page
├── components/
│   ├── editor/
│   │   ├── EditorProvider.tsx # DndContext + state management
│   │   ├── Canvas.tsx         # Droppable sections
│   │   ├── Section.tsx        # Individual droppable zone
│   │   ├── Toolbar.tsx        # Draggable component palette
│   │   ├── DragOverlay.tsx    # Visual feedback during drag
│   │   └── SettingsPanel.tsx  # Selected component settings
│   ├── blocks/                # User-facing components
│   │   ├── TextBlock.tsx
│   │   ├── ImagePlaceholder.tsx
│   │   └── BlockWrapper.tsx   # Adds drag handle, selection
│   └── ui/                    # Basic UI components
├── lib/
│   ├── theme.ts               # Theme token definitions
│   ├── editor-state.ts        # State management (useReducer or zustand)
│   └── serialization.ts       # JSON save/load utilities
├── hooks/
│   ├── useEditor.ts           # Editor state hook
│   └── useTheme.ts            # Theme context hook
└── types/
    └── index.ts               # TypeScript interfaces
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

Document your schema design:
```json
{
  "version": "1.0",
  "sections": { ... },
  "components": { ... }
}
```

### 4. Mobile Touch Assessment
Document your findings:
- Does drag-from-toolbar work on touch? (Yes/No/Partial)
- Does reorder-in-canvas work on touch? (Yes/No/Partial)
- Any workarounds required?
- Touch responsiveness (immediate / slight delay / laggy)
- Did the TouchSensor configuration work well?

### 5. Pain Points
List any difficulties encountered:
- State management complexity
- Drag-and-drop edge cases
- TypeScript issues
- Mobile-specific problems
- Amount of code required vs. using a page builder library

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
   npm run dev -- -H 0.0.0.0 -p 4002
   ```
   The `-H 0.0.0.0` flag allows external connections.

2. On your iPhone, open Safari and navigate to:
   ```
   http://192.168.1.100:4002
   ```
   (Replace with your actual Mac IP)

3. Test these interactions:
   - [ ] Tap and hold (200ms), then drag a component from toolbar to canvas
   - [ ] Tap a text component to edit it
   - [ ] Long-press and drag to reorder components within a section
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

- This approach gives you full control but requires more code
- Focus on getting the core dnd-kit patterns right
- The serialization format you design here would be used throughout the app
- Document how much work this approach requires vs. using a pre-built solution
- If touch interactions need tuning, document what settings worked best
