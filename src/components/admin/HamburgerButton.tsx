'use client'

import React from 'react'
import { Button } from '@/components/ui'

export interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  className?: string
}

/**
 * HamburgerButton - Accessible hamburger menu button
 * 
 * Features:
 * - 44px touch target (minimum WCAG) via Button primitive
 * - 24px icon size
 * - aria-expanded state
 * - aria-controls linking to drawer
 * - Dynamic aria-label
 * - Three horizontal lines (hamburger) using inline SVG
 */
export function HamburgerButton({ isOpen, onClick, className = '' }: HamburgerButtonProps) {
  return (
    <Button
      variant="ghost"
      iconOnly
      size="md"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls="mobile-drawer"
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      className={className}
      data-testid="hamburger-btn"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </Button>
  )
}

export default HamburgerButton
