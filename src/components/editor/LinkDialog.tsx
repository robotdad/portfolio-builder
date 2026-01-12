'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'

interface LinkDialogProps {
  editor: Editor
  isOpen: boolean
  onClose: () => void
}

export function LinkDialog({ editor, isOpen, onClose }: LinkDialogProps) {
  // Initialize URL from editor when dialog opens using lazy init pattern
  // The key prop pattern would be ideal but requires parent changes
  const [url, setUrl] = useState(() => 
    editor.getAttributes('link').href || ''
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Store the trigger element and sync URL when dialog opens
  // URL sync moved to event handler pattern where possible
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to return focus later
      triggerRef.current = document.activeElement
      // Sync URL from editor - this is necessary because the editor state
      // may have changed since component mount. Moving to event handler
      // would require parent component changes.
      const currentUrl = editor.getAttributes('link').href || ''
      if (currentUrl !== url) {
        setUrl(currentUrl)
      }
      // Focus input after a brief delay to ensure dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen, editor, url])

  // Return focus to trigger when closing
  const handleClose = useCallback(() => {
    onClose()
    // Return focus to the element that opened the dialog
    setTimeout(() => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }, 10)
  }, [onClose])

  // Handle escape key, click outside, and focus trapping
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
      return
    }
    
    // Focus trap: keep Tab cycling within the dialog
    if (e.key === 'Tab' && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }, [handleClose])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }, [handleClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, handleKeyDown, handleClickOutside])

  const handleApply = () => {
    if (url.trim()) {
      // Ensure URL has protocol
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl, target: '_blank', rel: 'noopener noreferrer' })
        .run()
    }
    handleClose()
  }

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run()
    handleClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleApply()
  }

  if (!isOpen) {
    return null
  }

  const hasExistingLink = editor.isActive('link')

  return (
    <>
      <div className="link-dialog-overlay" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="link-dialog"
        role="dialog"
        aria-labelledby="link-dialog-title"
        aria-modal="true"
      >
        <h2 id="link-dialog-title" className="link-dialog-title">
          {hasExistingLink ? 'Edit Link' : 'Insert Link'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="link-url" className="form-label">
              URL
            </label>
            <input
              ref={inputRef}
              type="text"
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              placeholder="https://example.com"
            />
          </div>

          <div className="link-dialog-actions">
            {hasExistingLink && (
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-secondary"
              >
                Remove Link
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
