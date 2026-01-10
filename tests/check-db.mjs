import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const portfolio = await prisma.portfolio.findUnique({
  where: { slug: 'julian-vane' },
  select: {
    name: true,
    draftTheme: true,
    publishedTheme: true,
  }
});

console.log('\n📊 Database Values:');
console.log('  Draft Theme:     ', portfolio?.draftTheme);
console.log('  Published Theme: ', portfolio?.publishedTheme);
console.log('\n' + (portfolio?.draftTheme !== portfolio?.publishedTheme ? '⚠️  MISMATCH!' : '✅ Match'));

await prisma.$disconnect();
