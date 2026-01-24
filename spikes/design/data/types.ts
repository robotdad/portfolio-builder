/**
 * Data Structure Types for Portfolio Builder Prototype
 * 
 * These types define the complete structure for a portfolio with
 * support for categories, projects, and images.
 */

export interface Image {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  year?: string;
  venue?: string;
  description?: string;
  featuredImage: Image;
  images: Image[];
  credits?: Credit[];
  isFeatured: boolean;
  order: number;
}

export interface Credit {
  role: string;
  name: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  order: number;
}

export interface AboutSection {
  enabled: boolean;
  image: string;
  imageAlt: string;
  bio: string;
}

export interface Portfolio {
  id: string;
  name: string;
  title?: string;
  tagline?: string;
  email?: string;
  location?: string;
  resumePdf?: string;
  about?: AboutSection;
  categories: Category[];
  projects: Project[];
}

/**
 * Theme options for the portfolio
 */
export type Theme = 'modern' | 'classic' | 'bold';

/**
 * Template layout options
 */
export type Template = 'featured-grid' | 'clean-minimal';
