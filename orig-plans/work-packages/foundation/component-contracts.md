# Foundation: Component Contracts

This document defines the dnd-kit component architecture and patterns for the portfolio page builder. All editor components must follow these contracts for consistent drag-and-drop behavior.

## Architecture Overview

```
EditorProvider (DndContext + state)
         ↓
Canvas (droppable zones)
         ↓
Section (SortableContext)
         ↓
BlockWrapper (useSortable)
         ↓
Component (TextBlock, ImageBlock, etc.)
```

## Core Packages

```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

## Sensor Configuration

Touch support requires specific sensor settings discovered during spike development.

### Required Sensors

```typescript
import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // Pixels of movement before drag starts
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,    // Long-press duration (ms) - reduced from 200 for responsiveness
      tolerance: 8,  // Movement tolerance during delay (px) - increased from 5
    },
  })
);
```

### Critical CSS for Touch

```css
/* Required on ALL draggable elements */
.draggable {
  touch-action: none;
}
```

Without `touch-action: none`, the browser interprets touch as scroll/pan and cancels drags.

---

## Drag Data Contract

All draggable items must provide typed drag data.

### Interface

```typescript
interface DragData {
  type: 'toolbar' | 'canvas';
  blockType?: ComponentType;  // For toolbar items
  componentId?: string;       // For canvas items
  sectionId?: string;         // Section the component belongs to
}
```

### Toolbar Item

```typescript
const dragData: DragData = {
  type: 'toolbar',
  blockType: 'text',
};
```

### Canvas Item

```typescript
const dragData: DragData = {
  type: 'canvas',
  componentId: block.id,
  sectionId: section.id,
};
```

---

## Component State Structure

Based on data-models.md PageContent format.

### EditorState

```typescript
interface EditorState {
  // Normalized section data
  sections: {
    [sectionId: string]: {
      id: string;
      title: string;
      componentIds: string[];  // Ordered references
    };
  };

  // Flat component storage
  components: {
    [componentId: string]: {
      id: string;
      type: ComponentType;
      props: ComponentProps;
    };
  };

  // Selection state
  selectedId: string | null;

  // Edit mode (for inline editing)
  editingId: string | null;
}
```

### Why Normalized?

1. **Prevents duplication** - Components stored once, referenced by ID
2. **Efficient updates** - Change props without touching section arrays
3. **Clean reordering** - Move IDs between arrays without copying data
4. **Type safety** - Separate maps for sections and components

---

## Editor Actions

State changes via typed actions.

```typescript
type EditorAction =
  // Component CRUD
  | { type: 'ADD_COMPONENT'; sectionId: string; component: Component }
  | { type: 'UPDATE_COMPONENT'; componentId: string; props: Partial<ComponentProps> }
  | { type: 'DELETE_COMPONENT'; sectionId: string; componentId: string }

  // Movement
  | { type: 'MOVE_COMPONENT'; fromSectionId: string; toSectionId: string; componentId: string; newIndex: number }
  | { type: 'REORDER_COMPONENTS'; sectionId: string; componentIds: string[] }

  // Selection
  | { type: 'SELECT_COMPONENT'; componentId: string | null }
  | { type: 'SET_EDITING'; componentId: string | null }

  // Sections
  | { type: 'ADD_SECTION'; section: Section }
  | { type: 'UPDATE_SECTION'; sectionId: string; title: string }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTIONS'; sectionIds: string[] }

  // Bulk operations
  | { type: 'LOAD_STATE'; content: PageContent }
  | { type: 'RESET' };
```

---

## EditorProvider Pattern

Wraps the editor with DndContext and state management.

```typescript
// src/components/editor/EditorProvider.tsx

'use client';

import { createContext, useReducer, useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';

interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Convenience methods
  addComponent: (sectionId: string, type: ComponentType) => void;
  updateComponent: (componentId: string, props: Partial<ComponentProps>) => void;
  deleteComponent: (sectionId: string, componentId: string) => void;
  selectComponent: (componentId: string | null) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children, initialContent }: Props) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // CRITICAL: Prevent hydration mismatch
  // dnd-kit generates different aria-describedby IDs on server vs client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ... handlers

  // Render without DndContext during SSR
  if (!isMounted) {
    return (
      <EditorContext.Provider value={contextValue}>
        {children}
      </EditorContext.Provider>
    );
  }

  return (
    <EditorContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </EditorContext.Provider>
  );
}
```

### SSR Hydration Fix

The `isMounted` pattern is **required** for Next.js App Router:

1. dnd-kit generates unique IDs for accessibility
2. Server and client generate different IDs
3. This causes React hydration mismatch errors
4. Solution: Delay DndContext render until after mount

---

## Section Component

Droppable zone containing sortable components.

```typescript
// src/components/editor/Section.tsx

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface SectionProps {
  section: Section;
  components: Component[];
}

export function Section({ section, components }: SectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-colors',
        isOver ? 'border-primary bg-primary-light' : 'border-border'
      )}
    >
      <h3 className="text-sm font-medium text-text-muted mb-4">{section.title}</h3>

      <SortableContext
        items={section.componentIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {components.map((component) => (
            <BlockWrapper
              key={component.id}
              block={component}
              sectionId={section.id}
            />
          ))}
        </div>
      </SortableContext>

      {components.length === 0 && (
        <p className="text-text-muted text-center py-8">
          Drop components here
        </p>
      )}
    </div>
  );
}
```

---

## BlockWrapper Pattern

Wraps every component with drag functionality and UI chrome.

### Contract

```typescript
interface BlockWrapperProps {
  block: Component;
  sectionId: string;
}
```

### Implementation

```typescript
// src/components/editor/BlockWrapper.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function BlockWrapper({ block, sectionId }: BlockWrapperProps) {
  const { state, updateComponent, deleteComponent, selectComponent } = useEditor();
  const [isEditing, setIsEditing] = useState(false);

  const isSelected = state.selectedId === block.id;

  const dragData: DragData = {
    type: 'canvas',
    componentId: block.id,
    sectionId,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: dragData,
    disabled: isEditing,  // Disable drag while editing
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group rounded-lg border-2 transition-colors',
        isSelected ? 'border-primary' : 'border-transparent hover:border-border'
      )}
      onClick={() => !isEditing && selectComponent(block.id)}
    >
      {/* Drag handle */}
      <DragHandle
        attributes={attributes}
        listeners={listeners}
      />

      {/* Delete button */}
      <DeleteButton onClick={() => deleteComponent(sectionId, block.id)} />

      {/* Component content */}
      <ComponentRenderer
        block={block}
        isEditing={isEditing}
        onStartEdit={() => setIsEditing(true)}
        onEndEdit={() => setIsEditing(false)}
        onUpdate={(props) => updateComponent(block.id, props)}
      />
    </div>
  );
}
```

### Drag Handle Requirements

```typescript
function DragHandle({ attributes, listeners }: DragHandleProps) {
  return (
    <div
      {...attributes}
      {...listeners}
      className={cn(
        'absolute -left-8 top-1/2 -translate-y-1/2',
        'w-8 h-10 flex items-center justify-center',
        'cursor-grab active:cursor-grabbing',
        // Always visible on mobile, hover on desktop
        'opacity-50 sm:opacity-0 group-hover:opacity-100',
        'transition-opacity'
      )}
      style={{ touchAction: 'none' }}  // CRITICAL for touch
    >
      <GripIcon className="w-5 h-5" />
    </div>
  );
}
```

**Touch target requirements:**
- Minimum 40x40px on mobile (8px spacing)
- Always visible on touch devices (no hover-only)
- `touch-action: none` CSS is mandatory

---

## Component Registry

Pattern for adding new component types.

### Registry Structure

```typescript
// src/lib/component-registry.ts

import { ComponentType, ComponentProps } from '@/types';

interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: React.ComponentType;
  defaultProps: ComponentProps;
  component: React.ComponentType<ComponentRenderProps>;
  settingsPanel?: React.ComponentType<SettingsPanelProps>;
}

const registry: Map<ComponentType, ComponentDefinition> = new Map();

export function registerComponent(definition: ComponentDefinition) {
  registry.set(definition.type, definition);
}

export function getComponent(type: ComponentType) {
  return registry.get(type);
}

export function getAllComponents() {
  return Array.from(registry.values());
}
```

### Registering a Component

```typescript
// src/components/blocks/TextBlock/index.ts

import { registerComponent } from '@/lib/component-registry';
import { TextBlockRenderer } from './TextBlockRenderer';
import { TextBlockSettings } from './TextBlockSettings';
import { TextIcon } from '@/components/icons';

registerComponent({
  type: 'text',
  name: 'Text Block',
  icon: TextIcon,
  defaultProps: {
    content: '<p>Edit this text...</p>',
    alignment: 'left',
  },
  component: TextBlockRenderer,
  settingsPanel: TextBlockSettings,
});
```

---

## Component Renderer Contract

All block components must implement this interface.

```typescript
interface ComponentRenderProps {
  // Component data
  props: ComponentProps;

  // Edit state
  isEditing: boolean;
  isSelected: boolean;

  // Callbacks
  onStartEdit: () => void;
  onEndEdit: () => void;
  onUpdate: (props: Partial<ComponentProps>) => void;
}
```

### Example: Text Block

```typescript
// src/components/blocks/TextBlock/TextBlockRenderer.tsx

interface TextBlockRendererProps extends ComponentRenderProps {
  props: TextBlockProps;
}

export function TextBlockRenderer({
  props,
  isEditing,
  onStartEdit,
  onEndEdit,
  onUpdate,
}: TextBlockRendererProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: props.content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() });
    },
    onFocus: onStartEdit,
    onBlur: onEndEdit,
  });

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none p-4',
        `text-${props.alignment}`
      )}
      onClick={() => !isEditing && onStartEdit()}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
```

---

## Drag End Handler Logic

Handles both toolbar-to-canvas and canvas reorder.

```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  setActiveId(null);
  setActiveData(null);

  if (!over) return;

  const activeData = active.data.current as DragData;
  const overId = over.id as string;

  // CASE 1: Dragging from toolbar
  if (activeData?.type === 'toolbar' && activeData.blockType) {
    const targetSectionId = resolveTargetSection(over);
    if (targetSectionId) {
      addComponent(targetSectionId, activeData.blockType);
    }
    return;
  }

  // CASE 2: Reordering within canvas
  if (activeData?.type === 'canvas' && activeData.componentId) {
    const fromSectionId = activeData.sectionId!;
    const componentId = activeData.componentId;

    const { toSectionId, newIndex } = resolveDropTarget(over, state);

    if (fromSectionId === toSectionId) {
      // Same section - reorder
      reorderInSection(fromSectionId, componentId, newIndex);
    } else {
      // Different section - move
      moveToSection(fromSectionId, toSectionId, componentId, newIndex);
    }
  }
}

function resolveTargetSection(over: Over): string | null {
  const overId = over.id as string;
  const overData = over.data.current as DragData | undefined;

  // Dropping directly on a section
  if (state.sections[overId]) {
    return overId;
  }

  // Dropping on a component - use its section
  if (overData?.sectionId) {
    return overData.sectionId;
  }

  return null;
}
```

---

## DragOverlay Rendering

Shows preview during drag.

```typescript
function renderDragOverlay() {
  if (!activeId || !activeData) return null;

  // Toolbar item preview
  if (activeData.type === 'toolbar' && activeData.blockType) {
    const definition = getComponent(activeData.blockType);
    if (!definition) return null;

    return (
      <div className="bg-background p-3 rounded shadow-lg border-2 border-primary opacity-80">
        <definition.component
          props={definition.defaultProps}
          isEditing={false}
          isSelected={false}
          onStartEdit={() => {}}
          onEndEdit={() => {}}
          onUpdate={() => {}}
        />
      </div>
    );
  }

  // Canvas item preview
  if (activeData.type === 'canvas' && activeData.componentId) {
    const component = state.components[activeData.componentId];
    if (!component) return null;

    const definition = getComponent(component.type);
    if (!definition) return null;

    return (
      <div className="bg-background p-3 rounded shadow-lg border-2 border-primary opacity-80">
        <definition.component
          props={component.props}
          isEditing={false}
          isSelected={false}
          onStartEdit={() => {}}
          onEndEdit={() => {}}
          onUpdate={() => {}}
        />
      </div>
    );
  }

  return null;
}
```

---

## Toolbar Component

Palette of draggable component types.

```typescript
// src/components/editor/Toolbar.tsx

import { useDraggable } from '@dnd-kit/core';
import { getAllComponents } from '@/lib/component-registry';

export function Toolbar() {
  const components = getAllComponents();

  return (
    <div className="bg-surface p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-4">Components</h3>
      <div className="grid grid-cols-2 gap-2">
        {components.map((definition) => (
          <ToolbarItem key={definition.type} definition={definition} />
        ))}
      </div>
    </div>
  );
}

function ToolbarItem({ definition }: { definition: ComponentDefinition }) {
  const dragData: DragData = {
    type: 'toolbar',
    blockType: definition.type,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbar-${definition.type}`,
    data: dragData,
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'flex flex-col items-center p-3 rounded-lg',
        'bg-background hover:bg-surface-hover',
        'border border-border',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
      style={{ touchAction: 'none' }}
    >
      <definition.icon className="w-6 h-6 mb-1" />
      <span className="text-xs">{definition.name}</span>
    </button>
  );
}
```

---

## Accessibility Requirements

### Keyboard Support

dnd-kit provides keyboard support automatically:
- `Space` or `Enter` to pick up item
- Arrow keys to move
- `Space` or `Enter` to drop
- `Escape` to cancel

### ARIA Announcements

```typescript
const announcements = {
  onDragStart({ active }) {
    return `Picked up ${active.data.current?.blockType || 'component'}`;
  },
  onDragOver({ active, over }) {
    if (over) {
      return `Over ${over.id}`;
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `Dropped ${active.id} into ${over.id}`;
    }
    return `Dropped ${active.id}`;
  },
  onDragCancel({ active }) {
    return `Cancelled dragging ${active.id}`;
  },
};

// In DndContext
<DndContext
  accessibility={{
    announcements,
    screenReaderInstructions: {
      draggable: 'Press space or enter to pick up. Use arrow keys to move. Press space or enter to drop.',
    },
  }}
>
```

---

## File Structure

```
src/
├── components/
│   ├── editor/
│   │   ├── EditorProvider.tsx   # DndContext + state
│   │   ├── Canvas.tsx           # Main editing area
│   │   ├── Section.tsx          # Droppable zone
│   │   ├── BlockWrapper.tsx     # Sortable wrapper
│   │   ├── Toolbar.tsx          # Component palette
│   │   └── DragHandle.tsx       # Reusable drag handle
│   └── blocks/
│       ├── TextBlock/
│       │   ├── index.ts         # Registration
│       │   ├── TextBlockRenderer.tsx
│       │   └── TextBlockSettings.tsx
│       ├── ImageBlock/
│       ├── GalleryBlock/
│       └── ...
├── hooks/
│   └── useEditor.ts             # EditorContext hook
├── lib/
│   ├── editor-state.ts          # Reducer + actions
│   ├── component-registry.ts    # Component registration
│   └── id.ts                    # ID generation
└── types/
    ├── editor.ts                # Editor state types
    ├── components.ts            # Component prop types
    └── drag.ts                  # Drag data types
```

---

## Deliverables Checklist

When implementing the component system, ensure:

- [ ] EditorProvider wraps editor with DndContext
- [ ] SSR hydration fix implemented (isMounted pattern)
- [ ] Sensors configured with touch support (150ms delay, 8px tolerance)
- [ ] All draggable elements have `touch-action: none`
- [ ] Drag handles visible on mobile (not hover-only)
- [ ] BlockWrapper implements selection and editing states
- [ ] Component registry allows adding new types
- [ ] Drag overlay shows preview during drag
- [ ] Keyboard navigation works for accessibility
- [ ] State follows normalized structure (sections + components maps)

---

## Testing Checklist

Verify component contracts work:

1. **Desktop drag** - Drag from toolbar to canvas, 8px activation
2. **Touch drag** - Long-press (150ms) then drag on iPhone
3. **Reorder** - Drag components within section
4. **Cross-section** - Drag components between sections
5. **Selection** - Click to select, click elsewhere to deselect
6. **Inline edit** - Double-click text to edit, drag disabled while editing
7. **Keyboard** - Space to pick up, arrows to move, Space to drop
8. **Delete** - Delete button removes component
