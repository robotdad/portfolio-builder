# Foundation: API Contracts

This document defines the REST API endpoints, request/response shapes, and error handling patterns for the portfolio builder.

## Base Configuration

### Base URL

```
Development: http://localhost:4000/api
Production:  https://{domain}/api
```

### Content Type

All endpoints accept and return JSON unless otherwise specified.

```
Content-Type: application/json
Accept: application/json
```

### Authentication

Session-based authentication using HTTP-only cookies.

```
Cookie: session={token}
```

---

## Response Envelope

### Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;      // Machine-readable error code
    message: string;   // Human-readable message
    details?: Record<string, string[]>;  // Field validation errors
  };
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate slug) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Request:**
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}
```

**Response (201):**
```typescript
interface RegisterResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;  // ISO 8601
}
```

**Errors:**
- `VALIDATION_ERROR` - Invalid email or weak password
- `CONFLICT` - Email already registered

---

### POST /api/auth/login

Authenticate and create session.

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
interface LoginResponse {
  id: string;
  email: string;
  name: string | null;
}
```

**Side Effect:** Sets `session` cookie (HTTP-only, secure, SameSite=Strict)

**Errors:**
- `UNAUTHORIZED` - Invalid credentials

---

### POST /api/auth/logout

End current session.

**Request:** No body required.

**Response (200):**
```typescript
interface LogoutResponse {
  message: 'Logged out successfully';
}
```

**Side Effect:** Clears `session` cookie and deletes session from database.

---

### GET /api/auth/me

Get current authenticated user.

**Response (200):**
```typescript
interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastLogin: string | null;
}
```

**Errors:**
- `UNAUTHORIZED` - No valid session

---

### POST /api/auth/password

Change password (authenticated).

**Request:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

**Response (200):**
```typescript
interface ChangePasswordResponse {
  message: 'Password updated successfully';
}
```

**Errors:**
- `UNAUTHORIZED` - Current password incorrect
- `VALIDATION_ERROR` - New password too weak

---

## Site Endpoints

### GET /api/sites

List all sites for authenticated user.

**Response (200):**
```typescript
interface ListSitesResponse {
  sites: SiteSummary[];
}

interface SiteSummary {
  id: string;
  title: string;
  tagline: string | null;
  slug: string;
  themeId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  pageCount: number;
}
```

---

### POST /api/sites

Create a new site.

**Request:**
```typescript
interface CreateSiteRequest {
  title: string;
  tagline?: string;
  slug?: string;      // Auto-generated from title if not provided
  themeId?: string;   // Defaults to 'modern-minimal'
}
```

**Response (201):**
```typescript
interface CreateSiteResponse {
  id: string;
  title: string;
  tagline: string | null;
  slug: string;
  themeId: string;
  settings: SiteSettings;
  createdAt: string;
  updatedAt: string;
  publishedAt: null;
}
```

**Side Effect:** Creates default homepage with empty content.

**Errors:**
- `VALIDATION_ERROR` - Invalid title or slug format
- `CONFLICT` - Slug already taken

---

### GET /api/sites/:siteId

Get site details with pages.

**Response (200):**
```typescript
interface GetSiteResponse {
  id: string;
  title: string;
  tagline: string | null;
  slug: string;
  themeId: string;
  settings: SiteSettings;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  pages: PageSummary[];
}

interface PageSummary {
  id: string;
  title: string;
  slug: string;
  isHomepage: boolean;
  inNavigation: boolean;
  navOrder: number;
  publishedAt: string | null;
  updatedAt: string;
}
```

**Errors:**
- `NOT_FOUND` - Site not found or not owned by user

---

### PATCH /api/sites/:siteId

Update site details.

**Request:**
```typescript
interface UpdateSiteRequest {
  title?: string;
  tagline?: string;
  slug?: string;
  themeId?: string;
  settings?: Partial<SiteSettings>;
}
```

**Response (200):** Same as GetSiteResponse

**Errors:**
- `NOT_FOUND` - Site not found
- `CONFLICT` - New slug already taken

---

### DELETE /api/sites/:siteId

Delete site and all associated pages/assets.

**Response (200):**
```typescript
interface DeleteSiteResponse {
  message: 'Site deleted successfully';
}
```

**Errors:**
- `NOT_FOUND` - Site not found

---

### POST /api/sites/:siteId/publish

Publish site (copies draft content to published for all pages).

**Response (200):**
```typescript
interface PublishSiteResponse {
  publishedAt: string;
  publishedPages: number;
}
```

---

## Page Endpoints

### GET /api/sites/:siteId/pages

List pages for a site.

**Response (200):**
```typescript
interface ListPagesResponse {
  pages: PageSummary[];
}
```

---

### POST /api/sites/:siteId/pages

Create a new page.

**Request:**
```typescript
interface CreatePageRequest {
  title: string;
  slug?: string;        // Auto-generated from title if not provided
  description?: string;
  isHomepage?: boolean;
  inNavigation?: boolean;
  template?: string;    // Template ID to copy content from
}
```

**Response (201):**
```typescript
interface CreatePageResponse {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  description: string | null;
  draftContent: PageContent;
  publishedContent: null;
  isHomepage: boolean;
  inNavigation: boolean;
  navOrder: number;
  metadata: PageMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt: null;
}
```

**Errors:**
- `CONFLICT` - Slug already exists in site

---

### GET /api/sites/:siteId/pages/:pageId

Get page with full content.

**Response (200):**
```typescript
interface GetPageResponse {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  description: string | null;
  draftContent: PageContent;
  publishedContent: PageContent | null;
  isHomepage: boolean;
  inNavigation: boolean;
  navOrder: number;
  metadata: PageMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
```

---

### PATCH /api/sites/:siteId/pages/:pageId

Update page details (not content).

**Request:**
```typescript
interface UpdatePageRequest {
  title?: string;
  slug?: string;
  description?: string;
  isHomepage?: boolean;
  inNavigation?: boolean;
  navOrder?: number;
  metadata?: Partial<PageMetadata>;
}
```

**Response (200):** Same as GetPageResponse

---

### PUT /api/sites/:siteId/pages/:pageId/content

Update page draft content (full replacement).

**Request:**
```typescript
interface UpdateContentRequest {
  content: PageContent;
}
```

**Response (200):**
```typescript
interface UpdateContentResponse {
  id: string;
  draftContent: PageContent;
  updatedAt: string;
}
```

**Notes:**
- This is the main endpoint for auto-save
- Content is validated against PageContent schema
- Does NOT publish - only updates draft

---

### POST /api/sites/:siteId/pages/:pageId/publish

Publish a single page.

**Response (200):**
```typescript
interface PublishPageResponse {
  id: string;
  publishedContent: PageContent;
  publishedAt: string;
}
```

---

### DELETE /api/sites/:siteId/pages/:pageId

Delete a page.

**Response (200):**
```typescript
interface DeletePageResponse {
  message: 'Page deleted successfully';
}
```

**Errors:**
- `FORBIDDEN` - Cannot delete homepage (change homepage first)

---

### PATCH /api/sites/:siteId/pages/reorder

Reorder pages in navigation.

**Request:**
```typescript
interface ReorderPagesRequest {
  pageIds: string[];  // Ordered list of page IDs
}
```

**Response (200):**
```typescript
interface ReorderPagesResponse {
  pages: { id: string; navOrder: number }[];
}
```

---

## Asset Endpoints

### GET /api/sites/:siteId/assets

List assets for a site.

**Query Parameters:**
- `limit` (number, default 50, max 100)
- `offset` (number, default 0)

**Response (200):**
```typescript
interface ListAssetsResponse {
  assets: AssetSummary[];
  total: number;
  limit: number;
  offset: number;
}

interface AssetSummary {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  thumbnailUrl: string;
  width: number;
  height: number;
  altText: string | null;
  createdAt: string;
}
```

---

### POST /api/sites/:siteId/assets

Upload a new asset.

**Request:** `multipart/form-data`
```
file: <binary>
altText?: string
```

**Response (201):**
```typescript
interface UploadAssetResponse {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  originalUrl: string | null;
  displayUrl: string;
  thumbnailUrl: string;
  placeholder: string;  // Base64 blur placeholder
  width: number;
  height: number;
  altText: string | null;
  metadata: AssetMetadata;
  createdAt: string;
}
```

**Processing:**
1. Validate file type (image/jpeg, image/png, image/webp, image/gif)
2. Validate file size (max 10MB)
3. Strip EXIF data
4. Generate display version (max 1920px, WebP)
5. Generate thumbnail (400x300, WebP)
6. Generate blur placeholder (40px, base64)

**Errors:**
- `VALIDATION_ERROR` - Invalid file type or size

---

### GET /api/sites/:siteId/assets/:assetId

Get asset details.

**Response (200):** Full asset object (same as upload response)

---

### PATCH /api/sites/:siteId/assets/:assetId

Update asset metadata.

**Request:**
```typescript
interface UpdateAssetRequest {
  altText?: string;
  caption?: string;
  metadata?: {
    focalPoint?: { x: number; y: number };
  };
}
```

**Response (200):** Full asset object

---

### DELETE /api/sites/:siteId/assets/:assetId

Delete an asset.

**Response (200):**
```typescript
interface DeleteAssetResponse {
  message: 'Asset deleted successfully';
}
```

**Side Effect:** Removes files from storage.

**Warning:** Does not automatically remove references from page content. Client should handle orphan references.

---

## Public Site Endpoints

These endpoints serve published content without authentication.

### GET /api/public/:slug

Get published site for public viewing.

**Response (200):**
```typescript
interface PublicSiteResponse {
  title: string;
  tagline: string | null;
  themeId: string;
  pages: PublicPageSummary[];
  settings: {
    socialLinks?: SocialLink[];
    contactEmail?: string;
  };
}

interface PublicPageSummary {
  title: string;
  slug: string;
  inNavigation: boolean;
  navOrder: number;
}
```

**Errors:**
- `NOT_FOUND` - Site not found or not published
- `UNAUTHORIZED` - Site is password-protected (returns 401 with hint)

---

### GET /api/public/:siteSlug/:pageSlug?

Get published page content.

**Response (200):**
```typescript
interface PublicPageResponse {
  title: string;
  slug: string;
  description: string | null;
  content: PageContent;
  metadata: PageMetadata;
}
```

**Notes:**
- `pageSlug` is optional; defaults to homepage
- Returns only publishedContent, never draft

---

### POST /api/public/:slug/verify

Verify password for protected site.

**Request:**
```typescript
interface VerifyPasswordRequest {
  password: string;
}
```

**Response (200):**
```typescript
interface VerifyPasswordResponse {
  valid: boolean;
}
```

**Side Effect:** Sets `site-access-{slug}` cookie if valid.

---

## Webhook/Contact Endpoints

### POST /api/public/:slug/contact

Submit contact form.

**Request:**
```typescript
interface ContactFormRequest {
  name?: string;
  email: string;
  phone?: string;
  message: string;
  pageSlug: string;  // For tracking which page form was on
}
```

**Response (200):**
```typescript
interface ContactFormResponse {
  message: 'Message sent successfully';
}
```

**Side Effect:** Sends email to site's contactEmail setting.

**Errors:**
- `VALIDATION_ERROR` - Missing required fields
- `RATE_LIMITED` - Too many submissions

---

## TypeScript Types Summary

```typescript
// src/types/api.ts

// Request types
export interface RegisterRequest { ... }
export interface LoginRequest { ... }
export interface CreateSiteRequest { ... }
export interface UpdateSiteRequest { ... }
export interface CreatePageRequest { ... }
export interface UpdatePageRequest { ... }
export interface UpdateContentRequest { ... }
export interface UpdateAssetRequest { ... }

// Response types
export interface SuccessResponse<T> { ... }
export interface ErrorResponse { ... }
export interface UserResponse { ... }
export interface SiteSummary { ... }
export interface SiteResponse { ... }
export interface PageSummary { ... }
export interface PageResponse { ... }
export interface AssetSummary { ... }
export interface AssetResponse { ... }

// Shared types (from data-models.md)
export type { PageContent, SiteSettings, PageMetadata, AssetMetadata } from './content';
```

---

## API Client Pattern

Recommended client-side fetch wrapper.

```typescript
// src/lib/api-client.ts

class APIError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;

  constructor(response: ErrorResponse, status: number) {
    super(response.error.message);
    this.code = response.error.code;
    this.status = status;
    this.details = response.error.details;
  }
}

async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',  // Include cookies
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new APIError(data, response.status);
  }

  return data.data;
}

// Usage examples
export const sites = {
  list: () => api<ListSitesResponse>('/sites'),
  get: (id: string) => api<GetSiteResponse>(`/sites/${id}`),
  create: (data: CreateSiteRequest) =>
    api<CreateSiteResponse>('/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateSiteRequest) =>
    api<SiteResponse>(`/sites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<DeleteSiteResponse>(`/sites/${id}`, { method: 'DELETE' }),
};
```

---

## Rate Limiting

| Endpoint Pattern | Limit |
|------------------|-------|
| `/api/auth/*` | 10 requests/minute per IP |
| `/api/public/*/contact` | 5 requests/minute per IP |
| `/api/sites/*/assets` (POST) | 30 requests/minute per user |
| All other endpoints | 100 requests/minute per user |

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   └── password/route.ts
│       ├── sites/
│       │   ├── route.ts              # GET, POST
│       │   └── [siteId]/
│       │       ├── route.ts          # GET, PATCH, DELETE
│       │       ├── publish/route.ts
│       │       ├── pages/
│       │       │   ├── route.ts
│       │       │   ├── reorder/route.ts
│       │       │   └── [pageId]/
│       │       │       ├── route.ts
│       │       │       ├── content/route.ts
│       │       │       └── publish/route.ts
│       │       └── assets/
│       │           ├── route.ts
│       │           └── [assetId]/route.ts
│       └── public/
│           └── [slug]/
│               ├── route.ts
│               ├── [...pageSlug]/route.ts
│               ├── verify/route.ts
│               └── contact/route.ts
├── lib/
│   ├── api-client.ts       # Client-side fetch wrapper
│   ├── api-response.ts     # Response helper functions
│   └── validation.ts       # Request validation schemas
└── types/
    └── api.ts              # API request/response types
```

---

## Deliverables Checklist

When implementing the API, ensure:

- [ ] All auth endpoints implemented with session cookies
- [ ] CRUD endpoints for sites, pages, and assets
- [ ] Content update endpoint with auto-save support
- [ ] Publish flow for sites and individual pages
- [ ] Asset upload with Sharp.js processing
- [ ] Public endpoints for published content
- [ ] Consistent error response format
- [ ] Rate limiting on sensitive endpoints
- [ ] Request validation with clear error messages
- [ ] API client wrapper for frontend use

---

## Testing Checklist

Verify API contracts work:

1. **Auth flow** - Register, login, logout, session persistence
2. **Site CRUD** - Create, list, update, delete sites
3. **Page CRUD** - Create pages, update content, reorder
4. **Publish flow** - Draft to published, verify public access
5. **Asset upload** - Upload image, verify processing, delete
6. **Error handling** - Invalid requests return proper error codes
7. **Authorization** - Cannot access other users' resources
8. **Rate limiting** - Excessive requests are blocked
