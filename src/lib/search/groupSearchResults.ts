import type { SearchResult, ProjectResult, ImageResult, PageResult, CategoryResult } from '@/types/search';

export interface EnhancedProjectResult extends ProjectResult {
  matchedImages: ImageResult[];
  matchType: 'title' | 'content' | 'metadata';
  imageMatchCount: number;
}

export interface GroupedSearchResults {
  projects: EnhancedProjectResult[];
  standaloneImages: ImageResult[];
  pages: PageResult[];
  categories: CategoryResult[];
}

/**
 * Groups flat search results into hierarchical structure:
 * - Projects with their matched images nested
 * - Standalone images (no project context)
 * - Pages and categories (unchanged)
 */
export function groupSearchResults(
  flatResults: SearchResult[],
  query: string
): GroupedSearchResults {
  const lowerQuery = query.toLowerCase();
  
  // Separate by type
  const projects = flatResults.filter(r => r.type === 'project') as ProjectResult[];
  const images = flatResults.filter(r => r.type === 'image') as ImageResult[];
  const pages = flatResults.filter(r => r.type === 'page') as PageResult[];
  const categories = flatResults.filter(r => r.type === 'category') as CategoryResult[];
  
  // Group images by project
  const imagesByProject = new Map<string, ImageResult[]>();
  const standaloneImages: ImageResult[] = [];
  
  images.forEach(image => {
    if (image.projectSlug && image.categorySlug) {
      const projectKey = `${image.categorySlug}/${image.projectSlug}`;
      if (!imagesByProject.has(projectKey)) {
        imagesByProject.set(projectKey, []);
      }
      imagesByProject.get(projectKey)!.push(image);
    } else {
      standaloneImages.push(image);
    }
  });
  
  // Enhance projects with matched images and match type
  const enhancedProjects: EnhancedProjectResult[] = projects.map(project => {
    const projectKey = `${project.categorySlug}/${project.slug}`;
    const matchedImages = imagesByProject.get(projectKey) || [];
    
    // Determine match type for visual indicator
    let matchType: 'title' | 'content' | 'metadata' = 'content';
    if (project.title.toLowerCase().includes(lowerQuery)) {
      matchType = 'title';
    } else if (project.categoryName.toLowerCase().includes(lowerQuery)) {
      matchType = 'metadata';
    }
    
    return {
      ...project,
      matchedImages,
      matchType,
      imageMatchCount: matchedImages.length
    };
  });
  
  return {
    projects: enhancedProjects,
    standaloneImages,
    pages,
    categories
  };
}
