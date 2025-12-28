# Flow: Editing Flow

A self-contained work package for implementing the complete page editing experience with component manipulation, auto-save, and real-time feedback.

## Overview

Implement the core editing experience where users add, edit, reorder, and delete components on their portfolio pages. Focus on WYSIWYG editing with immediate visual feedback, auto-save, and mobile-first touch interactions.

## Prerequisites

- `foundation/component-contracts.md` - dnd-kit setup, BlockWrapper, EditorProvider
- `foundation/data-models.md` - PageContent structure
- `capabilities/text-component.md` - Tiptap text editing
- `capabilities/draft-publish.md` - Auto-save, draft/publish state

## Deliverables

1. Editor page layout
2. Editor canvas with sections
3. Component picker (add button)
4. Component selection and settings panel
5. Drag-and-drop reordering
6. Delete/duplicate component actions
7. Undo/redo system
8. Keyboard shortcuts
9. Mobile editing adaptations

---

## 1. Route Structure

```
/editor/[siteId]/[pageId]    # Main editor interface
```

---

## 2. Editor Page Layout

Create `src/app/editor/[siteId]/[pageId]/page.tsx`:

```typescript
import { notFound, redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { PageEditor } from '@/components/editor/PageEditor';
import { AdminThemeProvider } from '@/hooks/useAdminTheme';
import { EditorProvider } from '@/components/editor/EditorProvider';

interface EditorPageProps {
  params: {
    siteId: string;
    pageId: string;
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { siteId, pageId } = params;

  // Authenticate
  const { user } = await validateSession();
  if (!user) {
    redirect(`/login?redirect=/editor/${siteId}/${pageId}`);
  }

  // Fetch site and page
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
    include: {
      pages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!site) {
    notFound();
  }

  const page = site.pages.find((p) => p.id === pageId);
  if (!page) {
    notFound();
  }

  // Parse content
  const draftContent = JSON.parse(page.draftContent);
  const publishedContent = page.publishedContent
    ? JSON.parse(page.publishedContent)
    : null;

  return (
    <AdminThemeProvider>
      <EditorProvider
        siteId={siteId}
        pageId={pageId}
        initialContent={draftContent}
        publishedContent={publishedContent}
        publishedAt={page.publishedAt}
      >
        <PageEditor
          site={site}
          page={page}
          allPages={site.pages}
        />
      </EditorProvider>
    </AdminThemeProvider>
  );
}
```

---

## 3. Editor Provider with State Management

Extend `src/components/editor/EditorProvider.tsx`:

```typescript
'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { PageContent, Component, Section } from '@/types';
import { generateId } from '@/lib/id';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSensors } from '@/hooks/useDndSensors';

// State
interface EditorState {
  content: PageContent;
  selectedComponentId: string | null;
  editingComponentId: string | null;
  history: PageContent[];
  historyIndex: number;
  clipboard: Component | null;
}

// Actions
type EditorAction =
  | { type: 'SET_CONTENT'; content: PageContent }
  | { type: 'ADD_COMPONENT'; sectionId: string; component: Component; index?: number }
  | { type: 'UPDATE_COMPONENT'; componentId: string; props: Partial<Component['props']> }
  | { type: 'DELETE_COMPONENT'; componentId: string }
  | { type: 'MOVE_COMPONENT'; componentId: string; toSectionId: string; toIndex: number }
  | { type: 'DUPLICATE_COMPONENT'; componentId: string }
  | { type: 'SELECT_COMPONENT'; componentId: string | null }
  | { type: 'START_EDITING'; componentId: string }
  | { type: 'STOP_EDITING' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'COPY_COMPONENT'; componentId: string }
  | { type: 'PASTE_COMPONENT'; sectionId: string; index: number };

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.content,
        history: [...state.history.slice(0, state.historyIndex + 1), action.content],
        historyIndex: state.historyIndex + 1,
      };

    case 'ADD_COMPONENT': {
      const section = state.content.sections[action.sectionId];
      if (!section) return state;

      const newComponentIds = [...section.componentIds];
      const index = action.index ?? newComponentIds.length;
      newComponentIds.splice(index, 0, action.component.id);

      const newContent: PageContent = {
        ...state.content,
        sections: {
          ...state.content.sections,
          [action.sectionId]: {
            ...section,
            componentIds: newComponentIds,
          },
        },
        components: {
          ...state.content.components,
          [action.component.id]: action.component,
        },
      };

      return {
        ...state,
        content: newContent,
        selectedComponentId: action.component.id,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'UPDATE_COMPONENT': {
      const component = state.content.components[action.componentId];
      if (!component) return state;

      const newContent: PageContent = {
        ...state.content,
        components: {
          ...state.content.components,
          [action.componentId]: {
            ...component,
            props: { ...component.props, ...action.props },
          },
        },
      };

      return {
        ...state,
        content: newContent,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'DELETE_COMPONENT': {
      const { [action.componentId]: deleted, ...remainingComponents } =
        state.content.components;

      // Remove from all sections
      const newSections: Record<string, Section> = {};
      for (const [sectionId, section] of Object.entries(state.content.sections)) {
        newSections[sectionId] = {
          ...section,
          componentIds: section.componentIds.filter((id) => id !== action.componentId),
        };
      }

      const newContent: PageContent = {
        ...state.content,
        sections: newSections,
        components: remainingComponents,
      };

      return {
        ...state,
        content: newContent,
        selectedComponentId:
          state.selectedComponentId === action.componentId
            ? null
            : state.selectedComponentId,
        editingComponentId:
          state.editingComponentId === action.componentId
            ? null
            : state.editingComponentId,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'MOVE_COMPONENT': {
      // Find current section
      let fromSectionId: string | null = null;
      let fromIndex = -1;

      for (const [sectionId, section] of Object.entries(state.content.sections)) {
        const idx = section.componentIds.indexOf(action.componentId);
        if (idx !== -1) {
          fromSectionId = sectionId;
          fromIndex = idx;
          break;
        }
      }

      if (!fromSectionId) return state;

      // Create new sections with moved component
      const newSections = { ...state.content.sections };

      // Remove from old section
      newSections[fromSectionId] = {
        ...newSections[fromSectionId],
        componentIds: newSections[fromSectionId].componentIds.filter(
          (id) => id !== action.componentId
        ),
      };

      // Add to new section
      const targetComponentIds = [...newSections[action.toSectionId].componentIds];

      // Adjust index if moving within same section and moving down
      let targetIndex = action.toIndex;
      if (fromSectionId === action.toSectionId && fromIndex < action.toIndex) {
        targetIndex = Math.max(0, targetIndex - 1);
      }

      targetComponentIds.splice(targetIndex, 0, action.componentId);

      newSections[action.toSectionId] = {
        ...newSections[action.toSectionId],
        componentIds: targetComponentIds,
      };

      const newContent: PageContent = {
        ...state.content,
        sections: newSections,
      };

      return {
        ...state,
        content: newContent,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'DUPLICATE_COMPONENT': {
      const component = state.content.components[action.componentId];
      if (!component) return state;

      // Find section containing this component
      let sectionId: string | null = null;
      let componentIndex = -1;

      for (const [id, section] of Object.entries(state.content.sections)) {
        const idx = section.componentIds.indexOf(action.componentId);
        if (idx !== -1) {
          sectionId = id;
          componentIndex = idx;
          break;
        }
      }

      if (!sectionId) return state;

      // Create duplicate with new ID
      const newId = generateId();
      const duplicatedComponent: Component = {
        ...component,
        id: newId,
        props: { ...component.props },
      };

      // Insert after original
      const section = state.content.sections[sectionId];
      const newComponentIds = [...section.componentIds];
      newComponentIds.splice(componentIndex + 1, 0, newId);

      const newContent: PageContent = {
        ...state.content,
        sections: {
          ...state.content.sections,
          [sectionId]: {
            ...section,
            componentIds: newComponentIds,
          },
        },
        components: {
          ...state.content.components,
          [newId]: duplicatedComponent,
        },
      };

      return {
        ...state,
        content: newContent,
        selectedComponentId: newId,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponentId: action.componentId,
        editingComponentId:
          action.componentId === null ? null : state.editingComponentId,
      };

    case 'START_EDITING':
      return {
        ...state,
        editingComponentId: action.componentId,
        selectedComponentId: action.componentId,
      };

    case 'STOP_EDITING':
      return {
        ...state,
        editingComponentId: null,
      };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        content: state.history[newIndex],
        historyIndex: newIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        content: state.history[newIndex],
        historyIndex: newIndex,
      };
    }

    case 'COPY_COMPONENT': {
      const component = state.content.components[action.componentId];
      if (!component) return state;
      return {
        ...state,
        clipboard: { ...component },
      };
    }

    case 'PASTE_COMPONENT': {
      if (!state.clipboard) return state;

      const newId = generateId();
      const pastedComponent: Component = {
        ...state.clipboard,
        id: newId,
        props: { ...state.clipboard.props },
      };

      const section = state.content.sections[action.sectionId];
      if (!section) return state;

      const newComponentIds = [...section.componentIds];
      newComponentIds.splice(action.index, 0, newId);

      const newContent: PageContent = {
        ...state.content,
        sections: {
          ...state.content.sections,
          [action.sectionId]: {
            ...section,
            componentIds: newComponentIds,
          },
        },
        components: {
          ...state.content.components,
          [newId]: pastedComponent,
        },
      };

      return {
        ...state,
        content: newContent,
        selectedComponentId: newId,
        history: [...state.history.slice(0, state.historyIndex + 1), newContent],
        historyIndex: state.historyIndex + 1,
      };
    }

    default:
      return state;
  }
}

// Context
interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Convenience methods
  addComponent: (sectionId: string, type: string, index?: number) => void;
  updateComponent: (componentId: string, props: Record<string, any>) => void;
  deleteComponent: (componentId: string) => void;
  selectComponent: (componentId: string | null) => void;
  startEditing: (componentId: string) => void;
  stopEditing: () => void;
  duplicateComponent: (componentId: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  // Auto-save state
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// Provider
interface EditorProviderProps {
  siteId: string;
  pageId: string;
  initialContent: PageContent;
  publishedContent: PageContent | null;
  publishedAt: Date | null;
  children: ReactNode;
}

export function EditorProvider({
  siteId,
  pageId,
  initialContent,
  children,
}: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    content: initialContent,
    selectedComponentId: null,
    editingComponentId: null,
    history: [initialContent],
    historyIndex: 0,
    clipboard: null,
  });

  const sensors = useSensors();

  // Auto-save
  const autoSave = useAutoSave({
    siteId,
    pageId,
    content: state.content,
  });

  // Drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const componentId = active.id as string;

    // Parse drop target info from over.id
    // Format: "section:sectionId:index" or "component:componentId"
    const overIdParts = (over.id as string).split(':');

    if (overIdParts[0] === 'section') {
      const toSectionId = overIdParts[1];
      const toIndex = parseInt(overIdParts[2] || '0', 10);
      dispatch({ type: 'MOVE_COMPONENT', componentId, toSectionId, toIndex });
    } else if (overIdParts[0] === 'component') {
      // Dropped on another component - find its section and index
      const targetComponentId = overIdParts[1];
      for (const [sectionId, section] of Object.entries(state.content.sections)) {
        const idx = section.componentIds.indexOf(targetComponentId);
        if (idx !== -1) {
          dispatch({
            type: 'MOVE_COMPONENT',
            componentId,
            toSectionId: sectionId,
            toIndex: idx,
          });
          break;
        }
      }
    }
  }, [state.content.sections]);

  // Convenience methods
  const addComponent = useCallback(
    (sectionId: string, type: string, index?: number) => {
      const componentId = generateId();
      const defaultProps = getDefaultPropsForType(type);

      dispatch({
        type: 'ADD_COMPONENT',
        sectionId,
        component: {
          id: componentId,
          type,
          props: defaultProps,
        },
        index,
      });
    },
    []
  );

  const updateComponent = useCallback(
    (componentId: string, props: Record<string, any>) => {
      dispatch({ type: 'UPDATE_COMPONENT', componentId, props });
    },
    []
  );

  const deleteComponent = useCallback((componentId: string) => {
    dispatch({ type: 'DELETE_COMPONENT', componentId });
  }, []);

  const selectComponent = useCallback((componentId: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', componentId });
  }, []);

  const startEditing = useCallback((componentId: string) => {
    dispatch({ type: 'START_EDITING', componentId });
  }, []);

  const stopEditing = useCallback(() => {
    dispatch({ type: 'STOP_EDITING' });
  }, []);

  const duplicateComponent = useCallback((componentId: string) => {
    dispatch({ type: 'DUPLICATE_COMPONENT', componentId });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const value: EditorContextValue = {
    state,
    dispatch,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    startEditing,
    stopEditing,
    duplicateComponent,
    undo,
    redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    isSaving: autoSave.isSaving,
    lastSaved: autoSave.lastSaved,
    hasUnsavedChanges: autoSave.hasUnsavedChanges,
    saveError: autoSave.error,
  };

  return (
    <EditorContext.Provider value={value}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {children}
      </DndContext>
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}

// Helper to get default props for component types
function getDefaultPropsForType(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    text: {
      content: '<p>Click to edit text...</p>',
      alignment: 'left',
    },
    image: {
      assetId: null,
      altText: '',
      caption: '',
    },
    gallery: {
      assetIds: [],
      layout: 'grid',
      columns: 3,
      gap: 'normal',
    },
    spacer: {
      height: 48,
    },
    button: {
      text: 'Click Me',
      url: '',
      style: 'primary',
    },
    video: {
      url: '',
      autoplay: false,
    },
    'contact-form': {
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message',
    },
  };

  return defaults[type] || {};
}
```

---

## 4. Main Editor Layout Component

Create `src/components/editor/PageEditor.tsx`:

```typescript
'use client';

import { useEditor } from './EditorProvider';
import { EditorHeader } from './EditorHeader';
import { EditorCanvas } from './EditorCanvas';
import { SettingsPanel } from './SettingsPanel';
import { ComponentPicker } from './ComponentPicker';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface PageEditorProps {
  site: {
    id: string;
    title: string;
    themeId: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
  };
  allPages: Array<{ id: string; title: string; slug: string }>;
}

export function PageEditor({ site, page, allPages }: PageEditorProps) {
  const { state } = useEditor();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const selectedComponent = state.selectedComponentId
    ? state.content.components[state.selectedComponentId]
    : null;

  return (
    <div className="h-screen flex flex-col bg-surface-alt">
      {/* Header */}
      <EditorHeader site={site} page={page} allPages={allPages} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <EditorCanvas />
        </main>

        {/* Settings panel (desktop) */}
        <aside
          className={cn(
            'hidden md:block w-80 border-l border-border bg-surface overflow-y-auto',
            'transition-all duration-200',
            selectedComponent ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {selectedComponent && (
            <SettingsPanel component={selectedComponent} />
          )}
        </aside>
      </div>

      {/* Component picker (floating button) */}
      <ComponentPicker />

      {/* Mobile settings panel (bottom sheet) */}
      {selectedComponent && (
        <MobileSettingsSheet component={selectedComponent} />
      )}
    </div>
  );
}

function MobileSettingsSheet({ component }: { component: any }) {
  const { selectComponent } = useEditor();

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40">
      <div className="bg-surface border-t border-border rounded-t-2xl shadow-lg max-h-[60vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium capitalize">{component.type} Settings</span>
          <button
            onClick={() => selectComponent(null)}
            className="text-text-muted hover:text-text p-1"
          >
            Done
          </button>
        </div>
        <div className="p-4">
          <SettingsPanel component={component} />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Editor Header

Create `src/components/editor/EditorHeader.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { useEditor } from './EditorProvider';
import { SaveStatus } from './SaveStatus';
import { PublishButton } from './PublishButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Undo2, Redo2, Settings } from 'lucide-react';

interface EditorHeaderProps {
  site: { id: string; title: string };
  page: { id: string; title: string; slug: string };
  allPages: Array<{ id: string; title: string; slug: string }>;
}

export function EditorHeader({ site, page, allPages }: EditorHeaderProps) {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveError,
  } = useEditor();

  return (
    <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between">
      {/* Left: Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-text-muted hover:text-text text-sm"
        >
          ← Dashboard
        </Link>

        <span className="text-border">|</span>

        {/* Page selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              {page.title}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {allPages.map((p) => (
              <DropdownMenuItem key={p.id} asChild>
                <Link href={`/editor/${site.id}/${p.id}`}>
                  {p.title}
                  {p.id === page.id && ' ✓'}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/editor/${site.id}/pages`}>
                Manage Pages
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center: Save status & undo/redo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <SaveStatus
          isSaving={isSaving}
          lastSaved={lastSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          error={saveError}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/editor/${site.id}/settings`}>
            <Settings className="w-4 h-4" />
          </Link>
        </Button>

        <PublishButton siteId={site.id} pageId={page.id} />
      </div>
    </header>
  );
}
```

---

## 6. Editor Canvas

Create `src/components/editor/EditorCanvas.tsx`:

```typescript
'use client';

import { useEditor } from './EditorProvider';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EditorSection } from './EditorSection';
import { PortfolioThemeProvider } from '@/hooks/usePortfolioTheme';

export function EditorCanvas() {
  const { state, selectComponent } = useEditor();
  const { content } = state;

  // Click on canvas background deselects
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  // Get section order (main content section for now)
  const sectionIds = Object.keys(content.sections);

  return (
    <div
      className="max-w-4xl mx-auto"
      onClick={handleCanvasClick}
    >
      {/* Render within portfolio theme context for accurate preview */}
      <PortfolioThemeProvider themeId="current-site-theme">
        <div className="bg-portfolio-background rounded-lg shadow-lg min-h-[600px] p-8">
          {sectionIds.map((sectionId) => (
            <EditorSection key={sectionId} sectionId={sectionId} />
          ))}

          {/* Empty state */}
          {sectionIds.length === 0 && (
            <div className="text-center py-16 text-text-muted">
              <p className="text-lg mb-2">Your page is empty</p>
              <p className="text-sm">
                Click the + button to add your first component
              </p>
            </div>
          )}
        </div>
      </PortfolioThemeProvider>
    </div>
  );
}
```

---

## 7. Editor Section with Sortable Components

Create `src/components/editor/EditorSection.tsx`:

```typescript
'use client';

import { useEditor } from './EditorProvider';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableBlock } from './SortableBlock';
import { cn } from '@/lib/utils';

interface EditorSectionProps {
  sectionId: string;
}

export function EditorSection({ sectionId }: EditorSectionProps) {
  const { state } = useEditor();
  const section = state.content.sections[sectionId];

  const { setNodeRef, isOver } = useDroppable({
    id: `section:${sectionId}:${section.componentIds.length}`,
  });

  if (!section) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[100px] transition-colors rounded-lg',
        isOver && 'bg-primary/5 ring-2 ring-primary ring-dashed'
      )}
    >
      <SortableContext
        items={section.componentIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {section.componentIds.map((componentId, index) => (
            <SortableBlock
              key={componentId}
              componentId={componentId}
              sectionId={sectionId}
              index={index}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drop zone indicator when empty */}
      {section.componentIds.length === 0 && (
        <div className="h-24 flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg">
          Drop components here
        </div>
      )}
    </div>
  );
}
```

---

## 8. Sortable Block Wrapper

Create `src/components/editor/SortableBlock.tsx`:

```typescript
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditor } from './EditorProvider';
import { BlockWrapper } from './BlockWrapper';
import { ComponentRenderer } from './ComponentRenderer';
import { cn } from '@/lib/utils';

interface SortableBlockProps {
  componentId: string;
  sectionId: string;
  index: number;
}

export function SortableBlock({
  componentId,
  sectionId,
  index,
}: SortableBlockProps) {
  const { state, selectComponent, startEditing, stopEditing, updateComponent } =
    useEditor();

  const component = state.content.components[componentId];
  const isSelected = state.selectedComponentId === componentId;
  const isEditing = state.editingComponentId === componentId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: componentId,
    data: {
      type: 'component',
      sectionId,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!component) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative transition-opacity',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <BlockWrapper
        componentId={componentId}
        componentType={component.type}
        isSelected={isSelected}
        isEditing={isEditing}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onSelect={() => selectComponent(componentId)}
        onStartEdit={() => startEditing(componentId)}
        onEndEdit={stopEditing}
      >
        <ComponentRenderer
          component={component}
          isEditing={isEditing}
          isSelected={isSelected}
          onUpdate={(props) => updateComponent(componentId, props)}
          onStartEdit={() => startEditing(componentId)}
          onEndEdit={stopEditing}
        />
      </BlockWrapper>
    </div>
  );
}
```

---

## 9. Block Wrapper with Actions

Create `src/components/editor/BlockWrapper.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';
import { useEditor } from './EditorProvider';
import { cn } from '@/lib/utils';
import { GripVertical, Trash2, Copy, Settings } from 'lucide-react';

interface BlockWrapperProps {
  componentId: string;
  componentType: string;
  isSelected: boolean;
  isEditing: boolean;
  isDragging: boolean;
  dragHandleProps: Record<string, any>;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  children: ReactNode;
}

export function BlockWrapper({
  componentId,
  componentType,
  isSelected,
  isEditing,
  isDragging,
  dragHandleProps,
  onSelect,
  onStartEdit,
  children,
}: BlockWrapperProps) {
  const { deleteComponent, duplicateComponent } = useEditor();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit();
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg transition-all',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'shadow-lg'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Hover/selected toolbar */}
      <div
        className={cn(
          'absolute -top-10 left-0 right-0 flex items-center justify-between px-2',
          'opacity-0 transition-opacity',
          (isSelected || isDragging) && 'opacity-100',
          'group-hover:opacity-100'
        )}
      >
        {/* Left: Drag handle + type label */}
        <div className="flex items-center gap-2">
          <button
            {...dragHandleProps}
            className={cn(
              'p-1 rounded bg-surface border border-border cursor-grab',
              'hover:bg-surface-hover active:cursor-grabbing',
              'touch-none' // Prevent scroll on touch
            )}
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-text-muted" />
          </button>

          <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded border border-border capitalize">
            {componentType}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(componentId);
            }}
            className="p-1 rounded bg-surface border border-border hover:bg-surface-hover"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-text-muted" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComponent(componentId);
            }}
            className="p-1 rounded bg-surface border border-border hover:bg-error hover:text-error-foreground"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Component content */}
      <div className="min-h-[40px]">{children}</div>
    </div>
  );
}
```

---

## 10. Component Picker (Add Button)

Create `src/components/editor/ComponentPicker.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useEditor } from './EditorProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Plus,
  Type,
  Image,
  Grid3X3,
  Play,
  Minus,
  MousePointer,
  Mail,
  X,
} from 'lucide-react';

const COMPONENT_TYPES = [
  { type: 'text', name: 'Text Block', icon: Type },
  { type: 'image', name: 'Single Image', icon: Image },
  { type: 'gallery', name: 'Image Gallery', icon: Grid3X3 },
  { type: 'video', name: 'Video Embed', icon: Play },
  { type: 'spacer', name: 'Spacer', icon: Minus },
  { type: 'button', name: 'Button', icon: MousePointer },
  { type: 'contact-form', name: 'Contact Form', icon: Mail },
];

export function ComponentPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const { addComponent, state } = useEditor();

  // Get first section ID (main content)
  const sectionId = Object.keys(state.content.sections)[0];

  const handleAddComponent = (type: string) => {
    if (sectionId) {
      addComponent(sectionId, type);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating add button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-40 rounded-full shadow-lg',
          'w-14 h-14 p-0',
          // Desktop: bottom-right
          'md:bottom-8 md:right-8',
          // Mobile: bottom-center
          'bottom-4 right-1/2 translate-x-1/2 md:translate-x-0'
        )}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Picker overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker panel */}
          <div
            className={cn(
              'relative bg-surface rounded-t-2xl md:rounded-2xl',
              'w-full md:max-w-md',
              'max-h-[70vh] overflow-y-auto',
              'animate-in slide-in-from-bottom md:fade-in md:zoom-in-95'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Component</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-surface-hover rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Component grid */}
            <div className="p-6 grid grid-cols-2 gap-4">
              {COMPONENT_TYPES.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddComponent(item.type)}
                  className={cn(
                    'flex flex-col items-center gap-3 p-6 rounded-lg',
                    'bg-surface-hover hover:bg-primary/10 hover:text-primary',
                    'border border-border hover:border-primary',
                    'transition-all'
                  )}
                >
                  <item.icon className="w-8 h-8" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 11. Component Renderer

Create `src/components/editor/ComponentRenderer.tsx`:

```typescript
'use client';

import { Component } from '@/types';
import { TextBlockRenderer } from '@/components/blocks/TextBlock/TextBlockRenderer';
import { ImageBlockRenderer } from '@/components/blocks/ImageBlock/ImageBlockRenderer';
import { GalleryBlockRenderer } from '@/components/blocks/GalleryBlock/GalleryBlockRenderer';
// Import other renderers...

interface ComponentRendererProps {
  component: Component;
  isEditing: boolean;
  isSelected: boolean;
  onUpdate: (props: Record<string, any>) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export function ComponentRenderer({
  component,
  isEditing,
  isSelected,
  onUpdate,
  onStartEdit,
  onEndEdit,
}: ComponentRendererProps) {
  const commonProps = {
    props: component.props,
    isEditing,
    isSelected,
    onStartEdit,
    onEndEdit,
    onUpdate,
  };

  switch (component.type) {
    case 'text':
      return <TextBlockRenderer {...commonProps} />;

    case 'image':
      return <ImageBlockRenderer {...commonProps} />;

    case 'gallery':
      return <GalleryBlockRenderer {...commonProps} siteId="current-site-id" />;

    case 'spacer':
      return (
        <div
          style={{ height: component.props.height || 48 }}
          className="bg-surface-alt/20 rounded flex items-center justify-center text-text-muted text-xs"
        >
          {isEditing ? `Spacer (${component.props.height}px)` : ''}
        </div>
      );

    case 'button':
      return (
        <div className={isEditing ? 'pointer-events-none' : ''}>
          <button
            className="bg-primary text-text-inverted px-6 py-3 rounded-lg font-medium"
            style={{ pointerEvents: isEditing ? 'none' : 'auto' }}
          >
            {component.props.text || 'Button'}
          </button>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-warning/10 text-warning rounded">
          Unknown component type: {component.type}
        </div>
      );
  }
}
```

---

## 12. Keyboard Shortcuts

Create `src/hooks/useKeyboardShortcuts.ts`:

```typescript
'use client';

import { useEffect } from 'react';
import { useEditor } from '@/components/editor/EditorProvider';

export function useKeyboardShortcuts() {
  const {
    state,
    undo,
    redo,
    deleteComponent,
    duplicateComponent,
    dispatch,
    selectComponent,
  } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        // But still allow Escape
        if (e.key !== 'Escape') return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (cmdOrCtrl && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete: Backspace or Delete when component selected
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        state.selectedComponentId &&
        !state.editingComponentId
      ) {
        e.preventDefault();
        deleteComponent(state.selectedComponentId);
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && e.key === 'd' && state.selectedComponentId) {
        e.preventDefault();
        duplicateComponent(state.selectedComponentId);
        return;
      }

      // Copy: Cmd/Ctrl + C
      if (cmdOrCtrl && e.key === 'c' && state.selectedComponentId) {
        e.preventDefault();
        dispatch({ type: 'COPY_COMPONENT', componentId: state.selectedComponentId });
        return;
      }

      // Paste: Cmd/Ctrl + V
      if (cmdOrCtrl && e.key === 'v' && state.clipboard) {
        e.preventDefault();
        const sectionId = Object.keys(state.content.sections)[0];
        if (sectionId) {
          const section = state.content.sections[sectionId];
          dispatch({
            type: 'PASTE_COMPONENT',
            sectionId,
            index: section.componentIds.length,
          });
        }
        return;
      }

      // Escape: Deselect or stop editing
      if (e.key === 'Escape') {
        if (state.editingComponentId) {
          dispatch({ type: 'STOP_EDITING' });
        } else {
          selectComponent(null);
        }
        return;
      }

      // Enter: Start editing selected component
      if (e.key === 'Enter' && state.selectedComponentId && !state.editingComponentId) {
        e.preventDefault();
        dispatch({ type: 'START_EDITING', componentId: state.selectedComponentId });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.selectedComponentId,
    state.editingComponentId,
    state.clipboard,
    state.content.sections,
    undo,
    redo,
    deleteComponent,
    duplicateComponent,
    dispatch,
    selectComponent,
  ]);
}
```

---

## File Structure

```
src/
├── app/
│   └── editor/
│       └── [siteId]/
│           └── [pageId]/
│               └── page.tsx
├── components/
│   └── editor/
│       ├── EditorProvider.tsx
│       ├── PageEditor.tsx
│       ├── EditorHeader.tsx
│       ├── EditorCanvas.tsx
│       ├── EditorSection.tsx
│       ├── SortableBlock.tsx
│       ├── BlockWrapper.tsx
│       ├── ComponentPicker.tsx
│       ├── ComponentRenderer.tsx
│       ├── SettingsPanel.tsx
│       ├── SaveStatus.tsx
│       └── PublishButton.tsx
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useDndSensors.ts
└── types/
    └── index.ts (Component, PageContent, etc.)
```

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete / Backspace` | Delete selected |
| `Ctrl/Cmd + D` | Duplicate selected |
| `Ctrl/Cmd + C` | Copy selected |
| `Ctrl/Cmd + V` | Paste |
| `Escape` | Deselect / stop editing |
| `Enter` | Start editing selected |

---

## Deliverables Checklist

- [ ] Editor page with auth protection
- [ ] EditorProvider with full state management
- [ ] Undo/redo with history stack
- [ ] EditorCanvas rendering sections
- [ ] SortableBlock with dnd-kit integration
- [ ] BlockWrapper with drag handle and actions
- [ ] ComponentPicker floating button + modal
- [ ] ComponentRenderer dispatch to block types
- [ ] EditorHeader with page selector
- [ ] SettingsPanel for component props
- [ ] Keyboard shortcuts for common actions
- [ ] Mobile bottom sheet for settings
- [ ] Auto-save integration

---

## Testing Checklist

1. **Add component** - Opens picker, adds to canvas
2. **Drag reorder** - Smooth drag, correct position on drop
3. **Delete component** - Removes from canvas, keyboard works
4. **Duplicate** - Creates copy below original
5. **Undo/redo** - Full history navigation
6. **Copy/paste** - Works within and across sections
7. **Text editing** - Double-click enters edit mode
8. **Settings panel** - Opens on select, updates props
9. **Keyboard shortcuts** - All shortcuts work
10. **Auto-save** - Triggers after edits, shows status
11. **Mobile editing** - Touch drag works, bottom sheet settings
12. **Empty state** - Shows helpful message

---

## Success Criteria

From user-success-scenarios.md:

- **Sarah (mobile update)**: Updates portfolio from phone in under 5 minutes
- **Touch interaction**: Full mobile touch support via dnd-kit sensors
- **Real-time saving**: Changes saved automatically, no data loss
- **Confidence**: Clear feedback on save status and component state
