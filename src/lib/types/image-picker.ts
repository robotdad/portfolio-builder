/**
 * Image Picker Types
 * 
 * Type definitions for the image picker component and API.
 */

/**
 * Represents an image from the site that can be selected
 */
export interface SiteImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  source: {
    pageId: string;
    pageTitle: string;
    sectionType: 'hero' | 'gallery' | 'content' | 'profile' | 'featured';
  };
  meta: {
    width: number;
    height: number;
    uploadedAt: string;
    fileSize: number;
    alt?: string;
  };
}

/**
 * Page summary for filter dropdown
 */
export interface PageSummary {
  id: string;
  title: string;
  imageCount: number;
}

/**
 * API response for GET /api/images
 */
export interface ImagesApiResponse {
  images: SiteImage[];
  totalCount: number;
  pages: PageSummary[];
}

/**
 * Query parameters for images API
 */
export interface ImagesApiParams {
  pageId?: string;
  search?: string;
  minWidth?: number;
  minHeight?: number;
}

/**
 * Props for the ImagePicker component
 */
export interface ImagePickerProps {
  /** Controls modal open/closed state */
  isOpen: boolean;
  
  /** Portfolio ID to fetch images for */
  portfolioId: string;
  
  /** Currently selected image ID (for pre-selection in single-select mode) */
  selectedId?: string;
  
  /** Called when user confirms selection (single-select mode) */
  onSelect?: (image: SiteImage) => void;
  
  /** Called when user confirms multiple selections (multi-select mode) */
  onMultiSelect?: (images: SiteImage[]) => void;
  
  /** Called when user cancels or closes */
  onCancel: () => void;
  
  /** Modal title */
  title?: string;
  
  /** Optional filters */
  filter?: {
    excludePageId?: string;
    minWidth?: number;
    minHeight?: number;
  };
  
  /** Enable multi-select mode with numbered badges */
  multiSelect?: boolean;
}

/**
 * State for the image picker
 */
export interface ImagePickerState {
  status: 'loading' | 'empty' | 'populated' | 'no-results';
  images: SiteImage[];
  filteredImages: SiteImage[];
  selectedId: string | null;
  searchQuery: string;
  pageFilter: string | null;
  pages: PageSummary[];
}

/**
 * Props for ImagePickerGrid
 */
export interface ImagePickerGridProps {
  images: SiteImage[];
  selectedId: string | null;
  focusedIndex: number;
  onSelect: (image: SiteImage) => void;
  onConfirm: (image: SiteImage) => void;
  onFocusChange: (index: number) => void;
  
  /** Multi-select mode */
  multiSelect?: boolean;
  
  /** Array of selected image IDs in order (for multi-select) */
  selectedIds?: string[];
  
  /** Called when selection changes in multi-select mode */
  onMultiSelectChange?: (imageIds: string[]) => void;
}

/**
 * Props for ImagePickerControls
 */
export interface ImagePickerControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pageFilter: string | null;
  onPageFilterChange: (pageId: string | null) => void;
  pages: PageSummary[];
  onClearFilters: () => void;
}
