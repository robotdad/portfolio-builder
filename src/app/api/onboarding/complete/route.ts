import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processImage } from '@/lib/image-processor';
import { saveProcessedImages } from '@/lib/storage/local';

// Valid themes for validation
const VALID_THEMES = ['modern-minimal', 'classic-elegant', 'bold-editorial'] as const;
type Theme = typeof VALID_THEMES[number];

// Constraints
const MAX_TITLE_LENGTH = 100;
const MAX_BIO_LENGTH = 500;

/**
 * Generate a URL-safe slug from text (used for category and project slugs)
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Generate a random ID for section elements
 */
const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Validated request data
 */
interface ValidatedData {
  portfolioName: string;
  theme: Theme;
  categoryName: string;
  projectTitle: string;
  portfolioTitle?: string;
  portfolioBio?: string;
  profilePhoto?: string;
  bioOnHome?: boolean;
  bioOnAbout?: boolean;
}

/**
 * Validate the onboarding request body
 */
function validateRequest(body: unknown): {
  valid: true;
  data: ValidatedData;
} | {
  valid: false;
  error: string;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const {
    portfolioName,
    theme,
    categoryName,
    projectTitle,
    portfolioTitle,
    portfolioBio,
    profilePhoto,
    bioOnHome,
    bioOnAbout,
  } = body as Record<string, unknown>;

  // Check required fields are present and non-empty strings
  if (!portfolioName || typeof portfolioName !== 'string' || !portfolioName.trim()) {
    return { valid: false, error: 'Portfolio name is required' };
  }

  if (!theme || typeof theme !== 'string' || !theme.trim()) {
    return { valid: false, error: 'Theme is required' };
  }

  if (!categoryName || typeof categoryName !== 'string' || !categoryName.trim()) {
    return { valid: false, error: 'Category name is required' };
  }

  if (!projectTitle || typeof projectTitle !== 'string' || !projectTitle.trim()) {
    return { valid: false, error: 'Project title is required' };
  }

  // Validate theme
  if (!VALID_THEMES.includes(theme.trim() as Theme)) {
    return {
      valid: false,
      error: `Theme must be one of: ${VALID_THEMES.join(', ')}`,
    };
  }

  // Validate optional portfolioTitle
  if (portfolioTitle !== undefined && portfolioTitle !== null) {
    if (typeof portfolioTitle !== 'string') {
      return { valid: false, error: 'Portfolio title must be a string' };
    }
    if (portfolioTitle.length > MAX_TITLE_LENGTH) {
      return { valid: false, error: `Portfolio title must be ${MAX_TITLE_LENGTH} characters or less` };
    }
  }

  // Validate optional portfolioBio
  if (portfolioBio !== undefined && portfolioBio !== null) {
    if (typeof portfolioBio !== 'string') {
      return { valid: false, error: 'Portfolio bio must be a string' };
    }
    if (portfolioBio.length > MAX_BIO_LENGTH) {
      return { valid: false, error: `Portfolio bio must be ${MAX_BIO_LENGTH} characters or less` };
    }
  }

  // Validate optional profilePhoto
  if (profilePhoto !== undefined && profilePhoto !== null) {
    if (typeof profilePhoto !== 'string') {
      return { valid: false, error: 'Profile photo must be a string' };
    }
    if (profilePhoto && !profilePhoto.startsWith('data:image')) {
      return { valid: false, error: 'Profile photo must be a valid base64 image data URL' };
    }
  }

  return {
    valid: true,
    data: {
      portfolioName: portfolioName.trim(),
      theme: theme.trim() as Theme,
      categoryName: categoryName.trim(),
      projectTitle: projectTitle.trim(),
      portfolioTitle: portfolioTitle ? (portfolioTitle as string).trim() : undefined,
      portfolioBio: portfolioBio ? (portfolioBio as string).trim() : undefined,
      profilePhoto: profilePhoto as string | undefined,
      bioOnHome: typeof bioOnHome === 'boolean' ? bioOnHome : undefined,
      bioOnAbout: typeof bioOnAbout === 'boolean' ? bioOnAbout : undefined,
    },
  };
}

/**
 * Parse and validate base64 image data URL
 */
function parseBase64Image(dataUrl: string): { ext: string; buffer: Buffer } | null {
  if (!dataUrl.startsWith('data:image')) {
    return null;
  }

  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  const ext = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  return { ext, buffer };
}

/**
 * POST /api/onboarding/complete
 * 
 * Atomically creates a complete portfolio with initial category and project.
 * Optionally creates an About page if bio is provided.
 * This is the "all or nothing" endpoint for the onboarding wizard.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const {
      portfolioName,
      theme,
      categoryName,
      projectTitle,
      portfolioTitle,
      portfolioBio,
      profilePhoto,
      bioOnHome,
      bioOnAbout,
    } = validation.data;

    // Generate slugs for category and project
    const categorySlug = generateSlug(categoryName);
    const projectSlug = generateSlug(projectTitle);

    // Pre-process profile photo if provided (before transaction)
    let processedPhoto: { buffer: Buffer; ext: string; processed: Awaited<ReturnType<typeof processImage>> } | null = null;
    
    if (profilePhoto) {
      const parsed = parseBase64Image(profilePhoto);
      if (parsed) {
        const processed = await processImage(parsed.buffer);
        processedPhoto = {
          buffer: parsed.buffer,
          ext: parsed.ext,
          processed,
        };
      }
    }

    // Atomic transaction: create all entities or none
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Portfolio
      const newPortfolio = await tx.portfolio.create({
        data: {
          name: portfolioName,
          title: portfolioTitle || portfolioName,
          bio: portfolioBio || '',
          draftTheme: theme,
          publishedTheme: theme,
        },
      });

      // 2. Handle profile photo asset creation (if provided)
      let profilePhotoAssetId: string | null = null;
      let profilePhotoUrl: string | null = null;

      if (processedPhoto) {
        // Create asset record with temporary URLs
        const asset = await tx.asset.create({
          data: {
            portfolioId: newPortfolio.id,
            filename: `profile-photo.${processedPhoto.ext}`,
            mimeType: `image/${processedPhoto.ext}`,
            size: processedPhoto.buffer.length,
            width: processedPhoto.processed.metadata.width,
            height: processedPhoto.processed.metadata.height,
            altText: `${portfolioName} profile photo`,
            caption: null,
            // Temporary URLs - will be updated after saving files
            url: '',
            thumbnailUrl: '',
            placeholderUrl: processedPhoto.processed.placeholder,
          },
        });

        profilePhotoAssetId = asset.id;

        // Save files to disk using asset ID
        const urls = await saveProcessedImages(asset.id, processedPhoto.processed);
        profilePhotoUrl = urls.url;

        // Update asset with actual URLs
        await tx.asset.update({
          where: { id: asset.id },
          data: {
            url: urls.url,
            thumbnailUrl: urls.thumbnailUrl,
            placeholderUrl: urls.placeholderUrl,
            srcset400: urls.srcset400,
            srcset800: urls.srcset800,
            srcset1200: urls.srcset1200,
            srcset1600: urls.srcset1600,
          },
        });

        // Update portfolio with profile photo reference using relation connect
        await tx.portfolio.update({
          where: { id: newPortfolio.id },
          data: {
            profilePhoto: { connect: { id: profilePhotoAssetId } },
          },
        });
      }

      // 3. Create Homepage (required - every portfolio needs a homepage)
      // Add profile card to homepage if bioOnHome is true
      const homepageSections = [];
      if (bioOnHome && portfolioBio && portfolioBio.trim()) {
        homepageSections.push({
          id: generateId(),
          type: 'hero',
          name: portfolioName,
          title: portfolioTitle || '',
          bio: portfolioBio,
          profileImageId: profilePhotoAssetId || null,
          profileImageUrl: profilePhotoUrl || null,
          showResumeLink: false,
          resumeUrl: '',
        });
      }

      const homepageContent = JSON.stringify({ sections: homepageSections });
      
      await tx.page.create({
        data: {
          portfolioId: newPortfolio.id,
          title: 'Home',
          slug: 'home',
          navOrder: 0,
          isHomepage: true,
          showInNav: false, // Homepage link is the logo
          draftContent: homepageContent,
          publishedContent: homepageContent, // Publish immediately so site works
        },
      });

      // 4. Create About page IF bioOnAbout is true AND bio is provided
      if (bioOnAbout && portfolioBio && portfolioBio.trim()) {
        const aboutContent = JSON.stringify({
          sections: [
            {
              id: generateId(),
              type: 'hero',
              name: portfolioName,
              title: portfolioTitle || '',
              bio: portfolioBio,
              profileImageId: profilePhotoAssetId || null,
              profileImageUrl: profilePhotoUrl || null,
              showResumeLink: false,
              resumeUrl: '',
            },
          ],
        });

        await tx.page.create({
          data: {
            portfolioId: newPortfolio.id,
            title: 'About',
            slug: 'about',
            navOrder: 1,
            isHomepage: false,
            showInNav: true,
            draftContent: aboutContent,
            publishedContent: aboutContent, // Publish immediately so it shows on live site
          },
        });
      }

      // 5. Create Category
      const newCategory = await tx.category.create({
        data: {
          portfolioId: newPortfolio.id,
          name: categoryName,
          slug: categorySlug,
          order: 0,
        },
      });

      // 6. Create Project with minimal content (published so it shows immediately)
      const projectContent = JSON.stringify({
        sections: [
          {
            id: generateId(),
            type: 'gallery',
            heading: '',
            images: [],
          },
        ],
      });

      await tx.project.create({
        data: {
          categoryId: newCategory.id,
          title: projectTitle,
          slug: projectSlug,
          order: 0,
          draftContent: projectContent,
          publishedContent: projectContent, // Publish immediately so it shows on live site
        },
      });

      return newPortfolio;
    });

    return NextResponse.json(
      {
        success: true,
        portfolio: {
          id: result.id,
          name: result.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Onboarding completion failed:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create portfolio. Please try again.' },
      { status: 500 }
    );
  }
}
