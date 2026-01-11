import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: 'Portfolio Builder',
  description: 'Create your professional portfolio',
}

// Mobile viewport configuration - WCAG 2.1 AA compliant (allows user scaling)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts for themes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
