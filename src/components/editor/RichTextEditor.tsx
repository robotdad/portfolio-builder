'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { MobileToolbar } from './MobileToolbar'
import { LinkDialog } from './LinkDialog'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
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
