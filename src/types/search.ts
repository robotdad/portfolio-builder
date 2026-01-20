/**
 * Search result type definitions
 */

export interface ProjectResult {
  type: 'project';
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  year: string | null;
  venue: string | null;
  role: string | null;
  featuredImageUrl: string | null;
  thumbnailUrl?: string | null; // Add for consistency
  excerpt: string;
  score: number;
}

export interface ImageResult {
  type: 'image';
  id: string;
  imageUrl: string;
  url: string; // Alias for imageUrl
  thumbnailUrl?: string | null;
  caption: string;
  altText: string;
  projectTitle: string;
  projectSlug: string;
  categorySlug: string;
  categoryName?: string;
  score: number;
}

export interface PageResult {
  type: 'page';
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  lastUpdated: string;
  score: number;
}

export interface CategoryResult {
  type: 'category';
  id: string;
  name: string;
  slug: string;
  description: string;
  projectCount: number;
  featuredImageUrl: string | null;
  score: number;
}

export type SearchResult = ProjectResult | ImageResult | PageResult | CategoryResult;
