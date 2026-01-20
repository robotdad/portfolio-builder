import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

// Search result types
interface ProjectResult {
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
  excerpt: string;
  score: number;
}

interface ImageResult {
  type: 'image';
  id: string;
  imageUrl: string;
  caption: string;
  altText: string;
  projectTitle: string;
  projectSlug: string;
  categorySlug: string;
  score: number;
}

interface PageResult {
  type: 'page';
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  lastUpdated: string;
  score: number;
}

interface CategoryResult {
  type: 'category';
  id: string;
  name: string;
  slug: string;
  description: string;
  projectCount: number;
  featuredImageUrl: string | null;
  score: number;
}

type SearchResult = ProjectResult | ImageResult | PageResult | CategoryResult;

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// Extract text content from section-based content
function extractTextFromSections(contentJson: string | null): string {
  if (!contentJson) return '';
  
  try {
    const content = JSON.parse(contentJson);
    if (!content.sections || !Array.isArray(content.sections)) return '';
    
    return content.sections
      .map((section: any) => {
        if (section.type === 'text' && section.content) {
          // Strip HTML tags and get plain text
          const div = DOMPurify.sanitize(section.content, { ALLOWED_TAGS: [] });
          return div;
        }
        if (section.type === 'hero' && section.bio) {
          const div = DOMPurify.sanitize(section.bio, { ALLOWED_TAGS: [] });
          return div;
        }
        if (section.type === 'gallery' && section.images) {
          return section.images
            .map((img: any) => `${img.caption || ''} ${img.altText || ''}`)
            .join(' ');
        }
        if (section.type === 'image' && (section.caption || section.altText)) {
          return `${section.caption || ''} ${section.altText || ''}`;
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  } catch (error) {
    return '';
  }
}

// Calculate search score for a text field
function calculateScore(text: string, query: string, weight: number): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match gets full weight
  if (lowerText === lowerQuery) return weight * 2;
  
  // Title/start match gets bonus
  if (lowerText.startsWith(lowerQuery)) return weight * 1.5;
  
  // Contains match gets base weight
  if (lowerText.includes(lowerQuery)) return weight;
  
  return 0;
}

// Extract excerpt with search term context
function extractExcerpt(text: string, query: string, maxLength: number = 150): string {
  if (!text) return '';
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) {
    // No match, return start of text
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }
  
  // Include context around match
  const contextBefore = 50;
  const contextAfter = maxLength - contextBefore - query.length;
  
  const start = Math.max(0, index - contextBefore);
  const end = Math.min(text.length, index + query.length + contextAfter);
  
  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  
  return excerpt;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json<SearchResponse>({
        results: [],
        total: 0,
        query: '',
      });
    }
    
    const searchQuery = query.trim();
    const results: SearchResult[] = [];
    
    // Get the first portfolio (single-user app)
    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) {
      return NextResponse.json<SearchResponse>({
        results: [],
        total: 0,
        query: searchQuery,
      });
    }
    
    // Search Projects
    const projects = await prisma.project.findMany({
      where: {
        category: {
          portfolioId: portfolio.id,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        featuredImage: {
          select: {
            url: true,
          },
        },
      },
    });
    
    for (const project of projects) {
      const contentText = extractTextFromSections(project.publishedContent);
      const description = contentText.substring(0, 300);
      
      const score =
        calculateScore(project.title, searchQuery, 10) +
        calculateScore(project.category.name, searchQuery, 8) +
        calculateScore(project.year || '', searchQuery, 6) +
        calculateScore(project.venue || '', searchQuery, 6) +
        calculateScore(project.role || '', searchQuery, 6) +
        calculateScore(contentText, searchQuery, 4);
      
      if (score > 0) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.title,
          slug: project.slug,
          categoryName: project.category.name,
          categorySlug: project.category.slug,
          description,
          year: project.year,
          venue: project.venue,
          role: project.role,
          featuredImageUrl: project.featuredImage?.url || null,
          excerpt: extractExcerpt(contentText || project.title, searchQuery),
          score,
        });
      }
    }
    
    // Search Gallery Images
    const galleryImages = await prisma.projectGalleryImage.findMany({
      where: {
        project: {
          category: {
            portfolioId: portfolio.id,
          },
        },
      },
      include: {
        asset: {
          select: {
            url: true,
          },
        },
        project: {
          select: {
            title: true,
            slug: true,
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });
    
    for (const image of galleryImages) {
      const score =
        calculateScore(image.caption || '', searchQuery, 6) +
        calculateScore(image.altText || '', searchQuery, 6);
      
      if (score > 0) {
        results.push({
          type: 'image',
          id: image.id,
          imageUrl: image.asset.url,
          caption: image.caption || '',
          altText: image.altText || '',
          projectTitle: image.project.title,
          projectSlug: image.project.slug,
          categorySlug: image.project.category.slug,
          score,
        });
      }
    }
    
    // Search Pages
    const pages = await prisma.page.findMany({
      where: {
        portfolioId: portfolio.id,
      },
    });
    
    for (const page of pages) {
      const contentText = extractTextFromSections(page.publishedContent);
      
      const score =
        calculateScore(page.title, searchQuery, 10) +
        calculateScore(contentText, searchQuery, 4);
      
      if (score > 0) {
        results.push({
          type: 'page',
          id: page.id,
          title: page.title,
          slug: page.slug,
          excerpt: extractExcerpt(contentText || page.title, searchQuery),
          lastUpdated: page.updatedAt.toISOString(),
          score,
        });
      }
    }
    
    // Search Categories
    const categories = await prisma.category.findMany({
      where: {
        portfolioId: portfolio.id,
      },
      include: {
        featuredImage: {
          select: {
            url: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
    
    for (const category of categories) {
      const score =
        calculateScore(category.name, searchQuery, 10) +
        calculateScore(category.description || '', searchQuery, 6);
      
      if (score > 0) {
        results.push({
          type: 'category',
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          projectCount: category._count.projects,
          featuredImageUrl: category.featuredImage?.url || null,
          score,
        });
      }
    }
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return NextResponse.json<SearchResponse>({
      results,
      total: results.length,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
