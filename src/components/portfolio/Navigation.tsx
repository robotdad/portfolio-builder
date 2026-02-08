'use client'

/**
 * @module Navigation
 * @description Primary navigation component for portfolio sites with responsive
 * desktop/mobile layouts and theme-aware styling.
 *
 * ## Responsive Strategy
 *
 * - **Desktop:** Horizontal nav bar with logo, category links/dropdown, and page links.
 *   Categories appear as direct links when ≤5, or collapse into a dropdown when >5.
 * - **Mobile:** Hamburger button triggers a slide-in drawer panel rendered via React
 *   Portal to ensure proper z-index stacking and full-viewport coverage.
 *
 * ## Key Features
 *
 * - **Adaptive category display:** Automatically switches between inline links and
 *   dropdown menu based on `CATEGORY_DROPDOWN_THRESHOLD` (5 categories)
 * - **Active state detection:** Highlights current page/category based on URL path
 *   segments with `aria-current="page"` for screen readers
 * - **Theme variants:** Supports 'modern-minimal', 'classic-elegant', and
 *   'bold-editorial' themes via BEM modifier classes
 * - **Body scroll lock:** Prevents background scrolling when mobile menu is open
 *
 * ## Accessibility
 *
 * - Semantic `<nav>` element with `aria-label` for landmark identification
 * - ARIA menubar/menu roles for proper screen reader navigation
 * - `aria-expanded` and `aria-haspopup` on dropdown triggers
 * - `aria-controls` linking hamburger button to mobile menu panel
 * - Escape key closes open menus and returns focus to trigger button
 * - Click-outside detection for intuitive menu dismissal
 * - `aria-hidden` on decorative elements and closed menu panels
 *
 * @example
 * ```tsx
 * // Published site (links to /, /about, /portraits)
 * <Navigation
 *   portfolioSlug=""
 *   portfolioName="Jane Doe Photography"
 *   pages={[{ id: '1', title: 'About', slug: 'about', isHomepage: false, showInNav: true }]}
 *   categories={[{ id: '1', name: 'Portraits', slug: 'portraits' }]}
 *   theme="modern-minimal"
 * />
 * 
 * // Preview mode (links to /preview, /preview/about, /preview/portraits)
 * <Navigation
 *   portfolioSlug="preview"
 *   portfolioName="Jane Doe Photography"
 *   pages={[...]}
 *   categories={[...]}
 *   theme="modern-minimal"
 * />
 * ```
 */

import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'
import { MailIcon } from '@/components/shared/icons'
import { SearchOverlay } from '@/components/search/SearchOverlay'

export interface NavPage {
  id: string
  title: string
  slug: string
  isHomepage: boolean
  showInNav: boolean
}

export interface NavCategory {
  id: string
  name: string
  slug: string
}

interface NavigationProps {
  portfolioSlug: string
  portfolioName: string
  pages: NavPage[]
  categories?: NavCategory[]
  contactEmail?: string
  theme: 'modern-minimal' | 'classic-elegant' | 'bold-editorial'
}

const CATEGORY_DROPDOWN_THRESHOLD = 5

export function Navigation({ 
  portfolioSlug, 
  portfolioName, 
  pages, 
  categories = [],
  contactEmail,
  theme 
}: NavigationProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownButtonRef = useRef<HTMLButtonElement>(null)

  // Track when component is mounted for portal rendering using useSyncExternalStore
  const mounted = useSyncExternalStore(
    // Subscribe function (no-op since mount state never changes)
    () => () => {},
    // getSnapshot (client)
    () => true,
    // getServerSnapshot
    () => false
  )

  // Filter to only pages shown in nav
  const navPages = pages.filter(p => p.showInNav)

  // Get current path segments for active detection
  // For preview mode (/preview/category), skip the first segment
  // For published site (/category), use the first segment
  const pathSegments = pathname.split('/').filter(Boolean)
  const isPreviewMode = portfolioSlug === 'preview'
  const categorySegmentIndex = isPreviewMode ? 1 : 0
  const pageSegmentIndex = isPreviewMode ? 1 : 0
  const currentCategorySlug = pathSegments[categorySegmentIndex] || ''

  // Determine if we should show dropdown (>5 categories) or direct links
  const showCategoryDropdown = categories.length > CATEGORY_DROPDOWN_THRESHOLD

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
      
      // Close category dropdown when clicking outside
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isCategoryDropdownOpen) {
          setIsCategoryDropdownOpen(false)
          dropdownButtonRef.current?.focus()
        } else if (isMenuOpen) {
          setIsMenuOpen(false)
          buttonRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen, isCategoryDropdownOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMenuOpen])

  // Base path for links: empty for published site, '/preview' for preview mode
  const basePath = portfolioSlug ? `/${portfolioSlug}` : ''

  // Get href for a page
  const getPageHref = (page: NavPage) => {
    if (page.isHomepage || page.slug === '') {
      return basePath || '/'
    }
    return `${basePath}/${page.slug}`
  }

  // Get href for a category
  const getCategoryHref = (category: NavCategory) => {
    return `${basePath}/${category.slug}`
  }

  // Check if page is active
  const isPageActive = (page: NavPage) => {
    if (page.isHomepage || page.slug === '') {
      // Homepage is active when at root (/) or /preview
      return isPreviewMode 
        ? pathSegments.length === 1 && pathSegments[0] === 'preview'
        : pathSegments.length === 0
    }
    return pathSegments[pageSegmentIndex] === page.slug
  }

  // Check if category is active
  const isCategoryActive = (category: NavCategory) => {
    return currentCategorySlug === category.slug
  }

  // Check if any category is active (for dropdown trigger highlighting)
  const isAnyCategoryActive = categories.some(c => isCategoryActive(c))

  return (
    <nav className={`portfolio-nav portfolio-nav--${theme}`} role="navigation" aria-label="Portfolio navigation" data-testid="portfolio-nav">
      {/* Desktop Navigation */}
      <div className="portfolio-nav-desktop">
        <Link href={basePath || '/'} className="portfolio-nav-logo" data-testid="portfolio-nav-logo">
          {portfolioName}
        </Link>
        <ul className="portfolio-nav-list" role="menubar">
          {/* Categories - either as dropdown or direct links */}
          {categories.length > 0 && (
            showCategoryDropdown ? (
              // Dropdown for >5 categories
              <li role="none" className="portfolio-nav-dropdown-container">
                <button
                  ref={dropdownButtonRef}
                  type="button"
                  className={`portfolio-nav-link portfolio-nav-dropdown-trigger ${isAnyCategoryActive ? 'portfolio-nav-link--active' : ''}`}
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  aria-expanded={isCategoryDropdownOpen}
                  aria-haspopup="true"
                  role="menuitem"
                >
                  Work
                  <svg 
                    className={`portfolio-nav-dropdown-icon ${isCategoryDropdownOpen ? 'portfolio-nav-dropdown-icon--open' : ''}`}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                </button>
                {isCategoryDropdownOpen && (
                  <div 
                    ref={dropdownRef}
                    className="portfolio-nav-dropdown"
                    role="menu"
                  >
                    {categories.map(category => (
                      <Link
                        key={category.id}
                        href={getCategoryHref(category)}
                        className={`portfolio-nav-dropdown-item ${isCategoryActive(category) ? 'portfolio-nav-dropdown-item--active' : ''}`}
                        role="menuitem"
                        aria-current={isCategoryActive(category) ? 'page' : undefined}
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ) : (
              // Direct links for ≤5 categories
              categories.map(category => (
                <li key={category.id} role="none">
                  <Link
                    href={getCategoryHref(category)}
                    className={`portfolio-nav-link ${isCategoryActive(category) ? 'portfolio-nav-link--active' : ''}`}
                    role="menuitem"
                    aria-current={isCategoryActive(category) ? 'page' : undefined}
                  >
                    {category.name}
                  </Link>
                </li>
              ))
            )
          )}
          
          {/* Other nav pages (About, Resume, etc.) */}
          {navPages.filter(p => !p.isHomepage).map(page => (
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
          
          {/* Icon actions */}
          {contactEmail && (
            <li role="none">
              <IconButton
                icon={<MailIcon />}
                aria-label="Send email"
                variant="ghost"
                size="md"
                onClick={() => window.location.href = `mailto:${contactEmail}`}
                role="menuitem"
              />
            </li>
          )}
          <li role="none">
            <IconButton
              icon={<Search />}
              aria-label="Search portfolio"
              variant="ghost"
              size="md"
              onClick={() => setIsSearchOpen(true)}
              role="menuitem"
            />
          </li>
        </ul>
      </div>

      {/* Mobile Navigation */}
      <div className="portfolio-nav-mobile">
        <Link href={basePath || '/'} className="portfolio-nav-logo">
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

      {/* Mobile Menu - Rendered via Portal for proper z-index and full-height */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          {isMenuOpen && (
            <div
              className="portfolio-nav-overlay"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Menu Panel */}
          <div
            ref={menuRef}
            id="mobile-nav-menu"
            className={`portfolio-nav-menu portfolio-nav-menu--${theme} ${isMenuOpen ? 'portfolio-nav-menu--open' : ''}`}
            role="menu"
            aria-hidden={!isMenuOpen}
          >
            <ul className="portfolio-nav-menu-list">
              {/* Home link */}
              <li role="none">
                <Link
                  href={basePath || '/'}
                  className={`portfolio-nav-menu-link ${isPreviewMode ? (pathSegments.length === 1 && pathSegments[0] === 'preview') : pathSegments.length === 0 ? 'portfolio-nav-menu-link--active' : ''}`}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              
              {/* Categories */}
              {categories.length > 0 && (
                <>
                  <li className="portfolio-nav-menu-divider" role="separator">
                    <span>Work</span>
                  </li>
                  {categories.map(category => (
                    <li key={category.id} role="none">
                      <Link
                        href={getCategoryHref(category)}
                        className={`portfolio-nav-menu-link portfolio-nav-menu-link--indent ${isCategoryActive(category) ? 'portfolio-nav-menu-link--active' : ''}`}
                        role="menuitem"
                        aria-current={isCategoryActive(category) ? 'page' : undefined}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              
              {/* Other pages */}
              {navPages.filter(p => !p.isHomepage).length > 0 && (
                <>
                  <li className="portfolio-nav-menu-divider" role="separator" />
                  {navPages.filter(p => !p.isHomepage).map(page => (
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
                </>
              )}
              
              {/* Actions */}
              <li className="portfolio-nav-menu-divider" role="separator" />
              {contactEmail && (
                <li role="none">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="portfolio-nav-menu-link"
                    role="menuitem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MailIcon size={20} className="inline-block mr-2" />
                    Email
                  </a>
                </li>
              )}
              <li role="none">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="portfolio-nav-menu-link"
                  role="menuitem"
                >
                  <Search className="w-5 h-5 inline-block mr-2" />
                  Search
                </button>
              </li>
            </ul>
          </div>
        </>,
        document.body
      )}

      {/* Search Overlay */}
      {mounted && (
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          theme={theme}
        />
      )}
    </nav>
  )
}
