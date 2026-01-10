/**
 * Check actual theme values in database for julian-vane portfolio
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTheme() {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug: 'julian-vane' },
      select: {
        id: true,
        name: true,
        slug: true,
        draftTheme: true,
        publishedTheme: true,
        draftTemplate: true,
        publishedTemplate: true,
      }
    })

    if (!portfolio) {
      console.log('❌ Portfolio "julian-vane" not found')
      return
    }

    console.log('\n📊 Portfolio Theme Status for:', portfolio.name)
    console.log('━'.repeat(60))
    console.log('Slug:', portfolio.slug)
    console.log('ID:', portfolio.id)
    console.log('\n🎨 THEMES:')
    console.log('  Draft Theme:     ', portfolio.draftTheme)
    console.log('  Published Theme: ', portfolio.publishedTheme)
    console.log('\n📐 TEMPLATES:')
    console.log('  Draft Template:     ', portfolio.draftTemplate)
    console.log('  Published Template: ', portfolio.publishedTemplate)
    console.log('━'.repeat(60))

    // Check if they match
    if (portfolio.draftTheme !== portfolio.publishedTheme) {
      console.log('\n⚠️  MISMATCH DETECTED!')
      console.log(`   Draft: ${portfolio.draftTheme} !== Published: ${portfolio.publishedTheme}`)
      console.log('   → Preview site will show:', portfolio.draftTheme)
      console.log('   → Published site will show:', portfolio.publishedTheme)
    } else {
      console.log('\n✅ Themes match - both sites should look the same')
    }

    console.log('\n🎨 Expected Colors:')
    const themeColors = {
      'modern-minimal': 'Cool blue-gray background (#f8f9fa), vibrant blue accent (#3b82f6)',
      'classic-elegant': 'Warm cream background (#faf9f7), soft gold accent (#d4af37)',
      'bold-editorial': 'Dark charcoal background (#1a1a1a), vibrant purple accent (#8b5cf6)'
    }
    console.log(`  ${portfolio.draftTheme}: ${themeColors[portfolio.draftTheme] || 'Unknown'}`)
    console.log(`  ${portfolio.publishedTheme}: ${themeColors[portfolio.publishedTheme] || 'Unknown'}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTheme()
