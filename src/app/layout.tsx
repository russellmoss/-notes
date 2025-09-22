import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteNav from '@/components/SiteNav'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Russell's Notes",
  description: "AI-powered notes processing and review system for Russell's Notes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
