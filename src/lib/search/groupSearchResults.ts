import type { SearchResult, ProjectResult, ImageResult, PageResult, CategoryResult } from '@/types/search';

export interface EnhancedProjectResult extends ProjectResult {
  matchedImages: ImageResult[];
  allProjectImages: ImageResult[];
  matchType: 'title' | 'content' | 'metadata';
  imageMatchCount: number;
  showAllImages: boolean;
}

export interface GroupedSearchResults {
  projects: EnhancedProjectResult[];
  projectsWithoutImages: ProjectResult[];
  standaloneImages: ImageResult[];
  pages: PageResult[];
  categories: CategoryResult[];
}

/**
 * Groups flat search results into hierarchical structure:
 * - Projects with their matched images nested
 * - Projects without images (separate section)
 * - Standalone images (no project context)
 * - Pages and categories (unchanged)
 */
export function groupSearchResults(
  flatResults: SearchResult[],
  query: string
): GroupedSearchResults {
  const lowerQuery = query.toLowerCase();
  
  const projects = flatResults.filter(r => r.type === 'project') as ProjectResult[];
  const images = flatResults.filter(r => r.type === 'image') as ImageResult[];
  const pages = flatResults.filter(r => r.type === 'page') as PageResult[];
  const categories = flatResults.filter(r => r.type === 'category') as CategoryResult[];
  
  console.log('[groupSearchResults] Input:', {
    totalResults: flatResults.length,
    projects: projects.length,
    images: images.length,
    pages: pages.length,
    categories: categories.length,
  });
  
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
  
  console.log('[groupSearchResults] Image grouping:', {
    imagesByProjectKeys: Array.from(imagesByProject.keys()),
    standaloneImages: standaloneImages.length,
  });
  
  // Separate projects with images vs without
  const projectsWithImages: EnhancedProjectResult[] = [];
  const projectsWithoutImages: ProjectResult[] = [];
  
  projects.forEach(project => {
    const projectKey = `${project.categorySlug}/${project.slug}`;
    const matchedImages = imagesByProject.get(projectKey) || [];
    
    console.log('[groupSearchResults] Processing project:', {
      title: project.title,
      projectKey,
      matchedImagesCount: matchedImages.length,
    });
    
    if (matchedImages.length > 0) {
      let matchType: 'title' | 'content' | 'metadata' = 'content';
      if (project.title.toLowerCase().includes(lowerQuery)) {
        matchType = 'title';
      } else if (project.categoryName.toLowerCase().includes(lowerQuery)) {
        matchType = 'metadata';
      }
      
      const hasInheritedImages = matchedImages.some(img => img.inheritedFromProjectMatch);
      
      projectsWithImages.push({
        ...project,
        matchedImages,
        allProjectImages: matchedImages,
        matchType,
        imageMatchCount: matchedImages.length,
        showAllImages: hasInheritedImages,
      });
    } else {
      projectsWithoutImages.push(project);
    }
  });
  
  console.log('[groupSearchResults] Output:', {
    projectsWithImages: projectsWithImages.length,
    projectsWithoutImages: projectsWithoutImages.length,
    standaloneImages: standaloneImages.length,
    totalImageCount: projectsWithImages.reduce((acc, p) => acc + p.imageMatchCount, 0) + standaloneImages.length,
  });
  
  return {
    projects: projectsWithImages,
    projectsWithoutImages,
    standaloneImages,
    pages,
    categories,
  };
}
