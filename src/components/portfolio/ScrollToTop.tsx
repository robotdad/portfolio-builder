'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    // Don't scroll to top when navigating with a hash fragment (e.g., #image-xxx).
    // Hash navigation means the user wants to land at a specific element, not the top.
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}
