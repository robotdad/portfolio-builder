'use client';

/**
 * Navigation Component
 * 
 * Dynamic navigation that adapts to portfolio structure:
 * - Logo/name links to landing page
 * - Category links (direct if ≤5, dropdown if >5)
 * - Theme/template switcher (right side)
 * - Mobile hamburger menu
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePortfolio } from '@/context/PortfolioContext';
import Button from '../Button';

export default function Navigation() {
  const { portfolio, theme, template, showAbout, setTheme, setTemplate, setShowAbout } = usePortfolio();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showDirectLinks = portfolio.categories.length <= 5;

  const navStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    height: '64px',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: 'var(--max-content-width)',
    margin: '0 auto',
    padding: '0 var(--desktop-padding)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyles: React.CSSProperties = {
    fontFamily: 'var(--font-heading)',
    fontSize: 'var(--font-size-h4)',
    fontWeight: 'var(--font-heading-weight)',
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    transition: 'color var(--duration-quick) var(--ease-smooth)',
  };

  const linkStyles: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-body)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    padding: 'var(--space-2) var(--space-3)',
    transition: 'color var(--duration-quick) var(--ease-smooth)',
  };

  return (
    <>
      <nav style={navStyles}>
        <div style={containerStyles}>
          {/* Logo */}
          <Link href="/" style={logoStyles} className="nav-logo">
            {portfolio.name}
          </Link>

          {/* Desktop Navigation */}
          <div 
            style={{ 
              display: 'none',
              gap: 'var(--space-6)',
              alignItems: 'center',
            }}
            className="desktop-nav"
          >
            {/* Category Links */}
            {showDirectLinks ? (
              // Direct links for ≤5 categories
              portfolio.categories.map(category => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  style={linkStyles}
                  className="nav-link"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              // Dropdown for >5 categories
              <div style={{ position: 'relative' }}>
                <button style={{ ...linkStyles, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Work ▼
                </button>
                {/* Dropdown implementation - Phase 2 */}
              </div>
            )}

            {/* Theme Switcher */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              marginLeft: 'var(--space-4)',
              paddingLeft: 'var(--space-4)',
              borderLeft: '1px solid var(--color-border)',
            }}>
              <Button
                variant={theme === 'modern' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setTheme('modern')}
              >
                Modern
              </Button>
              <Button
                variant={theme === 'classic' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setTheme('classic')}
              >
                Classic
              </Button>
              <Button
                variant={theme === 'bold' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setTheme('bold')}
              >
                Bold
              </Button>
            </div>

            {/* Template Switcher */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              paddingLeft: 'var(--space-4)',
              borderLeft: '1px solid var(--color-border)',
            }}>
              <Button
                variant={template === 'featured-grid' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setTemplate('featured-grid')}
              >
                Grid
              </Button>
              <Button
                variant={template === 'clean-minimal' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setTemplate('clean-minimal')}
              >
                Minimal
              </Button>
            </div>

            {/* About Toggle */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-2)',
              paddingLeft: 'var(--space-4)',
              borderLeft: '1px solid var(--color-border)',
            }}>
              <Button
                variant={showAbout ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setShowAbout(!showAbout)}
              >
                About
              </Button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              width: 'var(--touch-min)',
              height: 'var(--touch-min)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
            }}
            className="mobile-hamburger"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '320px',
              background: 'var(--color-background)',
              boxShadow: '-4px 0 12px hsla(0, 0%, 0%, 0.1)',
              padding: 'var(--space-5)',
              zIndex: 999,
              overflowY: 'auto',
            }}
            className="mobile-menu"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                width: 'var(--touch-min)',
                height: 'var(--touch-min)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Categories */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              marginTop: 'var(--space-8)',
            }}>
              {portfolio.categories.map(category => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--font-size-h4)',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    padding: 'var(--space-4) 0',
                    borderBottom: '1px solid var(--color-border)',
                    lineHeight: 2.5,
                    display: 'block',
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            {/* Theme Switcher */}
            <div style={{ marginTop: 'var(--space-8)' }}>
              <div style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Theme
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button
                  variant={theme === 'modern' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('modern')}
                >
                  Modern
                </Button>
                <Button
                  variant={theme === 'classic' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('classic')}
                >
                  Classic
                </Button>
                <Button
                  variant={theme === 'bold' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('bold')}
                >
                  Bold
                </Button>
              </div>
            </div>

            {/* Template Switcher */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Layout
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button
                  variant={template === 'featured-grid' ? 'primary' : 'secondary'}
                  onClick={() => setTemplate('featured-grid')}
                >
                  Featured Grid
                </Button>
                <Button
                  variant={template === 'clean-minimal' ? 'primary' : 'secondary'}
                  onClick={() => setTemplate('clean-minimal')}
                >
                  Clean Minimal
                </Button>
              </div>
            </div>

            {/* About Toggle */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <div style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Content
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button
                  variant={showAbout ? 'primary' : 'secondary'}
                  onClick={() => setShowAbout(!showAbout)}
                >
                  {showAbout ? 'Hide About' : 'Show About'}
                </Button>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'hsla(0, 0%, 0%, 0.4)',
              zIndex: 998,
            }}
          />
        </>
      )}

      <style jsx>{`
        /* Desktop navigation */
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-hamburger {
            display: none !important;
          }
        }

        /* Mobile hamburger */
        @media (max-width: 767px) {
          .mobile-hamburger {
            display: flex !important;
          }
        }

        /* Nav link hover */
        .nav-link:hover {
          color: var(--color-text-primary);
        }

        /* Logo hover */
        .nav-logo:hover {
          color: var(--color-accent);
        }

        /* Mobile menu animation */
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .mobile-menu {
          animation: slideIn 250ms var(--ease-out);
        }
      `}</style>
    </>
  );
}
