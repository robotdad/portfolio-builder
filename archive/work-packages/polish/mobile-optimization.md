# Polish: Mobile Optimization

A self-contained work package for optimizing the portfolio builder's mobile experience across touch targets, gestures, keyboard handling, and responsive patterns.

## Overview

Audit and enhance the mobile experience across all flows (onboarding, editing, media, publish). Focus on touch target sizing, gesture support, virtual keyboard handling, safe area compliance, and performance optimization for touch devices.

## Prerequisites

- `flows/onboarding-flow.md` - Registration, wizard, theme selection
- `flows/editing-flow.md` - Page editor, component manipulation
- `flows/media-flow.md` - Upload, gallery, image picker
- `flows/publish-flow.md` - Preview, public site, navigation

## Deliverables

1. Touch target audit and fixes
2. Gesture system (swipe, long-press)
3. Virtual keyboard handling
4. Safe area / notch support
5. Bottom sheet refinements
6. Mobile navigation patterns
7. Performance optimizations
8. Orientation handling
9. Pull-to-refresh implementation
10. Mobile-specific accessibility

---

## 1. Touch Target Standards

### Minimum Sizes

| Platform | Minimum Size | Recommended |
|----------|--------------|-------------|
| iOS | 44x44pt | 48x48pt |
| Android | 48x48dp | 56x56dp |
| Web (touch) | 44x44px | 48x48px |

### Audit Checklist

Components requiring touch target verification:

```
Editor:
- [ ] Drag handles (BlockWrapper)
- [ ] Delete/duplicate buttons
- [ ] Component picker grid items
- [ ] Settings panel controls
- [ ] Undo/redo buttons

Media:
- [ ] Asset grid items (selection targets)
- [ ] Upload zone tap area
- [ ] Focal point selector
- [ ] Camera/browse buttons

Navigation:
- [ ] Header menu button
- [ ] Mobile nav items
- [ ] Back buttons
- [ ] Page selector dropdown

Forms:
- [ ] Input fields
- [ ] Checkboxes
- [ ] Radio buttons
- [ ] Submit buttons
```

### Touch Target Utility

Create `src/lib/touch.ts`:

```typescript
/**
 * Minimum touch target sizes by platform
 */
export const TOUCH_TARGET = {
  MIN: 44, // Minimum for any touch target
  RECOMMENDED: 48, // Recommended size
  COMFORTABLE: 56, // Comfortable for frequent actions
} as const;

/**
 * CSS classes for touch targets
 */
export const touchTargetClasses = {
  // Expand clickable area without changing visual size
  expandHitArea: 'relative before:absolute before:inset-[-8px] before:content-[""]',

  // Minimum touch target
  minTouch: 'min-w-[44px] min-h-[44px]',

  // Recommended touch target
  touch: 'min-w-[48px] min-h-[48px]',

  // Comfortable touch target
  touchLarge: 'min-w-[56px] min-h-[56px]',
};
```

### Updated BlockWrapper Toolbar

```typescript
// In BlockWrapper.tsx - ensure buttons meet touch targets
<div className="flex items-center gap-1">
  <button
    {...dragHandleProps}
    className={cn(
      // Visual size
      'p-2 rounded bg-surface border border-border',
      // Touch target - minimum 44px
      'min-w-[44px] min-h-[44px]',
      // Expanded hit area
      'relative before:absolute before:-inset-1 before:content-[""]',
      'hover:bg-surface-hover active:cursor-grabbing',
      'touch-none'
    )}
    aria-label="Drag to reorder"
  >
    <GripVertical className="w-5 h-5 text-text-muted" />
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      duplicateComponent(componentId);
    }}
    className="p-2 min-w-[44px] min-h-[44px] rounded bg-surface border border-border hover:bg-surface-hover"
    title="Duplicate"
  >
    <Copy className="w-5 h-5 text-text-muted" />
  </button>

  <button
    onClick={(e) => {
      e.stopPropagation();
      deleteComponent(componentId);
    }}
    className="p-2 min-w-[44px] min-h-[44px] rounded bg-surface border border-border hover:bg-error hover:text-error-foreground"
    title="Delete"
  >
    <Trash2 className="w-5 h-5" />
  </button>
</div>
```

---

## 2. Gesture System

### Swipe Actions

Create `src/hooks/useSwipeAction.ts`:

```typescript
'use client';

import { useRef, useCallback, useState } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger
  velocityThreshold?: number; // Minimum velocity
}

interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | null;
  offset: number;
}

export function useSwipeAction({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  velocityThreshold = 0.5,
}: SwipeConfig) {
  const startX = useRef(0);
  const startTime = useRef(0);
  const [state, setState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    offset: 0,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    setState({ isSwiping: true, direction: null, offset: 0 });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    const direction = diff > 0 ? 'right' : 'left';

    setState({
      isSwiping: true,
      direction,
      offset: diff,
    });
  }, [state.isSwiping]);

  const handleTouchEnd = useCallback(() => {
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(state.offset) / elapsed;

    const triggered =
      Math.abs(state.offset) >= threshold ||
      velocity >= velocityThreshold;

    if (triggered) {
      if (state.direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (state.direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }

    setState({ isSwiping: false, direction: null, offset: 0 });
  }, [state.offset, state.direction, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    state,
  };
}
```

### Long Press for Context Menu

Create `src/hooks/useLongPress.ts`:

```typescript
'use client';

import { useRef, useCallback } from 'react';

interface LongPressConfig {
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onPress,
  delay = 500,
}: LongPressConfig) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    targetRef.current = e.target;
    isLongPress.current = false;

    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();

      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, delay);
  }, [onLongPress, delay]);

  const stop = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only trigger onPress if it wasn't a long press
    if (!isLongPress.current && onPress) {
      onPress();
    }
  }, [onPress]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: cancel, // Cancel on move
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: cancel,
  };
}
```

### Swipeable Asset Item

```typescript
// In AssetGrid.tsx - add swipe-to-delete
function SwipeableAssetItem({
  asset,
  onDelete,
  ...props
}: AssetGridItemProps & { onDelete: () => void }) {
  const { handlers, state } = useSwipeAction({
    onSwipeLeft: onDelete,
    threshold: 100,
  });

  const showDeleteHint = state.direction === 'left' && Math.abs(state.offset) > 40;

  return (
    <div className="relative overflow-hidden" {...handlers}>
      {/* Delete background */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 bg-error flex items-center justify-end px-4',
          'transition-opacity',
          showDeleteHint ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: Math.abs(state.offset) }}
      >
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Asset content */}
      <div
        style={{
          transform: `translateX(${Math.min(0, state.offset)}px)`,
          transition: state.isSwiping ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <AssetGridItem asset={asset} {...props} />
      </div>
    </div>
  );
}
```

---

## 3. Virtual Keyboard Handling

### Keyboard-Aware Container

Create `src/components/ui/KeyboardAwareView.tsx`:

```typescript
'use client';

import { useEffect, useState, ReactNode } from 'react';

interface KeyboardAwareViewProps {
  children: ReactNode;
  className?: string;
}

export function KeyboardAwareView({ children, className }: KeyboardAwareViewProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Use Visual Viewport API for accurate keyboard detection
    const viewport = window.visualViewport;

    if (!viewport) return;

    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const keyboardH = windowHeight - viewportHeight;

      setKeyboardHeight(keyboardH > 100 ? keyboardH : 0);
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        paddingBottom: keyboardHeight,
        transition: 'padding-bottom 0.2s ease-out',
      }}
    >
      {children}
    </div>
  );
}
```

### Input Focus Management

Create `src/hooks/useInputFocus.ts`:

```typescript
'use client';

import { useCallback, useRef } from 'react';

interface InputFocusConfig {
  scrollIntoView?: boolean;
  scrollOffset?: number;
}

export function useInputFocus({
  scrollIntoView = true,
  scrollOffset = 100,
}: InputFocusConfig = {}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleFocus = useCallback(() => {
    if (!scrollIntoView || !inputRef.current) return;

    // Delay to allow keyboard to appear
    setTimeout(() => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height || window.innerHeight;

        // Check if input is obscured by keyboard
        if (rect.bottom > viewportHeight - scrollOffset) {
          inputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }, 300);
  }, [scrollIntoView, scrollOffset]);

  return {
    ref: inputRef,
    onFocus: handleFocus,
  };
}
```

### Mobile Form Improvements

```typescript
// Form input with mobile optimization
function MobileInput({
  label,
  type = 'text',
  ...props
}: InputProps & { label: string }) {
  const { ref, onFocus } = useInputFocus();

  return (
    <div className="space-y-1">
      <Label htmlFor={props.id}>{label}</Label>
      <Input
        ref={ref}
        type={type}
        onFocus={onFocus}
        // Disable auto-zoom on iOS
        className="text-base md:text-sm"
        // Better mobile keyboard hints
        autoComplete={props.autoComplete}
        inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'text'}
        enterKeyHint={props.enterKeyHint || 'done'}
        {...props}
      />
    </div>
  );
}
```

### Viewport Meta Configuration

Ensure in `app/layout.tsx`:

```typescript
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevent zoom on input focus
  userScalable: false, // Disable pinch zoom globally (re-enable per component)
  viewportFit: 'cover', // Support notch/safe areas
};
```

---

## 4. Safe Area Support

### Safe Area CSS Variables

Create `src/styles/safe-area.css`:

```css
:root {
  /* Safe area insets with fallbacks */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
}

/* Utility classes for safe areas */
.safe-top {
  padding-top: var(--safe-area-top);
}

.safe-bottom {
  padding-bottom: var(--safe-area-bottom);
}

.safe-left {
  padding-left: var(--safe-area-left);
}

.safe-right {
  padding-right: var(--safe-area-right);
}

.safe-x {
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
}

.safe-y {
  padding-top: var(--safe-area-top);
  padding-bottom: var(--safe-area-bottom);
}

.safe-all {
  padding: var(--safe-area-top) var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left);
}

/* Fixed bottom elements need bottom safe area */
.fixed-bottom-safe {
  bottom: 0;
  padding-bottom: calc(var(--safe-area-bottom) + 1rem);
}
```

### Safe Area Provider

Create `src/hooks/useSafeArea.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--safe-area-top') || '0', 10),
        right: parseInt(style.getPropertyValue('--safe-area-right') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--safe-area-bottom') || '0', 10),
        left: parseInt(style.getPropertyValue('--safe-area-left') || '0', 10),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
}
```

### Updated Mobile Settings Sheet

```typescript
// In PageEditor.tsx - safe area aware bottom sheet
function MobileSettingsSheet({ component }: { component: Component }) {
  const { selectComponent } = useEditor();
  const safeArea = useSafeArea();

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40">
      <div
        className="bg-surface border-t border-border rounded-t-2xl shadow-lg max-h-[60vh] overflow-y-auto"
        style={{ paddingBottom: safeArea.bottom }}
      >
        {/* Drag handle for bottom sheet */}
        <div className="sticky top-0 bg-surface pt-2 pb-1">
          <div className="w-10 h-1 bg-border rounded-full mx-auto" />
        </div>

        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-medium capitalize">{component.type} Settings</span>
          <button
            onClick={() => selectComponent(null)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-primary font-medium"
          >
            Done
          </button>
        </div>

        <div className="p-4">
          <SettingsPanel component={component} />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Enhanced Bottom Sheet

Create `src/components/ui/BottomSheet.tsx`:

```typescript
'use client';

import {
  useRef,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { useSafeArea } from '@/hooks/useSafeArea';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights as percentages [0.3, 0.6, 0.9]
  initialSnap?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.4, 0.8],
  initialSnap = 0,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, startHeight: 0 });
  const [height, setHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const safeArea = useSafeArea();

  // Calculate snap heights based on viewport
  const getSnapHeights = useCallback(() => {
    const vh = window.innerHeight;
    return snapPoints.map((p) => vh * p);
  }, [snapPoints]);

  // Initialize height when opened
  useEffect(() => {
    if (isOpen) {
      const snapHeights = getSnapHeights();
      setHeight(snapHeights[initialSnap] || snapHeights[0]);
    }
  }, [isOpen, getSnapHeights, initialSnap]);

  // Find nearest snap point
  const snapToNearest = useCallback((currentHeight: number) => {
    const snapHeights = getSnapHeights();
    const closest = snapHeights.reduce((prev, curr) =>
      Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
    );

    // If dragged below minimum, close
    if (currentHeight < snapHeights[0] * 0.5) {
      onClose();
    } else {
      setHeight(closest);
    }
  }, [getSnapHeights, onClose]);

  // Drag handlers
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragRef.current = {
      startY: clientY,
      startHeight: height,
    };
  }, [height]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = dragRef.current.startY - clientY;
    const newHeight = dragRef.current.startHeight + deltaY;
    const maxHeight = window.innerHeight * 0.95;

    setHeight(Math.max(100, Math.min(maxHeight, newHeight)));
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    snapToNearest(height);
  }, [snapToNearest, height]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity',
          isDragging ? 'pointer-events-none' : ''
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-surface rounded-t-2xl shadow-2xl',
          'flex flex-col',
          !isDragging && 'transition-[height] duration-200 ease-out'
        )}
        style={{ height, paddingBottom: safeArea.bottom }}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1.5 bg-border rounded-full mx-auto" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 px-4 pb-3 border-b border-border">
            <h2 className="font-semibold text-center">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}
```

---

## 6. Mobile Navigation Patterns

### Sticky Mobile Header

```typescript
// Enhanced SiteHeader with mobile optimizations
export function SiteHeader({
  siteTitle,
  pages,
  currentPageId,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const safeArea = useSafeArea();

  // Close menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPageId]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-40 bg-portfolio-background/95 backdrop-blur border-b border-portfolio-border"
      style={{ paddingTop: safeArea.top }}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="font-portfolio-heading text-lg font-semibold truncate max-w-[200px]"
          >
            {siteTitle}
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  href={page.isHomepage ? '/' : `/${page.slug}`}
                  className={cn(
                    'text-sm py-2 transition-colors',
                    page.id === currentPageId
                      ? 'text-portfolio-primary font-medium'
                      : 'text-portfolio-text-muted hover:text-portfolio-text'
                  )}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-14 bg-portfolio-background z-30"
          style={{
            paddingTop: safeArea.top,
            paddingBottom: safeArea.bottom
          }}
        >
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-1">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={page.isHomepage ? '/' : `/${page.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block py-3 px-4 rounded-lg text-lg transition-colors',
                      'min-h-[48px] flex items-center',
                      page.id === currentPageId
                        ? 'bg-portfolio-primary/10 text-portfolio-primary font-medium'
                        : 'text-portfolio-text hover:bg-portfolio-surface'
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
```

---

## 7. Performance Optimizations

### Passive Event Listeners

Create `src/hooks/usePassiveEvent.ts`:

```typescript
'use client';

import { useEffect, useRef } from 'react';

export function usePassiveEvent<K extends keyof GlobalEventHandlersEventMap>(
  eventName: K,
  handler: (event: GlobalEventHandlersEventMap[K]) => void,
  element?: HTMLElement | Window | null
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element || window;

    const eventListener = (event: Event) => {
      savedHandler.current(event as GlobalEventHandlersEventMap[K]);
    };

    targetElement.addEventListener(eventName, eventListener, { passive: true });

    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
```

### Scroll Performance

```typescript
// In scrollable containers, use CSS for better performance
const scrollContainerStyles = cn(
  'overflow-y-auto',
  // Smooth scrolling on iOS
  '-webkit-overflow-scrolling: touch',
  // Contain scroll within element
  'overscroll-contain',
  // GPU acceleration
  'will-change-scroll-position'
);
```

### Image Loading Optimization

```typescript
// In AssetGridItem - use native lazy loading
<img
  src={asset.thumbnailUrl}
  alt={asset.altText || asset.filename}
  className="w-full h-full object-cover"
  loading="lazy"
  decoding="async"
  // Prevent layout shift
  width={200}
  height={200}
/>
```

### Touch Animation Performance

```typescript
// Prefer transform over position properties
const dragStyles = {
  // Good - uses GPU
  transform: `translateX(${offset}px)`,
  // Avoid - triggers layout
  // left: `${offset}px`,

  // Disable transitions during drag
  transition: isDragging ? 'none' : 'transform 0.2s ease-out',

  // Hint to browser
  willChange: isDragging ? 'transform' : 'auto',
};
```

---

## 8. Orientation Handling

### Orientation Lock for Editor

Create `src/hooks/useOrientationLock.ts`:

```typescript
'use client';

import { useEffect } from 'react';

type OrientationLock = 'portrait' | 'landscape' | 'any';

export function useOrientationLock(lock: OrientationLock) {
  useEffect(() => {
    // Check if Screen Orientation API is available
    if (!screen.orientation?.lock) return;

    const lockOrientation = async () => {
      try {
        if (lock === 'portrait') {
          await screen.orientation.lock('portrait-primary');
        } else if (lock === 'landscape') {
          await screen.orientation.lock('landscape-primary');
        }
        // 'any' doesn't need locking
      } catch (error) {
        // Lock not supported or failed - fail silently
        console.debug('Orientation lock not supported');
      }
    };

    lockOrientation();

    return () => {
      try {
        screen.orientation.unlock();
      } catch {
        // Ignore unlock errors
      }
    };
  }, [lock]);
}
```

### Responsive Layout Adjustments

```typescript
// In PageEditor - handle orientation
export function PageEditor({ site, page, allPages }: PageEditorProps) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <div className={cn(
      'h-screen flex flex-col',
      // In landscape on mobile, use horizontal layout
      isLandscape && 'md:flex-row'
    )}>
      {/* ... */}
    </div>
  );
}
```

---

## 9. Pull-to-Refresh

Create `src/hooks/usePullToRefresh.ts`:

```typescript
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

interface PullState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: PullToRefreshConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [state, setState] = useState<PullState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setState((s) => ({ ...s, isPulling: true }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isPulling || state.isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = (currentY - startY.current) / resistance;

    if (diff > 0) {
      setState((s) => ({ ...s, pullDistance: Math.min(diff, threshold * 1.5) }));
    }
  }, [state.isPulling, state.isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (state.pullDistance >= threshold && !state.isRefreshing) {
      setState((s) => ({ ...s, isRefreshing: true, pullDistance: threshold }));

      try {
        await onRefresh();
      } finally {
        setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
      }
    } else {
      setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
    }
  }, [state.pullDistance, state.isRefreshing, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    ...state,
    indicatorStyle: {
      transform: `translateY(${state.pullDistance}px)`,
      transition: state.isPulling ? 'none' : 'transform 0.2s ease-out',
    },
  };
}
```

### Pull-to-Refresh Container

```typescript
// In MediaLibrary - add pull to refresh
function RefreshableMediaLibrary({ siteId, ...props }: MediaLibraryProps) {
  const { fetchAssets } = useAssets({ siteId });

  const {
    containerRef,
    pullDistance,
    isRefreshing,
    indicatorStyle,
  } = usePullToRefresh({
    onRefresh: fetchAssets,
    threshold: 80,
  });

  const progress = Math.min(pullDistance / 80, 1);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center h-0 overflow-visible"
        style={indicatorStyle}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full border-2 border-primary',
            isRefreshing && 'animate-spin'
          )}
          style={{
            opacity: progress,
            transform: `rotate(${progress * 180}deg)`,
            borderTopColor: 'transparent',
          }}
        />
      </div>

      {/* Content */}
      <MediaLibrary siteId={siteId} {...props} />
    </div>
  );
}
```

---

## 10. Mobile Accessibility

### Focus Indicators for Touch

```css
/* In global styles - visible focus for keyboard, hidden for touch */
@media (pointer: coarse) {
  /* Touch devices - hide focus rings on tap */
  :focus:not(:focus-visible) {
    outline: none;
  }
}

/* Keyboard navigation - always show focus */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion Support

```typescript
// Hook to respect user preference
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(query.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

### Haptic Feedback

```typescript
// Utility for haptic feedback
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (!('vibrate' in navigator)) return;

  const patterns = {
    light: 10,
    medium: 25,
    heavy: 50,
  };

  navigator.vibrate(patterns[type]);
}

// Usage in interactions
function handleDelete() {
  hapticFeedback('medium');
  deleteComponent(componentId);
}
```

---

## File Structure

```
src/
├── lib/
│   └── touch.ts                    # Touch target utilities
├── styles/
│   └── safe-area.css               # Safe area CSS variables
├── hooks/
│   ├── useSwipeAction.ts           # Swipe gesture hook
│   ├── useLongPress.ts             # Long press gesture hook
│   ├── useInputFocus.ts            # Keyboard-aware focus
│   ├── useSafeArea.ts              # Safe area insets
│   ├── useOrientationLock.ts       # Screen orientation
│   ├── usePullToRefresh.ts         # Pull-to-refresh
│   ├── usePassiveEvent.ts          # Passive event listeners
│   └── usePrefersReducedMotion.ts  # Motion preference
└── components/
    └── ui/
        ├── KeyboardAwareView.tsx   # Keyboard handling wrapper
        └── BottomSheet.tsx         # Enhanced bottom sheet
```

---

## Deliverables Checklist

- [ ] Touch target audit across all interactive elements
- [ ] Minimum 44x44px touch targets verified
- [ ] Swipe-to-delete on asset items
- [ ] Long-press context menus
- [ ] Virtual keyboard scroll handling
- [ ] Input focus management
- [ ] Safe area CSS implementation
- [ ] Bottom sheet with snap points
- [ ] Mobile navigation with full-screen menu
- [ ] Passive event listeners for scroll
- [ ] Orientation change handling
- [ ] Pull-to-refresh on media library
- [ ] Haptic feedback for actions
- [ ] Reduced motion support
- [ ] Focus indicators for keyboard nav

---

## Testing Checklist

### Touch Targets
1. All buttons tappable without precision
2. Drag handles easy to grab
3. Checkboxes/radios tappable
4. Close buttons have adequate size

### Gestures
1. Swipe-to-delete works smoothly
2. Long-press shows context menu
3. Pull-to-refresh triggers reload
4. Drag and drop works on touch

### Keyboard
1. Input focus scrolls into view
2. Keyboard doesn't cover inputs
3. Done/return dismisses keyboard
4. No zoom on input focus (iOS)

### Safe Areas
1. Content visible around notch
2. Bottom elements clear home indicator
3. Landscape orientation handled
4. Status bar area respected

### Performance
1. Scrolling is smooth (60fps)
2. Animations don't jank
3. Touch response is immediate
4. Images lazy load properly

### Accessibility
1. Focus visible for keyboard nav
2. Reduced motion respected
3. Haptic feedback works
4. Voice control compatible

---

## Device Testing Matrix

| Device | iOS Version | Priority | Notes |
|--------|-------------|----------|-------|
| iPhone 14/15 Pro | iOS 17+ | High | Dynamic Island |
| iPhone 12/13 | iOS 16+ | High | Standard notch |
| iPhone SE (3rd) | iOS 16+ | Medium | No notch, smaller |
| iPad | iPadOS 17+ | Medium | Multitasking |

| Device | Android Version | Priority | Notes |
|--------|-----------------|----------|-------|
| Pixel 7/8 | Android 14+ | High | Reference Android |
| Samsung Galaxy S23 | Android 13+ | High | Popular flagship |
| Samsung Galaxy A54 | Android 13+ | Medium | Popular mid-range |

---

## Success Criteria

From user-success-scenarios.md:

- **Sarah**: Updates portfolio on iPhone between scenes - no frustration with small buttons
- **Touch confidence**: Drag handles large enough to grab reliably on first try
- **Mobile editing**: Full editing capability matches desktop, not a degraded experience
- **Performance**: No janky animations or scroll lag on 2-year-old devices
