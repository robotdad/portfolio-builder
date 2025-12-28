# Foundation: Theme System

This document specifies the theme system architecture for the portfolio builder. All components must use this system for consistent theming and theme switching.

## Architecture Overview

```
CSS Custom Properties (tokens)
         ↓
Tailwind Config (maps tokens to utilities)
         ↓
Components (use Tailwind classes)
         ↓
Theme Switcher (changes data-theme attribute)
```

## Token Naming Convention

All CSS custom properties follow this pattern:

```
--{category}-{name}[-{variant}]
```

Categories:
- `color` - All colors
- `radius` - Border radius values
- `shadow` - Box shadows
- `font` - Font families
- `spacing` - Spacing overrides (use Tailwind defaults where possible)

## CSS Custom Properties Definition

### Base Tokens (in `globals.css`)

```css
:root {
  /* Colors - Light theme (default) */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: #dbeafe;

  --color-secondary: #8b5cf6;
  --color-secondary-hover: #7c3aed;

  --color-background: #ffffff;
  --color-surface: #f9fafb;
  --color-surface-hover: #f3f4f6;

  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-text-inverted: #ffffff;

  --color-border: #e5e7eb;
  --color-border-focus: #3b82f6;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Radius */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Fonts */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-serif: ui-serif, Georgia, serif;
  --font-mono: ui-monospace, monospace;
}

/* Dark theme */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
  --color-primary-light: #1e3a5f;

  --color-secondary: #a78bfa;
  --color-secondary-hover: #8b5cf6;

  --color-background: #111827;
  --color-surface: #1f2937;
  --color-surface-hover: #374151;

  --color-text: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-text-inverted: #1f2937;

  --color-border: #374151;
  --color-border-focus: #60a5fa;

  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

## Portfolio Themes

Beyond light/dark admin UI, portfolios have their own themes. These define the published site appearance.

### Theme Structure

```typescript
interface PortfolioTheme {
  id: string;
  name: string;
  description: string;

  tokens: {
    // Colors
    colorPrimary: string;
    colorSecondary: string;
    colorBackground: string;
    colorSurface: string;
    colorText: string;
    colorTextMuted: string;
    colorBorder: string;
    colorAccent: string;

    // Typography
    fontHeading: string;
    fontBody: string;

    // Spacing & Layout
    radiusBase: string;
    containerMaxWidth: string;

    // Component-specific
    navBackground: string;
    navText: string;
    footerBackground: string;
    footerText: string;
  };

  // For admin UI theme preview
  preview: {
    thumbnail: string;
    colors: string[]; // Dominant colors for quick visual
  };
}
```

### Included Themes

#### Modern Minimal

```typescript
const modernMinimal: PortfolioTheme = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'Clean lines, generous whitespace, subtle typography',
  tokens: {
    colorPrimary: '#000000',
    colorSecondary: '#666666',
    colorBackground: '#ffffff',
    colorSurface: '#fafafa',
    colorText: '#1a1a1a',
    colorTextMuted: '#666666',
    colorBorder: '#e5e5e5',
    colorAccent: '#0066cc',
    fontHeading: '"Inter", system-ui, sans-serif',
    fontBody: '"Inter", system-ui, sans-serif',
    radiusBase: '4px',
    containerMaxWidth: '1200px',
    navBackground: '#ffffff',
    navText: '#1a1a1a',
    footerBackground: '#fafafa',
    footerText: '#666666',
  },
  preview: {
    thumbnail: '/themes/modern-minimal.png',
    colors: ['#ffffff', '#000000', '#666666'],
  },
};
```

#### Photography Focus

```typescript
const photographyFocus: PortfolioTheme = {
  id: 'photography-focus',
  name: 'Photography Focus',
  description: 'Dark background to make images pop, minimal UI chrome',
  tokens: {
    colorPrimary: '#ffffff',
    colorSecondary: '#a0a0a0',
    colorBackground: '#0a0a0a',
    colorSurface: '#141414',
    colorText: '#ffffff',
    colorTextMuted: '#a0a0a0',
    colorBorder: '#2a2a2a',
    colorAccent: '#ffffff',
    fontHeading: '"Playfair Display", Georgia, serif',
    fontBody: '"Source Sans Pro", system-ui, sans-serif',
    radiusBase: '0px',
    containerMaxWidth: '1400px',
    navBackground: 'transparent',
    navText: '#ffffff',
    footerBackground: '#0a0a0a',
    footerText: '#a0a0a0',
  },
  preview: {
    thumbnail: '/themes/photography-focus.png',
    colors: ['#0a0a0a', '#ffffff', '#a0a0a0'],
  },
};
```

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Admin UI colors (from CSS variables)
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          inverted: 'var(--color-text-inverted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          focus: 'var(--color-border-focus)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

        // Portfolio theme colors (for published sites)
        // These are set dynamically via style attribute on the portfolio wrapper
        portfolio: {
          primary: 'var(--portfolio-primary)',
          secondary: 'var(--portfolio-secondary)',
          background: 'var(--portfolio-background)',
          surface: 'var(--portfolio-surface)',
          text: 'var(--portfolio-text)',
          'text-muted': 'var(--portfolio-text-muted)',
          border: 'var(--portfolio-border)',
          accent: 'var(--portfolio-accent)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
};
```

## Theme Context (React)

### Admin Theme Context

For light/dark mode in the admin interface:

```typescript
// src/hooks/useAdminTheme.ts
import { createContext, useContext, useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark' | 'system';

interface AdminThemeContextType {
  theme: AdminTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as AdminTheme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);

    const resolve = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const resolved = resolve();
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return context;
}
```

### Portfolio Theme Context

For applying portfolio themes to the editor and published sites:

```typescript
// src/hooks/usePortfolioTheme.ts
import { createContext, useContext, useMemo } from 'react';
import { PortfolioTheme } from '@/types';
import { themes } from '@/lib/themes';

interface PortfolioThemeContextType {
  theme: PortfolioTheme;
  cssVariables: Record<string, string>;
}

const PortfolioThemeContext = createContext<PortfolioThemeContextType | null>(null);

export function PortfolioThemeProvider({
  themeId,
  children,
}: {
  themeId: string;
  children: React.ReactNode;
}) {
  const theme = themes.find((t) => t.id === themeId) || themes[0];

  const cssVariables = useMemo(() => ({
    '--portfolio-primary': theme.tokens.colorPrimary,
    '--portfolio-secondary': theme.tokens.colorSecondary,
    '--portfolio-background': theme.tokens.colorBackground,
    '--portfolio-surface': theme.tokens.colorSurface,
    '--portfolio-text': theme.tokens.colorText,
    '--portfolio-text-muted': theme.tokens.colorTextMuted,
    '--portfolio-border': theme.tokens.colorBorder,
    '--portfolio-accent': theme.tokens.colorAccent,
    '--portfolio-font-heading': theme.tokens.fontHeading,
    '--portfolio-font-body': theme.tokens.fontBody,
    '--portfolio-radius': theme.tokens.radiusBase,
    '--portfolio-container-max-width': theme.tokens.containerMaxWidth,
  }), [theme]);

  return (
    <PortfolioThemeContext.Provider value={{ theme, cssVariables }}>
      <div style={cssVariables as React.CSSProperties}>
        {children}
      </div>
    </PortfolioThemeContext.Provider>
  );
}

export function usePortfolioTheme() {
  const context = useContext(PortfolioThemeContext);
  if (!context) throw new Error('usePortfolioTheme must be used within PortfolioThemeProvider');
  return context;
}
```

## Component Usage Examples

### Admin UI Component

```tsx
// Uses Tailwind classes that reference CSS variables
function AdminButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-primary hover:bg-primary-hover text-text-inverted px-4 py-2 rounded transition-colors"
    >
      {children}
    </button>
  );
}
```

### Portfolio Component

```tsx
// Uses portfolio-specific Tailwind classes
function PortfolioHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-heading text-portfolio-text text-4xl mb-4">
      {children}
    </h1>
  );
}
```

### Theme Toggle Component

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useAdminTheme();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded',
          theme === 'light' ? 'bg-primary text-text-inverted' : 'bg-surface'
        )}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded',
          theme === 'dark' ? 'bg-primary text-text-inverted' : 'bg-surface'
        )}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'p-2 rounded',
          theme === 'system' ? 'bg-primary text-text-inverted' : 'bg-surface'
        )}
      >
        System
      </button>
    </div>
  );
}
```

## Theme Switching Behavior

### Admin Theme (Light/Dark)

1. User selects light, dark, or system
2. Preference stored in localStorage
3. `data-theme` attribute set on `<html>`
4. CSS variables update instantly
5. All components re-render with new values

### Portfolio Theme

1. User selects a portfolio theme in the editor
2. Theme ID stored in database with site settings
3. `PortfolioThemeProvider` wraps editor canvas and published site
4. CSS variables injected via style attribute
5. Components use `portfolio-*` Tailwind classes

## File Structure

```
src/
├── styles/
│   └── globals.css           # CSS custom properties definitions
├── lib/
│   └── themes.ts             # Portfolio theme definitions
├── hooks/
│   ├── useAdminTheme.ts      # Admin light/dark context
│   └── usePortfolioTheme.ts  # Portfolio theme context
└── components/
    └── ThemeToggle.tsx       # Admin theme switcher UI
```

## Deliverables Checklist

When implementing the theme system, ensure:

- [ ] CSS custom properties defined in `globals.css`
- [ ] Tailwind config maps variables to utility classes
- [ ] `AdminThemeProvider` wraps admin layout
- [ ] `PortfolioThemeProvider` wraps editor canvas
- [ ] Theme preference persists in localStorage (admin) and database (portfolio)
- [ ] Theme toggle works without page reload
- [ ] Both portfolio themes (Modern Minimal, Photography Focus) are defined
- [ ] Hover states work correctly (using Tailwind `hover:` variants)

## Testing

Verify theme system works by:

1. Toggle admin theme - UI should update instantly
2. Switch portfolio themes in editor - canvas should update
3. Check hover states work on buttons and links
4. Verify localStorage persists admin preference across page loads
5. Confirm no flash of wrong theme on page load
