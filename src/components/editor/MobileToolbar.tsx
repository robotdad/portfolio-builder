'use client'

import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { TouchButton } from './TouchButton'

interface MobileToolbarProps {
  editor: Editor | null
  onLinkClick: () => void
}

/**
 * MobileToolbar - Simple, reliable toolbar for mobile editing
 * 
 * Design decisions:
 * - Stays attached to editor (no fixed positioning that breaks on iOS)
 * - Uses onPointerDown to capture touch before keyboard dismisses
 * - Prevents default to stop unwanted focus changes
 * - Relies on iOS natural scroll-into-view behavior for keyboard
 */
export function MobileToolbar({ editor, onLinkClick }: MobileToolbarProps) {
  
  // Use onPointerDown + preventDefault to ensure buttons work on mobile
  // This captures the touch before iOS can dismiss the keyboard
  const handleFormat = useCallback((command: () => void) => {
    return (e: React.PointerEvent | React.MouseEvent) => {
      e.preventDefault() // Prevent focus loss
      command()
      // Refocus editor after a tiny delay to ensure command completes
      requestAnimationFrame(() => {
        editor?.chain().focus().run()
      })
    }
  }, [editor])

  const handleLinkClick = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault()
    onLinkClick()
  }, [onLinkClick])

  if (!editor) {
    return null
  }

  return (
    <div className="mobile-toolbar" role="toolbar" aria-label="Text formatting">
      {/* Block format group */}
      <div className="mobile-toolbar-group">
        <TouchButton
          onPointerDown={handleFormat(() => editor.chain().focus().setParagraph().run())}
          isActive={editor.isActive('paragraph')}
          aria-label="Paragraph"
        >
          P
        </TouchButton>
        <TouchButton
          onPointerDown={handleFormat(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          isActive={editor.isActive('heading', { level: 1 })}
          aria-label="Heading 1"
        >
          H1
        </TouchButton>
        <TouchButton
          onPointerDown={handleFormat(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          isActive={editor.isActive('heading', { level: 2 })}
          aria-label="Heading 2"
        >
          H2
        </TouchButton>
      </div>

      <div className="mobile-toolbar-divider" aria-hidden="true" />

      {/* Inline format group */}
      <div className="mobile-toolbar-group">
        <TouchButton
          onPointerDown={handleFormat(() => editor.chain().focus().toggleBold().run())}
          isActive={editor.isActive('bold')}
          aria-label="Bold"
        >
          <strong>B</strong>
        </TouchButton>
        <TouchButton
          onPointerDown={handleFormat(() => editor.chain().focus().toggleItalic().run())}
          isActive={editor.isActive('italic')}
          aria-label="Italic"
        >
          <em>I</em>
        </TouchButton>
      </div>

      <div className="mobile-toolbar-divider" aria-hidden="true" />

      {/* Link group */}
      <div className="mobile-toolbar-group">
        <TouchButton
          onPointerDown={handleLinkClick}
          isActive={editor.isActive('link')}
          aria-label="Insert link"
        >
          Link
        </TouchButton>
      </div>
    </div>
  )
}
