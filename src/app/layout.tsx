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
        {/* Google Fonts for themes - using <link> instead of next/font because we need
            multiple font families loaded dynamically based on theme selection.
            next/font requires static imports which doesn't support runtime theme switching. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Dynamic theme fonts require <link>, not next/font */}
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
