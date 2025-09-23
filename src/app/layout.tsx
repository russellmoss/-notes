import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteNav from '@/components/SiteNav'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Russell's Notes - Winery Manager",
  description: "AI-powered notes processing for winery management",
  applicationName: "Russell's Notes",
  authors: [{ name: "Russell" }],
  generator: "Next.js",
  keywords: ["winery", "notes", "management", "AI", "productivity"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-167x167.png', sizes: '167x167' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#722F37' },
    ]
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Russell's Notes",
    startupImage: [
      {
        url: '/apple-splash-2048x2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1668x2388.png',
        media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    title: "Russell's Notes",
    description: 'AI-powered winery management notes',
    url: 'https://your-domain.vercel.app',
    siteName: "Russell's Notes",
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Russell's Notes",
    description: 'AI-powered winery management notes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#722F37',
  colorScheme: 'dark light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional iOS specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-startup-image" href="/apple-splash-2048x2732.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SiteNav />
          <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
