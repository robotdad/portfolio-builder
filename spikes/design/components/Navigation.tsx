'use client';

import React from 'react';
import Button from './Button';

interface NavigationProps {
  theme: 'modern' | 'classic' | 'bold';
  onThemeChange: (theme: 'modern' | 'classic' | 'bold') => void;
}

export default function Navigation({ theme, onThemeChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        height: '64px',
      }}>
        <div style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 var(--mobile-padding)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-heading-weight)',
            color: 'var(--color-text-primary)',
          }}>
            Sarah Chen
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-6)',
            alignItems: 'center',
          }}
          className="hidden md:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color var(--duration-quick) var(--ease-smooth)',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {link.label}
              </a>
            ))}
            
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
                onClick={() => onThemeChange('modern')}
              >
                Modern
              </Button>
              <Button 
                variant={theme === 'classic' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => onThemeChange('classic')}
              >
                Classic
              </Button>
              <Button 
                variant={theme === 'bold' ? 'primary' : 'ghost'}
                size="small"
                onClick={() => onThemeChange('bold')}
              >
                Bold
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            right: 0,
            bottom: 0,
            width: '80%',
            maxWidth: '320px',
            background: 'var(--color-background)',
            boxShadow: '-4px 0 12px hsla(0, 0%, 0%, 0.1)',
            padding: 'var(--space-5)',
            zIndex: 99,
            animation: 'slideIn 250ms var(--ease-out)',
          }}
          className="md:hidden"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
          }}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-h4)',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  padding: 'var(--space-4) 0',
                  borderBottom: '1px solid var(--color-border)',
                  lineHeight: 2.5,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'hsla(0, 0%, 0%, 0.3)',
            zIndex: 98,
          }}
          className="md:hidden"
        />
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
