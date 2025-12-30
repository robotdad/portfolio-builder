'use client'

import type { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
  onLinkClick: () => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  label: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`toolbar-btn ${isActive ? 'active' : ''}`}
      aria-label={label}
      aria-pressed={isActive}
    >
      {children}
    </button>
  )
}

export function Toolbar({ editor, onLinkClick }: ToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
      {/* Block format group */}
      <div className="editor-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          label="Paragraph"
        >
          P
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          label="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          label="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          label="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>

      <div className="editor-toolbar-divider" />

      {/* Inline format group */}
      <div className="editor-toolbar-group">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="Italic"
        >
          <em>I</em>
        </ToolbarButton>
      </div>

      <div className="editor-toolbar-divider" />

      {/* Link group */}
      <div className="editor-toolbar-group">
        <ToolbarButton
          onClick={onLinkClick}
          isActive={editor.isActive('link')}
          label="Insert link"
        >
          Link
        </ToolbarButton>
      </div>
    </div>
  )
}
