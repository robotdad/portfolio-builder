/**
 * Mock Portfolio Data - Sarah Chen
 * 
 * Complete portfolio data for theatre costume designer persona
 * Based on: test-assets/sarah-chen-portfolio-bundle/
 */

import { Portfolio, Category, Project, Image } from './types';

// ============================================
// Categories
// ============================================

const categories: Category[] = [
  {
    id: 'cat-1',
    slug: 'theatre-productions',
    name: 'Theatre Productions',
    description: 'Classical and contemporary theatrical costume designs for stage',
    order: 1,
  },
  {
    id: 'cat-2',
    slug: 'process-sketches',
    name: 'Process & Sketches',
    description: 'Behind-the-scenes work, fittings, and design development',
    order: 2,
  },
];

// ============================================
// Projects
// ============================================

const projects: Project[] = [
  // Theatre Productions
  {
    id: 'proj-1',
    slug: 'hamlet-2024',
    title: 'Hamlet 2024',
    categoryId: 'cat-1',
    year: '2024',
    venue: 'Shakespeare Theatre',
    description: 'Elaborate Elizabethan court costumes for this production of Hamlet, featuring rich burgundy and gold brocade with period-accurate silhouettes and embellishments.',
    featuredImage: {
      id: 'img-1',
      src: '/portfolio/hamlet-court-production.jpg',
      alt: 'Elizabethan court costumes for Hamlet production',
      caption: 'Court scene costumes in rich burgundy and gold brocade',
    },
    images: [
      {
        id: 'img-1',
        src: '/portfolio/hamlet-court-production.jpg',
        alt: 'Elizabethan court costumes for Hamlet production',
        caption: 'Court scene costumes in rich burgundy and gold brocade',
      },
      {
        id: 'img-2',
        src: '/portfolio/modern-hamlet-rehearsal.jpg',
        alt: 'Contemporary Hamlet rehearsal with modern business suits',
        caption: 'Rehearsal exploring modern adaptation with period elements',
      },
    ],
    credits: [
      { role: 'Director', name: 'Michael Patterson' },
      { role: 'Set Design', name: 'Lisa Chen' },
    ],
    isFeatured: true,
    order: 1,
  },
  {
    id: 'proj-2',
    slug: 'macbeth-2023',
    title: 'Macbeth 2023',
    categoryId: 'cat-1',
    year: '2023',
    venue: 'Regional Theatre',
    description: 'Three witches in flowing dark robes with tattered edges, wild unkempt styling, creating an atmospheric supernatural presence with smoky theatrical lighting.',
    featuredImage: {
      id: 'img-3',
      src: '/portfolio/macbeth-witches-trio.jpg',
      alt: 'Three witches in dark flowing robes',
      caption: 'The three witches in atmospheric supernatural costumes',
    },
    images: [
      {
        id: 'img-3',
        src: '/portfolio/macbeth-witches-trio.jpg',
        alt: 'Three witches in dark flowing robes',
        caption: 'The three witches in atmospheric supernatural costumes',
      },
    ],
    credits: [
      { role: 'Director', name: 'Rebecca Torres' },
    ],
    isFeatured: true,
    order: 2,
  },
  {
    id: 'proj-3',
    slug: 'romeo-juliet-2024',
    title: 'Romeo & Juliet 2024',
    categoryId: 'cat-1',
    year: '2024',
    venue: 'Shakespeare Theatre',
    description: 'Stunning emerald silk ballgown with intricate gold embroidery for the Capulet ball scene, combining Renaissance elegance with theatrical drama.',
    featuredImage: {
      id: 'img-4',
      src: '/portfolio/romeo-juliet-ballgown.jpg',
      alt: 'Emerald silk ballgown with gold embroidery',
      caption: 'Juliet\'s ballgown for the Capulet ball scene',
    },
    images: [
      {
        id: 'img-4',
        src: '/portfolio/romeo-juliet-ballgown.jpg',
        alt: 'Emerald silk ballgown with gold embroidery',
        caption: 'Juliet\'s ballgown for the Capulet ball scene',
      },
    ],
    credits: [
      { role: 'Director', name: 'Antonio Rivera' },
      { role: 'Choreographer', name: 'Sarah Kim' },
    ],
    isFeatured: true,
    order: 3,
  },
  {
    id: 'proj-4',
    slug: 'king-lear-2023',
    title: 'King Lear 2023',
    categoryId: 'cat-1',
    year: '2023',
    venue: 'Classical Theatre Company',
    description: 'Weathered royal robes and crown showing wear and distress, capturing the aging king\'s descent from power in powerful theatrical moments.',
    featuredImage: {
      id: 'img-5',
      src: '/portfolio/king-lear-aging-king.jpg',
      alt: 'Weathered royal robes for King Lear',
      caption: 'King Lear\'s deteriorating royal costume',
    },
    images: [
      {
        id: 'img-5',
        src: '/portfolio/king-lear-aging-king.jpg',
        alt: 'Weathered royal robes for King Lear',
        caption: 'King Lear\'s deteriorating royal costume',
      },
    ],
    credits: [
      { role: 'Director', name: 'James McDonald' },
    ],
    isFeatured: true,
    order: 4,
  },
  {
    id: 'proj-5',
    slug: 'midsummer-2023',
    title: 'A Midsummer Night\'s Dream 2023',
    categoryId: 'cat-1',
    year: '2023',
    venue: 'Contemporary Theatre',
    description: 'Whimsical fairy costumes with gossamer wings and flowing fabrics in greens and purples, creating an enchanting magical forest atmosphere.',
    featuredImage: {
      id: 'img-6',
      src: '/portfolio/midsummer-fairy-costumes.jpg',
      alt: 'Fairy costumes with gossamer wings',
      caption: 'Fairy ensemble for enchanted forest scenes',
    },
    images: [
      {
        id: 'img-6',
        src: '/portfolio/midsummer-fairy-costumes.jpg',
        alt: 'Fairy costumes with gossamer wings',
        caption: 'Fairy ensemble for enchanted forest scenes',
      },
    ],
    credits: [
      { role: 'Director', name: 'Emily Watson' },
    ],
    isFeatured: true,
    order: 5,
  },
  {
    id: 'proj-6',
    slug: 'period-production-2024',
    title: 'Period Drama Production 2024',
    categoryId: 'cat-1',
    year: '2024',
    venue: 'Regional Playhouse',
    description: 'Dynamic dress rehearsal showcasing full period costume ensemble mid-performance on professional stage.',
    featuredImage: {
      id: 'img-7',
      src: '/portfolio/dress-rehearsal-action.jpg',
      alt: 'Actors in full period costume during dress rehearsal',
      caption: 'Full company dress rehearsal in period costumes',
    },
    images: [
      {
        id: 'img-7',
        src: '/portfolio/dress-rehearsal-action.jpg',
        alt: 'Actors in full period costume during dress rehearsal',
        caption: 'Full company dress rehearsal in period costumes',
      },
    ],
    isFeatured: false,
    order: 6,
  },

  // Process & Sketches
  {
    id: 'proj-7',
    slug: 'costume-fitting-process',
    title: 'Costume Fitting Process',
    categoryId: 'cat-2',
    year: '2024',
    description: 'Behind-the-scenes documentation of costume fitting sessions, showing the detailed work of adjusting period dress for actors.',
    featuredImage: {
      id: 'img-8',
      src: '/portfolio/costume-fitting-backstage.jpg',
      alt: 'Designer fitting elaborate period dress on actress',
      caption: 'Fitting session for period drama costume',
    },
    images: [
      {
        id: 'img-8',
        src: '/portfolio/costume-fitting-backstage.jpg',
        alt: 'Designer fitting elaborate period dress on actress',
        caption: 'Fitting session for period drama costume',
      },
    ],
    isFeatured: false,
    order: 7,
  },
  {
    id: 'proj-8',
    slug: 'fabric-selection',
    title: 'Fabric Selection & Swatches',
    categoryId: 'cat-2',
    year: '2024',
    description: 'Design process documentation showing fabric swatch selection, color palette development, and material testing for various productions.',
    featuredImage: {
      id: 'img-9',
      src: '/portfolio/fabric-selection-table.jpg',
      alt: 'Fabric swatches and color samples on design table',
      caption: 'Design table with fabric selection and color palette',
    },
    images: [
      {
        id: 'img-9',
        src: '/portfolio/fabric-selection-table.jpg',
        alt: 'Fabric swatches and color samples on design table',
        caption: 'Design table with fabric selection and color palette',
      },
      {
        id: 'img-10',
        src: '/portfolio/phone-capture-swatches.jpg',
        alt: 'Various fabric swatches spread on workshop table',
        caption: 'Workshop fabric selection process',
      },
    ],
    isFeatured: false,
    order: 8,
  },
  {
    id: 'proj-9',
    slug: 'embroidery-details',
    title: 'Embroidery & Detail Work',
    categoryId: 'cat-2',
    year: '2024',
    description: 'Close-up documentation of intricate embroidery work and hand-stitched details that bring period costumes to life.',
    featuredImage: {
      id: 'img-11',
      src: '/portfolio/embroidery-detail-phone.jpg',
      alt: 'Extreme close-up of embroidery detail on blue garment',
      caption: 'Hand-embroidered detail work in progress',
    },
    images: [
      {
        id: 'img-11',
        src: '/portfolio/embroidery-detail-phone.jpg',
        alt: 'Extreme close-up of embroidery detail on blue garment',
        caption: 'Hand-embroidered detail work in progress',
      },
    ],
    isFeatured: false,
    order: 9,
  },
  {
    id: 'proj-10',
    slug: 'costume-organization',
    title: 'Costume Department Organization',
    categoryId: 'cat-2',
    year: '2024',
    description: 'Well-organized costume department showing professional workflow with labeled period costumes and accessories.',
    featuredImage: {
      id: 'img-12',
      src: '/portfolio/costume-rack-organized.jpg',
      alt: 'Organized costume rack with period costumes',
      caption: 'Professional costume department organization',
    },
    images: [
      {
        id: 'img-12',
        src: '/portfolio/costume-rack-organized.jpg',
        alt: 'Organized costume rack with period costumes',
        caption: 'Professional costume department organization',
      },
    ],
    isFeatured: false,
    order: 10,
  },
  {
    id: 'proj-11',
    slug: 'sketch-to-costume',
    title: 'Design Development: Sketch to Costume',
    categoryId: 'cat-2',
    year: '2024',
    description: 'Documentation showing the journey from initial costume design sketch to finished costume on dress form.',
    featuredImage: {
      id: 'img-13',
      src: '/portfolio/sketch-to-costume.jpg',
      alt: 'Costume design sketch alongside finished costume',
      caption: 'Design development from sketch to realization',
    },
    images: [
      {
        id: 'img-13',
        src: '/portfolio/sketch-to-costume.jpg',
        alt: 'Costume design sketch alongside finished costume',
        caption: 'Design development from sketch to realization',
      },
    ],
    isFeatured: true,
    order: 11,
  },
];

// ============================================
// Complete Portfolio
// ============================================

const portfolio: Portfolio = {
  id: 'sarah-chen-portfolio',
  name: 'Sarah Chen',
  title: 'Theatre Costume Designer',
  tagline: 'Bringing characters to life through costume design',
  email: 'sarah@example.com',
  location: 'New York, NY',
  about: {
    enabled: false,
    image: '/portfolio/sarah-chen-headshot.jpg',
    imageAlt: 'Sarah Chen, Theatre Costume Designer',
    bio: 'I specialize in period costumes for classical theatre, bringing historical accuracy and dramatic storytelling together. Based in New York, I work with regional theaters and opera companies to create costumes that honor both authenticity and character.',
  },
  categories,
  projects,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get all projects marked as featured
 */
export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.isFeatured).sort((a, b) => a.order - b.order);
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

/**
 * Get all projects in a category
 */
export function getProjectsByCategorySlug(categorySlug: string): Project[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];
  
  return projects
    .filter(p => p.categoryId === category.id)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

/**
 * Get category for a project
 */
export function getCategoryForProject(projectId: string): Category | undefined {
  const project = projects.find(p => p.id === projectId);
  if (!project) return undefined;
  
  return categories.find(c => c.id === project.categoryId);
}

export default portfolio;
