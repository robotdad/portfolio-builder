'use client'

import { Navigation, type NavPage } from './Navigation'
import { Breadcrumb } from './Breadcrumb'
import { ProjectCard } from './ProjectCard'

interface CategoryProject {
  id: string
  slug: string
  title: string
  venue: string | null
  year: string | null
  order: number
  featuredImageUrl?: string | null
  featuredImageAlt?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

interface CategoryLandingProps {
  portfolio: {
    slug: string
    name: string
    publishedTheme: string
  }
  category: Category
  projects: CategoryProject[]
  navPages: NavPage[]
  categories: Array<{ id: string; name: string; slug: string }>
}

/**
 * CategoryLanding Page Template
 * 
 * Displays all projects in a category as a responsive grid:
 * - Desktop: 3 columns
 * - Tablet: 2 columns
 * - Mobile: 1 column (2 on larger phones)
 * 
 * Features:
 * - Breadcrumb navigation (just category name on category page)
 * - Navigation with dynamic categories
 * - Project cards with hover overlay
 */
export function CategoryLanding({ 
  portfolio, 
  category, 
  projects,
  navPages,
  categories 
}: CategoryLandingProps) {
  const theme = portfolio.publishedTheme as 'modern-minimal' | 'classic-elegant' | 'bold-editorial'
  
  return (
    <div className="portfolio-page" data-theme={portfolio.publishedTheme}>
      <Navigation
        portfolioSlug={portfolio.slug}
        portfolioName={portfolio.name}
        pages={navPages}
        categories={categories}
        theme={theme}
      />
      
      <main className="portfolio-main">
        <div className="container">
          {/* Page header with breadcrumb */}
          <header className="category-header">
            <Breadcrumb 
              items={[
                { label: category.name }
              ]} 
            />
            <h1 className="category-title">{category.name}</h1>
          </header>
          
          {/* Projects grid */}
          {projects.length > 0 ? (
            <div className="category-grid">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={{
                    slug: project.slug,
                    title: project.title,
                    venue: project.venue,
                    year: project.year,
                    featuredImageUrl: project.featuredImageUrl,
                    featuredImageAlt: project.featuredImageAlt,
                  }}
                  categorySlug={category.slug}
                  portfolioSlug={portfolio.slug}
                />
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <p>No projects in this category yet.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="portfolio-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} {portfolio.name}</p>
        </div>
      </footer>
    </div>
  )
}
