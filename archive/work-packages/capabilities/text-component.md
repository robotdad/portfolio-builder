# Capability: Text Component

A self-contained work package for implementing rich text editing using Tiptap.

## Overview

Implement a Tiptap-based rich text editor component that integrates with the dnd-kit page builder. Supports headings, bold, italic, links, and lists with a mobile-friendly toolbar.

## Prerequisites

- Foundation artifacts complete (component-contracts, theme-system)
- Component registry pattern from component-contracts.md
- BlockWrapper pattern implemented

## Deliverables

1. Tiptap editor configuration
2. Text block renderer component
3. Formatting toolbar
4. Settings panel for text blocks
5. Component registration
6. Mobile touch optimizations

---

## 1. Required Packages

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align
```

---

## 2. Tiptap Configuration

Create `src/lib/editor/tiptap-config.ts`:

```typescript
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

export const defaultExtensions = [
  StarterKit.configure({
    // Disable features we don't need
    codeBlock: false,
    code: false,
    horizontalRule: false,
    // Configure heading levels
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Link.configure({
    openOnClick: false, // Don't navigate when editing
    HTMLAttributes: {
      class: 'text-primary underline',
      rel: 'noopener noreferrer',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start typing...',
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
  }),
];

// Default content for new text blocks
export const defaultContent = '<p></p>';

// Convert empty content to null for storage
export function normalizeContent(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '<p></p>' || trimmed === '') {
    return '<p></p>';
  }
  return trimmed;
}
```

---

## 3. Text Block Renderer

Create `src/components/blocks/TextBlock/TextBlockRenderer.tsx`:

```typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { defaultExtensions, normalizeContent } from '@/lib/editor/tiptap-config';
import { TextBlockProps } from '@/types/components';
import { cn } from '@/lib/utils';
import { TextToolbar } from './TextToolbar';

interface TextBlockRendererProps {
  props: TextBlockProps;
  isEditing: boolean;
  isSelected: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onUpdate: (props: Partial<TextBlockProps>) => void;
}

export function TextBlockRenderer({
  props,
  isEditing,
  isSelected,
  onStartEdit,
  onEndEdit,
  onUpdate,
}: TextBlockRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: defaultExtensions,
    content: props.content,
    editable: isEditing,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[1.5em]',
          'prose-headings:text-portfolio-text prose-p:text-portfolio-text',
          'prose-a:text-portfolio-accent',
          props.alignment === 'center' && 'text-center',
          props.alignment === 'right' && 'text-right'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = normalizeContent(editor.getHTML());
      onUpdate({ content: html });
    },
    onFocus: () => {
      onStartEdit();
    },
    onBlur: ({ event }) => {
      // Don't end edit if clicking toolbar
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (relatedTarget?.closest('[data-toolbar]')) {
        return;
      }
      onEndEdit();
    },
  });

  // Update editable state when isEditing changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
      if (isEditing) {
        // Focus at end of content
        editor.commands.focus('end');
      }
    }
  }, [editor, isEditing]);

  // Update content when props change externally
  useEffect(() => {
    if (editor && !isEditing) {
      const currentContent = normalizeContent(editor.getHTML());
      const newContent = normalizeContent(props.content);
      if (currentContent !== newContent) {
        editor.commands.setContent(props.content);
      }
    }
  }, [editor, props.content, isEditing]);

  // Handle click to start editing
  const handleClick = useCallback(() => {
    if (!isEditing) {
      onStartEdit();
    }
  }, [isEditing, onStartEdit]);

  // Handle alignment change from toolbar
  const handleAlignmentChange = useCallback(
    (alignment: 'left' | 'center' | 'right') => {
      onUpdate({ alignment });
      editor?.chain().focus().setTextAlign(alignment).run();
    },
    [editor, onUpdate]
  );

  if (!editor) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Toolbar - shown when editing */}
      {isEditing && (
        <TextToolbar
          editor={editor}
          alignment={props.alignment || 'left'}
          onAlignmentChange={handleAlignmentChange}
        />
      )}

      {/* Editor content */}
      <div
        onClick={handleClick}
        className={cn(
          'p-4 rounded-lg transition-colors',
          !isEditing && 'cursor-text hover:bg-surface-hover',
          isEditing && 'bg-surface'
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

---

## 4. Formatting Toolbar

Create `src/components/blocks/TextBlock/TextToolbar.tsx`:

```typescript
'use client';

import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Unlink,
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface TextToolbarProps {
  editor: Editor;
  alignment: 'left' | 'center' | 'right';
  onAlignmentChange: (alignment: 'left' | 'center' | 'right') => void;
}

export function TextToolbar({
  editor,
  alignment,
  onAlignmentChange,
}: TextToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleUnlink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const openLinkInput = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  }, [editor]);

  return (
    <div
      data-toolbar
      className="absolute -top-12 left-0 right-0 flex items-center gap-1 p-2 bg-surface border border-border rounded-lg shadow-lg z-10"
    >
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => onAlignmentChange('left')}
        isActive={alignment === 'left'}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onAlignmentChange('center')}
        isActive={alignment === 'center'}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onAlignmentChange('right')}
        isActive={alignment === 'right'}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      {showLinkInput ? (
        <div className="flex items-center gap-1">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
            placeholder="https://..."
            className="w-40 px-2 py-1 text-sm border border-border rounded bg-background"
            autoFocus
          />
          <button
            onClick={handleLinkSubmit}
            className="px-2 py-1 text-xs bg-primary text-text-inverted rounded"
          >
            Add
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="px-2 py-1 text-xs text-text-muted"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <ToolbarButton
            onClick={openLinkInput}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          {editor.isActive('link') && (
            <ToolbarButton onClick={handleUnlink} title="Remove Link">
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}
        </>
      )}
    </div>
  );
}

// Helper components
function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded transition-colors',
        'hover:bg-surface-hover',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        // Larger touch targets on mobile
        'min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px]',
        'flex items-center justify-center',
        isActive && 'bg-primary-light text-primary'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />;
}
```

---

## 5. Text Block Settings Panel

Create `src/components/blocks/TextBlock/TextBlockSettings.tsx`:

```typescript
'use client';

import { TextBlockProps } from '@/types/components';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TextBlockSettingsProps {
  props: TextBlockProps;
  onUpdate: (props: Partial<TextBlockProps>) => void;
}

export function TextBlockSettings({ props, onUpdate }: TextBlockSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="alignment">Text Alignment</Label>
        <Select
          value={props.alignment || 'left'}
          onValueChange={(value) =>
            onUpdate({ alignment: value as 'left' | 'center' | 'right' })
          }
        >
          <SelectTrigger id="alignment">
            <SelectValue placeholder="Select alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-text-muted">
        <p>Tip: Use the toolbar above the text block for formatting options.</p>
      </div>
    </div>
  );
}
```

---

## 6. Component Registration

Create `src/components/blocks/TextBlock/index.ts`:

```typescript
import { registerComponent } from '@/lib/component-registry';
import { TextBlockRenderer } from './TextBlockRenderer';
import { TextBlockSettings } from './TextBlockSettings';
import { Type } from 'lucide-react';

// Register the text component
registerComponent({
  type: 'text',
  name: 'Text',
  icon: Type,
  defaultProps: {
    content: '<p></p>',
    alignment: 'left',
  },
  component: TextBlockRenderer,
  settingsPanel: TextBlockSettings,
});

// Export for direct imports if needed
export { TextBlockRenderer } from './TextBlockRenderer';
export { TextBlockSettings } from './TextBlockSettings';
```

---

## 7. TypeScript Types

Ensure types are defined in `src/types/components.ts`:

```typescript
export interface TextBlockProps {
  content: string; // HTML from Tiptap
  alignment?: 'left' | 'center' | 'right';
}
```

---

## 8. Read-Only Renderer

For published pages (non-editable display):

Create `src/components/blocks/TextBlock/TextBlockDisplay.tsx`:

```typescript
import { TextBlockProps } from '@/types/components';
import { cn } from '@/lib/utils';

interface TextBlockDisplayProps {
  props: TextBlockProps;
}

export function TextBlockDisplay({ props }: TextBlockDisplayProps) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:text-portfolio-text prose-p:text-portfolio-text',
        'prose-a:text-portfolio-accent prose-a:underline',
        props.alignment === 'center' && 'text-center',
        props.alignment === 'right' && 'text-right'
      )}
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
}
```

**Security Note:** Content is from our own Tiptap editor, so XSS risk is minimal. For additional safety, consider sanitizing with DOMPurify:

```typescript
import DOMPurify from 'dompurify';

// Sanitize before rendering
const sanitizedContent = DOMPurify.sanitize(props.content, {
  ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'rel', 'target', 'class'],
});
```

---

## 9. Mobile Optimizations

### Touch-Friendly Toolbar

The toolbar already uses 44px touch targets on mobile. Additional considerations:

```css
/* In globals.css */

/* Prevent zoom on input focus (iOS) */
@media screen and (max-width: 640px) {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}

/* Better selection handles on mobile */
.ProseMirror ::selection {
  background: var(--color-primary-light);
}
```

### Sticky Toolbar on Mobile

For longer text blocks, make toolbar sticky:

```typescript
// In TextBlockRenderer.tsx
<div
  data-toolbar
  className={cn(
    'flex items-center gap-1 p-2 bg-surface border border-border rounded-lg shadow-lg z-10',
    // Desktop: absolute positioning
    'sm:absolute sm:-top-12 sm:left-0 sm:right-0',
    // Mobile: sticky at top
    'sticky top-0 -mx-4 -mt-4 mb-2 rounded-none sm:rounded-lg sm:mx-0 sm:mt-0 sm:mb-0'
  )}
>
```

---

## 10. Keyboard Shortcuts

Tiptap includes default shortcuts. Document for users:

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Bold |
| `Cmd/Ctrl + I` | Italic |
| `Cmd/Ctrl + K` | Add link |
| `Cmd/Ctrl + Shift + 1-3` | Heading 1-3 |
| `Cmd/Ctrl + Shift + 8` | Bullet list |
| `Cmd/Ctrl + Shift + 7` | Numbered list |

---

## File Structure

```
src/
├── components/
│   └── blocks/
│       └── TextBlock/
│           ├── index.ts              # Registration
│           ├── TextBlockRenderer.tsx # Editor component
│           ├── TextBlockDisplay.tsx  # Read-only display
│           ├── TextBlockSettings.tsx # Settings panel
│           └── TextToolbar.tsx       # Formatting toolbar
├── lib/
│   └── editor/
│       └── tiptap-config.ts          # Tiptap extensions config
└── types/
    └── components.ts                 # TextBlockProps type
```

---

## Required Packages

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align lucide-react
```

Optional for sanitization:
```bash
npm install dompurify
npm install -D @types/dompurify
```

---

## Deliverables Checklist

- [ ] Tiptap extensions configured (StarterKit, Link, Placeholder, TextAlign)
- [ ] TextBlockRenderer with edit/view modes
- [ ] Formatting toolbar with all buttons
- [ ] Link input/edit UI
- [ ] Alignment controls (left/center/right)
- [ ] TextBlockSettings panel
- [ ] Component registered in registry
- [ ] TextBlockDisplay for published pages
- [ ] Mobile-optimized touch targets (44px)
- [ ] Keyboard shortcuts work
- [ ] Content sanitized for display

---

## Testing Checklist

1. **Basic editing** - Type text, verify saves
2. **Bold/Italic** - Toggle formatting, verify HTML output
3. **Headings** - Switch between H1/H2/H3 and paragraph
4. **Lists** - Create bullet and numbered lists
5. **Links** - Add, edit, and remove links
6. **Alignment** - Left/center/right alignment persists
7. **Focus behavior** - Click to edit, click outside to save
8. **Toolbar interaction** - Clicking toolbar doesn't blur editor
9. **Mobile toolbar** - Touch targets are large enough
10. **Keyboard shortcuts** - Cmd+B for bold, etc.
11. **Empty state** - Placeholder shows when empty
12. **Content persistence** - Reload page, content is preserved
