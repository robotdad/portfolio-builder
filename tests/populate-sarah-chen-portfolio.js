const { chromium } = require('playwright');

/**
 * Comprehensive portfolio population script for Sarah Chen
 * Creates categories, projects, and populates pages with realistic content
 */

const BASE_URL = 'http://localhost:3000';

// Data from persona.json
const PERSONA = {
  name: 'Sarah Chen',
  title: 'Theatre Costume Designer',
  bio: 'Theatre designer specializing in character design and fabrication, with experience in Shakespearean tragedy, high-concept sci-fi, and period restoration.'
};

const CATEGORIES = [
  {
    name: 'Shakespearean Tragedy',
    projects: [
      {
        title: 'The Obsidian Crown',
        description: "Costume design and direction for the production 'The Obsidian Crown', focusing on Dark, moody, velvet, blood red, royalty, gold embroidery."
      },
      {
        title: 'Macbeth: Blood & Fog',
        description: "Costume design and direction for the production 'Macbeth: Blood & Fog', focusing on Dark, moody, velvet, blood red, royalty, gold embroidery."
      }
    ]
  },
  {
    name: 'High Concept Sci-Fi',
    projects: [
      {
        title: 'Nebula Rising',
        description: "Costume design and direction for the production 'Nebula Rising', focusing on Holographic fabrics, structural LEDs, translucent plastic, angular silhouettes."
      },
      {
        title: 'The Chromium Protocol',
        description: "Costume design and direction for the production 'The Chromium Protocol', focusing on Holographic fabrics, structural LEDs, translucent plastic, angular silhouettes."
      }
    ]
  },
  {
    name: 'Period Restoration',
    projects: [
      {
        title: 'The Gilded Court',
        description: "Costume design and direction for the production 'The Gilded Court', focusing on Authentic 18th century silk, delicate lace, pastel floral embroidery, powdered wigs."
      },
      {
        title: 'Letter from Vienna',
        description: "Costume design and direction for the production 'Letter from Vienna', focusing on Authentic 18th century silk, delicate lace, pastel floral embroidery, powdered wigs."
      }
    ]
  }
];

async function createCategory(page, categoryName) {
  console.log(`\n📁 Creating category: ${categoryName}`);
  
  // Navigate to categories page
  await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Click "New Category" button
  await page.getByRole('button', { name: /new category/i }).first().click();
  await page.waitForTimeout(500);
  
  // Fill in category name using label
  await page.getByLabel(/category name/i).fill(categoryName);
  
  // Save category - look for Save or Create button
  const saveButton = page.getByRole('button', { name: /save|create/i }).first();
  await saveButton.click();
  
  // Wait for navigation back to categories page
  await page.waitForURL(/\/admin\/categories$/, { timeout: 10000 });
  
  // Get the category ID by finding the newly created category in the list
  await page.waitForTimeout(500);
  const categoryLink = page.locator(`a:has-text("${categoryName}")`).first();
  const href = await categoryLink.getAttribute('href');
  const categoryId = href.match(/\/categories\/(\d+)/)?.[1];
  
  console.log(`✅ Created category: ${categoryName} (ID: ${categoryId})`);
  return categoryId;
}

async function createProject(page, categoryId, projectTitle, projectDescription) {
  console.log(`  📄 Creating project: ${projectTitle}`);
  
  // Navigate to category page
  await page.goto(`${BASE_URL}/admin/categories/${categoryId}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Click "New Project" button
  await page.getByRole('button', { name: /new project/i }).first().click();
  await page.waitForTimeout(500);
  
  // Fill in project details
  await page.getByLabel(/project title|title/i).first().fill(projectTitle);
  await page.getByLabel(/description/i).first().fill(projectDescription);
  
  // Save project
  const saveButton = page.getByRole('button', { name: /save|create/i }).first();
  await saveButton.click();
  
  // Wait for navigation back to category page
  await page.waitForURL(new RegExp(`/admin/categories/${categoryId}$`), { timeout: 10000 });
  
  // Get the project ID by finding the newly created project in the list
  await page.waitForTimeout(500);
  const projectLink = page.locator(`a:has-text("${projectTitle}")`).first();
  const href = await projectLink.getAttribute('href');
  const projectId = href.match(/\/projects\/(\d+)/)?.[1];
  
  console.log(`  ✅ Created project: ${projectTitle} (ID: ${projectId})`);
  return projectId;
}

async function populateAboutPage(page) {
  console.log(`\n📝 Populating About page`);
  
  // Navigate to admin dashboard
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Find the About page link in the navigation (look for Pages section)
  const aboutLink = page.locator('a[href*="/admin/pages/"]').filter({ hasText: /about/i }).first();
  await aboutLink.click();
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  
  // Extract page ID from URL
  const url = page.url();
  const pageId = url.match(/\/pages\/(\d+)/)[1];
  console.log(`  Found About page (ID: ${pageId})`);
  
  // Add Hero section
  console.log(`  Adding Hero section...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  // Select Hero section type - look for the option in dropdown or menu
  const heroOption = page.getByText('Hero', { exact: true }).first();
  await heroOption.click();
  await page.waitForTimeout(500);
  
  // Fill Hero section fields - be specific with labels
  const nameInput = page.getByLabel(/^name$/i).or(page.getByPlaceholder(/name/i)).first();
  await nameInput.fill(PERSONA.name);
  
  const titleInput = page.getByLabel(/^title$/i).or(page.getByPlaceholder(/title/i)).first();
  await titleInput.fill(PERSONA.title);
  
  const bioInput = page.getByLabel(/bio/i).or(page.getByPlaceholder(/bio/i)).first();
  await bioInput.fill(PERSONA.bio);
  
  // Save Hero section
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added Hero section`);
  
  // Add Text section 1
  console.log(`  Adding Text section 1...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  const textOption = page.getByText('Text', { exact: true }).first();
  await textOption.click();
  await page.waitForTimeout(500);
  
  await page.getByLabel(/section title|title/i).first().fill('My Approach');
  await page.getByLabel(/content|text/i).first().fill(
    'I believe costume design is about bringing characters to life through fabric, color, and texture. Each piece tells a story, whether it\'s the dark elegance of Shakespearean tragedy, the innovative materials of sci-fi futures, or the meticulous authenticity of period restoration. My work bridges historical research with creative vision.'
  );
  
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added Text section 1`);
  
  // Add Text section 2
  console.log(`  Adding Text section 2...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  const textOption2 = page.getByText('Text', { exact: true }).first();
  await textOption2.click();
  await page.waitForTimeout(500);
  
  await page.getByLabel(/section title|title/i).first().fill('Experience');
  await page.getByLabel(/content|text/i).first().fill(
    'With over a decade of experience in theatre costume design, I\'ve worked on productions ranging from intimate black box shows to large-scale theatrical spectacles. My specializations include Shakespearean tragedy with its rich textures and historical depth, high-concept sci-fi exploring futuristic materials and silhouettes, and period restoration requiring authentic fabrication techniques.'
  );
  
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added Text section 2`);
  
  console.log(`✅ About page populated successfully`);
  return pageId;
}

async function createPortfolioPage(page) {
  console.log(`\n📄 Creating Portfolio page`);
  
  // Navigate to admin dashboard
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Click "New Page" button
  await page.getByRole('button', { name: /new page/i }).first().click();
  await page.waitForTimeout(500);
  
  // Fill in page title
  await page.getByLabel(/page title|title/i).first().fill('Portfolio');
  
  // Save page
  const saveButton = page.getByRole('button', { name: /save|create/i }).first();
  await saveButton.click();
  
  // Wait for navigation to page editor
  await page.waitForURL(/\/admin\/pages\/\d+/, { timeout: 10000 });
  
  // Extract page ID from URL
  const url = page.url();
  const pageId = url.match(/\/pages\/(\d+)/)[1];
  console.log(`  Created Portfolio page (ID: ${pageId})`);
  
  // Add Text section 1
  console.log(`  Adding introduction section...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  const textOption = page.getByText('Text', { exact: true }).first();
  await textOption.click();
  await page.waitForTimeout(500);
  
  await page.getByLabel(/section title|title/i).first().fill('Selected Works');
  await page.getByLabel(/content|text/i).first().fill(
    'This portfolio showcases a selection of my costume design work across three distinct theatrical genres. Each project represents a unique challenge in character development, fabrication, and storytelling through costume.'
  );
  
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added introduction section`);
  
  // Add Text section 2
  console.log(`  Adding process section...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  const textOption2 = page.getByText('Text', { exact: true }).first();
  await textOption2.click();
  await page.waitForTimeout(500);
  
  await page.getByLabel(/section title|title/i).first().fill('Design Process');
  await page.getByLabel(/content|text/i).first().fill(
    'Each costume begins with extensive research and character analysis. From initial sketches to fabric selection, prototype development, and final production, every step is documented and refined. The projects here demonstrate my range across historical accuracy, contemporary innovation, and theatrical transformation.'
  );
  
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added process section`);
  
  // Add Text section 3
  console.log(`  Adding collaboration section...`);
  await page.getByRole('button', { name: /add section/i }).first().click();
  await page.waitForTimeout(500);
  
  const textOption3 = page.getByText('Text', { exact: true }).first();
  await textOption3.click();
  await page.waitForTimeout(500);
  
  await page.getByLabel(/section title|title/i).first().fill('Collaboration');
  await page.getByLabel(/content|text/i).first().fill(
    'Great costume design emerges from collaboration with directors, actors, and production teams. These works represent partnerships with talented theatre professionals who trust in the transformative power of costume to enhance performance and storytelling.'
  );
  
  await page.getByRole('button', { name: /save/i }).first().click();
  await page.waitForTimeout(1000);
  console.log(`  ✅ Added collaboration section`);
  
  console.log(`✅ Portfolio page created successfully`);
  return pageId;
}

async function main() {
  console.log('🎭 Starting Sarah Chen Portfolio Population\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const summary = {
    categories: [],
    projects: [],
    pages: {
      about: null,
      portfolio: null
    }
  };
  
  try {
    // Create categories and projects
    for (const category of CATEGORIES) {
      const categoryId = await createCategory(page, category.name);
      summary.categories.push({ id: categoryId, name: category.name });
      
      for (const project of category.projects) {
        const projectId = await createProject(page, categoryId, project.title, project.description);
        summary.projects.push({
          id: projectId,
          title: project.title,
          categoryId: categoryId,
          categoryName: category.name
        });
      }
    }
    
    // Populate About page
    const aboutPageId = await populateAboutPage(page);
    summary.pages.about = aboutPageId;
    
    // Create Portfolio page
    const portfolioPageId = await createPortfolioPage(page);
    summary.pages.portfolio = portfolioPageId;
    
    // Take final screenshot
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'portfolio-populated-dashboard.png', fullPage: true });
    console.log('\n📸 Screenshot saved: portfolio-populated-dashboard.png');
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PORTFOLIO POPULATION COMPLETE\n');
    console.log('📊 Summary:');
    console.log(`   Categories created: ${summary.categories.length}`);
    console.log(`   Projects created: ${summary.projects.length}`);
    console.log(`   Pages populated: 2 (About, Portfolio)\n`);
    
    console.log('📁 Categories:');
    summary.categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
      const categoryProjects = summary.projects.filter(p => p.categoryId === cat.id);
      categoryProjects.forEach(proj => {
        console.log(`     • ${proj.title} (ID: ${proj.id})`);
      });
    });
    
    console.log('\n📄 Pages:');
    console.log(`   - About (ID: ${summary.pages.about}) - Hero + 2 text sections`);
    console.log(`   - Portfolio (ID: ${summary.pages.portfolio}) - 3 text sections`);
    
    console.log('\n🔗 Admin URLs:');
    console.log(`   Dashboard: ${BASE_URL}/admin`);
    console.log(`   Categories: ${BASE_URL}/admin/categories`);
    console.log(`   About Page: ${BASE_URL}/admin/pages/${summary.pages.about}`);
    console.log(`   Portfolio Page: ${BASE_URL}/admin/pages/${summary.pages.portfolio}`);
    
    console.log('\n' + '='.repeat(60));
    
    // Save summary to JSON
    const fs = require('fs');
    fs.writeFileSync('portfolio-population-summary.json', JSON.stringify(summary, null, 2));
    console.log('💾 Summary saved to: portfolio-population-summary.json\n');
    
  } catch (error) {
    console.error('\n❌ Error during population:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.error('📸 Error screenshot saved: error-screenshot.png');
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
