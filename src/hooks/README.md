# Hooks

Custom React hooks for the portfolio application. All hooks follow consistent patterns:
- Return `{ data, isLoading, error, refresh }` for data fetching
- Use `isMountedRef` to prevent state updates after unmount
- Implement optimistic updates with rollback on error

## Data Hooks

### useCategories
CRUD operations for categories with optimistic updates.

**Expects:** `portfolioId` parameter  
**Used by:** `CategoryList`, `CategoryForm`, admin category pages

### useProjects  
CRUD operations for projects with optimistic updates.

**Expects:** `categoryId` parameter  
**Used by:** `ProjectList`, `ProjectForm`, admin project pages

### useNavigationData
Loads sidebar navigation data (categories with nested projects).

**Expects:** `portfolioId` parameter  
**Used by:** `AdminLayout` sidebar  
**Note:** Fetches categories first, then projects in parallel per category

## UI Hooks

### useAutoSave
Periodic auto-save with status tracking (saving, saved, error).

**Expects:** `onSave` callback, optional `interval` (default 30s)  
**Used by:** `ProjectEdit`, page editors  
**Pattern:** Tracks content changes, debounces saves, shows status feedback

### useImageUpload
File upload handling with progress simulation and undo capability.

**Expects:** Callbacks for `onOptimisticUpdate`, `onSuccess`, `onError`, `onUndo`  
**Used by:** `ImageUpload`, `GalleryManager`  
**Pattern:** Shows optimistic preview immediately, allows undo via toast

### useImagePicker
Image selection modal state with filtering.

**Expects:** `portfolioId`, `onSelect` callback  
**Used by:** `ImagePicker` modal  
**Features:** Client-side search filtering, keyboard navigation

### useFocusTrap
Traps focus within a modal for accessibility.

**Expects:** `ref` to container element, `isActive` boolean  
**Used by:** `Modal`, `BottomSheet`, `Lightbox`

### usePopoverPosition
Calculates viewport-aware popover positioning.

**Expects:** Trigger and popover refs  
**Used by:** `Popover`, `ImagePicker`

## State Hooks

### useOnboardingState
Persists onboarding wizard state to sessionStorage.

**Used by:** Welcome flow pages  
**Pattern:** Migrates from legacy storage keys, preserves state across page navigations
