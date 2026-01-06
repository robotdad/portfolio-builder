/**
 * Admin Components - Barrel exports
 * 
 * Components for the admin interface layout and navigation.
 */

// Layout components
export { AdminLayout, useAdminLayout } from './AdminLayout'
export type { AdminLayoutProps, AdminLayoutContextValue } from './AdminLayout'

// Navigation components
export { AdminSidebar } from './AdminSidebar'
export type { AdminSidebarProps } from './AdminSidebar'

export { AdminNavItem, navIcons } from './AdminNavItem'
export type { AdminNavItemProps } from './AdminNavItem'

// Header components
export { AdminHeader } from './AdminHeader'
export type { AdminHeaderProps } from './AdminHeader'

// Accessibility components
export { SkipLink } from './SkipLink'

// Dashboard components
export { DashboardStatsCard } from './DashboardStatsCard'
export type { DashboardStatsCardProps } from './DashboardStatsCard'

export { DashboardOverview } from './DashboardOverview'
export type { DashboardOverviewProps } from './DashboardOverview'
