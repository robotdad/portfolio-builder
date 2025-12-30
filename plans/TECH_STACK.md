# Technology Stack & Constraints

**Purpose:** Technology choices and key constraints for implementation. These decisions are made - don't reconsider them.

---

## Core Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 14+ App Router | SSR for performance, built-in optimization |
| **Styling** | Tailwind CSS + CSS Variables | Theme flexibility, performance |
| **UI Components** | shadcn/ui (Radix + Tailwind) | Accessible primitives, full control |
| **Database** | Prisma + SQLite (dev) / PostgreSQL (prod) | Type-safe, local-first |
| **Page Builder** | dnd-kit (custom) | Only option with reliable mobile touch |
| **Rich Text** | Tiptap | Mobile-friendly, sufficient features |
| **Images** | Sharp.js | Industry standard optimization |

---

## Critical Constraints

### Mobile Touch (dnd-kit)
**Configuration required:**
```typescript
// TouchSensor config
activationConstraint: {
  delay: 150,    // ms - prevents accidental drags
  tolerance: 8,  // px - allows small movements
}

// CSS requirement
touch-action: none;  // CRITICAL for iOS
```

### Theming (CSS Custom Properties)
**Use:** CSS custom properties + Tailwind
**NOT:** CSS-in-JS (styled-components, Emotion)
**Why:** CSS-in-JS doesn't support pseudo-classes in theme tokens

### Component Rendering (DOM Parity)
**Pattern:** Same components for editor and published
```typescript
<Component {...props} isEditing={true} />  // Editor
<Component {...props} isEditing={false} /> // Published
```
**NOT:** Separate preview renderer

### Publishing Model
**Draft/Published Separation:**
- Database: `draftContent` and `publishedContent` fields
- Auto-save drafts every 30s
- Publish is atomic copy operation

---

## Performance Requirements

**Page Load Targets:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s

**Bundle Sizes:**
- JavaScript: <200KB (gzipped)
- CSS: <50KB (gzipped)
- Total page weight: <1MB (with images)

**Image Optimization:**
- 60-80% size reduction target
- Generate: Display (1920px), Thumbnail (400x300), Placeholder (40px blur)
- Output format: WebP

---

## Security Basics

**Authentication (Phase 2):**
- Session-based with HTTP-only cookies
- bcrypt with 12 salt rounds
- 7-day session duration

**Content Security:**
- HTML sanitization with DOMPurify
- WCAG AA accessibility enforcement
- Alt text required for all images

---

## What to Use When

**State Management:** React state + useEffect (keep simple)
**Data Fetching:** Next.js Server Components + API routes
**Forms:** Controlled components with validation
**File Upload:** Multipart form data → Sharp.js processing
**Drag & Drop:** dnd-kit with TouchSensor config above
**Text Editing:** Tiptap with starter-kit + link extension

---

## Dev Server Management

**Running Next.js dev server for testing:**

```bash
# Start in background with logging
npm run dev > /tmp/nextjs.log 2>&1 & echo $!
# Returns PID immediately, e.g., "95969"

# Verify it's running
ps -p 95969

# View logs
tail -20 /tmp/nextjs.log

# Stop when done
kill 95969
```

**CRITICAL - Never do this:**
- ❌ `npm run dev` (hangs indefinitely - cannot be killed)
- ❌ `run_in_background` parameter (unreliable - times out after 30s)

**Always do this:**
- ✅ Use Unix job control: `command > /tmp/log 2>&1 & echo $!`
- ✅ Capture PID for later cleanup
- ✅ Redirect output to log file

**This pattern works for all long-running processes** (dev servers, build watchers, etc.)

---

## Key Trade-offs Made

**dnd-kit vs pre-built page builder:**
- Trade-off: More code investment (~770 lines)
- Gain: Full mobile touch support, smaller bundle

**Session auth vs OAuth:**
- Trade-off: No social login
- Gain: Simpler implementation, single-user appropriate

**Theme-constrained vs free-form:**
- Trade-off: Less user control
- Gain: Guaranteed professional results, faster creation

---

These decisions are made. Focus on implementation, not re-evaluation.
