import { AdminLayout } from '@/components/admin'
import { SessionProvider } from 'next-auth/react'

/**
 * Admin Layout
 * 
 * Wraps all /admin/* routes with the AdminLayout component,
 * providing:
 * - SessionProvider for client-side session access
 * - Sidebar navigation (desktop only)
 * - Header bar
 * - Skip link for accessibility
 * - Responsive CSS Grid layout
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  )
}
