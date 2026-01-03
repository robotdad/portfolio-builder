import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Check if a portfolio exists
  let portfolio = null
  try {
    portfolio = await prisma.portfolio.findFirst()
  } catch (error) {
    // Database may not be set up yet - redirect to onboarding
    redirect('/welcome/portfolio')
  }
  
  if (!portfolio) {
    // No portfolio exists - redirect to onboarding
    redirect('/welcome/portfolio')
  }

  // Portfolio exists - redirect to the published portfolio
  redirect(`/${portfolio.slug}`)
}
