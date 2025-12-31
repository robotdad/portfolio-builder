'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavPage {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  showInNav: boolean
}

interface NavigationProps {
  portfolioSlug: string
  portfolioName: string
  pages: NavPage[]
  theme: 'modern-minimal' | 'classic-elegant' | 'bold-editorial'
}

export function Navigation({ portfolioSlug, portfolioName, pages, theme }: NavigationProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Filter to only pages shown in nav
  const navPages = pages.filter(p => p.showInNav)

  // Get current page slug from pathname
  const currentSlug = pathname.split('/').slice(2).join('/') || ''

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMenuOpen])

  // Get href for a page
  const getPageHref = (page: NavPage) => {
    if (page.isHomepage || page.slug === '') {
      return `/${portfolioSlug}`
    }
    return `/${portfolioSlug}/${page.slug}`
  }

  // Check if page is active
  const isPageActive = (page: NavPage) => {
    if (page.isHomepage || page.slug === '') {
      return currentSlug === ''
    }
    return currentSlug === page.slug
  }

  // If only one page, don't show navigation
  if (navPages.length <= 1) {
    return null
  }

  return (
    <nav className={`portfolio-nav portfolio-nav--${theme}`} role="navigation" aria-label="Portfolio navigation">
      {/* Desktop Navigation */}
      <div className="portfolio-nav-desktop">
        <Link href={`/${portfolioSlug}`} className="portfolio-nav-logo">
          {portfolioName}
        </Link>
        <ul className="portfolio-nav-list" role="menubar">
          {navPages.map(page => (
            <li key={page.id} role="none">
              <Link
                href={getPageHref(page)}
                className={`portfolio-nav-link ${isPageActive(page) ? 'portfolio-nav-link--active' : ''}`}
                role="menuitem"
                aria-current={isPageActive(page) ? 'page' : undefined}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="portfolio-nav-mobile">
        <Link href={`/${portfolioSlug}`} className="portfolio-nav-logo">
          {portfolioName}
        </Link>
        <button
          ref={buttonRef}
          type="button"
          className={`portfolio-nav-hamburger ${isMenuOpen ? 'portfolio-nav-hamburger--open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className="portfolio-nav-hamburger-line" />
          <span className="portfolio-nav-hamburger-line" />
          <span className="portfolio-nav-hamburger-line" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="portfolio-nav-overlay" 
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={menuRef}
        id="mobile-nav-menu"
        className={`portfolio-nav-menu ${isMenuOpen ? 'portfolio-nav-menu--open' : ''}`}
        role="menu"
        aria-hidden={!isMenuOpen}
      >
        <ul className="portfolio-nav-menu-list">
          {navPages.map(page => (
            <li key={page.id} role="none">
              <Link
                href={getPageHref(page)}
                className={`portfolio-nav-menu-link ${isPageActive(page) ? 'portfolio-nav-menu-link--active' : ''}`}
                role="menuitem"
                aria-current={isPageActive(page) ? 'page' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
