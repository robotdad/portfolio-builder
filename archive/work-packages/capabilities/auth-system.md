# Capability: Authentication System

A self-contained work package for implementing session-based authentication.

## Overview

Implement user registration, login, logout, and session management using secure HTTP-only cookies. No external auth providers - this is a simple, self-hosted solution.

## Prerequisites

- Foundation artifacts complete (data-models, api-contracts)
- Prisma schema with User and Session models
- Next.js 14+ App Router

## Deliverables

1. Database models (Prisma)
2. Password hashing utilities
3. Session management utilities
4. Auth API routes
5. Auth middleware
6. React hooks for auth state
7. Protected route wrapper

---

## 1. Database Schema

Add to `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastLogin DateTime?

  sessions  Session[]
  sites     Site[]
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  userAgent String?
  ipAddress String?

  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}
```

Run migration:
```bash
npx prisma migrate dev --name add-auth-models
```

---

## 2. Password Utilities

Create `src/lib/auth/password.ts`:

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password strength validation
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Package required:**
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

---

## 3. Session Management

Create `src/lib/auth/session.ts`:

```typescript
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION_DAYS = 7;
const SESSION_REFRESH_THRESHOLD_DAYS = 1;

// Generate cryptographically secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new session
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      token,
      userId,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  // Update user's lastLogin
  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });

  return token;
}

// Validate session and return user
export async function validateSession(): Promise<{
  user: { id: string; email: string; name: string | null } | null;
  session: { id: string; expiresAt: Date } | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { user: null, session: null };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or not found
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return { user: null, session: null };
  }

  // Refresh session if close to expiry
  const refreshThreshold = new Date();
  refreshThreshold.setDate(
    refreshThreshold.getDate() + SESSION_REFRESH_THRESHOLD_DAYS
  );

  if (session.expiresAt < refreshThreshold) {
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + SESSION_DURATION_DAYS);

    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt },
    });
  }

  return {
    user: session.user,
    session: { id: session.id, expiresAt: session.expiresAt },
  };
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {
    // Ignore if session doesn't exist
  });
}

// Delete all sessions for a user (logout everywhere)
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// Clean up expired sessions (call periodically)
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}
```

---

## 4. Cookie Utilities

Create `src/lib/auth/cookies.ts`:

```typescript
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION_DAYS = 7;

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // seconds
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}
```

---

## 5. API Response Helpers

Create `src/lib/api/response.ts`:

```typescript
import { NextResponse } from 'next/server';

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  error: APIError,
  status: number
): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

// Common errors
export const errors = {
  unauthorized: () =>
    errorResponse(
      { code: 'UNAUTHORIZED', message: 'Authentication required' },
      401
    ),
  forbidden: () =>
    errorResponse(
      { code: 'FORBIDDEN', message: 'Access denied' },
      403
    ),
  notFound: (resource = 'Resource') =>
    errorResponse(
      { code: 'NOT_FOUND', message: `${resource} not found` },
      404
    ),
  validation: (details: Record<string, string[]>) =>
    errorResponse(
      { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      400
    ),
  conflict: (message: string) =>
    errorResponse(
      { code: 'CONFLICT', message },
      409
    ),
  internal: () =>
    errorResponse(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      500
    ),
};
```

---

## 6. Auth API Routes

### POST /api/auth/register

Create `src/app/api/auth/register/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    const validationErrors: Record<string, string[]> = {};

    if (!email || typeof email !== 'string') {
      validationErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = ['Invalid email format'];
    }

    if (!password || typeof password !== 'string') {
      validationErrors.password = ['Password is required'];
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        validationErrors.password = passwordValidation.errors;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return errors.validation(validationErrors);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errors.conflict('An account with this email already exists');
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
    });

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined;
    const token = await createSession(user.id, userAgent, ip);

    // Set cookie
    await setSessionCookie(token);

    return successResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errors.internal();
  }
}
```

### POST /api/auth/login

Create `src/app/api/auth/login/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { setSessionCookie } from '@/lib/auth/cookies';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errors.validation({
        credentials: ['Email and password are required'],
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Use same message for security (don't reveal if email exists)
      return errors.unauthorized();
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return errors.unauthorized();
    }

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined;
    const token = await createSession(user.id, userAgent, ip);

    // Set cookie
    await setSessionCookie(token);

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errors.internal();
  }
}
```

### POST /api/auth/logout

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { deleteSession } from '@/lib/auth/session';
import { getSessionToken, clearSessionCookie } from '@/lib/auth/cookies';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();

    if (token) {
      await deleteSession(token);
    }

    await clearSessionCookie();

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return errors.internal();
  }
}
```

### GET /api/auth/me

Create `src/app/api/auth/me/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { successResponse, errors } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateSession();

    if (!user) {
      return errors.unauthorized();
    }

    // Get full user data
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!fullUser) {
      return errors.unauthorized();
    }

    return successResponse({
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      createdAt: fullUser.createdAt.toISOString(),
      lastLogin: fullUser.lastLogin?.toISOString() || null,
    });
  } catch (error) {
    console.error('Me error:', error);
    return errors.internal();
  }
}
```

### POST /api/auth/password

Create `src/app/api/auth/password/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth/session';
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth/password';
import { successResponse, errors } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateSession();

    if (!user) {
      return errors.unauthorized();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    const validationErrors: Record<string, string[]> = {};

    if (!currentPassword) {
      validationErrors.currentPassword = ['Current password is required'];
    }

    if (!newPassword) {
      validationErrors.newPassword = ['New password is required'];
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        validationErrors.newPassword = passwordValidation.errors;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return errors.validation(validationErrors);
    }

    // Get user with password
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      return errors.unauthorized();
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, fullUser.password);

    if (!isValid) {
      return errors.validation({
        currentPassword: ['Current password is incorrect'],
      });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return errors.internal();
  }
}
```

---

## 7. Auth Middleware

Create `src/lib/auth/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './session';

// For use in API routes
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string } | NextResponse> {
  const { user } = await validateSession();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      },
      { status: 401 }
    );
  }

  return { userId: user.id };
}

// Helper to use in route handlers
export async function withAuth<T>(
  request: NextRequest,
  handler: (userId: string, request: NextRequest) => Promise<T>
): Promise<T | NextResponse> {
  const result = await requireAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  return handler(result.userId, request);
}
```

Usage in API routes:

```typescript
import { withAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId, req) => {
    // userId is guaranteed to exist here
    const sites = await prisma.site.findMany({
      where: { userId },
    });
    return successResponse({ sites });
  });
}
```

---

## 8. React Hooks

Create `src/hooks/useAuth.ts`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    setUser(data.data);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
    router.push('/login');
  }, [router]);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      setUser(data.data);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 9. Protected Route Wrapper

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

---

## 10. Next.js Middleware (Optional)

For route protection at the edge, create `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/editor', '/settings'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Check if accessing protected route without session
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if accessing auth route with session
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/settings/:path*', '/login', '/register'],
};
```

**Note:** This middleware only checks for cookie presence, not validity. Full validation happens in API routes.

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── auth/
│           ├── register/route.ts
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── me/route.ts
│           └── password/route.ts
├── lib/
│   ├── auth/
│   │   ├── password.ts
│   │   ├── session.ts
│   │   ├── cookies.ts
│   │   └── middleware.ts
│   ├── api/
│   │   └── response.ts
│   └── prisma.ts
├── hooks/
│   └── useAuth.ts
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx
└── middleware.ts
```

---

## Required Packages

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

---

## Environment Variables

```env
# .env.local
DATABASE_URL="file:./dev.db"
```

---

## Deliverables Checklist

- [ ] Prisma schema includes User and Session models
- [ ] Migration created and applied
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Password validation (8+ chars, upper, lower, number)
- [ ] Session creation with secure random token
- [ ] Session validation with auto-refresh
- [ ] HTTP-only, secure, SameSite=Strict cookies
- [ ] All 5 auth API routes implemented
- [ ] API response helpers (success/error format)
- [ ] Auth middleware for protected routes
- [ ] useAuth hook with login/logout/register
- [ ] ProtectedRoute component
- [ ] Optional: Edge middleware for route protection

---

## Testing Checklist

1. **Register** - Create account, verify session cookie set
2. **Login** - Authenticate, verify session created
3. **Session persistence** - Refresh page, still logged in
4. **Logout** - Session deleted, cookie cleared
5. **Protected routes** - Redirect to login if not authenticated
6. **Password change** - Requires current password, validates new
7. **Invalid credentials** - Returns 401, no user enumeration
8. **Duplicate email** - Returns 409 conflict
9. **Weak password** - Returns validation errors
10. **Session expiry** - After 7 days, requires re-login
