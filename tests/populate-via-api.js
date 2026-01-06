/**
 * Populate Sarah Chen's portfolio via API
 * Much faster and more reliable than Playwright UI automation
 */

const BASE_URL = 'http://localhost:3000';
const PORTFOLIO_ID = 'cmk1fpkxd0000h35rw3ovomsr';

// Data from persona.json
const CATEGORIES = [
  {
    name: 'Shakespearean Tragedy',
    description: 'Dark, moody, velvet, blood red, royalty, gold embroidery',
    projects: [
      {
        title: 'The Obsidian Crown',
        role: "Costume design and direction for the production 'The Obsidian Crown', focusing on Dark, moody, velvet, blood red, royalty, gold embroidery."
      },
      {
        title: 'Macbeth: Blood & Fog',
        role: "Costume design and direction for the production 'Macbeth: Blood & Fog', focusing on Dark, moody, velvet, blood red, royalty, gold embroidery."
      }
    ]
  },
  {
    name: 'High Concept Sci-Fi',
    description: 'Holographic fabrics, structural LEDs, translucent plastic, angular silhouettes',
    projects: [
      {
        title: 'Nebula Rising',
        role: "Costume design and direction for the production 'Nebula Rising', focusing on Holographic fabrics, structural LEDs, translucent plastic, angular silhouettes."
      },
      {
        title: 'The Chromium Protocol',
        role: "Costume design and direction for the production 'The Chromium Protocol', focusing on Holographic fabrics, structural LEDs, translucent plastic, angular silhouettes."
      }
    ]
  },
  {
    name: 'Period Restoration',
    description: 'Authentic 18th century silk, delicate lace, pastel floral embroidery, powdered wigs',
    projects: [
      {
        title: 'The Gilded Court',
        role: "Costume design and direction for the production 'The Gilded Court', focusing on Authentic 18th century silk, delicate lace, pastel floral embroidery, powdered wigs."
      },
      {
        title: 'Letter from Vienna',
        role: "Costume design and direction for the production 'Letter from Vienna', focusing on Authentic 18th century silk, delicate lace, pastel floral embroidery, powdered wigs."
      }
    ]
  }
];

async function createCategory(name, description) {
  console.log(`📁 Creating category: ${name}`);
  
  const response = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      portfolioId: PORTFOLIO_ID,
      name,
      description
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create category: ${error.error || response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Created category: ${name} (ID: ${result.data.id})`);
  return result.data;
}

async function createProject(categoryId, title, role) {
  console.log(`  📄 Creating project: ${title}`);
  
  const response = await fetch(`${BASE_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categoryId,
      title,
      role,
      isFeatured: false
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create project: ${error.error || response.statusText}`);
  }

  const result = await response.json();
  console.log(`  ✅ Created project: ${title} (ID: ${result.data.id})`);
  return result.data;
}

async function main() {
  console.log('🎭 Populating Sarah Chen Portfolio via API\n');
  console.log('='.repeat(60));
  
  const summary = {
    categories: [],
    projects: []
  };

  try {
    // Create categories and projects
    for (const categoryData of CATEGORIES) {
      const category = await createCategory(categoryData.name, categoryData.description);
      summary.categories.push({
        id: category.id,
        name: category.name,
        slug: category.slug
      });

      for (const projectData of categoryData.projects) {
        const project = await createProject(category.id, projectData.title, projectData.role);
        summary.projects.push({
          id: project.id,
          title: project.title,
          slug: project.slug,
          categoryId: category.id,
          categoryName: category.name
        });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PORTFOLIO POPULATION COMPLETE\n');
    console.log('📊 Summary:');
    console.log(`   Categories created: ${summary.categories.length}`);
    console.log(`   Projects created: ${summary.projects.length}\n`);
    
    console.log('📁 Categories:');
    summary.categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id}, slug: ${cat.slug})`);
      const categoryProjects = summary.projects.filter(p => p.categoryId === cat.id);
      categoryProjects.forEach(proj => {
        console.log(`     • ${proj.title} (ID: ${proj.id})`);
      });
    });

    console.log('\n🔗 Admin URLs:');
    console.log(`   Dashboard: ${BASE_URL}/admin`);
    console.log(`   Categories: ${BASE_URL}/admin/categories`);
    summary.categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${BASE_URL}/admin/categories/${cat.id}`);
    });

    console.log('\n🔗 Public URLs:');
    summary.categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${BASE_URL}/work/${cat.slug}`);
      const categoryProjects = summary.projects.filter(p => p.categoryId === cat.id);
      categoryProjects.forEach(proj => {
        console.log(`     • ${proj.title}: ${BASE_URL}/work/${cat.slug}/${proj.slug}`);
      });
    });

    console.log('\n' + '='.repeat(60));

    // Save summary
    const fs = require('fs');
    fs.writeFileSync('api-population-summary.json', JSON.stringify(summary, null, 2));
    console.log('💾 Summary saved to: api-population-summary.json\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
