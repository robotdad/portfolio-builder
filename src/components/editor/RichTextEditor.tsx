/**
 * @fileoverview Rich Text Editor component built on Tiptap
 *
 * A streamlined WYSIWYG editor for content creation within the portfolio admin system.
 * Built on Tiptap (ProseMirror-based), this editor provides essential formatting capabilities
 * while maintaining clean HTML output suitable for the content management system.
 *
 * ## Included Extensions
 * - **StarterKit** (partial): Provides core editing features including:
 *   - Paragraphs, headings, bold, italic, strike
 *   - History (undo/redo)
 *   - Hard breaks
 * - **Link**: External link support with security attributes (noopener, noreferrer)
 *
 * ## Disabled Features
 * The following StarterKit features are intentionally disabled to keep content simple:
 * - Blockquotes, code blocks, inline code
 * - Bullet lists, ordered lists
 * - Horizontal rules
 *
 * ## Content System Integration
 * - Accepts and outputs HTML strings for storage in the content database
 * - Controlled component pattern: parent manages state via `value`/`onChange`
 * - Responsive toolbar adapts between desktop and mobile layouts
 * - Link dialog provides accessible URL input without inline editing complexity
 *
 * @example
 * ```tsx
 * const [content, setContent] = useState('<p>Initial content</p>')
 *
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Start writing..."
 *   id="article-body"
 * />
 * ```
 *
 * @module components/editor/RichTextEditor
 */
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { MobileToolbar } from './MobileToolbar'
import { LinkDialog } from './LinkDialog'

/**
 * Props for the RichTextEditor component.
 */
interface RichTextEditorProps {
  /**
   * The current HTML content of the editor.
   * Should be valid HTML that Tiptap can parse and render.
   * Empty string or simple HTML like `<p></p>` for initial empty state.
   */
  value: string

  /**
   * Callback fired when editor content changes.
   * Receives the complete HTML representation of the editor content.
   * Called on every keystroke/change for real-time updates.
   *
   * @param html - The serialized HTML content from Tiptap
   */
  onChange: (html: string) => void

  /**
   * Placeholder text shown when the editor is empty.
   * Displayed via CSS pseudo-element on the editor container.
   *
   * @default undefined (no placeholder)
   */
  placeholder?: string

  /**
   * HTML id attribute for the editor content area.
   * Useful for associating labels or for form accessibility.
   *
   * @default undefined (no id set)
   */
  id?: string
}

export function RichTextEditor({ value, onChange, placeholder, id }: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Memoize extensions to prevent recreation on each render
  const extensions = useMemo(() => [
    StarterKit.configure({
      // Disable unwanted extensions
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      // Disable StarterKit's Link - we configure our own below
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  ], [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-content',
        'data-placeholder': placeholder || '',
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const handleLinkClick = useCallback(() => {
    setIsLinkDialogOpen(true)
  }, [])

  const handleLinkDialogClose = useCallback(() => {
    setIsLinkDialogOpen(false)
    editor?.chain().focus().run()
  }, [editor])

  return (
    <div className="rich-text-editor">
      {isMobile ? (
        <MobileToolbar editor={editor} onLinkClick={handleLinkClick} />
      ) : (
        <Toolbar editor={editor} onLinkClick={handleLinkClick} />
      )}
      <EditorContent editor={editor} />
      {editor && (
        <LinkDialog
          editor={editor}
          isOpen={isLinkDialogOpen}
          onClose={handleLinkDialogClose}
        />
      )}
    </div>
  )
}
