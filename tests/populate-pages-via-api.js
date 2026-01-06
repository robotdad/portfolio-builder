/**
 * Populate About and Portfolio pages via API
 */

const BASE_URL = 'http://localhost:3000';
const PORTFOLIO_ID = 'cmk1fpkxd0000h35rw3ovomsr';
const ABOUT_PAGE_ID = 'cmk1fu1if0003h35rqx4q4pje';

// Sarah Chen persona data
const PERSONA = {
  name: 'Sarah Chen',
  title: 'Theatre Costume Designer',
  bio: 'Theatre designer specializing in character design and fabrication, with experience in Shakespearean tragedy, high-concept sci-fi, and period restoration.'
};

async function updateAboutPage() {
  console.log('\n📝 Updating About page...');
  
  // Create sections for About page
  const aboutContent = {
    sections: [
      {
        id: `section_${Date.now()}_hero`,
        type: 'hero',
        name: PERSONA.name,
        title: PERSONA.title,
        bio: PERSONA.bio,
        profileImageId: null,
        profileImageUrl: null,
        showResumeLink: false,
        resumeUrl: ''
      },
      {
        id: `section_${Date.now()}_text1`,
        type: 'text',
        title: 'My Approach',
        content: 'I believe costume design is about bringing characters to life through fabric, color, and texture. Each piece tells a story, whether it\'s the dark elegance of Shakespearean tragedy, the innovative materials of sci-fi futures, or the meticulous authenticity of period restoration. My work bridges historical research with creative vision.'
      },
      {
        id: `section_${Date.now()}_text2`,
        type: 'text',
        title: 'Experience',
        content: 'With over a decade of experience in theatre costume design, I\'ve worked on productions ranging from intimate black box shows to large-scale theatrical spectacles. My specializations include Shakespearean tragedy with its rich textures and historical depth, high-concept sci-fi exploring futuristic materials and silhouettes, and period restoration requiring authentic fabrication techniques.'
      }
    ]
  };

  const response = await fetch(`${BASE_URL}/api/pages/${ABOUT_PAGE_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draftContent: JSON.stringify(aboutContent) // draftContent must be a JSON string
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update About page: ${error.message || response.statusText}`);
  }

  const result = await response.json();
  console.log(`✅ Updated About page with ${aboutContent.sections.length} sections`);
  return result;
}

async function createPortfolioPage() {
  console.log('\n📄 Creating Portfolio page...');
  
  // Create Portfolio page
  const createResponse = await fetch(`${BASE_URL}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      portfolioId: PORTFOLIO_ID,
      title: 'Portfolio',
      slug: 'portfolio',
      showInNav: true,
      isHomepage: false
    })
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Failed to create Portfolio page: ${error.message || createResponse.statusText}`);
  }

  const page = await createResponse.json();
  console.log(`✅ Created Portfolio page (ID: ${page.id})`);

  // Add content to Portfolio page
  const portfolioContent = {
    sections: [
      {
        id: `section_${Date.now()}_text1`,
        type: 'text',
        title: 'Selected Works',
        content: 'This portfolio showcases a selection of my costume design work across three distinct theatrical genres. Each project represents a unique challenge in character development, fabrication, and storytelling through costume.'
      },
      {
        id: `section_${Date.now()}_text2`,
        type: 'text',
        title: 'Design Process',
        content: 'Each costume begins with extensive research and character analysis. From initial sketches to fabric selection, prototype development, and final production, every step is documented and refined. The projects here demonstrate my range across historical accuracy, contemporary innovation, and theatrical transformation.'
      },
      {
        id: `section_${Date.now()}_text3`,
        type: 'text',
        title: 'Collaboration',
        content: 'Great costume design emerges from collaboration with directors, actors, and production teams. These works represent partnerships with talented theatre professionals who trust in the transformative power of costume to enhance performance and storytelling.'
      }
    ]
  };

  const updateResponse = await fetch(`${BASE_URL}/api/pages/${page.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      draftContent: JSON.stringify(portfolioContent) // draftContent must be a JSON string
    })
  });

  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    throw new Error(`Failed to update Portfolio page content: ${error.message || updateResponse.statusText}`);
  }

  const updatedPage = await updateResponse.json();
  console.log(`✅ Added ${portfolioContent.sections.length} sections to Portfolio page`);
  return updatedPage;
}

async function main() {
  console.log('📄 Populating Pages via API\n');
  console.log('='.repeat(60));

  const results = {
    aboutPage: null,
    portfolioPage: null
  };

  try {
    // Update About page
    results.aboutPage = await updateAboutPage();

    // Create Portfolio page
    results.portfolioPage = await createPortfolioPage();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PAGE POPULATION COMPLETE\n');
    console.log('📊 Summary:');
    console.log(`   About page: Updated with Hero + 2 text sections`);
    console.log(`   Portfolio page: Created with 3 text sections\n`);

    console.log('🔗 Admin URLs:');
    console.log(`   About page: ${BASE_URL}/admin/pages/${results.aboutPage.id}`);
    console.log(`   Portfolio page: ${BASE_URL}/admin/pages/${results.portfolioPage.id}`);

    console.log('\n🔗 Public URLs:');
    console.log(`   About page (homepage): ${BASE_URL}/`);
    console.log(`   Portfolio page: ${BASE_URL}/${results.portfolioPage.slug}`);

    console.log('\n' + '='.repeat(60));

    // Save results
    const fs = require('fs');
    fs.writeFileSync('pages-population-summary.json', JSON.stringify(results, null, 2));
    console.log('💾 Summary saved to: pages-population-summary.json\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
