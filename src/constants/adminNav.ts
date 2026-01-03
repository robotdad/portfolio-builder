export type NavIconType = 'dashboard' | 'folder'

export interface NavItem {
  label: string
  href: string
  icon: NavIconType
}

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Categories', href: '/admin/categories', icon: 'folder' },
]
