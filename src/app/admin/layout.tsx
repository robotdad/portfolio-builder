import { AdminLayout } from '@/components/admin'

/**
 * Admin Layout
 * 
 * Wraps all /admin/* routes with the AdminLayout component,
 * providing:
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
  return <AdminLayout>{children}</AdminLayout>
}
