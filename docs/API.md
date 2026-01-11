# API Reference

The Portfolio Builder exposes REST API endpoints under `/api/`. All endpoints return JSON.

## Response Patterns

The API uses two response patterns:

**Standard wrapper** (Categories, Projects):
```typescript
{ data: T, success: true }                      // Success
{ error: string, code: string, success: false } // Error
```

**Direct response** (Portfolio, Pages, Upload):
```typescript
T                        // Success (direct data)
{ message: string }      // Error
```

---

## Portfolio

### `GET /api/portfolio`

Returns the portfolio (single-user, returns first portfolio).

**Response:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "title": "string",
    "bio": "string",
    "draftTheme": "string",
    "publishedTheme": "string",
    "showAboutSection": true,
    "profilePhotoId": "string | null",
    "profilePhoto": { "id": "", "url": "", "thumbnailUrl": "", "altText": "" },
    "pages": [],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### `POST /api/portfolio`

Creates a new portfolio with homepage.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | Yes | URL slug, format: `[a-z0-9-]+` |
| `name` | string | No | Portfolio owner name |
| `title` | string | No | Professional title |
| `bio` | string | No | Bio text |
| `theme` | string | No | Theme name (default: `modern-minimal`) |

**Response:** `201 Created` with portfolio object

### `PUT /api/portfolio`

Updates portfolio settings.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Portfolio ID |
| `name` | string | No | Portfolio name |
| `slug` | string | No | URL slug |
| `title` | string | No | Professional title |
| `bio` | string | No | Bio text |
| `theme` | string | No | Updates `draftTheme` |
| `template` | string | No | Updates `draftTemplate` |
| `showAboutSection` | boolean | No | Show about section |
| `profilePhotoId` | string\|null | No | Profile photo asset ID |

**Response:** `200 OK` with updated portfolio

---

## Categories

### `GET /api/categories`

Lists categories for a portfolio.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `portfolioId` | string | Yes | Portfolio ID |
| `includeProjects` | `"true"` | No | Include projects in response |

**Response:**
```json
{
  "data": [{
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "order": 0,
    "featuredImage": { "id": "", "url": "", "thumbnailUrl": "", "altText": "" },
    "_count": { "projects": 0 }
  }],
  "success": true
}
```

### `POST /api/categories`

Creates a new category.

**Request Body:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `portfolioId` | string | Yes | - | Portfolio ID |
| `name` | string | Yes | 100 | Category name |
| `description` | string | No | 500 | Description |
| `featuredImageId` | string | No | - | Asset ID |

**Response:** `201 Created`

### `GET /api/categories/[id]`

Gets a single category with its projects.

**Response:**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "order": 0,
    "featuredImage": {},
    "projects": []
  },
  "success": true
}
```

### `PUT /api/categories/[id]`

Updates a category.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Category name (updates slug if changed) |
| `description` | string\|null | Description |
| `order` | number | Sort order (integer >= 0) |
| `featuredImageId` | string\|null | Asset ID |

**Response:** `200 OK`

### `DELETE /api/categories/[id]`

Deletes a category and all its projects (cascade).

**Response:** `200 OK` with `{ "data": null, "success": true }`

---

## Projects

### `GET /api/projects`

Lists projects. Use one of these query parameter combinations:

| Param | Description |
|-------|-------------|
| `categoryId` | Get projects in a category |
| `portfolioId` + `featured=true` | Get featured projects across portfolio |

**Response:**
```json
{
  "data": [{
    "id": "string",
    "title": "string",
    "slug": "string",
    "year": "string | null",
    "venue": "string | null",
    "role": "string | null",
    "isFeatured": false,
    "order": 0,
    "draftContent": "string | null",
    "publishedContent": "string | null",
    "category": { "id": "", "name": "", "slug": "" },
    "featuredImage": {}
  }],
  "success": true
}
```

### `POST /api/projects`

Creates a new project.

**Request Body:**

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `categoryId` | string | Yes | - | Category ID |
| `title` | string | Yes | 200 | Project title |
| `year` | string | No | 20 | Year/date |
| `venue` | string | No | 200 | Venue/location |
| `role` | string | No | 200 | Role/position |
| `description` | string | No | 5000 | Description |
| `isFeatured` | boolean | No | - | Featured flag |
| `featuredImageId` | string | No | - | Asset ID |

**Response:** `201 Created`

### `GET /api/projects/[id]`

Gets a single project with full details.

### `PUT /api/projects/[id]`

Updates a project.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `categoryId` | string | Move to different category |
| `title` | string | Title (regenerates slug) |
| `year` | string\|null | Year |
| `venue` | string\|null | Venue |
| `role` | string\|null | Role |
| `draftContent` | string\|null | Draft content JSON |
| `isFeatured` | boolean | Featured flag |
| `order` | number | Sort order |
| `featuredImageId` | string\|null | Asset ID |

**Response:** `200 OK`

### `DELETE /api/projects/[id]`

Deletes a project.

**Response:** `200 OK` with `{ "data": null, "success": true }`

### `POST /api/projects/[id]/publish`

Publishes a project by copying `draftContent` to `publishedContent`.

**Request Body:** None

**Response:**
```json
{
  "message": "Published successfully",
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "draftContent": "string",
    "publishedContent": "string",
    "lastPublishedAt": "string"
  }
}
```

---

## Pages

### `GET /api/pages`

Lists pages for a portfolio.

**Query Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `portfolioId` | string | Yes |

**Response:** Array of pages ordered by `navOrder`

### `POST /api/pages`

Creates a new page.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `portfolioId` | string | Yes | Portfolio ID |
| `title` | string | Yes | Page title |
| `slug` | string | No | URL slug (auto-generated from title) |
| `isHomepage` | boolean | No | Set as homepage |
| `showInNav` | boolean | No | Show in navigation (default: true) |
| `draftContent` | string | No | Draft content JSON |

**Response:** `201 Created`

### `GET /api/pages/[id]`

Gets a single page.

### `PUT /api/pages/[id]`

Updates a page.

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Page title |
| `slug` | string | URL slug |
| `isHomepage` | boolean | Set as homepage |
| `showInNav` | boolean | Show in navigation |
| `draftContent` | string | Draft content JSON |

**Response:** `200 OK`

### `DELETE /api/pages/[id]`

Deletes a page. Cannot delete the only page. If homepage is deleted, the next page is promoted.

**Response:** `200 OK` with `{ "message": "Page deleted" }`

---

## Upload

### `POST /api/upload`

Uploads and processes an image.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Image file |
| `portfolioId` | string | Yes | Portfolio ID |
| `altText` | string | No | Alt text |
| `caption` | string | No | Caption |

**Constraints:**
- Maximum size: 10MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`

**Response:**
```json
{
  "id": "string",
  "portfolioId": "string",
  "filename": "string",
  "mimeType": "string",
  "size": 0,
  "width": 0,
  "height": 0,
  "altText": "string",
  "caption": "string | null",
  "url": "string",
  "thumbnailUrl": "string",
  "placeholderUrl": "string",
  "srcset400": "string",
  "srcset800": "string",
  "srcset1200": "string",
  "srcset1600": "string"
}
```

---

## Error Responses

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 400 | `NO_CONTENT` | No content to publish |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Slug already exists |
| 500 | `INTERNAL_ERROR` | Server error |

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "success": false
}
```
