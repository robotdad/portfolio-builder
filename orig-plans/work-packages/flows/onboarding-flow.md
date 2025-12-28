# Flow: Onboarding Flow

A self-contained work package for implementing the new user journey from registration to first portfolio.

## Overview

Implement the complete onboarding experience that takes a new user from account creation through theme selection, basic site setup, and into the editor with their first page ready. Target: Professional portfolio created in under 30 minutes.

## Prerequisites

- `foundation/theme-system.md` - Theme definitions and providers
- `foundation/data-models.md` - User, Site, Page schemas
- `capabilities/auth-system.md` - Registration, login, session management

## Deliverables

1. Landing/marketing page
2. Registration page with validation
3. Login page with redirect handling
4. Welcome wizard (first-time users)
5. Theme selection interface
6. Basic site setup form
7. Dashboard for returning users
8. Onboarding progress tracking

---

## 1. Route Structure

```
/                    # Landing/marketing page
/login               # Login form
/register            # Registration form
/welcome             # First-time user wizard
/welcome/theme       # Theme selection step
/welcome/setup       # Site details step
/dashboard           # Returning user home
/editor/[siteId]/[pageId]  # Main editor (destination)
```

---

## 2. Landing Page

Create `src/app/page.tsx`:

```typescript
import Link from 'next/link';
import { validateSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  // Redirect authenticated users to dashboard
  const { user } = await validateSession();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-surface">
      {/* Hero */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
          Build Your Portfolio in Minutes
        </h1>
        <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
          Create a stunning portfolio website without code. Perfect for costume designers,
          fashion professionals, and creative artists.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-primary hover:bg-primary-hover text-text-inverted px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="bg-surface hover:bg-surface-hover text-text px-8 py-3 rounded-lg font-medium border border-border transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Features grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Mobile-First Editing"
            description="Update your portfolio from anywhere. Full editing on your phone, not just viewing."
            icon="smartphone"
          />
          <FeatureCard
            title="Professional Themes"
            description="Curated themes designed for creative professionals. Look polished from day one."
            icon="palette"
          />
          <FeatureCard
            title="Instant Publishing"
            description="Preview your changes, then publish with one click. No technical setup required."
            icon="rocket"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-surface p-6 rounded-lg">
      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
        {/* Icon placeholder */}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-muted">{description}</p>
    </div>
  );
}
```

---

## 3. Registration Page

Create `src/app/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(formData.email, formData.password, formData.name);
      // New users go to welcome wizard
      router.push('/welcome');
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Registration failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-text-muted mt-2">
            Start building your portfolio in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-lg">
          {errors.form && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6">
              {errors.form}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                className={errors.password ? 'border-error' : ''}
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-error' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-error text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-center text-text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

## 4. Login Page

Create `src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-text-muted mt-2">
            Sign in to continue to your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg shadow-lg">
          {error && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>

          <p className="text-center text-text-muted mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

## 5. Welcome Wizard

### Step 1: Welcome Screen

Create `src/app/welcome/page.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✨</span>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Welcome, {user?.name?.split(' ')[0] || 'there'}!
          </h1>

          <p className="text-text-muted text-lg mb-8">
            Let's create your professional portfolio. This will only take a few minutes.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => router.push('/welcome/theme')}
              className="w-full py-6 text-lg"
            >
              Let's Get Started
            </Button>

            <p className="text-sm text-text-muted">
              You can always change these settings later
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### Step 2: Theme Selection

Create `src/app/welcome/theme/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';

export default function ThemeSelectionPage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedTheme) {
      // Store selection in session/localStorage for next step
      sessionStorage.setItem('onboarding_theme', selectedTheme);
      router.push('/welcome/setup');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border px-4 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Choose Your Theme</h1>
              <p className="text-text-muted text-sm">
                Pick a style that matches your aesthetic
              </p>
            </div>
            <Button onClick={handleContinue} disabled={!selectedTheme}>
              Continue
            </Button>
          </div>
        </header>

        {/* Theme grid */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                isPreviewing={previewTheme === theme.id}
                onSelect={() => setSelectedTheme(theme.id)}
                onPreview={() => setPreviewTheme(theme.id)}
              />
            ))}
          </div>
        </main>

        {/* Progress indicator */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
          <div className="container mx-auto flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-border" />
          </div>
        </footer>

        {/* Theme preview modal */}
        {previewTheme && (
          <ThemePreviewModal
            themeId={previewTheme}
            onClose={() => setPreviewTheme(null)}
            onSelect={() => {
              setSelectedTheme(previewTheme);
              setPreviewTheme(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

interface ThemeCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    preview: {
      thumbnail: string;
      colors: string[];
    };
  };
  isSelected: boolean;
  isPreviewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function ThemeCard({
  theme,
  isSelected,
  onSelect,
  onPreview,
}: ThemeCardProps) {
  return (
    <div
      className={cn(
        'border-2 rounded-lg overflow-hidden cursor-pointer transition-all',
        isSelected
          ? 'border-primary shadow-lg'
          : 'border-border hover:border-primary/50'
      )}
      onClick={onSelect}
    >
      {/* Theme preview image */}
      <div className="aspect-video bg-surface relative">
        {/* Placeholder for theme thumbnail */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.preview.colors[0]}, ${theme.preview.colors[1] || theme.preview.colors[0]})`,
          }}
        >
          <span className="text-white/75 text-sm">Preview</span>
        </div>

        {/* Preview button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-3 py-1 rounded hover:bg-black/70"
        >
          Full Preview
        </button>
      </div>

      {/* Theme info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{theme.name}</h3>
          {isSelected && (
            <span className="text-primary text-sm font-medium">Selected</span>
          )}
        </div>
        <p className="text-text-muted text-sm">{theme.description}</p>

        {/* Color swatches */}
        <div className="flex gap-2 mt-3">
          {theme.preview.colors.map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemePreviewModal({
  themeId,
  onClose,
  onSelect,
}: {
  themeId: string;
  onClose: () => void;
  onSelect: () => void;
}) {
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{theme.name} Preview</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            ✕
          </button>
        </div>

        {/* Preview content */}
        <div className="aspect-video bg-surface">
          {/* Theme preview iframe or component would go here */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: theme.tokens.colorBackground,
              color: theme.tokens.colorText,
            }}
          >
            <div className="text-center p-8">
              <h1 style={{ fontFamily: theme.tokens.fontHeading }} className="text-4xl mb-4">
                Sample Portfolio
              </h1>
              <p style={{ fontFamily: theme.tokens.fontBody }} className="text-lg opacity-75">
                This is how your portfolio will look with this theme
              </p>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSelect}>
            Use This Theme
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Site Setup

Create `src/app/welcome/setup/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { generateSlug } from '@/lib/id';

export default function SiteSetupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    slug: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  // Get theme from previous step
  const [themeId, setThemeId] = useState('modern-minimal');

  useEffect(() => {
    const savedTheme = sessionStorage.getItem('onboarding_theme');
    if (savedTheme) {
      setThemeId(savedTheme);
    }
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, slugEdited]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Portfolio title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Create site via API
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          tagline: formData.tagline || undefined,
          slug: formData.slug,
          themeId,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create site');
      }

      // Clear onboarding session data
      sessionStorage.removeItem('onboarding_theme');

      // Mark onboarding as complete
      localStorage.setItem('onboarding_complete', 'true');

      // Redirect to editor with the new site's homepage
      const site = data.data;
      const homePage = site.pages?.find((p: any) => p.isHomepage);

      if (homePage) {
        router.push(`/editor/${site.id}/${homePage.id}`);
      } else {
        router.push(`/dashboard`);
      }
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Failed to create site',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border px-4 py-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-semibold">Set Up Your Portfolio</h1>
            <p className="text-text-muted text-sm">
              Tell us about your portfolio
            </p>
          </div>
        </header>

        {/* Form */}
        <main className="container mx-auto px-4 py-8 max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="bg-error/10 text-error px-4 py-3 rounded-lg">
                {errors.form}
              </div>
            )}

            <div>
              <Label htmlFor="title">Portfolio Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sarah Chen - Costume Designer"
                className={errors.title ? 'border-error' : ''}
              />
              {errors.title && (
                <p className="text-error text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-text-muted text-sm mt-1">
                This will appear in browser tabs and search results
              </p>
            </div>

            <div>
              <Label htmlFor="tagline">Tagline (Optional)</Label>
              <Textarea
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g., Theatre & Film Costume Design"
                rows={2}
              />
              <p className="text-text-muted text-sm mt-1">
                A short description of what you do
              </p>
            </div>

            <div>
              <Label htmlFor="slug">Portfolio URL *</Label>
              <div className="flex items-center">
                <span className="text-text-muted bg-surface px-3 py-2 rounded-l-lg border border-r-0 border-border text-sm">
                  yoursite.com/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setFormData({ ...formData, slug: e.target.value.toLowerCase() });
                  }}
                  className={cn('rounded-l-none', errors.slug ? 'border-error' : '')}
                  placeholder="my-portfolio"
                />
              </div>
              {errors.slug && (
                <p className="text-error text-sm mt-1">{errors.slug}</p>
              )}
            </div>

            {/* Selected theme reminder */}
            <div className="bg-surface p-4 rounded-lg">
              <p className="text-sm text-text-muted">
                Selected theme:{' '}
                <span className="font-medium text-text">
                  {themes.find((t) => t.id === themeId)?.name || 'Modern Minimal'}
                </span>
              </p>
              <button
                type="button"
                onClick={() => router.push('/welcome/theme')}
                className="text-primary text-sm hover:underline mt-1"
              >
                Change theme
              </button>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Portfolio...' : 'Create My Portfolio'}
            </Button>
          </form>
        </main>

        {/* Progress indicator */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
          <div className="container mx-auto flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';
```

---

## 6. Dashboard (Returning Users)

Create `src/app/dashboard/page.tsx`:

```typescript
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const { user } = await validateSession();

  if (!user) {
    redirect('/login');
  }

  // Get user's sites
  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: {
      pages: {
        where: { isHomepage: true },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // If no sites, redirect to onboarding
  if (sites.length === 0) {
    redirect('/welcome');
  }

  // For single-site users, could redirect directly to editor
  const primarySite = sites[0];
  const homepage = primarySite.pages[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-text-muted">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} homepage={site.pages[0]} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 p-6 bg-surface rounded-lg">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {homepage && (
              <Link href={`/editor/${primarySite.id}/${homepage.id}`}>
                <Button>Edit Portfolio</Button>
              </Link>
            )}
            {primarySite.publishedAt && (
              <Link href={`/${primarySite.slug}`} target="_blank">
                <Button variant="outline">View Live Site</Button>
              </Link>
            )}
            <Link href={`/preview/${primarySite.id}/${homepage?.slug || ''}`} target="_blank">
              <Button variant="outline">Preview Draft</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function SiteCard({
  site,
  homepage,
}: {
  site: {
    id: string;
    title: string;
    slug: string;
    publishedAt: Date | null;
    updatedAt: Date;
  };
  homepage?: { id: string; slug: string };
}) {
  return (
    <div className="bg-surface p-6 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{site.title}</h3>
          <p className="text-text-muted text-sm">/{site.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          {site.publishedAt ? (
            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">
              Published
            </span>
          ) : (
            <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">
              Draft
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
        <span>Last edited: {formatDate(site.updatedAt)}</span>
        {site.publishedAt && (
          <span>Published: {formatDate(site.publishedAt)}</span>
        )}
      </div>

      {homepage && (
        <div className="mt-4">
          <Link href={`/editor/${site.id}/${homepage.id}`}>
            <Button size="sm">Edit</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
```

---

## 7. Onboarding Detection Hook

Create `src/hooks/useOnboarding.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface OnboardingState {
  isComplete: boolean;
  currentStep: 'welcome' | 'theme' | 'setup' | 'complete';
  hasSites: boolean | null;
}

export function useOnboarding() {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isComplete: false,
    currentStep: 'welcome',
    hasSites: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }

    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
    const savedTheme = sessionStorage.getItem('onboarding_theme');

    // Check if user has any sites
    fetch('/api/sites', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const hasSites = data.data?.sites?.length > 0;

        let currentStep: OnboardingState['currentStep'] = 'welcome';

        if (hasSites || onboardingComplete) {
          currentStep = 'complete';
        } else if (savedTheme) {
          currentStep = 'setup';
        }

        setState({
          isComplete: hasSites || onboardingComplete,
          currentStep,
          hasSites,
        });
        setIsLoading(false);
      })
      .catch(() => {
        setState((prev) => ({ ...prev, hasSites: false }));
        setIsLoading(false);
      });
  }, [user, authLoading]);

  return { ...state, isLoading };
}
```

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Registration
│   ├── dashboard/page.tsx          # Returning user dashboard
│   └── welcome/
│       ├── page.tsx                # Welcome step
│       ├── theme/page.tsx          # Theme selection
│       └── setup/page.tsx          # Site setup
├── hooks/
│   └── useOnboarding.ts            # Onboarding state tracking
├── lib/
│   ├── themes.ts                   # Theme definitions (from theme-system.md)
│   └── id.ts                       # Slug generation
└── components/
    └── auth/
        └── ProtectedRoute.tsx      # Auth wrapper (from auth-system.md)
```

---

## User Personas Addressed

| Persona | Scenario | Implementation |
|---------|----------|----------------|
| Marcus (new freelancer) | First portfolio in 30 minutes | 3-step wizard, theme selection, quick setup |
| Sarah (experienced) | Quick mobile updates | Dashboard quick actions, direct to editor |
| Emma (veteran) | Complex organization needs | Theme supports hierarchy, dashboard overview |

---

## Deliverables Checklist

- [ ] Landing page with value proposition
- [ ] Registration page with password validation
- [ ] Login page with redirect support
- [ ] Welcome wizard - step 1 (greeting)
- [ ] Welcome wizard - step 2 (theme selection)
- [ ] Welcome wizard - step 3 (site setup)
- [ ] Theme preview modal
- [ ] Dashboard for returning users
- [ ] Site card with status indicators
- [ ] Onboarding progress tracking
- [ ] Mobile-responsive all pages
- [ ] Proper redirects based on auth/onboarding state

---

## Testing Checklist

1. **New user flow** - Register, complete wizard, land in editor
2. **Returning user** - Login, go directly to dashboard
3. **Theme selection** - Preview works, selection persists
4. **Slug generation** - Auto-generates from title, editable
5. **Validation** - Password requirements enforced
6. **Error handling** - Duplicate email, invalid slug shown
7. **Mobile** - All steps work on iPhone
8. **Progress** - Wizard resumes if interrupted
9. **Redirect** - Protected routes redirect to login
10. **Session** - Stays logged in across page refreshes

---

## Success Criteria

From user-success-scenarios.md:

- **Marcus**: Creates and publishes professional portfolio in under 30 minutes
- **Time to first edit**: < 5 minutes from registration to editor
- **Mobile onboarding**: Complete flow works on iPhone
- **Theme confidence**: Preview gives clear expectation of result
