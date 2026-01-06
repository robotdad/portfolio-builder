const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function investigateVisibility() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  
  const screenshotDir = 'ai_working/investigation';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('🔍 Investigating header visibility issues...\n');

    // Check categories page
    console.log('1. Categories Page');
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'categories-full.png'),
      fullPage: true 
    });
    
    // Check if header exists in DOM
    const header = page.locator('header.admin-page-header');
    const headerExists = await header.count();
    const headerVisible = await header.isVisible().catch(() => false);
    
    console.log(`   Header in DOM: ${headerExists} element(s)`);
    console.log(`   Header visible: ${headerVisible}`);
    
    if (headerExists > 0) {
      const boundingBox = await header.boundingBox();
      console.log(`   Bounding box:`, boundingBox);
      
      const styles = await header.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          position: computed.position,
          zIndex: computed.zIndex,
          height: computed.height,
          backgroundColor: computed.backgroundColor
        };
      });
      console.log(`   Computed styles:`, styles);
    }
    
    // Check navigation tree
    console.log('\n2. Navigation Tree');
    const navTree = page.locator('nav.navigation-tree').first();
    const navExists = await navTree.count();
    console.log(`   Nav tree in DOM: ${navExists} element(s)`);
    
    if (navExists > 0) {
      const navText = await navTree.textContent();
      console.log(`   Nav tree content: ${navText.substring(0, 200)}...`);
      
      // Check Pages section
      const pagesSection = page.locator('text="Pages"').first();
      const pagesSectionVisible = await pagesSection.isVisible().catch(() => false);
      console.log(`   Pages section visible: ${pagesSectionVisible}`);
      
      // Count page items
      const pageItems = await page.locator('.page-item, [role="listitem"]').count();
      console.log(`   Page items found: ${pageItems}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

investigateVisibility().catch(console.error);
